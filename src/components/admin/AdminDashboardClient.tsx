'use client';

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Clapperboard,
  Crown,
  Eye,
  Flame,
  Image as ImageIcon,
  Loader2,
  Plus,
  ShieldCheck,
  Trophy,
  UserCheck,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/admin/StatCard';
import { AccessChart } from '@/components/admin/AccessChart';
import type { AccessLogEntry } from '@/lib/db/types';

type DiagResponse = {
  session?: { email: string; role: 'admin' | 'staff' };
  db?: {
    persistenceAvailable: boolean;
    dataDir: string;
    lastError: string | null;
    counts: Record<string, number> | null;
  };
};

export function AdminDashboardClient({ role, email }: { role: 'admin' | 'staff'; email: string }) {
  const isAdmin = role === 'admin';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diag, setDiag] = useState<DiagResponse['db'] | null>(null);
  const [counts, setCounts] = useState({
    products: 0,
    videoPrompts: 0,
    imagePrompts: 0,
    virals: 0,
    creators: 0,
    whitelist: 0,
  });
  const [accessLog, setAccessLog] = useState<AccessLogEntry[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [diagRes, productsRes, videosRes, imagesRes, viraisRes, creatorsRes] =
          await Promise.all([
            fetch('/api/admin/diag', { cache: 'no-store' }),
            fetch('/api/admin/products', { cache: 'no-store' }),
            fetch('/api/admin/video-prompts', { cache: 'no-store' }),
            fetch('/api/admin/image-prompts', { cache: 'no-store' }),
            fetch('/api/admin/virals', { cache: 'no-store' }),
            fetch('/api/admin/creators', { cache: 'no-store' }),
          ]);

        if (cancelled) return;

        const diagJson = await diagRes.json();
        setDiag(diagJson.db ?? null);

        const products = (await productsRes.json()).data ?? [];
        const videoPrompts = (await videosRes.json()).data ?? [];
        const imagePrompts = (await imagesRes.json()).data ?? [];
        const virals = (await viraisRes.json()).data ?? [];
        const creators = (await creatorsRes.json()).data ?? [];

        let whitelistCount = 0;
        let logs: AccessLogEntry[] = [];
        if (isAdmin) {
          try {
            const [whitelistRes, logsRes] = await Promise.all([
              fetch('/api/admin/whitelist', { cache: 'no-store' }),
              fetch('/api/admin/access-log?limit=200', { cache: 'no-store' }),
            ]);
            whitelistCount = ((await whitelistRes.json()).data ?? []).length;
            logs = (await logsRes.json()).data ?? [];
          } catch {
            // ignora se admin-only falhar
          }
        }

        if (cancelled) return;
        setCounts({
          products: products.length,
          videoPrompts: videoPrompts.length,
          imagePrompts: imagePrompts.length,
          virals: virals.length,
          creators: creators.length,
          whitelist: whitelistCount,
        });
        setAccessLog(logs);
      } catch (err) {
        if (!cancelled) setError((err as Error)?.message ?? 'Falha ao carregar dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const todayISO = new Date().toISOString().slice(0, 10);
  const accessesToday = accessLog.filter((l) => l.at?.startsWith(todayISO)).length;
  const loginsToday = accessLog.filter((l) => l.at?.startsWith(todayISO) && l.type === 'login').length;
  const blockedToday = accessLog.filter((l) => l.at?.startsWith(todayISO) && l.type === 'blocked').length;

  const stats = [
    { icon: Crown, label: 'Produtos campeões', value: counts.products, hint: 'Ativos no app', href: '/admin/produtos', accent: 'amber' as const },
    { icon: Clapperboard, label: 'Prompts de vídeo', value: counts.videoPrompts, hint: 'Banco completo', href: '/admin/prompts-video', accent: 'violet' as const },
    { icon: ImageIcon, label: 'Prompts de imagem', value: counts.imagePrompts, hint: 'Disponíveis', href: '/admin/prompts-imagem', accent: 'cyan' as const },
    { icon: Flame, label: 'Vídeos virais', value: counts.virals, hint: 'Modelos catalogados', href: '/admin/virais', accent: 'pink' as const },
    { icon: Trophy, label: 'Top criadores', value: counts.creators, hint: 'No ranking', href: '/admin/criadores', accent: 'emerald' as const },
    ...(isAdmin
      ? [{ icon: UserCheck, label: 'Acessos liberados', value: counts.whitelist, hint: 'Compradores ativos', href: '/admin/acessos', accent: 'cyan' as const }]
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
        {isAdmin && diag && !diag.persistenceAvailable && (
          <Card variant="glass" className="p-4 border-amber-400/40 bg-amber-500/10">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-300 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="text-sm font-semibold text-amber-200">Volume não montado — dados em memória</p>
                <p className="text-text-secondary mt-0.5">
                  O diretório <code className="text-brand-cyan-300">{diag.dataDir}</code> não pode ser usado em disco{diag.lastError ? <> ({diag.lastError})</> : null}.
                  Tudo que você criar agora <strong>vai sumir no próximo deploy</strong>.
                </p>
                <p className="text-text-muted mt-1">
                  Como resolver: no EasyPanel → Mounts → adicione um volume em <code className="text-brand-cyan-300">/app/data</code>.
                </p>
              </div>
            </div>
          </Card>
        )}

        {error && (
          <Card variant="glass" className="p-4 border-red-400/40 bg-red-500/10">
            <p className="text-sm text-red-200">{error}</p>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-text-muted gap-2">
            <Loader2 size={16} className="animate-spin" /> Carregando...
          </div>
        ) : (
          <>
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
                  <AccessChart logs={accessLog} />
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

            {isAdmin && accessLog.length > 0 && (
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
                  {accessLog.slice(0, 8).map((l) => {
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
          </>
        )}
      </section>
    </>
  );
}
