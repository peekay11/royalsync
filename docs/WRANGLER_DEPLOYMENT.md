# Deployment via Cloudflare Wrangler

## Frontend (Cloudflare Pages)
The React/Vite frontend can be deployed easily to Cloudflare Pages using Wrangler.

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy via Wrangler:
   ```bash
   npx wrangler pages deploy dist --project-name royalsync-frontend
   ```

## Backend (Cloudflare Workers)
The current backend is built with **Express** and **Prisma (SQLite)**. Cloudflare Workers run on the V8 isolate environment, which means:
1. **No direct Node.js APIs:** Express needs a polyfill or you should migrate the router to **Hono** (a Cloudflare-native framework).
2. **No local file system:** SQLite (`dev.db`) cannot run on the edge. You must migrate the database to **Cloudflare D1** or a hosted PostgreSQL instance (like Supabase/Neon) and use the Prisma Edge client.

### Steps to Migrate Backend for Wrangler:
1. Initialize a new Cloudflare Worker: `npm create cloudflare@latest`
2. Migrate Express routes to Hono.
3. Switch Prisma to use Cloudflare D1:
   - Update `schema.prisma` provider to `sqlite` (D1 uses SQLite syntax).
   - Use the `@prisma/adapter-d1` package.
4. Deploy the worker: `npx wrangler deploy`

## Current MVP State
The API endpoints from Phase 1 through 9 are fully implemented locally for the demo:
- **Auth Loop:** JWT issuance, role-based checks, and tenant isolation via Prisma Extensions.
- **Financial Core:** Automated normalization of incomes/expenses into a net worth dashboard.
- **Business Logic (Goals & Claims):** State machines for claim advancement and idempotent integrations.
- **AI MVP:** Anthropic/Mock LLM chat interface answering questions based on the client's financial context.
- **Audit Loop:** Immutable audit logging for all critical write actions.
