import {
  makeCreateHandler,
  makeListHandler,
  makePatchHandler,
  makeRemoveHandler,
} from '@/lib/api/crud';

export const runtime = 'nodejs';

export const GET = makeListHandler('imagePrompts');
export const POST = makeCreateHandler('imagePrompts', 'ip-');
export const PATCH = makePatchHandler('imagePrompts');
export const DELETE = makeRemoveHandler('imagePrompts');
