# Smile

**Super fuel. Optimize your human energy for peak performance.**

Part of the [12 Cities](https://github.com/abduljaleel) venture ecosystem.

## What it does

Smile is a human energy and performance platform. It measures energy across four dimensions (Physical, Mental, Emotional, Social), generates personalized protocols, and tracks daily performance trends.

### Core Features

- **Energy Dashboard** — Daily 0-100 score displayed as SVG circular indicator with 4-quadrant breakdown and 30-day sparkline
- **Energy Diagnostic** — 20-question assessment across Physical, Mental, Emotional, and Social dimensions with radar chart results
- **Performance Protocols** — Personalized habit checklists (morning/evening/recovery/focus) with streak tracking and compliance rates
- **Daily Logging** — Quick-entry form for energy score, mood, sleep, exercise, focus hours, and stress level
- **Trend Intelligence** — 30-day trends, dimension tracking, and correlation insights (e.g., sleep vs. energy patterns)

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **UI:** Tailwind CSS v4 + shadcn/ui
- **Auth & Database:** Supabase (Auth, Postgres, RLS)
- **Deployment:** Vercel

## Getting Started

```bash
npm install
cp .env.local.example .env.local
# Add your Supabase URL and anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 12 Cities Role

**Domain:** smile.dk | **Tier:** 2 (Depth) | **Layer:** Human and Market

## License

Private — 12 Cities Venture System
