import {
  makeCreateHandler,
  makeListHandler,
  makePatchHandler,
  makeRemoveHandler,
} from '@/lib/api/crud';

export const runtime = 'nodejs';

export const GET = makeListHandler('virals');
export const POST = makeCreateHandler('virals', 'vv-');
export const PATCH = makePatchHandler('virals');
export const DELETE = makeRemoveHandler('virals');
