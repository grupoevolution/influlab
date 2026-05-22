import { makeCreateHandler, makeListHandler } from '@/lib/api/crud';
export const runtime = 'nodejs';
export const GET = makeListHandler('virals');
export const POST = makeCreateHandler('virals', 'vv-');
