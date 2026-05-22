// Tipos persistidos no DB JSON. Quando migrarmos pra Postgres+Prisma, mesma forma.

export type AdProduct = {
  id: string;
  name: string;
  niche: string;
  image: string;
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
  period: 'today' | '7d' | '14d';
  createdAt: string;
};

export type VideoPromptDB = {
  id: string;
  title: string;
  videoUrl: string;
  thumb: string;
  prompt: string;
  category: string;
  niche: string;
  views: number;
  duration: string;
  platforms: ('flow' | 'nano-banana')[];
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
  source: 'manual' | 'webhook' | 'import';
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
  type: 'login' | 'visit' | 'blocked';
  email: string;
  role: 'admin' | 'staff' | 'student' | 'guest';
  ip?: string;
  userAgent?: string;
  at: string;
};

export type NotificationBroadcast = {
  id: string;
  title: string;
  body: string;
  url?: string;
  sentAt: string;
};

export type Schema = {
  products: AdProduct[];
  videoPrompts: VideoPromptDB[];
  imagePrompts: ImagePromptDB[];
  virals: ViralVideoDB[];
  creators: CreatorDB[];
  whitelist: WhitelistEntry[];
  announcements: AnnouncementDB[];
  accessLog: AccessLogEntry[];
  broadcasts: NotificationBroadcast[];
};

export type SchemaKey = keyof Schema;
