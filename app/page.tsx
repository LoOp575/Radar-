import type { ReactNode } from 'react';
import { AlertTriangle, ArrowUpRight, BrainCircuit, RadioTower, ShieldCheck, TrendingUp, WalletCards } from 'lucide-react';
import { LiveTradingTerminal } from '@/components/LiveTradingTerminal';
import { mockTokens } from '@/lib/mock-data';
import { formatCompact, scoreTokens } from '@/lib/scoring';

const signals = scoreTokens(mockTokens);
const topSignal = signals[0];
const strongSignals = signals.filter((s) => s.pps >= 70 && s.risk <= 40).length;
const dangerSignals = signals.filter((s) => s.signal === 'DANGER' || s.signal === 'LATE / DO NOT CHASE').length;

function badgeClass(score: number, type: 'pps' | 'risk' = 'pps') {
  if (type === 'risk') {
    if (score <= 30) return 'bg-emerald-400/15 text-emerald-200 ring-emerald-400/30';
    if (score <= 55) return 'bg-amber-400/15 text-amber-200 ring-amber-400/30';
    return 'bg-red-400/15 text-red-200 ring-red-400/30';
  }
  if (score >= 75) return 'bg-emerald-400/15 text-emerald-200 ring-emerald-400/30';
  if (score >= 60) return 'bg-cyan-400/15 text-cyan-200 ring-cyan-400/30';
  return 'bg-slate-400/15 text-slate-200 ring-slate-400/30';
}

function signalBadge(signal: string) {
  if (signal.includes('DANGER') || signal.includes('LATE')) return 'bg-red-400/15 text-red-200 ring-red-400/30';
  if (signal.includes('BREAKOUT') || signal.includes('EARLY')) return 'bg-emerald-400/15 text-emerald-200 ring-emerald-400/30';
  return 'bg-cyan-400/15 text-cyan-200 ring-cyan-400/30';
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#02080b] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(53,214,255,0.24),transparent_28%),radial-gradient(circle_at_85%_5%,rgba(72,240,164,0.18),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(255,204,102,0.08),transparent_30%)]" />
      <section className="relative mx-auto max-w-7xl space-y-4 px-3 py-4 md:space-y-6 md:px-8 md:py-7">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.10] via-white/[0.045] to-cyan-300/[0.05] p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur md:p-7">
          <div className="absolute right-[-90px] top-[-90px] h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute bottom-[-90px] left-[20%] h-52 w-52 rounded-full bg-emerald-300/10 blur-3xl" />
          <div className="relative grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] font-bold text-cyan-100 shadow-lg shadow-cyan-950/30">
                <RadioTower size={13} /> LIVE MARKET RADAR
              </div>
              <h1 className="max-w-2xl text-3xl font-black leading-[0.95] tracking-tight md:text-6xl">
                PumpRadar <span className="bg-gradient-to-r from-cyan-200 via-emerald-200 to-amber-100 bg-clip-text text-transparent">Vision</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Terminal trading untuk scan DEX real-time, PPS score, risk filter, futures pressure, dan histori sinyal.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
                <span className="rounded-full bg-emerald-400/15 px-3 py-1.5 text-emerald-100 ring-1 ring-emerald-400/25">DEX aktif</span>
                <span className="rounded-full bg-cyan-400/15 px-3 py-1.5 text-cyan-100 ring-1 ring-cyan-400/25">Coinalyze siap</span>
                <span className="rounded-full bg-amber-400/15 px-3 py-1.5 text-amber-100 ring-1 ring-amber-400/25">Supabase ready</span>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-emerald-300/20 bg-gradient-to-br from-emerald-300/15 to-cyan-300/5 p-4 shadow-2xl shadow-emerald-950/25">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-200/80">Top setup</p>
                  <p className="mt-2 text-4xl font-black leading-none">{topSignal.symbol}</p>
                  <p className="mt-1 text-xs font-bold text-emerald-100">{topSignal.signal}</p>
                </div>
                <div className="rounded-3xl bg-black/25 px-4 py-3 text-right ring-1 ring-white/10">
                  <p className="text-5xl font-black text-emerald-200">{topSignal.pps}</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400">PPS</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/30">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-200" style={{ width: `${topSignal.pps}%` }} />
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric icon={<TrendingUp />} label="Strong" value={strongSignals.toString()} hint="PPS ≥ 70" tone="green" />
          <Metric icon={<AlertTriangle />} label="Danger" value={dangerSignals.toString()} hint="hindari FOMO" tone="red" />
          <Metric icon={<WalletCards />} label="Wallet" value="DNA" hint="analyzer" tone="cyan" />
          <Metric icon={<BrainCircuit />} label="Mode" value="TERM" hint="live terminal" tone="amber" />
        </section>

        <LiveTradingTerminal />

        <section className="grid gap-4 lg:grid-cols-[1.45fr_0.8fr]">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Signal Ranking</h2>
                <p className="text-xs text-slate-400 md:text-sm">Setup ketat: PPS tinggi, risk rendah, belum telat pump.</p>
              </div>
              <div className="hidden items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs text-slate-300 md:flex">
                <ShieldCheck size={15} /> Risk filtered
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              {signals.map((token, index) => (
                <MobileSignalCard key={token.symbol} token={token} index={index} />
              ))}
            </div>

            <div className="table-scroll hidden overflow-x-auto md:block">
              <table className="w-full min-w-[980px] border-separate border-spacing-y-2 text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Rank</th>
                    <th className="px-3 py-2">Token</th>
                    <th className="px-3 py-2">Chain / Exchange</th>
                    <th className="px-3 py-2">PPS</th>
                    <th className="px-3 py-2">Risk</th>
                    <th className="px-3 py-2">Signal</th>
                    <th className="px-3 py-2">Vol 15m</th>
                    <th className="px-3 py-2">OI 1h</th>
                    <th className="px-3 py-2">Smart Buy</th>
                    <th className="px-3 py-2">Liquidity</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.map((token, index) => (
                    <tr key={token.symbol} className="rounded-2xl bg-white/[0.035] transition hover:bg-white/[0.07]">
                      <td className="rounded-l-2xl px-3 py-4 font-bold text-slate-400">#{index + 1}</td>
                      <td className="px-3 py-4"><p className="font-black text-white">{token.symbol}</p><p className="text-xs text-slate-400">{token.name}</p></td>
                      <td className="px-3 py-4 text-slate-300"><p>{token.chain}</p><p className="text-xs text-slate-500">{token.exchange}</p></td>
                      <td className="px-3 py-4"><span className={`rounded-full px-3 py-1 font-black ring-1 ${badgeClass(token.pps)}`}>{token.pps}</span></td>
                      <td className="px-3 py-4"><span className={`rounded-full px-3 py-1 font-black ring-1 ${badgeClass(token.risk, 'risk')}`}>{token.risk}</span></td>
                      <td className="px-3 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${signalBadge(token.signal)}`}>{token.signal}</span></td>
                      <td className="px-3 py-4 text-slate-300">${formatCompact(token.volume15m)}</td>
                      <td className="px-3 py-4 text-slate-300">{token.oiChange1h}%</td>
                      <td className="px-3 py-4 text-emerald-200">${formatCompact(token.smartWalletNetBuyUsd)}</td>
                      <td className="rounded-r-2xl px-3 py-4 text-slate-300">${formatCompact(token.liquidity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur md:p-5">
              <h2 className="mb-1 text-xl font-black">Top Signal Detail</h2>
              <p className="text-sm text-slate-400">{topSignal.name} / {topSignal.chain}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Mini label="Price" value={`$${topSignal.price}`} />
                <Mini label="MCap" value={`$${formatCompact(topSignal.marketCap)}`} />
                <Mini label="FDV" value={`$${formatCompact(topSignal.fdv)}`} />
                <Mini label="Funding" value={`${topSignal.fundingRate}%`} />
              </div>
              <div className="mt-5 space-y-3">
                <h3 className="font-bold text-emerald-100">Alasan sinyal</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  {topSignal.reasons.slice(0, 5).map((reason) => <li key={reason}>✅ {reason}</li>)}
                </ul>
                <div className="rounded-2xl bg-black/20 p-4 text-sm text-slate-300 ring-1 ring-white/10">
                  <p className="font-bold text-white">Invalidation</p>
                  <p>{topSignal.invalidation}</p>
                  <p className="mt-3 font-bold text-white">Target</p>
                  <p>{topSignal.quickTargets}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur md:p-5">
              <h2 className="text-xl font-black">Backend Status</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <Step title="DEX Real Data" desc="/api/dex?q=SOL siap scan pair real." />
                <Step title="Coinalyze Futures" desc="/api/derivatives siap OI + funding." />
                <Step title="Supabase History" desc="/api/signals/history untuk histori." />
                <Step title="Prisma Build" desc="prisma generate otomatis saat build." />
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
    green: 'from-emerald-300/18 text-emerald-100',
    red: 'from-red-300/18 text-red-100',
    cyan: 'from-cyan-300/18 text-cyan-100',
    amber: 'from-amber-300/18 text-amber-100'
  }[tone];

  return (
    <div className={`rounded-[1.5rem] border border-white/10 bg-gradient-to-br ${toneClass} to-white/[0.035] p-3 shadow-xl shadow-black/20 backdrop-blur md:p-4`}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-black/20 ring-1 ring-white/10">{icon}</div>
      <p className="text-xs text-slate-400 md:text-sm">{label}</p>
      <p className="mt-0.5 text-2xl font-black md:text-3xl">{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-500 md:text-xs">{hint}</p>
    </div>
  );
}

function MobileSignalCard({ token, index }: { token: typeof signals[number]; index: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.025] p-3 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-slate-500">#{index + 1} / {token.chain}</p>
          <p className="text-xl font-black text-white">{token.symbol}</p>
          <p className="text-xs text-slate-400">{token.exchange}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-black ring-1 ${badgeClass(token.pps)}`}>{token.pps} PPS</span>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${signalBadge(token.signal)}`}>{token.signal}</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <Mini label="Risk" value={String(token.risk)} />
        <Mini label="Vol 15m" value={`$${formatCompact(token.volume15m)}`} />
        <Mini label="Liq" value={`$${formatCompact(token.liquidity)}`} />
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-xs text-slate-300 ring-1 ring-white/10">
        <span>Smart buy: <b className="text-emerald-200">${formatCompact(token.smartWalletNetBuyUsd)}</b></span>
        <ArrowUpRight size={14} className="text-cyan-200" />
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
      <p className="text-[10px] text-slate-500 md:text-xs">{label}</p>
      <p className="mt-1 text-sm font-black text-white md:text-base">{value}</p>
    </div>
  );
}

function Step({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
      <p className="font-bold text-white">{title}</p>
      <p className="mt-1 text-slate-400">{desc}</p>
    </div>
  );
}
