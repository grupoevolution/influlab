'use client';

import { AlertCircle, Copy, Crown, Plug, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { Plan, PlatformConfig, PlatformProductMapping } from '@/lib/db/types';

const PLATFORMS = ['kiwify', 'ticto'] as const;
type Platform = (typeof PLATFORMS)[number];

export default function AdminIntegracoesPage() {
  const [config, setConfig] = useState<PlatformConfig>({});
  const [mappings, setMappings] = useState<PlatformProductMapping[]>([]);
  const [origin, setOrigin] = useState('');

  const load = async () => {
    const r = await fetch('/api/admin/integrations', { cache: 'no-store' });
    const j = await r.json();
    setConfig(j.config ?? {});
    setMappings(j.mappings ?? []);
  };

  useEffect(() => {
    load();
    if (typeof window !== 'undefined') setOrigin(window.location.origin);
  }, []);

  const updateConfig = async (platform: Platform, patch: Partial<PlatformConfig['kiwify']>) => {
    await fetch('/api/admin/integrations', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ platform, patch }),
    });
    load();
  };

  const addMapping = async (data: Partial<PlatformProductMapping>) => {
    await fetch('/api/admin/integrations', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    load();
  };

  const removeMapping = async (id: string) => {
    await fetch('/api/admin/integrations', {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    load();
  };

  return (
    <>
      <AdminHeader
        title="Integrações"
        description="Configure os webhooks das plataformas de pagamento. Compras aprovadas liberam o aluno automaticamente."
      />

      <section className="px-4 md:px-8 py-6 max-w-4xl mx-auto space-y-6">
        {PLATFORMS.map((p) => (
          <PlatformCard
            key={p}
            platform={p}
            cfg={config[p] ?? { enabled: false }}
            origin={origin}
            mappings={mappings.filter((m) => m.platform === p)}
            onUpdate={(patch) => updateConfig(p, patch)}
            onAddMapping={(data) => addMapping({ ...data, platform: p })}
            onRemoveMapping={removeMapping}
          />
        ))}
      </section>
    </>
  );
}

function PlatformCard({
  platform,
  cfg,
  origin,
  mappings,
  onUpdate,
  onAddMapping,
  onRemoveMapping,
}: {
  platform: Platform;
  cfg: NonNullable<PlatformConfig['kiwify']>;
  origin: string;
  mappings: PlatformProductMapping[];
  onUpdate: (patch: Partial<PlatformConfig['kiwify']>) => void;
  onAddMapping: (m: Partial<PlatformProductMapping>) => void;
  onRemoveMapping: (id: string) => void;
}) {
  const [productIds, setProductIds] = useState('');
  const [productName, setProductName] = useState('');
  const [plan, setPlan] = useState<Plan>('basic');

  const webhookUrl = origin ? `${origin}/api/webhooks/${platform}` : '';
  const platformLabel = platform === 'kiwify' ? 'Kiwify' : 'Ticto';

  const submitMapping = () => {
    const ids = productIds
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    // Sem IDs, ainda permite mapear pelo nome (1 entrada)
    if (ids.length === 0) {
      if (!productName.trim()) return;
      onAddMapping({ productId: '', productName: productName.trim(), plan });
    } else {
      // Cria um mapeamento pra cada ID; o nome (opcional) é compartilhado
      for (const id of ids) {
        onAddMapping({ productId: id, productName: productName.trim() || undefined, plan });
      }
    }
    setProductIds('');
    setProductName('');
  };

  return (
    <Card variant="glass" className="p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-brand shadow-glow-brand flex items-center justify-center">
            <Plug size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold">{platformLabel}</h3>
            <p className="text-xs text-text-muted">
              {cfg.enabled ? 'Ativo · recebendo webhooks' : 'Desativado'}
            </p>
          </div>
        </div>
        <button
          onClick={() => onUpdate({ enabled: !cfg.enabled })}
          className={`h-10 px-4 rounded-xl text-sm font-semibold transition ${
            cfg.enabled
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
              : 'bg-bg-elevated border border-border text-text-muted'
          }`}
        >
          {cfg.enabled ? 'Ativado' : 'Desativado'}
        </button>
      </div>

      {/* URL do webhook */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-cyan-300 mb-1.5">
          URL do webhook (cole no painel do {platformLabel})
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={webhookUrl}
            className="flex-1 h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm font-mono"
          />
          <Button
            variant="secondary"
            leftIcon={<Copy size={14} />}
            onClick={() => navigator.clipboard.writeText(webhookUrl)}
          >
            Copiar
          </Button>
        </div>
      </div>

      {/* Mapeamentos */}
      <div className="pt-4 border-t border-border-subtle">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-300 mb-2">
          Produtos da {platformLabel} → Planos InfluLab
        </p>
        <div className="text-xs text-text-muted leading-relaxed mb-3 space-y-1">
          <p>
            Use isso pra forçar produtos específicos no plano <strong className="text-amber-300">PRO</strong>.
            Webhooks de produtos <strong>não mapeados</strong> liberam automaticamente no plano Básico.
          </p>
          {platform === 'kiwify' && (
            <p className="text-text-subtle">
              <strong className="text-text-secondary">Como mapear:</strong>{' '}
              cole o <strong>código</strong> que aparece no link de compra
              (ex: <code className="text-brand-cyan-300 font-mono">pay.kiwify.com.br/<strong>fbgho4j</strong></code>)
              {' '}<em>ou</em> o <strong>nome exato</strong> do produto. Qualquer um dos dois bate com o webhook.
            </p>
          )}
          {platform === 'ticto' && (
            <p className="text-text-subtle">
              <strong className="text-text-secondary">Como mapear:</strong>{' '}
              use o <strong>ID</strong> do produto (achável no painel da Ticto, na aba do produto){' '}
              <em>ou</em> o <strong>nome exato</strong>. Qualquer um dos dois bate com o webhook.
            </p>
          )}
        </div>

        <div className="space-y-2 mb-3">
          {mappings.length === 0 && (
            <div className="rounded-xl bg-bg-elevated border border-border p-3 flex items-start gap-2">
              <AlertCircle size={14} className="text-text-muted mt-0.5 shrink-0" />
              <p className="text-xs text-text-secondary">
                Nenhum mapeamento ainda. Tudo bem — todos os webhooks aprovados liberam o aluno
                no plano <strong className="text-brand-cyan-300">Básico</strong> por padrão.
              </p>
            </div>
          )}
          {mappings.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-bg-elevated border border-border"
            >
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                  m.plan === 'pro'
                    ? 'bg-amber-500/15 text-amber-300'
                    : 'bg-brand-cyan-500/15 text-brand-cyan-300'
                }`}
              >
                {m.plan === 'pro' ? <Crown size={14} /> : <Plug size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {m.productName || m.productId}
                </p>
                <p className="text-[10px] text-text-muted font-mono">{m.productId}</p>
              </div>
              <Badge variant={m.plan === 'pro' ? 'warning' : 'cyan'}>{m.plan.toUpperCase()}</Badge>
              <button
                onClick={() => onRemoveMapping(m.id)}
                className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Novo mapeamento */}
        <div className="rounded-xl bg-bg p-3 border border-border-subtle space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <textarea
              value={productIds}
              onChange={(e) => setProductIds(e.target.value)}
              placeholder={
                platform === 'kiwify'
                  ? 'Código do produto (ex: fbgho4j) — vários separados por vírgula'
                  : 'ID do produto — vários separados por vírgula'
              }
              rows={2}
              className="h-[60px] px-3 py-2 rounded-lg bg-bg-elevated border border-border text-xs resize-none"
            />
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="OU nome exato do produto"
              className="h-9 px-3 rounded-lg bg-bg-elevated border border-border text-xs"
            />
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as Plan)}
              className="h-9 px-3 rounded-lg bg-bg-elevated border border-border text-xs"
            >
              <option value="basic">Plano Básico</option>
              <option value="pro">Plano PRO</option>
            </select>
          </div>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-[10px] text-text-subtle">
              Preencha código <strong>OU</strong> nome — um dos dois basta. Cole vários códigos separados por
              vírgula pra criar múltiplos mapeamentos de uma vez.
            </p>
            <Button
              size="sm"
              leftIcon={<Plus size={12} />}
              onClick={submitMapping}
            >
              Adicionar mapeamento
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
