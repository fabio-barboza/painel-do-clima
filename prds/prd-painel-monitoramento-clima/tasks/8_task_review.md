# Review: Task 8.0 - Casca do painel (App, Skeletons, ErrorState)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-17
**Arquivo da task**: 8_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Implementada a casca do painel: `App.jsx` orquestra os quatro estados da busca via `useWeather` (idle → loading → error → success), aplica o tema dinâmico na raiz via `data-theme = getTheme(categorizeWeatherCode(current.weather_code))` apenas no estado de sucesso, e monta o layout semântico (header com título + SearchBar, main com área de conteúdo). `Skeletons.jsx` cobre o FR-17 com skeletons dos 3 cards (atuais, gráfico, semana) usando os estilos base da Tarefa 4.0 e anunciando o carregamento a leitores de tela (`role="status"`). `ErrorState.jsx` cobre FR-15/FR-16 com mensagem amigável por tipo de erro (`city_not_found` orienta nova tentativa sem retry; `network`/`invalid` exibem "Tentar novamente" que reexecuta a última busca via `onRetry`). O painel é a própria aplicação na rota `/` (FR-4, sem telas intermediárias). Validação dupla: 133 testes do frontend + 45 do backend em verde, lint limpo e E2E de browser via MCP Playwright com o stack real (frontend Vite 5173 + backend 3000 + APIs Open-Meteo reais) — idle, sucesso com tema, cidade não encontrada e falha de rede com retry reexecutando a busca foram confirmados no navegador, com screenshots de evidência.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| frontend/src/App.jsx | ✅ OK | 0 |
| frontend/src/App.css | ✅ OK | 0 |
| frontend/src/components/Skeletons.jsx | ✅ OK | 0 |
| frontend/src/components/ErrorState.jsx | ✅ OK | 0 |
| frontend/src/__tests__/App.test.jsx | ✅ OK | 1 menor |
| frontend/src/__tests__/Skeletons.test.jsx | ✅ OK | 1 menor |
| frontend/src/__tests__/ErrorState.test.jsx | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. **frontend/src/__tests__/App.test.jsx (helper `getShell`)** — o teste localiza a raiz do tema por seletor de classe (`document.querySelector('.app-shell')`), acoplando o teste à implementação. Funciona bem para o escopo, mas uma `data-testid` na raiz do `App` tornaria a verificação do `data-theme` mais estável frente a renomeações. Não bloqueia.
2. **frontend/src/__tests__/Skeletons.test.jsx (contagens exatas)** — as asserções usam contagens exatas de `.skeleton-heading` (3) e `.skeleton-text` (5). São válidas hoje, mas qualquer ajuste fino no número de placeholders exigirá atualizar o teste; `toBeGreaterThanOrEqual` seria mais resiliente. Não bloqueia.

## ✅ Destaques Positivos

- **Tema dinâmico exatamente conforme a techspec**: `data-theme` aplicado na raiz apenas no estado de sucesso, derivado de `getTheme(categorizeWeatherCode(current.weather_code))`, com fallback defensivo (`?? 'cloudy'` nas utilidades) quando o `weather_code` ausente.
- **Retry sem duplicação de estado**: a última busca é guardada em `useRef` e o `onRetry` reexecuta exatamente o que o usuário buscou — validado por teste de integração (segunda chamada ao fetch com a mesma URL) e por E2E real no browser.
- **Mapeamento de erros fiel ao PRD**: `city_not_found` orienta nova tentativa com a busca continuando habilitada (sem retry inútil da mesma cidade), enquanto `network`/`invalid` oferecem "Tentar novamente" — correspondência exata com a tabela de casos extremos do PRD.
- **Acessibilidade sólida**: estrutura semântica (`header`/`h1`/`main`/`section`), `role="status"` com label para o skeleton, `role="alert"` para o erro, hierarquia de headings correta (h1 página → h2 cidade/título do erro → h3 cards), foco visível via tokens existentes.
- **Evidência E2E com stack real**: os quatro estados foram observados no navegador com dados reais da Open-Meteo, incluindo o fluxo de retry (falha de rede simulada em contexto de página → "Tentar novamente" → sucesso com tema).
- **D13 respeitado**: nenhum comentário em nenhum arquivo novo/modificado.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Linguagem/Runtime | ✅ (ESM no frontend, camelCase, arquivos em `__tests__/`) |
| REST/HTTP | ✅ (nenhuma mudança de contrato; `fetch` continua com `cache: 'no-store'` no cliente existente) |
| Logging | ✅ (N/A — frontend sem logs) |
| Framework UI | ✅ (CSS puro com tokens/custom properties da Tarefa 4.0, `data-theme`) |
| Testes | ✅ (133 frontend + 45 backend passando; lint limpo; E2E de browser executado) |

## Recomendações

1. (Tarefas 9.0–12.0) Ao preencher as cards reservadas, manter os `aria-labelledby` existentes e substituir os placeholders sem remover os títulos de seção — os testes de integração do `App` já os assertam por nome de heading.
2. (Opcional) Adotar `data-testid` na raiz do painel para desacoplar as asserções de tema dos testes.
3. (Tarefa 13.0) O fallback `'Sua localização'` no `SuccessContent` já prepara o fluxo `lat/lon` de geolocalização — ao implementar `locate()`, o nome não será necessário.

## Veredito

**APROVADO COM OBSERVAÇÕES.** Todos os requisitos e critérios de sucesso da task estão implementados e testados: painel direto em `/`, skeleton no loading, mensagem amigável por tipo de erro com retry funcional, tema dinâmico no sucesso, busca visível no idle, estrutura semântica acessível, suíte completa verde e sem comentários em código novo. As duas observações menores são melhorias cosméticas de resiliência de teste e não bloqueiam o avanço para a Tarefa 9.0 (WeatherIcon).
