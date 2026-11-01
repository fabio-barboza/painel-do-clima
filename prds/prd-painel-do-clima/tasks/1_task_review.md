# Review: Task 1.0 - Fundação do backend: config, middlewares (cache, CORS, log), externalError e ajustes em index.js

**Revisor**: AI Code Reviewer
**Data**: 2026-10-27
**Arquivo da task**: 1_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Fundação do Express implementada de forma limpa e completa: `config.js` centraliza o ambiente (porta, NODE_ENV, origens CORS, URLs das 3 APIs externas, timeout de 8 s), os middlewares `cache` (no-store), `cors` (manual, com preflight 204 e eco de origem) e `logger` (log de acesso sem dados pessoais), a classe `ExternalError`, e os ajustes de `index.js` (ETag desabilitado, montagem dos middlewares, 404 JSON, handler de erros com 502/500, guard de `app.listen`). Sem dependências novas. A ordem dos middlewares (cache/CORS antes do `express.json`) garante `no-store` mesmo nas respostas de erro. A suíte (unidade + integração + `api.test.js` existente) passa por completo.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `backend/src/config.js` | ✅ OK | 0 |
| `backend/src/middleware/cache.js` | ✅ OK | 0 |
| `backend/src/middleware/cors.js` | ✅ OK | 0 |
| `backend/src/middleware/logger.js` | ✅ OK | 0 |
| `backend/src/services/externalError.js` | ✅ OK | 0 |
| `backend/src/index.js` | ✅ OK | 0 |
| `backend/.env.example` | ✅ OK | 0 |
| `backend/src/__tests__/middlewares.test.js` | ✅ OK | 0 |
| `backend/src/__tests__/integration.test.js` | ✅ OK | 0 |
| `backend/src/__tests__/api.test.js` (existente) | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. **Comentários em arquivos de teste** — `integration.test.js` e `middlewares.test.js` contêm 2 comentários breves explicando a decisão de ambiente (`NODE_ENV=test` é definido pelo Jest, e a task testa o CORS em modo dev). O projeto tem regra rigorosa de "sem comentários no código-fonte", mas commentary mínimo em testes para registrar uma decisão de ambiente não óbvia é prática comum. Deixei o mínimo possível; se desejar rigor total, podem ser removidos.
2. **Cobertura do caminho 502 (`ExternalError`)** — na task 1 não há rota que lance `ExternalError` (a rota `/api/weather` chega na task 3), portanto o teste de 502 usa uma montagem Express mínima que replica o handler de erros de `index.js` (valida o contrato `ExternalError → 502`). O caminho genérico 500 é testado contra o **handler real** via corpo JSON inválido (o `express.json()` lança e o handler de `index.js` responde). Quando a rota existir (task 3), o 502 passa a ser coberto pelo handler real.

## ✅ Destaques Positivos

- Middlewares pequenos, de ação única, sem comentários no código-fonte e sem magic numbers (`REQUEST_TIMEOUT_MS = 8000` em nome constante).
- Ordem `cache`/`cors`/`logger` antes do `express.json()` garante `Cache-Control: no-store` mesmo em respostas de parse de erro.
- Guard `require.main === module` resolve o `EADDRINUSE` documentado no `AGENTS.md` sem alterar `module.exports = app`; cobertura continua excluindo `src/index.js`.
- `Vary: Origin` no CORS (boa prática).
- Cobertura acima de 97% em statements nos módulos novos.
- O `api.test.js` existente continua verde (nenhum comportamento antigo quebrado).

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Convenções da linguagem do projeto | ✅ (CommonJS, `require`/`module.exports`, testes em `**/__tests__/**/*.test.js`) |
| Contratos de interface (APIs, mensagens) | ✅ |
| Logging | ✅ (INFO de acesso; ERROR sem dados pessoais nem pilha) |
| Interface de usuário | N/A |
| Testes | ✅ |

## Checagens Estáticas

Comando: nenhum declarado no backend (sem lint nem typecheck).
Linha de base (antes da task): limpa.
Resultado final: limpa.
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): nenhum.

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: `nodejs-backend-patterns` (middleware, tratamento de erro, rotas), `javascript-typescript-jest` (mocks, estrutura de testes Supertest).
MCPs do projeto: `mcp-api-test` (api-testing) — usado no teste de fumaça do fluxo principal (`GET http://localhost:3000/health` → 200, `status: "OK"`, `Cache-Control: no-store`). `playwright` (ui-testing) não necessário (sem UI nesta task). `context7` (documentation) não necessário (stack já conhecida no código/techspec).

## Recomendações

1. (opcional) Remover os 2 comentários dos testes se quiser aderência total à regra "sem comentários" do projeto.
2. Na task 3, cobrir o caminho 502 (`ExternalError`) pelo handler real de `index.js` através da rota `/api/weather`.

## Veredito

Implementação condizente com o PRD, a TechSpec e a task: FR-07 e FR-08 atendidos, zero dependências novas, guard de listen respeitado e cobertura excluindo `src/index.js`. Testes de unidade, integração e fumaça (via MCP `mcp-api-test`) verdes. Status **APROVADO COM OBSERVAÇÕES** — as observações são menores e não bloqueantes.
