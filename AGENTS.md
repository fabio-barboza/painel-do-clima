# AGENTS.md

## Estrutura
- Dois pacotes npm independentes, **sem workspace** (não há `package.json` na raiz): `frontend/` (ESM — `"type": "module"`, React 19 + Vite 8 + Vitest) e `backend/` (CommonJS — `require`/`module.exports`, Express + Jest + Supertest).
- Todos os comandos rodam dentro de cada diretório; `npm install` é separado para cada um.
- Não misturar sistemas de módulos: frontend usa `import`/`export`, backend usa `require`.

## Comandos
- Frontend: `npm test` é **modo watch**; para rodar uma vez use `npm test -- run`. Cobertura: `npm run test:coverage`.
- Backend: `npm test` roda Jest uma única vez já com cobertura (`jest --coverage`).
- Dev servers: frontend em `:5173` (`npm run dev`), backend em `:3000` (`npm run dev`, nodemon).
- Lint existe só no frontend (`npm run lint`, ESLint 9 flat config). O backend não tem script de lint nem typecheck.

## Testes — particularidades
- O Jest do backend só detecta `**/__tests__/**/*.test.js` (`testMatch` em `backend/jest.config.js`). Arquivos `*.spec.js` ou fora de `__tests__/` **não rodam**, mesmo que a README afirme o contrário.
- O Vitest do frontend aceita `*.test.*` e `*.spec.*` (js/jsx/ts).
- Os testes do backend importam `src/index.js`, que chama `app.listen(PORT)`: não rode a suite do backend com o dev server já ocupando a porta 3000 (EADDRINUSE).
- A cobertura do backend exclui `src/index.js` (`collectCoverageFrom`).

## Ambiente
- Frontend: Vite lê `frontend/.env.local`; só variáveis com prefixo `VITE_` chegam ao código (ex.: `VITE_API_URL` para a URL da API).
- Backend: lê `backend/.env` via dotenv (modelo em `backend/.env.example`); `PORT` default 3000 se ausente.
- Nenhum `.env` é versionado (`.gitignore`).

## DO (Development Orchestrator)
- O repositório é campo de provas do framework DO (SDD): PRD → TechSpec → Tasks → Execução → Review → QA. Fluxo e comandos das fases na `README.md`.
- Skills `do-*` em `.agents/skills/`, fixadas na v1.1.0 via `skills-lock.json`.
- PRDs vão sempre em `prds/prd-[feature-slug]/` — o prefixo `prd-` é obrigatório (regra do `do-create-prd`).
- Contexto local do framework em `.do/context.md` (local por desenvolvedor, escrito por `do-setup`).
- MCPs declarados no `opencode.json`: `playwright` (QA E2E), `mcp-api-test` (testes HTTP da API), `context7` (documentação de bibliotecas).
