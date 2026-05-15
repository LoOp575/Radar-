'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDownRight, ArrowUpRight, Circle, RefreshCw, Search, Terminal, Zap } from 'lucide-react';

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

const quickQueries = ['SOL', 'AI', 'PEPE', 'BNB', 'ETH', 'BASE'];

const compact = (value: number) =>
  Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(value || 0);

function priceFormat(value: number) {
  if (!value) return '$0';
  if (value < 0.0001) return `$${value.toExponential(2)}`;
  if (value < 1) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(4)}`;
}

export function LiveTradingTerminal() {
  const [query, setQuery] = useState('SOL');
  const [input, setInput] = useState('SOL');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

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
    const interval = setInterval(() => {
      setTick((value) => value + 1);
      load(query);
    }, 45_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const topRows = useMemo(() => (data?.signals ?? []).slice(0, 8), [data]);

  function submitSearch() {
    const next = input.trim().toUpperCase();
    if (!next) return;
    setQuery(next);
  }

  return (
    <section className="overflow-hidden rounded-[1.8rem] border border-emerald-300/15 bg-[#02090c]/90 shadow-2xl shadow-cyan-950/20 ring-1 ring-white/5 backdrop-blur">
      <div className="border-b border-white/10 bg-gradient-to-r from-emerald-400/10 via-cyan-400/10 to-transparent p-3 md:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-100 ring-1 ring-emerald-300/25">
              <Terminal size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black md:text-xl">Live Market Terminal</h2>
              <p className="text-xs text-slate-400">DEX live scan · PPS stream · terminal trading view</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-2 text-xs text-slate-300 ring-1 ring-white/10">
            <Circle size={8} className={`${loading ? 'animate-pulse text-amber-200' : 'text-emerald-300'}`} fill="currentColor" />
            <span>{loading ? 'SYNCING' : 'LIVE'}</span>
            <span className="text-slate-600">|</span>
            <span>{data?.source ?? 'waiting'}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-3 py-2 font-mono text-sm text-cyan-100">
            <span className="text-emerald-300">radar$</span>
            <Search size={15} className="text-slate-500" />
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submitSearch()}
              className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-600"
              placeholder="scan token: SOL, PEPE, AI..."
            />
            <button onClick={submitSearch} className="rounded-xl bg-cyan-300/15 px-3 py-1.5 text-xs font-black text-cyan-100 ring-1 ring-cyan-300/25">
              RUN
            </button>
          </div>
          <button onClick={() => load(query)} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/[0.09]">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
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

      <div className="grid gap-0 lg:grid-cols-[1fr_330px]">
        <div className="p-3 md:p-4">
          <div className="mb-3 grid grid-cols-3 gap-2 text-center md:grid-cols-5">
            <TerminalStat label="Query" value={query} />
            <TerminalStat label="Pairs" value={String(data?.count ?? 0)} />
            <TerminalStat label="Tick" value={`#${tick}`} />
            <TerminalStat label="Source" value={data?.source?.replace('fallback-', '') ?? '...'} hideMobile />
            <TerminalStat label="Updated" value={data?.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : '--:--'} hideMobile />
          </div>

          {error && (
            <div className="mb-3 rounded-2xl border border-red-300/20 bg-red-400/10 p-3 text-xs text-red-100">
              ERROR: {error}
            </div>
          )}

          {data?.warning && (
            <div className="mb-3 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-3 text-xs text-amber-100">
              WARNING: {data.warning}
            </div>
          )}

          <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-white/[0.05] text-slate-500">
                <tr>
                  <th className="px-3 py-3">PAIR</th>
                  <th className="px-3 py-3">PRICE</th>
                  <th className="px-3 py-3">1H</th>
                  <th className="px-3 py-3">VOL 1H</th>
                  <th className="px-3 py-3">LIQ</th>
                  <th className="px-3 py-3">PPS</th>
                  <th className="px-3 py-3">RISK</th>
                  <th className="px-3 py-3">SIGNAL</th>
                </tr>
              </thead>
              <tbody>
                {topRows.map((row) => (
                  <tr key={`${row.chain}-${row.exchange}-${row.symbol}`} className="border-t border-white/5 bg-black/15 text-slate-200 hover:bg-white/[0.04]">
                    <td className="px-3 py-3"><b className="text-white">{row.symbol}</b><span className="ml-2 text-slate-600">{row.chain}</span></td>
                    <td className="px-3 py-3 text-cyan-100">{priceFormat(row.price)}</td>
                    <td className={`px-3 py-3 font-black ${row.priceChange1h >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>{row.priceChange1h >= 0 ? '+' : ''}{row.priceChange1h.toFixed(2)}%</td>
                    <td className="px-3 py-3">${compact(row.volume1h)}</td>
                    <td className="px-3 py-3">${compact(row.liquidity)}</td>
                    <td className="px-3 py-3"><span className="rounded-full bg-emerald-400/15 px-2 py-1 font-black text-emerald-100">{row.pps}</span></td>
                    <td className="px-3 py-3"><span className="rounded-full bg-amber-400/15 px-2 py-1 font-black text-amber-100">{row.risk}</span></td>
                    <td className="px-3 py-3 text-[10px] text-slate-300">{row.signal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 md:hidden">
            {topRows.map((row) => (
              <div key={`${row.chain}-${row.exchange}-${row.symbol}`} className="rounded-2xl border border-white/10 bg-black/20 p-3 font-mono">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-white">{row.symbol}</p>
                    <p className="text-[11px] text-slate-500">{row.chain} · {row.exchange}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-cyan-100">{priceFormat(row.price)}</p>
                    <p className={`flex items-center justify-end gap-1 text-xs font-black ${row.priceChange1h >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
                      {row.priceChange1h >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {row.priceChange1h >= 0 ? '+' : ''}{row.priceChange1h.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px]">
                  <MiniCell label="PPS" value={String(row.pps)} tone="green" />
                  <MiniCell label="Risk" value={String(row.risk)} tone="amber" />
                  <MiniCell label="Vol" value={`$${compact(row.volume1h)}`} />
                  <MiniCell label="Liq" value={`$${compact(row.liquidity)}`} />
                </div>
                <p className="mt-2 truncate rounded-xl bg-white/[0.04] px-3 py-2 text-[11px] text-slate-300">{row.signal}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="border-t border-white/10 bg-black/20 p-3 md:p-4 lg:border-l lg:border-t-0">
          <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
            <Activity size={16} className="text-emerald-200" /> Event Stream
          </div>
          <div className="space-y-2 font-mono text-[11px] text-slate-300">
            <LogLine tone="green" text={`SCAN ${query} initialized`} />
            <LogLine tone="cyan" text={`DEX pairs loaded: ${data?.count ?? 0}`} />
            <LogLine tone="amber" text="PPS engine applied" />
            <LogLine tone="green" text="Risk filter active" />
            <LogLine tone="cyan" text={`Next refresh: 45s`} />
            {topRows.slice(0, 4).map((row) => (
              <LogLine key={row.symbol} tone={row.pps >= 70 ? 'green' : 'slate'} text={`${row.symbol} PPS=${row.pps} RISK=${row.risk}`} />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function TerminalStat({ label, value, hideMobile = false }: { label: string; value: string; hideMobile?: boolean }) {
  return (
    <div className={`rounded-2xl bg-black/25 p-3 ring-1 ring-white/10 ${hideMobile ? 'hidden md:block' : ''}`}>
      <p className="text-[10px] uppercase tracking-widest text-slate-600">{label}</p>
      <p className="mt-1 truncate font-mono text-xs font-black text-slate-100">{value}</p>
    </div>
  );
}

function MiniCell({ label, value, tone = 'slate' }: { label: string; value: string; tone?: 'green' | 'amber' | 'slate' }) {
  const color = tone === 'green' ? 'text-emerald-100' : tone === 'amber' ? 'text-amber-100' : 'text-slate-100';
  return (
    <div className="rounded-xl bg-black/25 p-2 ring-1 ring-white/10">
      <p className="text-[9px] uppercase text-slate-600">{label}</p>
      <p className={`truncate font-black ${color}`}>{value}</p>
    </div>
  );
}

function LogLine({ text, tone }: { text: string; tone: 'green' | 'cyan' | 'amber' | 'slate' }) {
  const color = {
    green: 'text-emerald-300',
    cyan: 'text-cyan-300',
    amber: 'text-amber-300',
    slate: 'text-slate-500'
  }[tone];

  return (
    <div className="flex gap-2 rounded-xl bg-white/[0.035] px-3 py-2 ring-1 ring-white/5">
      <span className={color}>●</span>
      <span className="truncate">{text}</span>
    </div>
  );
}
