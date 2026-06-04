'use client';

import { Check, Clapperboard, ExternalLink, Globe, Loader2, Play, Save, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { SiteSettings } from '@/lib/db/types';

const DEFAULT_LABEL = 'Conheça o InfluLab';
const DEFAULT_HELPER =
  'Seu acesso é validado automaticamente pelo email da compra. Ainda não tem acesso? Conheça o InfluLab no link abaixo.';

export default function AdminSitePage() {
  const [data, setData] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/site-settings', { cache: 'no-store' });
      const j = await r.json();
      setData(j.data ?? {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (r.ok) setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  return (
    <>
      <AdminHeader
        title="Configurações do site"
        description="Links e textos editáveis que aparecem na tela de login e no app."
      />

      <section className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
        {loading ? (
          <div className="flex items-center gap-2 py-16 justify-center text-text-muted">
            <Loader2 size={16} className="animate-spin" /> Carregando...
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <Card variant="glass" className="p-5">
              <div className="flex items-start gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-gradient-brand shadow-glow-brand flex items-center justify-center shrink-0">
                  <Globe size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg leading-tight">Tela de login</h2>
                  <p className="text-xs text-text-muted">
                    Configurações que aparecem para quem ainda não é aluno.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                    Texto explicativo (abaixo do formulário)
                  </label>
                  <textarea
                    rows={3}
                    value={data.loginHelperText ?? ''}
                    onChange={(e) => set('loginHelperText', e.target.value)}
                    placeholder={DEFAULT_HELPER}
                    className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none resize-none"
                  />
                  <p className="text-[10px] text-text-subtle mt-1">
                    Se vazio, mostra o texto padrão.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                    Texto do link de compra
                  </label>
                  <input
                    type="text"
                    value={data.purchaseLabel ?? ''}
                    onChange={(e) => set('purchaseLabel', e.target.value)}
                    placeholder={DEFAULT_LABEL}
                    className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none"
                  />
                  <p className="text-[10px] text-text-subtle mt-1">
                    Default: "{DEFAULT_LABEL}".
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                    URL de compra <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={data.purchaseUrl ?? ''}
                    onChange={(e) => set('purchaseUrl', e.target.value)}
                    placeholder="https://pay.kiwify.com.br/seu-checkout"
                    className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none"
                  />
                  <p className="text-[10px] text-text-subtle mt-1">
                    Para onde o aluno vai ao clicar em "{data.purchaseLabel || DEFAULT_LABEL}".
                    Cole a URL do checkout ou da página de vendas.
                  </p>
                </div>

                {data.purchaseUrl && (
                  <a
                    href={data.purchaseUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-cyan-300 hover:text-brand-cyan-200"
                  >
                    <ExternalLink size={12} />
                    Abrir URL atual em nova aba
                  </a>
                )}
              </div>
            </Card>

            <Card variant="glass" className="p-5">
              <div className="flex items-start gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-gradient-brand shadow-glow-brand flex items-center justify-center shrink-0">
                  <Clapperboard size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg leading-tight">URLs globais dos produtos</h2>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Usadas por <strong>todos os produtos campeões</strong>. Configura uma vez aqui e cada produto herda no
                    modal. Se ficar vazio, o botão correspondente não aparece pro aluno.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                    URL do agente GPT
                  </label>
                  <input
                    type="url"
                    value={data.gptAgentUrl ?? ''}
                    onChange={(e) => set('gptAgentUrl', e.target.value)}
                    placeholder="https://chatgpt.com/g/seu-agente-influlab"
                    className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none"
                  />
                  <p className="text-[10px] text-text-subtle mt-1 inline-flex items-center gap-1">
                    <Sparkles size={10} />
                    O mesmo agente é usado pra gerar copy de qualquer produto.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                    URL do Google Flow
                  </label>
                  <input
                    type="url"
                    value={data.flowUrl ?? ''}
                    onChange={(e) => set('flowUrl', e.target.value)}
                    placeholder="https://labs.google/flow"
                    className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none"
                  />
                  <p className="text-[10px] text-text-subtle mt-1">
                    Geralmente é o link padrão do Flow (https://labs.google/flow).
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-5">
              <div className="flex items-start gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-gradient-brand shadow-glow-brand flex items-center justify-center shrink-0">
                  <Play size={18} className="text-white" fill="currentColor" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg leading-tight">Vídeo tutorial</h2>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Vídeo de boas-vindas mostrado no <strong>tour da 1ª visita</strong> e no botão{' '}
                    <strong>"Tutorial passo a passo"</strong> da home. Aceita MP4 direto (hospedado em
                    qualquer lugar), YouTube ou Vimeo.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                  URL do vídeo
                </label>
                <input
                  type="url"
                  value={data.tutorialVideoUrl ?? ''}
                  onChange={(e) => set('tutorialVideoUrl', e.target.value)}
                  placeholder="https://ttshopia.com/wp-content/uploads/tutorial.mp4"
                  className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none"
                />
                <p className="text-[10px] text-text-subtle mt-1 leading-relaxed">
                  Exemplos aceitos:{' '}
                  <code className="text-brand-cyan-300 font-mono">…/tutorial.mp4</code>,{' '}
                  <code className="text-brand-cyan-300 font-mono">youtube.com/watch?v=ABC</code>,{' '}
                  <code className="text-brand-cyan-300 font-mono">youtu.be/ABC</code>,{' '}
                  <code className="text-brand-cyan-300 font-mono">vimeo.com/123456</code>. Se ficar vazio,
                  os tutoriais mostram um placeholder no lugar do player.
                </p>

                {data.tutorialVideoUrl && (
                  <a
                    href={data.tutorialVideoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-cyan-300 hover:text-brand-cyan-200 mt-2"
                  >
                    <ExternalLink size={12} />
                    Abrir URL em nova aba (testar)
                  </a>
                )}
              </div>
            </Card>

            <div className="flex items-center justify-end gap-2">
              {savedAt && Date.now() - savedAt < 4000 && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                  <Check size={12} /> Salvo
                </span>
              )}
              <Button
                type="submit"
                disabled={saving}
                leftIcon={saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              >
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        )}
      </section>
    </>
  );
}
