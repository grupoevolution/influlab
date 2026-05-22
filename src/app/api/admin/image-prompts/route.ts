import { makeCreateHandler, makeListHandler } from '@/lib/api/crud';

export const runtime = 'nodejs';

export const GET = makeListHandler('imagePrompts');
export const POST = makeCreateHandler('imagePrompts', 'ip-');
