import Anthropic from '@anthropic-ai/sdk';
import { GenerationParams } from '../types';
import { buildPrompt } from '../prompt-builder';
import { parseAIResponse } from '../response-parser';

export async function validateAnthropicCredentials(apiKey: string): Promise<boolean> {
  const anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  // Test with minimal message
  await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 10,
    messages: [{ role: 'user', content: 'Hi' }],
  });
  return true;
}

export async function listAnthropicModels(apiKey: string): Promise<string[]> {
  // Anthropic doesn't have a public models list endpoint in SDK, return standard current models
  return [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-haiku-20240307',
  ];
}

export async function generateAnthropicText(params: GenerationParams): Promise<string[]> {
  const { apiKey, model } = params.providerConfig;
  const anthropic = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const prompt = buildPrompt(params);

  const response = await anthropic.messages.create({
    model: model || 'claude-3-5-sonnet-20241022',
    max_tokens: 1500,
    temperature: params.advanced?.creativity ?? 0.7,
    messages: [{ role: 'user', content: prompt }],
  });

  const contentBlock = response.content[0];
  if (!contentBlock || contentBlock.type !== 'text') {
    throw new Error('No text block returned from Anthropic');
  }

  return parseAIResponse(contentBlock.text);
}
