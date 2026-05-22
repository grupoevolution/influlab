'use client';

import { motion } from 'framer-motion';
import { Award, Crown, ExternalLink, Medal } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCreators } from '@/lib/api/client';
import type { CreatorDB } from '@/lib/db/types';
import { formatCurrency, cn } from '@/lib/utils';

type MedalConfig = {
  ring: string;
  bg: string;
  icon: 'crown' | 'medal' | 'award';
  iconColor: string;
  glow: string;
  label: string;
};

const medals: Record<number, MedalConfig> = {
  1: {
    ring: 'border-amber-400',
    bg: 'from-amber-500/30 to-amber-400/5',
    icon: 'crown',
    iconColor: 'text-amber-300',
    glow: 'shadow-[0_0_24px_rgba(245,158,11,0.45)]',
    label: 'Ouro',
  },
  2: {
    ring: 'border-slate-300',
    bg: 'from-slate-300/25 to-slate-400/5',
    icon: 'medal',
    iconColor: 'text-slate-200',
    glow: 'shadow-[0_0_24px_rgba(203,213,225,0.30)]',
    label: 'Prata',
  },
  3: {
    ring: 'border-orange-500',
    bg: 'from-orange-500/30 to-orange-600/5',
    icon: 'award',
    iconColor: 'text-orange-300',
    glow: 'shadow-[0_0_24px_rgba(249,115,22,0.40)]',
    label: 'Bronze',
  },
};

function MedalIcon({ kind, className }: { kind: MedalConfig['icon']; className?: string }) {
  if (kind === 'crown') return <Crown size={14} className={className} />;
  if (kind === 'medal') return <Medal size={14} className={className} />;
  return <Award size={14} className={className} />;
}

export default function CriadoresPage() {
  const { data: creators } = useCreators();
  return (
    <>
      <PageHeader
        eyebrow="Alunos InfluLab"
        title={
          <>
            Top <span className="text-gradient-brand">Criadores</span>
          </>
        }
      />

      <section className="px-3 md:px-8 py-6">
        <div className="max-w-3xl mx-auto space-y-2.5">
          {creators.map((c, i) => {
            const medal = medals[c.position];
            const isTop3 = !!medal;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <a
                  href={c.tiktokUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block group"
                >
                  <Card
                    variant="glass"
                    hoverable
                    className={cn(
                      'relative overflow-hidden p-3 md:p-4',
                      isTop3 && medal.glow,
                    )}
                  >
                    {/* Tinted background for top 3 */}
                    {isTop3 && (
                      <div className={cn('absolute inset-0 bg-gradient-to-r opacity-40', medal.bg)} />
                    )}

                    <div className="relative flex items-center gap-3 md:gap-4">
                      {/* Posição */}
                      <div className="shrink-0 w-9 md:w-12 text-center">
                        {isTop3 ? (
                          <div className="inline-flex flex-col items-center gap-0.5">
                            <MedalIcon kind={medal.icon} className={medal.iconColor} />
                            <span className={cn('font-display font-bold text-lg leading-none', medal.iconColor)}>
                              {c.position}
                            </span>
                          </div>
                        ) : (
                          <span className="font-display font-bold text-xl md:text-2xl text-text-muted">
                            {c.position}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {isTop3 && (
                          <div className={cn('absolute inset-0 rounded-full blur opacity-50', medal.bg.includes('amber') ? 'bg-amber-400' : medal.bg.includes('slate') ? 'bg-slate-300' : 'bg-orange-400')} />
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className={cn(
                            'relative h-11 w-11 md:h-12 md:w-12 rounded-full object-cover border-2',
                            isTop3 ? medal.ring : 'border-brand-violet-400/30',
                          )}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-sm md:text-base truncate">{c.name}</h3>
                          <Badge variant="brand" className="hidden sm:inline-flex text-[10px] px-1.5 py-0">{c.niche}</Badge>
                        </div>
                        <p className="text-xs text-text-muted truncate">
                          {c.username}
                          <span className="hidden md:inline"> · {c.followers} seguidores</span>
                        </p>
                      </div>

                      {/* Valor */}
                      <div className="shrink-0 text-right">
                        <div className="text-[10px] text-text-muted leading-none">Mês atual</div>
                        <div className={cn(
                          'font-display font-bold text-sm md:text-base mt-0.5',
                          isTop3 ? medal.iconColor : 'text-emerald-300',
                        )}>
                          {formatCurrency(c.monthRevenue)}
                        </div>
                      </div>

                      <ExternalLink size={14} className="shrink-0 text-text-muted group-hover:text-brand-cyan-300 transition" />
                    </div>
                  </Card>
                </a>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}
