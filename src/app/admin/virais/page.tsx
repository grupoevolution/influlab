'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { EntityManager, type FieldDef } from '@/components/admin/EntityManager';
import type { ViralVideoDB } from '@/lib/db/types';

const fields: FieldDef[] = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'videoUrl', label: 'Vídeo viral (mp4/webm)', type: 'media-video', required: true },
  { name: 'thumb', label: 'Thumbnail fallback', type: 'media-image' },
  { name: 'views', label: 'Views (ex: "2.4M")', type: 'text' },
  { name: 'category', label: 'Categoria', type: 'text', required: true,
    helper: 'Você define livre. Ex: POV, Storytime, Transformação...' },
  { name: 'hook', label: 'Hook (gancho inicial)', type: 'textarea', required: true },
  { name: 'instructions', label: 'Instruções (uma por vírgula)', type: 'tags' },
  { name: 'prompt', label: 'Prompt pra replicar', type: 'textarea', required: true },
];

export default function AdminViraisPage() {
  return (
    <>
      <AdminHeader title="Vídeos virais" description="Modelos virais com hook + instruções + prompt." />
      <EntityManager<ViralVideoDB>
        endpoint="/api/admin/virals"
        fields={fields}
        primaryField="title"
        imageField="thumb"
        secondaryFields={['category', 'views']}
      />
    </>
  );
}
