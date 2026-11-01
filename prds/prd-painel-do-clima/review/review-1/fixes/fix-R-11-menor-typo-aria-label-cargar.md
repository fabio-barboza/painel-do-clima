---
id: R-11
severidade: MENOR
status: resolvido
---

# Tarefa de Correção: typo em rótulo acessível — "Erro ao cargar clima" (castelhano)

## Problema
Em `frontend/src/components/ErrorState.jsx` (linha 35), o `<section>` de erro usa `aria-label="Erro ao cargar clima"`. "cargar" é castelhano; a interface inteira é em pt-BR (FR-38: conteúdo dinâmico "localizado em pt-BR"; PRD: "Linguagem: pt-BR em toda a interface").

## Arquivo
`frontend/src/components/ErrorState.jsx` — linha 35

## Impacto
Rótulo acessível incorreto (leído por leitores de tela) e fora do locale da aplicação. Sem impacto visual.

## Sugestão de Correção
1. Corrigir o atributo para `aria-label="Erro ao carregar o clima"`.
2. Verificar em `frontend/src/__tests__/states.test.jsx` se algum teste referencia o rótulo antigo (procurar por "cargar"); se sim, atualizar o assert para o texto correto.
3. Rodar a suíte do frontend (`cd frontend && npm test -- run`) e o lint.

## Resolução
Corrigido o `aria-label` em `frontend/src/components/ErrorState.jsx` (linha 35) de `"Erro ao cargar clima"` para `"Erro ao carregar o clima"`. Verificado com grep que não há outra ocorrência de "cargar" na base e que `states.test.jsx` não referencia o rótulo antigo (os asserts acessíveis usam `heading`/`message`, não o `aria-label`), portanto nenhum teste foi alterado. Suíte do frontend 178/178 verde e `eslint .` sem erros.
