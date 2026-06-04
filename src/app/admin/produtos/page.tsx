'use client';

import { AdminHeader } from '@/components/admin/AdminHeader';
import { EntityManager, type FieldDef } from '@/components/admin/EntityManager';
import type { AdProduct } from '@/lib/db/types';

const fields: FieldDef[] = [
  { name: 'name', label: 'Nome do produto', type: 'text', required: true },
  { name: 'niche', label: 'Nicho', type: 'text', required: true, placeholder: 'Ex: Beleza' },
  {
    name: 'plan',
    label: 'Plano necessário',
    type: 'select',
    options: [
      { value: 'basic', label: 'Básico (todos veem)' },
      { value: 'pro', label: 'PRO (só assinantes PRO)' },
    ],
    required: true,
    helper: 'Produtos PRO ficam bloqueados pra alunos do plano Básico.',
  },
  {
    name: 'image',
    label: 'Imagem do produto',
    type: 'media-image',
    helper: 'Aparece no card da lista e no modal do produto. Quadrada ou 4:5 funciona melhor.',
  },
  {
    name: 'period',
    label: 'Período da receita',
    type: 'select',
    options: [
      { value: 'today', label: 'Hoje' },
      { value: '7d', label: '7 dias' },
      { value: '14d', label: '14 dias' },
      { value: '30d', label: '30 dias' },
    ],
    required: true,
    helper: 'O aluno vê "em X dias o produto gerou R$ Y".',
  },
  { name: 'revenueEstimate', label: 'Receita estimada no período (R$)', type: 'number', required: true,
    helper: 'Critério usado pra ordenar o ranking automaticamente.' },
  { name: 'commission', label: 'Comissão (%)', type: 'number', required: true },
  { name: 'videoExampleUrl', label: 'URL vídeo TikTok campeão', type: 'url' },
  {
    name: 'videoTranscription',
    label: 'Transcrição do vídeo campeão',
    type: 'textarea',
    helper: 'O aluno copia esse texto e cola no agente GPT pra criar a copy dele.',
  },
  { name: 'affiliateUrl', label: 'URL de afiliação', type: 'url' },
];

export default function AdminProdutosPage() {
  return (
    <>
      <AdminHeader
        title="Produtos campeões"
        description="O ranking é calculado automaticamente pela receita. As URLs do Flow e do agente GPT são globais (configure em Site & login)."
      />
      <EntityManager<AdProduct>
        endpoint="/api/admin/products"
        fields={fields}
        primaryField="name"
        imageField="image"
        secondaryFields={['niche', 'plan']}
        emptyState="Nenhum produto cadastrado. Clique em Novo para adicionar."
      />
    </>
  );
}
