# Review: Task 12 - HourlyChart (gráfico por hora interativo + barras de precipitação)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-27
**Arquivo da task**: 12_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Task 12 implementa o card "Previsão por hora" (FR-23…FR-26): um gráfico SVG puro com linha de temperatura + barras de precipitação, marcador "agora", tooltip (hover/touch) e animação de entrada disparada por interseção. A implementação está completa e **todos os 14 testes da tarefa passam** (unidade + integração).

Durante a execução, identifiquei e corrigi um **bug de integridade** na ativação da animação: o hook `useReveal` retorna `[ref, visible]` (ref em primeiro), mas o componente destruturava `const [visible] = useReveal(...)`, atribuindo o **ref** (um objeto, sempre verdadeiro) à variável `visible`. Com isso, `if (visible && !revealed)` era sempre verdade e a animação de entrada disparava em **todo mount**, ignorando o IntersectionObserver — contrariando FR-26 e o TechSpec (linha 232: `useReveal -> [ref, visible]`). Esse também era o motivo do único teste falhando (remontagem). A correção (`const [, visible] = useReveal(...)`) faz a animação disparar apenas quando o card intersecta a viewport, como exige o spec.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/components/HourlyChart.jsx` | ✅ OK | 1 bug de destruturação do `useReveal` corrigido; 1 parâmetro não usado removido (lint) |
| `frontend/src/__tests__/HourlyChart.test.jsx` | ✅ OK | 1 variável não usada removida (lint) |
| `frontend/src/index.css` (apêndice 12.5) | ✅ OK | nenhum (barras `.rain-bar`/`.dotline.rain` presentes, linhas 378/409-411) |
| `frontend/src/hooks/useReveal.js` | ✅ OK | não tocado |

## Problemas Encontrados

### 🔴 Problemas Críticos
Nenhum.

### 🟡 Problemas Maiores
Nenhum.

### 🟢 Problemas Menores
- O componente ainda não está montado no `App.jsx` (depende da task 15 para orquestrar/remontar por `key`). Isso está **de acordo com o escopo** da task 12 — o teste de fumaça está explicitamente omitido e será coberto pela task 15. É uma dependência de escopo, não um defeito.

## ✅ Destaques Positivos
- SVG 100% derivado do prop `hourly` (sem `HOURLY` fixo no código); geometria idêntica ao protótipo (W=760/H=300, Catmull-Rom, exatamente 24 `.pt`, X(0)=44, X(23)=744).
- Barras de precipitação **atrás da linha**, com teto de 28% do plot e piso de 6px, conforme TechSpec (linha 131).
- Interações hover/touch com clamp lateral de 56px e tooltip em pt-BR (`HHh · T°C · P mm` + `· agora`).
- Animateção de entrada ( traçado da linha + stagger dos pontos) respeita `prefers-reduced-motion` (tudo visível, sem dash).
- Cobertura de testes: 14 testes (unidade + integração) passando.
- Correção de integridade na ativação do reveal (por interseção, não em todo mount) — alinha o código ao que o spec descreve.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Convenções do projeto (ESM, `import`, `__tests__` .test.jsx) | ✅ |
| Contratos de interface (`HourlyChart({ hourly, nowIndex = 0 })`) | ✅ |
| Testes | ✅ |

## Checagens Estáticas

**Comando**: `npm run lint` (ESLint 9 flat config, frontend).
**Linha de base (antes da task)**: 4 erros em `frontend/src/__tests__/App.test.jsx` — arquivo que esta task **não tocou** (`describe`/`test`/`expect` sem globals de teste + `screen` não usado).
**Resultado final**: 4 erros, **todos** em `App.test.jsx` (pré-existentes, fora do escopo).
**Arquivos desta task**: **limpos** (`HourlyChart.jsx`, `HourlyChart.test.jsx`).
**Erros pré-existentes (somente da linha de base, em arquivo não tocado)**: `frontend/src/__tests__/App.test.jsx` — 4 erros. Não corrigidos (não são desta task).

## Skills e MCPs do Projeto

**Skills do projeto**: lidas **antes** da implementação — `do-execute-task` (`SKILL.md` + `references/subagent-mode.md`); referências de `do-shared` lidas pelo caminho completo (`references/do-project-context.md`, `references/do-project-commands.md`, `references/code-standards.md`, `references/do-mcp-capabilities.md`). Sem outras skills `do-*` aplicáveis à implementação; as skills nativas de framework/estilo não foram aplicáveis neste escopo.

**MCPs do projeto**: não aplicável neste ciclo. A task 12 cobre fumaça **omitida** (depende da task 15) e não há flow de serviço/UI e2e a rodar aqui — os testes são unitários/integração via Vitest. **Lacuna documentada**: a validação E2E do gráfico interativo (hover/touch/scroll no painel carregado) fica para a task 15.

## Recomendações
1. **(task 15)** Montar o `HourlyChart` no `App.jsx` com remontagem por `key` para validar a fumaça do fluxo visível e o comportamento "reinicia a animação na nova busca" em navegação real.
2. **(task 4/16)** Corrigir o teste de fundação `foundation.test.js` (teste (a)) que compara `index.css` com o `<style>` do `painel.html` — falha **pré-existente** de portamento CSS, fora do escopo desta task (o `index.css` foi modificado por trabalho WIP anterior, não por esta task).

## Veredito

**APROVADO COM OBSERVAÇÕES**. Todos os 14 testes da tarefa passam, o lint dos arquivos desta task está limpo, e os FR-23…FR-26 estão implementados e testados. Corrigido um bug de integridade na ativação da animação de entrada (reveal por interseção, como exige o TechSpec). Registrada como observação uma falha pré-existente do teste de fundação CSS (task 4), que não afeta o fluxo principal desta task.
