# Review: Task 16.0 - Completação: acessibilidade, lint, READMEs e remoções

**Revisor**: AI Code Reviewer
**Data**: 2026-10-28
**Arquivo da task**: `16_task.md`
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Task de finalização do scaffold. Verifiquei/acertei acessibilidade, validei `npm run lint` (0 erros),
eskrevi/criei os READMEs dos dois pacotes, removi as sobras do template Vite (`App.css`,
`public/icons.svg`) e validei o estado final (suítes verdes nos dois pacotes + build de produção).

A acessibilidade já estava implementada e testada nas tasks anteriores; meu trabalho foi **validar**
(rótulos acessíveis da busca, seções e gráfico `role="img"`, `aria-busy` na busca, foco visível,
`prefers-reduced-motion` e condição sempre em texto + ícone) e corrigir **uma** violação de contrato
que impedia a suíte frontend de ficar 100 % verde (detalhe abaixo). O resultado: lint limpo, 53
testes no backend, 174 no frontend, build OK e o scaffold renderizando corretamente no navegador.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `backend/README.md` (criado) | ✅ OK | 0 |
| `frontend/README.md` (reescrito) | ✅ OK | 0 |
| `frontend/src/index.css` (modificado) | ✅ OK (defeito pré-existo corrigido) | 1 corrigido (ver abaixo) |
| `frontend/src/App.css` (removido) | ✅ OK | 0 |
| `frontend/public/icons.svg` (removido) | ✅ OK | 0 |
| `16_task.md` / `tasks.md` (marcação) | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum.

### 🟡 Problemas Maiores

Nenhum na entrega desta task. **Defeito pré-existo de outra task, corrigido dentro deste trabalho**
(escopo habilitado por FR da própria task 16.5 — "suítes 100 % verdes"):

- **Arquivo**: `frontend/src/index.css`, bloco `@media (prefers-reduced-motion:reduce)`.
- **Causa**: o port verbatim do `<style>` do `painel.html` (bloco 1 da `index.css`) continha uma
  regra sobra `.rain-bar{opacity:.5}` **dentro** do bloco `prefers-reduced-motion`, que não existe
  no protótipo. Isso quebra o contrato "port verbatim = bloco 1 idêntico ao `painel.html`"
  (TechSpec: "CSS portado verbatim + acréscimos delimitados por ordem de bloco") e fazia o teste
  `foundation.test.js > (a) bloco portado é byte-idêntico ao <style> do painel.html` **falhar**.
- **Evidência**: `expect(css.startsWith(esperado)).toBe(true)` retornava `false`; a divergência era
  exatamente a linha `.rain-bar{opacity:.5}` inserida após `.area-path{opacity:1}` (o bloco do
  protótipo fecha o `@media` em `.area-path{opacity:1}\n}`).
- **Correção**: removi a regra sobra do bloco `prefers-reduced-motion`. O comportamento de reduced
  motion **não mudou** — as barras de precipitação já ficam visíveis via `.rain-bar.show{opacity:.5}`
  (bloco de acréscimos), que se aplica a todos os usuários, inclusive os de reduced motion (as barras
  já recebem `.show` no reveal, conforme `HourlyChart.test.jsx`). Confirmei `css.startsWith(esperado)`
  → `true` após a correção.
- **Nota de escopo**: é código da task 4.0 (foundation), commitado como blob vazio e modificado na
  árvore de trabalho antes desta task. A task 16.5 exige explicitamente suítes 100 % verdes, por isso
  a correção está dentro do meu escopo; o defeito e a correção ficam registrados aqui para
  rastreabilidade.

### 🟢 Problemas Menores

- **Arquivo**: `frontend/src/index.css:132` (pré-existo, não alterado). `.search input` usa
  `outline:none`; o foco visível é dado pelo halo `.search:focus-within` (borda + glow). É um
  padrão aceitável (foco perceivável), mas se quiser robustez extra contra auditores estritos, um
  `input:focus-visible{outline:...}` explícito no campo eliminaria qualquer ambiguidade. Não é
  regressão nem bloqueante.

## ✅ Destakes Positivos

- Acessibilidade já implementada de forma completa e testada: `role="search"` + `aria-busy` na
  busca, `aria-label` nos campos/seções, `role="img"` + rótulo descritivo no gráfico, motion
  desativado por `prefers-reduced-motion` (CSS global + cleanup de rAF no `useCountUp`/`HourlyChart`),
  condição sempre em texto + ícone.
- Suítes já cobrem os pontos da task (a11y na `SearchBar.test.jsx`, reduced motion na
  `useCountUp.test.jsx` e `HourlyChart.test.jsx`, contrato HTTP no backend).
- READMEs novos documentam de forma clara e precisa a estratégia de comunicação (dev: proxy Vite /
  produção: URL absoluta + CORS) e as portas, em conformidade com o parágrafo "Endpoints de API" da
  TechSpec.
- Remoções limpas: sem referências quebradas (`App.css` não era importado; o sprite é o `IconSprite`;
  o `/favicon.svg` permanece). O build de produção confirma.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Convenções da linguagem do projeto (ESM/CommonJS, `__tests__`, etc.) | ✅ |
| Contratos de interface (APIs, headers) | ✅ |
| Interface de usuário (a11y: teclado, rótulos, foco, reduced motion, cor+texto) | ✅ |
| Testes | ✅ (53 backend + 174 frontend, 0 falhas) |

## Checagens Estáticas

Comando: `cd frontend && npm run lint` (ESLint 9 flat config); backend sem checagem declarada.
Linha de base (antes da task): **0 erros** (frontend limpo antes das edições).
Resultado final: **0 erros**.
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): nenhum.

## Validation (estado final do scaffold — `16.5`)

- Backend: `npm test` → **53 passing / 5 suites**, cobertura ~96 %.
- Frontend: `npm test -- run` → **174 passing / 20 suites**.
- Frontend: `npm run lint` → **0 erros**.
- Frontend: `npm run build` (Vite 8) → **OK** (`dist/index.html` + CSS + JS; 42 modules; sem
  referência aos arquivos removidos).
- Fumaça via MCP Playwright (serviços subidos localmente): `/` renderiza o EmptyState com rótulo
  acessível "Pesquisar cidade ou região", relógio em pt-BR atualizando e footer. Screenshot:
  `prds/prd-painel-do-clima/task-screenshots/task-16-scaffold-empty-state.png`. Serviços encerrados
  ao fim.

## Skills e MCPs do Projeto

Skills do projeto: consultei a seção `Available Skills` de `.do/context.md` (frontend-design,
javascript-typescript-jest, nodejs-backend-patterns, react-testing, vercel-composition-patterns,
vercel-react-best-practices, vite, vitest, web-design-guidelines, webapp-testing). Para esta task de
finalização/validação ( código já implementado nas tasks anteriores), apliquei diretamente as
convenções autoritativas do projeto (`AGENTS.md` — particularidades das suítes e portas;
`.do/context.md` — comandos e MCPs): **web-design-guidelines** (escopo de a11y definido pelo PRD),
**vite** (build/proxy), **vitest** + **react-testing** (validação frontend) e
**nodejs-backend-patterns** + **javascript-typescript-jest** (validação/README backend). Nenhuma
skill nova foi carregada como SKILL.md porque o trabalho foi orientado a verificação e às
convenções do projeto; as regras dessas skills já estavam incorporadas na implementação anterior.
Recomendo carregar `web-design-guidelines` antes de evoluções de UI que não sejam finalização.
**Nenhuma skill foi lida DEPOIS de uma alteração de código que dela dependesse** — a única mudança
(index.css) foi uma restauração de contrato byte-idêntico ao protótipo.

MCPs do projeto: **playwright** (ui-testing) — usado no teste de fumaça do estado final do scaffold
(navegar + snapshot + screenshot do `/`); **mcp-api-test** (api-testing) — não necessário neste
fluxo (o smoke foi o estado vazio, sem requisição de dados); **context7** (documentation) — não
utilizado. Lacuna: sem validação HTTP ponta-a-ponta do endpoint `/api/weather` (fora do escopo de
finalização desta task).

## Recomendações

1. Rastrear a correção da `index.css` como ajuste pontual da task 4.0 (o bloco de acréscimos de
   `.rain-bar` deve viver fora do `@media (prefers-reduced-motion)`, como qualquer acréscimo).
2. (opcional) Adicionar `input:focus-visible{outline:...}` no campo de busca para robustez de auditde
   de foco.

## Veredito

Task concluída: acessibilidade validada, lint limpo, READMEs criados/reescritos, remoções feitas e
referências preservadas, e as duas suítes + build 100 % verdes. Um defeito pré-existo de outra task
(`index.css` com regra fora do bloco verbatim) foi corrigido dentro do escopo habilitado pela própria
task 16.5. Status **APROVADO COM OBSERVAÇÕES** — a observação é o defeito de outra task já resolvido
e registrado acima, para rastreabilidade da fase de QA.
