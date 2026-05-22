import { makeCreateHandler, makeListHandler } from '@/lib/api/crud';

export const runtime = 'nodejs';

export const GET = makeListHandler('products');
export const POST = makeCreateHandler('products', 'cp-');
