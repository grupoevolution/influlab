'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { EntityManager, type FieldDef } from '@/components/admin/EntityManager';
import type { ImagePromptDB } from '@/lib/db/types';

const fields: FieldDef[] = [
  { name: 'title', label: 'Título', type: 'text', required: true },
  { name: 'image', label: 'Imagem de exemplo', type: 'media-image', required: true,
    helper: 'Imagem que aparece na galeria como exemplo do resultado.' },
  { name: 'category', label: 'Categoria', type: 'text',
    helper: 'Você define livre. Ex: Hero, Flat Lay, Lifestyle...' },
  { name: 'style', label: 'Estilo', type: 'text', placeholder: 'Premium, Aesthetic...' },
  { name: 'prompt', label: 'Prompt completo (Nano Banana)', type: 'textarea', required: true },
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
        pinnable
      />
    </>
  );
}
