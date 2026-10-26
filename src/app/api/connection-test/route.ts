import { NextRequest, NextResponse } from 'next/server';
import { validateCredentials } from '@/lib/ai/registry';
import { ProviderType } from '@/lib/ai/types';

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey, baseUrl } = await req.json();

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    const isValid = await validateCredentials(provider as ProviderType, apiKey, baseUrl);
    return NextResponse.json({ success: isValid });
  } catch (error: any) {
    console.error('Connection test error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Connection test failed' },
      { status: 400 }
    );
  }
}
