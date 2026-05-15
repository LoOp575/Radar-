import { NextRequest, NextResponse } from 'next/server';
import { fetchFundingRateHistory, fetchOpenInterestHistory } from '@/lib/coinalyze';

export const dynamic = 'force-dynamic';

type HistoryPoint = {
  t: number;
  o?: number;
  h?: number;
  l?: number;
  c?: number;
};

type HistoryBlock = {
  symbol: string;
  history?: HistoryPoint[];
};

function unixNowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function summarizeHistory(raw: unknown) {
  const blocks = Array.isArray(raw) ? (raw as HistoryBlock[]) : [];

  return blocks.map((block) => {
    const history = Array.isArray(block.history) ? block.history : [];
    const first = history[0];
    const last = history[history.length - 1];
    const firstValue = Number(first?.c ?? 0);
    const lastValue = Number(last?.c ?? 0);
    const changePct = firstValue ? ((lastValue - firstValue) / firstValue) * 100 : 0;

    return {
      symbol: block.symbol,
      points: history.length,
      firstValue,
      lastValue,
      changePct: Number(changePct.toFixed(3)),
      updatedAt: last?.t ? new Date(last.t * 1000).toISOString() : null
    };
  });
}

export async function GET(request: NextRequest) {
  const symbolsParam = request.nextUrl.searchParams.get('symbols') ?? 'BTCUSDT_PERP.A,ETHUSDT_PERP.A';
  const interval = (request.nextUrl.searchParams.get('interval') ?? '1hour') as '1min' | '5min' | '15min' | '30min' | '1hour' | '4hour' | 'daily';
  const raw = request.nextUrl.searchParams.get('raw') === '1';
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

    const oiSummary = summarizeHistory(openInterest);
    const fundingSummary = summarizeHistory(fundingRate);

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      source: 'coinalyze',
      mode: raw ? 'raw' : 'summary',
      symbols,
      interval,
      from,
      to,
      summary: symbols.map((symbol) => {
        const oi = oiSummary.find((item) => item.symbol === symbol);
        const funding = fundingSummary.find((item) => item.symbol === symbol);
        return {
          symbol,
          openInterest: oi ?? null,
          fundingRate: funding ?? null,
          pressure: oi && funding
            ? oi.changePct > 5 && funding.lastValue < 0.03
              ? 'BUILDING_PRESSURE'
              : oi.changePct < -5
                ? 'OI_UNWINDING'
                : 'NEUTRAL'
            : 'UNKNOWN'
        };
      }),
      raw: raw ? { openInterest, fundingRate } : undefined,
      tip: 'Buka /futures untuk tampilan UI. Tambahkan ?raw=1 kalau mau data mentah penuh.'
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Coinalyze derivatives request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Make sure COINALYZE_API_KEY is set in Vercel. Also verify the Coinalyze symbol format.'
      },
      { status: 500 }
    );
  }
}
