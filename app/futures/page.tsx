type FuturesRow = {
  symbol: string;
  openInterest: {
    lastValue: number;
    changePct: number;
  } | null;
  fundingRate: {
    lastValue: number;
  } | null;
  pressure: string;
};

type FuturesData = {
  updatedAt: string;
  source: string;
  interval: string;
  symbols: string[];
  summary: FuturesRow[];
  warning?: string;
};

const fallbackData: FuturesData = {
  updatedAt: new Date().toISOString(),
  source: 'fallback-futures-ui',
  interval: '1hour',
  symbols: ['BTCUSDT_PERP.A', 'ETHUSDT_PERP.A', 'SOLUSDT_PERP.A', 'BNBUSDT_PERP.A'],
  warning: 'Coinalyze live belum terbaca dari halaman futures. UI memakai fallback supaya terminal tidak offline.',
  summary: [
    { symbol: 'BTCUSDT_PERP.A', openInterest: { lastValue: 13500000, changePct: 4.65 }, fundingRate: { lastValue: 0.0085 }, pressure: 'FALLBACK_MODEL' },
    { symbol: 'ETHUSDT_PERP.A', openInterest: { lastValue: 8200000, changePct: -4.09 }, fundingRate: { lastValue: 0.012 }, pressure: 'FALLBACK_MODEL' },
    { symbol: 'SOLUSDT_PERP.A', openInterest: { lastValue: 4600000, changePct: 4.07 }, fundingRate: { lastValue: -0.0031 }, pressure: 'FALLBACK_MODEL' },
    { symbol: 'BNBUSDT_PERP.A', openInterest: { lastValue: 2900000, changePct: 5.07 }, fundingRate: { lastValue: 0.0064 }, pressure: 'FALLBACK_MODEL' }
  ]
};

async function getDerivatives(): Promise<FuturesData> {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/api/derivatives`, { cache: 'no-store' });
    if (!response.ok) return fallbackData;
    const data = (await response.json()) as FuturesData;
    if (!Array.isArray(data.summary) || data.summary.length === 0) return fallbackData;
    return data;
  } catch {
    return fallbackData;
  }
}

function compact(value: number) {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(value || 0);
}

export default async function FuturesPage() {
  const data = await getDerivatives();
  const rows = data.summary;
  const isFallback = data.source.includes('fallback');

  return (
    <main className="min-h-screen bg-[#02080b] px-3 py-4 text-slate-100 md:px-8 md:py-8">
      <section className="mx-auto max-w-6xl space-y-4">
        <header className="rounded-[2rem] border border-cyan-300/15 bg-gradient-to-br from-cyan-300/12 via-white/[0.05] to-emerald-300/10 p-5 shadow-2xl shadow-cyan-950/30">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">Futures Terminal</p>
          <h1 className="mt-2 text-3xl font-black md:text-5xl">Futures Pressure</h1>
          <p className="mt-2 text-sm text-slate-300">Open interest, funding rate, dan pressure map. Kalau Coinalyze belum live, UI tetap tampil dengan fallback.</p>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <Stat label="Source" value={data.source} />
          <Stat label="Interval" value={data.interval} />
          <Stat label="Symbols" value={String(data.symbols.length)} />
        </section>

        {data.warning && (
          <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm font-bold text-amber-100">
            {data.warning}
          </div>
        )}

        <section className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-black/40 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-4 py-3 font-mono text-xs text-slate-400">
            <span>radar:futures$ coinalyze --summary</span>
            <span className={isFallback ? 'text-amber-200' : 'text-emerald-200'}>{isFallback ? 'FALLBACK' : 'LIVE'}</span>
          </div>

          <div className="hidden md:block">
            <table className="w-full text-left font-mono text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3">OI Now</th>
                  <th className="px-4 py-3">OI 24h</th>
                  <th className="px-4 py-3">Funding</th>
                  <th className="px-4 py-3">Pressure</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.symbol} className="border-t border-white/5">
                    <td className="px-4 py-4 font-black text-white">{row.symbol}</td>
                    <td className="px-4 py-4 text-cyan-100">{compact(row.openInterest?.lastValue ?? 0)}</td>
                    <td className={`px-4 py-4 font-black ${(row.openInterest?.changePct ?? 0) >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>{(row.openInterest?.changePct ?? 0).toFixed(2)}%</td>
                    <td className="px-4 py-4 text-amber-100">{(row.fundingRate?.lastValue ?? 0).toFixed(6)}</td>
                    <td className="px-4 py-4"><span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-black text-cyan-100 ring-1 ring-cyan-400/25">{row.pressure}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 p-3 md:hidden">
            {rows.map((row) => (
              <div key={row.symbol} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 font-mono">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-black text-white">{row.symbol}</p>
                    <p className="text-[11px] text-slate-500">{row.pressure}</p>
                  </div>
                  <p className={`font-black ${(row.openInterest?.changePct ?? 0) >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>{(row.openInterest?.changePct ?? 0).toFixed(2)}%</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <Cell label="OI" value={compact(row.openInterest?.lastValue ?? 0)} />
                  <Cell label="Funding" value={(row.fundingRate?.lastValue ?? 0).toFixed(6)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 truncate text-xl font-black">{value}</p></div>;
}

function Cell({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-black/25 p-2 ring-1 ring-white/10"><p className="text-[10px] text-slate-500">{label}</p><p className="font-black text-white">{value}</p></div>;
}
