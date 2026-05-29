import {
  makeCreateHandler,
  makeListHandler,
  makePatchHandler,
  makeRemoveHandler,
} from '@/lib/api/crud';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = makeListHandler('heroGallery');
export const POST = makeCreateHandler('heroGallery', 'hg-');
export const PATCH = makePatchHandler('heroGallery');
export const DELETE = makeRemoveHandler('heroGallery');
