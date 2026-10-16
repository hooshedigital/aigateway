# AI Gateway Edge Function — Security patch for review

## Scope
This patch affects the public React/Supabase AI Gateway (Deno Edge Function) only.
It does **not** migrate or claim coverage of the separate, unverified FastAPI Gateway Security v3.4 service.

## Fixed in proposed branch
- Removes a credential embedded in source code. **Treat any previously committed credential as compromised and rotate/revoke it through the provider.** Deleting the string from a later commit does not erase Git history.
- Reads `ARVANCLOUD_API_KEY` and `ACCESS_CODE` from the Edge Function environment. Requests fail closed when absent.
- Requires a valid bearer access code for model listing and completions; `/api/status` remains public and minimal.
- Uses explicit CORS allow-origin `GATEWAY_ALLOWED_ORIGIN` (no wildcard when sending authenticated responses).
- Validates JSON shape, message list and request size, completion options, and prevents raw provider error bodies from leaking back to callers.
- Preserves successful SSE streaming and non-stream response flow.
- Adds isolated regression tests (Node 22) using an injected fake provider; no live provider credentials or network calls.

## Release / configuration gate
1. Rotate the previously committed provider key immediately. Do not put the replacement in Git, issues, or chat.
2. Set the new `ARVANCLOUD_API_KEY`, a fresh high-entropy `ACCESS_CODE`, and `GATEWAY_ALLOWED_ORIGIN` using the approved deployment secret manager.
3. Confirm existing clients send `Authorization: Bearer <ACCESS_CODE>`. The original public endpoint implicitly allowed anonymous access; this is an intentional breaking security change.
4. Confirm legitimate web application origins, preflight behavior, and streaming in staging. Cross-origin requests with any other origin will be blocked by browsers.
5. Review rate limiting, server-side per-user authorization, tenant isolation, cost abuse, logging, secret rotation and billing controls separately. A shared access code is only a temporary boundary, **not** a substitute for JWT/session validation or RBAC.
6. Run `node --experimental-strip-types --test tests/gateway-handler.test.mjs` in Node 22, project lint/typecheck/build, and staged smoke checks. Record SHA, logs with secrets redacted and PASS/FAIL before deploying.
7. Do not merge or deploy automatically. Back up the current Edge Function configuration and retain a rollback revision.

## Explicit limitations
- No staging/runtime or production endpoint was accessed by this patch.
- The existing frontend currently stores provider API keys directly in its database. A separate access-control/RLS and secret-handling review is required; this patch does not secure that table.
- The provider/model list is currently fixed to the available upstream model; dynamic provider routing is not implemented by this change.
- A stale key visible in Git history must be rotated by an authorized owner even if this PR is merged.
- The security tests use a fake provider. They prove only local request-handler behavior when CI actually completes.
