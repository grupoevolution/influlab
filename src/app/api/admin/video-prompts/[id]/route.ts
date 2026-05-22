import { makeDeleteHandler, makeUpdateHandler } from '@/lib/api/crud';

export const runtime = 'nodejs';

export const PATCH = makeUpdateHandler('videoPrompts');
export const DELETE = makeDeleteHandler('videoPrompts');
