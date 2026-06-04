import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Configurações públicas do site (link de compra, etc).
 * Sem auth — usado pela tela de login antes do usuário ter cookie.
 */
export async function GET() {
  const db = await getDB();
  return NextResponse.json({ data: db.siteSettings ?? {} });
}
