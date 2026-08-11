import { NextResponse } from 'next/server';
import { getDB, logAccess, mutateDB, newId } from '@/lib/db';
import type { Plan, WhitelistEntry } from '@/lib/db/types';

export const runtime = 'nodejs';

/**
 * Webhook Ticto.
 * Loga só quando uma AÇÃO de fato acontece (added/removed). Eventos
 * intermediários (pix gerado, boleto gerado, etc.) entram silenciosos.
 *
 * Ticto envia um campo "token" no payload pra validação (configurado no
 * painel da Ticto). Se webhookSecret estiver setado no admin/integracoes,
 * comparamos.
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

  if (!email) return NextResponse.json({ ignored: true, reason: 'no email' });

  const removeStatuses = ['refunded', 'refund', 'chargeback', 'chargedback', 'canceled', 'cancelled'];
  const approveStatuses = ['authorized', 'approved', 'paid', 'completed', 'order_authorized'];

  if (removeStatuses.includes(status)) {
    const existed = await removeEmail(email);
    await logWebhookAction('ticto', email, existed ? 'removed' : 'remove-noop', {
      status,
      productId,
      productName,
    });
    return NextResponse.json({ ok: true, action: existed ? 'removed' : 'remove-noop' });
  }

  if (approveStatuses.includes(status)) {
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

    await logWebhookAction('ticto', email, 'added', {
      plan,
      autoDefault: !mapped,
      productId,
      productName,
    });
    return NextResponse.json({
      ok: true,
      action: 'added',
      plan,
      autoDefault: !mapped,
    });
  }

  // Evento intermediário — não loga, não faz nada.
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

/** Retorna true se removeu, false se o email nem existia. */
async function removeEmail(email: string): Promise<boolean> {
  return mutateDB((db) => {
    const before = db.whitelist.length;
    db.whitelist = db.whitelist.filter((w) => w.email !== email);
    return db.whitelist.length < before;
  });
}

async function logWebhookAction(
  platform: 'kiwify' | 'ticto',
  email: string,
  action: 'added' | 'removed' | 'remove-noop',
  meta: Record<string, unknown>,
) {
  await logAccess({
    id: newId('al-'),
    type: 'webhook',
    email,
    role: 'system',
    meta: { platform, action, ...meta },
    at: new Date().toISOString(),
  });
}
