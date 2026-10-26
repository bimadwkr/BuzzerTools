import { ProviderConfig, GeneratedComment, GenerationResult } from './ai/types';

export interface Preset {
  id: string;
  name: string;
  description: string;
  platform: string;
  intent: string;
  tone: string;
  capitalization: string;
  length: string;
  language: string;
  variationsCount: number;
}

const STORAGE_KEYS = {
  PROVIDERS: 'buzzer_providers_config',
  DEFAULT_PROVIDER: 'buzzer_default_provider',
  HISTORY: 'buzzer_history',
  FAVORITES: 'buzzer_favorites',
  PRESETS: 'buzzer_presets',
};

export const DEFAULT_PRESETS: Preset[] = [
  {
    id: '1',
    name: 'Reddit Casual Reply',
    description: 'Friendly, casual tone with contractions and no emojis, perfect for Reddit discussions.',
    platform: 'Reddit',
    intent: 'Agree and Add Value',
    tone: 'Casual',
    capitalization: 'Normal capitalization',
    length: 'Medium: 25–60 words',
    language: 'English',
    variationsCount: 3,
  },
  {
    id: '2',
    name: 'Quora Helpful Answer',
    description: 'Detailed, analytical, and structured response providing clear insight.',
    platform: 'Quora',
    intent: 'Provide a Helpful Answer',
    tone: 'Analytical',
    capitalization: 'Normal capitalization',
    length: 'Long: 60–120 words',
    language: 'English',
    variationsCount: 3,
  },
  {
    id: '3',
    name: 'Threads Conversation Starter',
    description: 'Short, engaging, thought-provoking reaction to kick off discussions on Threads.',
    platform: 'Threads',
    intent: 'Ask a Thoughtful Question',
    tone: 'Curious',
    capitalization: 'all lowercase',
    length: 'Short: 10–25 words',
    language: 'English',
    variationsCount: 3,
  },
  {
    id: '4',
    name: 'X Concise Insight',
    description: 'Punchy, direct, minimal punctuation comment optimized for X (Twitter).',
    platform: 'X / Twitter',
    intent: 'Add a New Insight',
    tone: 'Direct',
    capitalization: 'Preserve natural capitalization',
    length: 'Very Short: 3–10 words',
    language: 'English',
    variationsCount: 5,
  },
  {
    id: '5',
    name: 'Professional Discussion',
    description: 'Polished, professional, and respectful perspective for industry networks.',
    platform: 'Generic Discussion',
    intent: 'Share a Perspective',
    tone: 'Professional',
    capitalization: 'Normal capitalization',
    length: 'Medium: 25–60 words',
    language: 'English',
    variationsCount: 3,
  },
  {
    id: '6',
    name: 'Indonesian Casual Comment',
    description: 'Komentar santai, ramah, dan natural dalam bahasa Indonesia.',
    platform: 'Auto Detect',
    intent: 'Agree and Add Value',
    tone: 'Casual',
    capitalization: 'Normal capitalization',
    length: 'Medium: 25–60 words',
    language: 'Indonesian',
    variationsCount: 3,
  },
  {
    id: '7',
    name: 'Organic Marketing Discussion',
    description: 'Subtle value addition with natural product/service mention without sounding salesy.',
    platform: 'Auto Detect',
    intent: 'Subtle Product Mention',
    tone: 'Helpful',
    capitalization: 'Normal capitalization',
    length: 'Medium: 25–60 words',
    language: 'English',
    variationsCount: 3,
  },
];

export function getStoredProviders(): Record<string, ProviderConfig> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

export function saveProviderConfig(config: ProviderConfig): void {
  if (typeof window === 'undefined') return;
  const current = getStoredProviders();
  current[config.provider] = config;
  localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(current));

  // If no default set yet, set this as default
  const defaultProv = getDefaultProviderKey();
  if (!defaultProv) {
    setDefaultProviderKey(config.provider);
  }
}

export function removeProviderConfig(provider: string): void {
  if (typeof window === 'undefined') return;
  const current = getStoredProviders();
  delete current[provider];
  localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(current));

  if (getDefaultProviderKey() === provider) {
    const remaining = Object.keys(current);
    setDefaultProviderKey(remaining.length > 0 ? remaining[0] : '');
  }
}

export function getDefaultProviderKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.DEFAULT_PROVIDER) || '';
}

export function setDefaultProviderKey(provider: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.DEFAULT_PROVIDER, provider);
}

export function getStoredHistory(): GenerationResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveToHistory(result: GenerationResult): void {
  if (typeof window === 'undefined') return;
  const history = getStoredHistory();
  const updated = [result, ...history].slice(0, 50); // Keep last 50
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
}

export function getStoredFavorites(): GeneratedComment[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function toggleFavorite(comment: GeneratedComment): void {
  if (typeof window === 'undefined') return;
  const favorites = getStoredFavorites();
  const exists = favorites.some((f) => f.id === comment.id || f.text === comment.text);
  let updated: GeneratedComment[];
  if (exists) {
    updated = favorites.filter((f) => f.id !== comment.id && f.text !== comment.text);
  } else {
    updated = [{ ...comment, isFavorite: true }, ...favorites];
  }
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
}

export function getStoredPresets(): Preset[] {
  if (typeof window === 'undefined') return DEFAULT_PRESETS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PRESETS);
    return data ? JSON.parse(data) : DEFAULT_PRESETS;
  } catch (e) {
    return DEFAULT_PRESETS;
  }
}

export function savePreset(preset: Preset): void {
  if (typeof window === 'undefined') return;
  const presets = getStoredPresets();
  const index = presets.findIndex((p) => p.id === preset.id);
  let updated: Preset[];
  if (index >= 0) {
    updated = [...presets];
    updated[index] = preset;
  } else {
    updated = [preset, ...presets];
  }
  localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(updated));
}

export function deletePreset(id: string): void {
  if (typeof window === 'undefined') return;
  const presets = getStoredPresets();
  const updated = presets.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(updated));
}
