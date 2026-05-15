'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Circle, RefreshCw, ShieldAlert, ShieldCheck, Wifi } from 'lucide-react';

type ServiceStatus = {
  name: string;
  state: 'configured' | 'missing' | 'optional';
  envKey?: string;
  hint: string;
  testEndpoint?: string;
};

type StatusResponse = {
  updatedAt: string;
  environment?: string;
  services: ServiceStatus[];
};

type ProbeResult = {
  ok: boolean;
  status: number;
  ms: number;
  message?: string;
};

function stateBadge(state: ServiceStatus['state']) {
  if (state === 'configured')
    return { label: 'CONFIGURED', tone: 'text-emerald-200 bg-emerald-400/12 ring-emerald-400/25' };
  if (state === 'missing')
    return { label: 'MISSING', tone: 'text-red-200 bg-red-400/12 ring-red-400/25' };
  return { label: 'OPTIONAL', tone: 'text-amber-100 bg-amber-400/12 ring-amber-400/25' };
}

export default function StatusPage() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [probes, setProbes] = useState<Record<string, ProbeResult | 'loading'>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/status', { cache: 'no-store' });
      const json = (await res.json()) as StatusResponse;
      if (!res.ok) throw new Error('Failed to load status');
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

  async function probe(endpoint: string, name: string) {
    setProbes((prev) => ({ ...prev, [name]: 'loading' }));
    const start = performance.now();
    try {
      const res = await fetch(endpoint, { cache: 'no-store' });
      // intentionally do not parse body to avoid surfacing secrets
      const ms = Math.round(performance.now() - start);
      setProbes((prev) => ({
        ...prev,
        [name]: {
          ok: res.ok,
          status: res.status,
          ms,
          message: res.ok ? 'OK' : `HTTP ${res.status}`
        }
      }));
    } catch (err) {
      const ms = Math.round(performance.now() - start);
      setProbes((prev) => ({
        ...prev,
        [name]: {
          ok: false,
          status: 0,
          ms,
          message: err instanceof Error ? err.message : 'network error'
        }
      }));
    }
  }

  const services = data?.services ?? [];
  const configured = services.filter((s) => s.state === 'configured').length;
  const missing = services.filter((s) => s.state === 'missing').length;
  const optional = services.filter((s) => s.state === 'optional').length;

  return (
    <main className="relative">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(53,214,255,0.16),transparent_30%),radial-gradient(circle_at_85%_5%,rgba(72,240,164,0.12),transparent_28%)]" />
      <section className="mx-auto max-w-5xl space-y-4 px-3 py-4 md:px-6 md:py-6">
        <header className="overflow-hidden rounded-2xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/10 via-white/[0.04] to-emerald-300/10 p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/80">
                Health Check
              </p>
              <h1 className="mt-1 text-2xl font-black md:text-4xl">API Status</h1>
              <p className="mt-1 text-[11px] text-slate-400 md:text-sm">
                Cek konfigurasi env & endpoint. Tidak menampilkan secret value.
              </p>
            </div>
            <button
              onClick={() => void load()}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/[0.08]"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Stat label="Configured" value={String(configured)} tone="green" />
            <Stat label="Missing" value={String(missing)} tone="red" />
            <Stat label="Optional" value={String(optional)} tone="amber" />
          </div>
        </header>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-300/25 bg-red-400/10 p-3 text-xs text-red-100">
            <ShieldAlert size={14} className="mt-0.5 text-red-300" />
            <p>{error}</p>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-500 md:px-4">
            <span>radar:status$ probe --safe</span>
            <span className="flex items-center gap-1.5">
              <Circle
                size={6}
                className={loading ? 'animate-pulse text-amber-200' : 'text-emerald-300'}
                fill="currentColor"
              />
              {loading ? 'syncing' : 'live'}
            </span>
          </div>

          {loading && services.length === 0 ? (
            <div className="space-y-2 p-3 md:p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03]"
                />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {services.map((service) => {
                const badge = stateBadge(service.state);
                const probeResult = probes[service.name];
                return (
                  <li key={service.name} className="p-3 md:px-4 md:py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-100 ring-1 ring-cyan-400/25">
                            <Wifi size={13} />
                          </span>
                          <p className="text-sm font-black text-white md:text-base">
                            {service.name}
                          </p>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400 md:text-xs">{service.hint}</p>
                        {service.envKey && (
                          <p className="mt-1 font-mono text-[10px] text-slate-600">
                            env: {service.envKey}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-black ring-1 ${badge.tone}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    {service.testEndpoint && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => void probe(service.testEndpoint!, service.name)}
                          disabled={probeResult === 'loading'}
                          className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-black text-cyan-100 transition hover:bg-white/[0.08] disabled:opacity-50"
                        >
                          <RefreshCw
                            size={10}
                            className={probeResult === 'loading' ? 'animate-spin' : ''}
                          />
                          test {service.testEndpoint}
                        </button>
                        {probeResult && probeResult !== 'loading' && (
                          <span
                            className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-black ring-1 ${
                              probeResult.ok
                                ? 'bg-emerald-400/12 text-emerald-100 ring-emerald-400/25'
                                : 'bg-red-400/12 text-red-100 ring-red-400/25'
                            }`}
                          >
                            {probeResult.ok ? (
                              <CheckCircle2 size={10} />
                            ) : (
                              <ShieldAlert size={10} />
                            )}
                            {probeResult.message} · {probeResult.ms}ms
                          </span>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-[11px] text-slate-400 md:text-xs">
          <p className="flex items-center gap-2 font-black text-white">
            <ShieldCheck size={12} className="text-emerald-300" /> Aman
          </p>
          <p className="mt-1">
            Halaman ini hanya menampilkan status konfigurasi. Nilai API key & secret tidak pernah
            dikirim ke browser.
          </p>
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: 'green' | 'red' | 'amber';
}) {
  const toneClass = {
    green: 'text-emerald-100 bg-emerald-400/12 ring-emerald-400/25',
    red: 'text-red-100 bg-red-400/12 ring-red-400/25',
    amber: 'text-amber-100 bg-amber-400/12 ring-amber-400/25'
  }[tone];
  return (
    <div className={`rounded-xl p-3 ring-1 ${toneClass}`}>
      <p className="text-[10px] uppercase tracking-widest opacity-80">{label}</p>
      <p className="mt-0.5 text-2xl font-black">{value}</p>
    </div>
  );
}
