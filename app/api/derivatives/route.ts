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

type Pressure = 'BUILDING_PRESSURE' | 'OI_UNWINDING' | 'NEUTRAL' | 'UNKNOWN';

type SummaryRow = {
  symbol: string;
  openInterest: {
    lastValue: number;
    firstValue: number;
    changePct: number;
    points: number;
    updatedAt: string | null;
  } | null;
  fundingRate: {
    lastValue: number;
    firstValue: number;
    changePct: number;
    points: number;
    updatedAt: string | null;
  } | null;
  pressure: Pressure;
};

const VALID_INTERVALS = ['1min', '5min', '15min', '30min', '1hour', '4hour', 'daily'] as const;
type Interval = (typeof VALID_INTERVALS)[number];

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

function classifyPressure(oiChangePct: number, fundingValue: number): Pressure {
  if (!Number.isFinite(oiChangePct) || !Number.isFinite(fundingValue)) return 'UNKNOWN';
  if (oiChangePct > 5 && fundingValue < 0.03) return 'BUILDING_PRESSURE';
  if (oiChangePct < -5) return 'OI_UNWINDING';
  return 'NEUTRAL';
}

export async function GET(request: NextRequest) {
  const symbolsParam =
    request.nextUrl.searchParams.get('symbols') ??
    'BTCUSDT_PERP.A,ETHUSDT_PERP.A,SOLUSDT_PERP.A';

  const intervalParam = request.nextUrl.searchParams.get('interval') ?? '1hour';
  const interval: Interval = (VALID_INTERVALS as readonly string[]).includes(intervalParam)
    ? (intervalParam as Interval)
    : '1hour';

  const raw = request.nextUrl.searchParams.get('raw') === '1';
  const to = unixNowSeconds();
  const from = to - 60 * 60 * 24;
  const symbols = symbolsParam
    .split(',')
    .map((symbol) => symbol.trim())
    .filter(Boolean);

  if (!symbols.length) {
    return NextResponse.json({ error: 'symbols query is required' }, { status: 400 });
  }

  if (!process.env.COINALYZE_API_KEY) {
    return NextResponse.json(
      {
        updatedAt: new Date().toISOString(),
        source: 'coinalyze',
        mode: 'summary',
        symbols,
        interval,
        summary: [] as SummaryRow[],
        warning: 'COINALYZE_API_KEY tidak ditemukan. Set di environment Vercel untuk mengaktifkan futures.',
        tip: 'Lihat /futures untuk UI atau tambahkan ?raw=1 untuk data mentah.'
      },
      { status: 200 }
    );
  }

  try {
    const [openInterest, fundingRate] = await Promise.all([
      fetchOpenInterestHistory({ symbols, interval, from, to }),
      fetchFundingRateHistory({ symbols, interval, from, to })
    ]);

    const oiSummary = summarizeHistory(openInterest);
    const fundingSummary = summarizeHistory(fundingRate);

    const summary: SummaryRow[] = symbols.map((symbol) => {
      const oi = oiSummary.find((item) => item.symbol === symbol) ?? null;
      const funding = fundingSummary.find((item) => item.symbol === symbol) ?? null;
      const pressure: Pressure =
        oi && funding ? classifyPressure(oi.changePct, funding.lastValue) : 'UNKNOWN';

      return {
        symbol,
        openInterest: oi
          ? {
              lastValue: oi.lastValue,
              firstValue: oi.firstValue,
              changePct: oi.changePct,
              points: oi.points,
              updatedAt: oi.updatedAt
            }
          : null,
        fundingRate: funding
          ? {
              lastValue: funding.lastValue,
              firstValue: funding.firstValue,
              changePct: funding.changePct,
              points: funding.points,
              updatedAt: funding.updatedAt
            }
          : null,
        pressure
      };
    });

    const body: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
      source: 'coinalyze',
      mode: raw ? 'raw' : 'summary',
      symbols,
      interval,
      from,
      to,
      summary,
      tip: 'Buka /futures untuk UI. Tambahkan ?raw=1 untuk data mentah.'
    };

    if (raw) {
      body.raw = { openInterest, fundingRate };
    }

    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Coinalyze derivatives request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Pastikan COINALYZE_API_KEY benar dan format simbol Coinalyze valid (contoh BTCUSDT_PERP.A).'
      },
      { status: 500 }
    );
  }
}
