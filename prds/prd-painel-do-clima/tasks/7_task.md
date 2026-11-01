# Tarefa 7.0: Funções puras de domínio: lib/format, lib/weatherCodes e lib/chart

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementa as funções puras que todo o frontend consome — sem React e sem DOM: formatação pt-BR de tempo/datas/números (`lib/format.js`), mapa WMO → rótulo/ícone/cor/tint + faixas de UV + cardinais do vento (`lib/weatherCodes.js`) e a geometria do gráfico por hora (`lib/chart.js`: escalas, Catmull-Rom idêntico ao protótipo, alturas das barras de precipitação). São a base das tasks 9–13.

## Requisitos atendidos (FR)

- **FR-22** — faixas qualitativas do UV (WHO) e direção do vento em pontos cardeais.
- **FR-23** — alturas das barras de precipitação (regra e teto de 28 % do plot).
- **FR-24** — escalas do gráfico e geometria do marcador "agora".
- **FR-27** — rótulos de dia ("Hoje"/"Seg"…) e datas curtas ("16 ago").
- **FR-31** — grupos de tint (clear/cloudy/rain por código WMO).
- **FR-38** — datas/números formatados no locale pt-BR.

## Subtarefas

- [x] 7.1 Criar `frontend/src/lib/format.js`: `formatTimeFromIso(iso)` → `'HH:MM'` (slice direto do ISO local da cidade — **sem** passar por `Date` do viewer); `formatDayLabel(dateIso, index)` → `'Hoje'` (index 0) ou weekday curto pt-BR sem ponto, inicial maiúscula; `formatShortDate(dateIso)` → `'16 ago'` (array fixo de meses pt-BR — decisão 9 da TechSpec, `Intl` insere "de"); `formatNumber(value, digits = 0)` → pt-BR (vírgula decimal).
- [x] 7.2 Criar `frontend/src/lib/weatherCodes.js`: `weatherCodeInfo(code)` → `{ label, icon, color, tint }` cobrindo **toda** a tabela WMO da TechSpec (fallback defensivo: código desconhecido → `cloud`/"Nublado"/cloudy); `uvLabel(value)` → `'Baixo' | 'Moderado' | 'Alto' | 'Muito Alto' | 'Extremo'` (faixas WHO 0–2/3–5/6–7/8–10/11+); `windCardinal(deg)` → 16 pontos pt-BR (índice `round(deg/22.5) % 16`).
- [x] 7.3 Criar `frontend/src/lib/chart.js`: `computeScales(temps)` → `{ tMin, tMax, step, X(i), Y(t) }` (tMin/tMax múltiplos de 4; `X(0)=44`, `X(23)=744`; mesma geometria do protótipo: W=760, H=300, PL=44, PR=16, PT=26, PB=42); `smoothPath(points)` → string Catmull-Rom **idêntica** à do protótipo (controle /6, `toFixed(1)`); `rainBarHeights(precips)` → alturas pela regra dos acréscimos (`max(2, (p/pMax)×(H−PT−PB)×0.28)`, `pMax = max(precip, 1)×1.25`; `p=0` → sem barra).
- [x] 7.4 Testes (unidade + integração).

## Detalhes de Implementação

Ver `techspec.md`: "Interfaces Principais → Frontend" (assinaturas exatas das três libs), "Modelos de Dados" (tabela completa WMO → condição/ícone/cor/tint; derivações das barras), "Animações e interações → Gráfico" (geometria e stagger), "Decisões Principais" (item 9 — meses em array fixo).

## Critérios de Sucesso

- Mapa WMO completo (todos os códigos da tabela da TechSpec, incluindo 45/48, 56/57, 66/67, 71–77, 85/86, 95/96/99) + fallback de código desconhecido; faixas UV exatamente WHO; 16 cardinais (0→N, 22.5→NNE, 90→L, 315→NO).
- Formatação pt-BR: "16 ago" (sem "de"), "Hoje" no índice 0, weekday "Seg" sem ponto, "HH:MM" por slice do ISO local da cidade, números com vírgula decimal.
- Geometria do gráfico: tMin/tMax múltiplos de 4; `X(0)=44` e `X(23)=744`; `smoothPath` produz 1 `M` + 23 curvas `C` para 24 pontos e é idempotente com pontos colineares; `rainBarHeights`: `p=0` → sem barra, `p>0` ≥ 2 px, teto 28 % do plot, piso `pMax` 1 mm.
- Todas as funções puras (determinísticas, sem DOM, sem `Date` global em `formatTimeFromIso`).

## Testes da Tarefa

- [x] Testes de unidade (`frontend/src/__tests__/format.test.js`, `weatherCodes.test.js`, `chart.test.js`): casos da TechSpec — UV (2.9→Moderado, 5→Moderado, 6→Alto, 8→Muito Alto, 11→Extremo); cardinais (0/22.5/90/315); `formatShortDate` ("2026-10-16"→"16 ago"); `formatDayLabel` (índice 0→"Hoje", segunda→"Seg"); `formatTimeFromIso`; escalas e `X(0)`/`X(23)`; estrutura do `smoothPath`; `rainBarHeights` (zero, mínimo, teto, piso de `pMax`).
- [x] Testes de integração: composição das 3 libs sobre um payload sintético (24 h + 7 dias) — `weatherCodeInfo` → icon/tint por código, `formatDayLabel`/`formatShortDate` → rótulos dos dias, `computeScales`/`rainBarHeights` → entradas coerentes para o `HourlyChart` (task 12).
- [x] Teste de fumaça: **omitido** — funções puras sem artefato executável; o fluxo visível é coberto pelas tasks de componentes (10–13) e pela orquestração (task 15).

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Criar: `frontend/src/lib/format.js`, `frontend/src/lib/weatherCodes.js`, `frontend/src/lib/chart.js`, `frontend/src/__tests__/format.test.js`, `frontend/src/__tests__/weatherCodes.test.js`, `frontend/src/__tests__/chart.test.js`.
- Referência: `painel.html` (linhas 683–699 — geometria e Catmull-Rom a reproduzir).
