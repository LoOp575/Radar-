'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Circle, RefreshCw, Search, ShieldCheck, Sparkles, Zap } from 'lucide-react';

type Signal = {
  symbol: string;
  name: string;
  chain: string;
  exchange: string;
  price: number;
  priceChange1h: number;
  priceChange24h: number;
  volume15m: number;
  volume1h: number;
  liquidity: number;
  marketCap: number;
  fdv: number;
  pps: number;
  risk: number;
  signal: string;
  reasons?: string[];
  warnings?: string[];
  invalidation?: string;
  quickTargets?: string;
};

type ApiResponse = {
  updatedAt: string;
  source: string;
  query: string;
  count: number;
  warning?: string | null;
  errorMessage?: string;
  signals: Signal[];
};

const quickScans = ['HOT', 'AI', 'MEME', 'BASE', 'PEPE', 'SOL', 'ETH', 'BNB'];

function compact(value: number) {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(value || 0);
}

function price(value: number) {
  if (!value) return '$0';
  if (value < 0.0001) return `$${value.toExponential(2)}`;
  if (value < 1) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(4)}`;
}

function ppsTone(score: number) {
  if (score >= 70) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (score >= 55) return 'bg-cyan-50 text-cyan-700 ring-cyan-200';
  return 'bg-slate-100 text-slate-600 ring-slate-200';
}

function riskTone(risk: number) {
  if (risk <= 30) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (risk <= 55) return 'bg-amber-50 text-amber-700 ring-amber-200';
  return 'bg-red-50 text-red-700 ring-red-200';
}

function signalTone(signal: string) {
  if (/DANGER|LATE|DISTRIBUTION/.test(signal)) return 'bg-red-50 text-red-700 ring-red-200';
  if (/BREAKOUT|EARLY/.test(signal)) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  return 'bg-cyan-50 text-cyan-700 ring-cyan-200';
}

export function SignalScanPanel() {
  const [query, setQuery] = useState('HOT');
  const [input, setInput] = useState('HOT');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function scan(nextQuery = query) {
    const cleaned = nextQuery.trim().toUpperCase() || 'HOT';
    setLoading(true);
    setError(null);
    setQuery(cleaned);
    setInput(cleaned);

    try {
      const response = await fetch(`/api/dex?q=${encodeURIComponent(cleaned)}`, { cache: 'no-store' });
      const json = (await response.json()) as ApiResponse;
      if (!response.ok) throw new Error(json.errorMessage || 'Scanner API error');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown scanner error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    scan('HOT');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signals = useMemo(() => data?.signals ?? [], [data]);
  const strong = signals.filter((item) => item.pps >= 70 && item.risk <= 45).length;
  const best = signals[0];

  return (
    <section className="space-y-4">
      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-xl shadow-teal-900/5 backdrop-blur-xl md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-teal-700 ring-1 ring-teal-100">
              <Sparkles size={13} /> One Page Scanner
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Signal Scanner</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Ketik token atau pilih kategori, lalu hasil scan langsung muncul di halaman ini. Tidak perlu buka JSON API.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white shadow-lg shadow-slate-900/15">
            <Circle size={8} className={loading ? 'animate-pulse text-amber-300' : 'text-emerald-300'} fill="currentColor" />
            {loading ? 'SCANNING' : 'READY'}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
            <Search size={17} className="shrink-0 text-slate-400" />
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && scan(input)}
              placeholder="Contoh: HOT, AI, MEME, PEPE, SOL..."
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              onClick={() => scan(input)}
              className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white shadow-lg shadow-slate-900/10"
            >
              SCAN
            </button>
          </div>

          <button
            onClick={() => scan(query)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {quickScans.map((item) => (
            <button
              key={item}
              onClick={() => scan(item)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black ring-1 transition ${
                query === item
                  ? 'bg-slate-950 text-white ring-slate-950'
                  : 'bg-white text-slate-500 ring-slate-200 hover:text-slate-950'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Query" value={query} />
        <Stat label="Found" value={String(signals.length)} />
        <Stat label="Strong" value={String(strong)} />
        <Stat label="Best PPS" value={best ? String(best.pps) : '--'} />
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          <AlertTriangle size={16} className="mr-2 inline" /> {error}
        </div>
      )}

      {data?.warning && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-700">
          <AlertTriangle size={16} className="mr-2 inline" /> {data.warning}
        </div>
      )}

      <div className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-xl shadow-teal-900/5 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-950">Hasil Scan Koin</h2>
            <p className="text-xs text-slate-500">Source: {data?.source ?? 'loading'} · Updated: {data?.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : '--:--'}</p>
          </div>
          <Zap size={18} className="text-teal-500" />
        </div>

        {loading && signals.length === 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
          </div>
        ) : signals.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-6 text-center ring-1 ring-slate-200">
            <p className="font-black text-slate-900">Belum ada koin yang cocok.</p>
            <p className="mt-1 text-sm text-slate-500">Coba scan HOT, AI, MEME, BASE, atau PEPE.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {signals.map((item, index) => <SignalCard key={`${item.chain}-${item.exchange}-${item.symbol}-${index}`} signal={item} index={index} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function SignalCard({ signal, index }: { signal: Signal; index: number }) {
  return (
    <article className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-900/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-400">#{index + 1} · {signal.chain}</p>
          <h3 className="truncate text-2xl font-black text-slate-950">{signal.symbol}</h3>
          <p className="truncate text-xs text-slate-400">{signal.name} · {signal.exchange}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${ppsTone(signal.pps)}`}>{signal.pps} PPS</span>
          <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${riskTone(signal.risk)}`}>{signal.risk} Risk</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
        <Mini label="Price" value={price(signal.price)} />
        <Mini label="1H" value={`${signal.priceChange1h >= 0 ? '+' : ''}${signal.priceChange1h.toFixed(2)}%`} positive={signal.priceChange1h >= 0} />
        <Mini label="Vol 1H" value={`$${compact(signal.volume1h)}`} />
        <Mini label="Liq" value={`$${compact(signal.liquidity)}`} />
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck size={14} className="text-teal-600" />
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${signalTone(signal.signal)}`}>{signal.signal}</span>
        </div>
        <ul className="space-y-1 text-xs leading-5 text-slate-500">
          {(signal.reasons ?? []).slice(0, 3).map((reason) => <li key={reason}>✅ {reason}</li>)}
          {(!signal.reasons || signal.reasons.length === 0) && <li>Menunggu konfirmasi volume, wallet, dan funding.</li>}
        </ul>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-400">
        <span>{signal.invalidation ?? 'Risk invalidation aktif'}</span>
        {signal.priceChange1h >= 0 ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownRight size={14} className="text-red-500" />}
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/70 bg-white/80 p-4 shadow-xl shadow-teal-900/5 ring-1 ring-white/70">
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 truncate text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function Mini({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  const color = positive === true ? 'text-emerald-700' : positive === false ? 'text-red-700' : 'text-slate-950';
  return (
    <div className="rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-100">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className={`truncate font-black ${color}`}>{value}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-3xl bg-white p-4 ring-1 ring-slate-200">
      <div className="h-6 w-24 rounded bg-slate-100" />
      <div className="mt-4 grid grid-cols-4 gap-2">
        <div className="h-12 rounded-2xl bg-slate-100" />
        <div className="h-12 rounded-2xl bg-slate-100" />
        <div className="h-12 rounded-2xl bg-slate-100" />
        <div className="h-12 rounded-2xl bg-slate-100" />
      </div>
      <div className="mt-4 h-24 rounded-2xl bg-slate-100" />
    </div>
  );
}
