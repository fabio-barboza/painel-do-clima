# Review: Task 12.0 - WeeklyForecast (7 dias)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-18
**Arquivo da task**: 12_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Implementado o componente `WeeklyForecast.jsx` com os 7 cards comparativos de previsão semanal (FR-10/FR-11/FR-12): dia em PT-BR (`formatDayPt`), ícone animado por categoria do `weather_code`, temperatura mín/máx, **barra de intervalo mín/máx posicionada em escala compartilhada da semana** (mínima da semana em 0%, máxima em 100%) e **mini-barra de chuva proporcional ao maior volume da semana**. View model `daily7` derivada em `utils/weatherCode.js` (mesmo padrão de `deriveCurrent`/`deriveHourly24`), integrada à área de sucesso do `App.jsx`, com 14 testes de unidade novos e validação E2E real via browser MCP (busca "Curitiba" com dados reais da Open-Meteo) nos 3 breakpoints, com screenshots em `task-screenshots/`. Durante a validação E2E foi detectado e corrigido um bug de layout introduzido pela primeira versão da task: a grade de 7 colunas em ≥1024px estourava a trilha da `panel-grid` (`min-width: auto` dos itens de grid) e colapsava o gráfico de 24h para 76px; a correção (colunas 2/3/3 + `min-width: 0` nos cards) foi validada de novo no browser.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/components/WeeklyForecast.jsx` (novo) | ✅ OK | 0 |
| `frontend/src/utils/weatherCode.js` (modificado — `deriveDaily7`) | ✅ OK | 0 |
| `frontend/src/App.jsx` (modificado — integração) | ✅ OK | 0 |
| `frontend/src/App.css` (modificado — estilos `.weekly-*`) | ✅ OK | 0 |
| `frontend/src/index.css` (modificado — `min-width: 0` em `.card`) | ✅ OK | 0 |
| `frontend/src/__tests__/WeeklyForecast.test.jsx` (novo) | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado. (Observações pré-existentes, fora do escopo desta task, listadas abaixo como menores para triagem futura.)

### 🟢 Problemas Menores

1. **Pré-existente (task 11) — `--color-rain` indefinido**: `HourlyChart.jsx` usa `fill="var(--color-rain)"` nas barras de precipitação, mas o token `--color-rain` não existe em `frontend/src/index.css`. Com `var()` sem fallback, o `fill` cai para o valor inicial (preto), comprometendo a identidade visual nas barras de chuva. Não foi introduzido nem agravado por esta task (na validação E2E as barras estavam vazias por precipitação 0 no período, o que mascarou o defeito). Sugestão: definir `--color-rain` nos três blocos de tema em follow-up.
2. **`prds/.../task-screenshots` / artefatos de ferramenta**: o diretório `.playwright-mcp/` (snapshots e logs do MCP) foi gerado na raiz do projeto pela validação E2E e ainda não está no `.gitignore`. Incluir na task 17 (revisão final do `.gitignore`).
3. **Quebra de linha das temperaturas em desktop ~1024–1200px**: com a seção semanal ocupando 1/3 da `panel-grid` (≈300px), os cards têm ~100px e a linha mín/máx pode quebrar em duas linhas em larguras intermediárias. É o trade-off aceitado para caber 3 cards por linha sem estourar o layout (`white-space: nowrap` foi removido para permitir a degradação graciosa); em 1440px+ e em tablet/mobile o visual está íntegro (screenshots `task-12-weekly-forecast-*.png`).

## ✅ Destaques Positivos

- Barra de intervalo em **escala compartilhada da semana** — comparabilidade visual direta entre os dias (mínima da semana ancora em 0%, máxima em 100%), exatamente o padrão esperado para "indicadores gráficos simples" (FR-11), com casos degenerados tratados (semana plana → barras cheias; valores ausentes → fallback).
- Chuva comparável (FR-12) com mini-barra proporcional ao pico da semana + valor textual em mm — dupla codificação (visual + número).
- Acessibilidade completa: `role="img"` com `aria-label` descritivo nos dois indicadores gráficos de cada card ("Variação de temperatura de X a Y em <dia>" / "Chuva prevista de Z em <dia>") + tabela `visually-hidden` com os 7 dias, no mesmo padrão do `HourlyChart` — atende o requisito do PRD de labels nos indicadores de mín/máx.
- Estrutura semântica (`ul`/`li` para os cards) e defesa contra dados ausentes/incompletos nos helpers puros.
- Testes determinísticos cobrindo as posições exatas das barras (left/width em %), a proporcionalidade da chuva (ordenação entre os 7 dias), os ícones por categoria, os labels acessíveis, o estado vazio e os breakpoints — 14 testes novos, suíte total 200/200 verde.
- E2E real (dados da Open-Meteo) em 3 breakpoints, com evidências em `prds/prd-painel-monitoramento-clima/task-screenshots/` e zero erros de console.
- `deriveDaily7` segue exatamente o padrão das view models existentes (`deriveCurrent`, `deriveHourly24`), mantido em `utils/weatherCode.js` conforme o TechSpec.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ (camelCase, funções com verbo, early returns, sem flags booleanas, métodos < 50 linhas, sem comentários — D13) |
| Linguagem/Runtime | ✅ (frontend ESM; tokens de design, sem cores hardcoded) |
| REST/HTTP | ✅ (n/a — componente puramente de renderização; dados vêm via `useWeather`/`weatherApi` já validados) |
| Logging | ✅ (n/a) |
| Framework UI | ✅ (React 19, CSS puro com custom properties, responsivo 640/1024 nos mesmos breakpoints da fundação) |
| Testes | ✅ (200/200 passando; lint limpo; build OK; E2E browser MCP executada) |

## Recomendações

1. (Task 17 / follow-up) Definir o token `--color-rain` nos três temas em `index.css` (ou trocar o `fill` do `HourlyChart` por token existente) para corrigir as barras de precipitação — ver Problema Menor 1.
2. (Task 17) Adicionar `.playwright-mcp/` ao `.gitignore`.
3. (Opcional, evolução futura) Em telas muito estreitas, avaliar variante horizontal dos cards (estilo "weather app") para ganhar espaço à barra de intervalo — fora do escopo desta versão.

## Veredito

**APROVADO COM OBSERVAÇÕES.** Todos os critérios de sucesso da task estão cumpridos e validados (7 cards com dia PT-BR, barra de intervalo refletindo a variação mín/máx em escala da semana, chuva visível e comparável, ícone por categoria, labels acessíveis, responsivo nos 3 contextos, suíte 200/200 verde, E2E real com screenshots, sem comentários no código novo). Nenhuma ação bloqueante para esta task; as observações são pré-existentes ou de polimento e já estão roteadas para as tasks 17 / follow-up.
