import { SignalScanPanel } from '@/components/SignalScanPanel';

export default function SignalsPage() {
  return (
    <main className="min-h-screen bg-[#eef4f1] px-3 py-4 text-slate-900 md:px-6 md:py-6">
      <section className="mx-auto max-w-7xl">
        <SignalScanPanel />
      </section>
    </main>
  );
}
