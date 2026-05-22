import { makeDeleteHandler, makeUpdateHandler } from '@/lib/api/crud';
export const runtime = 'nodejs';
export const PATCH = makeUpdateHandler('creators');
export const DELETE = makeDeleteHandler('creators');
