# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project purpose

Painel do Clima is a deliberately minimal full stack scaffold (a weather dashboard) used as a proving ground for the [Development Orchestrator](https://github.com/fabio-barboza/development-orchestrator) (DO), a spec-driven development framework. Application code is nearly empty on purpose: `frontend/src/App.jsx` renders nothing and the backend only exposes `GET /health`.

Work follows the chain PRD → TechSpec → Tasks → Execution → Review → QA, driven by the `do-*` skills. Two framework rules shape the repo:

- A task is never complete while a test is failing.
- A task stays open until its review artifact exists.

## Commands

`frontend/` and `backend/` are independent npm packages with no root `package.json`, so run commands from inside each one and install dependencies in both.

Backend (Express on port 3000, Jest + Supertest):

```bash
npm run dev                                  # nodemon
npm test                                     # jest --coverage
npm run test:watch
npx jest src/__tests__/api.test.js           # single file
npx jest -t 'should return health status'    # single test by name
```

Frontend (Vite on port 5173, Vitest + React Testing Library):

```bash
npm run dev
npm run build
npm run lint                                 # ESLint, frontend only; backend has no linter
npm test                                     # vitest in watch mode; never exits on its own
npm test -- run                              # single run, use this for non-interactive checks
npm run test:coverage
npx vitest run src/__tests__/App.test.jsx    # single file
npx vitest run -t 'renders app component'    # single test by name
```

## Architecture

- **Backend** is CommonJS (`require`). `backend/src/index.js` both builds the Express app and calls `app.listen()` at import time, then exports `app`.
- **Frontend** is ESM with React 19 and Vite 8. Vitest has its own `vitest.config.js`, separate from `vite.config.js`, with `globals: true`, so `describe`/`test`/`expect` need no import.
- Tests live in `src/__tests__/` in both packages. Frontend tests pick up `src/__tests__/setup.js`, which registers the jest-dom matchers.
- The two packages are not wired together yet: no CORS setup, no Vite proxy, and no frontend code reads `VITE_API_URL`.

## Gotchas

- Importing `backend/src/index.js` starts a real server, so backend tests bind `PORT` (default 3000) and fail with `EADDRINUSE` if a dev server is running. `forceExit: true` in `jest.config.js` exists to get past that open handle.
- `backend/jest.config.js` excludes `src/index.js` from coverage, so route code placed there is not counted. Coverage reflects only code in other modules.

## Intended product requirements

The original requirement is no longer in the working tree. Read it with `git show ecbfc6c:exemplo_requisito.txt`. None of this is implemented yet, and a PRD or TechSpec overrides it where they differ. Its architectural constraints:

- The frontend never calls Open-Meteo directly. The backend mediates all external calls, through `GET /api/weather?city=` (200, 400 invalid parameters, 404 city not found), resolving the city via the geocoding API and then querying the forecast API.
- No HTTP caching between frontend and backend: ETags disabled and `Cache-Control: no-store` on every backend response, and `cache: 'no-store'` on every frontend `fetch`.
- CORS is explicitly configured (origins, methods, headers).
- The frontend/backend communication strategy (Vite proxy or absolute URL with CORS) and the ports for dev and production must be documented and consistent.
- Out of scope: light/dark theme, city autocomplete, code comments, advanced remodeling of the Open-Meteo payload.
