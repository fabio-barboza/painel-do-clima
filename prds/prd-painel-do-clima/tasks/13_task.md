# Tarefa 13.0: WeeklyForecast + DayCard (próximos 7 dias)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementa o card "Próximos 7 dias": fileira de 7 cards de dia (nome do dia, data curta, ícone da condição com cor, mínima/máxima e probabilidade de chuva), com o dia atual distinguido e rolagem horizontal com snap em telas estreitas (CSS já portado).

## Requisitos atendidos (FR)

- **FR-27** — 7 dias (incluindo o atual), cada um com nome do dia, data curta, ícone da condição predominante, mínima, máxima e chuva do dia.
- **FR-28** — variação mín→máx visível por card no mesmo padrão visual do protótipo (`d-temps` com máx em destaque + mín).
- **FR-29** — dia atual visualmente distinguido; em telas estreitas, rolagem horizontal com snap sem cortar conteúdo.

## Referência visual (painel.html)

- **`section.card` 7 dias, linhas 608–616** — `.card-head` (h2 "Próximos 7 dias" + `.sub` "Previsão diária com probabilidade de chuva") + `.weekly-grid`.
- **JS do grid semanal, linhas 672–681** — estrutura exata de cada `.day`: `.d-name` (+ classe `today`), `.d-date`, `svg.ico.d-ico` com cor inline por condição, `.d-temps` (`<b>máx°</b><span>mín°</span>`), `.d-rain` (ícone `i-drop` + `N%`).
- CSS já portado na task 4 (linhas 316–340: `.weekly-grid` 7 colunas, `.day` com hover `translateY(-6px)`, cores dos ícones semanais — sun/cloud-sun `#ffd76a`, cloud `#c9d6f2`, rain `#7cc4ff`, storm `#c9b8ff`; ≤ 920 px rolagem com `scroll-snap`) — **reutilizar, sem criar novos valores**.

## Subtarefas

- [x] 13.1 Criar `frontend/src/components/DayCard.jsx`: `.day` com a estrutura exata das linhas 674–680; props `{ day, index }` — `index 0` → `.d-name` com classe `today` e rótulo "Hoje" (`formatDayLabel`); `.d-date` via `formatShortDate`; ícone = `weatherCodeInfo(weather_code).icon` com a cor do mapa WMO (cor inline, como no protótipo); `.d-temps` com `Math.round` (máx em `<b>`, mín em `<span>`); `.d-rain` com `precipitation_probability_max` + "%" ou "–" quando `null`.
- [x] 13.2 Criar `frontend/src/components/WeeklyForecast.jsx`: `section.card` com a estrutura exata das linhas 608–616 + `.weekly-grid` com os 7 `DayCard`s derivados de `data.daily` (ordem: hoje primeiro).
- [x] 13.3 Testes (unidade + integração).

## Detalhes de Implementação

Ver `techspec.md`: "Componentização" (linha `section.card` 7 dias + JS do grid), "Modelos de Dados" (tabela WMO — ícones/cores semanais; chuva semanal por **probabilidade** — decisão 4; null → "–"), "Interfaces" (`DayCard({ day, index })`, `WeeklyForecast({ daily })`).

## Critérios de Sucesso

- **A seção fica idêntica ao trecho de linhas 608–616 + 672–681 do `painel.html`** — mesma estrutura (`.card-head` com h2/`.sub` exatos, `.weekly-grid`, `.day` com `.d-name`/`.today`/`.d-date`/`.d-ico`/`.d-temps`/`.d-rain`), mesmas classes e ícones, mesmas cores por condição, mesmas interações (hover `translateY(-6px)`, snap em telas estreitas) — **com dados 100 % do `daily` da resposta do backend** (FR-35): nenhum valor do array `WEEK` do protótipo fixo no código (datas, temperaturas, probabilidades).
- Exatamente 7 cards derivados de `daily` (hoje em primeiro); "Hoje" + classe `today` **somente** no índice 0 (FR-29).
- Data no formato "16 ago" (pt-BR, sem "de"); nome do dia "Seg"… (sem ponto); ícone e cor coerentes com o código WMO do dia.
- Chuva: inteiro + "%", "–" quando `null` (decisão 4 da TechSpec).
- Mín/máx arredondadas; layout não quebra com valores extremos (FR do PRD: dados extremos).

## Testes da Tarefa

- [x] Testes de unidade (`frontend/src/__tests__/WeeklyForecast.test.jsx`): renderiza 7 cards; primeiro com "Hoje" e classe `today`; data "16 ago" para o ISO dado; prob. de chuva com "%" e "–" quando `null`; ícone/cor por variante do mapa WMO.
- [x] Testes de integração: `WeeklyForecast` com `daily` sintético de 7 dias — rótulos/datas coerentes (format pt-BR), ícones/cores para todos os grupos WMO (sol, parcialmente nublado, nuvem, chuva, tempestade), mín/máx arredondadas, ordenação "hoje primeiro" preservada.
- [x] Teste de fumaça: **omitido** — componente ainda não montado no App; o fluxo visível é coberto pela fumaça da task 15.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Criar: `frontend/src/components/WeeklyForecast.jsx`, `frontend/src/components/DayCard.jsx`, `frontend/src/__tests__/WeeklyForecast.test.jsx`.
- Dependências já entregues: CSS portado (task 4), `Icon` (task 5), `format`/`weatherCodes` (task 7).
- Referência: `painel.html` (linhas 608–616, 672–681).
