'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Circle, RefreshCw, Search, Terminal } from 'lucide-react';

type Signal = {
  symbol: string;
  name: string;
  chain: string;
  exchange: string;
  price: number;
  priceChange1h: number;
  volume1h: number;
  liquidity: number;
  pps: number;
  risk: number;
  signal: string;
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

const quickQueries = ['HOT', 'AI', 'MEME', 'BASE', 'PEPE', 'SOL'];

const compact = (value: number) =>
  Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(value || 0);

function priceFormat(value: number) {
  if (!value) return '$0';
  if (value < 0.0001) return `$${value.toExponential(2)}`;
  if (value < 1) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(4)}`;
}

function scoreTone(score: number) {
  if (score >= 70) return 'text-emerald-100 bg-emerald-400/15 ring-emerald-400/25';
  if (score >= 55) return 'text-cyan-100 bg-cyan-400/15 ring-cyan-400/25';
  return 'text-slate-200 bg-white/[0.06] ring-white/10';
}

export function LiveTradingTerminal() {
  const [query, setQuery] = useState('HOT');
  const [input, setInput] = useState('HOT');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(q = query) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dex?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
      const json = (await response.json()) as ApiResponse;
      if (!response.ok) throw new Error(json.errorMessage || 'DEX API error');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(query);
    const interval = setInterval(() => load(query), 45_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const rows = useMemo(() => (data?.signals ?? []).slice(0, 10), [data]);
  const best = rows[0];

  function submitSearch() {
    const next = input.trim().toUpperCase();
    if (!next) return;
    setQuery(next);
  }

  return (
    <section className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#050d11]/95 shadow-2xl shadow-black/30 ring-1 ring-cyan-300/10 backdrop-blur">
      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-300/10 via-emerald-300/10 to-transparent p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100 ring-1 ring-cyan-300/25">
              <Terminal size={19} />
            </div>
            <div>
              <h2 className="text-lg font-black md:text-xl">Market Terminal</h2>
              <p className="text-xs text-slate-500">HOT scan = multi-keyword token discovery</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-2 text-xs font-bold text-slate-300 ring-1 ring-white/10">
            <Circle size={8} className={loading ? 'animate-pulse text-amber-200' : 'text-emerald-300'} fill="currentColor" />
            {loading ? 'SYNCING' : 'LIVE'}
            <span className="text-slate-600">/</span>
            {data?.source ?? 'waiting'}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-3 py-2 font-mono text-sm">
          <span className="hidden text-emerald-300 sm:inline">radar$</span>
          <Search size={15} className="text-slate-500" />
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && submitSearch()}
            className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-600"
            placeholder="HOT, AI, MEME, PEPE..."
          />
          <button onClick={submitSearch} className="rounded-xl bg-cyan-300/15 px-3 py-1.5 text-xs font-black text-cyan-100 ring-1 ring-cyan-300/25">
            SCAN
          </button>
          <button onClick={() => load(query)} className="rounded-xl bg-white/[0.06] p-1.5 text-slate-300 ring-1 ring-white/10">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {quickQueries.map((item) => (
            <button
              key={item}
              onClick={() => {
                setInput(item);
                setQuery(item);
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-black ring-1 transition ${
                query === item
                  ? 'bg-emerald-300/18 text-emerald-100 ring-emerald-300/30'
                  : 'bg-white/[0.04] text-slate-400 ring-white/10 hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Query" value={query} />
            <Stat label="Pairs" value={String(data?.count ?? 0)} />
            <Stat label="Best PPS" value={best ? String(best.pps) : '--'} />
          </div>

          {best && (
            <div className="mt-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200/70">Best setup</p>
              <div className="mt-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-3xl font-black text-white">{best.symbol}</p>
                  <p className="text-xs text-slate-500">{best.chain} · {best.exchange}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-black ring-1 ${scoreTone(best.pps)}`}>{best.pps}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <Mini label="Price" value={priceFormat(best.price)} />
                <Mini label="1H" value={`${best.priceChange1h >= 0 ? '+' : ''}${best.priceChange1h.toFixed(2)}%`} positive={best.priceChange1h >= 0} />
                <Mini label="Vol 1H" value={`$${compact(best.volume1h)}`} />
                <Mini label="Liq" value={`$${compact(best.liquidity)}`} />
              </div>
            </div>
          )}

          {error && <Notice tone="red" text={error} />}
          {data?.warning && <Notice tone="amber" text={data.warning} />}
        </aside>

        <div className="p-3 md:p-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Ranked signals</p>
            <p className="text-xs text-slate-600">auto refresh 45s</p>
          </div>

          <div className="space-y-2">
            {loading && rows.length === 0 ? (
              Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} />)
            ) : rows.length > 0 ? (
              rows.map((row, index) => <SignalRow key={`${row.chain}-${row.exchange}-${row.symbol}-${index}`} row={row} index={index} />)
            ) : (
              <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                Tidak ada hasil untuk query ini. Coba HOT, AI, MEME, atau PEPE.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function SignalRow({ row, index }: { row: Signal; index: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 transition hover:bg-white/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-600">#{index + 1} · {row.chain}</p>
          <p className="truncate text-lg font-black text-white">{row.symbol}</p>
          <p className="truncate text-[11px] text-slate-500">{row.exchange}</p>
        </div>

        <div className="text-right">
          <p className="font-mono text-sm font-black text-cyan-100">{priceFormat(row.price)}</p>
          <p className={`flex items-center justify-end gap-1 text-xs font-black ${row.priceChange1h >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
            {row.priceChange1h >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {row.priceChange1h >= 0 ? '+' : ''}{row.priceChange1h.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px]">
        <Mini label="PPS" value={String(row.pps)} tone="green" />
        <Mini label="Risk" value={String(row.risk)} tone="amber" />
        <Mini label="Vol" value={`$${compact(row.volume1h)}`} />
        <Mini label="Liq" value={`$${compact(row.liquidity)}`} />
      </div>

      <p className="mt-2 truncate rounded-xl bg-black/20 px-3 py-2 text-[11px] font-bold text-slate-300 ring-1 ring-white/5">{row.signal}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
      <p className="text-[10px] uppercase tracking-widest text-slate-600">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
    </div>
  );
}

function Mini({ label, value, tone = 'slate', positive }: { label: string; value: string; tone?: 'green' | 'amber' | 'slate'; positive?: boolean }) {
  const color = positive === true ? 'text-emerald-100' : positive === false ? 'text-red-100' : tone === 'green' ? 'text-emerald-100' : tone === 'amber' ? 'text-amber-100' : 'text-slate-100';
  return (
    <div className="rounded-xl bg-black/25 p-2 ring-1 ring-white/10">
      <p className="text-[9px] uppercase text-slate-600">{label}</p>
      <p className={`truncate font-black ${color}`}>{value}</p>
    </div>
  );
}

function Notice({ text, tone }: { text: string; tone: 'red' | 'amber' }) {
  return (
    <div className={`mt-3 rounded-2xl border p-3 text-xs ${tone === 'red' ? 'border-red-300/20 bg-red-400/10 text-red-100' : 'border-amber-300/20 bg-amber-400/10 text-amber-100'}`}>
      {text}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <div className="h-5 w-24 rounded bg-white/10" />
      <div className="mt-3 grid grid-cols-4 gap-2">
        <div className="h-10 rounded-xl bg-white/10" />
        <div className="h-10 rounded-xl bg-white/10" />
        <div className="h-10 rounded-xl bg-white/10" />
        <div className="h-10 rounded-xl bg-white/10" />
      </div>
    </div>
  );
}
