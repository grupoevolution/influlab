import { makeCreateHandler, makeListHandler } from '@/lib/api/crud';

export const runtime = 'nodejs';

export const GET = makeListHandler('videoPrompts');
export const POST = makeCreateHandler('videoPrompts', 'vp-');
