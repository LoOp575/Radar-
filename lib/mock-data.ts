import type { TokenInput } from './types';

export const mockTokens: TokenInput[] = [
  {
    symbol: 'AIX', name: 'AI Xtreme', chain: 'Solana', exchange: 'MEXC + Raydium', price: 0.0412,
    marketCap: 8200000, fdv: 21000000, liquidity: 930000, ageHours: 212, priceChange5m: 0.8, priceChange1h: 4.2, priceChange24h: 12.4,
    volume5m: 82000, volume15m: 290000, volume1h: 900000, volume24h: 7200000, avgVolume15m7d: 82000, avgVolume1h7d: 310000,
    buySellRatio: 1.62, uniqueBuyerGrowth: 34, smartWalletNetBuyUsd: 240000, whaleNetflowUsd: 130000, holderGrowth1h: 6.1,
    oiChange1h: 14, fundingRate: 0.012, socialGrowth1h: 180, top10HolderPct: 28, devWalletMoved: false, liquidityChange1h: 8
  },
  {
    symbol: 'NOVA', name: 'Nova Meme', chain: 'Base', exchange: 'Uniswap', price: 0.00087,
    marketCap: 3100000, fdv: 8700000, liquidity: 210000, ageHours: 39, priceChange5m: 6.2, priceChange1h: 28.5, priceChange24h: 92,
    volume5m: 150000, volume15m: 510000, volume1h: 1300000, volume24h: 4100000, avgVolume15m7d: 42000, avgVolume1h7d: 120000,
    buySellRatio: 1.18, uniqueBuyerGrowth: 88, smartWalletNetBuyUsd: 42000, whaleNetflowUsd: -30000, holderGrowth1h: 13,
    oiChange1h: 0, fundingRate: 0, socialGrowth1h: 640, top10HolderPct: 61, devWalletMoved: true, liquidityChange1h: -12
  },
  {
    symbol: 'KITE', name: 'Kite Finance', chain: 'Arbitrum', exchange: 'Binance + Camelot', price: 0.138,
    marketCap: 54000000, fdv: 144000000, liquidity: 8100000, ageHours: 1840, priceChange5m: 0.2, priceChange1h: 1.7, priceChange24h: 5.1,
    volume5m: 230000, volume15m: 710000, volume1h: 2400000, volume24h: 16800000, avgVolume15m7d: 340000, avgVolume1h7d: 1100000,
    buySellRatio: 1.34, uniqueBuyerGrowth: 21, smartWalletNetBuyUsd: 510000, whaleNetflowUsd: 420000, holderGrowth1h: 2.8,
    oiChange1h: 11, fundingRate: 0.018, socialGrowth1h: 76, top10HolderPct: 24, devWalletMoved: false, liquidityChange1h: 3
  },
  {
    symbol: 'RUGX', name: 'RugXperiment', chain: 'BSC', exchange: 'PancakeSwap', price: 0.000012,
    marketCap: 560000, fdv: 1200000, liquidity: 38000, ageHours: 8, priceChange5m: 12, priceChange1h: 86, priceChange24h: 160,
    volume5m: 46000, volume15m: 140000, volume1h: 360000, volume24h: 900000, avgVolume15m7d: 12000, avgVolume1h7d: 40000,
    buySellRatio: 0.76, uniqueBuyerGrowth: 120, smartWalletNetBuyUsd: -10000, whaleNetflowUsd: -62000, holderGrowth1h: 24,
    oiChange1h: 0, fundingRate: 0, socialGrowth1h: 980, top10HolderPct: 78, devWalletMoved: true, liquidityChange1h: -28
  },
  {
    symbol: 'FLOWAI', name: 'Flow AI', chain: 'Ethereum', exchange: 'OKX + Uniswap', price: 0.92,
    marketCap: 118000000, fdv: 290000000, liquidity: 14500000, ageHours: 5200, priceChange5m: -0.1, priceChange1h: 0.9, priceChange24h: 3.4,
    volume5m: 410000, volume15m: 980000, volume1h: 3300000, volume24h: 42000000, avgVolume15m7d: 700000, avgVolume1h7d: 2100000,
    buySellRatio: 1.22, uniqueBuyerGrowth: 12, smartWalletNetBuyUsd: 880000, whaleNetflowUsd: 760000, holderGrowth1h: 1.2,
    oiChange1h: 6, fundingRate: 0.006, socialGrowth1h: 42, top10HolderPct: 18, devWalletMoved: false, liquidityChange1h: 2
  }
];
