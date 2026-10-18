# Painel do Clima

Aplicação full stack de monitoramento climático: o usuário busca uma cidade (ou usa a geolocalização) e vê condições atuais, previsão por hora (24h) e previsão de 7 dias em um único painel. O frontend (React + Vite) **nunca** consome as APIs Open-Meteo diretamente — todo contato com serviços externos passa pelo backend (Node.js + Express), que é o único responsável por geocoding e previsão.

O repositório também serve de campo de provas para um fluxo de desenvolvimento orientado a especificação (ver [Objetivo](#-objetivo)).

## 📋 Índice

- [Objetivo](#-objetivo)
- [Stack Tecnológica](#-stack-tecnologica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Inicialização](#-inicializacao)
- [Como Rodar](#-como-rodar)
- [Portas](#-portas)
- [Comunicação Frontend ↔ Backend](#-comunicação-frontend--backend)
- [CORS](#-cors)
- [Regra de Zero Cache HTTP](#-regra-de-zero-cache-http)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Testes](#-testes)
- [Scripts Disponíveis](#-scripts-disponiveis)
- [Endpoints da API](#-endpoints-da-api)
- [Notas](#-notas)

## 🎯 Objetivo

O objetivo deste repositório é **usar e validar o framework [Development Orchestrator](https://github.com/fabio-barboza/development-orchestrator) (DO)** sobre uma base full stack real, do zero até a entrega com QA.

O DO é um framework de **SDD (Spec-Driven Development / Desenvolvimento Orientado a Especificação)**: nada é implementado antes de estar documentado. Em vez de partir direto para o código, o trabalho percorre uma cadeia de artefatos rastreáveis que elimina ambiguidade e reduz retrabalho:

```
PRD → TechSpec → Tasks → Execução → Review → QA
```

- **PRD** — o *que* será construído e por quê (requisitos de produto).
- **TechSpec** — *como* será construído (decisões técnicas, contratos, arquitetura).
- **Tasks** — a quebra da TechSpec em unidades pequenas e executáveis.
- **Execução** — cada task é implementada individualmente, sempre acompanhada de testes.
- **Review** — a implementação é validada contra a especificação que a originou.
- **QA** — testes end-to-end automatizados via MCP (Model Context Protocol), com ciclo de bugfix.

Cada etapa gera artefatos versionados, então é sempre possível rastrear uma linha de código até a task, a TechSpec e o requisito de produto que a justificam. Os artefatos desta feature ficam em `prds/prd-painel-monitoramento-clima/`.

### Fluxo do DO neste projeto

| Fase | Comandos principais |
|------|---------------------|
| 1. Planejamento | `do-setup`, `do-create-prd`, `do-create-techspec`, `do-create-tasks` |
| 2. Execução | `do-execute-task`, `do-execute-all-tasks` (subagentes isolados, em sequência) |
| 3. Code Review | `do-execute-review`, `do-execute-review-fix` |
| 4. QA & Bugfix | `do-execute-qa`, `do-execute-qa-bugfix` |
| Acompanhamento | `do-status` (progresso e ponto de retomada) |

Duas regras do framework valem destaque, porque moldam como este scaffold foi montado:

- **Uma task nunca é concluída com teste falhando.** Por isso frontend e backend já vêm com stack de testes e cobertura configuradas desde o commit inicial.
- **Sem artefato de review, a task continua aberta.** A validação faz parte da entrega, não é etapa opcional.

Consulte a documentação do [Development Orchestrator](https://github.com/fabio-barboza/development-orchestrator) para instalação dos comandos e detalhes de cada fase.

## 🛠 Stack Tecnológica

### Frontend (`frontend/`)
- **React 19** - Biblioteca UI
- **Vite** - Build tool / dev server
- **Recharts** - Gráfico de 24h
- **React Testing Library + Vitest** - Testes

### Backend (`backend/`)
- **Node.js** (18+, CommonJS) - Runtime
- **Express 4** - Framework web
- **Jest + Supertest** - Testes

### E2E (`e2e/`)
- **Playwright** - Testes end-to-end (suite determinística com mocks + smoke real)

## 📁 Estrutura do Projeto

```
painel-do-clima/
├── frontend/           # Aplicação React (porta 5173)
│   ├── src/           # Código fonte
│   │   ├── __tests__/ # Testes (Vitest + React Testing Library)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/  # weatherApi.js (fetch com cache: 'no-store')
│   │   └── utils/
│   ├── public/        # Arquivos públicos
│   ├── .env.local     # VITE_API_URL (opcional; fora do Git)
│   ├── vitest.config.js
│   └── package.json
├── backend/            # API Node.js (porta 3000)
│   ├── src/           # Código fonte
│   │   ├── __tests__/ # Testes (Jest + Supertest)
│   │   ├── config/    # env.js (getEnv)
│   │   ├── middleware/ # noCache, errorHandler
│   │   ├── routes/    # weather.js
│   │   ├── services/  # openMeteo.js
│   │   ├── app.js     # Fábrica do app Express
│   │   └── index.js   # Bootstrap (listen)
│   ├── .env.example   # Template de variáveis (sem comentários)
│   ├── .env           # Local, fora do Git
│   ├── jest.config.js
│   └── package.json
├── e2e/                # Testes E2E (Playwright)
│   ├── tests/         # Specs
│   ├── setup/         # Mock server, backend e frontend do ambiente E2E
│   ├── playwright.config.js
│   └── package.json
├── prds/               # Artefatos do DO (PRD, TechSpec, tasks, reviews, QA)
├── README.md
└── .gitignore
```

## 🚀 Inicialização

### Pré-requisitos
- Node.js (v18 ou superior — o backend usa `fetch` global)
- npm

### Passo a passo

1. **Clonar o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd painel-do-clima
   ```

2. **Instalar dependências do Frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Instalar dependências do Backend**
   ```bash
   cd ../backend
   npm install
   ```

4. **Instalar dependências do E2E e os browsers do Playwright** (apenas para rodar a suite E2E)
   ```bash
   cd ../e2e
   npm install
   npx playwright install chromium
   ```

5. **Configurar variáveis de ambiente** (opcional — o app roda sem nenhum arquivo `.env`)

   Frontend — **não é necessário**: o código usa `http://localhost:3000` como default quando `VITE_API_URL` não está definido. Para apontar para outro backend, crie `frontend/.env.local` (fora do Git):
   ```env
   VITE_API_URL=http://localhost:3000
   ```

   Backend — todos os valores têm default. Para sobrescrever, copie o template:
   ```bash
   cd backend
   cp .env.example .env
   ```
   O template (`.env.example`) é deliberadamente sem comentários; as explicações de cada variável estão na seção [Variáveis de Ambiente](#-variáveis-de-ambiente).

6. **Verificar instalação**

   Execute os testes para confirmar que tudo está funcionando:
   ```bash
   # Backend
   cd backend
   npm test

   # Frontend
   cd ../frontend
   npm run test -- run
   ```

## ▶️ Como Rodar

### Desenvolvimento

Rode os dois processos (o frontend precisa do backend no ar para responder buscas):

**Backend** (`http://localhost:3000`):
```bash
cd backend
npm run dev
```

**Frontend** (`http://localhost:5173`):
```bash
cd frontend
npm run dev
```

Acesse `http://localhost:5173` — a aplicação cai direto no painel principal (rota `/`).

**E2E** (suite determinística — sobe sozinha os servidores mock/backend/frontend):
```bash
cd e2e
npm test
```

### Produção

**Backend** (porta `3000`):
```bash
cd backend
npm start
```

**Frontend** (porta `5173`):
```bash
cd frontend
npm run build
npm run preview -- --port 5173
```

> Em um deploy real, o build estático (`dist/`) pode ser servido por qualquer servidor HTTP na porta `5173` e o backend roda atrás de `npm start` na porta `3000` (configurável via `PORT`). As portas de produção são as mesmas de desenvolvimento — ver [Portas](#-portas).

## 🚦 Portas

| Ambiente | Serviço | Porta |
|----------|---------|-------|
| Desenvolvimento | Frontend (Vite dev) | `5173` |
| Desenvolvimento | Backend (Express) | `3000` |
| Produção | Frontend | `5173` |
| Produção | Backend (Express) | `3000` |

As portas `5173` (frontend) e `3000` (backend) valem para **desenvolvimento e produção**, por decisão de produto (PRD). A porta do backend pode ser sobrescrita com `PORT` em `backend/.env`; a porta do Vite de desenvolvimento pode ser sobrescrita com `--port`, mas o padrão documentado é `5173`.

> Nota: a suite E2E sobe o próprio backend (porta `3100`) e o servidor mock (porta `9100`) para não interferir em um desenvolvimento em andamento, e usa o frontend na porta `5173` — reutilizando um dev server compatível que já estiver no ar ou subindo o próprio. Se a porta `5173` estiver ocupada por um dev server que não aponte para o backend da suite, defina `E2E_FRONTEND_PORT` (ex.: `E2E_FRONTEND_PORT=5199 npm test`); `E2E_BACKEND_PORT` e `E2E_MOCK_PORT` também são ajustáveis. Nenhum desses ajustes altera as portas documentadas acima.

## 🌐 Comunicação Frontend ↔ Backend

**Estratégia única (decision D1 da TechSpec): URL absoluta + CORS explícito no backend — sem proxy no Vite.**

- O frontend chama o backend sempre pela **URL absoluta** definida em `VITE_API_URL`, com fallback para `http://localhost:3000` quando a variável não está definida:
  - **Dev:** funciona sem configuração (o default `http://localhost:3000` já aponta para o backend local); para outro endereço, defina `VITE_API_URL` em `frontend/.env.local`.
  - **Produção:** `VITE_API_URL` aponta para a URL absoluta do backend no ambiente de build.
- O backend habilita **CORS explícito** (ver [CORS](#-cors)).
- **Não há proxy no Vite** (`vite.config.js` não configura `server.proxy`). A mesma estratégia vale nos dois ambientes, o que mantém o comportamento de rede idêntico entre dev e produção e permite validar o fluxo exato que o usuário final verá.
- O frontend **nunca** chama as APIs Open-Meteo diretamente: todo o tráfego externo é intermediado pelo backend (`GET /api/weather` → geocoding + forecast da Open-Meteo).

Fluxo:

```
Frontend (5173)  ── GET {VITE_API_URL}/api/weather?city=... ──>  Backend (3000)
                                                                      │
                                              GET {GEOCODING_BASE_URL}/v1/search
                                              GET {FORECAST_BASE_URL}/v1/forecast
                                                                      │
Frontend  <──── 200 { location, forecast } (Cache-Control: no-store) ─┘
```

## 🔓 CORS

O backend define CORS explicitamente em `backend/src/app.js`:

- **Desenvolvimento** (`NODE_ENV=development`): aceita **qualquer origem** (`Access-Control-Allow-Origin: *`). Isso é deliberado para o fluxo local e fica documentado aqui, conforme o PRD.
- **Demais ambientes** (ex.: `production`): allow-list via variável `CORS_ORIGINS` (origens separadas por vírgula). Origens fora da lista não recebem o header de permissão.
- Métodos permitidos: `GET`. Headers autorizados: `Content-Type`, `Accept`.

## 🚫 Regra de Zero Cache HTTP

Nenhuma resposta entre frontend e backend pode ser cacheada (requisito do PRD). A regra é imposta em três frentes:

1. **Backend — ETags desabilitadas:** `app.disable('etag')` na fábrica do app (`backend/src/app.js`).
2. **Backend — `Cache-Control: no-store`** em **todas** as respostas (inclusive erros), via middleware `backend/src/middleware/noCache.js`.
3. **Frontend — `cache: 'no-store'`** em toda chamada `fetch` (`frontend/src/services/weatherApi.js`).

Os headers podem ser conferidos no navegador (DevTools → Network) e são validados automaticamente pelos testes do backend (`noCache.test.js`) e pela spec E2E `no-cache-headers.spec.js`.

## 🔧 Variáveis de Ambiente

### Frontend (`frontend/.env.local` — opcional; fora do Git)

| Variável | Descrição | Default |
|----------|-----------|---------|
| `VITE_API_URL` | URL absoluta do backend usada em todo `fetch` do frontend | `http://localhost:3000` (definido no código, em `frontend/src/services/weatherApi.js`) |

### Backend (`backend/.env` — fora do Git; template em `backend/.env.example`)

O arquivo `backend/.env.example` contém **exatamente** as variáveis lidas por `getEnv()` em `backend/src/config/env.js` (consistência verificada pelo teste `backend/src/__tests__/envExample.test.js`).

| Variável | Descrição | Default |
|----------|-----------|---------|
| `PORT` | Porta HTTP do backend | `3000` |
| `NODE_ENV` | Ambiente (`development` usa CORS `*`; demais ambientes usam `CORS_ORIGINS`) | `development` |
| `CORS_ORIGINS` | Allow-list de origens (separada por vírgula), usada fora de desenvolvimento. O valor no template (`https://exemplo.com`) é placeholder — substitua pela origem real do seu frontend em produção | vazio |
| `GEOCODING_BASE_URL` | Base URL da API de geocoding Open-Meteo | `https://geocoding-api.open-meteo.com` |
| `FORECAST_BASE_URL` | Base URL da API de forecast Open-Meteo | `https://api.open-meteo.com` |
| `EXTERNAL_TIMEOUT_MS` | Timeout (ms) das chamadas externas via `AbortController` | `10000` |

> `GEOCODING_BASE_URL`/`FORECAST_BASE_URL` existem para permitir a suite E2E determinística, que aponta o backend para um servidor mock — sem alterar código.

## 🧪 Testes

### Backend — Jest + Supertest

```bash
cd backend
npm test              # roda a suite completa com cobertura (backend/coverage/)
npm run test:watch    # modo watch
```

Cobre: serviço Open-Meteo (com `fetch` mockado), rota `/api/weather` (200/400/404/500), middleware no-cache (headers) e integração ponta a ponta do app com fixtures.

### Frontend — Vitest + React Testing Library

```bash
cd frontend
npm run test -- run   # roda uma vez
npm test              # modo watch
npm run test:coverage # com cobertura (frontend/coverage/)
```

Cobre: utilitários (`weatherCode`), cliente de API (`VITE_API_URL` + `cache: 'no-store'`), hook `useWeather` (estados, guarda de resposta obsoleta, geolocalização) e todos os componentes.

### E2E — Playwright

```bash
cd e2e
npm test              # suite determinística (APIs externas mockadas)
RUN_REAL_E2E=1 npm test   # smoke real contra as APIs Open-Meteo de verdade
```

- **Suite determinística (padrão):** o global setup sobe um servidor HTTP mock das APIs Open-Meteo, o backend apontando para o mock e o frontend (Vite). Cobre: carga inicial, busca por cidade, cidade não encontrada, geolocalização (concedida e negada), retry após 500 e headers no-cache.
- **Smoke real (`RUN_REAL_E2E=1`):** ignora a suite mockada e busca uma cidade real (Curitiba) nas APIs Open-Meteo de verdade, validando o caminho completo sem mocks. Requer rede.

## 📦 Scripts Disponíveis

### Frontend (`frontend/`)
| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia dev server (porta 5173) |
| `npm run build` | Cria build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa ESLint |
| `npm run test -- run` | Roda testes uma vez |
| `npm run test:coverage` | Testes com cobertura |

### Backend (`backend/`)
| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia servidor de produção (porta 3000) |
| `npm run dev` | Inicia servidor em desenvolvimento (nodemon) |
| `npm test` | Roda testes com cobertura |
| `npm run test:watch` | Testes em modo watch |

### E2E (`e2e/`)
| Script | Descrição |
|--------|-----------|
| `npm test` | Suite determinística (mocks) |
| `RUN_REAL_E2E=1 npm test` | Smoke real (APIs Open-Meteo) |
| `npm run test:headed` | Suite com navegador visível |

## 🔗 Endpoints da API

| Método | Endpoint | Descrição | Respostas |
|--------|----------|-----------|-----------|
| GET | `/health` | Health check do serviço | 200 |
| GET | `/api/weather?city=<nome>` | Busca por cidade (geocoding + forecast) | 200 / 400 / 404 / 500 |
| GET | `/api/weather?lat=<n>&lon=<n>` | Busca por coordenadas (fluxo de geolocalização) | 200 / 400 / 500 |

Todas as respostas (inclusive erros) trazem `Cache-Control: no-store` e não incluem `ETag`.

## 📝 Notas

- Arquivos de teste seguem a convenção `*.test.{js,jsx}` (unitários) em `__tests__/` e `*.spec.js` (E2E) em `e2e/tests/`.
- **Variáveis de ambiente nunca são versionadas no Git**: `frontend/.env.local` e `backend/.env` estão no `.gitignore`; apenas o template `backend/.env.example` (sem comentários) entra no repositório.
- O frontend usa ESM (`"type": "module"`); o backend usa CommonJS.
- Execute os testes antes de fazer commits para garantir que nada quebrou — uma task nunca é concluída com teste falhando.
