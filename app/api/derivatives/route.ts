import { NextRequest, NextResponse } from 'next/server';
import { fetchFundingRateHistory, fetchOpenInterestHistory } from '@/lib/coinalyze';

export const dynamic = 'force-dynamic';

function unixNowSeconds() {
  return Math.floor(Date.now() / 1000);
}

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get('symbols') ?? 'BTCUSDT_PERP.A,ETHUSDT_PERP.A';
  const interval = (request.nextUrl.searchParams.get('interval') ?? '1hour') as '1min' | '5min' | '15min' | '30min' | '1hour' | '4hour' | 'daily';
  const to = unixNowSeconds();
  const from = to - 60 * 60 * 24;
  const symbols = symbolsParam.split(',').map((symbol) => symbol.trim()).filter(Boolean);

  if (!symbols.length) {
    return NextResponse.json({ error: 'symbols query is required' }, { status: 400 });
  }

  try {
    const [openInterest, fundingRate] = await Promise.all([
      fetchOpenInterestHistory({ symbols, interval, from, to }),
      fetchFundingRateHistory({ symbols, interval, from, to })
    ]);

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      source: 'coinalyze',
      symbols,
      interval,
      from,
      to,
      openInterest,
      fundingRate
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Coinalyze derivatives request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Make sure COINALYZE_API_KEY is set in Vercel or .env.local. Also verify the Coinalyze symbol format.'
      },
      { status: 500 }
    );
  }
}
