'use client';

import { useCallback, useEffect, useState } from 'react';

export type Gender = 'feminino' | 'masculino';

export type Model = {
  id: string;
  name: string;
  createdAt: string;

  // Identidade
  gender: Gender;
  ageRange: string;      // "18-25" | "25-35" ...
  ethnicity: string;     // "brasileira" | "latina" | ...
  skinTone: string;      // "porcelana" | "claro" | "medio" | "oliva" | "moreno" | "escuro"

  // Físico
  height: string;        // "baixa" | "media" | "alta"
  build: string;         // "magra" | "atletica" | ...
  hairLength: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  distinctMarks: string[]; // tags

  // Estilo
  vibe: string;          // "clean girl" | "old money" | ...
  expression: string;    // "sorrindo" | "neutra" | ...
  makeup: string;        // "natural" | "marcada" | "sem"
  baseOutfit: string;    // "casual" | "social" | ...

  // Extra
  extraDescription: string;
};

const STORAGE_KEY = 'influlab.models.v1';
const ACTIVE_KEY = 'influlab.models.active';

function read(): Model[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Model[]) : [];
  } catch {
    return [];
  }
}

function write(items: Model[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('influlab:models-changed'));
}

function readActive(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ACTIVE_KEY);
}

function writeActive(id: string | null) {
  if (typeof window === 'undefined') return;
  if (id) window.localStorage.setItem(ACTIVE_KEY, id);
  else window.localStorage.removeItem(ACTIVE_KEY);
  window.dispatchEvent(new CustomEvent('influlab:models-active-changed'));
}

export function useModels() {
  const [items, setItems] = useState<Model[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);

  useEffect(() => {
    setItems(read());
    setActiveIdState(readActive());

    const refresh = () => {
      setItems(read());
      setActiveIdState(readActive());
    };
    window.addEventListener('influlab:models-changed', refresh);
    window.addEventListener('influlab:models-active-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('influlab:models-changed', refresh);
      window.removeEventListener('influlab:models-active-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const save = useCallback((model: Omit<Model, 'id' | 'createdAt'> & { id?: string }) => {
    const list = read();
    if (model.id) {
      const idx = list.findIndex((m) => m.id === model.id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...model } as Model;
        write(list);
        return list[idx];
      }
    }
    const created: Model = {
      ...model,
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    write([created, ...list]);
    return created;
  }, []);

  const remove = useCallback((id: string) => {
    const next = read().filter((m) => m.id !== id);
    write(next);
    if (readActive() === id) writeActive(null);
  }, []);

  const setActive = useCallback((id: string | null) => {
    writeActive(id);
    setActiveIdState(id);
  }, []);

  const active = items.find((m) => m.id === activeId) ?? null;

  return { items, save, remove, active, activeId, setActive };
}

// ============= Gerador de prompt =============

const ARTICLE: Record<Gender, string> = {
  feminino: 'mulher',
  masculino: 'homem',
};

const SKIN_TONE_LABEL: Record<string, string> = {
  porcelana: 'pele muito clara, tipo porcelana',
  claro: 'pele clara',
  medio: 'pele média',
  oliva: 'pele oliva',
  moreno: 'pele morena',
  escuro: 'pele escura',
};

const BUILD_LABEL: Record<string, string> = {
  magra: 'corpo magro',
  atletica: 'corpo atlético',
  curvilinea: 'corpo curvilíneo',
  plus: 'corpo plus size',
  musculosa: 'corpo musculoso',
};

const HEIGHT_LABEL: Record<string, string> = {
  baixa: 'estatura baixa',
  media: 'estatura média',
  alta: 'estatura alta',
};

/**
 * Descrição APENAS do personagem (físico, estilo, identidade).
 * Não inclui cenário, enquadramento ou roupa específica — pra poder colar
 * em qualquer prompt de cena/produto sem conflitar.
 */
export function buildModelPrompt(m: Model): string {
  if (!m) return '';
  const parts: string[] = [];

  const subject = ARTICLE[m.gender];
  parts.push(`${subject} ${m.ethnicity} de ${m.ageRange} anos`);

  if (m.skinTone) parts.push(SKIN_TONE_LABEL[m.skinTone] ?? m.skinTone);
  if (m.height) parts.push(HEIGHT_LABEL[m.height] ?? m.height);
  if (m.build) parts.push(BUILD_LABEL[m.build] ?? m.build);

  if (m.hairColor || m.hairLength || m.hairStyle) {
    const hair = [m.hairLength, m.hairStyle, m.hairColor].filter(Boolean).join(' ');
    parts.push(`cabelo ${hair}`);
  }

  if (m.eyeColor) parts.push(`olhos ${m.eyeColor}`);

  if (m.distinctMarks.length > 0) {
    parts.push(`com ${m.distinctMarks.join(', ')}`);
  }

  if (m.vibe) parts.push(`estética ${m.vibe}`);
  if (m.expression) parts.push(`expressão ${m.expression}`);
  if (m.makeup) {
    const map: Record<string, string> = {
      natural: 'maquiagem natural',
      marcada: 'maquiagem marcada',
      sem: 'sem maquiagem',
    };
    parts.push(map[m.makeup] ?? m.makeup);
  }

  let text = parts.join(', ') + '.';
  if (m.extraDescription.trim()) {
    text += ' ' + m.extraDescription.trim();
    if (!text.endsWith('.')) text += '.';
  }
  text += ' Sempre a mesma pessoa em todas as imagens e vídeos, consistência total de traços faciais e corpo.';

  return text;
}

/**
 * Prompt da FOTO-BASE do personagem: imagem vertical 9:16 (TikTok),
 * blusa branca básica, fundo neutro liso, estilo lookbook/book de modelo.
 * É a "foto-mãe" — depois o aluno gera variações com produtos e cenários.
 */
export function buildModelBasePrompt(m: Model): string {
  if (!m) return '';
  const persona = buildModelPrompt(m);

  const scene = [
    'Foto retrato vertical 9:16 (formato TikTok / Reels), resolução alta.',
    'Roupa: blusa básica branca de algodão, gola simples, sem estampas, sem logotipos.',
    'Fundo: estúdio fotográfico, fundo liso (branco puro OU preto absoluto, sólido, sem textura, sem objetos, sem cenário).',
    'Enquadramento: meio-corpo (do quadril pra cima), pessoa centralizada, olhando levemente para a câmera.',
    'Iluminação: luz suave de estúdio, difusa, sem sombras duras, tom natural de pele.',
    'Estilo: fotografia editorial profissional, estilo lookbook / book de modelo, hiper-realista, foco nítido no rosto.',
    'IMPORTANTE: nenhum elemento adicional na cena — é a foto-base/referência do personagem para gerar variações depois.',
  ].join(' ');

  return `${persona}\n\n${scene}`;
}

/** Anexa a descrição do personagem (sem cenário) antes de um prompt de cena. */
export function withModelPrompt(basePrompt: string, model: Model | null): string {
  if (!model) return basePrompt;
  const persona = buildModelPrompt(model);
  return `PERSONAGEM: ${persona}\n\nCENA: ${basePrompt}`;
}
