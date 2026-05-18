import type { ReactNode } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Database,
  Flame,
  History,
  Layers3,
  LineChart,
  Radar,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
  Zap
} from 'lucide-react';
import { SignalScanPanel } from '@/components/SignalScanPanel';
import { mockTokens } from '@/lib/mock-data';
import { scoreTokens } from '@/lib/scoring';

const signals = scoreTokens(mockTokens);
const topSignal = signals[0];
const strongSignals = signals.filter((s) => s.pps >= 70 && s.risk <= 40).length;
const dangerSignals = signals.filter((s) => s.signal === 'DANGER' || s.signal === 'LATE / DO NOT CHASE').length;
const watchSignals = signals.filter((s) => s.pps >= 60 && s.pps < 70).length;

const navItems = [
  { label: 'Dashboard', icon: <BarChart3 size={16} />, active: true, href: '/' },
  { label: 'Futures', icon: <LineChart size={16} />, href: '/futures' },
  { label: 'History', icon: <History size={16} />, href: '/api/signals/history' },
  { label: 'API Data', icon: <Database size={16} />, href: '/api/dex?q=LISTED' }
];

const labItems = [
  { label: 'PPS Engine', icon: <BrainCircuit size={15} /> },
  { label: 'Wallet DNA', icon: <WalletCards size={15} /> },
  { label: 'Risk Shield', icon: <ShieldCheck size={15} /> },
  { label: 'Config', icon: <Settings2 size={15} /> }
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#edf5f2] text-slate-900">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(20,184,166,0.28),transparent_30%),radial-gradient(circle_at_88%_8%,rgba(56,189,248,0.2),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.14),transparent_34%)]" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl gap-4 p-3 md:p-5">
        <aside className="hidden w-64 shrink-0 rounded-[2rem] border border-white/80 bg-white/75 p-4 shadow-2xl shadow-teal-900/10 backdrop-blur-xl lg:flex lg:flex-col">
          <Brand />

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-black transition ${
                  item.active
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/15'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-8">
            <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">AI Modules</p>
            <div className="mt-2 space-y-1">
              {labItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-500">
                  <span className="text-teal-500">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto rounded-3xl bg-slate-950 p-4 text-white shadow-xl shadow-slate-900/15">
            <p className="text-[10px] font-black uppercase tracking-widest text-teal-200">System Status</p>
            <p className="mt-2 text-3xl font-black">LIVE</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">Scanner LISTED aktif. API bekerja di belakang layar, bukan untuk dibuka user.</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 space-y-4">
          <div className="flex items-center justify-between rounded-[1.5rem] border border-white/80 bg-white/70 px-3 py-3 shadow-xl shadow-teal-900/5 backdrop-blur-xl lg:hidden">
            <Brand compact />
            <a href="/futures" className="rounded-2xl bg-slate-950 px-3 py-2 text-xs font-black text-white">Futures</a>
          </div>

          <header className="relative overflow-hidden rounded-[2.2rem] border border-white/80 bg-white/75 p-4 shadow-2xl shadow-teal-900/10 backdrop-blur-xl md:p-6">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl" />
            <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" />

            <div className="relative grid gap-5 xl:grid-cols-[1.25fr_0.75fr] xl:items-end">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-teal-700 ring-1 ring-teal-100">
                  <Sparkles size={13} /> Listed Coin Intelligence
                </div>
                <h1 className="max-w-3xl text-3xl font-black leading-[0.98] tracking-tight text-slate-950 md:text-6xl">
                  Radar koin listing sebelum market ramai.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                  Scan koin yang sudah aktif/listing, filter liquidity dan volume, lalu hitung PPS + Risk agar setup yang muncul lebih relevan.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Pill>Default: LISTED</Pill>
                  <Pill>DEX Screener</Pill>
                  <Pill>PPS + Risk</Pill>
                </div>
              </div>

              <div className="rounded-[1.8rem] bg-slate-950 p-4 text-white shadow-2xl shadow-slate-900/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-200">Top mock baseline</p>
                <div className="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-4xl font-black">{topSignal.symbol}</p>
                    <p className="mt-1 text-xs font-bold text-slate-400">{topSignal.signal}</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 px-4 py-3 text-right ring-1 ring-white/10">
                    <p className="text-4xl font-black text-teal-200">{topSignal.pps}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">PPS</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-200" style={{ width: `${topSignal.pps}%` }} />
                </div>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Strong" value={strongSignals.toString()} hint="PPS ≥ 70" icon={<TrendingUp size={18} />} tone="teal" />
            <StatCard label="Watch" value={watchSignals.toString()} hint="PPS 60-70" icon={<Flame size={18} />} tone="blue" />
            <StatCard label="Danger" value={dangerSignals.toString()} hint="avoid FOMO" icon={<AlertTriangle size={18} />} tone="red" />
            <StatCard label="Top PPS" value={String(topSignal.pps)} hint={topSignal.symbol} icon={<Zap size={18} />} tone="amber" />
          </section>

          <SignalScanPanel />

          <section className="rounded-[2rem] border border-white/80 bg-white/75 p-4 shadow-xl shadow-teal-900/5 backdrop-blur-xl">
            <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">Data Sources</h2>
                <p className="text-xs text-slate-500">Modul yang disiapkan untuk scoring utama dan tahap berikutnya.</p>
              </div>
              <a href="/futures" className="text-xs font-black text-teal-700">Open futures →</a>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <SourceRow icon={<Radar size={16} />} title="DEX Screener" desc="Pair, liquidity, volume" />
              <SourceRow icon={<TrendingUp size={16} />} title="Coinalyze" desc="OI, funding, futures" />
              <SourceRow icon={<Database size={16} />} title="Supabase" desc="Signal history" />
              <SourceRow icon={<Layers3 size={16} />} title="Explorer" desc="Wallet analyzer" />
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-400 text-white shadow-lg shadow-cyan-400/20">
        <Radar size={20} />
      </div>
      <div>
        <p className={`${compact ? 'text-sm' : 'text-base'} font-black leading-none`}>PumpRadar</p>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Vision AI</p>
      </div>
    </div>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm ring-1 ring-slate-200">{children}</span>;
}

function StatCard({ icon, label, value, hint, tone }: { icon: ReactNode; label: string; value: string; hint: string; tone: 'teal' | 'blue' | 'red' | 'amber' }) {
  const styles = {
    teal: 'from-teal-50 text-teal-700 ring-teal-100',
    blue: 'from-cyan-50 text-cyan-700 ring-cyan-100',
    red: 'from-red-50 text-red-700 ring-red-100',
    amber: 'from-amber-50 text-amber-700 ring-amber-100'
  }[tone];

  return (
    <div className={`rounded-[1.6rem] border border-white/80 bg-gradient-to-br ${styles} to-white p-4 shadow-xl shadow-teal-900/5 ring-1`}>
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/80 shadow-sm">{icon}</div>
      <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-400">{hint}</p>
    </div>
  );
}

function SourceRow({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-teal-600 shadow-sm">{icon}</div>
      <div>
        <p className="text-sm font-black text-slate-900">{title}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
    </div>
  );
}
