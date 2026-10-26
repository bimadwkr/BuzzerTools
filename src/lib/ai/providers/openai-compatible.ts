import OpenAI from 'openai';
import { GenerationParams } from '../types';
import { buildPrompt } from '../prompt-builder';
import { parseAIResponse } from '../response-parser';

export async function validateOpenAICompatibleCredentials(apiKey: string, baseUrl?: string): Promise<boolean> {
  if (!baseUrl) throw new Error('Base URL is required for OpenAI-compatible providers');
  const openai = new OpenAI({ apiKey: apiKey || 'not-needed', baseURL: baseUrl, dangerouslyAllowBrowser: true });
  const response = await openai.models.list();
  return response.data.length > 0;
}

export async function listOpenAICompatibleModels(apiKey: string, baseUrl?: string): Promise<string[]> {
  if (!baseUrl) return [];
  const openai = new OpenAI({ apiKey: apiKey || 'not-needed', baseURL: baseUrl, dangerouslyAllowBrowser: true });
  const response = await openai.models.list();
  return response.data.map((m) => m.id);
}

export async function generateOpenAICompatibleText(params: GenerationParams): Promise<string[]> {
  const { apiKey, baseUrl, model } = params.providerConfig;
  if (!baseUrl) throw new Error('Base URL is required for OpenAI-compatible endpoints');

  const openai = new OpenAI({ apiKey: apiKey || 'not-needed', baseURL: baseUrl, dangerouslyAllowBrowser: true });
  const prompt = buildPrompt(params);

  const completion = await openai.chat.completions.create({
    model: model || 'default',
    messages: [
      { role: 'system', content: 'You are an expert social media copywriter. Output strictly valid JSON arrays of strings.' },
      { role: 'user', content: prompt },
    ],
    temperature: params.advanced?.creativity ?? 0.7,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('No completion returned from OpenAI-compatible endpoint');
  return parseAIResponse(text);
}
