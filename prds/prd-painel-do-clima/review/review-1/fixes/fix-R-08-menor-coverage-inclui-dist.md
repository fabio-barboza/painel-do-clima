---
id: R-08
severidade: MENOR
status: resolvido
---

# Tarefa de Correção: cobertura do Vitest inclui dist/ (bundle buildado a 0%)

## Problema
Em `frontend/vitest.config.js`, o `coverage.exclude` (linhas 15–21) não cobre `dist/**`. Quando existe uma build (`frontend/dist/`, gerada por `npm run build`), o relatório de cobertura (`npm run test:coverage`) conta o bundle buildado `dist/assets/*.js` com 0% de cobertura, diluindo os números reais do código-fonte (na execução desta review, o total ficou em 97,04% stmts com esse ruído).

## Arquivo
`frontend/vitest.config.js` — linhas 15–21 (`coverage.exclude`)

## Impacto
Métrica de cobertura imprecisa (subestimada) e relatório com ruído de artefatos de build; pode induzir decisão errada sobre qualidade dos testes.

## Sugestão de Correção
1. Em `frontend/vitest.config.js`, adicionar `'dist/**'` ao array `coverage.exclude` (ex.: ao lado de `'**/node_modules/**'`).
2. Rodar `cd frontend && npm run test:coverage` e confirmar que `dist/assets` não aparece mais no relatório.

## Resolução

Correção aplicada (código do projeto, sem tocar em PRD/TechSpec/testes):

- Em `frontend/vitest.config.js`, `'dist/**'` foi adicionado ao array `coverage.exclude` (ao lado de `'coverage/**'`). O `coverage.exclude` passava a excluir o bundle buildado, que estava sendo contado com 0% de cobertura e diluía os números reais do código-fonte.
- Validação: `cd frontend && npm run test:coverage` → `dist/assets` não aparece mais no relatório de cobertura; o total subiu de 97,04% para 97,88% de instruções (`% Stmts`), com 20 arquivos / 177 testes verdes. A cobertura do frontend passa a refletir apenas o código-fonte.
