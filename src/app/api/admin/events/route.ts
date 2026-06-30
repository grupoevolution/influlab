import {
  makeCreateHandler,
  makeListHandler,
  makePatchHandler,
  makeRemoveHandler,
} from '@/lib/api/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = makeListHandler('upcomingEvents');
export const POST = makeCreateHandler('upcomingEvents', 'ev-');
export const PATCH = makePatchHandler('upcomingEvents');
export const DELETE = makeRemoveHandler('upcomingEvents');
