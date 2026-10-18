# Tarefa 1.0: Fundação do backend (env, no-cache, error handler, split app/index)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Monta a fundação do servidor Express: configuração centralizada de ambiente, middleware no-cache (regra de produto "zero cache HTTP"), error handler JSON (404/500), split da fábrica `app.js` (testável) do bootstrap `index.js`, e CORS explícito por ambiente. Esta tarefa impõe as restrições de cache/CORS antes de qualquer outra coisa (passo 1 do sequenciamento da techspec).

<requirements>
- `src/config/env.js` com `getEnv()` centralizando: `port`, `nodeEnv`, `corsOrigins`, `geocodingBaseUrl`, `forecastBaseUrl`, `externalTimeoutMs` — defaults: URLs de produção da Open-Meteo e 10000 ms (interface exata na techspec, seção "Interfaces Principais")
- `src/middleware/noCache.js` aplicando `Cache-Control: no-store` em TODAS as respostas (inclusive erros)
- `src/middleware/errorHandler.js`: 404 JSON para rotas desconhecidas e 500 JSON para erros não tratados (com log `error` com contexto: rota, parâmetros, stack)
- `src/app.js` (fábrica exportada para testes): monta middlewares na ordem certa — `express.json()`, no-cache, CORS, log de requisição, `/health` (manter comportamento atual), rotas, 404 + error handler; inclui `app.disable('etag')`
- `src/index.js` reduzido a bootstrap puro: carrega env e chama `listen(PORT)`; zero lógica de negócio
- CORS explícito: `NODE_ENV=development` → qualquer origem (`*`, documentado); demais ambientes → allow-list via env `CORS_ORIGINS` (separada por vírgula); métodos: `GET`; headers autorizados: `Content-Type`, `Accept`
- Log de requisição (middleware): JSON estruturado no stdout — `method`, `path`, `status`, `durationMs` — nível `info` em produção, `debug` em desenvolvimento
- Sem comentários em código novo (decisão D13 da techspec)
- O teste existente `backend/src/__tests__/api.test.js` deve ser atualizado para importar a fábrica `src/app.js` (importar `index.js` iniciaria o servidor nos testes)
</requirements>

## Subtarefas

- [x] 1.1 Criar `src/config/env.js` com `getEnv()` e defaults (URLs de produção, timeout 10000 ms)
- [x] 1.2 Criar `src/middleware/noCache.js` (`Cache-Control: no-store` em todas as respostas)
- [x] 1.3 Criar `src/middleware/errorHandler.js` (404 JSON + 500 JSON com log estruturado)
- [x] 1.4 Criar `src/app.js` (fábrica: middlewares, `/health`, `app.disable('etag')`, 404 + error handler)
- [x] 1.5 Reescrever `src/index.js` como bootstrap puro (env + `listen`)
- [x] 1.6 Configurar CORS por ambiente (dev → `*`; produção → `CORS_ORIGINS`)
- [x] 1.7 Adicionar middleware de log de requisição (JSON estruturado)
- [x] 1.8 Atualizar `backend/src/__tests__/api.test.js` para importar `src/app.js`
- [x] 1.9 Revisar `backend/jest.config.js` (a exclusão de `src/index.js` da cobertura deve continuar valendo após o split)
- [x] 1.10 Criar testes de no-cache e de 404/CORS (ver "Testes da Tarefa")

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): seção "Arquitetura do Sistema" (tabela de componentes do backend — `config/env.js`, `middleware/noCache.js`, `middleware/errorHandler.js`, split `app.js`/`index.js`), "Interfaces Principais" (assinatura de `getEnv()`), "Endpoints de API" (regra de headers: `Cache-Control: no-store`, sem `ETag`), "Pontos de Integração" (CORS) e "Monitoramento e Observabilidade" (log de requisição e de erros). Decisões D1 (URL absoluta + CORS) e D2 (split app/index) se aplicam diretamente.

## Critérios de Sucesso

- `GET /health` continua retornando 200 JSON com o mesmo contrato
- TODAS as respostas (200 e de erro) carregam `Cache-Control: no-store` e NÃO carregam `ETag`
- Rota desconhecida → 404 JSON `{ error, message }`
- Erro não tratado → 500 JSON (sem stack vazado ao cliente)
- `require('../app')` em testes NÃO inicia servidor (nenhum `listen`)
- CORS presente nas respostas (header `Access-Control-Allow-Origin`)
- Suíte Jest completa verde (`cd backend && npm test`), sem teste falhando
- Sem comentários em nenhum arquivo novo (D13)

## Testes da Tarefa

- [x] Testes de unidade: `backend/src/__tests__/noCache.test.js` — header `Cache-Control: no-store` e ausência de `ETag` em respostas 200 e de erro; headers CORS presentes
- [x] Testes de unidade: `backend/src/__tests__/env.test.js` — defaults do `getEnv()` (portas, base URLs de produção, timeout) e override via variáveis de ambiente
- [x] Testes de integração: 404 JSON para rota desconhecida e contrato de `/health` mantido (atualização do `api.test.js` para a fábrica `app.js`)

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `backend/src/app.js` (novo)
- `backend/src/index.js` (modificar — vira bootstrap puro)
- `backend/src/config/env.js` (novo)
- `backend/src/middleware/noCache.js` (novo)
- `backend/src/middleware/errorHandler.js` (novo)
- `backend/src/__tests__/api.test.js` (modificar — importar a fábrica)
- `backend/src/__tests__/noCache.test.js` (novo)
- `backend/src/__tests__/env.test.js` (novo)
- `backend/jest.config.js` (revisar)
