import type { TokenInput } from './types';

const DEXSCREENER_BASE_URL = process.env.DEXSCREENER_API_BASE ?? 'https://api.dexscreener.com';

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
  pairs?: DexPair[];
};

async function dexFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${DEXSCREENER_BASE_URL}${path}`, {
    next: { revalidate: 30 }
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`DEX Screener request failed ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
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
  const liquidity = pair.liquidity?.usd ?? 0;
  const volume5m = pair.volume?.m5 ?? 0;
  const volume1h = pair.volume?.h1 ?? 0;
  const volume24h = pair.volume?.h24 ?? 0;
  const h1Tx = pair.txns?.h1;
  const buys = h1Tx?.buys ?? 0;
  const sells = h1Tx?.sells ?? 0;
  const buySellRatio = sells <= 0 ? buys || 1 : buys / sells;

  if (!symbol || !price || !liquidity) return null;

  const createdAt = pair.pairCreatedAt ?? Date.now();
  const ageHours = Math.max(1, (Date.now() - createdAt) / 1000 / 60 / 60);

  return {
    symbol,
    name: name ?? symbol,
    chain: pair.chainId ?? 'unknown',
    exchange: pair.dexId ?? 'DEX',
    price,
    marketCap: pair.marketCap ?? pair.fdv ?? 0,
    fdv: pair.fdv ?? pair.marketCap ?? 0,
    liquidity,
    ageHours,
    priceChange5m: pair.priceChange?.m5 ?? 0,
    priceChange1h: pair.priceChange?.h1 ?? 0,
    priceChange24h: pair.priceChange?.h24 ?? 0,
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
  return (data.pairs ?? [])
    .map(dexPairToTokenInput)
    .filter((pair): pair is TokenInput => Boolean(pair))
    .filter((token) => token.liquidity >= 25_000 && token.volume1h >= 5_000)
    .slice(0, 40);
}
