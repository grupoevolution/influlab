import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';
import { getDB, mutateDB } from '@/lib/db';
import type { SiteSettings } from '@/lib/db/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const s = await getCurrentSession();
  if (!s) return { ok: false as const, status: 401 };
  if (s.role !== 'admin') return { ok: false as const, status: 403 };
  return { ok: true as const };
}

export async function GET() {
  const ac = await requireAdmin();
  if (!ac.ok) return NextResponse.json({ error: 'no auth' }, { status: ac.status });
  const db = await getDB();
  return NextResponse.json({ data: db.siteSettings ?? {} });
}

export async function PATCH(req: Request) {
  const ac = await requireAdmin();
  if (!ac.ok) return NextResponse.json({ error: 'no auth' }, { status: ac.status });

  const patch = (await req.json().catch(() => ({}))) as Partial<SiteSettings>;

  const cleaned: SiteSettings = {};
  if (patch.purchaseUrl !== undefined) cleaned.purchaseUrl = String(patch.purchaseUrl).trim();
  if (patch.purchaseLabel !== undefined) cleaned.purchaseLabel = String(patch.purchaseLabel).trim();
  if (patch.loginHelperText !== undefined) cleaned.loginHelperText = String(patch.loginHelperText).trim();
  if (patch.flowUrl !== undefined) cleaned.flowUrl = String(patch.flowUrl).trim();
  if (patch.gptAgentUrl !== undefined) cleaned.gptAgentUrl = String(patch.gptAgentUrl).trim();
  if (patch.tutorialVideoUrl !== undefined) cleaned.tutorialVideoUrl = String(patch.tutorialVideoUrl).trim();
  if (patch.upgradeTitle !== undefined) cleaned.upgradeTitle = String(patch.upgradeTitle).trim();
  if (patch.upgradeDescription !== undefined) cleaned.upgradeDescription = String(patch.upgradeDescription).trim();
  if (patch.upgradeButtonLabel !== undefined) cleaned.upgradeButtonLabel = String(patch.upgradeButtonLabel).trim();
  if (patch.upgradeUrl !== undefined) cleaned.upgradeUrl = String(patch.upgradeUrl).trim();
  if (patch.supportWhatsappUrl !== undefined) cleaned.supportWhatsappUrl = String(patch.supportWhatsappUrl).trim();
  if (patch.supportLabel !== undefined) cleaned.supportLabel = String(patch.supportLabel).trim();
  if (patch.supportDescription !== undefined) cleaned.supportDescription = String(patch.supportDescription).trim();
  if (patch.changelogContent !== undefined) cleaned.changelogContent = String(patch.changelogContent);

  const updated = await mutateDB((db) => {
    db.siteSettings = { ...(db.siteSettings ?? {}), ...cleaned };
    return db.siteSettings;
  });

  return NextResponse.json({ data: updated });
}
