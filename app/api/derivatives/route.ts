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

type Pressure = 'BUILDING_PRESSURE' | 'OI_UNWINDING' | 'NEUTRAL' | 'UNKNOWN' | 'OFFLINE_FALLBACK';

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

function fallbackSummary(symbols: string[], reason: string, interval: Interval) {
  const now = new Date().toISOString();
  const summary: SummaryRow[] = symbols.map((symbol, index) => ({
    symbol,
    openInterest: {
      lastValue: [13_500_000, 8_200_000, 4_600_000, 2_900_000][index] ?? 1_250_000,
      firstValue: [12_900_000, 8_550_000, 4_420_000, 2_760_000][index] ?? 1_210_000,
      changePct: [4.65, -4.09, 4.07, 5.07][index] ?? 2.4,
      points: 24,
      updatedAt: now
    },
    fundingRate: {
      lastValue: [0.0085, 0.012, -0.0031, 0.0064][index] ?? 0.004,
      firstValue: [0.0062, 0.009, -0.0018, 0.0049][index] ?? 0.003,
      changePct: [37.1, 33.3, -72.2, 30.6][index] ?? 12.5,
      points: 24,
      updatedAt: now
    },
    pressure: 'OFFLINE_FALLBACK'
  }));

  return {
    updatedAt: now,
    source: 'fallback-futures-model',
    mode: 'summary',
    symbols,
    interval,
    summary,
    warning: reason,
    tip: 'Coinalyze belum live. UI tetap menampilkan fallback agar futures terminal tidak offline.'
  };
}

export async function GET(request: NextRequest) {
  const symbolsParam =
    request.nextUrl.searchParams.get('symbols') ??
    'BTCUSDT_PERP.A,ETHUSDT_PERP.A,SOLUSDT_PERP.A,BNBUSDT_PERP.A';

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
      fallbackSummary(symbols, 'COINALYZE_API_KEY tidak ditemukan di Vercel Environment Variables.', interval),
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

    const hasLiveRows = summary.some((row) => row.openInterest || row.fundingRate);
    if (!hasLiveRows) {
      return NextResponse.json(
        fallbackSummary(symbols, 'Coinalyze membalas sukses tapi tidak mengembalikan history untuk simbol ini.', interval),
        { status: 200 }
      );
    }

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
    const reason = error instanceof Error ? error.message : 'Unknown Coinalyze error';
    return NextResponse.json(
      fallbackSummary(symbols, `Coinalyze gagal live: ${reason}`, interval),
      { status: 200 }
    );
  }
}
