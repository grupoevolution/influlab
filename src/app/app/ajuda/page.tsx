import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { BookOpen, MessageCircle, PlayCircle, Sparkles } from 'lucide-react';

export default function AjudaPage() {
  const items = [
    { icon: PlayCircle, title: 'Tutorial em vídeo', desc: 'Como usar o InfluLab do zero ao primeiro vídeo viral.' },
    { icon: BookOpen, title: 'Guia rápido', desc: 'Fluxo recomendado: Produto → Imagem → Vídeo → Publicação.' },
    { icon: MessageCircle, title: 'Suporte', desc: 'Fale com a nossa equipe diretamente pelo WhatsApp.' },
    { icon: Sparkles, title: 'O que há de novo', desc: 'Veja todas as atualizações e novidades do sistema.' },
  ];

  return (
    <>
      <PageHeader eyebrow="Central de ajuda" title="Como podemos ajudar?" description="Tutoriais, FAQ e suporte direto com a equipe InfluLab." />
      <section className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <Card key={it.title} variant="glass" hoverable className="p-5 flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-gradient-brand-soft border border-brand-violet-400/30 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-brand-cyan-300" />
                </div>
                <div>
                  <h3 className="font-display font-bold mb-1">{it.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed">{it.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
