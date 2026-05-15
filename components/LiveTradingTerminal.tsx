'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Circle,
  RefreshCw,
  Search,
  Terminal,
  Zap
} from 'lucide-react';

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

type LogEntry = {
  id: number;
  tone: 'green' | 'cyan' | 'amber' | 'red' | 'slate';
  text: string;
  time: string;
};

const QUICK_TABS = ['SOL', 'AI', 'PEPE', 'BNB', 'ETH', 'BASE'];
const REFRESH_INTERVAL_MS = 45_000;

const compact = (value: number) =>
  Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(value || 0);

function priceFormat(value: number) {
  if (!value) return '$0';
  if (value < 0.0001) return `$${value.toExponential(2)}`;
  if (value < 1) return `$${value.toFixed(6)}`;
  return `$${value.toFixed(4)}`;
}

function nowTime() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

function ppsTone(pps: number) {
  if (pps >= 75) return 'text-emerald-200 bg-emerald-400/15 ring-emerald-400/25';
  if (pps >= 60) return 'text-cyan-100 bg-cyan-400/15 ring-cyan-400/25';
  return 'text-slate-200 bg-slate-400/10 ring-slate-400/20';
}

function riskTone(risk: number) {
  if (risk >= 60) return 'text-red-200 bg-red-400/15 ring-red-400/25';
  if (risk >= 40) return 'text-amber-100 bg-amber-400/15 ring-amber-400/25';
  return 'text-emerald-200 bg-emerald-400/12 ring-emerald-400/25';
}

function signalTone(signal: string) {
  if (/DANGER|LATE|DISTRIBUTION/.test(signal)) return 'text-red-200 bg-red-400/12 ring-red-400/25';
  if (/BREAKOUT|EARLY/.test(signal)) return 'text-emerald-200 bg-emerald-400/12 ring-emerald-400/25';
  return 'text-cyan-100 bg-cyan-400/12 ring-cyan-400/25';
}

export function LiveTradingTerminal() {
  const [query, setQuery] = useState('SOL');
  const [input, setInput] = useState('SOL');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);

  const pushLog = useCallback((tone: LogEntry['tone'], text: string) => {
    setLogs((prev) => {
      const id = ++logIdRef.current;
      const next = [{ id, tone, text, time: nowTime() }, ...prev];
      return next.slice(0, 14);
    });
  }, []);

  const load = useCallback(
    async (q: string, silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      pushLog('cyan', `radar$ scan ${q}`);
      try {
        const response = await fetch(`/api/dex?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
        const json = (await response.json()) as ApiResponse;
        if (!response.ok) throw new Error(json.errorMessage || 'DEX API error');
        setData(json);
        pushLog('green', `pairs=${json.count} src=${json.source}`);
        if (json.warning) pushLog('amber', json.warning);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        pushLog('red', `error: ${msg}`);
      } finally {
        setLoading(false);
      }
    },
    [pushLog]
  );

  useEffect(() => {
    void load(query);
    const interval = setInterval(() => {
      setTick((value) => value + 1);
      void load(query, true);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [query, load]);

  const topRows = useMemo(() => (data?.signals ?? []).slice(0, 8), [data]);
  const isStale = !data && !loading;

  function submitSearch() {
    const next = input.trim().toUpperCase();
    if (!next || next === query) return;
    setQuery(next);
  }

  function handleQuickTab(tab: string) {
    setInput(tab);
    setQuery(tab);
  }

  return (
    <section className="overflow-hidden rounded-[1.6rem] border border-emerald-300/15 bg-[#02090c]/95 shadow-2xl shadow-cyan-950/30 ring-1 ring-white/[0.04] backdrop-blur">
      {/* Header / command bar */}
      <div className="border-b border-white/10 bg-gradient-to-r from-emerald-400/8 via-cyan-400/8 to-transparent">
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.04] px-3 py-2 md:px-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
              radar.terminal
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] ring-1 ring-white/10">
            <Circle
              size={7}
              className={loading ? 'animate-pulse text-amber-200' : 'text-emerald-300'}
              fill="currentColor"
            />
            <span className={loading ? 'text-amber-100' : 'text-emerald-100'}>
              {loading ? 'SYNCING' : 'LIVE'}
            </span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400">{data?.source ?? 'idle'}</span>
          </div>
        </div>

        <div className="px-3 py-3 md:px-4 md:py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-100 ring-1 ring-emerald-300/25 md:h-10 md:w-10">
                <Terminal size={18} />
              </div>
              <div>
                <h2 className="text-base font-black md:text-xl">Live Market Terminal</h2>
                <p className="text-[11px] text-slate-400 md:text-xs">
                  DEX scanner · PPS engine · risk filter
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start text-[10px] font-black uppercase tracking-widest text-slate-500 md:self-auto">
              <Zap size={11} className="text-amber-300" />
              <span>auto-refresh 45s</span>
            </div>
          </div>

          {/* Command bar */}
          <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-cyan-100">
              <span className="text-emerald-300">radar$</span>
              <span className="text-slate-500">scan</span>
              <Search size={14} className="text-slate-500" />
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && submitSearch()}
                className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-600"
                placeholder="SOL, PEPE, AI..."
              />
              <button
                onClick={submitSearch}
                className="rounded-lg bg-cyan-300/15 px-2.5 py-1 text-[11px] font-black text-cyan-100 ring-1 ring-cyan-300/25 transition hover:bg-cyan-300/25"
              >
                RUN
              </button>
            </div>
            <button
              onClick={() => void load(query)}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/[0.08] md:text-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Quick tabs */}
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-0.5">
            {QUICK_TABS.map((item) => (
              <button
                key={item}
                onClick={() => handleQuickTab(item)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black ring-1 transition ${
                  query === item
                    ? 'bg-emerald-300/18 text-emerald-100 ring-emerald-300/35 shadow-inner shadow-emerald-500/10'
                    : 'bg-white/[0.03] text-slate-400 ring-white/10 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
        <div className="p-3 md:p-4">
          {/* Stats strip */}
          <div className="mb-3 grid grid-cols-3 gap-2 md:grid-cols-5">
            <TerminalStat label="Query" value={query} />
            <TerminalStat label="Pairs" value={String(data?.count ?? 0)} />
            <TerminalStat label="Tick" value={`#${tick}`} />
            <TerminalStat
              label="Source"
              value={(data?.source ?? '...').replace('fallback-', '')}
              hideMobile
            />
            <TerminalStat
              label="Updated"
              value={data?.updatedAt ? new Date(data.updatedAt).toLocaleTimeString('en-GB', { hour12: false }) : '--:--:--'}
              hideMobile
            />
          </div>

          {/* Banners */}
          {error && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-300/25 bg-red-400/10 p-3 text-[11px] text-red-100">
              <Circle size={8} className="mt-0.5 text-red-300" fill="currentColor" />
              <div>
                <p className="font-black uppercase tracking-widest">Endpoint error</p>
                <p className="text-red-200/90">{error}</p>
              </div>
            </div>
          )}
          {data?.warning && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-amber-300/25 bg-amber-400/10 p-3 text-[11px] text-amber-100">
              <Circle size={8} className="mt-0.5 text-amber-300" fill="currentColor" />
              <div>
                <p className="font-black uppercase tracking-widest">Fallback</p>
                <p className="text-amber-200/90">{data.warning}</p>
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && !data && <SkeletonRows />}

          {/* Empty state */}
          {!loading && data && topRows.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-center text-sm text-slate-400">
              <p className="font-black uppercase tracking-widest text-slate-300">No pairs</p>
              <p className="mt-1 text-xs">Coba query lain seperti SOL, PEPE, atau AI.</p>
            </div>
          )}

          {/* Desktop table */}
          {topRows.length > 0 && (
            <>
              <div className="hidden overflow-hidden rounded-xl border border-white/10 md:block">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-white/[0.04] text-[10px] uppercase tracking-widest text-slate-500">
                    <tr>
                      <th className="px-3 py-3">Pair</th>
                      <th className="px-3 py-3">Price</th>
                      <th className="px-3 py-3">1H</th>
                      <th className="px-3 py-3">Vol 1H</th>
                      <th className="px-3 py-3">Liq</th>
                      <th className="px-3 py-3">PPS</th>
                      <th className="px-3 py-3">Risk</th>
                      <th className="px-3 py-3">Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topRows.map((row) => (
                      <tr
                        key={`${row.chain}-${row.exchange}-${row.symbol}`}
                        className="border-t border-white/5 bg-black/15 text-slate-200 transition hover:bg-white/[0.04]"
                      >
                        <td className="px-3 py-3">
                          <b className="text-white">{row.symbol}</b>
                          <span className="ml-2 text-[10px] text-slate-500">{row.chain}</span>
                        </td>
                        <td className="px-3 py-3 text-cyan-100">{priceFormat(row.price)}</td>
                        <td
                          className={`px-3 py-3 font-black ${
                            row.priceChange1h >= 0 ? 'text-emerald-200' : 'text-red-200'
                          }`}
                        >
                          {row.priceChange1h >= 0 ? '+' : ''}
                          {row.priceChange1h.toFixed(2)}%
                        </td>
                        <td className="px-3 py-3">${compact(row.volume1h)}</td>
                        <td className="px-3 py-3">${compact(row.liquidity)}</td>
                        <td className="px-3 py-3">
                          <span className={`rounded-md px-2 py-0.5 font-black ring-1 ${ppsTone(row.pps)}`}>
                            {row.pps}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`rounded-md px-2 py-0.5 font-black ring-1 ${riskTone(row.risk)}`}>
                            {row.risk}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ${signalTone(row.signal)}`}
                          >
                            {row.signal}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-2 md:hidden">
                {topRows.map((row) => (
                  <div
                    key={`${row.chain}-${row.exchange}-${row.symbol}`}
                    className="rounded-xl border border-white/10 bg-black/25 p-3 font-mono"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-black text-white">{row.symbol}</p>
                        <p className="truncate text-[10px] text-slate-500">
                          {row.chain} · {row.exchange}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-cyan-100">{priceFormat(row.price)}</p>
                        <p
                          className={`flex items-center justify-end gap-1 text-xs font-black ${
                            row.priceChange1h >= 0 ? 'text-emerald-200' : 'text-red-200'
                          }`}
                        >
                          {row.priceChange1h >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {row.priceChange1h >= 0 ? '+' : ''}
                          {row.priceChange1h.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-1.5 text-center text-[10px]">
                      <MiniCell label="PPS" value={String(row.pps)} tone={ppsTone(row.pps)} />
                      <MiniCell label="Risk" value={String(row.risk)} tone={riskTone(row.risk)} />
                      <MiniCell label="Vol" value={`$${compact(row.volume1h)}`} />
                      <MiniCell label="Liq" value={`$${compact(row.liquidity)}`} />
                    </div>
                    <p
                      className={`mt-2 truncate rounded-lg px-2.5 py-1.5 text-[10px] font-bold ring-1 ${signalTone(row.signal)}`}
                    >
                      {row.signal}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {isStale && (
            <p className="mt-3 text-center text-[10px] uppercase tracking-widest text-slate-600">
              waiting for first scan...
            </p>
          )}
        </div>

        {/* Event stream */}
        <aside className="border-t border-white/10 bg-black/20 p-3 md:p-4 lg:border-l lg:border-t-0">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-black text-white">
              <Activity size={14} className="text-emerald-200" /> Event Stream
            </div>
            <span className="text-[10px] uppercase tracking-widest text-slate-600">tail -f</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px] text-slate-300">
            {logs.length === 0 && (
              <p className="rounded-lg bg-white/[0.03] px-3 py-2 text-slate-500">waiting for events…</p>
            )}
            {logs.map((entry) => (
              <LogLine key={entry.id} time={entry.time} tone={entry.tone} text={entry.text} />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function TerminalStat({
  label,
  value,
  hideMobile = false
}: {
  label: string;
  value: string;
  hideMobile?: boolean;
}) {
  return (
    <div
      className={`rounded-xl bg-black/30 p-2.5 ring-1 ring-white/10 ${hideMobile ? 'hidden md:block' : ''}`}
    >
      <p className="text-[9px] uppercase tracking-widest text-slate-600">{label}</p>
      <p className="mt-0.5 truncate font-mono text-xs font-black text-slate-100">{value}</p>
    </div>
  );
}

function MiniCell({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className={`rounded-md p-1.5 ring-1 ${tone ?? 'bg-black/25 ring-white/10 text-slate-200'}`}>
      <p className="text-[9px] uppercase text-slate-500">{label}</p>
      <p className="truncate font-black">{value}</p>
    </div>
  );
}

function LogLine({
  text,
  tone,
  time
}: {
  text: string;
  tone: LogEntry['tone'];
  time: string;
}) {
  const color = {
    green: 'text-emerald-300',
    cyan: 'text-cyan-300',
    amber: 'text-amber-300',
    red: 'text-red-300',
    slate: 'text-slate-500'
  }[tone];

  return (
    <div className="flex items-start gap-2 rounded-md bg-white/[0.025] px-2.5 py-1.5 ring-1 ring-white/5">
      <span className="text-[10px] text-slate-600">{time}</span>
      <span className={color}>●</span>
      <span className="truncate text-slate-300">{text}</span>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-14 animate-pulse rounded-xl border border-white/10 bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03]"
        />
      ))}
    </div>
  );
}
