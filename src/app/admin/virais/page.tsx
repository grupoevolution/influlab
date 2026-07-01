'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { EntityManager, type FieldDef } from '@/components/admin/EntityManager';
import type { ViralVideoDB } from '@/lib/db/types';

const fields: FieldDef[] = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'videoUrl', label: 'Vídeo viral (mp4/webm)', type: 'media-video', required: true,
    helper: 'Vídeo curto vertical que roda em loop no card e no modal.' },
  { name: 'thumb', label: 'Thumbnail fallback', type: 'media-image' },
  { name: 'tiktokUrl', label: 'URL do vídeo original no TikTok', type: 'url',
    helper: 'Aparece como botão "Abrir no TikTok" pro aluno ir direto no vídeo original. Opcional.' },
  { name: 'category', label: 'Categoria', type: 'text', required: true,
    helper: 'Categoria livre. Ex: POV, Storytime, Transformação...' },
  { name: 'hook', label: 'Hook (gancho inicial)', type: 'textarea', required: true },
  { name: 'instructions', label: 'Instruções (uma por vírgula)', type: 'tags',
    helper: 'Cada item separado por vírgula vira um passo.' },
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
        secondaryFields={['category']}
      />
    </>
  );
}
