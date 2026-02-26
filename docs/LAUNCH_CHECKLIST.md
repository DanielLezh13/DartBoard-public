# Soft Launch Checklist (Single-Server)

Use this as the preflight checklist before making DartBoard public.

## Security and Abuse Controls

- [ ] Archive query guards are active (`limit`/`offset` bounds + shape caps).
- [ ] Archive search route-specific rate limit is active.
- [ ] Upload endpoint accepts only real image bytes (jpg/png/webp/gif).
- [ ] Chat route blocks guest model calls.
- [ ] Sensitive prompt/memory debug logs are removed from launch paths.

## Stability

- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes (or warnings are consciously accepted).
- [ ] `npm run build` passes.
- [ ] Chat send/edit/archive flows work after server restart.

## Product Hygiene

- [ ] No visible stub actions in core UI paths.
- [ ] README reflects actual architecture and constraints.
- [ ] Manual QA script completed once on latest commit.

## Operational Readiness (Single Node)

- [ ] Deployment host has persistent disk for `dartz_memory.db`.
- [ ] Restart procedure documented and tested.
- [ ] Database backup/restore procedure documented and tested.
- [ ] Required env vars are set in deployment environment.
