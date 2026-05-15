import { NextResponse } from 'next/server';
import { hasDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

type ServiceStatus = {
  name: string;
  state: 'configured' | 'missing' | 'optional';
  envKey?: string;
  hint: string;
  testEndpoint?: string;
};

export async function GET() {
  const services: ServiceStatus[] = [
    {
      name: 'DEX Screener',
      state: 'configured',
      hint: 'Public API, tidak butuh key.',
      testEndpoint: '/api/dex?q=SOL'
    },
    {
      name: 'Coinalyze',
      state: process.env.COINALYZE_API_KEY ? 'configured' : 'missing',
      envKey: 'COINALYZE_API_KEY',
      hint: 'Open interest, funding, long/short ratio.',
      testEndpoint: '/api/derivatives'
    },
    {
      name: 'Supabase / Postgres',
      state: hasDatabase ? 'configured' : 'missing',
      envKey: 'DATABASE_URL',
      hint: 'Signal history & wallet profile storage.',
      testEndpoint: '/api/signals/history'
    },
    {
      name: 'Helius (Solana)',
      state: process.env.HELIUS_API_KEY ? 'configured' : 'optional',
      envKey: 'HELIUS_API_KEY',
      hint: 'Solana wallet & on-chain events.'
    },
    {
      name: 'Etherscan',
      state: process.env.ETHERSCAN_API_KEY ? 'configured' : 'optional',
      envKey: 'ETHERSCAN_API_KEY',
      hint: 'Ethereum tx, balance, holders.'
    },
    {
      name: 'BscScan',
      state: process.env.BSCSCAN_API_KEY ? 'configured' : 'optional',
      envKey: 'BSCSCAN_API_KEY',
      hint: 'BSC tx & holders.'
    },
    {
      name: 'Solscan',
      state: process.env.SOLSCAN_API_KEY ? 'configured' : 'optional',
      envKey: 'SOLSCAN_API_KEY',
      hint: 'Solana ecosystem explorer.'
    },
    {
      name: 'CoinGecko',
      state: process.env.COINGECKO_API_KEY ? 'configured' : 'optional',
      envKey: 'COINGECKO_API_KEY',
      hint: 'Trending, gainers, market discovery.'
    },
    {
      name: 'Telegram Alert',
      state:
        process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID ? 'configured' : 'optional',
      envKey: 'TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID',
      hint: 'Push alert ke Telegram.'
    }
  ];

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services
  });
}
