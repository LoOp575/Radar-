import { Activity, AlertTriangle, BrainCircuit, RadioTower, ShieldCheck, TrendingUp, WalletCards } from 'lucide-react';
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#123844_0,#061014_38%,#03090b_100%)] px-4 py-6 text-slate-100 md:px-8">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-cyan-950/30 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
              <RadioTower size={14} /> PumpRadar Vision MVP
            </div>
            <h1 className="text-3xl font-black tracking-tight md:text-5xl">Early Pump Scanner</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
              Dashboard untuk ranking token berdasarkan volume anomaly, wallet accumulation, derivatives pressure, liquidity health, social acceleration, market structure, dan risk filter.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 md:min-w-72">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">Top setup</p>
            <div className="mt-2 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-black">{topSignal.symbol}</p>
                <p className="text-sm text-slate-300">{topSignal.signal}</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-emerald-200">{topSignal.pps}</p>
                <p className="text-xs text-slate-400">PPS Score</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Metric icon={<TrendingUp />} label="Strong setups" value={strongSignals.toString()} hint="PPS ≥ 70 & risk rendah" />
          <Metric icon={<AlertTriangle />} label="Danger / late" value={dangerSignals.toString()} hint="hindari FOMO" />
          <Metric icon={<WalletCards />} label="Wallet engine" value="DNA" hint="smart wallet scoring" />
          <Metric icon={<BrainCircuit />} label="Mode" value="MVP" hint="mock data siap diganti API" />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.45fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-radar-panel/80 p-4 shadow-xl shadow-black/20">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Signal Ranking</h2>
                <p className="text-sm text-slate-400">High precision setup dicari dari PPS tinggi + risk rendah, bukan coin yang sudah telat pump.</p>
              </div>
              <div className="hidden items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs text-slate-300 md:flex">
                <ShieldCheck size={15} /> Risk filtered
              </div>
            </div>
            <div className="table-scroll overflow-x-auto">
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
                      <td className="px-3 py-4">
                        <p className="font-black text-white">{token.symbol}</p>
                        <p className="text-xs text-slate-400">{token.name}</p>
                      </td>
                      <td className="px-3 py-4 text-slate-300">
                        <p>{token.chain}</p>
                        <p className="text-xs text-slate-500">{token.exchange}</p>
                      </td>
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

          <aside className="space-y-5">
            <div className="rounded-3xl border border-white/10 bg-radar-panel/80 p-5 shadow-xl shadow-black/20">
              <h2 className="mb-1 text-xl font-bold">Top Signal Detail</h2>
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
                  {topSignal.reasons.map((reason) => <li key={reason}>✅ {reason}</li>)}
                </ul>
                {topSignal.warnings.length > 0 && (
                  <>
                    <h3 className="font-bold text-amber-100">Warning</h3>
                    <ul className="space-y-2 text-sm text-slate-300">
                      {topSignal.warnings.map((warning) => <li key={warning}>⚠️ {warning}</li>)}
                    </ul>
                  </>
                )}
                <div className="rounded-2xl bg-white/[0.04] p-4 text-sm text-slate-300">
                  <p className="font-bold text-white">Invalidation</p>
                  <p>{topSignal.invalidation}</p>
                  <p className="mt-3 font-bold text-white">Target</p>
                  <p>{topSignal.quickTargets}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-radar-panel/80 p-5 shadow-xl shadow-black/20">
              <h2 className="text-xl font-bold">Roadmap Engine</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <Step title="1. Market Radar" desc="CoinGecko + DEX Screener + exchange data." />
                <Step title="2. Wallet DNA" desc="Smart wallet, whale, sniper, insider-like, exit wallet." />
                <Step title="3. Futures Pressure" desc="OI, funding, long/short, liquidation cluster." />
                <Step title="4. Backtest Memory" desc="Label win/loss untuk ngejar precision 70%+ pada setup ketat." />
              </div>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/20">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100">{icon}</div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

function Step({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="font-bold text-white">{title}</p>
      <p className="mt-1 text-slate-400">{desc}</p>
    </div>
  );
}
