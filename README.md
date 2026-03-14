# OpsBridge — Factory Floor Task Management App

A digital SOP (Standard Operating Procedure) tool for factory managers and workers.
Managers assign structured tasks in English; workers view and complete them in Simplified Chinese.

## Repository Structure

```
OpsBridge-/
├── DEVELOPMENT_PLAN.md      ← Full 5-phase development plan (start here)
└── opsbridge/
    ├── src/                 ← React frontend (Phase 1–5)
    │   ├── components/      ← Reusable UI components
    │   ├── context/         ← Auth state (AuthContext)
    │   ├── pages/           ← Login, Manager Dashboard, Worker Dashboard
    │   ├── services/        ← Supabase client
    │   └── hooks/           ← Custom React hooks (added in later phases)
    ├── server/              ← Node.js/Express backend
    │   ├── routes/          ← /api/translate, /api/badges
    │   └── services/        ← Badge engine logic
    ├── database/            ← SQL files to run in Supabase SQL Editor
    │   ├── 01_schema.sql    ← Create all tables
    │   ├── 02_rls_policies.sql ← Security policies
    │   ├── 03_seed_data.sql ← Sample data for testing
    │   └── 04_functions.sql ← PostgreSQL helper functions
    ├── .env.example         ← Copy to .env and fill in your keys
    └── package.json         ← Frontend dependencies
```

## Quick Start (Phase 1)

1. Read `DEVELOPMENT_PLAN.md` fully before touching any code
2. Set up Supabase: create project, run SQL files 01→04 in order
3. Copy `.env.example` → `.env` and fill in your Supabase keys
4. `cd opsbridge && npm install && npm run dev`
5. `cd opsbridge/server && npm install && npm run dev`

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database + Auth | Supabase (PostgreSQL) |
| Translation | Google Cloud Translation API |
| Deployment | Vercel (frontend) + Railway (backend) |
