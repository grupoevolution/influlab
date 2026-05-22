'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { EntityManager, type FieldDef } from '@/components/admin/EntityManager';
import type { VideoPromptDB } from '@/lib/db/types';

const fields: FieldDef[] = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'videoUrl', label: 'URL do vídeo (mp4/webm em loop)', type: 'url', required: true,
    helper: 'Vídeo curto vertical que aparece em loop sem som.' },
  { name: 'thumb', label: 'URL thumbnail (fallback)', type: 'image' },
  { name: 'category', label: 'Categoria', type: 'select', options: [
    { value: 'UGC', label: 'UGC' }, { value: 'Antes/Depois', label: 'Antes/Depois' },
    { value: 'Cinematic', label: 'Cinematic' }, { value: 'Unboxing', label: 'Unboxing' },
    { value: 'Lifestyle', label: 'Lifestyle' }, { value: 'Tutorial', label: 'Tutorial' },
  ], required: true },
  { name: 'niche', label: 'Nicho', type: 'text' },
  { name: 'duration', label: 'Duração (ex: 0:08)', type: 'text' },
  { name: 'views', label: 'Views (número)', type: 'number' },
  { name: 'platforms', label: 'Plataformas', type: 'list', placeholder: 'flow, nano-banana' },
  { name: 'prompt', label: 'Prompt completo', type: 'textarea', required: true,
    helper: 'O texto exato que o aluno vai copiar e colar no Flow/Nano Banana.' },
];

export default function AdminPromptsVideoPage() {
  return (
    <>
      <AdminHeader title="Prompts de vídeo" description="Banco de prompts validados para gerar vídeos." />
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
