# Manual QA Script (Stabilization Sprint)

Run this script on the exact commit you plan to deploy.

## 1) Archive Query Hardening

1. Open `/archive`.
2. Trigger search with:
   - `limit=999999`
   - `limit=abc`
   - `offset=-1`
   - `offset=abc`
3. Confirm API returns stable bounded behavior (no 500s).
4. Send oversized search inputs (`q`, chip terms, date lists) and confirm clean `400` responses.

## 2) Archive Abuse Throttle

1. Fire repeated `/api/archive/search` requests quickly (browser/devtools or script).
2. Confirm throttle eventually returns `429` with `Retry-After`.
3. Confirm UI recovers after cooldown.

## 3) Chat + Memory Core Flow

1. Create a session and send a chat turn.
2. Save assistant output to memory via vault flow.
3. Attach memory to session, pin/unpin it, and verify behavior still works.
4. Refresh page and ensure session/messages remain correct.

## 4) Image Lifecycle Regression (Next-Day Reminder)

1. Upload an image in composer.
2. Remove that image from composer/session.
3. Upload the same image file again.
4. Confirm second upload succeeds and send path still works.

## 5) Plan Limits

1. Verify free-plan limits are enforced (chat turns/web/image caps).
2. Verify plus-plan behavior uses configured higher limits.

## 6) Build/Static Checks

1. Run `npm run typecheck`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Record any accepted warnings before launch.
