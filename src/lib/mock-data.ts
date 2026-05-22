// Categorias da home — áreas conceituais do app (não muda).
export type Category = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  accent: 'violet' | 'cyan' | 'pink' | 'emerald' | 'amber';
  items: number;
  href: string;
};

export const categories: Category[] = [
  {
    slug: 'produtos-campeoes',
    title: 'Produtos Campeões',
    description: 'Top produtos validados que mais vendem no TikTok Shop. Atualizado todos os dias.',
    icon: 'Crown',
    accent: 'amber',
    items: 0,
    href: '/app/produtos-campeoes',
  },
  {
    slug: 'banco-videos',
    title: 'Lab de Vídeos',
    description: 'Prompts validados para gerar vídeos no Flow. Cada prompt já foi testado.',
    icon: 'Clapperboard',
    accent: 'violet',
    items: 0,
    href: '/app/banco-videos',
  },
  {
    slug: 'banco-imagens',
    title: 'Lab de Imagens',
    description: 'Prompts para gerar imagens de produtos no Nano Banana com qualidade profissional.',
    icon: 'ImageIcon',
    accent: 'cyan',
    items: 0,
    href: '/app/banco-imagens',
  },
  {
    slug: 'virais',
    title: 'Vídeos Virais',
    description: 'Modelos virais para crescer perfil + instruções passo a passo de replicação.',
    icon: 'Flame',
    accent: 'pink',
    items: 0,
    href: '/app/virais',
  },
  {
    slug: 'criadores',
    title: 'Top Criadores',
    description: 'Os alunos que mais estão vendendo no TikTok Shop com a metodologia InfluLab.',
    icon: 'Trophy',
    accent: 'emerald',
    items: 0,
    href: '/app/criadores',
  },
];
