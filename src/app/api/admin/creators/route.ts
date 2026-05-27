import {
  makeCreateHandler,
  makeListHandler,
  makePatchHandler,
  makeRemoveHandler,
} from '@/lib/api/crud';

export const runtime = 'nodejs';

export const GET = makeListHandler('creators');
export const POST = makeCreateHandler('creators', 'c-');
export const PATCH = makePatchHandler('creators');
export const DELETE = makeRemoveHandler('creators');
