# Review: Task 13.0 - Geolocalização (locate + botão + erros de permissão)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-18
**Arquivo da task**: 13_task.md
**Status**: APROVADO

## Resumo

Implementada a geolocalização completa (FR-13/FR-14): `locate()` no hook `useWeather` usando `navigator.geolocation.getCurrentPosition` com sucesso → `fetchWeather({ lat, lon })` (fluxo D3, sem geocoding); falhas de permissão/indisponibilidade/tempo esgotado e ausência de API de geolocalização → estado `error` com tipo `geolocation` e mensagem amigável orientando a busca manual (busca por cidade permanece intacta); botão acessível no `SearchBar` (ícone SVG próprio, `aria-label`, foco visível global, navegação por teclado) ligado ao `App.jsx` via `onLocate`. A guarda contra resposta obsoleta (D12) cobre o fluxo de geolocalização. Sem comentários em código novo (D13). Validado com testes de unidade (211 passando no frontend, 45 no backend), lint limpo e E2E real em navegador via Playwright MCP (geolocalização permitida → painel "Sua localização"; negada → mensagem amigável + busca manual funcional; teclado: foco + Enter dispara o fluxo).

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| frontend/src/hooks/useWeather.js | ✅ OK | 0 |
| frontend/src/components/SearchBar.jsx | ✅ OK | 0 |
| frontend/src/components/ErrorState.jsx | ✅ OK | 0 |
| frontend/src/App.jsx | ✅ OK | 0 |
| frontend/src/index.css | ✅ OK | 0 |
| frontend/src/__tests__/useWeather.test.js | ✅ OK | 0 |
| frontend/src/__tests__/SearchBar.test.jsx | ✅ OK | 0 |
| frontend/src/__tests__/ErrorState.test.jsx | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. **Mensagem amigável duplicada em dois módulos** — `GEOLOCATION_ERROR_MESSAGE` em `useWeather.js` e o texto correspondente em `ERROR_CONTENT.geolocation.message` em `ErrorState.jsx` são cópias da mesma frase. Se um mudar, o outro deve mudar junto. Sugestão: exportar a constante do hook (ou de um módulo de mensagens) e reutilizar no `ErrorState`.
2. **`onLocate` sem guarda em `SearchBar`** — `onClick={onLocate}` lança `TypeError` se um consumidor não passar a prop. O `App.jsx` sempre a fornece e o padrão espelha o `onSearch` existente; aceitável para o scaffold, mas uma guarda `onLocate?.()` tornaria o componente mais defensivo.

## ✅ Destaques Positivos

- **Guarda de obsoletas (D12) aplicada também à geolocalização**: o `requestId` é checado nos três caminhos (sucesso do fetch, falha do fetch e falha da permissão), cobrindo o caso extremo "nova busca durante carregamento da anterior" — inclusive a sequência locate → search manual → geolocalização resolve após.
- **Cobertura de testes completa do fluxo**: 6 testes novos no hook (permitida → coordenadas na URL, loading, negada, API ausente no browser, falha do fetch pós-sucesso, obsoleta) e 4 no componente (presença/acessibilidade, clique, disabled durante loading, habilitado), além do teste do `ErrorState` para o novo tipo.
- **Acessibilidade real e validada em navegador**: botão nativo (Enter/Space), `aria-label` + `title`, ícone `aria-hidden`/`focusable="false"`, foco visível via `:focus-visible` global; teste E2E confirmou foco + Enter disparando o fluxo.
- **Tratamento do caso "API ausente"** (`!navigator.geolocation`) além dos três códigos de erro do Geolocation API — cobre o cenário de contexto não seguro do PRD.
- **E2E executado com as APIs reais** (Open-Meteo via backend): 200 com `location` sem `name` renderizando "Sua localização", negada com mensagem amigável e busca manual pós-negação funcionando.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ (sem comentários no código novo — D13; constantes nomeadas; camelCase; funções < 50 linhas; sem flags booleanais) |
| Linguagem/Runtime | ✅ (frontend ESM, sem importações de serviços externos — geolocalização via API do navegador, dados via backend) |
| REST/HTTP | ✅ (reuso de `fetchWeather` com `cache: 'no-store'; lat/lon no mesmo endpoint D3) |
| Logging | ✅ (N/A) |
| Framework UI | ✅ (React 19, hooks existentes, SVG próprio sem biblioteca de ícones — D6) |
| Testes | ✅ (211 frontend + 45 backend passando; lint limpo; E2E browser via Playwright MCP) |

## Recomendações

1. Centralizar a mensagem amigável de geolocalização em uma única constante exportada (elimina a duplicação entre `useWeather.js` e `ErrorState.jsx`).
2. Adicionar guarda `onLocate?.()` no `SearchBar` (defensividade; baixo custo).
3. Nas tasks E2E (16.0), cobrir com Playwright os dois cenários de geolocalização validados aqui (permitida com `setGeolocation` + negada), para regressão automatizada.

## Observações de Ambiente

Durante o E2E, o dev server Vite (já em execução na porta 5173) estava servindo transforms obsoletos de `useWeather.js` e `WeeklyForecast.jsx` (estado intermediário de runs anteriores). O problema foi restabelecido tocando os arquivos-fonte para forçar re-transform (nenhum serviço foi reiniciado nem modificado); após isso, todos os cenários E2E passaram com console limpo.

## Evidências (screenshots)

- `prds/prd-painel-monitoramento-clima/task-screenshots/task-13-locate-success.png` — geolocalização permitida: painel "Sua localização" com condições atuais, gráfico 24h e 7 dias (curtidas reais via `?lat=&lon=`).
- `prds/prd-painel-monitoramento-clima/task-screenshots/task-13-geolocation-denied.png` — permissão negada: alerta "Localização indisponível" com mensagem amigável orientando a busca manual.
- `prds/prd-painel-monitoramento-clima/task-screenshots/task-13-manual-search-after-denied.png` — busca manual por "São Paulo" funcionando após a negação (FR-14).

## Veredito

**APROVADO.** Todos os requisitos e critérios de sucesso da task estão implementados e testados: unidade (hook + componente + estado de erro), E2E real em navegador (fluxos permitido/negado/manual + teclado) e suíte completa verde (frontend 211/211, backend 45/45, lint sem achados). As observações menores são de refinamento e não bloqueiam a conclusão. Próximo passo: tasks 14.0–16.0 (E2E Playwright), que devem automatizar os cenários de geolocalização validados aqui.
