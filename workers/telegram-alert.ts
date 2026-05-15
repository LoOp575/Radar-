import { scoreTokens } from '../lib/scoring';
import { mockTokens } from '../lib/mock-data';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegram(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('[telegram disabled]', message);
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' })
  });

  if (!response.ok) {
    throw new Error(`Telegram send failed: ${response.status}`);
  }
}

async function main() {
  const signals = scoreTokens(mockTokens).filter((signal) => signal.pps >= 70 && signal.risk <= 40);

  for (const signal of signals) {
    await sendTelegram(`🚨 *${signal.signal}*\n\nToken: *${signal.symbol}* / ${signal.chain}\nPPS: *${signal.pps}*\nRisk: *${signal.risk}*\nSmart buy: $${signal.smartWalletNetBuyUsd.toLocaleString()}\nOI 1h: ${signal.oiChange1h}%\n\n${signal.reasons.slice(0, 5).map((r) => `✅ ${r}`).join('\n')}\n\n${signal.invalidation}\n${signal.quickTargets}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
