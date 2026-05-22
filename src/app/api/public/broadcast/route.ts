import { NextResponse } from 'next/server';
import { listAll } from '@/lib/db';
export const runtime = 'nodejs';
export async function GET() {
  const list = await listAll('broadcasts');
  return NextResponse.json({ data: list[0] ?? null });
}
