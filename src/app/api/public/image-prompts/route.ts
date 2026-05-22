import { NextResponse } from 'next/server';
import { listAll } from '@/lib/db';
export const runtime = 'nodejs';
export const revalidate = 30;
export async function GET() {
  return NextResponse.json({ data: await listAll('imagePrompts') });
}
