'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowRight,
  Clapperboard,
  Crown,
  Flame,
  GraduationCap,
  Image as ImageIcon,
  Play,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { categories } from '@/lib/mock-data';
import { Card } from '@/components/ui/Card';
import { CircuitDecor } from '@/components/brand/CircuitDecor';
import { Modal } from '@/components/ui/Modal';
import {
  AnnouncementBanner,
  DailyDrop,
  TrendingNow,
  UpcomingEvents,
} from '@/components/home/DailyHighlights';
import { CalculatorTeaser } from '@/components/home/CalculatorTeaser';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Crown,
  Clapperboard,
  ImageIcon,
  Flame,
  Trophy,
};

const accentMap = {
  amber: { glow: 'group-hover:shadow-[0_0_40px_rgba(245,158,11,0.25)]', icon: 'text-amber-300', bg: 'from-amber-500/20 to-amber-400/5', dot: 'bg-amber-400' },
  violet: { glow: 'group-hover:shadow-glow-violet', icon: 'text-brand-violet-300', bg: 'from-brand-violet-500/20 to-brand-violet-400/5', dot: 'bg-brand-violet-400' },
  cyan: { glow: 'group-hover:shadow-glow-cyan', icon: 'text-brand-cyan-300', bg: 'from-brand-cyan-500/20 to-brand-cyan-400/5', dot: 'bg-brand-cyan-400' },
  pink: { glow: 'group-hover:shadow-[0_0_40px_rgba(236,72,153,0.25)]', icon: 'text-pink-300', bg: 'from-pink-500/20 to-pink-400/5', dot: 'bg-pink-400' },
  emerald: { glow: 'group-hover:shadow-[0_0_40px_rgba(16,185,129,0.25)]', icon: 'text-emerald-300', bg: 'from-emerald-500/20 to-emerald-400/5', dot: 'bg-emerald-400' },
};

// Vídeo de fundo do hero. Substitua a URL por um vídeo real (mp4/webm) através do painel.
const HERO_VIDEO_URL = 'https://cdn.coverr.co/videos/coverr-a-girl-with-pink-hair-looking-at-the-camera-2569/1080p.mp4';

export default function AppHomePage() {
  const [tutorialOpen, setTutorialOpen] = useState(false);

  return (
    <div>
      {/* HERO com vídeo de fundo */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center overflow-hidden">
        {/* Vídeo de fundo */}
        <div className="absolute inset-0">
          <video
            src={HERO_VIDEO_URL}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Overlay: escuro + gradiente brand */}
          <div className="absolute inset-0 bg-bg/85" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/80 via-bg/60 to-bg" />
          <div className="absolute inset-0 bg-gradient-mesh opacity-70" />
          <div className="absolute inset-0 noise-overlay" />
        </div>

        {/* Circuit decor */}
        <CircuitDecor className="absolute inset-x-0 top-0 h-full w-full opacity-30 pointer-events-none" />

        {/* Conteúdo */}
        <div className="relative w-full px-4 md:px-8 py-16 md:py-20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[1.05]">
                Olá, criador. <br className="hidden md:block" />
                <span className="text-gradient-brand">Vamos criar um viral hoje?</span>
              </h1>
            </motion.div>
          </div>
        </div>

        {/* Fade na base */}
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-bg to-transparent" />
      </section>

      {/* Aviso do dia (sobe sobre a base do hero) */}
      <AnnouncementBanner />

      {/* Drop do dia */}
      <DailyDrop />

      {/* Calculadora de potencial */}
      <CalculatorTeaser />

      {/* Em alta agora */}
      <TrendingNow />

      {/* Próximos eventos */}
      <UpcomingEvents />

      {/* CATEGORIAS */}
      <section className="px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan-300 mb-1">
              Laboratório
            </p>
            <h2 className="text-2xl md:text-3xl font-display font-bold">
              Onde você quer começar?
            </h2>
          </div>

          <div className="grid gap-4 md:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Card fixo: Tutorial / Passo a passo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button onClick={() => setTutorialOpen(true)} className="block w-full text-left group">
                <Card
                  variant="gradient"
                  hoverable
                  className="relative h-full p-6 overflow-hidden border-brand-violet-400/40 shadow-glow-violet bg-gradient-to-br from-brand-violet-500/25 via-brand-violet-600/15 to-brand-cyan-500/15"
                >
                  <CircuitDecor className="absolute inset-0 w-full h-full opacity-30" />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-5">
                      <div className="relative h-12 w-12 rounded-2xl flex items-center justify-center bg-gradient-brand shadow-glow-brand">
                        <GraduationCap size={22} className="text-white" />
                        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-brand-cyan-400 animate-pulse" />
                      </div>
                      <span className="text-xs font-mono text-brand-cyan-300">START</span>
                    </div>

                    <h3 className="text-xl font-display font-bold mb-2 leading-tight">
                      Tutorial <span className="text-gradient-cyan">passo a passo</span>
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed mb-5">
                      Aprenda a usar o InfluLab do zero. Como gerar seu primeiro vídeo viral para o TikTok Shop em minutos.
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-text-secondary">
                        4 passos · 3 minutos
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-cyan-300 group-hover:gap-2 transition-all">
                        <Play size={12} fill="currentColor" />
                        Começar
                      </span>
                    </div>
                  </div>
                </Card>
              </button>
            </motion.div>

            {categories.map((cat, i) => {
              const Icon = iconMap[cat.icon] ?? Sparkles;
              const accent = accentMap[cat.accent];
              return (
                <motion.div
                  key={cat.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                >
                  <Link href={cat.href} className="block group">
                    <Card
                      variant="glass"
                      hoverable
                      className={cn('relative h-full p-6 overflow-hidden transition-shadow duration-500', accent.glow)}
                    >
                      {/* gradient bg accent */}
                      <div
                        className={cn(
                          'absolute -top-20 -right-20 h-48 w-48 rounded-full blur-3xl opacity-50 transition-opacity duration-500 bg-gradient-to-br',
                          accent.bg,
                        )}
                      />

                      <div className="relative">
                        <div className="flex items-start justify-between mb-5">
                          <div
                            className={cn(
                              'relative h-12 w-12 rounded-2xl flex items-center justify-center bg-gradient-to-br border border-white/5',
                              accent.bg,
                            )}
                          >
                            <Icon size={22} className={accent.icon} />
                            <span className={cn('absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full animate-pulse', accent.dot)} />
                          </div>
                          <span className="text-xs font-mono text-text-muted">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </div>

                        <h3 className="text-xl font-display font-bold mb-2 leading-tight">
                          {cat.title}
                        </h3>
                        <p className="text-sm text-text-muted leading-relaxed mb-5">
                          {cat.description}
                        </p>

                        <div className="flex items-center justify-end">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-cyan-300 group-hover:gap-2 transition-all">
                            Explorar
                            <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <TutorialModal open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </div>
  );
}

function TutorialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const steps = [
    {
      n: 1,
      title: 'Escolha um produto campeão',
      desc: 'Abra a aba "Produtos Campeões". Os primeiros da lista são os que mais vendem hoje. Clique em qualquer um para abrir os detalhes.',
      icon: Crown,
      color: 'text-amber-300',
      bg: 'from-amber-500/20 to-amber-400/5',
    },
    {
      n: 2,
      title: 'Gere a imagem no Nano Banana',
      desc: 'No modal do produto, baixe a imagem campeã. Vá no Lab de Imagens, copie um prompt e cole no Nano Banana junto com a imagem do produto.',
      icon: ImageIcon,
      color: 'text-brand-cyan-300',
      bg: 'from-brand-cyan-500/20 to-brand-cyan-400/5',
    },
    {
      n: 3,
      title: 'Gere o vídeo no Flow',
      desc: 'Abra o Lab de Vídeos, escolha um prompt do mesmo estilo que você quer (UGC, cinematic etc.) e cole no Flow junto com a imagem que você gerou.',
      icon: Clapperboard,
      color: 'text-brand-violet-300',
      bg: 'from-brand-violet-500/20 to-brand-violet-400/5',
    },
    {
      n: 4,
      title: 'Publique no TikTok',
      desc: 'Pegue o link de afiliação no modal do produto, baixe o vídeo do Flow e poste no TikTok com a sua bio configurada. Pronto.',
      icon: Flame,
      color: 'text-pink-300',
      bg: 'from-pink-500/20 to-pink-400/5',
    },
  ];

  return (
    <Modal open={open} onClose={onClose} maxWidth="lg">
      <div className="p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="h-11 w-11 rounded-2xl bg-gradient-brand shadow-glow-brand flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan-300">
            Tutorial · 4 passos
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight mb-2">
          Seu primeiro vídeo viral <span className="text-gradient-brand">em 3 minutos</span>
        </h2>
        <p className="text-sm text-text-muted leading-relaxed mb-6">
          O fluxo recomendado pela equipe InfluLab. Siga na ordem para o melhor resultado.
        </p>

        <ol className="space-y-3">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.n} className="relative">
                <div className={cn('rounded-2xl p-4 border border-white/5 bg-gradient-to-br', s.bg)}>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 h-10 w-10 rounded-xl glass-strong flex items-center justify-center">
                      <Icon size={18} className={s.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-xs font-bold', s.color)}>PASSO {s.n}</span>
                      </div>
                      <h3 className="font-display font-bold leading-tight mb-1">{s.title}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 pt-5 border-t border-border-subtle flex flex-col sm:flex-row gap-2">
          <Link
            href="/app/produtos-campeoes"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-glow-brand active:brightness-110"
          >
            <Sparkles size={15} />
            Começar pelo passo 1
          </Link>
          <button
            onClick={onClose}
            className="sm:flex-none h-12 px-5 rounded-xl bg-bg-elevated border border-border text-sm font-semibold text-text-secondary hover:text-text-primary transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}
