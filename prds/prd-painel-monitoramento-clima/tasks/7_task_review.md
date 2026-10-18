# Review: Task 7.0 - SearchBar (busca com feedback de carregamento)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-17
**Arquivo da task**: 7_task.md
**Status**: APROVADO

## Resumo

Implementado o componente apresentacional `frontend/src/components/SearchBar.jsx` (FR-1 e FR-18 do PRD): campo de texto simples com label acessível + botão de busca, disparo da busca via submit do formulário (Enter ou botão) invocando `onSearch(city)` com o nome aparado, guarda contra campo vazio/só espaços, e estado `loading` que desabilita input e botão com feedback visual perceptível (rótulo "Buscando…" + `aria-busy`). Adicionados estilos `.search-bar*` em `frontend/src/index.css` (usando design tokens) e suíte de 10 testes de unidade em `frontend/src/__tests__/SearchBar.test.jsx`. Validação adicional via E2E de browser (MCP Playwright) com evidências em `task-screenshots/`. Suíte completa do frontend: 118/118 testes passando; backend: 45/45; lint limpo.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/components/SearchBar.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/SearchBar.test.jsx` | ✅ OK | 0 |
| `frontend/src/index.css` | ✅ OK | 0 (apenas bloco `.search-bar*` adicionado) |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. **Localização dos estilos** (`frontend/src/index.css`): a techspec atribui a `App.css` os "estilos do painel", mas este arquivo está vazio e não é importado por `main.jsx`; o bloco `.search-bar*` foi adicionado a `index.css`, que concentra as classes compartilhadas (`.btn`, `.input`, `.card`). Decisão deliberada para os estilos serem aplicados de fato. Sugestão: na Tarefa 8.0, ao montar a casca do painel, avaliar mover os estilos de componentes para `App.css` e importar o arquivo.
2. **Anúncio de carregamento para leitores de tela**: o feedback de loading é perceptível visualmente (rótulo do botão + `aria-busy`), mas não há região `role="status"`/`aria-live` anunciando a mudança. Opcional nesta tarefa (o requisito FR-18 é satisfeito); pode ser refinado na Tarefa 8.0 junto com o skeleton loading (FR-17).

## ✅ Destaques Positivos

- Componente 100% apresentacional: sem estado interno (input não controlado + `FormData`), apenas `onSearch` e `loading` por props — exatamente o contrato da task, sem acoplamento com o hook `useWeather`.
- Guarda de campo vazio/só espaços com early return e `trim()`, reforçada pelo atributo `required` (bloqueio nativo no browser validado via `checkValidity()` no E2E).
- Acessibilidade bem coberta: label associada por `htmlFor`/`id`, `role="search"` semântico, foco visível inequívoco (anel global `:focus-visible` verificado por screenshot), `aria-busy` no formulário.
- Estilos construídos exclusivamente sobre design tokens (`var(--space-*)`, `var(--color-*)`), sem valores mágicos.
- Testes de unidade completos (10 casos) cobrindo todos os critérios de sucesso, com descrições em PT-BR consistentes com as demais suítes do projeto.
- E2E de browser real (MCP Playwright) validou: foco por teclado (Tab → input), submit por Enter invocando o callback, campo só-espaços não disparando, estado loading (disabled + "Buscando…" + `aria-busy=true`) — com screenshots de evidência.

## Nota de Metodologia (E2E)

O componente ainda não está integrado ao `App.jsx` (integração acontece na Tarefa 8.0). Para a validação de browser, usou-se um harness temporário em `App.jsx` (mount do `SearchBar` com callback visível e toggle de loading), executado via MCP Playwright contra o dev server Vite (iniciado por esta task; mantido rodando conforme a política de service readiness). O harness foi **totalmente revertido** após o E2E — `git diff` de `App.jsx` está vazio.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ (camelCase, funções com verbo, early return, sem magic numbers, máx. 2 níveis de aninhamento, sem linhas em branco dentro de métodos) |
| Linguagem/Runtime | ✅ (ESM no frontend; `import React` explícito exigido pelo runtime JSX do projeto, consistente com `App.jsx`) |
| REST/HTTP | ✅ (não aplicável — componente apresentacional, sem rede) |
| Logging | ✅ (não aplicável) |
| Framework UI | ✅ (React 19, classes de design system existentes, CSS puro com tokens, sem nova dependência) |
| Testes | ✅ (10 testes de unidade passando; E2E de browser executado; suíte completa verde) |

## Recomendações

1. Na Tarefa 8.0: integrar `<SearchBar onSearch={search} loading={status === 'loading'} />` no `App.jsx` conectando ao hook `useWeather`, e avaliar a organização final dos estilos (`App.css` vs `index.css`).
2. Na Tarefa 8.0/13.0: considerar região `role="status"` para anúncio de loading por leitor de tela e adicionar o botão de geolocalização ao lado do campo.
3. Na Tarefa 13.0: reutilizar o mesmo padrão de disabled/loading ao habilitar o botão de geolocalização.

## Veredito

**APROVADO.** Todos os requisitos e critérios de sucesso da task foram implementados e testados (unidade + E2E de browser), os `<critical>` foram respeitados (PRD/TechSpec lidos; testes da tarefa criados e executados antes da finalização; sem comentários no código novo — D13), e a suíte completa do projeto está verde. Nenhum bloqueio para a Tarefa 8.0.
