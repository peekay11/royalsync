# Cloudflare Infrastructure Migration & Full Implementation Plan

To migrate this Express + SQLite prototype to production-grade Cloudflare Workers (Hono + D1) and implement the 80+ missing endpoints, the following steps are required:

## Phase 1: Framework Migration (Express -> Hono)
Cloudflare Workers run on V8 isolates, which means native Node.js libraries (like `fs`, `path`, `http`) used by Express are unsupported at the edge without heavy polyfills.
- Replace `express` with `hono` (Edge-native router).
- Rewrite the `req`/`res` signatures in all 8 existing controllers to use Hono's `Context` (`c.req.json()`, `c.json()`).
- Rewrite the `authenticate` and `authorize` middlewares to Hono middleware format.

## Phase 2: Database Migration (SQLite -> D1)
Cloudflare does not support local files (like our `dev.db`). We must use Cloudflare D1.
- Update `schema.prisma` to use the `@prisma/adapter-d1` preview feature.
- Inject the Cloudflare environment binding (`env.DB`) into Prisma on every request.
- Run `wrangler d1 migrations create` to convert Prisma schemas into D1 SQL.

## Phase 3: Implementing the 80+ Missing Endpoints
This is the largest phase, spanning 4 distinct portal experiences:
- **Onboarding/Leads Domain:** `/leads`, magic link generation, conversion logic.
- **Applications/Quoting Domain:** Building the FNA state machine, Quote Request canonical routing, ranking algorithm.
- **Payments Domain:** DebiCheck status polling, mandate creation, balances.
- **Document Vault:** R2 bucket integration for chunked uploads and signed URLs.
- **IAM / Super Admin:** RBAC matrix logic, MFA enrollment/verification via Cloudflare bindings.

*Given the sheer size of this codebase expansion (thousands of lines of code across dozens of files), it is highly recommended to execute this using parallel autonomous agents.*
