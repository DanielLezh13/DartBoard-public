# Repo Map

This file is a quick orientation guide for reviewers.

## Top-Level Product Surfaces

- `app/chat/page.tsx` - primary product experience (session + memory workspace).
- `app/archive/page.tsx` - archive import/search/vault workflows.
- `app/profile/page.tsx` - user configuration and preferences.
- `app/home/page.tsx` - embedded marketing surface used by chat home overlay.
- `app/(marketing)/page.tsx` - standalone marketing composition.

## API Route Groups

- `app/api/chat/*` and `app/api/sessions/*` - chat generation + session lifecycle.
- `app/api/memory/*` and `app/api/session-attachments/*` - memory CRUD + attachment state.
- `app/api/archive/*` - archive import/search/context/vault flows.
- `app/api/auth/*` and `app/api/guest/*` - auth/session transitions and guest data.
- `app/api/billing/*` - Stripe checkout, portal, sync, webhook.

## Feature Components

- `components/chat/*` - chat workspace UI regions (rails, panels, overlay, composer).
- `components/vault/*` - memory list/editor primitives shared by chat/archive.
- `components/archive/*` - archive-specific UI modules.
- `components/profile/*` - profile/settings view.
- `components/ui/*` - shared UI primitives.

## Core Hooks

- `hooks/useChatSessions.ts` - session state, folder linkage, persistence and restore.
- `hooks/useChatMemories.ts` - memory/folder state and overlay restore logic.
- `hooks/useChatDnd.ts` - drag/drop behavior for sessions and memories.
- `hooks/useSessionAttachments.ts` - attach/detach/pin + usage hydration.
- `hooks/usePanels.ts` - panel/overlay visibility and breakpoint behavior.

## Prompt Assembly

- `lib/promptAssembly.ts` - canonical system-prompt assembly pipeline.
- `lib/runtimeLaws.ts` - system prompt kernel (global non-negotiable rules).

## Naming Notes

- Current canonical UI names are documented in `README.md` under "UI Region Map".
- Some internal state still uses legacy "rightDock/rightRail/rightPanel" names for
  storage-key and compatibility reasons. These map to the memory-side dock/rail/panel.

## Internal Notes

- `docs/internal/*` contains engineering design notes and roadmap artifacts moved out of
  the repository root to keep first-impression navigation clean.
