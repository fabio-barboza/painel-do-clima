# Tarefa 1.0: Base do backend: app, cache, CORS e erros

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Separa a montagem do app Express do `listen` e cria a base usada por todas as rotas: ausência de cache HTTP, CORS explícito e tratamento padronizado de erros. Resolve também os problemas do scaffold com `EADDRINUSE` nos testes e com a cobertura que exclui `src/index.js`.

<requirements>
- Requisitos do PRD atendidos: RF-01 (base da mediação pelo backend) e RF-05 (formato de erro), além das restrições "Sem cache HTTP entre frontend e backend" e "CORS explícito".
- `GET /health` mantém o contrato atual.
- ETag desabilitada e `Cache-Control: no-store` em toda resposta, inclusive erros, 404 de rota e preflight.
- CORS implementado sem o pacote `cors` e sem nenhuma dependência npm nova.
- Em `NODE_ENV=production` sem `CORS_ORIGINS`, nenhuma origem é liberada.
</requirements>

## Subtarefas

- [x] 1.1 Rodar `npm install` em `backend/`, pois `node_modules` não existe.
- [x] 1.2 Criar `src/lib/httpError.js` com a classe `HttpError(status, code, message)`.
- [x] 1.3 Criar `src/middleware/noStore.js`, `src/middleware/cors.js` (`createCors({ origins, isProduction })`) e `src/middleware/errorHandler.js`.
- [x] 1.4 Mover `GET /health` para `src/routes/health.js`, sem mudar o contrato.
- [x] 1.5 Criar `src/app.js`, sem `listen`, na ordem `app.disable('etag')`, `noStore`, `cors`, `express.json`, rotas, `errorHandler`.
- [x] 1.6 Reduzir `src/index.js` a carregar `dotenv`, importar `app`, chamar `listen` e exportar `app`.
- [x] 1.7 Ajustar `src/__tests__/api.test.js` para importar `../app`.
- [x] 1.8 Escrever os testes de unidade e de integração.

## Detalhes de Implementação

Ver na `techspec.md`: "Visão Geral dos Componentes" (tabela do backend), "Interfaces Principais", "Modelos de Dados" (bloco Erro, códigos `INTERNAL_ERROR` e demais), "Endpoints de API" (bloco CORS) e "Monitoramento e Observabilidade" (log de erros 500).

## Critérios de Sucesso

- Testes do backend rodam com um dev server ativo na porta 3000, sem `EADDRINUSE`.
- Toda resposta tem `Cache-Control: no-store` e nenhuma tem `ETag`, inclusive 404 de rota e `OPTIONS`.
- `OPTIONS` responde 204 com `Access-Control-Allow-Methods: GET, OPTIONS` e `Access-Control-Allow-Headers: Content-Type`.
- `Vary: Origin` presente quando há lista de origens.
- Erros respondem `{ "error": { "code", "message" } }`.
- `backend/package.json` sem dependências novas.

## Testes da Tarefa

- [x] Testes de unidade: `cors` com origem liberada, origem bloqueada, `*` em desenvolvimento e produção sem lista; `errorHandler` com `HttpError` e com erro inesperado (500, `INTERNAL_ERROR`).
- [x] Testes de integração: Supertest sobre `app.js` cobrindo `GET /health`, headers de cache, ausência de `ETag`, 404 de rota e preflight `OPTIONS`.
- [x] Teste de fumaça: com `npm run dev` no ar, `GET /health` via mcp-api-test retorna o contrato atual com `Cache-Control: no-store` e sem `ETag`.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `backend/src/app.js`, `backend/src/index.js`
- `backend/src/routes/health.js`
- `backend/src/lib/httpError.js`
- `backend/src/middleware/noStore.js`, `backend/src/middleware/cors.js`, `backend/src/middleware/errorHandler.js`
- `backend/src/__tests__/api.test.js`, `backend/jest.config.js`
