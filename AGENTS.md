# Painel do Clima — Instruções do Projeto

## Project Summary
- **Purpose:** Scaffold full stack para um painel de monitoramento de clima: o usuário busca uma cidade e consulta condições climáticas atuais (temperatura, umidade, vento, índice UV e precipitação), previsão por hora e previsão para 7 dias. O frontend nunca consome a Open-Meteo diretamente — o backend (Node.js/Express) é o único responsável por intermediar as chamadas de geocoding e previsão. O repositório também serve de campo de provas para o framework Development Orchestrator (DO), SDD: PRD → TechSpec → Tasks → Execução → Review → QA. Ver `exemplo_requisito.txt` para o requisito de produto.
- **Stack:**
  - **Frontend:** React 19.2, Vite 8, ESLint 9; testes com Vitest 3.2 + React Testing Library + jsdom + @vitest/coverage-v8.
  - **Backend:** Node.js (CommonJS), Express 4.18, dotenv; testes com Jest 29 + Supertest; dev server com nodemon.
- **Architecture:** Duas aplicações independentes (`frontend/` e `backend/`); fluxo de comunicação frontend → backend → APIs Open-Meteo (geocoding + forecast). Endpoint principal previsto: `GET /api/weather?city=` (200 / 400 / 404). Hoje apenas `GET /health` está implementado.
- **Integrations:** Open-Meteo Geocoding (`https://geocoding-api.open-meteo.com/v1/search`) e Open-Meteo Forecast (`https://api.open-meteo.com/v1/forecast`) — sempre via backend.

## Available Skills
**IMPORTANTE: Antes de iniciar qualquer tarefa, leia o arquivo da skill correspondente à tecnologia ou padrão envolvido usando a ferramenta de leitura de arquivos disponível na sua plataforma. As skills contêm convenções, restrições e padrões obrigatórios para este projeto — não prossiga sem lê-las.**

Exemplo: para trabalhar com React, leia o arquivo `.agents/skills/<skill-react>/SKILL.md` antes de qualquer implementação.

| Skill | Caminho | Quando usar |
|-------|---------|-------------|

## Uncovered Skills
| Tecnologia | Observação |
|------------|------------|
| React/JSX + Vite | Nenhuma skill disponível localmente — adicione manualmente ao diretório `.agents/skills/` |
| Vitest + React Testing Library | Nenhuma skill disponível localmente — adicione manualmente ao diretório `.agents/skills/` |
| Node.js + Express | Nenhuma skill disponível localmente — adicione manualmente ao diretório `.agents/skills/` |
| Jest + Supertest | Nenhuma skill disponível localmente — adicione manualmente ao diretório `.agents/skills/` |
| Open-Meteo API (geocoding + forecast) | Integração externa documentada em `exemplo_requisito.txt` — nenhuma skill local |

## Project Conventions
- **Naming:** arquivos JS/JSX em camelCase (`App.jsx`, `index.js`); testes em `*.test.js`/`*.test.jsx` dentro de diretórios `__tests__/`; backend usa CommonJS (`require`/`module.exports`), frontend usa ESM (`"type": "module"`).
- **Directory structure:**
  - `frontend/src/` — componentes e páginas; `frontend/src/__tests__/` — testes do frontend (`setup.js` carrega `@testing-library/jest-dom`); `frontend/public/` — arquivos estáticos.
  - `backend/src/` — código da API, com `index.js` como entry point; `backend/src/__tests__/` — testes do backend; `backend/.env.example` — template de variáveis de ambiente.
- **Output patterns:** testes do frontend gerados em `frontend/src/__tests__/`; testes do backend em `backend/src/__tests__/`; relatórios de cobertura em `frontend/coverage/` e `backend/coverage/`.
- **Testes:** nenhuma task é concluída com teste falhando. Frontend: `cd frontend && npm run test -- run` (cobertura: `npm run test:coverage`); Backend: `cd backend && npm test` (Jest já roda com cobertura).
- **Portas (dev):** frontend Vite em `http://localhost:5173`; backend Express em `http://localhost:3000` (configurável via `PORT` em `backend/.env`).
- **Variáveis de ambiente:** `frontend/.env.local` (`VITE_API_URL`) e `backend/.env` (`PORT`, `NODE_ENV`) — nunca versionados no Git.
- **Restrição de cache (regra de produto em `exemplo_requisito.txt`):** nenhum cache HTTP entre frontend e backend — no backend desabilitar ETags e responder sempre com `Cache-Control: no-store`; no frontend toda chamada `fetch` deve usar `cache: 'no-store'`.
