import type { TokenInput } from './types';

const DEXSCREENER_BASE_URL = (process.env.DEXSCREENER_API_BASE ?? 'https://api.dexscreener.com').replace(/\/$/, '');

type DexPair = {
  chainId?: string;
  dexId?: string;
  pairAddress?: string;
  baseToken?: { address?: string; name?: string; symbol?: string };
  quoteToken?: { symbol?: string };
  priceUsd?: string;
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  liquidity?: { usd?: number; base?: number; quote?: number };
  volume?: { m5?: number; h1?: number; h6?: number; h24?: number };
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  txns?: {
    m5?: { buys?: number; sells?: number };
    h1?: { buys?: number; sells?: number };
    h24?: { buys?: number; sells?: number };
  };
};

type DexSearchResponse = {
  pairs?: DexPair[] | null;
};

async function dexFetch<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch(`${DEXSCREENER_BASE_URL}${path}`, {
      headers: { accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`DEX Screener request failed ${response.status}: ${body.slice(0, 180)}`);
    }

    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchDexPairs(query: string) {
  return dexFetch<DexSearchResponse>(`/latest/dex/search?q=${encodeURIComponent(query)}`);
}

export async function fetchTokenProfiles() {
  return dexFetch('/token-profiles/latest/v1');
}

export async function fetchLatestBoostedTokens() {
  return dexFetch('/token-boosts/latest/v1');
}

export async function fetchTopBoostedTokens() {
  return dexFetch('/token-boosts/top/v1');
}

export function dexPairToTokenInput(pair: DexPair): TokenInput | null {
  const symbol = pair.baseToken?.symbol;
  const name = pair.baseToken?.name ?? symbol;
  const price = Number(pair.priceUsd ?? 0);
  const liquidity = Number(pair.liquidity?.usd ?? 0);
  const volume5m = Number(pair.volume?.m5 ?? 0);
  const volume1h = Number(pair.volume?.h1 ?? 0);
  const volume24h = Number(pair.volume?.h24 ?? 0);
  const h1Tx = pair.txns?.h1;
  const buys = Number(h1Tx?.buys ?? 0);
  const sells = Number(h1Tx?.sells ?? 0);
  const buySellRatio = sells <= 0 ? Math.max(1, buys) : buys / sells;

  if (!symbol || !Number.isFinite(price) || price <= 0 || !Number.isFinite(liquidity) || liquidity <= 0) return null;

  const createdAt = pair.pairCreatedAt ?? Date.now();
  const ageHours = Math.max(1, (Date.now() - createdAt) / 1000 / 60 / 60);

  return {
    symbol,
    name: name ?? symbol,
    chain: pair.chainId ?? 'unknown',
    exchange: pair.dexId ?? 'DEX',
    price,
    marketCap: Number(pair.marketCap ?? pair.fdv ?? 0),
    fdv: Number(pair.fdv ?? pair.marketCap ?? 0),
    liquidity,
    ageHours,
    priceChange5m: Number(pair.priceChange?.m5 ?? 0),
    priceChange1h: Number(pair.priceChange?.h1 ?? 0),
    priceChange24h: Number(pair.priceChange?.h24 ?? 0),
    volume5m,
    volume15m: volume5m * 3,
    volume1h,
    volume24h,
    avgVolume15m7d: Math.max(1, volume24h / 96),
    avgVolume1h7d: Math.max(1, volume24h / 24),
    buySellRatio,
    uniqueBuyerGrowth: Math.min(100, buys),
    smartWalletNetBuyUsd: 0,
    whaleNetflowUsd: 0,
    holderGrowth1h: 0,
    oiChange1h: 0,
    fundingRate: 0,
    socialGrowth1h: 0,
    top10HolderPct: 0,
    devWalletMoved: false,
    liquidityChange1h: 0
  };
}

export async function scanDexQuery(query: string) {
  const data = await searchDexPairs(query);
  const pairs = Array.isArray(data.pairs) ? data.pairs : [];

  return pairs
    .map(dexPairToTokenInput)
    .filter((pair): pair is TokenInput => Boolean(pair))
    .filter((token) => token.liquidity >= 10_000 && token.volume1h >= 1_000)
    .slice(0, 40);
}
