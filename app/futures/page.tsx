'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Circle,
  LineChart,
  RefreshCw
} from 'lucide-react';

type SummaryRow = {
  symbol: string;
  openInterest: {
    lastValue: number;
    firstValue: number;
    changePct: number;
    points: number;
    updatedAt: string | null;
  } | null;
  fundingRate: {
    lastValue: number;
    firstValue: number;
    changePct: number;
    points: number;
    updatedAt: string | null;
  } | null;
  pressure: 'BUILDING_PRESSURE' | 'OI_UNWINDING' | 'NEUTRAL' | 'UNKNOWN';
};

type ApiResponse = {
  updatedAt: string;
  source: string;
  mode: 'summary' | 'raw';
  symbols: string[];
  interval: string;
  summary: SummaryRow[];
  warning?: string;
  message?: string;
  error?: string;
};

const PRESET_SYMBOLS = [
  { key: 'BTCUSDT_PERP.A', label: 'BTC' },
  { key: 'ETHUSDT_PERP.A', label: 'ETH' },
  { key: 'SOLUSDT_PERP.A', label: 'SOL' },
  { key: 'BNBUSDT_PERP.A', label: 'BNB' },
  { key: 'XRPUSDT_PERP.A', label: 'XRP' },
  { key: 'DOGEUSDT_PERP.A', label: 'DOGE' }
];

const DEFAULT_SELECTION = ['BTCUSDT_PERP.A', 'ETHUSDT_PERP.A', 'SOLUSDT_PERP.A'];

const INTERVALS = ['15min', '30min', '1hour', '4hour', 'daily'] as const;
type Interval = (typeof INTERVALS)[number];

const compact = (value: number) =>
  Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(value || 0);

function pressureLabel(p: SummaryRow['pressure']) {
  if (p === 'BUILDING_PRESSURE')
    return { text: 'BUILDING PRESSURE', tone: 'text-emerald-200 bg-emerald-400/12 ring-emerald-400/25' };
  if (p === 'OI_UNWINDING')
    return { text: 'OI UNWINDING', tone: 'text-red-200 bg-red-400/12 ring-red-400/25' };
  if (p === 'NEUTRAL')
    return { text: 'NEUTRAL', tone: 'text-cyan-100 bg-cyan-400/12 ring-cyan-400/25' };
  return { text: 'UNKNOWN', tone: 'text-slate-200 bg-slate-400/10 ring-slate-400/20' };
}

export default function FuturesPage() {
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTION);
  const [intervalValue, setIntervalValue] = useState<Interval>('1hour');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!selected.length) {
        setData(null);
        return;
      }
      if (!silent) setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          symbols: selected.join(','),
          interval: intervalValue
        });
        const response = await fetch(`/api/derivatives?${params.toString()}`, { cache: 'no-store' });
        const json = (await response.json()) as ApiResponse;
        if (!response.ok && !json.summary) {
          throw new Error(json.message || json.error || 'Coinalyze request failed');
        }
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    },
    [selected, intervalValue]
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTick((v) => v + 1);
      void load(true);
    }, 60_000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [load]);

  function toggleSymbol(key: string) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  }

  const rows = data?.summary ?? [];

  const aggregate = useMemo(() => {
    if (!rows.length) {
      return { totalOi: 0, avgChange: 0, avgFunding: 0, building: 0, unwinding: 0 };
    }
    const totalOi = rows.reduce((acc, r) => acc + (r.openInterest?.lastValue ?? 0), 0);
    const oiChanges = rows
      .map((r) => r.openInterest?.changePct ?? 0)
      .filter((v) => Number.isFinite(v));
    const fundings = rows
      .map((r) => r.fundingRate?.lastValue ?? 0)
      .filter((v) => Number.isFinite(v));
    const avgChange = oiChanges.length ? oiChanges.reduce((a, b) => a + b, 0) / oiChanges.length : 0;
    const avgFunding = fundings.length ? fundings.reduce((a, b) => a + b, 0) / fundings.length : 0;
    const building = rows.filter((r) => r.pressure === 'BUILDING_PRESSURE').length;
    const unwinding = rows.filter((r) => r.pressure === 'OI_UNWINDING').length;
    return { totalOi, avgChange, avgFunding, building, unwinding };
  }, [rows]);

  return (
    <main className="relative">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(53,214,255,0.18),transparent_30%),radial-gradient(circle_at_85%_5%,rgba(255,204,102,0.10),transparent_28%)]" />
      <section className="mx-auto max-w-6xl space-y-4 px-3 py-4 md:px-6 md:py-6">
        {/* Hero */}
        <header className="overflow-hidden rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/10 via-white/[0.04] to-amber-300/[0.06] p-4 shadow-2xl shadow-cyan-950/30 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/80">
                Coinalyze Terminal
              </p>
              <h1 className="mt-1 text-2xl font-black md:text-4xl">Futures Pressure</h1>
              <p className="mt-1 text-[11px] text-slate-400 md:text-sm">
                Open interest, funding rate, dan pressure map.
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-100 ring-1 ring-cyan-300/25 md:h-12 md:w-12">
              <LineChart size={20} />
            </div>
          </div>

          {/* Symbol selector + interval */}
          <div className="mt-4 space-y-2">
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-0.5">
              {PRESET_SYMBOLS.map((sym) => {
                const active = selected.includes(sym.key);
                return (
                  <button
                    key={sym.key}
                    onClick={() => toggleSymbol(sym.key)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black ring-1 transition ${
                      active
                        ? 'bg-cyan-300/20 text-cyan-100 ring-cyan-300/35 shadow-inner shadow-cyan-500/10'
                        : 'bg-white/[0.03] text-slate-400 ring-white/10 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    {sym.label}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
                {INTERVALS.map((iv) => (
                  <button
                    key={iv}
                    onClick={() => setIntervalValue(iv)}
                    className={`rounded-md px-2.5 py-1 font-mono text-[10px] font-black ring-1 transition ${
                      intervalValue === iv
                        ? 'bg-emerald-300/15 text-emerald-100 ring-emerald-300/30'
                        : 'bg-white/[0.03] text-slate-500 ring-white/10 hover:text-white'
                    }`}
                  >
                    {iv}
                  </button>
                ))}
              </div>
              <button
                onClick={() => void load()}
                className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold text-slate-200 transition hover:bg-white/[0.08]"
              >
                <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Summary cards */}
        <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <SummaryCard
            label="Symbols"
            value={String(selected.length)}
            hint={`tick #${tick}`}
            tone="cyan"
          />
          <SummaryCard
            label="Avg OI 24h"
            value={`${aggregate.avgChange >= 0 ? '+' : ''}${aggregate.avgChange.toFixed(2)}%`}
            hint="rata-rata"
            tone={aggregate.avgChange >= 0 ? 'green' : 'red'}
          />
          <SummaryCard
            label="Avg Funding"
            value={aggregate.avgFunding.toFixed(5)}
            hint="latest"
            tone="amber"
          />
          <SummaryCard
            label="Building"
            value={String(aggregate.building)}
            hint={`${aggregate.unwinding} unwinding`}
            tone="green"
          />
        </section>

        {/* Banners */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-300/25 bg-red-400/10 p-3 text-xs text-red-100">
            <AlertTriangle size={14} className="mt-0.5 text-red-300" />
            <div>
              <p className="font-black uppercase tracking-widest">Error</p>
              <p className="text-red-200/90">{error}</p>
            </div>
          </div>
        )}
        {data?.warning && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-300/25 bg-amber-400/10 p-3 text-xs text-amber-100">
            <AlertTriangle size={14} className="mt-0.5 text-amber-300" />
            <p>{data.warning}</p>
          </div>
        )}

        {/* Terminal table */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-500 md:px-4">
            <span>radar:futures$ coinalyze --interval={intervalValue}</span>
            <span className="flex items-center gap-1.5">
              <Circle
                size={6}
                className={loading ? 'animate-pulse text-amber-200' : 'text-emerald-300'}
                fill="currentColor"
              />
              {loading ? 'syncing' : 'live'}
            </span>
          </div>

          {loading && rows.length === 0 ? (
            <div className="space-y-2 p-3 md:p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03]"
                />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              <p className="font-black uppercase tracking-widest">No data</p>
              <p className="mt-1">Pilih minimal 1 simbol di atas.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-white/[0.03] text-[10px] uppercase tracking-widest text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Symbol</th>
                      <th className="px-4 py-3">OI Now</th>
                      <th className="px-4 py-3">OI 24h</th>
                      <th className="px-4 py-3">Funding</th>
                      <th className="px-4 py-3">Pressure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const oi = row.openInterest;
                      const funding = row.fundingRate;
                      const change = oi?.changePct ?? 0;
                      const positive = change >= 0;
                      const press = pressureLabel(row.pressure);
                      return (
                        <tr key={row.symbol} className="border-t border-white/5">
                          <td className="px-4 py-3 font-black text-white">{row.symbol}</td>
                          <td className="px-4 py-3 text-cyan-100">
                            {compact(oi?.lastValue ?? 0)}
                          </td>
                          <td
                            className={`px-4 py-3 font-black ${positive ? 'text-emerald-200' : 'text-red-200'}`}
                          >
                            {positive ? '+' : ''}
                            {change.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-amber-100">
                            {(funding?.lastValue ?? 0).toFixed(6)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-black ring-1 ${press.tone}`}
                            >
                              {press.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="space-y-2 p-3 md:hidden">
                {rows.map((row) => {
                  const oi = row.openInterest;
                  const funding = row.fundingRate;
                  const change = oi?.changePct ?? 0;
                  const positive = change >= 0;
                  const press = pressureLabel(row.pressure);
                  return (
                    <div
                      key={row.symbol}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-3 font-mono"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-white">{row.symbol}</p>
                          <span
                            className={`mt-1 inline-block rounded-md px-2 py-0.5 text-[9px] font-black ring-1 ${press.tone}`}
                          >
                            {press.text}
                          </span>
                        </div>
                        <p
                          className={`flex items-center gap-1 text-sm font-black ${positive ? 'text-emerald-200' : 'text-red-200'}`}
                        >
                          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {positive ? '+' : ''}
                          {change.toFixed(2)}%
                        </p>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px]">
                        <Cell label="OI" value={compact(oi?.lastValue ?? 0)} />
                        <Cell label="Funding" value={(funding?.lastValue ?? 0).toFixed(6)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <p className="text-center text-[10px] uppercase tracking-widest text-slate-600">
          <Activity size={10} className="mr-1 inline-block text-emerald-300" />
          auto-refresh 60s · raw via /api/derivatives?raw=1
        </p>
      </section>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  tone
}: {
  label: string;
  value: string;
  hint: string;
  tone: 'green' | 'red' | 'cyan' | 'amber';
}) {
  const toneClass = {
    green: 'from-emerald-300/15 text-emerald-100',
    red: 'from-red-300/15 text-red-100',
    cyan: 'from-cyan-300/15 text-cyan-100',
    amber: 'from-amber-300/15 text-amber-100'
  }[tone];

  return (
    <div
      className={`rounded-xl border border-white/10 bg-gradient-to-br ${toneClass} to-white/[0.025] p-3 shadow-xl shadow-black/20`}
    >
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 truncate text-lg font-black md:text-xl">{value}</p>
      <p className="mt-0.5 text-[10px] text-slate-600">{hint}</p>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-black/30 p-1.5 ring-1 ring-white/10">
      <p className="text-[9px] uppercase text-slate-500">{label}</p>
      <p className="truncate font-black text-white">{value}</p>
    </div>
  );
}
