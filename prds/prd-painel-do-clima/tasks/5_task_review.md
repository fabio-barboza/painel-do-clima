# Review: Task 5 - IconSprite + Icon + Reveal/useReveal

**Revisor**: AI Code Reviewer
**Data**: 2026-10-27
**Arquivo da task**: 5_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Fundação visual portada do `painel.html` para React: `IconSprite` (sprite oculto com os 16 `<symbol id="i-*">` verbatim), `Icon` (`<use href="#i-*">`), `useReveal` (IntersectionObserver `threshold: 0.15`, one-shot, cleanup idempotente) e `Reveal` (wrapper `.reveal` com `--d`, prop `instant` para skeleton e `className` passável). Os 16 símbolos foram comparados programa-a-programa contra o `painel.html` (linhas 394–486) e confirmados **idênticos em geometria** (viewBox, paths, coords). A convenção adotada para `Icon` é `name` **sem** o prefixo `i-` (o componente adiciona `i-` internamente), usada de forma consistente.

Durante a revisão autocódigo, um defeito real foi identificado e corrigido (ver 🴜 abaixo): o `<div>` do `Reveal` estava sem `ref`, fazendo `useReveal` ver `ref.current === null` e nunca criar o observer. Testes que antes passavam "por acaso" foram refeitos para validar o comportamento pretendido. Suíte frontend: **29 testes passando** (incl. 17 novos de icons/reveal). Lint do frontend: limpa para os arquivos desta task; restam 4 erros pré-existentes em `App.test.jsx` (arquivo não tocado).

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/components/IconSprite.jsx` | ✅ OK | nenhum |
| `frontend/src/components/Icon.jsx` | ✅ OK | nenhum |
| `frontend/src/components/Reveal.jsx` | ✅ OK (corrigido na revisão) | 1 crítico corrigido (ref solto) |
| `frontend/src/hooks/useReveal.js` | ✅ OK | nenhum |
| `frontend/src/__tests__/icons.test.jsx` | ✅ OK | nenhum |
| `frontend/src/__tests__/reveal.test.jsx` | ✅ OK | nenhum |

## Problemas Encontrados

### 🔴 Problemas Críticos

- **Nenhum** após correção. O único crítico encontrado (ver abaixo) já foi resolvido nesta revisão e a suite voltou a passar.

### 🟡 Problemas Maiores

- **Nenhum.**

### 🟢 Problemas Menores

1. **`useReveal` declara estado `visible` não consumido por `Reveal`** — o hook devolve `[ref, visible]` (contrato documentado na TechSpec), mas o mecanismo de revelação do `Reveal` é por classe no DOM (`.in` adicionado pelo observer), então `visible` é lido como parte do contrato mas não usado no fluxo atual. Não é bug; sugestão: no futuro o `Reveal`/skeleton pode usar `visible` em vez de depender só da classe, ou documentar que `visible` é parte do contrato público. Baixo impacto.
2. **Normalização de atributos de apresentação** — no sprite, `stroke-width`/`stroke-linecap`/`stroke-linejoin` foram escritos em camelCase React (`strokeWidth`, etc.) em vez de kebab-case do HTML. A geometria (paths, viewBox, coordenadas) está byte-idêntica ao protótipo (confirmado por script de comparação); apenas o nome do atributo de apresentação mudou, o que é idêntico visualmente no navegador e elimina o aviso de dev do React. Decisão intencional e documentada.

## ✅ Destaques Positivos

- **Fidelidade verbatim verificada**: script comparou os 16 contra o `painel.html` → "ALL SYMBOLS GEOMETRY-IDENTICAL". Não bastou-se à vista.
- **Teste de integração que fecha o contrato**: confirma que todo `<use href="#i-*">` resolve para um símbolo existente e que não há id duplicado — previne referências quebradas que apareceriam só na task 6.
- **`useReveal` idempotente ao StrictMode**: cleanup via `disconnect()` e o teste confirma que duplo mount mantém exatamente **um** observer ativo.
- **`instant` bem delimitado**: skeleton (`instant`) não cria observer (ref não anexado) e aplica `.in` direto; modo normal conecta o observer ao próprio div — testado.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código (`code-standards.md`) | ✅ — sem comentários (regra do PRD), constante nomeada para `threshold`, sem magic numbers, sem boolean flag, máximo de params respeitado (props destructuradas) |
| Convenções da linguagem do projeto | ✅ — camelCase `.jsx`/`.js`, ESM `import/export`, testes em `src/__tests__/` com `*.test.jsx` |
| `react-testing` (queries, comportamento) | ✅ — para ícones (aria-hidden decorativos) a query acessível não se aplica; estado do DOM validado por seleção direta, apropriado para SVG decorativo |
| `vercel-react-best-practices` | ✅ — `sprite` hoistado ao nível de módulo (`rendering-hoist-jsx`); sem componente dentro de componente; sem `useMemo` em primitivos |
| Contratos de interface | ✅ — `Icon`/`Reveal`/`useReveal` em alinhamento com o mapa de interfaces da TechSpec |
| Logging | N/A |
| Interface de usuário | ✅ — port fiel; `frontend-design` não se aplica (sem direção visual nova: é port verbatim) |
| Testes | ✅ — 17 testes novos, todos passando |

## Checagens Estáticas

Comando: `cd frontend && npm run lint` (ESLint 9 flat config)

Linha de base (antes da task): 4 erros em **1 arquivo não tocado pela task** (`frontend/src/__tests__/App.test.jsx`: `screen` não usado; `describe`/`test`/`expect` não definidos — arquivo commitado, anterior à task).

Resultado final: mesma lista — 4 erros em `App.test.jsx`; os arquivos criados/alterados nesta task (5 JSX/JS + 2 arquivos de teste) estão **limpos**.

Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): `frontend/src/__tests__/App.test.jsx` — 4 erros (não responsabilidade desta task; resolvido na task 16.0 "Completação: ... lint").

## Skills e MCPs do Projeto

Skills do projeto: **lidas antes da implementação**: `do-execute-task` (SKILL.md + references: `subagent-mode.md`, `code-standards.md`, `review-artifact-template.md`), `do-shared/references/` (`do-project-context.md`, `do-project-commands.md`, `do-mcp-discovery-instructions.md`, `do-mcp-capabilities.md`, `do-service-readiness.md`); `react-testing`; `vercel-react-best-practices`. **Nenhema aplicável lida depois** (a única alteração pós-revisão foi a correção do ref, dentro dos mesmos padrões). `frontend-design`: verificada como **não aplicável** (port verbatim do protótipo, sem direção visual a inventar).

MCPs do projeto: **playwright** (ui-testing) disponível, mas **fumaça E2E omitida propositalmente** por decisão da task 5 (componentes não executáveis por si; sem página montada — o App é placeholder até a task 6): não há fluxo principal de sucesso deste entregável para validar via browser sem invadir o código da task 6. **mcp-api-test** (api-testing): não aplicável (sem mudança de backend). **context7** (documentation): não necessário (padrões React de SVG/`useEffect` já consolidados no código e na TechSpec).

## Recomendações

1. (menor) Consolidar o papel de `visible` no retorno de `useReveal` — usar de fato ou documentar como contrato público.
2. (não desta task) Corrigir os 4 erros de lint pré-existentes em `App.test.jsx` (task 16.0).

## Veredito

Task **aprovada com observações**: fundação implementada com fidelidade verificada ao protótipo, coberta por testes de unidade e integração passando, e lint da task limpa. O defeito de ref no `Reveal` foi detectado pela revisão autocódigo, corrigido e revalidado pela suíte. Nenhuma bloqueante. A fumaça E2E é deferida para a task 6 conforme documentado.
