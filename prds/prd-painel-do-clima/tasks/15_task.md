# Tarefa 15.0: Orquestração do App.jsx (máquina de estados, data-tint, remontagem)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Conecta todas as peças no `App.jsx`: a máquina de estados `useWeather` orquestra a composição por estado (`idle` → EmptyState, `loading` → Skeleton, `success` → os 4 blocos de dados, `error` → ErrorState), a busca/geolocalização/retry ficam ligadas à `SearchBar`, o `data-tint` da raiz passa a refletir a condição recebida e o gráfico é remontado por `key` a cada consulta (animação reinicia). Esta task torna o produto funcional de ponta a ponta (com backend) — o painel carregado deve ficar indistinguível do `painel.html` (FR-33).

## Requisitos atendidos (FR)

- **FR-09** — acesso direto em `/` com o painel completo (busca + seções), sem telas intermediárias.
- **FR-10** — primeiro acesso em estado vazio com busca em destaque (composição via EmptyState).
- **FR-13** — sucesso: nome/região da cidade, todos os dados e "Atualizado HH:MM" refletindo a consulta.
- **FR-14/FR-15** — 404 com mensagem amigável e painel utilizável; falha de rede com retry funcional.
- **FR-19** — geo: nome resolvido pelo backend exibido (ou "Sua localização" quando null); negação → `.search-error` e busca por cidade funcional.
- **FR-31** — tingimento aplicado por condição (clear/cloudy/rain) via `data-tint` na raiz.
- **FR-33** — estado carregado indistinguível do protótipo (composição final).
- **FR-35** — 100 % dos dados visíveis vêm do backend (nenhum valor fixo de clima no frontend).
- **FR-38** — conteúdo textual dinâmico real e em pt-BR.

## Subtarefas

- [x] 15.1 Modificar `frontend/src/App.jsx`: wrapper raiz com `data-tint` derivado de `weatherCodeInfo(data.current.weather_code).tint` (inicial `clear`); `SkyBackground` com o mesmo `tint`; `main.dashboard` com as seções em `Reveal` usando os **delays exatos do protótipo**: header `--d:0s`, search `.06s`, current `.08s`, chart `.16s`, stats `.24s`, weekly `.32s`, footer `.4s`.
- [x] 15.2 Composição por estado via `useWeather` (task 8): `idle` → `EmptyState`; `loading` → `Skeleton variant="panel"`; `success` → `CurrentConditions` + `HourlyChart` (dentro de `grid-main`, com `key` da consulta) + `StatsGrid` + `WeeklyForecast`; `error` → `ErrorState` (kinds `not-found`/`bad-request`/`network`).
- [x] 15.3 Ligar a `SearchBar`: `onSubmit → search(city)`, `onLocate → locate()`, `loading` e `geoError` (kind `geo` → `.search-error`; estado das seções anterior preservado, ou `idle` no primeiro acesso); ações do `ErrorState`: "Nova busca" → foca o input e seleciona o texto; "Tentar novamente" → `retry()`.
- [x] 15.4 Remontagem do gráfico: `key` baseado na consulta (ex.: cidade/coordenadas + timestamp) para reiniciar a animação de entrada a cada busca nova.
- [x] 15.5 Reescrever `frontend/src/__tests__/App.test.jsx` conforme "Abordagem de Testes" da TechSpec (os 4 estados + geo + retry + remontagem).
- [x] 15.6 Testes (unidade + integração + fumaça).

## Detalhes de Implementação

Ver `techspec.md`: "Máquina de estados (useWeather)" (transições), "Animações e interações → De entrada (revelação)" (delays `--d` por seção), "Decisões Principais" (item 10 — `data-tint` no wrapper da raiz), "Abordagem de Testes → Testes Unidade" (itens de `App.test.jsx`) e "→ Testes de Integração" (App com serviço real e fetch mockado; remontagem do gráfico por classe de entrada).

## Critérios de Sucesso

- **O painel em estado carregado é indistinguível do estado carregado do `painel.html` (FR-33)** — mesmo layout (`.grid-main` 5fr/7fr, `.grid-stats`, `.weekly-grid`), mesmas seções na mesma ordem, mesmos reveals com os delays do protótipo — com **dados 100 % do `GET /api/weather`** (FR-35/FR-38): nenhum valor de clima hardcoded.
- Estados completos: `idle` → EmptyState + busca em destaque (FR-09/FR-10); `loading` → Skeleton em todas as seções + botão `is-loading` (FR-30); `not-found`/`bad-request`/`network` → ErrorState com a ação correta (FR-14/15/16); geo negada → `.search-error` e busca por cidade funcional (FR-19).
- `data-tint` na raiz por grupo da condição (FR-31): céu limpo → `clear`, nublado → `cloudy`, chuva → `rain`; crossfade sem alterar componentes/tipografia/cores de texto.
- Sucesso por geo: nome resolvido pelo backend exibido via `city.display` (ou "Sua localização" quando `city.name` é null) (FR-18/FR-19).
- Nova busca remonta o gráfico (`key`) e a animação de entrada reinicia (classe de entrada presente de novo).
- Cabeçalho (relógio), céu (com tint) e rodapé presentes em **todos** os estados.

## Testes da Tarefa

- [x] Testes de unidade: `App` renderiza a seção correta para cada `status` (`idle`/`loading`/`success`/`error`, com fetch mockado por estado) — incluindo `data-tint` por condição no wrapper raiz.
- [x] Testes de integração (reescrita de `App.test.jsx`): estado inicial = EmptyState + search em destaque (FR-09/FR-10); fluxo de sucesso com fetch mockado (200) popula os 4 blocos + tint aplicado; 404 → mensagem amigável e painel utilizável; erro de rede → retry refaz o request; geolocalização negada (mock de `navigator.geolocation`) → `.search-error` e busca por cidade funciona; remontagem do gráfico a cada busca (presença da classe de entrada de novo).
- [x] Teste de fumaça do fluxo principal (cobre os fluxos das tasks 5–14): `App` com fetch mockado (200, envelope completo) — busca "Curitiba" → `aria-busy` na busca → Skeleton → `success` com `CurrentConditions` + `HourlyChart` (24 pontos) + `StatsGrid` (4 cards) + `WeeklyForecast` (7 dias) + `data-tint` aplicado (fluxo de sucesso principal da aplicação).

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Modificar: `frontend/src/App.jsx`, `frontend/src/__tests__/App.test.jsx`.
- Dependências já entregues: todas as components/hooks da feature (tasks 4–14).
- Referência: `painel.html` (linhas 496–622 — estrutura do dashboard completo; 839–847 — delays do reveal).
