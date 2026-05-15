import { z } from 'zod';

export const DataSourceStatus = z.object({
  name: z.string(),
  status: z.enum(['ready', 'needs_api_key', 'planned']),
  purpose: z.string(),
  env: z.string().optional()
});

export const dataSources = [
  {
    name: 'CoinGecko',
    status: process.env.COINGECKO_API_KEY ? 'ready' : 'needs_api_key',
    purpose: 'Market discovery, trending, OHLC/OHLCV, market cap, volume, gainers/losers.',
    env: 'COINGECKO_API_KEY'
  },
  {
    name: 'DEX Screener',
    status: 'ready',
    purpose: 'DEX pair, liquidity, volume, pair age, boosted/latest token.'
  },
  {
    name: 'CoinGlass / Exchange Futures',
    status: process.env.COINGLASS_API_KEY ? 'ready' : 'needs_api_key',
    purpose: 'Open interest, funding, long/short ratio, liquidation pressure.',
    env: 'COINGLASS_API_KEY'
  },
  {
    name: 'Chain Explorers',
    status: process.env.ETHERSCAN_API_KEY || process.env.SOLSCAN_API_KEY ? 'ready' : 'needs_api_key',
    purpose: 'Wallet transaction, holder, whale flow, dev wallet movement.',
    env: 'ETHERSCAN_API_KEY / SOLSCAN_API_KEY'
  }
] as const;

export async function fetchDexScreenerPairs(query: string) {
  const base = process.env.DEXSCREENER_API_BASE ?? 'https://api.dexscreener.com';
  const response = await fetch(`${base}/latest/dex/search?q=${encodeURIComponent(query)}`, {
    next: { revalidate: 30 }
  });

  if (!response.ok) {
    throw new Error(`DEX Screener request failed: ${response.status}`);
  }

  return response.json();
}
