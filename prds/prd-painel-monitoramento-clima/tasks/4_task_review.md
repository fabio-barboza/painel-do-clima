# Review: Task 4.0 - Fundação de design (HTML pt-BR, tokens, temas, skeletons)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-17
**Arquivo da task**: 4_task.md
**Status**: APROVADO

## Resumo

Implementada a fundação visual do frontend: `frontend/index.html` com `lang="pt-BR"`, título "Painel do Clima" e meta description; `frontend/src/index.css` com o sistema de design completo em CSS puro (decisão D7) — design tokens como custom properties (cores, tipografia, espaçamentos, raios, sombras), tema base `clear` aplicado em `:root` + temas `cloudy` e `rain` via `data-theme`, estilos de skeleton com animação de pulso (com respeito a `prefers-reduced-motion`) e fundação responsiva mobile-first (1 coluna < 640px, 2 colunas ≥ 640px, 3 colunas ≥ 1024px). Foram criados 2 arquivos de teste com 73 novas asserções; suíte total verde (74 testes) e `npm run lint` passando. Os 3 temas e os breakpoints foram validados visualmente no dev server via MCP Playwright, com evidências em `task-screenshots/`. Nenhum problema crítico ou maior encontrado.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/index.html` | ✅ OK | 0 |
| `frontend/src/index.css` | ✅ OK | 0 |
| `frontend/src/__tests__/designTokens.test.js` | ✅ OK | 0 |
| `frontend/src/__tests__/indexHtml.test.js` | ✅ OK | 0 |
| `frontend/eslint.config.js` | ✅ OK | 0 (correção de falha de lint pré-existente) |
| `frontend/src/__tests__/App.test.jsx` | ✅ OK | 0 (remoção de import não utilizado, pré-existente) |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. **`frontend/src/index.css` (screenshots)** — as capturas de tela mostram área vazia na parte superior da página porque `#root` tem `min-height: 100vh` e o `App.jsx` ainda é placeholder (a casca do painel chega na Tarefa 8.0). Não é defeito do CSS; a Tarefa 8.0 deve validar o layout com o painel real preenchido.
2. **`frontend/src/index.css` (`.btn:hover`)** — o hover usa `filter: brightness(1.08)`. No tema `rain` (primária clara `#4da3ff`) o clareamento reduz levemente o contraste do texto sobre o botão, mas permanece acima de 4.5:1. Aceitável; monitorar no QA visual.

## ✅ Destaques Positivos

1. **Contraste WCAG 2.1 AA verificado por tema** (tokens fixos por tema, conforme mitigação de risco da techspec): `clear` — texto `#0f2b46` sobre `#e8f4fd` ≈ 12.3:1, sobre surface `#ffffff` ≈ 15:1, muted ≈ 7:1, botão `#1565c0` com texto branco ≈ 5.75:1; `cloudy` — texto ≈ 12:1, muted ≈ 7.2:1, botão `#44586e` com branco ≈ 7.3:1; `rain` — texto `#e6eef7` sobre `#0f1b2d` ≈ 14.8:1, sobre surface `#16263c` ≈ 13:1, muted ≈ 7.9:1, botão `#4da3ff` com texto `#0f1b2d` ≈ 6.6:1.
2. **Foco visível e inequívoco**: regra global `:focus-visible` com outline de 3px na cor do token `--color-focus` (específico por tema — validado no browser: `3px solid rgb(13, 71, 161)` no tema clear).
3. **Acessibilidade de movimento**: animações do skeleton desativadas sob `prefers-reduced-motion: reduce`.
4. **`color-scheme` por tema** (`light` para clear/cloudy, `dark` para rain) — controles nativos e rolagem seguem o tema.
5. **Testes determinísticos e baratos**: asserções sobre o conteúdo do CSS/HTML (69 + 4 testes) cobrem tokens, seletores dos 3 temas, skeleton, breakpoints e foco, sem depender de snapshot frágil.
6. **Utilitários de fundação já pensados para as tasks seguintes**: `.panel`, `.panel-grid`, `.card`, `.text-display`, `.text-muted`, `.btn`/`.btn-secondary`, `.input`, `.visually-hidden` (útil para labels acessíveis da barra UV na Tarefa 10.0) e variantes de skeleton (`.skeleton-text`, `.skeleton-heading`, `.skeleton-circle`, `.skeleton-block` para a Tarefa 8.0).

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ (sem comentários no código novo — D13; CSS puro — D7; sem dependência nova de estilo) |
| Linguagem/Runtime | ✅ (frontend ESM, convenções do `AGENTS.md`) |
| REST/HTTP | ✅ (n/a — task de fundação visual) |
| Logging | ✅ (n/a) |
| Framework UI | ✅ (React 19 intacto; apenas CSS e HTML base; `npm run lint` e suíte Vitest verdes) |
| Testes | ✅ (74/74 passando: 69 designTokens + 4 indexHtml + 1 App pré-existente) |

## Recomendações

1. Na Tarefa 8.0 (casca do painel), aplicar `data-theme` na raiz do painel via `getTheme(categorizeWeatherCode(...))` e refazer a validação visual com o layout real preenchido (as screenshots desta task usaram um painel de demonstração injetado em runtime, sem alteração de arquivos do projeto).
2. No QA (contraste WCAG AA por tema, previsto na techspec), conferir o estado `:hover` dos botões no tema `rain` (ver Problemas Menores #2).
3. Manter o token `--color-focus` específico por tema sempre que novas superfícies forem adicionadas.

## Veredito

**APROVADO.** Todos os requisitos e `<critical>` da task foram satisfeitos: `index.html` em pt-BR com título e meta description; tokens como custom properties; 3 temas funcionais via `data-theme` (validados visualmente com paletas distintas — azulada, acinzentada e escura/fria); contraste AA em todos os temas; skeleton com pulso visível; fundação responsiva validada em 1/2/3 colunas; lint e suíte de testes 100% verdes; sem comentários no código novo. Próximos passos: prosseguir para a Tarefa 5.0 (weatherCode + weatherApi).

### Evidências visuais

| Evidência | Caminho |
|---|---|
| Tema clear (web, 1280px) | `../task-screenshots/task-4-theme-clear.png` |
| Tema cloudy (web, 1280px) | `../task-screenshots/task-4-theme-cloudy.png` |
| Tema rain (web, 1280px) | `../task-screenshots/task-4-theme-rain.png` |
| Responsivo tablet (820px, 2 colunas) | `../task-screenshots/task-4-responsive-tablet.png` |
| Responsivo mobile (390px, 1 coluna) | `../task-screenshots/task-4-responsive-mobile.png` |
