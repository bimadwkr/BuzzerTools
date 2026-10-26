import { NextRequest, NextResponse } from 'next/server';
import { listModels } from '@/lib/ai/registry';
import { ProviderType } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, baseUrl } = await req.json();

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    const models = await listModels(provider as ProviderType, apiKey, baseUrl);
    return NextResponse.json({ success: true, models });
  } catch (error: any) {
    console.error('List models error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve models' },
      { status: 500 }
    );
  }
}
