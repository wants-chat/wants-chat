# Pre-built Templates for Fast Deployment

This directory contains pre-built templates with static dependencies for backend, frontend, and mobile apps. When node_modules are pre-installed here, the deployment service will copy them instead of running `npm install`, dramatically speeding up deployment.

## Setup

Run the setup script once to pre-install all dependencies:

```bash
cd /path/to/backend/src/modules/app-builder/templates
chmod +x setup-templates.sh
./setup-templates.sh
```

This will install node_modules in:
- `backend/node_modules/` - Hono + Fluxez SDK + wrangler
- `frontend/node_modules/` - React + Vite + Tailwind
- `mobile/node_modules/` - Expo + React Native + Navigation

## How It Works

1. When deploying an app, the deployment service checks if pre-built templates exist
2. If templates exist, it copies node_modules directly (fast - ~5 seconds)
3. If templates don't exist, it falls back to `npm install` (slow - ~30-60 seconds)

## Updating Templates

When dependencies change in the renderers, update the package.json files here and re-run setup:

```bash
./setup-templates.sh
```

## Notes

- node_modules are **not committed to git** (see .gitignore)
- Each developer/server should run setup-templates.sh once
- Templates are platform-specific (macOS node_modules won't work on Linux)
