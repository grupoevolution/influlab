'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { EntityManager, type FieldDef } from '@/components/admin/EntityManager';
import type { AdProduct } from '@/lib/db/types';

const fields: FieldDef[] = [
  { name: 'name', label: 'Nome do produto', type: 'text', required: true },
  { name: 'niche', label: 'Nicho', type: 'text', required: true, placeholder: 'Ex: Beleza' },
  { name: 'plan', label: 'Plano necessário', type: 'select', options: [
    { value: 'basic', label: 'Básico (todos veem)' }, { value: 'pro', label: 'PRO (só assinantes PRO)' },
  ], required: true, helper: 'Produtos PRO ficam bloqueados pra alunos do plano Básico.' },
  { name: 'coverImage', label: 'Imagem de capa (card)', type: 'media-image',
    helper: 'Imagem que aparece no card da lista. Quadrada ou 4:5 funciona melhor.' },
  { name: 'image', label: 'Imagem principal (modal)', type: 'media-image',
    helper: 'Imagem maior, exibida quando aluno abre o produto.' },
  { name: 'rankingPosition', label: 'Posição no ranking', type: 'number', required: true },
  { name: 'rankingTrend', label: 'Tendência', type: 'select', options: [
    { value: 'up', label: 'Em alta' }, { value: 'stable', label: 'Estável' }, { value: 'down', label: 'Caindo' },
  ], required: true },
  { name: 'period', label: 'Período', type: 'select', options: [
    { value: 'today', label: 'Hoje' }, { value: '7d', label: '7 dias' }, { value: '14d', label: '14 dias' },
  ], required: true },
  { name: 'salesEstimate', label: 'Vendas/dia estimadas', type: 'number' },
  { name: 'revenueEstimate', label: 'Receita estimada (R$)', type: 'number' },
  { name: 'commission', label: 'Comissão (%)', type: 'number', required: true },
  { name: 'videoExampleUrl', label: 'URL vídeo TikTok campeão', type: 'url' },
  { name: 'videoTranscription', label: 'Transcrição do vídeo campeão', type: 'textarea',
    helper: 'Texto exato do que o criador fala no vídeo. O aluno vai copiar e colar no agente GPT pra criar a copy dele.' },
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
        imageField="coverImage"
        secondaryFields={['niche', 'plan']}
        emptyState="Nenhum produto cadastrado. Clique em Novo para adicionar."
      />
    </>
  );
}
