import { makeDeleteHandler, makeUpdateHandler } from '@/lib/api/crud';
export const runtime = 'nodejs';
export const PATCH = makeUpdateHandler('virals');
export const DELETE = makeDeleteHandler('virals');
