import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/ai/registry';
import { GenerationParams } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const body: GenerationParams = await req.json();

    if (!body.sourcePost || !body.providerConfig) {
      return NextResponse.json({ error: 'Missing source post or provider configuration' }, { status: 400 });
    }

    const { provider, apiKey, model, baseUrl } = body.providerConfig;
    if (!apiKey && provider !== 'openai-compatible') {
      return NextResponse.json({ error: 'API key is required for selected provider' }, { status: 400 });
    }

    const comments = await generateText(body);

    return NextResponse.json({
      success: true,
      comments,
      provider,
      model,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate comments' },
      { status: 500 }
    );
  }
}
