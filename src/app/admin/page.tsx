import {
  Activity,
  ArrowUpRight,
  AlertTriangle,
  Clapperboard,
  Crown,
  Eye,
  Flame,
  Image as ImageIcon,
  Plus,
  ShieldCheck,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/admin/StatCard';
import { AccessChart } from '@/components/admin/AccessChart';
import { getCurrentSession } from '@/lib/auth/session';
import { getDB, isPersistenceAvailable } from '@/lib/db';
import type { Schema } from '@/lib/db/types';

export const dynamic = 'force-dynamic';

const EMPTY: Schema = {
  products: [], videoPrompts: [], imagePrompts: [], virals: [],
  creators: [], whitelist: [], announcements: [], accessLog: [], broadcasts: [],
  platformMappings: [], platformConfig: {},
};

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();
  const isAdmin = session?.role === 'admin';

  let db: Schema = EMPTY;
  let dbError: string | null = null;
  try {
    db = await getDB();
  } catch (err) {
    dbError = (err as Error)?.message ?? 'Erro ao carregar dados.';
  }

  const todayISO = new Date().toISOString().slice(0, 10);
  const accessesToday = db.accessLog.filter((l) => l.at.startsWith(todayISO)).length;
  const loginsToday = db.accessLog.filter((l) => l.at.startsWith(todayISO) && l.type === 'login').length;
  const blockedToday = db.accessLog.filter((l) => l.at.startsWith(todayISO) && l.type === 'blocked').length;

  const stats = [
    { icon: Crown, label: 'Produtos campeões', value: db.products.length, hint: 'Ativos no app', href: '/admin/produtos', accent: 'amber' as const },
    { icon: Clapperboard, label: 'Prompts de vídeo', value: db.videoPrompts.length, hint: 'Banco completo', href: '/admin/prompts-video', accent: 'violet' as const },
    { icon: ImageIcon, label: 'Prompts de imagem', value: db.imagePrompts.length, hint: 'Disponíveis', href: '/admin/prompts-imagem', accent: 'cyan' as const },
    { icon: Flame, label: 'Vídeos virais', value: db.virals.length, hint: 'Modelos catalogados', href: '/admin/virais', accent: 'pink' as const },
    { icon: Trophy, label: 'Top criadores', value: db.creators.length, hint: 'No ranking', href: '/admin/criadores', accent: 'emerald' as const },
    ...(isAdmin
      ? [{ icon: UserCheck, label: 'Acessos liberados', value: db.whitelist.length, hint: 'Compradores ativos', href: '/admin/acessos', accent: 'cyan' as const }]
      : []),
  ];

  const quickActions = [
    { href: '/admin/produtos', label: 'Novo produto campeão', icon: Crown, accent: 'amber' },
    { href: '/admin/prompts-video', label: 'Novo prompt de vídeo', icon: Clapperboard, accent: 'violet' },
    { href: '/admin/prompts-imagem', label: 'Novo prompt de imagem', icon: ImageIcon, accent: 'cyan' },
    { href: '/admin/virais', label: 'Novo vídeo viral', icon: Flame, accent: 'pink' },
    ...(isAdmin
      ? [
          { href: '/admin/acessos', label: 'Liberar acesso (email)', icon: UserCheck, accent: 'cyan' },
          { href: '/admin/avisos', label: 'Criar aviso do dia', icon: ShieldCheck, accent: 'violet' },
        ]
      : []),
  ];

  const recentLogins = db.accessLog.slice(0, 8);
  const persistOk = isPersistenceAvailable();

  return (
    <>
      <AdminHeader
        title={
          <>
            Olá novamente, <span className="text-gradient-brand">{isAdmin ? 'admin' : 'time'}</span>
          </>
        }
        description={
          isAdmin
            ? 'Você tem controle total do sistema. Veja o resumo abaixo.'
            : 'Adicione e organize o conteúdo da plataforma.'
        }
      />

      <section className="px-4 md:px-8 py-6 max-w-7xl mx-auto space-y-6">
        {(dbError || !persistOk) && isAdmin && (
          <Card variant="glass" className="p-4 border-amber-400/40 bg-amber-500/10">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-200">Persistência em memória</p>
                <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
                  {dbError
                    ? `Houve um erro ao carregar o banco: ${dbError}`
                    : 'O volume /app/data não está montado no EasyPanel. Os dados serão perdidos a cada deploy.'}
                  <br />
                  <strong>Solução:</strong> no EasyPanel → Mounts → adicione um volume em <code className="text-brand-cyan-300">/app/data</code> e refaça o deploy.
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} delay={i * 0.05} />
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {isAdmin && (
            <Card variant="glass" className="lg:col-span-2 p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-cyan-300 mb-1 inline-flex items-center gap-1.5">
                    <Activity size={11} />
                    Acessos no app
                  </p>
                  <h3 className="font-display font-bold text-lg leading-tight">Últimos 14 dias</h3>
                </div>
                <div className="flex gap-3 text-xs">
                  <div className="text-right">
                    <p className="text-[10px] text-text-muted">Hoje</p>
                    <p className="font-display font-bold">{accessesToday}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-text-muted">Logins</p>
                    <p className="font-display font-bold text-emerald-300">{loginsToday}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-text-muted">Bloqueados</p>
                    <p className="font-display font-bold text-red-300">{blockedToday}</p>
                  </div>
                </div>
              </div>
              <AccessChart logs={db.accessLog} />
            </Card>
          )}

          <Card variant="glass" className={isAdmin ? 'p-5' : 'lg:col-span-2 p-5'}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-violet-300 mb-1">
                  Ações rápidas
                </p>
                <h3 className="font-display font-bold text-lg leading-tight">Criar algo novo</h3>
              </div>
              <Plus size={18} className="text-text-muted" />
            </div>
            <div className="space-y-2">
              {quickActions.map((a) => {
                const Icon = a.icon;
                const accentText =
                  a.accent === 'amber' ? 'text-amber-300' :
                  a.accent === 'violet' ? 'text-brand-violet-300' :
                  a.accent === 'cyan' ? 'text-brand-cyan-300' :
                  a.accent === 'pink' ? 'text-pink-300' : 'text-emerald-300';
                return (
                  <Link
                    key={a.href + a.label}
                    href={a.href}
                    className="group flex items-center gap-3 p-2.5 rounded-xl bg-bg-elevated border border-border hover:border-brand-violet-400/40 hover:bg-bg-card transition"
                  >
                    <div className="h-8 w-8 rounded-lg bg-bg flex items-center justify-center shrink-0">
                      <Icon size={14} className={accentText} />
                    </div>
                    <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary flex-1 truncate">
                      {a.label}
                    </span>
                    <ArrowUpRight size={12} className="text-text-muted shrink-0 group-hover:text-brand-cyan-300 transition" />
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>

        {isAdmin && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-subtle inline-flex items-center gap-1.5">
                  <Eye size={11} />
                  Atividade recente
                </p>
                <h3 className="font-display font-bold text-lg leading-tight">Quem entrou no app</h3>
              </div>
              <Link
                href="/admin/logs"
                className="text-xs font-semibold text-brand-cyan-300 hover:text-brand-cyan-200 inline-flex items-center gap-1"
              >
                Ver tudo
                <ArrowUpRight size={12} />
              </Link>
            </div>
            <Card variant="glass" className="divide-y divide-border-subtle overflow-hidden">
              {recentLogins.length === 0 && (
                <div className="p-8 text-center text-sm text-text-muted">
                  Ainda não há registros de acesso.
                </div>
              )}
              {recentLogins.map((l) => {
                const isLogin = l.type === 'login';
                const isBlocked = l.type === 'blocked';
                return (
                  <div key={l.id} className="flex items-center gap-3 p-3.5 hover:bg-white/[0.02] transition">
                    <div className={
                      isLogin ? 'h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0' :
                      isBlocked ? 'h-9 w-9 rounded-xl bg-red-500/15 border border-red-400/30 text-red-300 flex items-center justify-center shrink-0' :
                      'h-9 w-9 rounded-xl bg-bg-elevated border border-border text-text-muted flex items-center justify-center shrink-0'
                    }>
                      {isLogin ? <ShieldCheck size={14} /> : isBlocked ? <UserCheck size={14} /> : <Users size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{l.email}</p>
                      <p className="text-[10px] text-text-muted">
                        <span className="capitalize">{l.role}</span> · {new Date(l.at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <Badge
                      variant={isLogin ? 'success' : isBlocked ? 'live' : 'default'}
                      className="text-[10px]"
                    >
                      {isLogin ? 'Liberado' : isBlocked ? 'Bloqueado' : 'Visita'}
                    </Badge>
                  </div>
                );
              })}
            </Card>
          </div>
        )}
      </section>
    </>
  );
}
