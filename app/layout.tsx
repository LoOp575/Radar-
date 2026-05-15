import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PumpRadar Vision',
  description: 'Early pump scanner, wallet intelligence, and crypto market radar.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
