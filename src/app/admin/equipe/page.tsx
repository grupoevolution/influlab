'use client';

import {
  Briefcase,
  Check,
  Edit3,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Plus,
  ShieldCheck,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import type { StaffUser } from '@/lib/db/types';

type StaffListItem = Omit<StaffUser, 'passwordHash'>;

const ENDPOINT = '/api/admin/staffs';

export default function AdminEquipePage() {
  const [items, setItems] = useState<StaffListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<StaffListItem | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(ENDPOINT, { cache: 'no-store' });
      const j = await r.json();
      setItems(j.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleActive = async (s: StaffListItem) => {
    await fetch(`${ENDPOINT}?id=${encodeURIComponent(s.id)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ active: !s.active }),
    });
    load();
  };

  const remove = async (s: StaffListItem) => {
    if (!confirm(`Remover ${s.name} (${s.email}) da equipe?`)) return;
    const r = await fetch(`${ENDPOINT}?id=${encodeURIComponent(s.id)}`, { method: 'DELETE' });
    if (r.ok) load();
  };

  return (
    <>
      <AdminHeader
        title="Equipe"
        description="Funcionários com acesso ao painel pra cadastrar produtos, prompts, virais e galeria. Não acessam configurações de sistema."
        actions={
          <Button leftIcon={<Plus size={14} />} onClick={() => setCreating(true)}>
            Novo funcionário
          </Button>
        }
      />

      <section className="px-4 md:px-8 py-6 max-w-4xl mx-auto space-y-4">
        <Card variant="glass" className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-brand shadow-glow-brand flex items-center justify-center shrink-0">
              <ShieldCheck size={16} className="text-white" />
            </div>
            <div className="text-xs leading-relaxed">
              <p className="text-sm font-semibold mb-1">Como funciona</p>
              <ul className="text-text-muted space-y-0.5 list-disc pl-4">
                <li>O funcionário acessa em <code className="text-brand-cyan-300 font-mono">/staff/login</code> com o email e senha que você definir aqui.</li>
                <li>Ele só vê a seção <strong>Conteúdo</strong> do menu (Produtos, Prompts, Virais, Criadores, Galeria).</li>
                <li>Tem acesso total pra <strong>criar, editar e remover</strong> nessas áreas.</li>
                <li>Não acessa Avisos, Liberar acessos, Integrações, Site & login, Notificações nem Logs.</li>
                <li>A senha é guardada com hash <strong className="text-text-secondary">scrypt</strong> — nem o admin consegue ver a senha. Pra trocar, edite e defina uma nova.</li>
              </ul>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center gap-2 py-16 justify-center text-text-muted">
            <Loader2 size={16} className="animate-spin" /> Carregando...
          </div>
        ) : items.length === 0 ? (
          <Card variant="glass" className="p-12 text-center">
            <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-gradient-brand shadow-glow-brand flex items-center justify-center">
              <Briefcase size={22} className="text-white" />
            </div>
            <h3 className="text-lg font-display font-bold mb-1">Nenhum funcionário ainda</h3>
            <p className="text-sm text-text-muted mb-4 max-w-md mx-auto">
              Cadastre seus funcionários pra que eles consigam alimentar o sistema diariamente.
            </p>
            <Button leftIcon={<Plus size={14} />} onClick={() => setCreating(true)}>
              Adicionar primeiro funcionário
            </Button>
          </Card>
        ) : (
          <Card variant="glass" className="divide-y divide-border-subtle">
            {items.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3.5">
                <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold shrink-0">
                  {s.name[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold truncate">{s.name}</p>
                    {!s.active && <Badge variant="warning" className="text-[10px]">Inativo</Badge>}
                  </div>
                  <p className="text-xs text-text-muted truncate font-mono">{s.email}</p>
                  <p className="text-[10px] text-text-subtle">
                    Cadastrado em {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                    {s.lastLoginAt && (
                      <> · último login {new Date(s.lastLoginAt).toLocaleString('pt-BR')}</>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => toggleActive(s)}
                  className={cn(
                    'p-2 rounded-lg transition',
                    s.active
                      ? 'text-emerald-300 hover:bg-emerald-500/10'
                      : 'text-text-muted hover:bg-white/5',
                  )}
                  title={s.active ? 'Desativar' : 'Reativar'}
                  aria-label={s.active ? 'Desativar' : 'Reativar'}
                >
                  {s.active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => setEditing(s)}
                  className="p-2 rounded-lg text-text-muted hover:text-brand-cyan-300 hover:bg-brand-cyan-500/10"
                  title="Editar"
                  aria-label="Editar"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => remove(s)}
                  className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10"
                  title="Remover"
                  aria-label="Remover"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </Card>
        )}
      </section>

      <StaffFormModal
        open={creating || !!editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        initial={editing}
        onSaved={() => {
          setCreating(false);
          setEditing(null);
          load();
        }}
      />
    </>
  );
}

function StaffFormModal({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  initial: StaffListItem | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setEmail(initial?.email ?? '');
      setPassword('');
      setShowPassword(false);
      setError(null);
    }
  }, [open, initial]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const isEdit = !!initial;
      const url = isEdit ? `${ENDPOINT}?id=${encodeURIComponent(initial!.id)}` : ENDPOINT;
      const method = isEdit ? 'PATCH' : 'POST';
      // Em edit, só envia password se foi preenchido (senão mantém a senha atual)
      const body: Record<string, string> = { name, email };
      if (!isEdit || password) body.password = password;

      const r = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        setError(j.error ?? `Erro ${r.status}`);
        return;
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const isEdit = !!initial;

  return (
    <Modal open={open} onClose={onClose} maxWidth="md">
      <form onSubmit={submit} className="p-5 md:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-white/5"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        <div className="mb-5 pr-10">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-cyan-300 mb-1">
            {isEdit ? 'Editando funcionário' : 'Novo funcionário'}
          </p>
          <h3 className="text-xl font-display font-bold leading-tight">
            {isEdit ? initial!.name : 'Cadastrar acesso'}
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              Nome completo <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria da equipe"
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              Email de login <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maria@influlab.io"
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              {isEdit ? 'Nova senha (opcional)' : <>Senha <span className="text-red-400">*</span></>}
            </label>
            <div className="relative">
              <KeyRound size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                required={!isEdit}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? 'Deixe em branco pra manter a atual' : 'Mínimo 6 caracteres'}
                minLength={isEdit && !password ? undefined : 6}
                className="w-full h-10 pl-9 pr-10 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-text-muted hover:text-text-primary"
                aria-label="Mostrar/ocultar senha"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-text-subtle mt-1">
              {isEdit
                ? 'Senha é guardada com hash scrypt — nem o admin consegue ver a atual.'
                : 'A senha é guardada com hash scrypt. Você só vê novamente se trocar.'}
            </p>
          </div>

          {error && (
            <p className="text-xs text-red-300 bg-red-500/10 border border-red-400/30 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-5 pt-4 border-t border-border-subtle">
          <Button
            type="submit"
            disabled={saving}
            leftIcon={saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            className="flex-1"
          >
            {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Cadastrar funcionário'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
