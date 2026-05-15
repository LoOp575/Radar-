export type SignalLevel =
  | 'WATCH'
  | 'EARLY ACCUMULATION'
  | 'BREAKOUT PREP'
  | 'BREAKOUT CONFIRMED'
  | 'LATE / DO NOT CHASE'
  | 'DISTRIBUTION'
  | 'DANGER';

export type TokenInput = {
  symbol: string;
  name: string;
  chain: string;
  exchange: string;
  price: number;
  marketCap: number;
  fdv: number;
  liquidity: number;
  ageHours: number;
  priceChange5m: number;
  priceChange1h: number;
  priceChange24h: number;
  volume5m: number;
  volume15m: number;
  volume1h: number;
  volume24h: number;
  avgVolume15m7d: number;
  avgVolume1h7d: number;
  buySellRatio: number;
  uniqueBuyerGrowth: number;
  smartWalletNetBuyUsd: number;
  whaleNetflowUsd: number;
  holderGrowth1h: number;
  oiChange1h: number;
  fundingRate: number;
  socialGrowth1h: number;
  top10HolderPct: number;
  devWalletMoved: boolean;
  liquidityChange1h: number;
};

export type ScoreBreakdown = {
  volume: number;
  wallet: number;
  derivatives: number;
  liquidity: number;
  social: number;
  marketStructure: number;
  inverseRisk: number;
  risk: number;
};

export type TokenSignal = TokenInput & {
  pps: number;
  risk: number;
  signal: SignalLevel;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  reasons: string[];
  warnings: string[];
  breakdown: ScoreBreakdown;
  invalidation: string;
  quickTargets: string;
};
