# Tarefa 10.0: CurrentConditions + WeatherIconBig (card de condições atuais)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementa o card de condições atuais (`section.card.current`): cidade consultada (`.loc`), indicador "Atualizado HH:MM" com pulse-dot, ícone grande animado coerente com a condição (5 variantes), temperatura em destaque com count-up, descrição da condição e os chips Máx/Mín/Sensação.

## Requisitos atendidos (FR)

- **FR-13** — em sucesso, exibe o nome (e região) da cidade e o indicador de atualização refletindo a consulta.
- **FR-20** — card com temperatura em destaque, descrição da condição, cidade/região, "atualizado" e máx/mín/sensação do dia.
- **FR-21** — ícone animado coerente com a condição recebida do backend.

## Referência visual (painel.html)

- **`section.card.current`, linhas 527–557** — `.current-top` (`.loc` com `i-pin` + nome; `.updated` com `.pulse-dot` + texto), `.current-main` (`.big-icon` + `.temp-block` com `.temp` (número + "°") e `.condition`), `.current-foot` com 3 chips: `.chip.hot` "Máx" (`i-up`), `.chip.cold` "Mín" (`i-down`), `.chip.plain` "Sensação".
- **Composição do ícone grande, linhas 533–546** — variante do protótipo (sol com nuvem): `.bi-sun` (círculo + `<g class="rotor">` com os 8 raios) + `.bi-cloud` (`<use href="#i-cloud">`); animações CSS já portadas (linhas 213–225: `spin` 32 s no rotor, `floaty` 6 s na nuvem, drop-shadows).
- **Count-up da temperatura, linhas 806–817** — 1400 ms, `1−(1−p)³`, delay 450 ms, reduced motion → valor direto (consumido via `useCountUp` da task 8).

## Subtarefas

- [x] 10.1 Criar `frontend/src/components/WeatherIconBig.jsx`: `.big-icon` por variante de `weatherCodeInfo(code).icon` — `sun` (composição exata das linhas 534–544: `.bi-sun` com `.rotor`), `cloud-sun` (sol + `.bi-cloud`), `cloud`, `rain`, `storm` — usando os SVGs/símbolos do protótipo com as mesmas animações (`spin`, `floaty`).
- [x] 10.2 Criar `frontend/src/components/CurrentConditions.jsx`: `section.card.current` com a estrutura exata das linhas 527–557 — cidade = `city.display` (ou "Sua localização" quando `city.name` for null — fluxo geo); "Atualizado **HH:MM**" via `formatTimeFromIso(current.time)` (ISO local da cidade — não o relógio do viewer, FR-13); temperatura via `useCountUp` até `Math.round(current.temperature_2m)`; `.condition` = `weatherCodeInfo(code).label`; chips: Máx/Mín de `daily[0]` (°C) e Sensação de `current.apparent_temperature`.
- [x] 10.3 Testes (unidade + integração).

## Detalhes de Implementação

Ver `techspec.md`: "Componentização" (linha `section.card.current`), "Derivações exibidas" (chips de `daily[0]`/`current`, `Math.round` para °C), "Acréscimos → Atualizado (FR-13)", "Interfaces" (`CurrentConditions({ data })`, `WeatherIconBig({ code })`), "Animações e interações → Temperatura".

## Critérios de Sucesso

- **A seção fica idêntica ao trecho de linhas 527–557 do `painel.html`** — mesma estrutura (`.current-top`/`.loc`/`.updated`/`.pulse-dot`/`.current-main`/`.big-icon`/`.temp-block`/`.temp`/`.condition`/`.current-foot`), mesmas classes e chips (`.chip.hot`/`.chip.cold`/`.chip.plain` com `i-up`/`i-down`), mesmas animações (`spin` no rotor, `floaty` na nuvem, `ping` no pulse-dot) — **com dados 100 % da resposta do backend** (FR-35): nenhum valor de exemplo do protótipo ("Curitiba, PR", "Parcialmente nublado", "Atualizado agora") fixo no código.
- Ícone coerente com o `weather_code` (FR-21): as 5 variantes (`sun`/`cloud-sun`/`cloud`/`rain`/`storm`) renderizam corretamente para os códigos do mapa WMO.
- Temperatura termina o count-up exatamente em `Math.round(current.temperature_2m)` (reduced motion → direto); "°" fixo fora do número animado.
- "Atualizado HH:MM" reflete o ISO local da cidade (`current.time`), não a hora do viewer (FR-13).
- Chips: Máx/Mín de `daily[0]`, Sensação de `apparent_temperature` (FR-20) — nenhum valor hardcoded.

## Testes da Tarefa

- [x] Testes de unidade (`frontend/src/__tests__/CurrentConditions.test.jsx`): dados renderizados (cidade via `city.display`, condição via mapa WMO, chips); count-up termina no valor final (`findBy`); placeholders "–" quando sem dados; variante do ícone por código (teste das 5 variantes de `WeatherIconBig`).
- [x] Testes de integração: `CurrentConditions` com slice sintético de `WeatherResponse` completo — cidade "Curitiba, Paraná", "Atualizado HH:MM" extraído do `current.time` (e não do relógio do viewer), chips de `daily[0]`/`current.apparent_temperature`, `city.name` null → "Sua localização".
- [x] Teste de fumaça: **omitido** — componente ainda não montado no App; o fluxo visível é coberto pela fumaça da task 15 (painel completo carregado).

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Criar: `frontend/src/components/CurrentConditions.jsx`, `frontend/src/components/WeatherIconBig.jsx`, `frontend/src/__tests__/CurrentConditions.test.jsx`.
- Dependências já entregues: CSS portado (task 4), `Icon`/sprite (task 5), `useCountUp` (task 8), `format`/`weatherCodes` (task 7).
- Referência: `painel.html` (linhas 527–557, 533–546, 806–817).
