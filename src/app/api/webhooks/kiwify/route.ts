import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getDB, logAccess, mutateDB, newId } from '@/lib/db';
import type { Plan, WhitelistEntry } from '@/lib/db/types';

export const runtime = 'nodejs';

/**
 * Webhook Kiwify.
 * Eventos relevantes:
 *  - order_approved / order.approved → adiciona email
 *  - order_refunded / refund          → remove email
 *  - chargeback                       → remove email
 *  - subscription_canceled            → remove (se for plano)
 * Os outros eventos (boleto gerado, pix gerado, lead, etc.) são ignorados
 * E NÃO ENTRAM NO LOG — só registramos quando algo de fato acontece.
 *
 * O mapeamento de productId → plano é configurado no painel /admin/integracoes.
 * Se o produto não tiver mapeamento, libera no Básico por default.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get('x-kiwify-signature') ?? req.headers.get('signature') ?? '';

  const db = await getDB();
  const cfg = db.platformConfig?.kiwify;
  if (!cfg?.enabled) {
    return NextResponse.json({ ignored: true, reason: 'kiwify disabled' });
  }

  // Validação HMAC (opcional, se configurado)
  if (cfg.webhookSecret) {
    const expected = createHmac('sha1', cfg.webhookSecret).update(raw).digest('hex');
    try {
      const a = Buffer.from(signature);
      const b = Buffer.from(expected);
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const status = String(
    payload.order_status ?? (payload as { status?: string }).status ?? '',
  ).toLowerCase();

  const eventName = String((payload as { webhook_event_type?: string }).webhook_event_type ?? '').toLowerCase();

  const email = extractEmail(payload);
  const productId = String(
    (payload as { product_id?: string }).product_id ??
      ((payload as { Product?: { product_id?: string } }).Product?.product_id) ??
      '',
  );
  const productName = String(
    ((payload as { Product?: { product_name?: string } }).Product?.product_name) ??
      (payload as { product_name?: string }).product_name ??
      '',
  );

  if (!email) return NextResponse.json({ ignored: true, reason: 'no email' });

  const removeStatuses = ['refunded', 'chargeback', 'chargedback', 'canceled', 'cancelled'];
  const approveStatuses = ['approved', 'paid', 'completed'];

  if (removeStatuses.includes(status) || eventName.includes('refund') || eventName.includes('chargeback')) {
    const existed = await removeEmail(email);
    await logWebhookAction('kiwify', email, existed ? 'removed' : 'remove-noop', {
      status,
      eventName,
      productId,
      productName,
    });
    return NextResponse.json({ ok: true, action: existed ? 'removed' : 'remove-noop' });
  }

  if (approveStatuses.includes(status) || eventName.includes('approved')) {
    const mapped = resolvePlan(db.platformMappings, 'kiwify', productId, productName);
    const plan: Plan = mapped ?? 'basic';
    await addEmail(email, plan, 'kiwify', productId || productName);
    await logWebhookAction('kiwify', email, 'added', {
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

  // Evento intermediário (pix gerado, boleto gerado, etc.) — não loga, não faz nada.
  return NextResponse.json({ ignored: true, status, eventName });
}

function extractEmail(p: Record<string, unknown>): string | null {
  const c = (p as { Customer?: { email?: string } }).Customer;
  if (c?.email) return c.email.trim().toLowerCase();
  const e = (p as { customer_email?: string; email?: string }).customer_email ?? (p as { email?: string }).email;
  return e ? e.trim().toLowerCase() : null;
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

async function addEmail(email: string, plan: Plan, platform: string, productRef: string) {
  const entry: WhitelistEntry = {
    email,
    plan,
    source: 'webhook',
    platform,
    productRef,
    addedAt: new Date().toISOString(),
  };
  await mutateDB((db) => {
    const idx = db.whitelist.findIndex((w) => w.email === email);
    if (idx >= 0) db.whitelist[idx] = { ...db.whitelist[idx], plan, source: 'webhook', platform, productRef };
    else db.whitelist.unshift(entry);
  });
}

/** Retorna true se removeu, false se o email nem existia (no-op silencioso). */
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
