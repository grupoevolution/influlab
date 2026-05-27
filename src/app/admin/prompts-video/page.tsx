'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { EntityManager, type FieldDef } from '@/components/admin/EntityManager';
import type { VideoPromptDB } from '@/lib/db/types';

const fields: FieldDef[] = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'videoUrl', label: 'Vídeo de exemplo (mp4/webm)', type: 'media-video', required: true,
    helper: 'Vídeo curto vertical que aparece em loop sem som no card.' },
  { name: 'thumb', label: 'Thumbnail fallback (opcional)', type: 'media-image' },
  { name: 'category', label: 'Categoria', type: 'text',
    helper: 'Categoria livre. Ex: UGC, Antes/Depois, Beleza...' },
  { name: 'promptFlow', label: 'Prompt para o Flow', type: 'textarea',
    helper: 'O texto exato que o aluno vai copiar e colar no Google Flow.' },
  { name: 'promptCreate', label: 'Prompt para o Create (Veo 3)', type: 'textarea',
    helper: 'Versão adaptada para o Veo 3 Create.' },
];

export default function AdminPromptsVideoPage() {
  return (
    <>
      <AdminHeader title="Prompts de vídeo" description="Banco de prompts validados (Flow + Create)." />
      <EntityManager<VideoPromptDB>
        endpoint="/api/admin/video-prompts"
        fields={fields}
        primaryField="title"
        imageField="thumb"
        secondaryFields={['category']}
        emptyState="Nenhum prompt de vídeo cadastrado."
      />
    </>
  );
}
