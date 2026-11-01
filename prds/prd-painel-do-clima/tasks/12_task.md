# Tarefa 12.0: HourlyChart (gráfico por hora interativo + barras de precipitação)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementa o card "Previsão por hora": gráfico SVG **puro** (sem biblioteca) com a geometria, eixos, animação de entrada e tooltip exatos do protótipo, mais os dois acréscimos mandados pelo PRD — barras de precipitação na base do gráfico e a segunda série na legenda. Consome as funções puras de `lib/chart.js` (task 7).

## Requisitos atendidos (FR)

- **FR-23** — temperatura em linha (estilo do protótipo) **e** precipitação em barras na base do mesmo gráfico, com legenda das duas séries.
- **FR-24** — destaque do horário atual (marcador "agora" com o estilo do protótipo, na hora corrente — janela rolante, índice 0).
- **FR-25** — tooltip ao passar o mouse (desktop) ou tocar/deslizar (mobile) com hora, temperatura e precipitação; some ao afastar/soltar.
- **FR-26** — animação de entrada (traçado da linha, pontos em sequência) no estilo do protótipo; desativada com `prefers-reduced-motion`.

## Referência visual (painel.html)

- **`section.card#chartCard`, linhas 559–569** — `.card-head` (h2 "Previsão por hora" + `.sub` "Temperatura ao longo do dia" + chip `.chip.plain` com `.dotline` "Temperatura (°C)"), `.chart-wrap` (o SVG é injetado aqui), `.chart-hint` "Passe o mouse ou toque no gráfico para ver os detalhes".
- **JS do gráfico, linhas 683–804** — geometria (W=760, H=300, PL=44, PR=16, PT=26, PB=42; tMin/tMax múltiplos de 4; `X(i)`/`Y(t)`), `smooth` Catmull-Rom (controle /6), grid-lines + axis-labels (temperatura a cada 4 °C; horas a cada 3; label "agora" em `--cyan`), gradientes `lineGrad` (cyan→violet) e `areaGrad`, `.area-path`, `.line-path`, 24 `.pt` (stagger 45 ms), `now-line`/`now-ring`/`now-dot` (âmbar), `guide`/`hoverdot`/`.tip` (tooltip: clamp lateral 56 px, `translate(-50%,-135%)`, conteúdo `HHh · <b>T °C</b>` (+ `· agora`)), eventos `mousemove`/`mouseleave`/`touchstart`/`touchmove` (passive)/`touchend`, animação de entrada (`getTotalLength` + `stroke-dasharray/dashoffset`, transição 1.8 s `cubic-bezier(.4,0,.2,1)` .25 s, disparo por interseção — linhas 842–843) e reduced motion → tudo visível imediatamente.

## Subtarefas

- [x] 12.1 Criar `frontend/src/components/HourlyChart.jsx`: `section.card` com `card-head` (h2 + `.sub` + **2 chips** de legenda), `.chart-wrap` com o SVG de estrutura idêntica às linhas 718–738 (`defs` com `lineGrad`/`areaGrad`, grid-lines, x-labels, `.area-path`, `.line-path`, `now-line`/`now-ring`/`now-dot`, 24 `.pt` com `data-i` e stagger, `guide`, `hoverdot`) + `.tip` + `.chart-hint`; props `{ hourly: Hourly24, nowIndex = 0 }`; consome `computeScales`/`smoothPath`/`rainBarHeights` (task 7); `role="img"` + `aria-label="Gráfico de temperatura e precipitação por hora"`.
- [x] 12.2 Barras de precipitação (FR-23): `rect.rain-bar` por hora **atrás da linha** — largura `max(6, round(step×0.42))` px, x centrado em `X(i)`, `rx:2`, altura via `rainBarHeights`, `fill:#7cc4ff` (cor existente do protótipo), `opacity:.5`, surgindo com o mesmo stagger de 45 ms/hora dos pontos (imediata com reduced motion); segunda chip de legenda no `card-head`: `.chip.plain` com `.dotline.rain` e texto "Precipitação (mm)".
- [x] 12.3 Interações (FR-25): `mousemove`/`mouseleave` + `touchstart`/`touchmove` (passive)/`touchend` no SVG; índice = `round((px−PL)/step)` clampado a 0..23; guias verticais tracejadas + `hoverdot` + tooltip `.tip` (`HHh · <b>T °C</b> · P mm`, + `· agora` no índice 0; clamp lateral 56 px); tooltip esconde ao sair/soltar.
- [x] 12.4 Animação de entrada (FR-26): linha via `stroke-dasharray/dashoffset` (`getTotalLength()`), `.area-path.show`, `.pt.show` com stagger; disparo quando o card intersecta a viewport (IO one-shot via `useReveal`); repete a cada nova busca (remontagem por `key` — task 15); reduced motion → tudo visível sem dash.
- [x] 12.5 Modificar `frontend/src/index.css` — **apêndice ao bloco 2**: `.rain-bar` e `.dotline.rain { background:#7cc4ff }` — apenas cores/existentes, sem novos tokens.
- [x] 12.6 Testes (unidade + integração).

## Detalhes de Implementação

Ver `techspec.md`: "Componentização" (linha `section.card#chartCard` + JS do gráfico), "Acréscimos → Barras de precipitação no gráfico (FR-23)" (regras exatas), "Animações e interações → Gráfico (FR-26)" e "→ Interatividade do gráfico (FR-25)", "Interfaces" (`HourlyChart({ hourly, nowIndex = 0 })`), "Riscos" (jsdom sem SVG layout — stubs `getTotalLength`/IO no setup, task 8).

## Critérios de Sucesso

- **A seção fica idêntica ao trecho de linhas 559–569 + 683–804 do `painel.html`** — mesma estrutura do card (`.card-head` com h2/`.sub`, `.chart-wrap`, `.chart-hint`), mesmo SVG (classes `.grid-line`, `.axis-label`, `.now-label`, `.line-path`, `.area-path`, `.pt`, `.now-line`, `.now-ring`, `.now-dot`, `.guide`, `.hoverdot`, `.tip`; gradientes idênticos; eixos com a cada 4 °C e horas a cada 3; stagger 45 ms) e mesmas interações/animações (tooltip, "agora", traçado da linha, reveal por interseção; reduced motion → visível imediatamente) — **com dados 100 % do `hourly` da resposta do backend** (FR-35): nenhum valor do array `HOURLY` do protótipo fixo no código; diferenças autorizadas: barras + 2ª chip de legenda (mandadas pelo PRD).
- SVG com exatamente 24 `.pt`; `X(0)=44`, `X(23)=744`; tMin/tMax múltiplos de 4.
- Marcador "agora" (linha tracejada + ring + dot) no índice 0 (FR-24); label "agora" no eixo.
- Tooltip: aparece em `mousemove`/`touchstart`, conteúdo com hora/temperatura/precipitação em pt-BR, esconde em `mouseleave`/`touchend` (FR-25).
- Barras: 1 por hora com `p>0` (nenhuma para `p=0`), altura ≤ 28 % do plot, atrás da linha (FR-23).
- Animação de entrada dispara por interseção e reinicia na remontagem (nova busca) (FR-26).

## Testes da Tarefa

- [x] Testes de unidade (`frontend/src/__tests__/HourlyChart.test.jsx`): SVG com 24 `.pt` e rótulos de hora corretos (a cada 3 + "agora"); marcador "agora" no índice 0; barras `rain-bar` conforme `rainBarHeights` (0 → sem barra; teto 28 %); legenda com 2 chips ("Temperatura (°C)" e "Precipitação (mm)").
- [x] Testes de integração: hover — `mousemove` no SVG (stubs de `getBoundingClientRect`/`getTotalLength`) mostra `.tip` com hora/temperatura/precipitação e `guide`/`hoverdot` visíveis; `mouseleave` esconde; `touchstart`/`touchend` fazem o mesmo; remontagem com novos dados reinicia a animação de entrada (classe de presença re-aparece); reduced motion → sem dash, tudo visível.
- [x] Teste de fumaça: **omitido** — componente ainda não montado no App; o fluxo visível (gráfico interativo no painel carregado) é coberto pela fumaça da task 15.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Criar: `frontend/src/components/HourlyChart.jsx`, `frontend/src/__tests__/HourlyChart.test.jsx`.
- Modificar: `frontend/src/index.css` (apêndice bloco 2: `.rain-bar`, `.dotline.rain`).
- Dependências já entregues: CSS portado (task 4), `Icon`/`Reveal`/`useReveal` (task 5), `lib/chart` (task 7).
- Referência: `painel.html` (linhas 559–569, 683–804, 842–843).
