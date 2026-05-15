import type { Metadata, Viewport } from 'next';
import { Navigation } from '@/components/Navigation';
import { MarketTicker } from '@/components/MarketTicker';
import './globals.css';

export const metadata: Metadata = {
  title: 'PumpRadar Vision — Crypto Trading Terminal',
  description:
    'Terminal trading premium untuk early pump scanner, futures pressure, wallet intelligence, dan radar market crypto real-time.',
  applicationName: 'PumpRadar Vision',
  keywords: ['crypto scanner', 'pump radar', 'trading terminal', 'futures', 'dex screener', 'coinalyze']
};

export const viewport: Viewport = {
  themeColor: '#02080b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen bg-[#02080b] text-slate-100">
        <div className="relative z-10">
          <Navigation />
          <MarketTicker />
          {children}
          <footer className="mx-auto mt-8 max-w-7xl px-3 pb-8 text-center text-[10px] uppercase tracking-[0.28em] text-slate-600 md:px-6">
            PumpRadar Vision · trading terminal · use at your own risk
          </footer>
        </div>
      </body>
    </html>
  );
}
