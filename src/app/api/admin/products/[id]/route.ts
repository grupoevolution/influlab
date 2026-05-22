import { makeDeleteHandler, makeUpdateHandler } from '@/lib/api/crud';

export const runtime = 'nodejs';

export const PATCH = makeUpdateHandler('products');
export const DELETE = makeDeleteHandler('products');
