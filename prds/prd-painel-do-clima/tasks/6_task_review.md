# Review: Task 6 - SkyBackground (+tint), Header, Clock e Footer com montagem inicial no App

**Revisor**: AI Code Reviewer
**Data**: 2026-10-27
**Arquivo da task**: `6_task.md`
**Status**: **APROVADO COM OBSERVAÇÕES**

## Resumo

Implementada a montagem inicial visível do app: céu animado (`SkyBackground` — 140 estrelas com os ranges exatos do protótipo, lua, 3× nuvens com os inline styles exatos, 2× cadentes) + **2 camadas de tint** fixas por condição (FR-31), cabeçalho (`Header` + `Clock`) com relógio pt-BR em tempo real via `useClock` (tick 1 s), rodapé com texto adaptado **sem** "dados simulados" (FR-38), e `App.jsx` renderizando `IconSprite` + `SkyBackground` + `main.dashboard` com `Header`/`Footer` via `Reveal` (região central reservaada para as tasks 9–15). Wrapper raiz com `data-tint="clear"`.

**Resultado da validação:** suíte frontend **42/42 passing** (12 novos), `npm run lint` **limpo** nos arquivos da task, teste de fumaça E2E (`:5173`, Playwright) confirma céu + relógio atualizando + rodapé.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/hooks/useClock.js` | ✅ OK | 0 |
| `frontend/src/components/SkyBackground.jsx` | ✅ OK | 0 (observação menor: data-tint interno) |
| `frontend/src/components/Header.jsx` | ✅ OK | 0 |
| `frontend/src/components/Clock.jsx` | ✅ OK | 0 |
| `frontend/src/components/Footer.jsx` | ✅ OK | 0 |
| `frontend/src/App.jsx` | ✅ OK | 0 |
| `frontend/src/index.css` (apêndice bloco 2) | ✅ OK | 0 |
| `frontend/src/__tests__/useClock.test.js` | ✅ OK | 0 |
| `frontend/src/__tests__/sky-background.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/header-footer.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/foundation.test.js` (ajuste) | ✅ OK | 0 (mudança obrigatória, documentada) |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. **`data-tint` duplicado (raiz + wrapper interno do `SkyBackground`).** O `App.jsx` aponta `data-tint={tint}` no wrapper raiz (exigido pela task 6.6) e o `SkyBackground` aponta `data-tint={tint}` no seu wrapper interno. A camada de tint é controlada pelo ancestor mais próximo (wrapper do `SkyBackground`); o `data-tint` da raiz não altera camada alguma, apenas satisfaz a exigência da task. Sem efeito colateral (ambos carregam o mesmo valor). Sugestão para a task 15: unificar a fonte (`useWeather` → raiz) e avaliar a remoção do `data-tint` interno do `SkyBackground` se a camada deixar de ser autorregida.
2. **Aje obrigatório no `foundation.test.js` (task 4).** O test `(a)` afirmava `css === esperado` (`.index.css` idêntico ao bloco portado). Com o **bloco 2** (`.tint-layer`) appendado por esta task, o invariante correto passou a ser `css.startsWith(esperado)` — o bloco portado continua byte-idêntico **no início** do arquivo. Mudança mínima (remoção de uma asserção) e obrigatória, totalmente compatível com a TechSpec (bloco 1 portado + bloco 2 acréscimo).
3. **Lint pré-existente em `App.test.jsx` (não tocado por esta task).** 4 erros (`describe`/`test`/`expect` não definidos por falta de import de `vitest`; `screen` não usado). Remetido para a task 16 (completação/lint). Consta como linha de base.

### ✅ Destaques Positivos

- **Port fiel ao protótipo**: céu, classes e inline styles espelham `painel.html` (linhas 488–494); ranges de aleritiedade das estrelas idênticos (tamanho 0.8–2.6, opacidade 0.4–1.0, duração 2–5 s, delay 0–4 s).
- **`SkyBackground` autorregida**: camadas de tint fixas + `data-tint` local, testável isoladamente.
- **Testes de unidade cobrem os valores exatos** (nuvens com inline styles, 140 estrelas, 2 cadentes, 2 camadas de tint, troca de `data-tint`, formato pt-BR do relógio, cleanup do interval).
- **Fumaça E2E** valida o fluxo principal entregue + o render do sprite da task 5 (marca no cabeçalho).

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Convenções da linguagem do projeto (ESM, `src/__tests__/`, `.jsx`) | ✅ |
| Sem comentários no código (PRD — fora de escopo) | ✅ |
| Contratos de interface (TechSpec: `SkyBackground({tint})`, `Header()`, `Clock()`) | ✅ |
| Interface de usuário (FR-31/32/38) | ✅ |
| Testes | ✅ |

## Checagens Estáticas

Comando: `cd frontend && npm run lint`
Linha de base (antes da task): **4 erros em 1 arquivo** (`App.test.jsx` — pré-existentes, não tocados por esta task).
Resultado final: **0 erros** nos arquivos criados/modificados por esta task (`App.jsx`, `index.css`, `components/`, `hooks/`, 3 testes novos, `foundation.test.js`).
Erros pré-existentes (somente da linha de base, em arquivo que a task não tocou): `frontend/src/__tests__/App.test.jsx` — `screen` unused, `describe`/`test`/`expect` not defined.

## Skills e MCPs do Projeto

**Skills do projeto:** `react-testing` (lida antes/ durante a escrita dos testes; código recontratado contra ela — sem divergência: queries acessíveis para elementos interativos, queries DOM restringidas a elementos decorativos `aria-hidden` do céu, `act` para atualização de hook). `frontend-design` e `vercel-react-best-practices` (consultadas pela descrição; aplicação guiada pelo **port verbatim** do design system na TechSpec, sem desvio).

**MCPs do projeto:** `playwright` (**ui-testing**) — usado no teste de fumaça em `:5173` (navegação, snapshot de acessibilidade, screenshot full-page em `prds/prd-painel-do-clima/task-screenshots/6_task-smoke.png`). `context7` (`documentation`) e `mcp-api-test` (`api-testing`) — **não necessários** (task 6 é UI frontend, sem endpoint novo).

## Recomendações

1. (futuro, task 15) Unificar a fonte do `data-tint` (`useWeather`) e avaliar remover o `data-tint` interno do `SkyBackground`, deixando a camada controlada exclusivamente pela raiz.

## Veredito

**APROVADO COM OBSERVAÇÕES** — entrega completa, testada e sem problemas críticos/maiores. Duas observações menores (redundância cosmética de `data-tint`; ajuste obrigatório do teste da task 4) e uma constação de lint pré-existente (task 16).
