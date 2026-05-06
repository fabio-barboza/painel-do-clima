# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Painel do Clima** — a full-stack weather monitoring dashboard. React frontend consumes a Node.js/Express backend, which proxies all calls to the Open-Meteo API. The frontend never calls external APIs directly.

## Architecture

Monorepo with two independent packages:

- **`backend/`** — Express API (CommonJS). Entry: `src/index.js`. Exports the `app` instance for testing via Supertest.
- **`frontend/`** — React 19 + Vite (ESM). Entry: `src/main.jsx`.

Communication flow: User → React UI → `GET /api/weather?city=<name>` → Express geocodes via Open-Meteo → fetches weather → returns unified payload.

## Commands

### Backend (`cd backend`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server with nodemon (port 3000) |
| `npm start` | Production server |
| `npm test` | Jest + Supertest with coverage |
| `npm run test:watch` | Jest in watch mode |

### Frontend (`cd frontend`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest in watch mode |
| `npm run test -- --run` | Vitest single run |
| `npm run test:coverage` | Vitest with v8 coverage |

### Running a single test

```bash
# Backend
cd backend && npx jest -t "test name pattern"

# Frontend
cd frontend && npx vitest run -t "test name pattern"
```

## Key Design Decisions

- **No dark/light theme toggle** — out of scope.
- **No code comments** — per project requirements (`exemplo_requisito.txt`).
- **Frontend must never call Open-Meteo directly** — all external API traffic goes through the backend.
- **Design system** is documented in `frontend/DESIGN.md` — Superhuman-inspired: Mysteria Purple (`#1b1938`) hero, Warm Cream (`#e9e5dd`) buttons, Lavender Glow (`#cbb7fb`) accent, Charcoal Ink (`#292827`) text, border-radius limited to 8px/16px only.
- Weather data payload follows Open-Meteo's response format closely — no heavy reshaping.

## Backend API Contract

| Method | Endpoint | Success | Errors |
|--------|----------|---------|--------|
| GET | `/health` | 200 — service status | — |
| GET | `/api/weather?city=<name>` | 200 — weather data | 400 (invalid params), 404 (city not found) |

## Test Configuration

- **Backend**: Jest config in `jest.config.js` — node environment, coverage from `src/**/*.js` excluding `index.js`.
- **Frontend**: Vitest config in `vitest.config.js` — jsdom environment, setup file at `src/__tests__/setup.js` (imports `@testing-library/jest-dom`), v8 coverage provider.

## Environment Variables

- **Backend** (`backend/.env`): `PORT` (default 3000), `NODE_ENV`
- **Frontend** (`frontend/.env.local`): `VITE_API_URL` (default `http://localhost:3000`)

## MCP Servers

Configured in `.mcp.json`: Playwright (browser automation), Context7 (library docs), RabbitMQ.

## Resumo do Projeto
- **Propósito:** Painel full stack de monitoramento climático que consome a API Open-Meteo, com React no frontend e Node.js/Express no backend.
- **Stack:** React 19, Vite 8, Express 4, Jest + Supertest (backend), Vitest + React Testing Library (frontend)
- **Arquitetura:** Monorepo com frontend e backend separados. O backend atua como proxy — o frontend nunca acessa APIs externas diretamente.
- **Integrações:** Open-Meteo Geocoding API, Open-Meteo Forecast API

## Skills Disponíveis
| Skill | Caminho | Quando usar |
|-------|---------|-------------|
| frontend-design | `.claude/skills/frontend-design/SKILL.md` | Ao criar componentes React, páginas, dashboards ou estilizar a UI do painel. Referência ao design system do `frontend/DESIGN.md`. |
| vercel-react-best-practices | `.claude/skills/vercel-react-best-practices/SKILL.md` | Ao escrever, revisar ou refatorar componentes React — otimização de performance, re-renders, bundle size e padrões avançados. |

## Skills Não Cobertas
| Tecnologia | Observação |
|------------|------------|
| Node.js/Express | Nenhuma skill específica disponível localmente |
| Open-Meteo API | Nenhuma skill específica — consultar documentação externa |
| CSS/Tailwind | Nenhuma skill específica — o design system está em `frontend/DESIGN.md` |

## Convenções do Projeto
- **Nomenclatura:** Arquivos de teste seguem `*.test.{js,jsx}` ou `*.spec.{js,jsx}` dentro de `__tests__/`
- **Estrutura de diretórios:** `backend/src/` (CommonJS), `frontend/src/` (ESM), testes em `__tests__/` dentro de cada `src/`
- **Padrão de saída:** Novos endpoints no backend em `backend/src/`, componentes React em `frontend/src/`, arquivos de teste junto ao código que testam em `__tests__/`
- **Design:** Seguir rigorosamente o design system em `frontend/DESIGN.md` — Superhuman-inspired com cores específicas e tipografia própria
