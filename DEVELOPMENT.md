# Local Development Setup

This guide gets a fresh contributor up and running with Wants AI on
their own machine. The fastest path is Docker Compose.

## Prerequisites

- **Docker** 20.10+ with Docker Compose v2 — verify with `docker compose version`
- **Git** for cloning the repository
- ~3 GB of free disk space for images and dependencies
- An [OpenRouter API key](https://openrouter.ai/keys) for AI features
  (a free key works fine to try things out)

If you'd rather run the stack natively (without Docker), you'll also
need Node.js 20+, PostgreSQL 15+, and Redis 7+. See **Native Setup**
below.

## Quick Start (Docker)

```bash
# 1. Clone the repository
git clone https://github.com/wants-chat/wants-chat.git
cd wants-chat

# 2. Set up env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Edit backend/.env and set at minimum:
#      JWT_SECRET=<any long random string>
#      OPENROUTER_API_KEY=<your key from openrouter.ai>

# 4. Start the stack
docker compose up

# 5. Open the app
#      Frontend: http://localhost:5173
#      Backend:  http://localhost:3001/health
```

That's it. The first run takes a few minutes to download and build
images; subsequent runs are fast.

## What You Get

| Service | URL / Address |
|---------|---------------|
| Frontend (Vite, hot reload) | http://localhost:5173 |
| Backend (NestJS) | http://localhost:3001 |
| Backend health check | http://localhost:3001/health |
| Postgres | `localhost:5433` (user/db: `wants` / `wants`, password: `wants_secret`) |
| Redis | `localhost:6379` |

The frontend has hot reload — edit anything in `frontend/src/` and
your browser updates immediately. The backend auto-restarts on file
changes in `backend/src/`.

> **Note:** Postgres is exposed on host port **5433**, not 5432, to
> avoid clashing with a native Postgres install. If you `psql` into it
> from your host, use `psql -h localhost -p 5433 -U wants wants`.

## Database

Migrations run automatically on first boot — `docker-compose.yml`
mounts `backend/scripts/migrations` into Postgres's
`/docker-entrypoint-initdb.d`, so you don't need to run anything by
hand.

To reset the database from scratch:

```bash
docker compose down -v
docker compose up
```

(`-v` removes the named volumes, including `postgres_data`.)

## Optional Features

The chat experience works with just `JWT_SECRET` and `OPENROUTER_API_KEY`.
To enable additional features, add the corresponding vars to
`backend/.env`:

| Feature | Env vars |
|---------|----------|
| AI image & video generation (FLUX, SDXL, KlingAI, Vidu) | `RUNWARE_API_KEY` |
| Transactional email (Amazon SES) | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` |
| File uploads & storage (Cloudflare R2) | `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_R2_*` |
| Research mode / deep web search | `TAVILY_API_KEY`, `EXA_API_KEY`, `JINA_API_KEY`, `FIRECRAWL_API_KEY` |
| GitHub sync for generated apps | `GITHUB_APP_ID`, `GITHUB_APP_CLIENT_ID`, `GITHUB_PRIVATE_KEY`, … |
| Vector search (Qdrant) | uncomment the `qdrant` service block in `docker-compose.yml` |

See `backend/.env.example` for the complete list and inline documentation
for every variable.

## Native Setup (without Docker)

If you'd rather run the stack directly on your host machine:

1. **Install dependencies**: Node.js 20+, PostgreSQL 15+, Redis 7+.
2. **Create the database**:
   ```bash
   createdb wantsdb
   ```
3. **Configure `backend/.env`** — the defaults in `backend/.env.example`
   assume `DB_HOST=localhost`, `DB_PORT=5432`, `DB_USER=postgres`,
   `DB_NAME=wantsdb`. Adjust to match your local Postgres.
4. **Install and start the backend**:
   ```bash
   cd backend
   npm install
   npm run start:dev
   ```
5. **In a second terminal, start the frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The native path is more flexible for debugging but requires you to
manage Postgres and Redis yourself.

## Architecture

```
        ┌──────────────┐                ┌──────────────┐
        │  Frontend    │ ──── HTTP ────▶│   Backend    │
        │    :5173     │                │    :3001     │
        │ (Vite/React) │ ◀── WebSocket ─│   (NestJS)   │
        └──────────────┘                └──┬────────┬──┘
                                           │        │
                                  ┌────────┴─┐   ┌──┴───────┐
                                  │ Postgres │   │  Redis   │
                                  │  :5433   │   │  :6379   │
                                  └──────────┘   └──────────┘
```

Container-internal ports differ from the host ports shown above. See
`docker-compose.yml` for the full mapping.

## Running Tests

```bash
# Backend (NestJS)
cd backend && npm test

# Frontend (Vitest)
cd frontend && npm test
```

## Troubleshooting

### Docker permission denied (Linux)
Add yourself to the `docker` group:
```bash
sudo usermod -aG docker $USER && newgrp docker
```

### Postgres port 5433 already in use
You have something else on host port 5433. Either stop it, or change
the mapping in `docker-compose.yml` from `"5433:5432"` to e.g.
`"5434:5432"`.

### Frontend can't reach the backend
- Confirm `VITE_API_URL=http://localhost:3001` in `frontend/.env`.
- Check the backend container is actually running: `docker compose ps`.
- Look at backend logs: `docker compose logs -f backend`.
- Verify `CORS_ORIGIN` in `backend/.env` includes `http://localhost:5173`.

### Backend can't connect to the database
- `docker compose logs postgres` to see Postgres startup errors.
- Under Docker Compose, the backend's `DB_HOST`, `DB_USER`,
  `DB_PASSWORD`, and `DB_NAME` are injected automatically — you do
  not need to set them in `backend/.env`. Stale values in
  `backend/.env` are harmless (Compose overrides them).

### `npm ci` fails locally with "Missing X from lock file"
The lockfiles got out of sync. Run `npm install` (not `npm ci`) to
regenerate them. CI uses `npm ci` so any drift will surface there.

### Hot reload isn't working
Vite watches files mounted into the container. If you cloned the repo
on a network drive or inside WSL with `/mnt/c/...`, file events may
not propagate. Move the clone to a native filesystem.

## What's Next?

- **`CONTRIBUTING.md`** — branching, PRs, code style, commit conventions
- **`docs/architecture.md`** — high-level overview of the codebase
- **`docs/tool-development.md`** — adding new tools to the platform
- **`docs/i18n-guide.md`** — adding or updating translations
- **`CLAUDE.md`** — coding patterns enforced across the repo
