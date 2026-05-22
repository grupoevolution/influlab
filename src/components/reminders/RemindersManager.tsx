'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, BellOff, Check, Clock, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { fireReminder, useReminders, type DayOfWeek, type Reminder } from '@/lib/reminders-store';
import { cn } from '@/lib/utils';

const dayLabels: { value: DayOfWeek; short: string; long: string }[] = [
  { value: 1, short: 'S', long: 'Seg' },
  { value: 2, short: 'T', long: 'Ter' },
  { value: 3, short: 'Q', long: 'Qua' },
  { value: 4, short: 'Q', long: 'Qui' },
  { value: 5, short: 'S', long: 'Sex' },
  { value: 6, short: 'S', long: 'Sáb' },
  { value: 0, short: 'D', long: 'Dom' },
];

const presets = [
  { label: 'Criar vídeo do dia', time: '09:00', days: [1, 2, 3, 4, 5] as DayOfWeek[] },
  { label: 'Postar conteúdo', time: '19:00', days: [0, 1, 2, 3, 4, 5, 6] as DayOfWeek[] },
  { label: 'Conferir novos produtos campeões', time: '08:00', days: [1, 2, 3, 4, 5] as DayOfWeek[] },
];

type Permission = 'default' | 'granted' | 'denied' | 'unsupported';

export function RemindersManager({ compact = false }: { compact?: boolean }) {
  const { items, add, toggle, remove } = useReminders();
  const [permission, setPermission] = useState<Permission>('default');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as Permission);
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const p = await Notification.requestPermission();
    setPermission(p as Permission);
  };

  return (
    <div className={cn('space-y-3', compact && 'space-y-2')}>
      {/* Permissão */}
      {permission !== 'granted' && (
        <Card variant="glass" className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-cyan-500/15 border border-brand-cyan-400/30 flex items-center justify-center shrink-0">
              <Bell size={16} className="text-brand-cyan-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm mb-0.5">Ativar notificações</p>
              <p className="text-xs text-text-muted leading-relaxed mb-2">
                {permission === 'denied'
                  ? 'Você bloqueou as notificações. Habilite manualmente nas configurações do navegador.'
                  : permission === 'unsupported'
                  ? 'Seu navegador não suporta notificações. Instale o app na tela de início para ativar.'
                  : 'Receba lembretes pra criar e postar todo dia. Funciona melhor com o app instalado.'}
              </p>
              {permission === 'default' && (
                <Button size="sm" onClick={requestPermission}>
                  Permitir notificações
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Lista de lembretes */}
      <AnimatePresence>
        {items.map((r) => (
          <motion.div
            key={r.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ReminderCard reminder={r} onToggle={toggle} onRemove={remove} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empty state */}
      {items.length === 0 && !creating && (
        <Card variant="glass" className="p-5 text-center">
          <div className="mx-auto h-10 w-10 rounded-xl bg-bg-elevated border border-border flex items-center justify-center mb-2">
            <BellOff size={16} className="text-text-muted" />
          </div>
          <p className="text-sm text-text-secondary mb-3">Você ainda não tem lembretes</p>
        </Card>
      )}

      {/* Form / botão criar */}
      {creating ? (
        <CreateForm
          onAdd={(data) => {
            add(data);
            setCreating(false);
          }}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <Button
          variant="outline"
          className="w-full"
          leftIcon={<Plus size={14} />}
          onClick={() => setCreating(true)}
        >
          Novo lembrete
        </Button>
      )}

      {/* Test button */}
      {permission === 'granted' && items.length > 0 && (
        <button
          onClick={() => fireReminder({ id: 'test', label: 'Teste de notificação ✨', time: '', days: [], enabled: true, createdAt: '' })}
          className="text-xs text-text-muted hover:text-brand-cyan-300 mx-auto block mt-2"
        >
          Disparar notificação de teste
        </button>
      )}
    </div>
  );
}

function ReminderCard({
  reminder,
  onToggle,
  onRemove,
}: {
  reminder: Reminder;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const daysShort = dayLabels
    .filter((d) => reminder.days.includes(d.value))
    .map((d) => d.long)
    .join(' · ');

  return (
    <Card variant="glass" className="p-3.5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(reminder.id)}
          className={cn(
            'shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition',
            reminder.enabled
              ? 'bg-gradient-brand shadow-glow-brand text-white'
              : 'bg-bg-elevated border border-border text-text-muted',
          )}
          aria-label={reminder.enabled ? 'Desativar' : 'Ativar'}
        >
          {reminder.enabled ? <Bell size={15} /> : <BellOff size={15} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-display font-bold text-sm">{reminder.time}</span>
            <span className={cn('text-sm font-semibold truncate', !reminder.enabled && 'text-text-muted line-through')}>
              {reminder.label}
            </span>
          </div>
          <p className="text-[10px] text-text-muted">{daysShort}</p>
        </div>

        <button
          onClick={() => onRemove(reminder.id)}
          className="shrink-0 p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition"
          aria-label="Remover"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </Card>
  );
}

function CreateForm({
  onAdd,
  onCancel,
}: {
  onAdd: (data: Omit<Reminder, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState('Criar vídeo do dia');
  const [time, setTime] = useState('09:00');
  const [days, setDays] = useState<DayOfWeek[]>([1, 2, 3, 4, 5]);

  const toggleDay = (d: DayOfWeek) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const apply = (preset: typeof presets[number]) => {
    setLabel(preset.label);
    setTime(preset.time);
    setDays(preset.days);
  };

  const submit = () => {
    if (!label.trim() || days.length === 0) return;
    onAdd({ label: label.trim(), time, days, enabled: true });
  };

  return (
    <Card variant="glass" className="p-4 space-y-3">
      {/* presets */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-subtle mb-2">
          Sugestões
        </p>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => apply(p)}
              className="px-2.5 h-8 text-xs rounded-full bg-bg-elevated border border-border text-text-secondary hover:text-text-primary hover:border-brand-violet-400/40 transition"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-text-subtle">
            Lembrete
          </label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="mt-1 w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm placeholder:text-text-muted focus:border-brand-violet-400/50 outline-none"
            placeholder="Ex: Criar vídeo do dia"
          />
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-widest text-text-subtle">
            Horário
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 w-full h-10 px-3 rounded-xl bg-bg-elevated border border-border text-sm text-text-primary focus:border-brand-violet-400/50 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-text-subtle">
          Dias da semana
        </label>
        <div className="flex gap-1 mt-1.5">
          {dayLabels.map((d) => {
            const active = days.includes(d.value);
            return (
              <button
                key={d.value}
                onClick={() => toggleDay(d.value)}
                className={cn(
                  'flex-1 h-9 rounded-lg text-xs font-semibold transition',
                  active
                    ? 'bg-gradient-brand text-white shadow-glow-brand'
                    : 'bg-bg-elevated border border-border text-text-muted hover:text-text-primary',
                )}
              >
                {d.short}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button onClick={submit} leftIcon={<Check size={14} />} className="flex-1">
          Salvar lembrete
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </Card>
  );
}
