# Coffy Shop

Coffee shop web app: menu, cart, and Stripe checkout.

## Run & Operate (local)

```powershell
pnpm install

# Postgres (Docker example on 5433)
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/coffy"
pnpm --filter @workspace/db run push
pnpm --filter @workspace/db run seed

# API (uses API_PORT from .env, default 8080)
pnpm --filter @workspace/api-server run dev

# Frontend (uses PORT/BASE_PATH from .env)
pnpm --filter @workspace/coffy-shop run dev
```

- App: http://127.0.0.1:25197/
- API: http://127.0.0.1:8080/api/healthz
- `pnpm run typecheck` — full typecheck
- `pnpm --filter @workspace/db run seed` — upserts menu categories/items and **image URLs** (safe to re-run)

## Replit Secrets (required for Stripe)

Set in **Tools → Secrets**, then **Stop → Run** both API and web workflows (Secrets do not hot-reload):

| Secret | Example |
|--------|---------|
| `DATABASE_URL` | Replit Postgres URL |
| `STRIPE_SECRET_KEY` | `sk_test_…` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` (must start with `VITE_`) |
| `API_PORT` | `8080` |
| `PORT` | web port from artifact (e.g. `25197`) |
| `BASE_PATH` | `/` |

After changing Secrets: restart API + Vite, then hard-refresh the browser.

After syncing code that adds packages: `pnpm install` in the Replit shell.

If menu images are missing but the Home hero works, re-run seed so `image_url` is backfilled:

```bash
pnpm --filter @workspace/db run seed
```

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Frontend: React + Vite + Tailwind
- Payments: Stripe (test/sandbox)

## Gotchas

- Do not use `npm`; use `pnpm`.
- `PORT` is for Vite; `API_PORT` is for the API (avoids clashes).
- Empty `.env` Stripe keys must not override Replit Secrets (loader skips empty / preserves existing secrets).
- Seed is upsert-based — re-run it to refresh menu image paths on Replit.
