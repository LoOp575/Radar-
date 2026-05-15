'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, History, LineChart, Radar, Wifi } from 'lucide-react';
import type { ComponentType } from 'react';

type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: ComponentType<{ size?: number; className?: string }>;
};

const items: NavItem[] = [
  { href: '/', label: 'Dashboard', short: 'Scan', icon: Radar },
  { href: '/futures', label: 'Futures', short: 'Futures', icon: LineChart },
  { href: '/status', label: 'API Status', short: 'Status', icon: Wifi },
  { href: '/history', label: 'History', short: 'Hist', icon: History }
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#02080b]/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-2.5 md:px-6 md:py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/30 via-emerald-400/20 to-amber-300/20 ring-1 ring-cyan-300/30">
            <Radar size={17} className="text-cyan-100" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_2px_rgba(72,240,164,0.7)]" />
          </div>
          <div className="leading-tight">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200/80">PumpRadar</p>
            <p className="-mt-0.5 text-sm font-black text-white md:text-base">Vision</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04] p-1 no-scrollbar">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-1.5 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-xs font-bold transition md:px-3 md:py-2 md:text-sm ${
                  active
                    ? 'bg-gradient-to-br from-cyan-400/25 to-emerald-400/20 text-white ring-1 ring-cyan-300/30 shadow-inner shadow-cyan-500/10'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <Icon size={13} className={active ? 'text-cyan-100' : 'text-slate-500 group-hover:text-cyan-200'} />
                <span className="hidden md:inline">{item.label}</span>
                <span className="md:hidden">{item.short}</span>
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[11px] font-black text-emerald-100 ring-1 ring-emerald-300/25 md:flex">
          <span className="live-dot" />
          <Activity size={12} /> LIVE
        </div>
      </div>
    </header>
  );
}
