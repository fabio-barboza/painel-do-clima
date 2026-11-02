# Review: Task 7.0 - Cliente da API e estado da consulta

**Revisor**: AI Code Reviewer
**Data**: 2026-11-02
**Arquivo da task**: 7_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

A task conecta o frontend ao backend. `fetchWeather` (`frontend/src/api/weather.js`) chama `GET /api/weather` com `cache: 'no-store'` e mapeia 400, 404, 502, rede e aborto para `WeatherApiError` com `kind` `invalid`, `not_found` ou `network`. O hook `useWeather` concentra o estado da consulta, com `requestId` e `AbortController` em `useRef`, timeout de 20 s, geolocalização com as opções da TechSpec, `retry()` e o mapeamento de cada situação para `notice`. `App` liga `SearchBar`, `Notice` e `EmptyState` ao hook. A fixture `frontend/src/__tests__/fixtures/weather.js` reproduz `HOURLY` e `WEEK` de `painel.html` com início em `2026-08-16`. A suíte ficou em 100 testes passando e o lint limpo. A busca por "Curitiba" no navegador, com backend e frontend no ar, gerou `GET http://localhost:3000/api/weather?city=Curitiba` com 200 e nenhuma requisição à Open-Meteo.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/api/weather.js` | ✅ OK | 0 |
| `frontend/src/hooks/useWeather.js` | ✅ OK | 0 |
| `frontend/src/App.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/fixtures/weather.js` | ✅ OK | 0 |
| `frontend/src/__tests__/weatherApi.test.js` | ✅ OK | 0 |
| `frontend/src/__tests__/useWeather.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/AppWeather.test.jsx` | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. `frontend/src/hooks/useWeather.js`, função `locate`: quando `navigator.geolocation` não existe, a função apenas define o aviso e não cancela uma consulta em andamento. Ela continua até o fim e pode substituir o aviso. É um caso de borda sem impacto na tela atual. Correção sugerida: chamar `beginRequest` antes do aviso, se o comportamento deve ser idêntico ao da permissão negada.
2. `frontend/src/hooks/useWeather.js`: as mensagens e os avisos estão em constantes do próprio módulo. Se a tarefa 14.0 ou as seguintes precisarem reutilizá-las, convém movê-las para `src/lib/`. Nada precisa mudar agora.

## Defeitos de Outras Tasks

Nenhum. A smoke test e as suítes de tarefas anteriores passaram sem alteração de código fora do escopo desta task.

## ✅ Destaques Positivos

- `fetchWeather` monta a URL com `URLSearchParams` e envia `cache: 'no-store'` e o `signal` em toda chamada. Os testes verificam a URL exata e as opções.
- A concorrência usa um único objeto `session` em `useRef`, com `id`, `controller` e `lastQuery`. Respostas antigas são descartadas inclusive na geolocalização tardia, coberto por teste.
- Erros não apagam dados: `buildFailedView` mantém `data` e volta para `ready` quando há dados anteriores (RF-39).
- Coordenadas ficam só em memória, em `lastQuery`, sem log e sem persistência (privacidade do PRD).
- A fixture é usada só em `src/__tests__/`. Nenhum valor de exemplo entrou no código de produção.
- Nenhuma dependência npm nova.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ Funções com verbo, constantes nomeadas, máximo de 3 parâmetros após refatoração de `runQuery` |
| Convenções da linguagem do projeto | ✅ ESM, componentes em PascalCase, testes em `src/__tests__/` |
| Contratos de interface (APIs, mensagens) | ✅ `fetchWeather(query, { signal })`, `useWeather()` e mensagens exatas da tabela da TechSpec |
| Logging | ➖ Não aplicável |
| Interface de usuário | ✅ Estado vazio sem `fetch`; `Notice` com `role` por tipo; "Tentar novamente" só em falha de comunicação |
| Testes | ✅ 100 testes passando (33 novos nesta tarefa) |

## Checagens Estáticas

Comando: `cd frontend && npm run lint`
Linha de base (antes da task): limpa
Resultado final: limpa
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): nenhum

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: react-testing (leitura parcial: query priority, async e hooks), vitest (índice e referências de mocking). Demais skills instaladas não aplicáveis a esta tarefa. Divergência registrada: a skill `react-testing` recomenda `userEvent`, mas o projeto não declara `@testing-library/user-event`; os testes usam `fireEvent`, como definido na TechSpec.
MCPs do projeto: usados: playwright (ui-testing) para o teste de fumaça com `npm run dev` no ar em `http://localhost:5173/` e backend em `http://localhost:3000/`; mcp-api-test não usado (a validação de endpoint pertence à tarefa 2.0 e à etapa de QA); context7 não necessário (sem dúvida de biblioteca).

## Teste de Fumaça

Fluxo principal: abrir `/`, confirmar o estado vazio, digitar "Curitiba" e clicar em "Pesquisar".
Resultado: `GET http://localhost:3000/api/weather?city=Curitiba` com 200. Nenhuma requisição à Open-Meteo em `browser_network_requests`.
Evidência: `prds/prd-painel-clima/task-screenshots/task-7-busca-curitiba.png`.
Serviços: subidos por esta task com `npm run dev` em backend e frontend e encerrados ao final.
Observação de escopo: a busca por coordenadas (geolocalização real) não foi exercitada no navegador, pois exige permissão do navegador. Está coberta pelos testes de unidade e integração com a API de geolocalização simulada.

## Recomendações

1. Antes da tarefa 9.0, conferir se o aviso de geolocalização não suportada deve cancelar a consulta em andamento (item menor 1).
2. Na tarefa 14.0, revisar a exibição de dados em `ready` com erro, que depende de `data` mantido no hook.

## Veredito

**APROVADO COM OBSERVAÇÕES.** Não há problemas críticos nem maiores. Testes e lint passam. A tarefa 7.0 pode ser marcada como concluída, e a tarefa 8.0 pode começar.
