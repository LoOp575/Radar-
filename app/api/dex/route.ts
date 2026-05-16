import { NextRequest, NextResponse } from 'next/server';
import { scanDexQuery } from '@/lib/dexscreener';
import { mockTokens } from '@/lib/mock-data';
import { scoreTokens } from '@/lib/scoring';

export const dynamic = 'force-dynamic';

function isBrowserNavigation(request: NextRequest) {
  const accept = request.headers.get('accept') ?? '';
  const fetchMode = request.headers.get('sec-fetch-mode') ?? '';
  const jsonIntent = request.headers.get('x-radar-client') === 'scanner-ui';

  return !jsonIntent && fetchMode === 'navigate' && accept.includes('text/html');
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? 'HOT';

  if (isBrowserNavigation(request)) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = `?scan=${encodeURIComponent(query)}`;
    return NextResponse.redirect(url);
  }

  try {
    const tokens = await scanDexQuery(query);
    const signals = scoreTokens(tokens.length ? tokens : mockTokens);

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      source: tokens.length ? 'dexscreener' : 'fallback-mock-data',
      query,
      count: signals.length,
      warning: tokens.length ? null : 'DEX Screener returned no usable pairs, showing fallback mock signals.',
      signals
    });
  } catch (error) {
    const fallbackSignals = scoreTokens(mockTokens);

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      source: 'fallback-mock-data',
      query,
      count: fallbackSignals.length,
      warning: 'DEX scanner failed, showing fallback mock signals so the endpoint stays usable.',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      signals: fallbackSignals
    });
  }
}
