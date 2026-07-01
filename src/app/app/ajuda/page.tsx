'use client';

import { BookOpen, MessageCircle, PlayCircle, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { VideoPlayer, VideoPlayerPlaceholder } from '@/components/ui/VideoPlayer';
import type { SiteSettings } from '@/lib/db/types';

const DEFAULT_SUPPORT_LABEL = 'Suporte';
const DEFAULT_SUPPORT_DESC = 'Fale com a nossa equipe diretamente pelo WhatsApp.';

type OpenModal = null | 'video' | 'guide' | 'changelog';

export default function AjudaPage() {
  const [site, setSite] = useState<SiteSettings>({});
  const [openModal, setOpenModal] = useState<OpenModal>(null);

  useEffect(() => {
    fetch('/api/public/site-settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => setSite(j?.data ?? {}))
      .catch(() => {});
  }, []);

  const hasVideo = !!site.tutorialVideoUrl?.trim();
  const hasSupport = !!site.supportWhatsappUrl?.trim();
  const hasChangelog = !!site.changelogContent?.trim();

  const supportLabel = site.supportLabel?.trim() || DEFAULT_SUPPORT_LABEL;
  const supportDesc = site.supportDescription?.trim() || DEFAULT_SUPPORT_DESC;

  return (
    <>
      <PageHeader
        eyebrow="Central de ajuda"
        title="Como podemos ajudar?"
        description="Tutoriais, FAQ e suporte direto com a equipe InfluLab."
      />

      <section className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Tutorial em vídeo — abre modal com o player */}
          <HelpCard
            icon={PlayCircle}
            title="Tutorial em vídeo"
            description="Como usar o InfluLab do zero ao primeiro vídeo viral."
            onClick={() => setOpenModal('video')}
          />

          {/* Guia rápido — abre passo a passo (mesmo do TutorialModal) */}
          <HelpCard
            icon={BookOpen}
            title="Guia rápido"
            description="Fluxo recomendado: Produto → Imagem → Vídeo → Publicação."
            onClick={() => setOpenModal('guide')}
          />

          {/* Suporte — abre WhatsApp em nova aba, só aparece se URL configurada */}
          {hasSupport && (
            <a
              href={site.supportWhatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="block group"
            >
              <Card variant="glass" hoverable className="p-5 flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-gradient-brand-soft border border-brand-violet-400/30 flex items-center justify-center shrink-0">
                  <MessageCircle size={18} className="text-brand-cyan-300" />
                </div>
                <div>
                  <h3 className="font-display font-bold mb-1">{supportLabel}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{supportDesc}</p>
                </div>
              </Card>
            </a>
          )}

          {/* O que há de novo — abre modal com changelog, só aparece se tiver conteúdo */}
          {hasChangelog && (
            <HelpCard
              icon={Sparkles}
              title="O que há de novo"
              description="Veja todas as atualizações e novidades do sistema."
              onClick={() => setOpenModal('changelog')}
            />
          )}
        </div>
      </section>

      {/* Modal do vídeo tutorial */}
      <Modal open={openModal === 'video'} onClose={() => setOpenModal(null)} maxWidth="xl">
        <div className="relative">
          <button
            onClick={() => setOpenModal(null)}
            className="absolute top-3 right-3 z-10 p-2 rounded-xl bg-bg-elevated/80 backdrop-blur text-text-secondary hover:text-text-primary"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
          {hasVideo ? (
            <VideoPlayer url={site.tutorialVideoUrl} />
          ) : (
            <VideoPlayerPlaceholder message="O administrador ainda não cadastrou o vídeo tutorial em /admin/site." />
          )}
        </div>
      </Modal>

      {/* Modal do guia rápido (passo a passo) */}
      <GuideModal open={openModal === 'guide'} onClose={() => setOpenModal(null)} />

      {/* Modal do changelog */}
      <Modal open={openModal === 'changelog'} onClose={() => setOpenModal(null)} maxWidth="lg">
        <div className="p-6 md:p-7">
          <button
            onClick={() => setOpenModal(null)}
            className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-brand shadow-glow-brand flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-cyan-300">
                Novidades
              </p>
              <h2 className="text-xl font-display font-bold leading-tight">
                O que há de <span className="text-gradient-brand">novo</span>
              </h2>
            </div>
          </div>

          <div className="rounded-2xl bg-bg-elevated border border-border p-4 max-h-[60vh] overflow-y-auto">
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap font-sans">
              {site.changelogContent}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

function HelpCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="block text-left w-full group">
      <Card variant="glass" hoverable className="p-5 flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-gradient-brand-soft border border-brand-violet-400/30 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-brand-cyan-300" />
        </div>
        <div>
          <h3 className="font-display font-bold mb-1">{title}</h3>
          <p className="text-sm text-text-muted leading-relaxed">{description}</p>
        </div>
      </Card>
    </button>
  );
}

function GuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const steps = [
    {
      n: 1,
      title: 'Escolha um produto campeão',
      desc: 'Abra a aba "Produtos Campeões". Os primeiros da lista são os que mais vendem hoje. Clique em qualquer um para abrir os detalhes.',
      color: 'text-amber-300',
      bg: 'from-amber-500/20 to-amber-400/5',
    },
    {
      n: 2,
      title: 'Gere a imagem no Nano Banana',
      desc: 'No modal do produto, baixe a imagem campeã. Vá no Lab de Imagens, copie um prompt e cole no Nano Banana junto com a imagem do produto.',
      color: 'text-brand-cyan-300',
      bg: 'from-brand-cyan-500/20 to-brand-cyan-400/5',
    },
    {
      n: 3,
      title: 'Gere o vídeo no Flow',
      desc: 'Abra o Lab de Vídeos, escolha um prompt do mesmo estilo que você quer (UGC, cinematic etc.) e cole no Flow junto com a imagem que você gerou.',
      color: 'text-brand-violet-300',
      bg: 'from-brand-violet-500/20 to-brand-violet-400/5',
    },
    {
      n: 4,
      title: 'Publique no TikTok',
      desc: 'Pegue o link de afiliação no modal do produto, baixe o vídeo do Flow e poste no TikTok com a sua bio configurada. Pronto.',
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
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan-300">
            Guia rápido · 4 passos
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight mb-2">
          Seu primeiro vídeo viral <span className="text-gradient-brand">em 3 minutos</span>
        </h2>
        <p className="text-sm text-text-muted leading-relaxed mb-6">
          O fluxo recomendado pela equipe InfluLab. Siga na ordem para o melhor resultado.
        </p>

        <ol className="space-y-3">
          {steps.map((s) => (
            <li key={s.n} className="relative">
              <div
                className={`rounded-2xl p-4 border border-white/5 bg-gradient-to-br ${s.bg}`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 h-10 w-10 rounded-xl glass-strong flex items-center justify-center font-display font-bold">
                    {s.n}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${s.color}`}>PASSO {s.n}</span>
                    </div>
                    <h3 className="font-display font-bold leading-tight mb-1">{s.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-6 pt-5 border-t border-border-subtle">
          <Link
            href="/app/produtos-campeoes"
            onClick={onClose}
            className="flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-gradient-brand text-white text-sm font-semibold shadow-glow-brand active:brightness-110"
          >
            <Sparkles size={15} />
            Começar pelo passo 1
          </Link>
        </div>
      </div>
    </Modal>
  );
}
