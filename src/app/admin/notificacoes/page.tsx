'use client';

import { Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { NotificationBroadcast } from '@/lib/db/types';

export default function AdminNotificacoesPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [items, setItems] = useState<NotificationBroadcast[]>([]);
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState<string | null>(null);

  const load = async () => {
    const r = await fetch('/api/admin/broadcasts', { cache: 'no-store' });
    const j = await r.json();
    setItems(j.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setSentMsg(null);
    try {
      const res = await fetch('/api/admin/broadcasts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, body, url }),
      });
      if (res.ok) {
        setSentMsg('Notificação enfileirada! Clientes vão receber em até 1 minuto.');
        setTitle(''); setBody(''); setUrl('');
        load();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <AdminHeader
        title="Notificações broadcast"
        description="Envie uma notificação push pra todos os alunos. Clientes online recebem na hora; instalados como app recebem mesmo fechados."
      />

      <section className="px-4 md:px-8 py-6 max-w-3xl mx-auto space-y-5">
        <Card variant="glass" className="p-5">
          <form onSubmit={send} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Título *</label>
              <input
                required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Novo produto campeão!"
                className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Mensagem *</label>
              <textarea
                required value={body} onChange={(e) => setBody(e.target.value)}
                placeholder="Acabamos de subir um produto que tá explodindo. Corre lá!"
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-sm resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">URL ao clicar (opcional)</label>
              <input
                type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                placeholder="/app/produtos-campeoes"
                className="w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm"
              />
            </div>

            {sentMsg && (
              <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-400/30 rounded-lg px-3 py-2">
                {sentMsg}
              </div>
            )}

            <Button type="submit" loading={sending} leftIcon={<Send size={14} />} className="w-full">
              Disparar para todos os alunos
            </Button>

            <p className="text-[11px] text-text-subtle leading-relaxed">
              Web Push real precisa de chaves VAPID configuradas. Por ora, o cliente verifica via polling a cada 60s
              e mostra a notificação se for nova.
            </p>
          </form>
        </Card>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-subtle mb-2">Histórico</h2>
          <Card variant="glass" className="divide-y divide-border-subtle">
            {items.length === 0 && (
              <div className="p-4 text-sm text-text-muted text-center">Nenhuma notificação enviada.</div>
            )}
            {items.map((b) => (
              <div key={b.id} className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm">{b.title}</p>
                  <span className="text-[10px] text-text-muted">{new Date(b.sentAt).toLocaleString('pt-BR')}</span>
                </div>
                <p className="text-xs text-text-muted">{b.body}</p>
                {b.url && <p className="text-[10px] text-brand-cyan-300 mt-1">→ {b.url}</p>}
              </div>
            ))}
          </Card>
        </div>
      </section>
    </>
  );
}
