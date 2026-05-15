import type { TokenSignal } from './types';
import { hasDatabase, prisma } from './db';

export async function saveSignals(signals: TokenSignal[]) {
  if (!hasDatabase) {
    return { saved: 0, skipped: true, reason: 'DATABASE_URL is not configured' };
  }

  const rows = signals.map((signal) => ({
    symbol: signal.symbol,
    chain: signal.chain,
    pps: signal.pps,
    risk: signal.risk,
    signal: signal.signal,
    confidence: signal.confidence,
    reasons: signal.reasons,
    warnings: signal.warnings,
    entryPrice: signal.price,
    invalidPrice: signal.price * 0.97
  }));

  const result = await prisma.signal.createMany({
    data: rows,
    skipDuplicates: false
  });

  return { saved: result.count, skipped: false };
}

export async function getRecentSignals(limit = 50) {
  if (!hasDatabase) {
    return [];
  }

  return prisma.signal.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit
  });
}
