'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { EntityManager, type FieldDef } from '@/components/admin/EntityManager';
import type { CreatorDB } from '@/lib/db/types';

const fields: FieldDef[] = [
  { name: 'name', label: 'Nome', type: 'text', required: true },
  { name: 'username', label: '@username TikTok', type: 'text', required: true },
  { name: 'avatar', label: 'URL avatar', type: 'image', imagePreview: true },
  { name: 'tiktokUrl', label: 'URL perfil TikTok', type: 'url', required: true },
  { name: 'position', label: 'Posição no ranking', type: 'number', required: true },
  { name: 'niche', label: 'Nicho', type: 'text', required: true },
  { name: 'monthRevenue', label: 'Receita do mês (R$)', type: 'number' },
  { name: 'totalRevenue', label: 'Receita total (R$)', type: 'number' },
  { name: 'videos', label: 'Quantidade de vídeos', type: 'number' },
  { name: 'followers', label: 'Seguidores (ex: 286K)', type: 'text' },
];

export default function AdminCriadoresPage() {
  return (
    <>
      <AdminHeader title="Top criadores" description="Ranking de alunos faturando mais." />
      <EntityManager<CreatorDB>
        endpoint="/api/admin/creators"
        fields={fields}
        primaryField="name"
        imageField="avatar"
        secondaryFields={['niche', 'followers']}
      />
    </>
  );
}
