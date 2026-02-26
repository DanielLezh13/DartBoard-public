# DartBoard

AI chat + memory workspace for long-running workflows, with archive search, foldered sessions, and Stripe-powered Plus billing.

## Live Demo

- App: `https://dartboard-production-71e8.up.railway.app`
- Video walkthrough: `TODO: add YouTube/Loom link`

## Screenshots

> Replace these with your real images after recording/capturing.

![Chat Workspace](public/readme/chat-workspace.png)
![Memory Vault + Drag to Chat](public/readme/memory-drag-injection.png)
![Archive Search](public/readme/archive-search.png)

## What DartBoard Can Do

- Create and organize chats in folders.
- Use the right-side Memory workspace to create, edit, organize, and reuse memories while chatting.
- Drag memories directly into chat for context injection.
- Attach, detach, and pin session-specific memories.
- Import and search ChatGPT archives.
- Switch modes/focus behavior during chat sessions.
- Authenticate users with Supabase.
- Upgrade to Plus using Stripe checkout + webhook plan sync.

## How It Works (High Level)

- **Frontend**: Next.js App Router + React + TypeScript + Tailwind.
- **Auth**: Supabase session and scope checks.
- **Storage**: SQLite (`better-sqlite3`) for soft-launch single-node deployment.
- **LLM**: OpenAI chat completions with token-budget-aware memory injection.
- **Billing**: Stripe checkout, billing portal, and webhook-driven plan updates.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Core:

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
- `DARTZ_MAX_OUTPUT_TOKENS`

## Stripe Webhook Events

Configure endpoint:

- `https://<your-domain>/api/billing/webhook`

Subscribe to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Scripts

- `npm run dev` - local development server
- `npm run typecheck` - TypeScript checks
- `npm run lint` - ESLint checks
- `npm run build` - production build

## Safety and Constraints

- Markdown rendering is hardened (no raw HTML execution).
- Uploads are validated by magic bytes.
- Search and expensive endpoints have auth/throttling guards.
- Current architecture is intentionally single-node for soft launch.

## Roadmap

- Multi-instance-safe persistence/rate limiting.
- Additional memory tooling and retrieval UX.
- Expanded analytics and onboarding polish.

## Docs

- [API Route Map](docs/API_ROUTE_MAP.md)
- [Launch Checklist](docs/LAUNCH_CHECKLIST.md)
- [Manual QA Script](docs/MANUAL_QA_SCRIPT.md)
