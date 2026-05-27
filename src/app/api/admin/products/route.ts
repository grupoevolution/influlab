import {
  makeCreateHandler,
  makeListHandler,
  makePatchHandler,
  makeRemoveHandler,
} from '@/lib/api/crud';

export const runtime = 'nodejs';

export const GET = makeListHandler('products');
export const POST = makeCreateHandler('products', 'cp-');
export const PATCH = makePatchHandler('products');
export const DELETE = makeRemoveHandler('products');
