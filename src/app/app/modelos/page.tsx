'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  User,
  UserCircle,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChipGrid, ColorGrid } from '@/components/models/ChipGrid';
import {
  ageRanges,
  baseOutfits,
  builds,
  distinctMarks,
  ethnicities,
  expressions,
  eyeColors,
  hairColors,
  hairLengths,
  hairStyles,
  heights,
  makeups,
  skinTones,
  vibes,
} from '@/components/models/options';
import { buildModelPrompt, useModels, type Gender, type Model } from '@/lib/models-store';
import { cn } from '@/lib/utils';

type Step = 0 | 1 | 2 | 3;

const STEPS = [
  { id: 0, title: 'Identidade', desc: 'Quem é essa pessoa' },
  { id: 1, title: 'Físico', desc: 'Características corporais' },
  { id: 2, title: 'Estilo', desc: 'Personalidade visual' },
  { id: 3, title: 'Finalizar', desc: 'Nome e ajustes' },
];

const EMPTY: Omit<Model, 'id' | 'createdAt'> = {
  name: '',
  gender: 'feminino',
  ageRange: '25-35',
  ethnicity: 'brasileira',
  skinTone: 'medio',
  height: 'media',
  build: 'atletica',
  hairLength: 'médio',
  hairColor: 'castanho médio',
  hairStyle: 'ondulado',
  eyeColor: 'castanhos',
  distinctMarks: [],
  vibe: 'clean girl minimalista',
  expression: 'sorrindo de canto, natural',
  makeup: 'natural',
  baseOutfit: 'casual',
  extraDescription: '',
};

export default function ModelosPage() {
  const { items, save, remove, active, setActive } = useModels();
  const [editing, setEditing] = useState<Model | null>(null);
  const [creating, setCreating] = useState(false);

  if (editing || creating) {
    return (
      <ModelEditor
        initial={editing ?? null}
        onCancel={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSave={(data) => {
          const saved = save({ ...data, id: editing?.id });
          if (!active) setActive(saved.id);
          setEditing(null);
          setCreating(false);
        }}
      />
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Personagens reutilizáveis"
        title={
          <>
            Banco de <span className="text-gradient-brand">modelos</span>
          </>
        }
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={() => setCreating(true)}>
            Criar modelo
          </Button>
        }
      />

      <section className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        {/* Como funciona */}
        <Card variant="glass" className="p-4 mb-5 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-brand opacity-10 blur-2xl" />
          <div className="flex items-start gap-3 relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-brand shadow-glow-brand flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm mb-1">Como funciona</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Você monta um personagem aqui (cabelo, pele, estilo etc.) e o app gera um trecho de prompt.
                Quando você marca um modelo como ativo, todos os prompts copiados no <strong className="text-text-secondary">Lab de Imagens</strong> e <strong className="text-text-secondary">Lab de Vídeos</strong> já vêm com a descrição da pessoa colada no topo — mantém consistência total entre vídeos.
              </p>
            </div>
          </div>
        </Card>

        {items.length === 0 ? (
          <Card variant="glass" className="p-12 text-center">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-brand shadow-glow-brand flex items-center justify-center">
              <Users size={24} className="text-white" />
            </div>
            <h3 className="text-xl font-display font-bold mb-2">Nenhum modelo ainda</h3>
            <p className="text-sm text-text-muted mb-5 max-w-md mx-auto leading-relaxed">
              Crie seu primeiro modelo pra manter consistência de personagem entre todos os vídeos que você gerar.
            </p>
            <Button onClick={() => setCreating(true)} leftIcon={<Plus size={16} />}>
              Criar primeiro modelo
            </Button>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m, i) => {
              const isActive = active?.id === m.id;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card
                    variant="glass"
                    hoverable
                    className={cn(
                      'p-4 relative overflow-hidden',
                      isActive && 'border-brand-violet-400/60 shadow-glow-violet',
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-brand-soft opacity-30 pointer-events-none" />
                    )}

                    <div className="relative">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={cn(
                          'h-12 w-12 rounded-2xl flex items-center justify-center shrink-0',
                          isActive
                            ? 'bg-gradient-brand shadow-glow-brand'
                            : 'bg-bg-elevated border border-border',
                        )}>
                          <UserCircle size={22} className={isActive ? 'text-white' : 'text-text-muted'} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <h3 className="font-semibold truncate">{m.name || 'Sem nome'}</h3>
                            {isActive && (
                              <Star size={12} className="text-amber-300 fill-amber-300 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted">
                            {m.gender === 'feminino' ? 'F' : 'M'} · {m.ageRange} · {m.ethnicity}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge className="text-[9px] px-1.5 py-0">{m.hairColor}</Badge>
                        <Badge className="text-[9px] px-1.5 py-0">{m.eyeColor}</Badge>
                        <Badge className="text-[9px] px-1.5 py-0">{m.vibe.split(' ')[0]}</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-1">
                        {isActive ? (
                          <Badge variant="success" className="col-span-3 text-center justify-center text-[10px] py-1">
                            <Check size={11} /> Modelo ativo
                          </Badge>
                        ) : (
                          <button
                            onClick={() => setActive(m.id)}
                            className="col-span-3 h-7 rounded-lg bg-bg-elevated border border-border hover:border-brand-violet-400/40 text-[10px] font-semibold text-text-secondary hover:text-text-primary transition inline-flex items-center justify-center gap-1"
                          >
                            <Star size={10} /> Marcar como ativo
                          </button>
                        )}
                        <button
                          onClick={() => setEditing(m)}
                          className="h-7 col-span-2 rounded-lg bg-bg-elevated border border-border hover:border-brand-cyan-400/40 text-[10px] font-semibold text-text-secondary hover:text-text-primary transition mt-1"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remover ${m.name}?`)) remove(m.id);
                          }}
                          className="h-7 rounded-lg bg-bg-elevated border border-border text-text-muted hover:text-red-400 hover:border-red-400/40 transition mt-1 inline-flex items-center justify-center"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}

// ============= EDITOR =============

function ModelEditor({
  initial,
  onCancel,
  onSave,
}: {
  initial: Model | null;
  onCancel: () => void;
  onSave: (m: Omit<Model, 'id' | 'createdAt'>) => void;
}) {
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<Omit<Model, 'id' | 'createdAt'>>(
    initial
      ? {
          name: initial.name,
          gender: initial.gender,
          ageRange: initial.ageRange,
          ethnicity: initial.ethnicity,
          skinTone: initial.skinTone,
          height: initial.height,
          build: initial.build,
          hairLength: initial.hairLength,
          hairColor: initial.hairColor,
          hairStyle: initial.hairStyle,
          eyeColor: initial.eyeColor,
          distinctMarks: [...initial.distinctMarks],
          vibe: initial.vibe,
          expression: initial.expression,
          makeup: initial.makeup,
          baseOutfit: initial.baseOutfit,
          extraDescription: initial.extraDescription,
        }
      : EMPTY,
  );

  const set = <K extends keyof typeof data>(key: K, value: (typeof data)[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const previewPrompt = useMemo(
    () => buildModelPrompt({ ...(data as Model), id: 'preview', createdAt: '' }),
    [data],
  );

  const next = () => {
    if (step < 3) setStep((s) => (s + 1) as Step);
  };
  const back = () => {
    if (step > 0) setStep((s) => (s - 1) as Step);
  };

  const canSave = data.name.trim().length > 0;

  return (
    <>
      <PageHeader
        eyebrow={initial ? 'Editando modelo' : 'Novo modelo'}
        title={
          <>
            {initial ? data.name : 'Crie seu'}{' '}
            <span className="text-gradient-brand">personagem</span>
          </>
        }
        actions={
          <button
            onClick={onCancel}
            className="h-10 px-4 rounded-xl bg-bg-elevated border border-border text-sm text-text-secondary hover:text-text-primary transition"
          >
            Cancelar
          </button>
        }
      />

      {/* Progress steps */}
      <div className="px-4 md:px-8 py-4 border-b border-border-subtle sticky top-16 z-20 bg-bg/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto flex items-center gap-1.5 md:gap-3 overflow-x-auto scrollbar-hide">
          {STEPS.map((s, i) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <button
                key={s.id}
                onClick={() => setStep(s.id as Step)}
                className={cn(
                  'shrink-0 flex items-center gap-2 px-3 h-9 rounded-full text-xs font-medium transition border',
                  active
                    ? 'bg-gradient-brand text-white border-transparent shadow-glow-brand'
                    : done
                    ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200'
                    : 'bg-bg-elevated border-border text-text-muted hover:text-text-primary',
                )}
              >
                <span className={cn(
                  'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                  active ? 'bg-white/20' : done ? 'bg-emerald-500/30' : 'bg-bg',
                )}>
                  {done ? <Check size={11} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 md:px-8 py-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                {step === 0 && (
                  <Card variant="glass" className="p-5 space-y-5">
                    <h2 className="font-display font-bold text-lg">Identidade básica</h2>

                    <Field label="Gênero">
                      <ChipGrid
                        options={[
                          { value: 'feminino', label: 'Feminino', emoji: '👩' },
                          { value: 'masculino', label: 'Masculino', emoji: '👨' },
                        ]}
                        value={data.gender}
                        onChange={(v) => set('gender', v as Gender)}
                        cols={2}
                      />
                    </Field>

                    <Field label="Faixa etária">
                      <ChipGrid
                        options={ageRanges}
                        value={data.ageRange}
                        onChange={(v) => set('ageRange', v as string)}
                        cols={5}
                      />
                    </Field>

                    <Field label="Etnia">
                      <ChipGrid
                        options={ethnicities}
                        value={data.ethnicity}
                        onChange={(v) => set('ethnicity', v as string)}
                        cols={4}
                      />
                    </Field>

                    <Field label="Tom de pele">
                      <ColorGrid
                        options={skinTones}
                        value={data.skinTone}
                        onChange={(v) => set('skinTone', v)}
                        cols={6}
                      />
                    </Field>
                  </Card>
                )}

                {step === 1 && (
                  <Card variant="glass" className="p-5 space-y-5">
                    <h2 className="font-display font-bold text-lg">Características físicas</h2>

                    <Field label="Altura">
                      <ChipGrid
                        options={heights}
                        value={data.height}
                        onChange={(v) => set('height', v as string)}
                        cols={3}
                      />
                    </Field>

                    <Field label="Constituição">
                      <ChipGrid
                        options={builds}
                        value={data.build}
                        onChange={(v) => set('build', v as string)}
                        cols={5}
                      />
                    </Field>

                    <Field label="Comprimento do cabelo">
                      <ChipGrid
                        options={hairLengths}
                        value={data.hairLength}
                        onChange={(v) => set('hairLength', v as string)}
                        cols={3}
                      />
                    </Field>

                    <Field label="Cor do cabelo">
                      <ColorGrid
                        options={hairColors}
                        value={data.hairColor}
                        onChange={(v) => set('hairColor', v)}
                        cols={5}
                      />
                    </Field>

                    <Field label="Tipo de cabelo">
                      <ChipGrid
                        options={hairStyles}
                        value={data.hairStyle}
                        onChange={(v) => set('hairStyle', v as string)}
                        cols={4}
                      />
                    </Field>

                    <Field label="Cor dos olhos">
                      <ColorGrid
                        options={eyeColors}
                        value={data.eyeColor}
                        onChange={(v) => set('eyeColor', v)}
                        cols={6}
                      />
                    </Field>

                    <Field
                      label="Marcas distintas"
                      hint="Selecione todas que se aplicam (opcional)"
                    >
                      <ChipGrid
                        options={distinctMarks}
                        value={data.distinctMarks}
                        onChange={(v) => set('distinctMarks', v as string[])}
                        multi
                        cols={3}
                      />
                    </Field>
                  </Card>
                )}

                {step === 2 && (
                  <Card variant="glass" className="p-5 space-y-5">
                    <h2 className="font-display font-bold text-lg">Estilo & personalidade</h2>

                    <Field label="Vibe / estética">
                      <ChipGrid
                        options={vibes}
                        value={data.vibe}
                        onChange={(v) => set('vibe', v as string)}
                        cols={4}
                      />
                    </Field>

                    <Field label="Expressão padrão">
                      <ChipGrid
                        options={expressions}
                        value={data.expression}
                        onChange={(v) => set('expression', v as string)}
                        cols={3}
                      />
                    </Field>

                    <Field label="Maquiagem">
                      <ChipGrid
                        options={makeups}
                        value={data.makeup}
                        onChange={(v) => set('makeup', v as string)}
                        cols={3}
                      />
                    </Field>

                    <Field label="Roupa base">
                      <ChipGrid
                        options={baseOutfits}
                        value={data.baseOutfit}
                        onChange={(v) => set('baseOutfit', v as string)}
                        cols={4}
                      />
                    </Field>
                  </Card>
                )}

                {step === 3 && (
                  <Card variant="glass" className="p-5 space-y-5">
                    <h2 className="font-display font-bold text-lg">Finalizar</h2>

                    <Field label="Nome do modelo" required>
                      <input
                        value={data.name}
                        onChange={(e) => set('name', e.target.value)}
                        placeholder="Ex: Joana ruiva, Camila fitness, Marcos executivo..."
                        className="w-full h-11 px-3 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none"
                      />
                    </Field>

                    <Field
                      label="Detalhes extras (opcional)"
                      hint="Adicione algo único que não foi coberto acima — acessórios, hábitos visuais, etc."
                    >
                      <textarea
                        value={data.extraDescription}
                        onChange={(e) => set('extraDescription', e.target.value)}
                        rows={4}
                        placeholder='Ex: "usa sempre brincos de argola dourados e esmalte vermelho"'
                        className="w-full px-3 py-2 rounded-xl bg-bg-elevated border border-border text-sm focus:border-brand-violet-400/50 outline-none resize-none"
                      />
                    </Field>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        type="button"
                        size="lg"
                        onClick={() => onSave(data)}
                        disabled={!canSave}
                        leftIcon={<Save size={16} />}
                        className="flex-1"
                      >
                        {initial ? 'Atualizar modelo' : 'Salvar modelo'}
                      </Button>
                      {!canSave && (
                        <p className="text-[11px] text-amber-300 self-center">Preencha um nome pra salvar</p>
                      )}
                    </div>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Nav */}
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="ghost"
                onClick={back}
                disabled={step === 0}
                leftIcon={<ArrowLeft size={14} />}
              >
                Anterior
              </Button>
              {step < 3 && (
                <Button onClick={next} rightIcon={<ArrowRight size={14} />}>
                  Próximo
                </Button>
              )}
            </div>
          </div>

          {/* Preview lateral */}
          <aside className="lg:sticky lg:top-32 self-start">
            <Card variant="glass" className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                  <User size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-brand-cyan-300 font-bold">Preview</p>
                  <h4 className="font-display font-bold text-sm leading-tight">Prompt do personagem</h4>
                </div>
              </div>

              <div className="rounded-xl bg-bg-elevated border border-border p-3 mb-3 max-h-[300px] overflow-y-auto">
                <p className="text-xs leading-relaxed text-text-secondary font-mono whitespace-pre-wrap">
                  {previewPrompt}
                </p>
              </div>

              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(previewPrompt);
                  } catch {
                    /* ignore */
                  }
                }}
                className="w-full h-9 rounded-xl bg-bg-elevated border border-border text-xs font-semibold text-text-secondary hover:text-text-primary hover:border-brand-cyan-400/40 transition inline-flex items-center justify-center gap-1.5"
              >
                <Copy size={12} />
                Copiar prompt do personagem
              </button>

              <p className="text-[10px] text-text-subtle mt-3 leading-relaxed">
                Esse trecho será automaticamente colado no início de qualquer prompt de imagem ou vídeo que você copiar no app.
              </p>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <label className="text-xs font-semibold text-text-secondary">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {hint && <span className="text-[10px] text-text-subtle">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
