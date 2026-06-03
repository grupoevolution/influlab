import { NextResponse } from 'next/server';
import { getDB, logAccess, mutateDB, newId } from '@/lib/db';
import type { Plan, WhitelistEntry } from '@/lib/db/types';

export const runtime = 'nodejs';

/**
 * Webhook Ticto.
 * Eventos relevantes:
 *  - Compra aprovada → adiciona email
 *  - Reembolso/chargeback → remove
 *
 * Ticto envia um campo "token" no payload pra validação (configurado no painel da Ticto).
 * Se webhookSecret estiver setado no admin/integracoes, comparamos.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const db = await getDB();
  const cfg = db.platformConfig?.ticto;
  if (!cfg?.enabled) {
    return NextResponse.json({ ignored: true, reason: 'ticto disabled' });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  // Validação simples por token (Ticto manda o token no próprio payload)
  if (cfg.webhookSecret) {
    const token = String((payload as { token?: string }).token ?? '');
    if (token !== cfg.webhookSecret) {
      return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    }
  }

  const status = String(
    (payload as { status?: string; order_status?: string }).status ??
      (payload as { order_status?: string }).order_status ??
      '',
  ).toLowerCase();

  const email = extractEmail(payload);
  const productId = String(
    (payload as { product_id?: string }).product_id ??
      ((payload as { item?: { product_id?: string } }).item?.product_id) ??
      ((payload as { product?: { id?: string } }).product?.id) ??
      '',
  );
  const productName = String(
    ((payload as { item?: { product_name?: string } }).item?.product_name) ??
      ((payload as { product?: { name?: string } }).product?.name) ??
      '',
  );

  await logAccess({
    id: newId('al-'),
    type: 'webhook',
    email: email ?? '—',
    role: 'system',
    meta: { platform: 'ticto', status, productId, productName },
    at: new Date().toISOString(),
  });

  if (!email) return NextResponse.json({ ignored: true, reason: 'no email' });

  const removeStatuses = ['refunded', 'refund', 'chargeback', 'chargedback', 'canceled', 'cancelled'];
  const approveStatuses = ['authorized', 'approved', 'paid', 'completed', 'order_authorized'];

  if (removeStatuses.includes(status)) {
    await mutateDB((db) => {
      db.whitelist = db.whitelist.filter((w) => w.email !== email);
    });
    return NextResponse.json({ ok: true, action: 'removed' });
  }

  if (approveStatuses.includes(status)) {
    // Mesma estratégia da Kiwify: se houver mapping usa o plano, senão libera no Básico.
    const mapped = resolvePlan(db.platformMappings, 'ticto', productId, productName);
    const plan: Plan = mapped ?? 'basic';

    const entry: WhitelistEntry = {
      email,
      plan,
      source: 'webhook',
      platform: 'ticto',
      productRef: productId || productName,
      addedAt: new Date().toISOString(),
    };
    await mutateDB((db) => {
      const idx = db.whitelist.findIndex((w) => w.email === email);
      if (idx >= 0) db.whitelist[idx] = { ...db.whitelist[idx], plan, source: 'webhook', platform: 'ticto' };
      else db.whitelist.unshift(entry);
    });
    return NextResponse.json({
      ok: true,
      action: 'added',
      plan,
      autoDefault: !mapped,
    });
  }

  return NextResponse.json({ ignored: true, status });
}

function extractEmail(p: Record<string, unknown>): string | null {
  const c =
    (p as { customer?: { email?: string } }).customer?.email ??
    (p as { buyer?: { email?: string } }).buyer?.email ??
    (p as { email?: string }).email;
  return c ? c.trim().toLowerCase() : null;
}

function resolvePlan(
  mappings: { platform: string; productId: string; productName?: string; plan: Plan }[],
  platform: string,
  productId: string,
  productName: string,
): Plan | null {
  const found = mappings.find(
    (m) =>
      m.platform === platform &&
      (m.productId === productId || (productName && m.productName === productName)),
  );
  return found?.plan ?? null;
}
