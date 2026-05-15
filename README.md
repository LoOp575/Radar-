# PumpRadar Vision

PumpRadar Vision adalah MVP dashboard crypto scanner untuk mendeteksi **early pump setup** berbasis data: volume anomaly, wallet accumulation, derivatives pressure, liquidity health, social acceleration, market structure, dan risk filter.

> Catatan penting: sistem ini tidak menjamin profit atau akurasi pasti. Target 70%+ harus diuji lewat backtest ketat pada kategori sinyal tertentu, bukan semua sinyal.

## Fitur MVP

- Next.js dashboard mobile-friendly
- Ranking token berdasarkan Pre-Pump Score / PPS
- Risk Score untuk menghindari late pump, rug risk, dan liquidity trap
- API route `/api/signals`
- Mock data siap diganti data real
- Prisma schema untuk PostgreSQL/Supabase
- Worker contoh untuk alert Telegram
- Data source adapter awal untuk CoinGecko, DEX Screener, CoinGlass/exchange futures, dan chain explorer

## Formula PPS

```txt
PPS = 0.20V + 0.18W + 0.15D + 0.14L + 0.12S + 0.11M + 0.10R
```

Komponen:

- `V` = volume anomaly
- `W` = wallet accumulation
- `D` = derivatives pressure
- `L` = liquidity health
- `S` = social/narrative acceleration
- `M` = market structure
- `R` = inverse risk score

## Cara jalan lokal

```bash
npm install
npm run dev
```

Buka:

```txt
http://localhost:3000
```

API sinyal:

```txt
http://localhost:3000/api/signals
```

## Env

Copy `.env.example` ke `.env.local`.

```bash
cp .env.example .env.local
```

Isi sesuai kebutuhan:

```txt
DATABASE_URL=
COINGECKO_API_KEY=
COINGLASS_API_KEY=
ETHERSCAN_API_KEY=
SOLSCAN_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

## Database

Generate Prisma client:

```bash
npx prisma generate
```

Push schema ke Supabase/PostgreSQL:

```bash
npx prisma db push
```

## Deploy Vercel

1. Import repo ini ke Vercel.
2. Framework: Next.js.
3. Build command: `npm run build`.
4. Output default.
5. Tambahkan env jika sudah pakai database/API real.

## Struktur utama

```txt
app/
  api/signals/route.ts
  globals.css
  layout.tsx
  page.tsx
lib/
  data-sources.ts
  mock-data.ts
  scoring.ts
  types.ts
prisma/
  schema.prisma
workers/
  telegram-alert.ts
```

## Tahap berikutnya

1. Ganti mock data dengan fetch CoinGecko + DEX Screener.
2. Tambah worker scheduler untuk update snapshot setiap 1-5 menit.
3. Simpan sinyal ke database.
4. Tambah wallet analyzer real.
5. Tambah futures engine untuk OI/funding.
6. Tambah backtest engine untuk validasi precision.
7. Tambah Telegram alert production.

## Definisi win backtest awal

Sinyal dianggap win jika setelah alert:

```txt
harga naik minimal 5% dalam 1-6 jam
sebelum invalidasi -3% kena
```

Untuk swing setup:

```txt
harga naik 10-25% dalam 24-72 jam
sebelum invalidasi kena
```

## Warning

- Jangan jadikan PPS sebagai sinyal buy otomatis tanpa validasi.
- Hindari all-in.
- Wajib pakai invalidasi.
- Token microcap punya risiko rug, honeypot, liquidity trap, dan manipulasi tinggi.
