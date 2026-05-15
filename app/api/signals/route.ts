import { NextResponse } from 'next/server';
import { mockTokens } from '@/lib/mock-data';
import { scoreTokens } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

export async function GET() {
  const signals = scoreTokens(mockTokens);
  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    source: 'mock-data',
    note: 'Replace mock data with CoinGecko, DEX Screener, exchange futures, and chain explorer workers.',
    signals
  });
}
