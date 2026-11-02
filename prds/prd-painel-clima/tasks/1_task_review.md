# Review: Task 1.0 - Base do backend: app, cache, CORS e erros

**Revisor**: AI Code Reviewer
**Data**: 2026-11-02
**Arquivo da task**: 1_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Separado o app Express do `listen`: `backend/src/app.js` monta o app sem `listen`, e `backend/src/index.js` apenas carrega `dotenv`, importa o app, chama `listen` e exporta o app. Adicionados os middlewares `noStore` (Cache-Control `no-store`), `cors` (CORS explícito, sem o pacote `cors`) e `errorHandler` (JSON `{ error: { code, message } }`), a classe `HttpError` e a rota `GET /health` movida para `src/routes/health.js` sem mudança de contrato. Foi incluído um catch-all 404 que gera `NOT_FOUND` pelo mesmo tratamento de erro. Nenhuma dependência npm nova. A suíte passa (3 arquivos, 16 testes) e o smoke test de `GET /health` com o dev server no ar retornou 200, `Cache-Control: no-store`, sem `ETag` e com o contrato atual. Avaliação geral: boa qualidade, escopo respeitado e testes cobrindo os critérios de sucesso.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| backend/src/app.js | ✅ OK | 0 |
| backend/src/index.js | ✅ OK | 0 |
| backend/src/routes/health.js | ✅ OK | 0 |
| backend/src/lib/httpError.js | ✅ OK | 0 |
| backend/src/middleware/noStore.js | ✅ OK | 0 |
| backend/src/middleware/cors.js | ✅ OK | 0 |
| backend/src/middleware/errorHandler.js | ✅ OK | 0 |
| backend/src/__tests__/api.test.js | ✅ OK | 0 |
| backend/src/__tests__/cors.test.js | ✅ OK | 0 |
| backend/src/__tests__/errorHandler.test.js | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

- `backend/src/middleware/errorHandler.js` e `backend/src/app.js`: o parâmetro `err` e o `req`/`res` não usados seguem a assinatura de quatro argumentos do Express, mas `code-standards.md` pede nomes sem abreviações. Não corrigido, por ser convenção obrigatória do Express para identificar o middleware de erro.
- `backend/src/middleware/cors.js`, linha 29: o default `= {}` no parâmetro de `createCors` não tem cobertura de branch (cobertura de branches do `cors.js` em 82%). Não corrigido, pois a assinatura é a especificada no TechSpec.

## Defeitos de Outras Tasks

Nenhum.

## ✅ Destaques Positivos

- `createCors` e `parseCorsOrigins` são funções puras separadas da montagem, com testes unitários que cobrem origem liberada, bloqueada, `*` em desenvolvimento e produção sem lista.
- O 404 de rota passa pelo `errorHandler`, então também leva `Cache-Control: no-store`, sem `ETag`, e o corpo de erro padronizado.
- `app.js` não chama `listen`, eliminando o `EADDRINUSE` nos testes; `api.test.js` passou a importar `../app`.
- Ordem de middlewares em `app.js` idêntica à especificada: `disable('etag')`, `noStore`, `cors`, `express.json`, rotas, 404, `errorHandler`.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ⚠️ (nomes curtos `err` e parâmetros não usados por convenção do Express, ver menores) |
| Convenções da linguagem do projeto | ✅ (CommonJS, `*.test.js` em `src/__tests__/`) |
| Contratos de interface (APIs, mensagens) | ✅ (`/health` inalterado; erros `{ error: { code, message } }`; preflight 204 com métodos e headers da TechSpec) |
| Logging | ✅ (`console.error` apenas para erros 500, sem coordenadas) |
| Interface de usuário | N/A |
| Testes | ✅ (16 testes passando; unidade, integração e smoke) |

## Checagens Estáticas

Comando: `cd frontend && npm run lint` (o backend não define linter)
Linha de base (antes da task): 4 erros em 1 arquivo (`frontend/src/__tests__/App.test.jsx`: `no-undef` x3, `no-unused-vars` x1)
Resultado final: 4 erros em 1 arquivo (inalterado; nenhum arquivo do frontend foi tocado pela task)
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): `frontend/src/__tests__/App.test.jsx` — 4 erros (`no-undef` x3, `no-unused-vars` x1)

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: nodejs-backend-patterns, javascript-typescript-jest
MCPs do projeto: usados: context7 (documentation, consulta sobre Express 4: `app.disable('etag')` e middleware de erro de quatro argumentos); mcp-api-test (api-testing, smoke test de `GET /health`); playwright (ui-testing) não necessário, pois a task não tem interface

## Recomendações

1. Em tasks futuras, considerar o `npm install` do frontend como pré-requisito da checagem estática de linha de base, já que `node_modules` estava ausente.
2. Corrigir os 4 erros de lint de `frontend/src/__tests__/App.test.jsx` em uma task própria (são de baseline, fora do escopo desta task).

## Veredito

APROVADO COM OBSERVAÇÕES. A task 1.0 está concluída: `tasks.md` marcado, subtarefas e testes marcados, suíte passando e smoke test confirmado. Próximo passo: task 2.0 (`GET /api/weather`).
