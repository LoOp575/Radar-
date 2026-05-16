import type { ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BrainCircuit,
  Flame,
  Radar,
  ShieldCheck,
  TrendingUp,
  WalletCards
} from 'lucide-react';
import { LiveTradingTerminal } from '@/components/LiveTradingTerminal';
import { mockTokens } from '@/lib/mock-data';
import { formatCompact, scoreTokens } from '@/lib/scoring';
import type { TokenSignal } from '@/lib/types';

const signals = scoreTokens(mockTokens);
const topSignal = signals[0];
const strongSignals = signals.filter((s) => s.pps >= 70 && s.risk <= 40).length;
const dangerSignals = signals.filter(
  (s) => s.signal === 'DANGER' || s.signal === 'LATE / DO NOT CHASE'
).length;
const watchSignals = signals.filter((s) => s.pps >= 60 && s.pps < 70).length;

function ppsBadge(score: number) {
  if (score >= 75) return 'bg-emerald-400/15 text-emerald-200 ring-emerald-400/30';
  if (score >= 60) return 'bg-cyan-400/15 text-cyan-200 ring-cyan-400/30';
  return 'bg-slate-400/12 text-slate-200 ring-slate-400/25';
}

function riskBadge(risk: number) {
  if (risk <= 30) return 'bg-emerald-400/15 text-emerald-200 ring-emerald-400/30';
  if (risk <= 55) return 'bg-amber-400/15 text-amber-200 ring-amber-400/30';
  return 'bg-red-400/15 text-red-200 ring-red-400/30';
}

function signalBadge(signal: string) {
  if (/DANGER|LATE|DISTRIBUTION/.test(signal))
    return 'bg-red-400/15 text-red-200 ring-red-400/30';
  if (/BREAKOUT|EARLY/.test(signal)) return 'bg-emerald-400/15 text-emerald-200 ring-emerald-400/30';
  return 'bg-cyan-400/15 text-cyan-200 ring-cyan-400/30';
}

export default function Home() {
  return (
    <main className="relative">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(53,214,255,0.18),transparent_30%),radial-gradient(circle_at_85%_5%,rgba(72,240,164,0.14),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(255,204,102,0.06),transparent_30%)]" />

      <section className="mx-auto max-w-7xl space-y-4 px-3 py-4 md:space-y-5 md:px-6 md:py-6">
        <header className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] via-white/[0.025] to-cyan-300/[0.05] p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur md:p-6">
          <div className="absolute right-[-90px] top-[-90px] h-56 w-56 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="absolute bottom-[-90px] left-[20%] h-52 w-52 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="relative grid gap-4 md:grid-cols-[1.2fr_0.9fr] md:items-end">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-100">
                <Radar size={12} /> Market Radar
              </div>
              <h1 className="max-w-2xl text-2xl font-black leading-[1.05] tracking-tight md:text-5xl">
                Scan{' '}
                <span className="bg-gradient-to-r from-cyan-200 via-emerald-200 to-amber-100 bg-clip-text text-transparent">
                  early pump
                </span>{' '}
                sebelum telat masuk
              </h1>
              <p className="mt-2 max-w-xl text-xs leading-5 text-slate-400 md:text-sm md:leading-6">
                Terminal trading premium. PPS engine, risk filter, futures pressure, dan wallet
                intelligence dalam satu radar.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-black">
                <span className="rounded-full bg-emerald-400/12 px-2.5 py-1 text-emerald-100 ring-1 ring-emerald-400/25">
                  DEX SCREENER
                </span>
                <span className="rounded-full bg-cyan-400/12 px-2.5 py-1 text-cyan-100 ring-1 ring-cyan-400/25">
                  COINALYZE
                </span>
                <span className="rounded-full bg-amber-400/12 px-2.5 py-1 text-amber-100 ring-1 ring-amber-400/25">
                  SUPABASE
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-300/20 bg-gradient-to-br from-emerald-300/12 to-cyan-300/5 p-3 shadow-2xl shadow-emerald-950/20 md:p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200/80">
                    Top setup
                  </p>
                  <p className="mt-1 truncate text-2xl font-black text-white md:text-3xl">
                    {topSignal.symbol}
                  </p>
                  <p className="truncate text-[11px] font-bold text-emerald-100">{topSignal.signal}</p>
                </div>
                <div className="rounded-xl bg-black/35 px-3 py-2 text-right ring-1 ring-white/10">
                  <p className="text-3xl font-black text-emerald-200 md:text-4xl">{topSignal.pps}</p>
                  <p className="text-[9px] uppercase tracking-widest text-slate-500">PPS</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-200"
                  style={{ width: `${topSignal.pps}%` }}
                />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px]">
                <Mini label="Risk" value={String(topSignal.risk)} />
                <Mini label="Chain" value={topSignal.chain} />
                <Mini label="Liq" value={`$${formatCompact(topSignal.liquidity)}`} />
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          <Metric icon={<TrendingUp />} label="Strong" value={strongSignals.toString()} hint="PPS ≥ 70" tone="green" />
          <Metric icon={<Flame />} label="Watch" value={watchSignals.toString()} hint="PPS 60-70" tone="cyan" />
          <Metric icon={<AlertTriangle />} label="Danger" value={dangerSignals.toString()} hint="hindari FOMO" tone="red" />
          <Metric icon={<BrainCircuit />} label="Mode" value="TERM" hint="live terminal" tone="amber" />
        </section>

        <LiveTradingTerminal />

        <section className="grid gap-4 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-xl shadow-black/20 backdrop-blur md:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black md:text-xl">Signal Ranking</h2>
                <p className="text-[11px] text-slate-500 md:text-xs">
                  PPS tinggi · risk rendah · belum telat pump
                </p>
              </div>
              <div className="hidden items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-black text-emerald-100 ring-1 ring-emerald-300/25 md:flex">
                <ShieldCheck size={11} /> Risk filtered
              </div>
            </div>

            <div className="space-y-2 md:hidden">
              {signals.map((token, index) => (
                <MobileSignalCard key={token.symbol} token={token} index={index} />
              ))}
            </div>

            <div className="table-scroll hidden overflow-x-auto md:block">
              <table className="w-full min-w-[920px] border-separate border-spacing-y-1.5 text-left font-mono text-xs">
                <thead className="text-[10px] uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Token</th>
                    <th className="px-3 py-2">Chain</th>
                    <th className="px-3 py-2">PPS</th>
                    <th className="px-3 py-2">Risk</th>
                    <th className="px-3 py-2">Signal</th>
                    <th className="px-3 py-2">Vol 15m</th>
                    <th className="px-3 py-2">OI 1h</th>
                    <th className="px-3 py-2">Smart</th>
                    <th className="px-3 py-2">Liq</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.map((token, index) => (
                    <tr
                      key={token.symbol}
                      className="rounded-xl bg-white/[0.025] transition hover:bg-white/[0.06]"
                    >
                      <td className="rounded-l-xl px-3 py-3 font-bold text-slate-500">#{index + 1}</td>
                      <td className="px-3 py-3">
                        <p className="font-black text-white">{token.symbol}</p>
                        <p className="text-[10px] text-slate-500">{token.name}</p>
                      </td>
                      <td className="px-3 py-3 text-slate-300">
                        <p>{token.chain}</p>
                        <p className="text-[10px] text-slate-500">{token.exchange}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`rounded-md px-2 py-0.5 font-black ring-1 ${ppsBadge(token.pps)}`}>
                          {token.pps}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`rounded-md px-2 py-0.5 font-black ring-1 ${riskBadge(token.risk)}`}>
                          {token.risk}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ${signalBadge(token.signal)}`}>
                          {token.signal}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-300">${formatCompact(token.volume15m)}</td>
                      <td className={`px-3 py-3 font-black ${token.oiChange1h >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
                        {token.oiChange1h >= 0 ? '+' : ''}{token.oiChange1h}%
                      </td>
                      <td className="px-3 py-3 text-emerald-200">${formatCompact(token.smartWalletNetBuyUsd)}</td>
                      <td className="rounded-r-xl px-3 py-3 text-slate-300">${formatCompact(token.liquidity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-xl shadow-black/20 backdrop-blur md:p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200/80">
                    Top setup detail
                  </p>
                  <h2 className="text-lg font-black text-white md:text-xl">{topSignal.symbol}</h2>
                  <p className="text-[11px] text-slate-500">{topSignal.name} · {topSignal.chain}</p>
                </div>
                <span className={`rounded-md px-2 py-1 text-[10px] font-black ring-1 ${signalBadge(topSignal.signal)}`}>
                  {topSignal.signal}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Mini label="Price" value={`$${topSignal.price}`} />
                <Mini label="MCap" value={`$${formatCompact(topSignal.marketCap)}`} />
                <Mini label="FDV" value={`$${formatCompact(topSignal.fdv)}`} />
                <Mini label="Funding" value={`${topSignal.fundingRate}%`} />
              </div>

              <div className="mt-4">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-200/80">
                  Reasons
                </p>
                <ul className="space-y-1.5 text-[11px] text-slate-300 md:text-xs">
                  {topSignal.reasons.slice(0, 4).map((reason) => (
                    <li key={reason} className="flex items-start gap-2 rounded-lg bg-emerald-300/5 px-2.5 py-1.5 ring-1 ring-emerald-300/15">
                      <ArrowUpRight size={11} className="mt-0.5 shrink-0 text-emerald-300" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 rounded-xl bg-black/25 p-3 text-[11px] ring-1 ring-white/10 md:text-xs">
                <p className="font-black text-white">Invalidation</p>
                <p className="mt-1 text-slate-400">{topSignal.invalidation}</p>
                <p className="mt-2 font-black text-white">Target</p>
                <p className="mt-1 text-slate-400">{topSignal.quickTargets}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-xl shadow-black/20 backdrop-blur md:p-4">
              <h2 className="text-base font-black md:text-lg">Backend Status</h2>
              <p className="text-[11px] text-slate-500">live integration map</p>
              <div className="mt-3 space-y-2 text-[11px] md:text-xs">
                <Step icon={<WalletCards size={12} />} title="DEX Real Data" desc="/api/dex?q=SOL" />
                <Step icon={<TrendingUp size={12} />} title="Coinalyze Futures" desc="/api/derivatives" />
                <Step icon={<BrainCircuit size={12} />} title="Supabase History" desc="/api/signals/history" />
                <Step icon={<ShieldCheck size={12} />} title="Prisma Build" desc="auto on build" />
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, hint, tone }: { icon: ReactNode; label: string; value: string; hint: string; tone: 'green' | 'red' | 'cyan' | 'amber' }) {
  const toneClass = {
    green: 'from-emerald-300/15 text-emerald-100',
    red: 'from-red-300/15 text-red-100',
    cyan: 'from-cyan-300/15 text-cyan-100',
    amber: 'from-amber-300/15 text-amber-100'
  }[tone];

  return (
    <div className={`rounded-xl border border-white/10 bg-gradient-to-br ${toneClass} to-white/[0.025] p-3 shadow-xl shadow-black/20 backdrop-blur`}>
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/30 ring-1 ring-white/10 [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </div>
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-0.5 text-xl font-black md:text-2xl">{value}</p>
      <p className="mt-0.5 text-[10px] text-slate-600">{hint}</p>
    </div>
  );
}

function MobileSignalCard({ token, index }: { token: TokenSignal; index: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-2.5 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-500">#{index + 1} · {token.chain}</p>
          <p className="truncate text-base font-black text-white">{token.symbol}</p>
          <p className="truncate text-[10px] text-slate-500">{token.exchange}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={`rounded-md px-2 py-0.5 text-xs font-black ring-1 ${ppsBadge(token.pps)}`}>
            {token.pps} PPS
          </span>
          <span className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[9px] font-bold ring-1 ${signalBadge(token.signal)}`}>
            {token.signal}
          </span>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
        <Mini label="Risk" value={String(token.risk)} />
        <Mini label="Vol 15m" value={`$${formatCompact(token.volume15m)}`} />
        <Mini label="Liq" value={`$${formatCompact(token.liquidity)}`} />
      </div>
      <div className="mt-2 flex items-center justify-between rounded-lg bg-black/25 px-2.5 py-1.5 text-[10px] text-slate-400 ring-1 ring-white/10">
        <span>Smart: <b className="text-emerald-200">${formatCompact(token.smartWalletNetBuyUsd)}</b></span>
        <span>OI 1h: <b className={token.oiChange1h >= 0 ? 'text-emerald-200' : 'text-red-200'}>{token.oiChange1h >= 0 ? '+' : ''}{token.oiChange1h}%</b></span>
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-black/30 p-2 ring-1 ring-white/10">
      <p className="text-[9px] uppercase text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-xs font-black text-white">{value}</p>
    </div>
  );
}

function Step({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <div className="flex items-center gap-2 text-slate-300">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-400/10 text-cyan-100 ring-1 ring-cyan-400/25">
          {icon}
        </span>
        <p className="font-black text-white">{title}</p>
      </div>
      <p className="truncate font-mono text-[10px] text-slate-500">{desc}</p>
    </div>
  );
}
