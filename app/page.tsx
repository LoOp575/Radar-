import type { ReactNode } from 'react';
import { AlertTriangle, ArrowUpRight, BrainCircuit, Database, RadioTower, ShieldCheck, TrendingUp, WalletCards } from 'lucide-react';
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
    <main className="min-h-screen overflow-hidden bg-[#03080b] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(53,214,255,0.2),transparent_28%),radial-gradient(circle_at_90%_10%,rgba(72,240,164,0.14),transparent_28%)]" />

      <section className="relative mx-auto max-w-7xl space-y-4 px-3 py-4 md:px-8 md:py-7">
        <header className="rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/30 backdrop-blur md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] font-black text-cyan-100">
                <RadioTower size={13} /> PUMPRADAR VISION
              </div>
              <h1 className="text-3xl font-black leading-none tracking-tight md:text-5xl">
                Crypto Scanner <span className="bg-gradient-to-r from-cyan-200 via-emerald-200 to-amber-100 bg-clip-text text-transparent">Terminal</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Scan DEX real-time, baca PPS score, risk, liquidity, volume, futures pressure, dan histori sinyal dalam satu terminal ringan.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 md:min-w-[360px]">
              <MiniTop label="Top" value={topSignal.symbol} tone="cyan" />
              <MiniTop label="PPS" value={String(topSignal.pps)} tone="green" />
              <MiniTop label="Risk" value={String(topSignal.risk)} tone="amber" />
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metric icon={<TrendingUp />} label="Strong" value={strongSignals.toString()} hint="PPS ≥ 70" tone="green" />
          <Metric icon={<AlertTriangle />} label="Danger" value={dangerSignals.toString()} hint="avoid FOMO" tone="red" />
          <Metric icon={<WalletCards />} label="Wallet" value="DNA" hint="next module" tone="cyan" />
          <Metric icon={<BrainCircuit />} label="Mode" value="LIVE" hint="terminal" tone="amber" />
        </section>

        <LiveTradingTerminal />

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Top Setups</h2>
                <p className="text-xs text-slate-500">Ringkasan dari scoring engine. Data terminal live ada di atas.</p>
              </div>
              <ShieldCheck size={18} className="text-emerald-200" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {signals.slice(0, 4).map((token, index) => (
                <SetupCard key={token.symbol} token={token} index={index} />
              ))}
            </div>
          </div>

          <aside className="rounded-[1.8rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur md:p-5">
            <h2 className="text-xl font-black">System Status</h2>
            <p className="mt-1 text-xs text-slate-500">Endpoint penting. Buka UI, bukan raw JSON panjang.</p>

            <div className="mt-4 space-y-3">
              <StatusRow icon={<RadioTower size={16} />} title="DEX Terminal" href="/api/dex?q=SOL" label="API" />
              <StatusRow icon={<TrendingUp size={16} />} title="Futures UI" href="/futures" label="PAGE" />
              <StatusRow icon={<Database size={16} />} title="Signal History" href="/api/signals/history" label="DB" />
              <StatusRow icon={<BrainCircuit size={16} />} title="PPS Engine" href="/api/signals" label="LIVE" />
            </div>

            <div className="mt-5 rounded-2xl bg-black/20 p-4 text-xs leading-5 text-slate-400 ring-1 ring-white/10">
              <b className="text-white">Catatan:</b> dashboard utama sekarang dibuat bersih. Data mentah tetap tersedia di endpoint API, tapi untuk tampilan enak gunakan terminal utama dan halaman <b>/futures</b>.
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

function MiniTop({ label, value, tone }: { label: string; value: string; tone: 'cyan' | 'green' | 'amber' }) {
  const toneClass = {
    cyan: 'text-cyan-100 bg-cyan-300/10 ring-cyan-300/20',
    green: 'text-emerald-100 bg-emerald-300/10 ring-emerald-300/20',
    amber: 'text-amber-100 bg-amber-300/10 ring-amber-300/20'
  }[tone];

  return (
    <div className={`rounded-2xl p-3 ring-1 ${toneClass}`}>
      <p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-1 truncate text-xl font-black">{value}</p>
    </div>
  );
}

function Metric({ icon, label, value, hint, tone }: { icon: ReactNode; label: string; value: string; hint: string; tone: 'green' | 'red' | 'cyan' | 'amber' }) {
  const toneClass = {
    green: 'from-emerald-300/14 text-emerald-100',
    red: 'from-red-300/14 text-red-100',
    cyan: 'from-cyan-300/14 text-cyan-100',
    amber: 'from-amber-300/14 text-amber-100'
  }[tone];

  return (
    <div className={`rounded-[1.4rem] border border-white/10 bg-gradient-to-br ${toneClass} to-white/[0.035] p-3 shadow-xl shadow-black/20 backdrop-blur md:p-4`}>
      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-black/20 ring-1 ring-white/10">{icon}</div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl font-black md:text-3xl">{value}</p>
      <p className="text-[11px] text-slate-500">{hint}</p>
    </div>
  );
}

function SetupCard({ token, index }: { token: typeof signals[number]; index: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3 ring-1 ring-white/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-slate-500">#{index + 1} · {token.chain}</p>
          <p className="text-xl font-black text-white">{token.symbol}</p>
          <p className="text-xs text-slate-500">{token.exchange}</p>
        </div>
        <div className="text-right">
          <span className={`rounded-full px-3 py-1 text-sm font-black ring-1 ${badgeClass(token.pps)}`}>{token.pps}</span>
          <p className="mt-2 text-[10px] text-slate-500">PPS</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <Cell label="Risk" value={String(token.risk)} tone="amber" />
        <Cell label="Vol" value={`$${formatCompact(token.volume15m)}`} />
        <Cell label="Liq" value={`$${formatCompact(token.liquidity)}`} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className={`truncate rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${signalBadge(token.signal)}`}>{token.signal}</span>
        <ArrowUpRight size={14} className="text-cyan-200" />
      </div>
    </div>
  );
}

function StatusRow({ icon, title, href, label }: { icon: ReactNode; title: string; href: string; label: string }) {
  return (
    <a href={href} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-3 transition hover:border-cyan-300/30 hover:bg-white/[0.055]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-100 ring-1 ring-cyan-300/20">{icon}</div>
        <div>
          <p className="text-sm font-black text-white">{title}</p>
          <p className="text-[11px] text-slate-500">{href}</p>
        </div>
      </div>
      <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] font-black text-slate-300 ring-1 ring-white/10">{label}</span>
    </a>
  );
}

function Cell({ label, value, tone = 'slate' }: { label: string; value: string; tone?: 'amber' | 'slate' }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-2 ring-1 ring-white/10">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className={`truncate font-black ${tone === 'amber' ? 'text-amber-100' : 'text-white'}`}>{value}</p>
    </div>
  );
}
