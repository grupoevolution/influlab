'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Clapperboard,
  Crown,
  Flame,
  Image as ImageIcon,
  Play,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/brand/Logo';

const TOUR_KEY = 'influlab.tour-completed';

type View = 'welcome' | 'tour' | 'video' | 'done';

const slides = [
  {
    icon: Crown,
    accent: 'text-amber-300',
    bg: 'from-amber-500/30 to-amber-400/5',
    title: 'Produtos Campeões',
    description:
      'Todos os dias nossa equipe seleciona os produtos que mais estão vendendo no TikTok Shop. Você só precisa escolher um, copiar o vídeo modelo, gerar com IA e publicar.',
    bullets: [
      'Ranking atualizado diariamente',
      'Link de afiliação pronto',
      'Vídeo campeão pra modelar',
    ],
  },
  {
    icon: Clapperboard,
    accent: 'text-brand-violet-300',
    bg: 'from-brand-violet-500/30 to-brand-violet-400/5',
    title: 'Bancos de Prompts',
    description:
      'Centenas de prompts validados para gerar vídeos no Flow e imagens no Nano Banana. É só copiar, colar e pronto.',
    bullets: [
      'Prompts de vídeo 9:16 prontos',
      'Prompts de imagem premium',
      'Categorias por nicho',
    ],
  },
  {
    icon: Flame,
    accent: 'text-pink-300',
    bg: 'from-pink-500/30 to-pink-400/5',
    title: 'Vídeos Virais',
    description:
      'Modelos virais com hook + passo a passo + prompt. Replicar leva ~5 minutos e ajuda você a crescer perfil rápido.',
    bullets: ['Hook validado', 'Passo a passo', 'Trends do TikTok'],
  },
  {
    icon: Trophy,
    accent: 'text-emerald-300',
    bg: 'from-emerald-500/30 to-emerald-400/5',
    title: 'Ranking de Criadores',
    description:
      'Veja quem mais está vendendo com a metodologia InfluLab. Inspire-se nos perfis que estão fazendo 5 ou 6 dígitos por mês.',
    bullets: ['Top criadores do mês', 'Acesso aos perfis', 'Inspiração diária'],
  },
  {
    icon: Sparkles,
    accent: 'text-brand-cyan-300',
    bg: 'from-brand-cyan-500/30 to-brand-cyan-400/5',
    title: 'Seu primeiro vídeo em 4 passos',
    description: 'O fluxo que recomendamos para você começar agora:',
    bullets: [
      '1. Escolha um Produto Campeão',
      '2. Gere a imagem no Nano Banana',
      '3. Gere o vídeo no Flow',
      '4. Publique com link de afiliado',
    ],
  },
];

export function WelcomeTour() {
  const [view, setView] = useState<View | null>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const completed = window.localStorage.getItem(TOUR_KEY);
    if (!completed) {
      const timer = setTimeout(() => setView('welcome'), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    if (typeof window !== 'undefined') window.localStorage.setItem(TOUR_KEY, '1');
    setView(null);
  };

  const startTour = () => {
    setStep(0);
    setView('tour');
  };

  const next = () => {
    if (step < slides.length - 1) setStep((s) => s + 1);
    else close();
  };

  const prev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <AnimatePresence>
      {view && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-bg/85 backdrop-blur-md" onClick={close} />

          {view === 'welcome' && (
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              className="relative w-full max-w-md glass-strong rounded-3xl p-6 md:p-8 shadow-glow-violet"
            >
              <button
                onClick={close}
                className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>

              <div className="flex justify-center mb-5">
                <Logo size="md" />
              </div>

              <div className="text-center mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan-300 mb-2">
                  Bem-vindo, criador!
                </p>
                <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight mb-3">
                  Quer um tour rápido pelo <span className="text-gradient-brand">laboratório</span>?
                </h2>
                <p className="text-sm text-text-muted leading-relaxed">
                  Em menos de 30 segundos, te mostramos o que cada área faz e como criar seu primeiro vídeo viral.
                </p>
              </div>

              <div className="space-y-2.5 mb-2">
                <button
                  onClick={startTour}
                  className="w-full p-4 rounded-2xl bg-gradient-brand text-white text-left shadow-glow-brand active:brightness-110 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <Sparkles size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Tour de 30 segundos</div>
                      <div className="text-xs opacity-90">Recomendado · 5 passos</div>
                    </div>
                    <ArrowRight size={18} className="opacity-70 group-hover:translate-x-1 transition" />
                  </div>
                </button>

                <button
                  onClick={() => setView('video')}
                  className="w-full p-4 rounded-2xl bg-bg-elevated border border-border text-left hover:border-brand-cyan-400/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-brand-cyan-500/15 border border-brand-cyan-400/30 flex items-center justify-center shrink-0">
                      <Play size={16} className="text-brand-cyan-300 ml-0.5" fill="currentColor" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Ver vídeo tutorial</div>
                      <div className="text-xs text-text-muted">~3 minutos</div>
                    </div>
                    <ArrowRight size={18} className="text-text-muted" />
                  </div>
                </button>

                <button
                  onClick={close}
                  className="w-full p-3 text-sm text-text-muted hover:text-text-primary transition"
                >
                  Vou explorar sozinho
                </button>
              </div>
            </motion.div>
          )}

          {view === 'tour' && (
            <TourSlide
              step={step}
              total={slides.length}
              onClose={close}
              onPrev={prev}
              onNext={next}
            />
          )}

          {view === 'video' && (
            <motion.div
              initial={{ y: 30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              className="relative w-full max-w-3xl glass-strong rounded-3xl overflow-hidden shadow-glow-violet"
            >
              <button
                onClick={close}
                className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-bg-elevated/80 backdrop-blur text-text-secondary hover:text-text-primary"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
              <div className="aspect-video bg-bg-elevated relative flex items-center justify-center">
                {/* placeholder do vídeo tutorial */}
                <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
                <div className="relative text-center px-6">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-brand shadow-glow-brand flex items-center justify-center">
                    <Play size={26} className="text-white ml-1" fill="currentColor" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2">Vídeo tutorial</h3>
                  <p className="text-sm text-text-muted max-w-md">
                    Em breve você verá aqui o tutorial gravado pela equipe InfluLab.
                    No painel admin você poderá fazer upload do vídeo e personalizar.
                  </p>
                </div>
              </div>
              <div className="p-5 flex justify-end gap-2">
                <button
                  onClick={() => setView('welcome')}
                  className="px-4 h-10 rounded-xl text-sm text-text-muted hover:text-text-primary"
                >
                  Voltar
                </button>
                <button
                  onClick={close}
                  className="px-5 h-10 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-glow-brand"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TourSlide({
  step,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  step: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const s = slides[step];
  const Icon = s.icon;
  const isLast = step === total - 1;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      className="relative w-full max-w-md glass-strong rounded-3xl p-6 md:p-8 shadow-glow-violet"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5"
        aria-label="Fechar tour"
      >
        <X size={18} />
      </button>

      {/* progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-6">
        {slides.map((_, i) => (
          <div
            key={i}
            className={
              i === step
                ? 'h-1.5 w-8 rounded-full bg-gradient-brand transition-all'
                : i < step
                ? 'h-1.5 w-1.5 rounded-full bg-brand-violet-400 transition-all'
                : 'h-1.5 w-1.5 rounded-full bg-white/15 transition-all'
            }
          />
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-center mb-5">
          <div
            className={`relative h-20 w-20 rounded-3xl flex items-center justify-center bg-gradient-to-br ${s.bg} border border-white/10`}
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-brand opacity-15 blur-xl" />
            <Icon size={36} className={`relative ${s.accent}`} />
          </div>
        </div>

        <div className="text-center mb-5">
          <h3 className="text-2xl font-display font-bold leading-tight mb-2">{s.title}</h3>
          <p className="text-sm text-text-muted leading-relaxed">{s.description}</p>
        </div>

        <ul className="space-y-2 mb-7">
          {s.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-text-secondary">
              <Check size={15} className="text-brand-cyan-300 shrink-0 mt-0.5" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={step === 0}
          className="px-4 h-10 rounded-xl text-sm text-text-muted hover:text-text-primary disabled:opacity-30"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-glow-brand active:brightness-110"
        >
          {isLast ? 'Começar a usar' : 'Próximo'}
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
