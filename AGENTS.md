# AGENTS.md

This file provides guidance to OpenCode (opencode.ai) when working with code in this repository.

## Project Overview

**Painel do Clima** is a full-stack scaffold for weather monitoring, split into two independent npm packages:

- `frontend/` — React 19 + Vite (ES modules, `"type": "module"`)
- `backend/` — Node.js + Express 4 (CommonJS)

The application code is intentionally minimal. The repo exists as a testbed for the [Development Orchestrator (DO)](https://github.com/fabio-barboza/development-orchestrator) SDD workflow (PRD → TechSpec → Tasks → Execução → Review → QA), so every change should be traceable to a spec artifact, and no task is considered complete with failing tests.

There is **no root `package.json`** — every command runs from inside `frontend/` or `backend/`.

## Commands

### Prerequisites

- Node.js **20.19+ or 22.12+** (required by Vite 8; the README's "Node 18" is outdated)
- npm

### Install

```bash
cd frontend && npm install
cd ../backend && npm install
```

### Run (development)

```bash
cd frontend && npm run dev   # http://localhost:5173
cd backend  && npm run dev   # http://localhost:3000 (nodemon)
```

Ports: frontend dev = **5173**, backend dev = **3000** (backend reads `PORT` from `backend/.env`, default 3000; see `backend/.env.example`).

### Test

```bash
# Backend — runs once, with coverage (Jest + Supertest)
cd backend && npm test

# Frontend — runs once (Vitest + Testing Library + jsdom)
cd frontend && npm test -- run

# Frontend watch mode
cd frontend && npm test

# Coverage reports
cd frontend && npm run test:coverage   # -> frontend/coverage/
cd backend  && npm test                # -> backend/coverage/
```

### Build (frontend only — backend has no build step)

```bash
cd frontend && npm run build   # -> dist/
cd frontend && npm run preview
```

### Lint

```bash
cd frontend && npm run lint    # ESLint (flat config, react-hooks + react-refresh)
```

⚠️ **Known issue:** `npm run lint` currently fails with 4 errors in `frontend/src/__tests__/App.test.jsx` — the ESLint config does not declare Vitest globals (`describe`, `test`, `expect`) for test files, and `screen` is imported but unused. Fixing the lint config is out of scope for a typical task unless requested.

## Architecture

### Backend (`backend/`)

- Entry point: `backend/src/index.js` (CommonJS). It creates the Express app, mounts middleware (`express.json()`), defines routes, starts the server, and exports `app` via `module.exports` so tests can use Supertest without binding a port twice.
- **Keep exporting `app`** — the test suite (`backend/src/__tests__/api.test.js`) relies on it.
- Routes are registered directly on `app`; unknown routes fall through to Express's default 404 (this behavior is covered by tests).
- API endpoint: `GET /health` → `{ status, message, timestamp, uptime }`.

### Frontend (`frontend/`)

- Entry point: `frontend/src/main.jsx` → `createRoot(...).render(<StrictMode><App /></StrictMode>)`.
- `frontend/src/App.jsx` is an empty shell to be implemented per the product spec.
- Vite config: `frontend/vite.config.js`; test config: `frontend/vitest.config.js` (jsdom, `globals: true`, setup file `frontend/src/__tests__/setup.js`).

### Architectural rules (from `exemplo_requisito.txt` — must be respected)

These constraints bind all future work, even though the code that implements them does not exist yet:

1. **The frontend never calls Open-Meteo (or any external service) directly.** All external communication goes through the backend.
2. The backend will proxy: geocoding via `https://geocoding-api.open-meteo.com/v1/search`, forecast via `https://api.open-meteo.com/v1/forecast`, exposed as `GET /api/weather?city=` (200 / 400 / 404).
3. **No HTTP caching between frontend and backend:** disable ETags, return `Cache-Control: no-store` on every backend response, and use `cache: 'no-store'` explicitly in every frontend `fetch`.
4. CORS must be configured explicitly in the backend (allowed origins, methods, headers).
5. Out of scope for now: dark/light theme, city autocomplete, code comments, advanced payload reshaping.

## Conventions

- **Module systems are different per package — do not mix them:** backend is CommonJS (`require`/`module.exports`), frontend is ESM (`import`/`export`).
- Test files live in `__tests__/` directories next to the code they test, named `*.test.js` / `*.test.jsx` (backend: `**/__tests__/**/*.test.js` per `jest.config.js`; frontend: `**/*.{test,spec}.{js,jsx,...}` per `vitest.config.js`).
- Run the test suites in **both** packages before committing — the DO workflow forbids finishing work with failing tests.
- Frontend code style: no semicolons, single quotes (Vite/ESLint defaults); ESLint rule `no-unused-vars` ignores `^[A-Z_]` names.
- Env files (`.env`, `.env.local`) are gitignored; keep `backend/.env.example` updated when adding variables.
- This project's documentation and product language is Portuguese (pt-BR).

## Known quirks

- `backend/jest.config.js` excludes `src/index.js` from `collectCoverageFrom`, so coverage currently reports **0 files / 0%** (the only source file is excluded). The `forceExit: true` / "Force exiting Jest" warning in test output is expected (open handles from the app export).
- `npm run lint` fails (see ⚠️ above).
