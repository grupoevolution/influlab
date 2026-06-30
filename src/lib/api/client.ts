'use client';

import { useEffect, useState } from 'react';
import type {
  AdProduct,
  AnnouncementDB,
  CreatorDB,
  HeroGalleryItem,
  ImagePromptDB,
  NotificationBroadcast,
  UpcomingEventDB,
  ViralVideoDB,
  VideoPromptDB,
} from '@/lib/db/types';

async function fetchJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  return j.data as T;
}

function useResource<T>(url: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchJSON<T>(url)
      .then((d) => {
        if (!cancelled) setData(d ?? fallback);
      })
      .catch(() => {
        if (!cancelled) setData(fallback);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { data, loading };
}

export const useProducts = () => useResource<AdProduct[]>('/api/public/products', []);
export const useVideoPrompts = () => useResource<VideoPromptDB[]>('/api/public/video-prompts', []);
export const useImagePrompts = () => useResource<ImagePromptDB[]>('/api/public/image-prompts', []);
export const useVirals = () => useResource<ViralVideoDB[]>('/api/public/virals', []);
export const useCreators = () => useResource<CreatorDB[]>('/api/public/creators', []);
export const useHeroGallery = () => useResource<HeroGalleryItem[]>('/api/public/hero-gallery', []);
export const useUpcomingEvents = () => useResource<UpcomingEventDB[]>('/api/public/events', []);
export const useAnnouncement = () => useResource<AnnouncementDB | null>('/api/public/announcement', null);
export const useLatestBroadcast = () => useResource<NotificationBroadcast | null>('/api/public/broadcast', null);
