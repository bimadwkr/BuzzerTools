import OpenAI from 'openai';
import { GenerationParams } from '../types';
import { buildPrompt } from '../prompt-builder';
import { parseAIResponse } from '../response-parser';

export async function validateOpenAICredentials(apiKey: string, baseUrl?: string): Promise<boolean> {
  const openai = new OpenAI({ apiKey, baseURL: baseUrl || undefined, dangerouslyAllowBrowser: true });
  const response = await openai.models.list();
  return response.data.length > 0;
}

export async function listOpenAIModels(apiKey: string, baseUrl?: string): Promise<string[]> {
  const openai = new OpenAI({ apiKey, baseURL: baseUrl || undefined, dangerouslyAllowBrowser: true });
  const response = await openai.models.list();
  return response.data
    .map((m) => m.id)
    .filter((id) => id.includes('gpt') || id.includes('o1') || id.includes('o3') || id.includes('chatgpt'))
    .sort();
}

export async function generateOpenAIText(params: GenerationParams): Promise<string[]> {
  const { apiKey, baseUrl, model } = params.providerConfig;
  const openai = new OpenAI({ apiKey, baseURL: baseUrl || undefined, dangerouslyAllowBrowser: true });
  const prompt = buildPrompt(params);

  const completion = await openai.chat.completions.create({
    model: model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an expert social media copywriter. Output strictly valid JSON arrays of strings.' },
      { role: 'user', content: prompt },
    ],
    temperature: params.advanced?.creativity ?? 0.7,
    response_format: { type: 'json_object' },
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('No completion returned from OpenAI');
  return parseAIResponse(text);
}
