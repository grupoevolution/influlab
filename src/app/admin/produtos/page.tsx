'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { EntityManager, type FieldDef } from '@/components/admin/EntityManager';
import type { AdProduct } from '@/lib/db/types';

const fields: FieldDef[] = [
  { name: 'name', label: 'Nome do produto', type: 'text', required: true },
  { name: 'niche', label: 'Nicho', type: 'text', required: true, placeholder: 'Ex: Beleza' },
  { name: 'image', label: 'URL da imagem', type: 'image', required: true, imagePreview: true },
  { name: 'rankingPosition', label: 'Posição no ranking', type: 'number', required: true },
  { name: 'rankingTrend', label: 'Tendência', type: 'select', options: [
    { value: 'up', label: 'Em alta' }, { value: 'stable', label: 'Estável' }, { value: 'down', label: 'Caindo' },
  ], required: true },
  { name: 'period', label: 'Período', type: 'select', options: [
    { value: 'today', label: 'Hoje' }, { value: '7d', label: '7 dias' }, { value: '14d', label: '14 dias' },
  ], required: true },
  { name: 'salesEstimate', label: 'Vendas/dia estimadas', type: 'number', required: true },
  { name: 'revenueEstimate', label: 'Receita estimada (R$)', type: 'number', required: true },
  { name: 'commission', label: 'Comissão (%)', type: 'number', required: true },
  { name: 'videoExampleUrl', label: 'URL vídeo TikTok exemplo', type: 'url' },
  { name: 'imagePromptUrl', label: 'URL imagem para download', type: 'url' },
  { name: 'affiliateUrl', label: 'URL afiliação', type: 'url' },
  { name: 'gptAgentUrl', label: 'URL agente GPT', type: 'url' },
  { name: 'flowUrl', label: 'URL Flow', type: 'url' },
  { name: 'tags', label: 'Tags', type: 'tags', placeholder: 'demo, unboxing, beauty' },
  { name: 'description', label: 'Descrição', type: 'textarea' },
];

export default function AdminProdutosPage() {
  return (
    <>
      <AdminHeader
        title="Produtos campeões"
        description="Gerencie os produtos exibidos para os alunos."
      />
      <EntityManager<AdProduct>
        endpoint="/api/admin/products"
        fields={fields}
        primaryField="name"
        imageField="image"
        secondaryFields={['niche', 'period']}
        emptyState="Nenhum produto cadastrado. Clique em Novo para adicionar."
      />
    </>
  );
}
