import type { SignalLevel, TokenInput, TokenSignal } from './types';

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const safeRatio = (a: number, b: number) => (b <= 0 ? 0 : a / b);

export function scoreToken(token: TokenInput): TokenSignal {
  const volume15mRatio = safeRatio(token.volume15m, token.avgVolume15m7d);
  const volume1hRatio = safeRatio(token.volume1h, token.avgVolume1h7d);

  const volume = clamp(
    volume15mRatio * 18 +
      volume1hRatio * 14 +
      token.buySellRatio * 12 +
      token.uniqueBuyerGrowth * 0.42 -
      Math.max(0, token.priceChange1h - 18) * 1.6
  );

  const wallet = clamp(
    token.smartWalletNetBuyUsd / Math.max(8000, token.marketCap) * 2600 +
      token.whaleNetflowUsd / Math.max(8000, token.marketCap) * 1700 +
      token.holderGrowth1h * 3.1 -
      (token.devWalletMoved ? 28 : 0)
  );

  const fundingPenalty = Math.max(0, Math.abs(token.fundingRate) - 0.035) * 950;
  const derivatives = clamp(
    token.oiChange1h * 3.6 +
      (token.fundingRate > -0.015 && token.fundingRate < 0.03 ? 24 : 4) -
      fundingPenalty
  );

  const liquidity = clamp(
    Math.log10(Math.max(token.liquidity, 1)) * 13 +
      token.liquidityChange1h * 1.4 -
      (token.liquidity < 100000 ? 22 : 0) -
      Math.max(0, token.top10HolderPct - 45) * 1.2
  );

  const social = clamp(
    Math.log10(Math.max(token.socialGrowth1h, 1)) * 22 +
      (token.socialGrowth1h > 500 && token.priceChange1h > 30 ? -24 : 0)
  );

  const marketStructure = clamp(
    52 +
      (token.priceChange1h > 0 && token.priceChange1h < 12 ? 22 : 0) +
      (token.priceChange24h > 0 && token.priceChange24h < 35 ? 13 : 0) -
      Math.max(0, token.priceChange1h - 20) * 1.8 -
      (token.ageHours < 12 ? 12 : 0)
  );

  const risk = clamp(
    (token.top10HolderPct > 40 ? (token.top10HolderPct - 40) * 1.6 : 0) +
      (token.devWalletMoved ? 30 : 0) +
      (token.liquidity < 100000 ? 25 : 0) +
      Math.max(0, token.priceChange1h - 25) * 1.2 +
      Math.max(0, token.priceChange24h - 80) * 0.6 +
      (token.liquidityChange1h < -8 ? Math.abs(token.liquidityChange1h) * 1.4 : 0) +
      (token.buySellRatio < 0.9 ? 12 : 0)
  );

  const inverseRisk = 100 - risk;
  const pps = clamp(
    0.2 * volume +
      0.18 * wallet +
      0.15 * derivatives +
      0.14 * liquidity +
      0.12 * social +
      0.11 * marketStructure +
      0.1 * inverseRisk
  );

  const reasons: string[] = [];
  const warnings: string[] = [];

  if (volume15mRatio >= 2.5) reasons.push(`Volume 15m ${volume15mRatio.toFixed(1)}x di atas rata-rata`);
  if (volume1hRatio >= 2) reasons.push(`Volume 1h ${volume1hRatio.toFixed(1)}x di atas rata-rata`);
  if (token.smartWalletNetBuyUsd > 0) reasons.push(`Smart wallet net buy $${formatCompact(token.smartWalletNetBuyUsd)}`);
  if (token.whaleNetflowUsd > 0) reasons.push(`Whale netflow positif $${formatCompact(token.whaleNetflowUsd)}`);
  if (token.oiChange1h > 8) reasons.push(`Open interest naik ${token.oiChange1h.toFixed(1)}%`);
  if (token.fundingRate > -0.015 && token.fundingRate < 0.03) reasons.push('Funding masih netral / belum terlalu panas');
  if (token.priceChange1h > 0 && token.priceChange1h < 12) reasons.push('Harga mulai naik tapi belum parabolik');

  if (token.top10HolderPct > 50) warnings.push(`Top 10 holder tinggi: ${token.top10HolderPct}%`);
  if (token.devWalletMoved) warnings.push('Dev wallet terdeteksi bergerak');
  if (token.liquidity < 100000) warnings.push('Liquidity tipis, slippage dan rug risk tinggi');
  if (token.priceChange1h > 25) warnings.push('Harga sudah naik besar dalam 1 jam, rawan telat masuk');
  if (token.liquidityChange1h < -8) warnings.push('Liquidity turun, cek LP/exit pressure');

  const signal = classifySignal(pps, risk, token);
  const confidence = pps >= 78 && risk <= 30 ? 'HIGH' : pps >= 62 ? 'MEDIUM' : 'LOW';

  return {
    ...token,
    pps: Math.round(pps),
    risk: Math.round(risk),
    signal,
    confidence,
    reasons,
    warnings,
    breakdown: { volume, wallet, derivatives, liquidity, social, marketStructure, inverseRisk, risk },
    invalidation: `Invalid jika turun ${risk > 45 ? '4.5' : '3.0'}% dari zona alert atau volume buy hilang`,
    quickTargets: 'TP cepat: +5% / +10% / trailing; jangan all-in, wajib pakai invalidasi'
  };
}

export function scoreTokens(tokens: TokenInput[]) {
  return tokens.map(scoreToken).sort((a, b) => b.pps - a.pps);
}

function classifySignal(pps: number, risk: number, token: TokenInput): SignalLevel {
  if (risk >= 70 || token.devWalletMoved || token.liquidity < 50000) return 'DANGER';
  if (token.priceChange1h > 35 || token.priceChange24h > 110) return 'LATE / DO NOT CHASE';
  if (pps >= 78 && risk <= 32 && token.priceChange1h < 15) return 'BREAKOUT PREP';
  if (pps >= 70 && risk <= 38) return 'EARLY ACCUMULATION';
  if (pps >= 60) return 'WATCH';
  if (token.whaleNetflowUsd < 0 && token.smartWalletNetBuyUsd < 0) return 'DISTRIBUTION';
  return 'WATCH';
}

export function formatCompact(value: number) {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}
