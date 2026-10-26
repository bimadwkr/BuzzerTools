export type ProviderType = 'gemini' | 'openai' | 'anthropic' | 'openai-compatible';

export interface ProviderConfig {
  provider: ProviderType;
  apiKey: string;
  baseUrl?: string;
  model: string;
  enabled: boolean;
}

export interface GenerationParams {
  sourcePost: string;
  platform: string;
  intent: string;
  customIntent?: string;
  tone: string;
  customTone?: string;
  capitalization: string;
  writingStyle: {
    contractions: boolean;
    minimalPunctuation: boolean;
    noEmojis: boolean;
    noHashtags: boolean;
    noGenericPhrases: boolean;
    noIntroPhrases: boolean;
    noExcessiveFormality: boolean;
    noRepetitiveStructure: boolean;
  };
  length: string;
  customLength?: { min: number; max: number };
  language: string;
  customLanguage?: string;
  variationsCount: number;
  advanced?: {
    creativity?: number;
    additionalContext?: string;
    customInstructions?: string;
    wordsToAvoid?: string;
    requiredKeywords?: string;
    platformInstructions?: string;
  };
  providerConfig: ProviderConfig;
}

export interface GeneratedComment {
  id: string;
  text: string;
  wordCount: number;
  intent: string;
  tone: string;
  isFavorite?: boolean;
}

export interface GenerationResult {
  comments: GeneratedComment[];
  provider: string;
  model: string;
  timestamp: number;
}

export interface AIProviderAdapter {
  validateCredentials(apiKey: string, baseUrl?: string): Promise<boolean>;
  listModels(apiKey: string, baseUrl?: string): Promise<string[]>;
  generateText(params: GenerationParams): Promise<string[]>;
}
