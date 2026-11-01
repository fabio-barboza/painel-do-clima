# Tarefa 1.0: Fundação do backend: config, middlewares (cache, CORS, log), externalError e ajustes em index.js

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Prepara a base Express do backend antes da rota de dados: configuração de ambiente, middleware de ausência de cache (mandato do PRD), CORS manual configurável, log de acesso, classe de erro para falhas externas e os ajustes de `backend/src/index.js` (ETag desabilitado, guard de `app.listen`, 404 JSON para rotas desconhecidas, handler de erros). Não adiciona dependências novas.

## Requisitos atendidos (FR)

- **FR-07** — `Cache-Control: no-store` em toda resposta + ETags desabilitadas.
- **FR-08** — CORS explícito (origens, métodos, headers); em dev pode aceitar qualquer origem, documentado.
- Fundação para **FR-01…FR-06** (a rota de dados chega na task 3, sobre essa base).
- PRD (Restrições) — zero dependências novas no backend; Node ≥ 18 (`fetch` global, `AbortSignal.timeout`).

## Subtarefas

- [x] 1.1 Criar `backend/src/config.js`: env `PORT` (default 3000), `NODE_ENV`, `CORS_ORIGINS` (separado por vírgula; `*` em dev, documentado), URLs das 3 APIs externas (geocoding, forecast, reverse geocoding) e timeout global de 8 s.
- [x] 1.2 Criar `backend/src/middleware/cache.js`: aplica `Cache-Control: no-store` em toda resposta (FR-07).
- [x] 1.3 Criar `backend/src/middleware/cors.js`: CORS manual — origens/métodos (`GET, OPTIONS`)/headers por env, eco da origem permitida, preflight `OPTIONS` → `204` (FR-08).
- [x] 1.4 Criar `backend/src/middleware/logger.js`: log de acesso (método, rota, status, duração ms) via `console`; erros com detalhes (sem dados pessoais).
- [x] 1.5 Criar `backend/src/services/externalError.js`: `class ExternalError extends Error { status?: number }` (timeout/AbortError → `status` undefined).
- [x] 1.6 Modificar `backend/src/index.js`: `app.set('etag', false)`; montar middlewares (cache, CORS, logger); 404 JSON `{ error }` para rotas desconhecidas; handler de erros (ExternalError → 502, demais → 500); `app.listen` guardado por `require.main === module` (evita EADDRINUSE na suite Jest — particularidade do `AGENTS.md`); manter `module.exports = app`.
- [x] 1.7 Atualizar `backend/.env.example`: adicionar `PORT`, `CORS_ORIGINS` e as URLs das APIs externas com comentários mínimos (sem comentários no código-fonte em si).
- [x] 1.8 Testes (unidade + integração + fumaça).

## Detalhes de Implementação

Ver `techspec.md`: seção "Arquitetura do Sistema → Backend" (tabela de módulos), "Pontos de Integração" (timeout 8 s, CORS `GET, OPTIONS`), "Decisões Principais" (item 8 — guard de `app.listen`) e "Monitoramento e Observabilidade" (níveis INFO/WARN/ERROR do logger). Assinaturas exatas em "Interfaces Principais → Backend".

## Critérios de Sucesso

- Toda resposta do app (200, 400, 404, 502) carrega `Cache-Control: no-store` e **nunca** o header `ETag` (FR-07).
- Preflight `OPTIONS` em rotas `/api/*` responde `204` com `Access-Control-Allow-Origin` (origem ecoada; `*` em dev documentado), `Allow-Methods` e `Allow-Headers` (FR-08).
- Rota desconhecida retorna 404 em JSON `{ "error": ... }` (o `backend/src/__tests__/api.test.js` existente continua verde).
- `ExternalError` lançada em rota responde 502 em JSON `{ "error": ... }`; erro inesperado → 500 JSON.
- `npm test` no backend roda a suite **sem ocupar a porta 3000** (guard de listen) e a cobertura continua excluindo `src/index.js`.
- `backend/package.json` sem dependências novas.

## Testes da Tarefa

- [x] Testes de unidade (`backend/src/__tests__/middlewares.test.js`): middleware cache define o header; CORS (preflight 204, eco de origem permitida, origem não permitida); logger (escreve método/rota/status/duração, não vaza dados pessoais); `ExternalError` (instância de `Error`, `status` opcional).
- [x] Testes de integração (Supertest contra o `app` real): `GET /health` → 200 + `Cache-Control: no-store` + ausência de `ETag`; `OPTIONS /api/qualquer` → 204 com allow-*; rota desconhecida → 404 JSON; `api.test.js` existente continua passando.
- [x] Teste de fumaça do fluxo principal: com o backend no ar (`node src/index.js`), `GET http://localhost:3000/health` → `200 { status: "OK" }` com header `Cache-Control: no-store` (fluxo de sucesso principal do que esta task entrega).

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Criar: `backend/src/config.js`, `backend/src/middleware/cache.js`, `backend/src/middleware/cors.js`, `backend/src/middleware/logger.js`, `backend/src/services/externalError.js`, `backend/src/__tests__/middlewares.test.js`.
- Modificar: `backend/src/index.js`, `backend/.env.example`.
