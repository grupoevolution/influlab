'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { EntityManager, type FieldDef } from '@/components/admin/EntityManager';
import type { ImagePromptDB } from '@/lib/db/types';

const fields: FieldDef[] = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'image', label: 'URL da imagem de exemplo', type: 'image', required: true, imagePreview: true },
  { name: 'category', label: 'Categoria', type: 'select', options: [
    { value: 'Hero', label: 'Hero' }, { value: 'Flat Lay', label: 'Flat Lay' },
    { value: 'Tech', label: 'Tech' }, { value: 'Lifestyle', label: 'Lifestyle' },
    { value: 'Mockup', label: 'Mockup' }, { value: 'Pop', label: 'Pop' },
    { value: 'Macro', label: 'Macro' }, { value: 'Studio', label: 'Studio' },
  ], required: true },
  { name: 'style', label: 'Estilo', type: 'text', placeholder: 'Premium, Aesthetic...' },
  { name: 'prompt', label: 'Prompt completo', type: 'textarea', required: true },
];

export default function AdminPromptsImagemPage() {
  return (
    <>
      <AdminHeader title="Prompts de imagem" description="Banco de prompts para gerar imagens no Nano Banana." />
      <EntityManager<ImagePromptDB>
        endpoint="/api/admin/image-prompts"
        fields={fields}
        primaryField="title"
        imageField="image"
        secondaryFields={['category', 'style']}
      />
    </>
  );
}
