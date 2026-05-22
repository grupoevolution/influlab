import { makeCreateHandler, makeListHandler } from '@/lib/api/crud';
export const runtime = 'nodejs';
export const GET = makeListHandler('creators');
export const POST = makeCreateHandler('creators', 'c-');
