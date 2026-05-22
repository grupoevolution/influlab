'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { EntityManager, type FieldDef } from '@/components/admin/EntityManager';
import type { ViralVideoDB } from '@/lib/db/types';

const fields: FieldDef[] = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'videoUrl', label: 'URL do vídeo viral', type: 'url', required: true },
  { name: 'thumb', label: 'URL thumbnail', type: 'image' },
  { name: 'views', label: 'Views (ex: "2.4M")', type: 'text' },
  { name: 'category', label: 'Categoria', type: 'select', options: [
    { value: 'POV', label: 'POV' }, { value: 'Storytime', label: 'Storytime' },
    { value: 'Transformação', label: 'Transformação' }, { value: 'Listicle', label: 'Listicle' },
  ], required: true },
  { name: 'hook', label: 'Hook (gancho inicial)', type: 'textarea', required: true,
    helper: 'A frase ou ação que prende nos primeiros segundos.' },
  { name: 'instructions', label: 'Instruções (uma por vírgula)', type: 'tags',
    placeholder: 'Grave em vertical, Use frases curtas, Mostre o produto...',
    helper: 'Cada item separado por vírgula vira um passo no app.' },
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
