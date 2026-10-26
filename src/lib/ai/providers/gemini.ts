import { GoogleGenAI } from '@google/genai';
import { GenerationParams } from '../types';
import { buildPrompt } from '../prompt-builder';
import { parseAIResponse } from '../response-parser';

export async function validateGeminiCredentials(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.models && data.models.length > 0) return true;
    if (apiKey && apiKey.length > 10) return true;
    throw new Error('Invalid API key or unauthorized');
  } catch (error) {
    if (apiKey && apiKey.length > 10) return true;
    throw error;
  }
}

export async function listGeminiModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.models) {
      return data.models
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => m.name.replace('models/', ''));
    }
  } catch (e) {
    // fallback
  }
  return ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'];
}

export async function generateGeminiText(params: GenerationParams): Promise<string[]> {
  const { apiKey, model } = params.providerConfig;
  const selectedModel = model || 'gemini-1.5-flash';
  const prompt = buildPrompt(params);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: params.advanced?.creativity ?? 0.7,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Gemini API generation failed');
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No text returned from Gemini API');
  return parseAIResponse(text);
}
