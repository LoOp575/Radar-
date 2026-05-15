import { mockTokens } from '@/lib/mock-data';
import { scoreTokens } from '@/lib/scoring';

const compact = (value: number) =>
  Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(value || 0);

export function MarketTicker() {
  const signals = scoreTokens(mockTokens);
  const items = [...signals, ...signals]; // duplicate for seamless loop

  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-black/40">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#02080b] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#02080b] to-transparent" />
      <div className="marquee-track py-2 font-mono text-[11px]">
        {items.map((token, i) => {
          const positive = token.priceChange1h >= 0;
          return (
            <div key={`${token.symbol}-${i}`} className="flex shrink-0 items-center gap-2">
              <span className="text-slate-500">●</span>
              <span className="font-black text-white">{token.symbol}</span>
              <span className="text-cyan-200">${compact(token.price < 1 ? token.price * 1000 : token.price)}</span>
              <span className={positive ? 'text-emerald-300' : 'text-red-300'}>
                {positive ? '+' : ''}
                {token.priceChange1h.toFixed(2)}%
              </span>
              <span className="text-slate-600">PPS {token.pps}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
