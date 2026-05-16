import type { TokenInput } from './types';

const DEXSCREENER_BASE_URL = (process.env.DEXSCREENER_API_BASE ?? 'https://api.dexscreener.com').replace(/\/$/, '');
const HOT_QUERIES = ['AI', 'meme', 'solana', 'base', 'pepe', 'bonk', 'wif', 'virtual', 'aixbt', 'trump', 'pump', 'moonshot'];

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

type DexTokenDiscovery = {
  chainId?: string;
  tokenAddress?: string;
  address?: string;
  symbol?: string;
  description?: string;
  totalAmount?: number;
  amount?: number;
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
  return dexFetch<DexTokenDiscovery[]>('/token-profiles/latest/v1');
}

export async function fetchLatestBoostedTokens() {
  return dexFetch<DexTokenDiscovery[]>('/token-boosts/latest/v1');
}

export async function fetchTopBoostedTokens() {
  return dexFetch<DexTokenDiscovery[]>('/token-boosts/top/v1');
}

async function fetchTokenPairs(chainId: string, tokenAddress: string) {
  try {
    const pairs = await dexFetch<DexPair[]>(`/token-pairs/v1/${encodeURIComponent(chainId)}/${encodeURIComponent(tokenAddress)}`);
    return Array.isArray(pairs) ? pairs : [];
  } catch {
    try {
      const data = await dexFetch<DexSearchResponse>(`/latest/dex/tokens/${encodeURIComponent(tokenAddress)}`);
      return Array.isArray(data.pairs) ? data.pairs : [];
    } catch {
      return [];
    }
  }
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

function cleanTokens(tokens: TokenInput[]) {
  const map = new Map<string, TokenInput>();

  for (const token of tokens) {
    const key = `${token.chain}:${token.symbol.toUpperCase()}`;
    const existing = map.get(key);
    if (!existing || token.volume1h + token.liquidity > existing.volume1h + existing.liquidity) {
      map.set(key, token);
    }
  }

  return Array.from(map.values())
    .filter((token) => token.liquidity >= 2_500 && token.volume1h >= 250)
    .sort((a, b) => {
      const scoreA = a.volume1h * 1.8 + a.volume5m * 6 + a.liquidity * 0.08 + Math.max(0, a.priceChange1h) * 2_000;
      const scoreB = b.volume1h * 1.8 + b.volume5m * 6 + b.liquidity * 0.08 + Math.max(0, b.priceChange1h) * 2_000;
      return scoreB - scoreA;
    })
    .slice(0, 60);
}

async function scanBoostedDiscovery() {
  const [latest, top, profiles] = await Promise.allSettled([
    fetchLatestBoostedTokens(),
    fetchTopBoostedTokens(),
    fetchTokenProfiles()
  ]);

  const discovery = [latest, top, profiles].flatMap((result) =>
    result.status === 'fulfilled' && Array.isArray(result.value) ? result.value : []
  );

  const unique = new Map<string, DexTokenDiscovery>();
  for (const item of discovery) {
    const chainId = item.chainId;
    const tokenAddress = item.tokenAddress ?? item.address;
    if (!chainId || !tokenAddress) continue;
    unique.set(`${chainId}:${tokenAddress}`, { ...item, chainId, tokenAddress });
  }

  const candidates = Array.from(unique.values()).slice(0, 24);
  const pairResults = await Promise.allSettled(
    candidates.map((item) => fetchTokenPairs(item.chainId!, item.tokenAddress!))
  );

  return pairResults.flatMap((result) => {
    if (result.status !== 'fulfilled') return [];
    return result.value.map(dexPairToTokenInput).filter((pair): pair is TokenInput => Boolean(pair));
  });
}

export async function scanDexQuery(query: string) {
  const normalized = query.trim().toLowerCase();
  const isHot = ['hot', 'trending', 'market', 'scanner', 'all'].includes(normalized);

  const searchQueries = isHot ? HOT_QUERIES : [query];
  const searchResponses = await Promise.allSettled(searchQueries.map((item) => searchDexPairs(item)));
  const searchTokens = searchResponses.flatMap((response) => {
    if (response.status !== 'fulfilled') return [];
    const pairs = Array.isArray(response.value.pairs) ? response.value.pairs : [];
    return pairs.map(dexPairToTokenInput).filter((pair): pair is TokenInput => Boolean(pair));
  });

  const boostedTokens = isHot ? await scanBoostedDiscovery() : [];
  return cleanTokens([...boostedTokens, ...searchTokens]);
}
