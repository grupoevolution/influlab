// Tipos persistidos no DB JSON.

export type Plan = 'basic' | 'pro';

export type AdProduct = {
  id: string;
  name: string;
  niche: string;
  plan: Plan;                 // NOVO: básico ou pro
  image: string;              // imagem principal do produto (modal)
  coverImage?: string;        // NOVO: imagem de capa (card)
  rankingTrend: 'up' | 'down' | 'stable';
  rankingPosition: number;
  salesEstimate: number;
  revenueEstimate: number;
  commission: number;
  videoExampleUrl: string;
  imagePromptUrl: string;
  affiliateUrl: string;
  gptAgentUrl: string;
  flowUrl: string;
  tags: string[];
  description: string;
  videoTranscription?: string; // NOVO: transcrição do vídeo campeão
  period: 'today' | '7d' | '14d' | '30d';
  createdAt: string;
};

export type VideoPromptDB = {
  id: string;
  title: string;
  videoUrl: string;
  thumb: string;
  prompt?: string;          // legado / fallback
  promptFlow?: string;      // NOVO: prompt pro Google Flow
  promptCreate?: string;    // NOVO: prompt pro Veo 3 Create
  category: string;
  niche: string;
  views: number;
  duration: string;
  createdAt: string;
};

export type ImagePromptDB = {
  id: string;
  title: string;
  image: string;
  prompt: string;
  category: string;
  style: string;
  createdAt: string;
};

export type ViralVideoDB = {
  id: string;
  title: string;
  videoUrl: string;
  thumb: string;
  views: string;
  hook: string;
  instructions: string[];
  prompt: string;
  category: string;
  createdAt: string;
};

/**
 * Item da galeria do hero (carrossel de vídeos atrás do "Olá, criador").
 * Limite recomendado: 6-10 itens, vídeos curtos de 2-3s em 9:16.
 */
export type HeroGalleryItem = {
  id: string;
  videoUrl: string;
  order: number;       // posição no carrossel (1, 2, 3...)
  title?: string;      // opcional, só pra o admin se organizar
  createdAt: string;
};

export type CreatorDB = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  tiktokUrl: string;
  totalRevenue: number;
  monthRevenue: number;
  niche: string;
  position: number;
  videos: number;
  followers: string;
  createdAt: string;
};

export type WhitelistEntry = {
  email: string;
  plan: Plan;                 // NOVO: plano do comprador
  source: 'manual' | 'webhook' | 'import' | 'env';
  platform?: 'kiwify' | 'ticto' | string;
  productRef?: string;        // id ou nome do produto na plataforma
  note?: string;
  addedAt: string;
};

export type AnnouncementDB = {
  id: string;
  emoji: string;
  title: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
  active: boolean;
  createdAt: string;
};

export type AccessLogEntry = {
  id: string;
  type: 'login' | 'visit' | 'blocked' | 'webhook' | 'import' | 'upload';
  email: string;
  role: 'admin' | 'staff' | 'student' | 'guest' | 'system';
  ip?: string;
  userAgent?: string;
  meta?: Record<string, unknown>;
  at: string;
};

export type NotificationBroadcast = {
  id: string;
  title: string;
  body: string;
  url?: string;
  sentAt: string;
};

/** Mapeamento de produto da plataforma de pagamento -> plano interno */
export type PlatformProductMapping = {
  id: string;
  platform: 'kiwify' | 'ticto';
  productId: string;          // ID do produto OU nome (configurável)
  productName?: string;
  plan: Plan;
  createdAt: string;
};

/**
 * Configurações globais do site (links, textos editáveis pelo admin).
 * Tudo opcional — front sempre usa fallback se faltar.
 */
export type SiteSettings = {
  /** URL pra onde o link "Conheça o InfluLab" da tela de login leva (página de venda). */
  purchaseUrl?: string;
  /** Texto do botão/link (default: "Conheça o InfluLab"). */
  purchaseLabel?: string;
  /** Texto explicativo abaixo do form de login. */
  loginHelperText?: string;
  /** URL global do Google Flow — usada por TODOS os produtos. Se vazia, o botão some. */
  flowUrl?: string;
  /** URL global do agente GPT — usada por TODOS os produtos. Se vazia, o botão some. */
  gptAgentUrl?: string;
};

/** Configuração das integrações com plataformas */
export type PlatformConfig = {
  kiwify?: {
    webhookSecret?: string;   // assinatura HMAC pra validar (opcional)
    enabled: boolean;
  };
  ticto?: {
    webhookSecret?: string;
    enabled: boolean;
  };
};

export type Schema = {
  products: AdProduct[];
  videoPrompts: VideoPromptDB[];
  imagePrompts: ImagePromptDB[];
  virals: ViralVideoDB[];
  creators: CreatorDB[];
  heroGallery: HeroGalleryItem[];
  whitelist: WhitelistEntry[];
  announcements: AnnouncementDB[];
  accessLog: AccessLogEntry[];
  broadcasts: NotificationBroadcast[];
  platformMappings: PlatformProductMapping[];
  platformConfig: PlatformConfig;
  siteSettings?: SiteSettings;
};

export type SchemaKey = keyof Schema;

/** Chaves do schema cujo valor é Array — usadas pelos CRUDs genéricos. */
export type SchemaArrayKey = {
  [K in SchemaKey]: Schema[K] extends ReadonlyArray<unknown> ? K : never;
}[SchemaKey];
