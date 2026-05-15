type CoinalyzeOptions = {
  symbols: string[];
  interval?: '1min' | '5min' | '15min' | '30min' | '1hour' | '4hour' | 'daily';
  from?: number;
  to?: number;
};

const COINALYZE_BASE_URL = 'https://api.coinalyze.net/v1';

function getApiKey() {
  const key = process.env.COINALYZE_API_KEY;
  if (!key) {
    throw new Error('Missing COINALYZE_API_KEY environment variable');
  }
  return key;
}

async function coinalyzeFetch<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = new URL(`${COINALYZE_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: { api_key: getApiKey() },
    next: { revalidate: 60 }
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Coinalyze request failed ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

export type CoinalyzeMarket = {
  symbol: string;
  base_asset: string;
  quote_asset: string;
  exchange: string;
  is_perpetual: boolean;
  is_inverse: boolean;
};

export type CoinalyzeOhlcvPoint = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export async function fetchCoinalyzeMarkets() {
  return coinalyzeFetch<CoinalyzeMarket[]>('/future-markets');
}

export async function fetchOpenInterestHistory(options: CoinalyzeOptions) {
  return coinalyzeFetch('/open-interest-history', {
    symbols: options.symbols.join(','),
    interval: options.interval ?? '5min',
    from: options.from,
    to: options.to
  });
}

export async function fetchFundingRateHistory(options: CoinalyzeOptions) {
  return coinalyzeFetch('/funding-rate-history', {
    symbols: options.symbols.join(','),
    interval: options.interval ?? '1hour',
    from: options.from,
    to: options.to
  });
}

export async function fetchLongShortRatioHistory(options: CoinalyzeOptions) {
  return coinalyzeFetch('/long-short-ratio-history', {
    symbols: options.symbols.join(','),
    interval: options.interval ?? '1hour',
    from: options.from,
    to: options.to
  });
}
