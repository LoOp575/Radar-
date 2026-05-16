import { ArrowUpRight, RefreshCw, ShieldCheck, SignalHigh } from 'lucide-react';
import { mockTokens } from '@/lib/mock-data';
import { formatCompact, scoreTokens } from '@/lib/scoring';

const signals = scoreTokens(mockTokens);

function badge(score: number, type: 'pps' | 'risk' = 'pps') {
  if (type === 'risk') {
    if (score <= 30) return 'bg-emerald-400/15 text-emerald-100 ring-emerald-400/25';
    if (score <= 55) return 'bg-amber-400/15 text-amber-100 ring-amber-400/25';
    return 'bg-red-400/15 text-red-100 ring-red-400/25';
  }
  if (score >= 70) return 'bg-emerald-400/15 text-emerald-100 ring-emerald-400/25';
  if (score >= 55) return 'bg-cyan-400/15 text-cyan-100 ring-cyan-400/25';
  return 'bg-white/[0.06] text-slate-200 ring-white/10';
}

export default function SignalsPage() {
  return (
    <main className="min-h-screen bg-[#03080b] px-3 py-4 text-slate-100 md:px-8 md:py-8">
      <section className="mx-auto max-w-6xl space-y-4">
        <header className="rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-cyan-300/10 via-white/[0.05] to-emerald-300/10 p-4 shadow-2xl shadow-black/30 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-300/10 px-3 py-1 text-[11px] font-black text-cyan-100 ring-1 ring-cyan-300/25">
                <SignalHigh size={13} /> SIGNALS UI
              </div>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">Signal Scanner</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Tampilan normal untuk hasil scanner. Endpoint JSON tetap ada di /api/signals, tapi halaman ini dibuat untuk dibaca manusia.
              </p>
            </div>
            <a href="/signals" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300/15 px-4 py-2 text-sm font-black text-cyan-100 ring-1 ring-cyan-300/25">
              <RefreshCw size={15} /> Refresh
            </a>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <Stat label="Total signals" value={String(signals.length)} />
          <Stat label="Strong setup" value={String(signals.filter((s) => s.pps >= 70 && s.risk <= 40).length)} />
          <Stat label="Risk filtered" value="ON" />
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {signals.map((token, index) => (
            <article key={token.symbol} className="rounded-[1.4rem] border border-white/10 bg-white/[0.055] p-4 shadow-xl shadow-black/20 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-slate-500">#{index + 1} · {token.chain}</p>
                  <h2 className="truncate text-2xl font-black text-white">{token.symbol}</h2>
                  <p className="truncate text-xs text-slate-500">{token.name} · {token.exchange}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full px-3 py-1 text-sm font-black ring-1 ${badge(token.pps)}`}>{token.pps} PPS</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ring-1 ${badge(token.risk, 'risk')}`}>{token.risk} Risk</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                <Cell label="Price" value={`$${token.price}`} />
                <Cell label="1H" value={`${token.priceChange1h >= 0 ? '+' : ''}${token.priceChange1h}%`} positive={token.priceChange1h >= 0} />
                <Cell label="Vol 15m" value={`$${formatCompact(token.volume15m)}`} />
                <Cell label="Liq" value={`$${formatCompact(token.liquidity)}`} />
              </div>

              <div className="mt-4 rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
                <div className="mb-2 flex items-center gap-2 text-xs font-black text-emerald-100">
                  <ShieldCheck size={14} /> {token.signal}
                </div>
                <ul className="space-y-1 text-xs text-slate-400">
                  {token.reasons.slice(0, 3).map((reason) => <li key={reason}>✅ {reason}</li>)}
                  {token.reasons.length === 0 && <li>Menunggu konfirmasi volume/wallet/funding.</li>}
                </ul>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{token.invalidation}</span>
                <ArrowUpRight size={14} className="text-cyan-200" />
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-white">{value}</p></div>;
}

function Cell({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  const color = positive === true ? 'text-emerald-100' : positive === false ? 'text-red-100' : 'text-white';
  return <div className="rounded-xl bg-black/20 p-2 ring-1 ring-white/10"><p className="text-[10px] text-slate-500">{label}</p><p className={`truncate font-black ${color}`}>{value}</p></div>;
}
