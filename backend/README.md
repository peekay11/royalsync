# RoyalSync API

## Run locally

1. Copy `.env.example` to `.env`.
2. Set a long random `AUTH_SECRET` and a one-time `BOOTSTRAP_TOKEN`.
3. Install dependencies with `npm ci`.
4. Start with `npm run dev`.

The API starts with an empty data store. There are no seeded users or business records.

## Create the first administrator

Before any account exists, call:

```text
POST /api/auth/bootstrap-admin
x-bootstrap-token: <BOOTSTRAP_TOKEN>
Content-Type: application/json

{"email":"admin@your-domain.example","password":"use-a-password-at-least-12-characters"}
```

Remove or rotate `BOOTSTRAP_TOKEN` after provisioning. The endpoint disables itself after the first account is created.

## Production requirements

- Use a database-backed implementation instead of the local JSON store for multiple instances.
- Configure `CORS_ORIGINS` with exact HTTPS origins.
- Put the API behind HTTPS and a reverse proxy.
- Configure provider URLs for email, SMS, storage, payments, insurer gateway, and AI before enabling those workflows.
- Add the provider implementations from `src/integrations/providers.ts`.

Health check: `GET /health`.