# Tarefa 8.0: Camada de dados: services/weather, useCountUp e useWeather

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementa a comunicação do frontend com o backend e a máquina de estados da aplicação: `services/weather.js` (sempre `fetch` com `cache: 'no-store'` explícito — FR-36 — e mapeamento de status para `WeatherError.kind`), `useWeather` (estados `idle/loading/success/error`, ações `search`/`locate`/`retry`, `AbortController` por busca) e `useCountUp` (animação da temperatura). Também estende o `setup.js` de testes com os stubs de ambiente.

## Requisitos atendidos (FR)

- **FR-11…FR-13** — busca por cidade: disparo, loading perceptível, sucesso com dados (máquina de estados).
- **FR-14…FR-16** — mapeamento dos erros (404 → not-found, 400 → bad-request, rede/5xx → network).
- **FR-17…FR-19** — geolocalização do navegador (`locate`), nome resolvido pelo backend, erro geo amigável.
- **FR-20** — count-up da temperatura (1400 ms, ease-out cúbico, delay 450 ms, reduced-motion direto).
- **FR-36** — todo `fetch` do frontend com `cache: 'no-store'` explícito.

## Subtarefas

- [x] 8.1 Criar `frontend/src/services/weather.js`: `fetchWeather(city)` e `fetchWeatherAtCoords(lat, lon)` — base `import.meta.env.VITE_API_URL ?? ''` (dev: vazia → proxy; prod: absoluta), `fetch(url, { cache: 'no-store', signal })`, `encodeURIComponent` da city; mapeamento: 404 → `WeatherError{kind:'not-found'}`, 400 → `{'bad-request'}`, demais/rede → `{'network'}`.
- [x] 8.2 Criar `frontend/src/hooks/useWeather.js`: máquina de estados conforme "Máquina de estados (useWeather)" da TechSpec — `search(city)`: vazio após trim → erro local `bad-request` **sem request**; `locate()`: `navigator.geolocation` → `fetchWeatherAtCoords`, erros do navegador → `kind: 'geo'` (mensagem para `.search-error`; estado das seções anterior preservado, ou `idle` no primeiro acesso); `retry()` reexecuta a última consulta armazenada (city ou geo); `AbortController` por busca — nova busca/`locate` aborta a anterior; abort no unmount.
- [x] 8.3 Criar `frontend/src/hooks/useCountUp.js`: anima `0 → target` em 1400 ms com easing `1−(1−p)³`, delay de 450 ms após render; com `prefers-reduced-motion: reduce` → valor direto (comportamento das linhas 806–817 do protótipo).
- [x] 8.4 Estender `frontend/src/__tests__/setup.js`: stubs de `IntersectionObserver`, `matchMedia` (reduced motion off por padrão) e `getTotalLength`; mocks de `navigator.geolocation` e `fetch` **por teste** (nunca globais no setup).
- [x] 8.5 Testes (unidade + integração + fumaça).

## Detalhes de Implementação

Ver `techspec.md`: "Interfaces Principais → Frontend" (assinaturas exatas de `services/weather.js`, `useWeather`, `useCountUp`), "Máquina de estados (useWeather)" (transições completas), "Abordagem de Testes" (itens `weather-service.test.js`, `useWeather.test.js` e mocks de ambiente), "Animações e interações → Temperatura".

## Critérios de Sucesso

- Toda chamada `fetch` usa explicitamente `cache: 'no-store'` (FR-36) e city codificada; base vazia em dev (proxy) e absoluta quando `VITE_API_URL` está definida.
- Mapeamento de erros: 404 → `not-found`; 400 → `bad-request`; 5xx/rede → `network` (com `status` quando houver).
- Máquina: `idle→loading→success`; `error{kind}` nos 3 casos + `geo`; busca vazia → `bad-request` **sem** request; `retry` reexecuta a última consulta (city e geo); nova busca aborta a anterior (`AbortController`); unmount aborta.
- `useCountUp` termina no valor-alvo (1400 ms, delay 450 ms); reduced motion → imediato.
- Zero dependências novas (sem MSW/`user-event` — mocks diretos de `fetch`).

## Testes da Tarefa

- [x] Testes de unidade (`frontend/src/__tests__/weather-service.test.js`, `useCountUp.test.js`, `useWeather.test.js`): service (`cache:'no-store'`, URL com `encodeURIComponent` de city acentuada, mapeamento 404/400/500/rede, base vazia vs absoluta); `useCountUp` (fake timers, termina no target, reduced motion direto); `useWeather` (`renderHook` — transições, mapeamento de erros, busca vazia sem request, `retry` city e geo, nova busca aborta a anterior).
- [x] Testes de integração: `useWeather` com `services/weather.js` real e `fetch` mockado — busca "Curitiba" → `idle→loading→success` com `data` completa; 404 → `error{kind:'not-found'}`; abort da busca anterior confirmado (fetch abortado).
- [x] Teste de fumaça do fluxo principal: `renderHook(useWeather)` → `search('Curitiba')` com `fetch` stub retornando 200 (envelope completo) → `status === 'success'` e `data.hourly` com 24 entradas (fluxo de sucesso da camada de dados; a UI visível é coberta pela fumaça da task 15).

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Criar: `frontend/src/services/weather.js`, `frontend/src/hooks/useWeather.js`, `frontend/src/hooks/useCountUp.js`, `frontend/src/__tests__/weather-service.test.js`, `frontend/src/__tests__/useWeather.test.js`, `frontend/src/__tests__/useCountUp.test.js`.
- Modificar: `frontend/src/__tests__/setup.js`.
- Dependências já entregues: endpoint no backend (tasks 1–3); libs puras (task 7 — não são exigidas aqui, mas já existem).
- Referência: `painel.html` (linhas 806–817 — comportamento do count-up a reproduzir).
