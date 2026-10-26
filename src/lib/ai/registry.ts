import { GenerationParams, ProviderType } from './types';
import { validateGeminiCredentials, listGeminiModels, generateGeminiText } from './providers/gemini';
import { validateOpenAICredentials, listOpenAIModels, generateOpenAIText } from './providers/openai';
import { validateAnthropicCredentials, listAnthropicModels, generateAnthropicText } from './providers/anthropic';
import { validateOpenAICompatibleCredentials, listOpenAICompatibleModels, generateOpenAICompatibleText } from './providers/openai-compatible';

export async function validateCredentials(provider: ProviderType, apiKey: string, baseUrl?: string): Promise<boolean> {
  switch (provider) {
    case 'gemini':
      return validateGeminiCredentials(apiKey);
    case 'openai':
      return validateOpenAICredentials(apiKey, baseUrl);
    case 'anthropic':
      return validateAnthropicCredentials(apiKey);
    case 'openai-compatible':
      return validateOpenAICompatibleCredentials(apiKey, baseUrl);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export async function listModels(provider: ProviderType, apiKey: string, baseUrl?: string): Promise<string[]> {
  switch (provider) {
    case 'gemini':
      return listGeminiModels(apiKey);
    case 'openai':
      return listOpenAIModels(apiKey, baseUrl);
    case 'anthropic':
      return listAnthropicModels(apiKey);
    case 'openai-compatible':
      return listOpenAICompatibleModels(apiKey, baseUrl);
    default:
      return [];
  }
}

export async function generateText(params: GenerationParams): Promise<string[]> {
  const { provider } = params.providerConfig;
  switch (provider) {
    case 'gemini':
      return generateGeminiText(params);
    case 'openai':
      return generateOpenAIText(params);
    case 'anthropic':
      return generateAnthropicText(params);
    case 'openai-compatible':
      return generateOpenAICompatibleText(params);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
