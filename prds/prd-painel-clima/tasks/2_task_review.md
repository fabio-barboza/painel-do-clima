# Review: Task 2.0 - Endpoint `GET /api/weather`

**Revisor**: AI Code Reviewer
**Data**: 2026-11-02
**Arquivo da task**: 2_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Entregue a rota `GET /api/weather` com validação de parâmetros (`lib/parseWeatherQuery.js`), a camada única de acesso à Open-Meteo (`services/openMeteo.js`, com `geocodeCity` e `fetchForecast`), a rota (`routes/weather.js`, registrada em `app.js` antes do 404) e os testes de unidade e integração. O payload da Open-Meteo não é remodelado; apenas `location` é acrescentado. Cidade usa geocoding com `count=1` e `timezone=auto`; coordenadas dispensam geocoding e devolvem `location` com campos `null`. Falhas externas viram `HttpError(502, 'UPSTREAM_ERROR')` sem repassar a mensagem externa, com `console.error` contendo serviço, motivo (status ou nome do erro) e duração, sem coordenadas. Suíte do backend: 72 testes passando, 6 suítes. Teste de fumaça com o backend no ar e sem mocks: ambos os fluxos de sucesso retornaram 200 com `current`, `hourly`, `daily` e `location`, e `Cache-Control: no-store`.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `backend/src/lib/parseWeatherQuery.js` | ✅ OK | 0 |
| `backend/src/services/openMeteo.js` | ✅ OK | 0 (ver observação menor sobre exports) |
| `backend/src/routes/weather.js` | ✅ OK | 0 |
| `backend/src/app.js` | ✅ OK | 0 |
| `backend/src/__tests__/parseWeatherQuery.test.js` | ✅ OK | 0 |
| `backend/src/__tests__/openMeteo.test.js` | ✅ OK | 0 |
| `backend/src/__tests__/weather.test.js` | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

- `backend/src/services/openMeteo.js`: `buildGeocodingUrl` e `buildForecastUrl` são exportados apenas para os testes de montagem de URL. Não é bug. Alternativa: testar a URL pela chamada a `fetch`, deixando o módulo com a interface da TechSpec (`geocodeCity`, `fetchForecast`).

## Defeitos de Outras Tasks

Nenhum.

## ✅ Destaques Positivos

- Testes de fronteira externa asseguram a requisição completa: URL exata (incluindo a codificação de vírgulas e espaços) e o objeto de opções com `signal`.
- O teste de log verifica que o `console.error` do 502 de previsão não contém latitude nem longitude.
- Chamadas externas com `try/catch` e `next(error)` nas rotas assíncronas, que o Express 4 não trata sozinho.
- Mensagem de erro externa nunca é repassada ao cliente.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ Funções com verbo, máximo de 3 parâmetros, sem comentários, sem linhas em branco dentro de funções |
| Convenções da linguagem do projeto | ✅ CommonJS, `*.test.js` em `src/__tests__/` |
| Contratos de interface (APIs, mensagens) | ✅ Status e códigos da tabela da TechSpec; 400 `INVALID_PARAMS`, 404 `CITY_NOT_FOUND`, 502 `UPSTREAM_ERROR` |
| Logging | ✅ `console.error` por 502 com serviço, motivo e duração; sem coordenadas |
| Interface de usuário | Não se aplica |
| Testes | ✅ 72 testes passando; cobertura de `parseWeatherQuery.js`, `openMeteo.js`, `weather.js` em 100% de linhas |

## Checagens Estáticas

Comando: `cd frontend && npm run lint` (backend não define linter)
Linha de base (antes da task): 4 erros em 1 arquivo
Resultado final: 4 erros em 1 arquivo
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): `frontend/src/__tests__/App.test.jsx` — 3 `no-undef` e 1 `no-unused-vars`. Arquivo não tocado por esta task.

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: nodejs-backend-patterns, javascript-typescript-jest. Divergências registradas na TechSpec (sem TypeScript, Zod, Pino) mantidas.
MCPs do projeto: usados: mcp-api-test (api-testing), smoke test de `GET /api/weather` por cidade e por coordenadas. Context7 não foi necessário.

## Recomendações

1. Opcional: remover os exports de `buildGeocodingUrl` e `buildForecastUrl` e testar a URL pelo mock de `fetch`.
2. Tratar os 4 erros de lint pré-existentes em `frontend/src/__tests__/App.test.jsx` na task do frontend que reescreve esse arquivo.

## Veredito

Task 2.0 concluída. Testes passando, critérios de sucesso da task atendidos, smoke test com fluxos reais aprovado. Próximo passo: task 3.0. Observação menor não bloqueante.
