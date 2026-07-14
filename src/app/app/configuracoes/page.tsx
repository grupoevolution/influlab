'use client';

import { Bell, CreditCard, Lock, Moon, Sun, User } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { RemindersManager } from '@/components/reminders/RemindersManager';
import { useTheme } from '@/components/theme/ThemeProvider';
import { cn } from '@/lib/utils';

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();

  const placeholders = [
    { icon: User, title: 'Perfil', desc: 'Nome, foto, telefone e dados pessoais.' },
    { icon: Lock, title: 'Segurança', desc: 'Email de acesso, sessões ativas e logs de login.' },
    { icon: CreditCard, title: 'Plano', desc: 'Detalhes da sua compra e suporte.' },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Sua conta"
        title="Configurações"
      />
      <section className="px-4 md:px-8 py-6 max-w-3xl mx-auto space-y-8">
        {/* Tema */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sun size={14} className="text-amber-300" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text-subtle">
              Aparência
            </h2>
          </div>
          <Card variant="glass" className="p-4">
            <p className="text-sm text-text-muted mb-3">Escolha o tema do app.</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'p-4 rounded-xl border-2 transition text-left',
                  theme === 'dark'
                    ? 'border-brand-violet-400/60 bg-gradient-brand-soft'
                    : 'border-border bg-bg-elevated hover:border-brand-violet-400/30',
                )}
              >
                <Moon size={18} className="mb-2 text-brand-violet-300" />
                <p className="text-sm font-semibold">Escuro</p>
                <p className="text-[11px] text-text-muted">Padrão Influencers Lab.ia</p>
              </button>
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'p-4 rounded-xl border-2 transition text-left',
                  theme === 'light'
                    ? 'border-brand-violet-400/60 bg-gradient-brand-soft'
                    : 'border-border bg-bg-elevated hover:border-brand-violet-400/30',
                )}
              >
                <Sun size={18} className="mb-2 text-amber-300" />
                <p className="text-sm font-semibold">Claro</p>
                <p className="text-[11px] text-text-muted">Para ambientes iluminados</p>
              </button>
            </div>
          </Card>
        </div>

        {/* Lembretes */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bell size={14} className="text-brand-cyan-300" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text-subtle">
              Lembretes
            </h2>
          </div>
          <p className="text-sm text-text-muted mb-3">
            Configure horários pra ser lembrado de criar e postar vídeos.
            As notificações funcionam melhor com o app instalado na tela de início.
          </p>
          <RemindersManager />
        </div>

        {/* Em breve */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <User size={14} className="text-text-muted" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-text-subtle">
              Em breve
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {placeholders.map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.title} variant="glass" className="p-4">
                  <div className="h-10 w-10 rounded-xl bg-bg-elevated border border-border flex items-center justify-center mb-2">
                    <Icon size={16} className="text-text-muted" />
                  </div>
                  <h3 className="font-display font-bold text-sm mb-0.5">{s.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{s.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
