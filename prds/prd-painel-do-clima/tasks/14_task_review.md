# Review: Task 14 - EmptyState, Skeleton e ErrorState (estados ausentes do protótipo)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-27
**Arquivo da task**: 14_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Implementados os três estados ausentes do protótipo, compostos exclusivamente pelo design system portado (bloco 1 da task 4):

- `EmptyState.jsx` — convite à busca com ícone `i-search` 56 px e 2 botões funcionais.
- `Skeleton.jsx` — `variant='panel'` espelhando o layout carregado (atual, gráfico, 4 stats, 7 dias) com blocos `.sk` shimmer e revelação instantânea.
- `ErrorState.jsx` — 3 kinds (`not-found`/`bad-request`/`network`) com título/subtítulo e ação corretos.
- Apêndice ao bloco 2 de `index.css`: `.sk`, keyframe `shimmer`, regras de tamanho/drop-shadow dos ícones e layout dos estados.
- Testes `states.test.jsx` (16): unidade + integração com a estrutura do App.

Todas as 16 testes da task passam. A suíte inteira do frontend tem 1 falha **pré-existente**, fora do escopo desta task (ver Observações).

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/components/EmptyState.jsx` | ✅ OK | 0 |
| `frontend/src/components/Skeleton.jsx` | ✅ OK | 0 |
| `frontend/src/components/ErrorState.jsx` | ✅ OK | 1 (extensão de interface justificada) |
| `frontend/src/index.css` (apêndice) | ✅ OK | 0 |
| `frontend/src/__tests__/states.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/foundation.test.js` | ⚠️ Pré-existente | 1 (defeito da task 4, sem relação com esta) |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum.

### 🟡 Problemas Maiores

Nenhum relativo ao escopo desta task.

### 🟢 Problemas Menores

1. **Extensão de interface do `ErrorState`** — a TechSpec lista `ErrorState({ kind, message, onRetry })`, mas o FR-14 exige que "Nova busca" (404/400) **foco e selecione** o input de busca. Isso exige um handler de foco que a interface declarada não prevê. Adicionada a prop opcional `onFocusSearch` (conectada no `App` pela task 15). Justificada: sem ela, o FR-14 ("painel utilizável") não seria implementável. Não bloqueante.
2. **Observação de conformidade (FR-37)** — os estados reutilizam classes do bloco 1 e adicionam só `.sk`, `.state-card`, `.state-actions`, `.empty-ico`, `.error-ico`, `.temp-circle`, `.chart-rect`. O `drop-shadow` dos ícones reutiliza o padrão do `.bi-sun` com a tuple de cor `rgba(110,231,255,α)` já presente no bloco 1 (alpha ajustado para .25, por especificação da TechSpec), não um novo efeito. Coberto pelo teste automatizado de existência de classes.

## ✅ Destaques Positivos

- **FR-37 verificado por teste**: cada classe renderizada pelos três estados é asserida como declarada em `index.css` (extraída via regex de seletores). Garante que nenhum estado use algo fora do design system.
- **Skeleton sem dependência de estado**: `variant !== 'panel'` retorna `null`; revelação instantânea (sem `.reveal`), conforme spec.
- **Erro de rede preserva a busca**: teste de integração confirma que, após o erro, o `form` segue habilitado e uma nova busca dispara o `fetch` (FR-15/FR-14).
- **CSS delimitada**: apêndice estritamente ao final do bloco 2, sem sobrescrever regra do bloco 1.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Convenções da linguagem do projeto | ✅ (ESM `.jsx`, `src/__tests__/`, sem comentários) |
| Contratos de interface (APIs, mensagens) | ✅ (com extensão mínima e justificada em `onFocusSearch`) |
| Interface de usuário | ✅ (design system portado, acessibilidade por tags/botões nativos) |
| Testes | ✅ 16/16 passando |

## Checagens Estáticas

Comando: `cd frontend && npm run lint` (ESLint 9)
Linha de base (antes da task): 4 erros em `src/__tests__/App.test.jsx` (não é arquivo desta task)
Resultado final: 4 erros em `src/__tests__/App.test.jsx` — idêntico à base
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): `App.test.jsx` — `screen` não usado + globals `describe`/`test`/`expect` sem config de `globals` para esse arquivo. **Não é desta task e não foi tocado.**

Os arquivos criados/alterados desta task (`EmptyState.jsx`, `Skeleton.jsx`, `ErrorState.jsx`, `index.css`, `states.test.jsx`) passam pelo lint sem erros.

## Falha Pré-Existente (Observação — fora do escopo)

**Arquivo**: `frontend/src/__tests__/foundation.test.js` — teste `(a) bloco portado é byte-idêntico ao <style> do painel.html`.
**Estado na suíte**: 166 passam, 1 falha (esta, isoladamente).
**Causa**: o `<style>` do `painel.html` termina após `.area-path{opacity:1}` dentro do `@media (prefers-reduced-motion:reduce)`, mas `index.css` insere `.rain-bar{opacity:.5}` **dentro** desse mesmo bloco portado (em vez de como acréscimo no bloco 2), quebrando a identidade byte-a-byte do bloco 1. Ponto de divergência: char 14453.
**Relação com esta task**: nenhuma. A task 14 apenas **apendeu** regras ao final de `index.css` (comprimento saiu de 16001 para 16912); o ponto de divergência continua em 14453, inalterado (confirmado). É defeito da **task 4** (fundação do frontend), que manda o port ser `ipsis litteris`.
**Impacto nesta task**: nenhum — o fluxo desta task (renderizar os 3 estados) não depende dessa asserção, e o teste de fumaça desta task é explicitamente *omitido* (deferido para a task 15).
**Recomendação**: corrigir na task 4 (mover `.rain-bar{opacity:.5}` para fora do bloco portado). Não executado aqui por estar fora do escopo.

## Skills e MCPs do Projeto

Skills do projeto: **lidas antes da implementação**: `react-testing` (padrões de teste RTL + Vitest, consultas acessíveis, mock de `fetch`), `frontend-design` (direção visual, tratamento de estados vazio/erro como direção, não humor). Consultadas mas não aplicáveis a este escopo (frontend-only): `nodejs-backend-patterns`, `javascript-typescript-jest`, `vite`, `vercel-react-best-practices`, `vitest`.
MCPs do projeto: **nenhuse necessário** — task frontend-only, sem serviço em execução exigido, e o teste de fumaça está omitido por especificação da task (deferido para a task 15). `playwright`/`mcp-api-test` não foram invocados.

## Recomendações

1. (task 4) Mover `.rain-bar{opacity:.5}` para fora do `@media (prefers-reduced-motion:reduce)` portado, restaurando a identidade byte-a-byte do bloco 1 e passando o `foundation.test.js(a)`.

## Veredito

Task concluída: os 3 estados foram implementados com o design system portado, todos os 16 testes da task passam e o lint dos arquivos desta task está limpo. A única falha da suíte é pré-existente e pertence à task 4 (integridade do port CSS), sem relação com este escopo e sem impedir o fluxo desta task. Status **APROVADO COM OBSERVAÇÕES**.
