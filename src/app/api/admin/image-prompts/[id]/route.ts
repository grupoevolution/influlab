import { makeDeleteHandler, makeUpdateHandler } from '@/lib/api/crud';
export const runtime = 'nodejs';
export const PATCH = makeUpdateHandler('imagePrompts');
export const DELETE = makeDeleteHandler('imagePrompts');
