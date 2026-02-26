# DartBoard

A chat + memory workspace for long-running AI workflows, with archive import/search and session-scoped memory injection.

## Live

- App: `https://dartboard-production-71e8.up.railway.app`

## Product Surfaces

- **Chat (`/chat`)**: streaming chat, folders, mode switching, focus mode, image upload.
- **Memories**: create/edit memories, attach/detach/pin to a session, token-budget-aware injection.
- **Archive (`/archive`)**: import ChatGPT exports (JSON/parquet), query/filter, save results to memory.
- **Auth/Billing**: Supabase auth + Stripe plan sync/checkouts.

## Architecture Snapshot

- **Framework**: Next.js App Router + TypeScript + Tailwind.
- **Primary storage**: local SQLite (`better-sqlite3`) via [`lib/db.ts`](/Users/daniel/dev/DartBoard-main/lib/db.ts).
- **Auth**: Supabase session + server scope checks.
- **LLM**: OpenAI chat completions (plus optional web-grounding paths).
- **API shape**: route handlers under [`app/api`](/Users/daniel/dev/DartBoard-main/app/api).
- **Memory pipeline**: session attachments + pinned injection through the boot sequence.

## Current Deployment Constraints

- Intended for **single-server deployment** in this phase.
- SQLite is intentionally retained for soft launch.
- Middleware rate limiting is in-memory (single-node baseline).

## Launch Safety Posture (Current)

- Markdown rendering hardened (no raw HTML execution in chat/archive renderers).
- Uploads validated by magic bytes (not client MIME/type).
- Archive search now has strict query-shape guards and bounded pagination.
- Expensive endpoints have auth + throttling gates.

## Environment Variables

Required for core app:

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Common optional variables:

- `NEXT_PUBLIC_BASE_URL` (absolute app base for local-upload URL normalization)
- `DARTZ_MAX_OUTPUT_TOKENS` (server-side output token override)

Billing-only:

- `STRIPE_SECRET_KEY`
- `STRIPE_PLUS_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

Use the provided template:

```bash
cp .env.example .env.local
```

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production Deploy Notes

- Railway is the current deploy target for soft launch.
- Stripe uses environment variables only; no secrets are committed to source.
- For billing webhooks, configure endpoint:
  - `https://<your-domain>/api/billing/webhook`
  - events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

## Scripts

- `npm run dev` - local dev server
- `npm run lint` - Next.js ESLint
- `npm run typecheck` - TypeScript checks
- `npm run build` - production build

## Documentation

- API route map: [docs/API_ROUTE_MAP.md](/Users/daniel/dev/DartBoard-main/docs/API_ROUTE_MAP.md)
- Launch checklist: [docs/LAUNCH_CHECKLIST.md](/Users/daniel/dev/DartBoard-main/docs/LAUNCH_CHECKLIST.md)
- Manual QA script: [docs/MANUAL_QA_SCRIPT.md](/Users/daniel/dev/DartBoard-main/docs/MANUAL_QA_SCRIPT.md)

## Known Constraints

- Single-node architecture in this phase (SQLite + in-memory rate limits).
- Not yet tuned for multi-instance horizontal scaling.
