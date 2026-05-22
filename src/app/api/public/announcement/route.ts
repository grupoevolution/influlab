import { NextResponse } from 'next/server';
import { getActiveAnnouncement } from '@/lib/db';
export const runtime = 'nodejs';
export const revalidate = 10;
export async function GET() {
  return NextResponse.json({ data: await getActiveAnnouncement() });
}
