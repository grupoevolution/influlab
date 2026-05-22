import type { Schema } from './types';

/**
 * Aplica seed inicial caso o DB esteja vazio.
 * Usa os mesmos dados que ficavam em mock-data.ts pra app rodar com conteúdo inicial.
 */
export function seedIfEmpty(db: Schema): Schema {
  const now = new Date().toISOString();
  const sampleVideo1 = 'https://cdn.coverr.co/videos/coverr-young-woman-doing-makeup-3015/1080p.mp4';
  const sampleVideo2 = 'https://cdn.coverr.co/videos/coverr-a-girl-with-pink-hair-looking-at-the-camera-2569/1080p.mp4';
  const sampleVideo3 = 'https://cdn.coverr.co/videos/coverr-perfume-bottle-on-pink-background-1572857316163/1080p.mp4';

  if (db.products.length === 0) {
    db.products = [
      {
        id: 'cp-001', name: 'Mini Projetor LED Portátil 4K', niche: 'Eletrônicos',
        image: 'https://images.unsplash.com/photo-1626387346567-68d0c1d6f8f0?w=800&q=80',
        rankingTrend: 'up', rankingPosition: 1, salesEstimate: 2840, revenueEstimate: 142000, commission: 22,
        videoExampleUrl: 'https://www.tiktok.com/@example/video/1',
        imagePromptUrl: 'https://images.unsplash.com/photo-1626387346567-68d0c1d6f8f0?w=1200&q=80',
        affiliateUrl: 'https://shop.tiktok.com/cp-001',
        gptAgentUrl: 'https://chatgpt.com/g/influlab-script',
        flowUrl: 'https://labs.google/flow',
        tags: ['high-ticket', 'demo', 'unboxing'],
        description: 'Produto explosivo de eletrônicos. Funciona muito bem com vídeos de demonstração em ambiente escuro.',
        period: 'today', createdAt: now,
      },
      {
        id: 'cp-002', name: 'Pulseira Magnética Anti-Edema', niche: 'Saúde & Bem-estar',
        image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
        rankingTrend: 'up', rankingPosition: 2, salesEstimate: 4120, revenueEstimate: 82400, commission: 35,
        videoExampleUrl: 'https://www.tiktok.com/@example/video/2',
        imagePromptUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&q=80',
        affiliateUrl: 'https://shop.tiktok.com/cp-002',
        gptAgentUrl: 'https://chatgpt.com/g/influlab-script',
        flowUrl: 'https://labs.google/flow',
        tags: ['health', 'storytelling'],
        description: 'Nicho de saúde com alta conversão. Vídeos com depoimento "antes e depois" performam muito bem.',
        period: 'today', createdAt: now,
      },
      {
        id: 'cp-003', name: 'Luminária Galáxia 360° com Bluetooth', niche: 'Decoração',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        rankingTrend: 'up', rankingPosition: 3, salesEstimate: 3680, revenueEstimate: 110400, commission: 28,
        videoExampleUrl: 'https://www.tiktok.com/@example/video/3',
        imagePromptUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
        affiliateUrl: 'https://shop.tiktok.com/cp-003',
        gptAgentUrl: 'https://chatgpt.com/g/influlab-script',
        flowUrl: 'https://labs.google/flow',
        tags: ['decor', 'ambient'],
        description: 'Vídeos noturnos mostrando o efeito 360° da projeção da galáxia funcionam extremamente bem.',
        period: 'today', createdAt: now,
      },
      {
        id: 'cp-004', name: 'Escova Alisadora Térmica 3 em 1', niche: 'Beleza',
        image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
        rankingTrend: 'stable', rankingPosition: 4, salesEstimate: 5260, revenueEstimate: 178840, commission: 30,
        videoExampleUrl: 'https://www.tiktok.com/@example/video/4',
        imagePromptUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80',
        affiliateUrl: 'https://shop.tiktok.com/cp-004',
        gptAgentUrl: 'https://chatgpt.com/g/influlab-script',
        flowUrl: 'https://labs.google/flow',
        tags: ['beauty', 'transformation'],
        description: 'Demonstração em cabelo real é o gatilho de conversão. Use antes/depois.',
        period: '7d', createdAt: now,
      },
    ];
  }

  if (db.videoPrompts.length === 0) {
    db.videoPrompts = [
      {
        id: 'vp-001', title: 'UGC Demonstração de Produto', videoUrl: sampleVideo1,
        thumb: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
        prompt: 'Vídeo UGC vertical 9:16 de uma jovem segurando o produto com luz natural, expressão genuína de surpresa, lifestyle, 4K, smartphone POV, 8 segundos.',
        category: 'UGC', niche: 'Universal', views: 12400, duration: '0:08',
        platforms: ['flow', 'nano-banana'], createdAt: now,
      },
      {
        id: 'vp-002', title: 'Antes & Depois com Reveal', videoUrl: sampleVideo2,
        thumb: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        prompt: 'Split-screen mostrando "antes" e "depois", transição com flash branco, produto aparecendo no centro, 6 segundos.',
        category: 'Antes/Depois', niche: 'Beleza', views: 28900, duration: '0:06',
        platforms: ['flow'], createdAt: now,
      },
      {
        id: 'vp-003', title: 'Cinematic Product Shot', videoUrl: sampleVideo3,
        thumb: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80',
        prompt: 'Plano cinematográfico 9:16 de produto rotacionando sobre mármore com partículas douradas, slow motion 60fps, 5 segundos.',
        category: 'Cinematic', niche: 'Premium', views: 18700, duration: '0:05',
        platforms: ['flow', 'nano-banana'], createdAt: now,
      },
    ];
  }

  if (db.imagePrompts.length === 0) {
    db.imagePrompts = [
      {
        id: 'ip-001', title: 'Produto Hero em Mármore',
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
        prompt: 'Imagem hero de produto centralizado sobre mármore branco com veios dourados, iluminação suave, hiperrealista, 4K.',
        category: 'Hero', style: 'Premium', createdAt: now,
      },
      {
        id: 'ip-002', title: 'Composição Aesthetic Skincare',
        image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80',
        prompt: 'Flat lay aesthetic de produtos de skincare sobre toalha branca rosada, vista de cima, paleta pastel.',
        category: 'Flat Lay', style: 'Aesthetic', createdAt: now,
      },
      {
        id: 'ip-003', title: 'Tech Product Glow',
        image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
        prompt: 'Produto tech sobre fundo preto profundo com luz neon ciano e roxa contornando, atmosfera futurista.',
        category: 'Tech', style: 'Futurista', createdAt: now,
      },
    ];
  }

  if (db.virals.length === 0) {
    db.virals = [
      {
        id: 'vv-001', title: 'POV: O segredo que ninguém te contou', videoUrl: sampleVideo1,
        thumb: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
        views: '2.4M', hook: 'Comece com uma frase de impacto + zoom no rosto + pausa de 1s',
        instructions: [
          'Grave em vertical 9:16 com luz natural',
          'Hook nos primeiros 1.5 segundos',
          'Use texto grande na tela',
          'Mostre o produto/resultado nos próximos 3 segundos',
          'CTA final: "comenta NOME que te mando o link"',
        ],
        prompt: 'Vídeo POV 9:16, jovem olhando pra câmera com expressão de revelação, luz natural, 8 segundos.',
        category: 'POV', createdAt: now,
      },
      {
        id: 'vv-002', title: 'Storytime: Como descobri esse produto', videoUrl: sampleVideo2,
        thumb: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        views: '1.8M', hook: 'Comece com "Não acredito que isso aconteceu..." e mostre uma reação',
        instructions: [
          'Filme caminhando enquanto fala',
          'Use frases curtas e diretas',
          'Mostre o produto no momento do plot twist',
          'Termine com cliffhanger',
        ],
        prompt: 'Vídeo handheld 9:16 estilo vlog, pessoa caminhando ao entardecer, luz quente, 12 segundos.',
        category: 'Storytime', createdAt: now,
      },
    ];
  }

  if (db.creators.length === 0) {
    db.creators = [
      { id: 'c-001', name: 'Ana Beatriz Silva', username: '@anabeatrizinflu', avatar: 'https://i.pravatar.cc/300?img=47', tiktokUrl: 'https://www.tiktok.com/@anabeatrizinflu', totalRevenue: 487200, monthRevenue: 84500, niche: 'Beleza', position: 1, videos: 142, followers: '286K', createdAt: now },
      { id: 'c-002', name: 'Lucas Mendes', username: '@lucasmendestech', avatar: 'https://i.pravatar.cc/300?img=12', tiktokUrl: 'https://www.tiktok.com/@lucasmendestech', totalRevenue: 412800, monthRevenue: 72300, niche: 'Eletrônicos', position: 2, videos: 98, followers: '198K', createdAt: now },
      { id: 'c-003', name: 'Camila Rocha', username: '@camirocha.oficial', avatar: 'https://i.pravatar.cc/300?img=45', tiktokUrl: 'https://www.tiktok.com/@camirocha', totalRevenue: 356400, monthRevenue: 68900, niche: 'Decoração', position: 3, videos: 124, followers: '142K', createdAt: now },
      { id: 'c-004', name: 'Rafael Oliveira', username: '@rafa.afiliado', avatar: 'https://i.pravatar.cc/300?img=33', tiktokUrl: 'https://www.tiktok.com/@rafa.afiliado', totalRevenue: 298700, monthRevenue: 54200, niche: 'Lifestyle', position: 4, videos: 87, followers: '124K', createdAt: now },
      { id: 'c-005', name: 'Juliana Costa', username: '@jucosta.skincare', avatar: 'https://i.pravatar.cc/300?img=49', tiktokUrl: 'https://www.tiktok.com/@jucosta.skincare', totalRevenue: 267300, monthRevenue: 49800, niche: 'Skincare', position: 5, videos: 156, followers: '102K', createdAt: now },
    ];
  }

  if (db.announcements.length === 0) {
    db.announcements = [
      {
        id: 'an-001', emoji: '🚀', title: 'Bem-vindo ao InfluLab!',
        message: 'Comece pela aba Produtos Campeões e crie seu primeiro vídeo hoje.',
        ctaLabel: 'Ver produtos', ctaHref: '/app/produtos-campeoes',
        active: true, createdAt: now,
      },
    ];
  }

  return db;
}
