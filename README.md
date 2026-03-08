# DartBoard

DartBoard is an AI workspace for long-running conversations.

Instead of treating each chat like a disposable thread, it lets you:
- attach reusable memories to a session
- import and search a ChatGPT archive
- branch, continue, and roll over conversations
- shape behavior with modes and session focus

## Why It Exists

Most chat apps are good at a single prompt and bad at continuity.

DartBoard is built around continuity:
- session-level memory attachment instead of hidden retrieval
- archive search over imported history plus live chat
- workflows for resuming, branching, and compressing long threads

## Core Features

- Chat workspace with mode switching, focus state, and memory injection
- Memory vault with folders, rich editing, and session attachments
- Archive import from ChatGPT exports (`.json` and `.parquet`)
- Archive search, context windows, and monthly timeline views
- Image attachments for model turns
- Supabase auth and Stripe-backed Plus billing

## Stack

- Next.js App Router
- React + TypeScript
- SQLite via `better-sqlite3`
- Supabase auth
- OpenAI responses/chat APIs
- Gemini/Tavily for optional web-backed turns

## Architecture Notes

- The current deployment model is intentionally single-node.
- SQLite is the source of truth for chats, memories, archive rows, usage, and rate limits.
- Uploaded images are stored privately and served through authenticated routes.

This is a pragmatic v1 architecture, not a horizontally scaled one.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run typecheck
npm run build
npm run dev
```

Open `http://localhost:3000`.

The chat app lives at `/`.
The marketing page lives at `/home`.

## Environment Variables

Required:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Billing:
- `STRIPE_SECRET_KEY`
- `STRIPE_PLUS_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

Optional:
- `NEXT_PUBLIC_BASE_URL`
- `DB_PATH`
- `DARTZ_MAX_OUTPUT_TOKENS`
- `GEMINI_API_KEY`
- `TAVILY_API_KEY`

## Scripts

- `npm run dev`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Shipping Constraints

- This repo is optimized for a real single-server deployment, not multi-region scale.
- Rate limiting and usage tracking are persisted in SQLite.
- Public-launch hardening should focus on privacy, auth boundaries, build health, and repo cleanliness before adding more product surface.

## Docs

- [API Route Map](docs/API_ROUTE_MAP.md)
- [Launch Checklist](docs/LAUNCH_CHECKLIST.md)
- [Manual QA Script](docs/MANUAL_QA_SCRIPT.md)
- [Chat Invariants](README-chat-invariants.md)
