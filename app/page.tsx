import type { ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BrainCircuit,
  Database,
  Flame,
  History,
  Layers3,
  LineChart,
  Radar,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  WalletCards,
  Zap
} from 'lucide-react';
import { mockTokens } from '@/lib/mock-data';
import { formatCompact, scoreTokens } from '@/lib/scoring';
import type { TokenSignal } from '@/lib/types';

const signals = scoreTokens(mockTokens);
const topSignal = signals[0];
const strongSignals = signals.filter((s) => s.pps >= 70 && s.risk <= 40).length;
const dangerSignals = signals.filter((s) => s.signal === 'DANGER' || s.signal === 'LATE / DO NOT CHASE').length;
const watchSignals = signals.filter((s) => s.pps >= 60 && s.pps < 70).length;

const navItems = [
  { label: 'Dashboard', icon: <BarChart3 size={16} />, active: true, href: '/' },
  { label: 'Live Scanner', icon: <Radar size={16} />, href: '/signals' },
  { label: 'Futures', icon: <LineChart size={16} />, href: '/futures' },
  { label: 'History', icon: <History size={16} />, href: '/signals/history' },
  { label: 'Sources', icon: <Database size={16} />, href: '/api/dex?q=HOT' }
];

const labItems = [
  { label: 'PPS Engine', icon: <BrainCircuit size={15} /> },
  { label: 'Wallet DNA', icon: <WalletCards size={15} /> },
  { label: 'Risk Shield', icon: <ShieldCheck size={15} /> },
  { label: 'Config', icon: <Settings2 size={15} /> }
];

function ppsTone(score: number) {
  if (score >= 75) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (score >= 60) return 'bg-cyan-50 text-cyan-700 ring-cyan-200';
  return 'bg-slate-100 text-slate-600 ring-slate-200';
}

function riskTone(risk: number) {
  if (risk <= 30) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  if (risk <= 55) return 'bg-amber-50 text-amber-700 ring-amber-200';
  return 'bg-red-50 text-red-700 ring-red-200';
}

function signalTone(signal: string) {
  if (/DANGER|LATE|DISTRIBUTION/.test(signal)) return 'bg-red-50 text-red-700 ring-red-200';
  if (/BREAKOUT|EARLY/.test(signal)) return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
  return 'bg-cyan-50 text-cyan-700 ring-cyan-200';
}

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
            <p className="mt-1 text-xs leading-5 text-slate-400">DEX, futures, risk score, dan signal history siap dipakai.</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 space-y-4">
          <header className="rounded-[2rem] border border-white/70 bg-white/70 p-4 shadow-xl shadow-teal-900/5 backdrop-blur-xl md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-teal-700 ring-1 ring-teal-100">
                  <Sparkles size={13} /> AI Crypto Scanner
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-4xl">Dashboard</h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  Radar koin hot, pre-pump score, risk filter, futures pressure, dan wallet intelligence dalam cockpit futuristik.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a href="/signals" className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50">
                  Signals
                </a>
                <a href="/futures" className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800">
                  Futures
                </a>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Strong" value={strongSignals.toString()} hint="PPS ≥ 70" icon={<TrendingUp size={18} />} tone="teal" />
            <StatCard label="Watch" value={watchSignals.toString()} hint="PPS 60-70" icon={<Flame size={18} />} tone="blue" />
            <StatCard label="Danger" value={dangerSignals.toString()} hint="avoid FOMO" icon={<AlertTriangle size={18} />} tone="red" />
            <StatCard label="Top PPS" value={String(topSignal.pps)} hint={topSignal.symbol} icon={<Zap size={18} />} tone="amber" />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
            <div className="rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-xl shadow-teal-900/5 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-950">Quick Analyze</h2>
                  <p className="text-xs text-slate-500">Scan market hot, AI, meme, atau pair DEX tertentu.</p>
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-black text-teal-700 ring-1 ring-teal-100">HOT MODE</span>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
                  <Search size={16} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-400">HOT / AI / MEME / PEPE</span>
                </div>
                <a href="/api/dex?q=HOT" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-cyan-500/20">
                  Analyze <ArrowUpRight size={16} />
                </a>
              </div>

              <div className="mt-4 rounded-3xl bg-slate-950 p-4 text-white shadow-xl shadow-slate-900/15">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-teal-200">Top setup</p>
                    <p className="mt-2 text-4xl font-black">{topSignal.symbol}</p>
                    <p className="mt-1 text-xs font-bold text-slate-400">{topSignal.name} · {topSignal.chain}</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 px-4 py-3 text-right ring-1 ring-white/10">
                    <p className="text-4xl font-black text-teal-200">{topSignal.pps}</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">PPS</p>
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-200" style={{ width: `${topSignal.pps}%` }} />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <DarkMini label="Risk" value={String(topSignal.risk)} />
                  <DarkMini label="Liquidity" value={`$${formatCompact(topSignal.liquidity)}`} />
                  <DarkMini label="Signal" value={topSignal.signal.replace(' / ', '/')} />
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-xl shadow-teal-900/5 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-950">Recent Activity</h2>
                  <p className="text-xs text-slate-500">Alasan sinyal dan modul yang aktif.</p>
                </div>
                <Activity size={18} className="text-teal-500" />
              </div>

              <div className="space-y-3">
                {topSignal.reasons.slice(0, 4).map((reason) => (
                  <ActivityRow key={reason} text={reason} />
                ))}
                {topSignal.reasons.length === 0 && <ActivityRow text="Menunggu konfirmasi volume/wallet/funding." />}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.4fr_0.75fr]">
            <div className="rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-xl shadow-teal-900/5 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-950">Market Signals</h2>
                  <p className="text-xs text-slate-500">Top scoring setup dari PPS engine.</p>
                </div>
                <a href="/signals" className="text-xs font-black text-teal-600">View all</a>
              </div>

              <div className="hidden overflow-hidden rounded-2xl ring-1 ring-slate-200 md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Token</th>
                      <th className="px-4 py-3">Chain</th>
                      <th className="px-4 py-3">PPS</th>
                      <th className="px-4 py-3">Risk</th>
                      <th className="px-4 py-3">Signal</th>
                      <th className="px-4 py-3">Liquidity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {signals.slice(0, 6).map((token) => (
                      <tr key={token.symbol}>
                        <td className="px-4 py-3"><b>{token.symbol}</b><p className="text-xs text-slate-400">{token.name}</p></td>
                        <td className="px-4 py-3 text-slate-500">{token.chain}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${ppsTone(token.pps)}`}>{token.pps}</span></td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${riskTone(token.risk)}`}>{token.risk}</span></td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ring-1 ${signalTone(token.signal)}`}>{token.signal}</span></td>
                        <td className="px-4 py-3 font-bold text-slate-600">${formatCompact(token.liquidity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 md:hidden">
                {signals.slice(0, 5).map((token, index) => <MobileCard key={token.symbol} token={token} index={index} />)}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/75 p-4 shadow-xl shadow-teal-900/5 backdrop-blur-xl">
              <h2 className="text-lg font-black text-slate-950">Sources</h2>
              <p className="mt-1 text-xs text-slate-500">Integrasi data yang aktif.</p>
              <div className="mt-4 space-y-3">
                <SourceRow icon={<Radar size={16} />} title="DEX Screener" desc="Pair, liquidity, volume" />
                <SourceRow icon={<TrendingUp size={16} />} title="Coinalyze" desc="OI, funding, futures" />
                <SourceRow icon={<Database size={16} />} title="Supabase" desc="Signal history" />
                <SourceRow icon={<Layers3 size={16} />} title="Explorer" desc="Wallet analyzer" />
              </div>
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

function DarkMini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10"><p className="text-[10px] uppercase tracking-widest text-slate-500">{label}</p><p className="mt-1 truncate font-black text-white">{value}</p></div>;
}

function ActivityRow({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal-400 shadow-lg shadow-teal-400/40" />
      <p className="text-sm leading-5 text-slate-600">{text}</p>
    </div>
  );
}

function MobileCard({ token, index }: { token: TokenSignal; index: number }) {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-400">#{index + 1} · {token.chain}</p>
          <p className="text-xl font-black text-slate-950">{token.symbol}</p>
          <p className="text-xs text-slate-400">{token.exchange}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-black ring-1 ${ppsTone(token.pps)}`}>{token.pps} PPS</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <LightMini label="Risk" value={String(token.risk)} />
        <LightMini label="Vol" value={`$${formatCompact(token.volume15m)}`} />
        <LightMini label="Liq" value={`$${formatCompact(token.liquidity)}`} />
      </div>
    </div>
  );
}

function LightMini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-2 ring-1 ring-slate-100"><p className="text-[10px] text-slate-400">{label}</p><p className="truncate font-black text-slate-900">{value}</p></div>;
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
