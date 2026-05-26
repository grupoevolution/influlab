'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Calculator,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  MoreHorizontal,
  Plus,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  addDaysISO,
  getWeekDates,
  todayISO,
  useCalendar,
  type CalendarItem,
} from '@/lib/calendar-store';
import { calcularProjecao, useGoal } from '@/lib/goal-store';
import { useProducts } from '@/lib/api/client';
import { cn, formatCurrency } from '@/lib/utils';

const weekDayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export default function AgendaPage() {
  const { items, add, reschedule, togglePosted, remove } = useCalendar();
  const { goal } = useGoal();
  const [weekOffset, setWeekOffset] = useState(0); // 0=esta semana, 1=próxima
  const [addOpen, setAddOpen] = useState(false);
  const [addDate, setAddDate] = useState<string>(todayISO());

  // Datas da semana visível
  const weekDates = useMemo(() => {
    const ref = new Date();
    ref.setDate(ref.getDate() + weekOffset * 7);
    return getWeekDates(ref);
  }, [weekOffset]);

  const today = todayISO();
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  // Meta da semana = posts/dia/conta * contas * 7
  const weeklyGoal = goal.contas * goal.postsPorDia * 7;

  // Postados nessa semana
  const postedThisWeek = items.filter(
    (i) => i.posted && i.scheduledDate >= weekStart && i.scheduledDate <= weekEnd,
  ).length;

  // Agendados (não postados) nessa semana
  const scheduledThisWeek = items.filter(
    (i) => !i.posted && i.scheduledDate >= weekStart && i.scheduledDate <= weekEnd,
  ).length;

  const weekProgressPct = Math.min(100, weeklyGoal === 0 ? 0 : (postedThisWeek / weeklyGoal) * 100);

  // Faturamento do mês corrente — usa cenário moderado da calculadora
  const monthPrefix = today.slice(0, 7);
  const postedThisMonth = items.filter((i) => i.posted && i.scheduledDate.startsWith(monthPrefix)).length;
  const projection = calcularProjecao(goal);
  const monthGoal = projection.cenarios[1].comissao; // moderado
  // Estimativa de faturamento baseada na proporção de posts realizados vs. esperados
  const expectedPostsMonth = projection.postsMes;
  const ratio = expectedPostsMonth > 0 ? Math.min(1, postedThisMonth / expectedPostsMonth) : 0;
  const monthRevenue = monthGoal * ratio;
  const monthGoalProgress = Math.min(100, ratio * 100);

  const openAdd = (date: string) => {
    setAddDate(date);
    setAddOpen(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Sua agenda de criação"
        title={
          <>
            Agenda <span className="text-gradient-brand">de conteúdo</span>
          </>
        }
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={() => openAdd(today)}>
            Adicionar
          </Button>
        }
      />

      <section className="px-3 md:px-8 py-6 space-y-5">
        <div className="max-w-5xl mx-auto space-y-5">
          {/* Meta de faturamento mensal */}
          <Card variant="glass" className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-brand-soft opacity-50 pointer-events-none" />
            <div className="relative p-4 md:p-5">
              <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-cyan-300 mb-0.5 inline-flex items-center gap-1.5">
                    <Target size={11} /> Meta mensal
                  </p>
                  <p className="text-lg md:text-2xl font-display font-bold leading-tight">
                    {formatCurrency(monthRevenue)} <span className="text-text-muted text-sm font-normal">de {formatCurrency(monthGoal)}</span>
                  </p>
                </div>
                <Link href="/app/calculadora">
                  <Button variant="secondary" size="sm" leftIcon={<Calculator size={13} />}>
                    Ajustar meta
                  </Button>
                </Link>
              </div>

              {/* Progresso */}
              <div className="relative h-3 rounded-full bg-bg-elevated overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-brand shadow-glow-brand"
                  initial={{ width: 0 }}
                  animate={{ width: `${monthGoalProgress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-[11px] text-text-muted">
                <span>{postedThisMonth} vídeos postados este mês</span>
                <span className="font-semibold text-text-secondary">{Math.round(monthGoalProgress)}%</span>
              </div>
            </div>
          </Card>

          {/* Meta semanal */}
          <Card variant="glass" className="p-4 md:p-5">
            <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-violet-300 mb-0.5 inline-flex items-center gap-1.5">
                  <Flame size={11} /> Meta da semana
                </p>
                <p className="text-base md:text-xl font-display font-bold leading-tight">
                  {postedThisWeek} de {weeklyGoal} vídeos postados
                </p>
              </div>
              {scheduledThisWeek > 0 && (
                <Badge variant="cyan" className="text-[10px]">
                  {scheduledThisWeek} agendados
                </Badge>
              )}
            </div>
            <div className="relative h-2 rounded-full bg-bg-elevated overflow-hidden">
              <motion.div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full',
                  postedThisWeek >= weeklyGoal ? 'bg-emerald-400' : 'bg-gradient-brand',
                )}
                initial={{ width: 0 }}
                animate={{ width: `${weekProgressPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[11px] text-text-muted mt-2">
              {postedThisWeek >= weeklyGoal
                ? '🎉 Meta da semana batida! Continue assim.'
                : `Faltam ${weeklyGoal - postedThisWeek} vídeos pra bater a meta da semana.`}
            </p>
          </Card>

          {/* Navegação de semana */}
          <div className="flex items-center justify-between gap-2 px-1">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="inline-flex items-center gap-1 h-9 px-3 rounded-xl bg-bg-elevated border border-border text-xs text-text-secondary hover:text-text-primary hover:border-brand-violet-400/30 transition"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-text-muted">Semana</p>
              <p className="text-sm font-display font-bold">
                {weekOffset === 0
                  ? 'Atual'
                  : weekOffset === 1
                  ? 'Próxima'
                  : weekOffset === -1
                  ? 'Anterior'
                  : `${weekOffset > 0 ? '+' : ''}${weekOffset}`}
              </p>
            </div>

            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="inline-flex items-center gap-1 h-9 px-3 rounded-xl bg-bg-elevated border border-border text-xs text-text-secondary hover:text-text-primary hover:border-brand-violet-400/30 transition"
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Grid da semana */}
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-7">
            {weekDates.map((date, idx) => {
              const dayItems = items.filter((i) => i.scheduledDate === date);
              const isToday = date === today;
              const isPast = date < today;
              const d = new Date(date + 'T12:00:00');
              const dayNum = d.getDate();
              const dayPosted = dayItems.filter((i) => i.posted).length;
              const dayPlanned = dayItems.length;

              return (
                <div
                  key={date}
                  className={cn(
                    'relative rounded-2xl border transition',
                    isToday
                      ? 'border-brand-violet-400/50 bg-gradient-brand-soft shadow-glow-violet'
                      : 'border-border-subtle bg-bg-surface/40',
                  )}
                >
                  <div className="p-2.5 border-b border-border-subtle flex items-center justify-between">
                    <div>
                      <p className={cn('text-[10px] font-semibold uppercase tracking-widest', isToday ? 'text-brand-cyan-300' : 'text-text-muted')}>
                        {weekDayLabels[idx]}
                      </p>
                      <p className={cn('text-lg font-display font-bold leading-none', isToday ? 'text-text-primary' : isPast ? 'text-text-muted' : 'text-text-primary')}>
                        {dayNum}
                      </p>
                    </div>
                    {dayPlanned > 0 && (
                      <div className="text-right">
                        <p className="text-[10px] text-text-muted">
                          {dayPosted}/{dayPlanned}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-2 space-y-1.5 min-h-[110px]">
                    <AnimatePresence>
                      {dayItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                        >
                          <ItemCard
                            item={item}
                            onTogglePosted={togglePosted}
                            onRemove={remove}
                            onReschedule={reschedule}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    <button
                      onClick={() => openAdd(date)}
                      className="w-full h-8 rounded-lg border border-dashed border-border text-text-muted hover:text-brand-cyan-300 hover:border-brand-cyan-400/40 transition inline-flex items-center justify-center gap-1 text-[11px]"
                    >
                      <Plus size={11} />
                      Adicionar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <AddToCalendarModal
        open={addOpen}
        date={addDate}
        onClose={() => setAddOpen(false)}
        onAdd={(data) => {
          add(data);
          setAddOpen(false);
        }}
        onDateChange={setAddDate}
      />
    </>
  );
}

function ItemCard({
  item,
  onTogglePosted,
  onRemove,
  onReschedule,
}: {
  item: CalendarItem;
  onTogglePosted: (id: string) => void;
  onRemove: (id: string) => void;
  onReschedule: (id: string, date: string) => void;
}) {
  const [menu, setMenu] = useState(false);

  return (
    <div
      className={cn(
        'relative rounded-lg border p-1.5 transition',
        item.posted
          ? 'bg-emerald-500/10 border-emerald-400/30'
          : 'bg-bg-elevated border-border',
      )}
    >
      <div className="flex items-center gap-1.5">
        {item.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={item.productName}
            className={cn('h-8 w-8 rounded-md object-cover shrink-0', item.posted && 'opacity-70')}
          />
        )}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-[10px] font-semibold leading-tight line-clamp-2',
              item.posted && 'line-through text-text-muted',
            )}
          >
            {item.productName}
          </p>
        </div>
        <button
          onClick={() => setMenu(!menu)}
          className="shrink-0 p-1 rounded-md text-text-muted hover:text-text-primary"
          aria-label="Op\u00e7\u00f5es"
        >
          <MoreHorizontal size={12} />
        </button>
      </div>

      <button
        onClick={() => onTogglePosted(item.id)}
        className={cn(
          'mt-1.5 w-full h-6 rounded-md text-[10px] font-semibold inline-flex items-center justify-center gap-1 transition',
          item.posted
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
            : 'bg-gradient-brand text-white hover:brightness-110',
        )}
      >
        {item.posted ? (
          <>
            <CheckCircle2 size={11} /> Postado
          </>
        ) : (
          <>
            <Check size={11} /> Marcar postado
          </>
        )}
      </button>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute right-1 top-7 z-30 w-40 rounded-lg glass-strong p-1 shadow-glow-violet"
            onMouseLeave={() => setMenu(false)}
          >
            <button
              onClick={() => {
                onReschedule(item.id, addDaysISO(item.scheduledDate, 1));
                setMenu(false);
              }}
              className="w-full text-left px-2 py-1 rounded-md text-[11px] text-text-secondary hover:text-text-primary hover:bg-white/5"
            >
              Mover +1 dia
            </button>
            <button
              onClick={() => {
                onReschedule(item.id, addDaysISO(item.scheduledDate, 7));
                setMenu(false);
              }}
              className="w-full text-left px-2 py-1 rounded-md text-[11px] text-text-secondary hover:text-text-primary hover:bg-white/5"
            >
              Mover +1 semana
            </button>
            <div className="h-px bg-border my-1" />
            <button
              onClick={() => {
                onRemove(item.id);
                setMenu(false);
              }}
              className="w-full text-left px-2 py-1 rounded-md text-[11px] text-red-400 hover:bg-red-500/10 inline-flex items-center gap-1.5"
            >
              <Trash2 size={11} /> Remover
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddToCalendarModal({
  open,
  date,
  onClose,
  onAdd,
  onDateChange,
}: {
  open: boolean;
  date: string;
  onClose: () => void;
  onAdd: (data: Omit<CalendarItem, 'id' | 'createdAt' | 'posted'>) => void;
  onDateChange: (d: string) => void;
}) {
  const { data: championProducts } = useProducts();

  const handleAdd = (productId: string) => {
    const p = championProducts.find((x) => x.id === productId);
    if (!p) return;
    onAdd({
      productId: p.id,
      productName: p.name,
      image: p.image,
      niche: p.niche,
      scheduledDate: date,
    });
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="lg">
      <div className="p-5 md:p-7">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-brand shadow-glow-brand flex items-center justify-center">
            <CalendarDays size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-display font-bold leading-tight">Agendar produto</h2>
            <p className="text-xs text-text-muted">Escolha o dia e o produto</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-text-subtle">
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="mt-1 w-full h-11 px-3 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none"
          />
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-subtle mb-2">
          Produto
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto pr-1">
          {championProducts.map((p) => (
            <button
              key={p.id}
              onClick={() => handleAdd(p.id)}
              className="text-left group rounded-xl overflow-hidden border border-border bg-bg-elevated hover:border-brand-violet-400/40 transition active:scale-[0.98]"
            >
              <div className="relative aspect-[4/3] bg-bg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.name}
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="p-2">
                <Badge variant="brand" className="text-[9px] px-1.5 py-0 mb-1">
                  {p.niche}
                </Badge>
                <p className="text-[11px] font-semibold leading-tight line-clamp-2">{p.name}</p>
              </div>
            </button>
          ))}
        </div>

        <Button variant="ghost" className="w-full mt-4" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </Modal>
  );
}
