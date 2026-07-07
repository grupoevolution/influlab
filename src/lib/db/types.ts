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
  pinned?: boolean;         // fixado no topo
  pinnedOrder?: number;     // ordem entre os fixados (1, 2, 3…)
};

export type ImagePromptDB = {
  id: string;
  title: string;
  image: string;
  prompt: string;
  videoPrompt?: string;     // NOVO: prompt de vídeo opcional. Se preenchido, mostra 2º botão.
  category: string;
  style: string;
  createdAt: string;
  pinned?: boolean;
  pinnedOrder?: number;
};

/**
 * Evento próximo mostrado na home do aluno em "Não perca essas datas".
 * Se nenhum evento estiver cadastrado, a seção inteira some.
 */
export type UpcomingEventDB = {
  id: string;
  dateText: string;         // texto livre: "Hoje · 20h", "Amanhã · 09h", "Sex · 18h"
  title: string;            // "Live: Faturando R$ 10k em 30 dias"
  accent: 'red' | 'amber' | 'cyan' | 'violet' | 'emerald' | 'pink'; // cor do ícone
  icon: 'radio' | 'crown' | 'megaphone' | 'calendar' | 'sparkles' | 'flame'; // ícone Lucide
  order?: number;           // posição (asc). Fallback: createdAt.
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
  /** URL do vídeo original no TikTok — abre em nova aba pelo botão do modal. */
  tiktokUrl?: string;
};

/**
 * Funcionário (staff). Cadastrado e gerenciado pelo admin via /admin/equipe.
 * O admin define email + senha — o staff acessa em /staff/login.
 * Pode upar produtos, prompts, virais, criadores e galeria, mas NÃO acessa
 * configurações de sistema (avisos, acessos, integrações, site, logs).
 */
export type StaffUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;     // scrypt$salt$hash — nunca devolvido pelo backend
  active: boolean;          // false = login bloqueado mas registro mantido
  createdAt: string;
  createdBy?: string;       // email do admin que criou
  lastLoginAt?: string;
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
  /**
   * URL do vídeo tutorial mostrado no welcome tour (1ª visita) e no card
   * "Tutorial passo a passo" da home. Aceita:
   *  - link direto de .mp4/.webm (ex: hospedado no WordPress)
   *  - YouTube (youtube.com/watch?v=... ou youtu.be/...)
   *  - Vimeo (vimeo.com/...)
   * Se vazia, o player não aparece — só o texto explicativo.
   */
  tutorialVideoUrl?: string;

  // === Página de ajuda (/app/ajuda) ===
  /** URL do WhatsApp de suporte (wa.me/55XXXXXXXXX ou https://wa.me/...) */
  supportWhatsappUrl?: string;
  /** Rótulo do card de suporte. Default: "Suporte" */
  supportLabel?: string;
  /** Descrição do card de suporte. Default: "Fale com a nossa equipe diretamente pelo WhatsApp." */
  supportDescription?: string;
  /**
   * Conteúdo do modal "O que há de novo" (changelog). Texto simples com
   * quebras de linha preservadas. Se vazio, o card fica escondido.
   */
  changelogContent?: string;

  // === Modal de upgrade PRO (quando aluno básico tenta abrir produto PRO) ===
  /** Título do modal de upgrade. Default: "Vire PRO e desbloqueie tudo". */
  upgradeTitle?: string;
  /** Texto explicativo do modal. */
  upgradeDescription?: string;
  /** Texto do botão CTA. Default: "Quero fazer upgrade". */
  upgradeButtonLabel?: string;
  /** URL pra fazer upgrade pro plano PRO (checkout). Se vazia, o botão some. */
  upgradeUrl?: string;
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
  staffs: StaffUser[];
  upcomingEvents: UpcomingEventDB[];
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
