// Opções clicáveis do wizard. Centralizado pra facilitar adicionar/remover.

export type ChipOption = {
  value: string;
  label: string;
  emoji?: string;
};

export const ageRanges: ChipOption[] = [
  { value: '18-25', label: '18–25', emoji: '✨' },
  { value: '25-35', label: '25–35', emoji: '🌟' },
  { value: '35-45', label: '35–45', emoji: '💫' },
  { value: '45-55', label: '45–55', emoji: '⭐' },
  { value: '55+', label: '55+', emoji: '🌠' },
];

export const ethnicities: ChipOption[] = [
  { value: 'brasileira', label: 'Brasileira' },
  { value: 'latina', label: 'Latina' },
  { value: 'caucasiana', label: 'Caucasiana' },
  { value: 'negra', label: 'Negra' },
  { value: 'asiática', label: 'Asiática' },
  { value: 'parda', label: 'Parda' },
  { value: 'indígena', label: 'Indígena' },
  { value: 'mestiça', label: 'Mestiça' },
];

export const skinTones: { value: string; label: string; color: string }[] = [
  { value: 'porcelana', label: 'Porcelana', color: '#F4DCC9' },
  { value: 'claro',     label: 'Claro',     color: '#E8C6A8' },
  { value: 'medio',     label: 'Médio',     color: '#D4A07A' },
  { value: 'oliva',     label: 'Oliva',     color: '#B8845A' },
  { value: 'moreno',    label: 'Moreno',    color: '#8B5A3C' },
  { value: 'escuro',    label: 'Escuro',    color: '#5C3520' },
];

export const heights: ChipOption[] = [
  { value: 'baixa', label: 'Baixa', emoji: '📏' },
  { value: 'media', label: 'Média', emoji: '📐' },
  { value: 'alta', label: 'Alta', emoji: '📊' },
];

export const builds: ChipOption[] = [
  { value: 'magra', label: 'Magra', emoji: '🌿' },
  { value: 'atletica', label: 'Atlética', emoji: '💪' },
  { value: 'curvilinea', label: 'Curvilínea', emoji: '🌸' },
  { value: 'plus', label: 'Plus size', emoji: '🌺' },
  { value: 'musculosa', label: 'Musculosa', emoji: '🔥' },
];

export const hairLengths: ChipOption[] = [
  { value: 'curto', label: 'Curto' },
  { value: 'médio', label: 'Médio' },
  { value: 'longo', label: 'Longo' },
];

export const hairColors: { value: string; label: string; color: string }[] = [
  { value: 'preto', label: 'Preto', color: '#1A1A1A' },
  { value: 'castanho escuro', label: 'Castanho escuro', color: '#3D2817' },
  { value: 'castanho médio', label: 'Castanho médio', color: '#6B4226' },
  { value: 'castanho claro', label: 'Castanho claro', color: '#A0744A' },
  { value: 'loiro escuro', label: 'Loiro escuro', color: '#B5895A' },
  { value: 'loiro', label: 'Loiro', color: '#E0BC7E' },
  { value: 'loiro platinado', label: 'Platinado', color: '#F5E6C8' },
  { value: 'ruivo', label: 'Ruivo', color: '#B5532A' },
  { value: 'grisalho', label: 'Grisalho', color: '#8E8E8E' },
  { value: 'colorido', label: 'Colorido', color: 'linear-gradient(135deg,#EC4899,#8B5CF6,#22D3EE)' },
];

export const hairStyles: ChipOption[] = [
  { value: 'liso', label: 'Liso', emoji: '〰️' },
  { value: 'ondulado', label: 'Ondulado', emoji: '🌊' },
  { value: 'cacheado', label: 'Cacheado', emoji: '🌀' },
  { value: 'crespo', label: 'Crespo', emoji: '☁️' },
];

export const eyeColors: { value: string; label: string; color: string }[] = [
  { value: 'castanhos', label: 'Castanhos', color: '#6B4226' },
  { value: 'pretos', label: 'Pretos', color: '#1A1A1A' },
  { value: 'mel', label: 'Mel', color: '#C99756' },
  { value: 'verdes', label: 'Verdes', color: '#4A7C59' },
  { value: 'azuis', label: 'Azuis', color: '#3B7DBF' },
  { value: 'cinzas', label: 'Cinzas', color: '#7A8898' },
];

export const distinctMarks: ChipOption[] = [
  { value: 'sardas no rosto', label: 'Sardas', emoji: '✨' },
  { value: 'pinta marcante no rosto', label: 'Pinta no rosto', emoji: '·' },
  { value: 'tatuagens visíveis', label: 'Tatuagens', emoji: '🖋️' },
  { value: 'piercing no nariz', label: 'Piercing nariz', emoji: '💎' },
  { value: 'piercing na orelha', label: 'Piercing orelha', emoji: '🪩' },
  { value: 'usa óculos de grau', label: 'Óculos', emoji: '👓' },
  { value: 'barba aparada', label: 'Barba', emoji: '🧔' },
  { value: 'sobrancelhas marcadas', label: 'Sobrancelhas marcadas', emoji: '👁️' },
  { value: 'marquinhas de fita de biquíni na pele', label: 'Marca de biquíni', emoji: '👙' },
  { value: 'unhas longas decoradas', label: 'Unhas decoradas', emoji: '💅' },
  { value: 'dentes alinhados e brancos', label: 'Sorriso branco', emoji: '😁' },
];

export const vibes: ChipOption[] = [
  { value: 'clean girl minimalista', label: 'Clean girl', emoji: '🤍' },
  { value: 'old money elegante', label: 'Old money', emoji: '🏛️' },
  { value: 'y2k vibrante', label: 'Y2K', emoji: '🦋' },
  { value: 'esportiva fitness', label: 'Fitness', emoji: '🏋️' },
  { value: 'executiva profissional', label: 'Executiva', emoji: '💼' },
  { value: 'cottagecore romântica', label: 'Cottagecore', emoji: '🌷' },
  { value: 'alternativa rocker', label: 'Alternativa', emoji: '🖤' },
  { value: 'streetwear urbana', label: 'Streetwear', emoji: '👟' },
  { value: 'boho hippie', label: 'Boho', emoji: '🌻' },
  { value: 'glamour luxo', label: 'Glamour', emoji: '💎' },
  { value: 'praiana surf', label: 'Praiana', emoji: '🏖️' },
  { value: 'kawaii fofa', label: 'Kawaii', emoji: '🎀' },
];

export const expressions: ChipOption[] = [
  { value: 'sorrindo de canto, natural', label: 'Sorriso de canto', emoji: '😏' },
  { value: 'sorriso aberto, alegre', label: 'Sorriso aberto', emoji: '😄' },
  { value: 'neutra, séria', label: 'Neutra', emoji: '😐' },
  { value: 'empolgada, surpresa positiva', label: 'Empolgada', emoji: '🤩' },
  { value: 'pensativa, introspectiva', label: 'Pensativa', emoji: '🤔' },
  { value: 'confiante, segura', label: 'Confiante', emoji: '😎' },
];

export const makeups: ChipOption[] = [
  { value: 'natural', label: 'Natural', emoji: '🌿' },
  { value: 'marcada', label: 'Marcada', emoji: '💄' },
  { value: 'sem', label: 'Sem maquiagem', emoji: '🫧' },
];

export const baseOutfits: ChipOption[] = [
  { value: 'casual', label: 'Casual', emoji: '👕' },
  { value: 'social', label: 'Social', emoji: '👔' },
  { value: 'esportivo', label: 'Esportivo', emoji: '🩳' },
  { value: 'intimo-produto', label: 'Roupa de produto', emoji: '🛍️' },
];
