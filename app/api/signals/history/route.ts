import { NextRequest, NextResponse } from 'next/server';
import { getRecentSignals } from '@/lib/signal-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 50);

  try {
    const signals = await getRecentSignals(Math.min(Math.max(limit, 1), 200));

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      count: signals.length,
      signals
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to load signal history',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
