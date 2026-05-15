import { NextRequest, NextResponse } from 'next/server';
import { scanDexQuery } from '@/lib/dexscreener';
import { scoreTokens } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? 'SOL';

  try {
    const tokens = await scanDexQuery(query);
    const signals = scoreTokens(tokens);

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      source: 'dexscreener',
      query,
      count: signals.length,
      signals
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'DEX scanner failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
