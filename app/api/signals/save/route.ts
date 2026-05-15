import { NextResponse } from 'next/server';
import { mockTokens } from '@/lib/mock-data';
import { scoreTokens } from '@/lib/scoring';
import { saveSignals } from '@/lib/signal-store';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const signals = scoreTokens(mockTokens).filter((signal) => signal.pps >= 60);
    const result = await saveSignals(signals);

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      source: 'mock-data',
      attempted: signals.length,
      ...result
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to save signals',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
