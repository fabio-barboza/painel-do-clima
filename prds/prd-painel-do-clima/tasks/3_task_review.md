# Review: Task 3.0 - Rota GET /api/weather (cidade e coordenadas)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-27
**Arquivo da task**: 3_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Implementada a rota `GET /api/weather` (`backend/src/routes/weather.js`), montada em `backend/src/index.js` em `/api/weather`. A rota valida os parâmetros (`city` ausente/vazio/só-espaços e sem coordenadas → 400; `city` + coordenadas → 400; latitude/longitude NaN ou fora de range → 400), executa o fluxo por cidade (`geocodeCity` → 404 quando nulo; `fetchForecast` → 502 via `ExternalError`) e o fluxo por coordenadas em paralelo (`Promise.all([fetchForecast, reverseGeocode])`, com reverse falhando → `city.name = null` e resposta 200). O envelope respeita o contrato `WeatherResponse` da TechSpec (24 entradas em `hourly` via `sliceHourly24` a partir da hora local; 7 em `daily`; `display = "Nome, Região"`). Testes de unidade, integração (Supertest + `jest.mock`) e fumaça (rede real via MCP) todos passing. `Cache-Control: no-store` e ausência de `ETag` confirmados também na resposta real.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `backend/src/routes/weather.js` | ✅ OK | 0 críticos, 0 maiores, 2 menores |
| `backend/src/index.js` | ✅ OK | 0 |
| `backend/src/__tests__/weather.test.js` | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. **Parâmetro `next` não utilizado em `handleCity`/`handleCoords`** (`backend/src/routes/weather.js`, linhas ~56 e ~72). As funções recebem `next` na assinatura (por coerção com handlers Express) mas nunca o chamam — o retorno é via `res.json` direto. Sem efeito colateral, mas sugiro remover o parâmetro ou usar `next` explicitamente para manter a assinatura limpa.
2. **Handler síncrono devolvendo promessa** (`router.get('/', ...)`) — o trabalho async está embutido em um IIFE com `try/catch` que chama `next(err)`. Funcional (Express 4 não aguarda promises devolvidas, então o catch explícito é o caminho correto), porém um handler `async (req, res, next) => { try { ... } catch (e) { next(e) } }` seria mais idiomático. Baixo risco.

## ✅ Destaques Positivos

- Validação estrita e completa de todos os casos de 400 da TechSpec, com respostas `{ error }` sempre em pt-BR.
- Fluxo de coordenadas executado em paralelo (`Promise.all`), sem waterfall, conforme exigido.
- `sliceHourly24` real reutilizado no envelope (mock parcial do módulo `forecast`), garantindo a janela rolante de 24 h a partir da hora local corrente.
- Tratamento `city.name = null` quando o reverse geocoding falha, mantendo 200 (best-effort, FR-06).
- Suíte de testes cobre todos os status (200/400/404/502), presença de headers de cache/CORS em cada um, CORS preflight 204, e confirma que a rota desconhecida continua 404 JSON. Inclui teste explícito de execução paralela.
- Constantes de range (latitude/longitude) adicionadas em vez de números mágicos.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ (sem magic numbers; funções por ação; early returns) |
| Convenções da linguagem do projeto | ✅ (CommonJS `require`/`module.exports`) |
| Contratos de interface (APIs, mensagens) | ✅ (envelope `WeatherResponse`, status codes, pt-BR) |
| Logging | ✅ (reaproveita o middleware `logger`/`logError` existente) |
| Interface de usuário | — (sem UI nesta task) |
| Testes | ✅ (53/53 passing; unidade + integração + fumaça) |

## Checagens Estáticas

Comando: nenhum definido para o backend (o projeto não declara lint/typecheck no `backend/`).
Linha de base (antes da task): limpa (sem checagem estática declarada).
Resultado final: limpo.
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): nenhum.

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: nodejs-backend-patterns (rotas/middleware/tratamento de erro), javascript-typescript-jest (mocks com `jest.mock`, structure dos testes). MCPs do projeto: usados: mcp-api-test (capacidade api-testing) — fumaça do fluxo principal `GET /api/weather?city=Curitiba` com rede real; lacuna: playwright (ui-testing) não aplicável, pois a task não expõe interface de usuário.

## Recomendações

1. (Menor) Simplificar a assinatura de `handleCity`/`handleCoords` removendo o `next` não usado.
2. (Menor, opcional) Reescrever o handler como `async` idiomático com `try/catch → next(e)`, se desejar consistência de estilo com os handlers Express.

## Veredito

Task concluída e **APROVADA COM OBSERVAÇÕES**. Todos os 53 testes passam (unidade, integração e fumaça com rede real), o envelope respeita a TechSpec, os `<critical>` tags foram atendidos (PRD e TechSpec lidos; endpoint validado com rede real) e não há problemas críticos ou maiores. As duas observações são de estilo, não bloqueantes.
