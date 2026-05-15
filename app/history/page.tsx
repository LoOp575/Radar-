'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  Circle,
  Database,
  Inbox,
  RefreshCw,
  Save,
  Sparkles
} from 'lucide-react';

type SignalRow = {
  id: string;
  symbol: string;
  chain: string;
  pps: number;
  risk: number;
  signal: string;
  confidence: string;
  reasons: unknown;
  warnings: unknown;
  entryPrice: number | null;
  invalidPrice: number | null;
  createdAt: string;
};

type HistoryResponse = {
  updatedAt: string;
  count: number;
  signals: SignalRow[];
  error?: string;
  message?: string;
};

function ppsBadge(score: number) {
  if (score >= 75) return 'text-emerald-200 bg-emerald-400/15 ring-emerald-400/30';
  if (score >= 60) return 'text-cyan-100 bg-cyan-400/15 ring-cyan-400/30';
  return 'text-slate-200 bg-slate-400/12 ring-slate-400/25';
}

function riskBadge(risk: number) {
  if (risk <= 30) return 'text-emerald-200 bg-emerald-400/15 ring-emerald-400/30';
  if (risk <= 55) return 'text-amber-100 bg-amber-400/15 ring-amber-400/30';
  return 'text-red-200 bg-red-400/15 ring-red-400/30';
}

function signalBadge(signal: string) {
  if (/DANGER|LATE|DISTRIBUTION/.test(signal))
    return 'text-red-200 bg-red-400/12 ring-red-400/25';
  if (/BREAKOUT|EARLY/.test(signal))
    return 'text-emerald-200 bg-emerald-400/12 ring-emerald-400/25';
  return 'text-cyan-100 bg-cyan-400/12 ring-cyan-400/25';
}

function asStringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  return [];
}

export default function HistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/signals/history?limit=50', { cache: 'no-store' });
      const json = (await res.json()) as HistoryResponse;
      if (!res.ok) {
        throw new Error(json.message || json.error || 'Failed to load history');
      }
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveMockSignals() {
    setSaving(true);
    setSavedNotice(null);
    setError(null);
    try {
      const res = await fetch('/api/signals/save', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || json.error || 'Save failed');
      }
      if (json.skipped) {
        setSavedNotice('DATABASE_URL belum diset. Tambahkan di Vercel untuk mulai menyimpan signal.');
      } else {
        setSavedNotice(`Tersimpan ${json.saved} sinyal ke database.`);
        await load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  const signals = data?.signals ?? [];
  const count = signals.length;

  return (
    <main className="relative">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(72,240,164,0.14),transparent_30%),radial-gradient(circle_at_85%_5%,rgba(53,214,255,0.14),transparent_28%)]" />
      <section className="mx-auto max-w-5xl space-y-4 px-3 py-4 md:px-6 md:py-6">
        <header className="overflow-hidden rounded-2xl border border-emerald-300/15 bg-gradient-to-br from-emerald-300/10 via-white/[0.04] to-cyan-300/[0.06] p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-200/80">
                Signal Vault
              </p>
              <h1 className="mt-1 text-2xl font-black md:text-4xl">History</h1>
              <p className="mt-1 text-[11px] text-slate-400 md:text-sm">
                Sinyal tersimpan di Supabase. Aktifkan dengan DATABASE_URL.
              </p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-100 ring-1 ring-emerald-300/25 md:h-12 md:w-12">
              <Database size={20} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => void load()}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-200 transition hover:bg-white/[0.08]"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              onClick={saveMockSignals}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-300/25 bg-emerald-300/15 px-3 py-1.5 text-xs font-black text-emerald-100 transition hover:bg-emerald-300/25 disabled:opacity-50"
            >
              <Save size={12} className={saving ? 'animate-pulse' : ''} />
              {saving ? 'Saving…' : 'Save mock signals'}
            </button>
            <span className="rounded-md bg-black/30 px-2.5 py-1 font-mono text-[10px] text-slate-400 ring-1 ring-white/10">
              {count} entries
            </span>
          </div>
        </header>

        {savedNotice && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-300/25 bg-emerald-400/10 p-3 text-xs text-emerald-100">
            <Sparkles size={14} className="mt-0.5 text-emerald-300" />
            <p>{savedNotice}</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-300/25 bg-red-400/10 p-3 text-xs text-red-100">
            <AlertTriangle size={14} className="mt-0.5 text-red-300" />
            <p>{error}</p>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-500 md:px-4">
            <span>radar:history$ tail signals</span>
            <span className="flex items-center gap-1.5">
              <Circle
                size={6}
                className={loading ? 'animate-pulse text-amber-200' : 'text-emerald-300'}
                fill="currentColor"
              />
              {loading ? 'syncing' : 'live'}
            </span>
          </div>

          {loading && signals.length === 0 ? (
            <div className="space-y-2 p-3 md:p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-lg bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03]"
                />
              ))}
            </div>
          ) : signals.length === 0 ? (
            <EmptyState onSave={saveMockSignals} saving={saving} />
          ) : (
            <ul className="space-y-2 p-3 md:p-4">
              {signals.map((row) => {
                const reasons = asStringList(row.reasons);
                const warnings = asStringList(row.warnings);
                const time = new Date(row.createdAt).toLocaleString('en-GB', { hour12: false });
                return (
                  <li
                    key={row.id}
                    className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.015] p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-base font-black text-white md:text-lg">{row.symbol}</p>
                          <span className="rounded-md bg-black/30 px-2 py-0.5 font-mono text-[10px] text-slate-400 ring-1 ring-white/10">
                            {row.chain}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ${signalBadge(row.signal)}`}
                          >
                            {row.signal}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-[10px] text-slate-500">{time}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-black ring-1 ${ppsBadge(row.pps)}`}
                        >
                          {row.pps} PPS
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-black ring-1 ${riskBadge(row.risk)}`}
                        >
                          R{row.risk}
                        </span>
                      </div>
                    </div>
                    {(reasons.length > 0 || warnings.length > 0) && (
                      <div className="mt-2 grid gap-1.5 text-[11px] md:grid-cols-2 md:text-xs">
                        {reasons.slice(0, 2).map((r) => (
                          <div
                            key={r}
                            className="rounded-lg bg-emerald-300/5 px-2.5 py-1.5 text-emerald-100 ring-1 ring-emerald-300/15"
                          >
                            ✓ {r}
                          </div>
                        ))}
                        {warnings.slice(0, 2).map((w) => (
                          <div
                            key={w}
                            className="rounded-lg bg-amber-300/5 px-2.5 py-1.5 text-amber-100 ring-1 ring-amber-300/15"
                          >
                            ! {w}
                          </div>
                        ))}
                      </div>
                    )}
                    {row.entryPrice !== null && (
                      <div className="mt-2 flex items-center justify-between rounded-lg bg-black/25 px-2.5 py-1.5 text-[10px] text-slate-400 ring-1 ring-white/10 md:text-xs">
                        <span>
                          Entry:{' '}
                          <b className="text-cyan-100">${row.entryPrice.toFixed(6)}</b>
                        </span>
                        {row.invalidPrice !== null && (
                          <span>
                            Invalid:{' '}
                            <b className="text-red-200">${row.invalidPrice.toFixed(6)}</b>
                          </span>
                        )}
                        <span className="font-mono text-slate-500">{row.confidence}</span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

function EmptyState({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  return (
    <div className="px-4 py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100 ring-1 ring-cyan-300/25">
        <Inbox size={26} />
      </div>
      <h3 className="mt-3 text-base font-black text-white md:text-lg">Belum ada signal tersimpan</h3>
      <p className="mx-auto mt-1 max-w-sm text-[11px] text-slate-400 md:text-xs">
        Set <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono">DATABASE_URL</code> di env
        Vercel, lalu klik tombol di bawah untuk membuat sample.
      </p>
      <button
        onClick={onSave}
        disabled={saving}
        className="mx-auto mt-4 flex items-center gap-1.5 rounded-xl border border-emerald-300/25 bg-emerald-300/15 px-4 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-300/25 disabled:opacity-50"
      >
        <Save size={13} />
        {saving ? 'Saving…' : 'Save mock signals'}
      </button>
    </div>
  );
}
