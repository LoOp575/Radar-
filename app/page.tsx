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
  { label: 'API Data', icon: <Database size={16} />, href: '/api/dex?q=HOT' }
];

const labItems = [
  { label: 'PPS Engine', icon: <BrainCircuit size={15} /> },
  { label: 'Wallet DNA', icon: <WalletCards size={15} /> },
  { label: 'Risk Shield', icon: <ShieldCheck size={15} /> },
  { label: 'Config', icon: <Settings2 size={15} /> }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#eef4f1] text-slate-900">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_6%,rgba(45,212,191,0.26),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(56,189,248,0.2),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.8),rgba(236,253,245,0.35))]" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl gap-4 p-3 md:p-5">
        <aside className="hidden w-60 shrink-0 rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-xl shadow-teal-900/5 backdrop-blur-xl lg:block">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-400 text-white shadow-lg shadow-cyan-400/20">
              <Radar size={20} />
            </div>
            <div>
              <p className="text-sm font-black leading-none">PumpRadar</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Vision AI</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition ${
                  item.active
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/10'
                    : 'text-slate-500 hover:bg-white hover:text-slate-900'
                }`}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-8">
            <p className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">AI Lab</p>
            <div className="mt-2 space-y-1">
              {labItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-500">
                  <span className="text-teal-500">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-3xl bg-slate-950 p-4 text-white shadow-xl shadow-slate-900/15">
            <p className="text-xs font-black uppercase tracking-widest text-teal-200">System</p>
            <p className="mt-2 text-2xl font-black">LIVE</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">Scanner sudah menyatu di dashboard utama. API hanya bekerja di belakang layar.</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 space-y-4">
          <header className="rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-xl shadow-teal-900/5 backdrop-blur-xl md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-teal-700 ring-1 ring-teal-100">
                  <Sparkles size={13} /> AI Crypto Scanner
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-4xl">Dashboard Scanner</h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  Satu halaman: ketik scan, hasil koin langsung muncul. Tidak perlu buka /api dan tidak ada halaman signal terpisah.
                </p>
              </div>

              <a href="/futures" className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800">
                Futures
              </a>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Strong" value={strongSignals.toString()} hint="PPS ≥ 70" icon={<TrendingUp size={18} />} tone="teal" />
            <StatCard label="Watch" value={watchSignals.toString()} hint="PPS 60-70" icon={<Flame size={18} />} tone="blue" />
            <StatCard label="Danger" value={dangerSignals.toString()} hint="avoid FOMO" icon={<AlertTriangle size={18} />} tone="red" />
            <StatCard label="Top PPS" value={String(topSignal.pps)} hint={topSignal.symbol} icon={<Zap size={18} />} tone="amber" />
          </section>

          <SignalScanPanel />

          <section className="rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-xl shadow-teal-900/5 backdrop-blur-xl">
            <h2 className="text-lg font-black text-slate-950">Sources</h2>
            <p className="mt-1 text-xs text-slate-500">Integrasi data yang aktif. Semua dipakai dari scanner utama.</p>
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

function StatCard({ icon, label, value, hint, tone }: { icon: ReactNode; label: string; value: string; hint: string; tone: 'teal' | 'blue' | 'red' | 'amber' }) {
  const styles = {
    teal: 'from-teal-50 text-teal-700 ring-teal-100',
    blue: 'from-cyan-50 text-cyan-700 ring-cyan-100',
    red: 'from-red-50 text-red-700 ring-red-100',
    amber: 'from-amber-50 text-amber-700 ring-amber-100'
  }[tone];

  return (
    <div className={`rounded-[1.6rem] border border-white/70 bg-gradient-to-br ${styles} to-white p-4 shadow-xl shadow-teal-900/5 ring-1`}>
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
