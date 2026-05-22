import {
  Activity,
  Clapperboard,
  Crown,
  Flame,
  Image as ImageIcon,
  ShieldCheck,
  Trophy,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { getCurrentSession } from '@/lib/auth/session';
import { getDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getCurrentSession();
  const db = await getDB();

  const isAdmin = session?.role === 'admin';

  const stats = [
    { icon: Crown, label: 'Produtos campeões', value: db.products.length, href: '/admin/produtos', color: 'text-amber-300' },
    { icon: Clapperboard, label: 'Prompts de vídeo', value: db.videoPrompts.length, href: '/admin/prompts-video', color: 'text-brand-violet-300' },
    { icon: ImageIcon, label: 'Prompts de imagem', value: db.imagePrompts.length, href: '/admin/prompts-imagem', color: 'text-brand-cyan-300' },
    { icon: Flame, label: 'Vídeos virais', value: db.virals.length, href: '/admin/virais', color: 'text-pink-300' },
    { icon: Trophy, label: 'Top criadores', value: db.creators.length, href: '/admin/criadores', color: 'text-emerald-300' },
    ...(isAdmin
      ? [{ icon: UserCheck, label: 'Emails liberados', value: db.whitelist.length, href: '/admin/acessos', color: 'text-brand-cyan-300' }]
      : []),
  ];

  const recentLogins = isAdmin ? db.accessLog.slice(0, 6) : [];

  return (
    <>
      <AdminHeader
        title={
          <>
            Painel <span className="text-gradient-brand">{isAdmin ? 'principal' : 'operação'}</span>
          </>
        }
        description={isAdmin ? 'Controle total do sistema InfluLab.' : 'Adicione e edite conteúdo da plataforma.'}
      />

      <section className="px-4 md:px-8 py-6 max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.label} href={s.href} className="block group">
                <Card variant="glass" hoverable className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={18} className={s.color} />
                    <span className="text-[10px] text-text-muted">Ver tudo →</span>
                  </div>
                  <div className="text-3xl font-display font-bold">{s.value}</div>
                  <div className="text-xs text-text-muted">{s.label}</div>
                </Card>
              </Link>
            );
          })}
        </div>

        {isAdmin && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-text-subtle inline-flex items-center gap-2">
                <Activity size={14} /> Acessos recentes
              </h2>
              <Link href="/admin/logs" className="text-xs text-brand-cyan-300 hover:text-brand-cyan-200">
                Ver todos
              </Link>
            </div>
            <Card variant="glass" className="divide-y divide-border-subtle">
              {recentLogins.length === 0 && (
                <div className="p-4 text-sm text-text-muted text-center">Sem registros ainda.</div>
              )}
              {recentLogins.map((l) => (
                <div key={l.id} className="flex items-center gap-3 p-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    l.type === 'login' ? 'bg-emerald-500/15 text-emerald-300' :
                    l.type === 'blocked' ? 'bg-red-500/15 text-red-300' :
                    'bg-bg-elevated text-text-muted'
                  }`}>
                    <ShieldCheck size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{l.email}</p>
                    <p className="text-[11px] text-text-muted">{l.role} · {new Date(l.at).toLocaleString('pt-BR')}</p>
                  </div>
                  <span className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded ${
                    l.type === 'login' ? 'bg-emerald-500/10 text-emerald-300' :
                    l.type === 'blocked' ? 'bg-red-500/10 text-red-300' :
                    'bg-bg-elevated text-text-muted'
                  }`}>
                    {l.type}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        )}
      </section>
    </>
  );
}
