import {
  makeCreateHandler,
  makeListHandler,
  makePatchHandler,
  makeRemoveHandler,
} from '@/lib/api/crud';

export const runtime = 'nodejs';

export const GET = makeListHandler('videoPrompts');
export const POST = makeCreateHandler('videoPrompts', 'vp-');
export const PATCH = makePatchHandler('videoPrompts');
export const DELETE = makeRemoveHandler('videoPrompts');
