---
id: R-05
severidade: MENOR
status: resolvido
---

# Tarefa de Correção: artefatos gerados entram no lint e na cobertura

## Problema
`frontend/eslint.config.js` ignora só `dist`. Depois de `npm run test:coverage`, o `npm run lint` passa a analisar `coverage/` e emite 1 aviso em `block-navigation.js`. Já `frontend/vitest.config.js` não exclui `dist/` da cobertura, e `dist/assets` aparece no relatório com 0%, reduzindo o total.

## Arquivo
`frontend/eslint.config.js` — linha 8 (também em `frontend/vitest.config.js`, linhas 15 a 21)

## Impacto
O lint deixa de ficar limpo depois de um comando normal do projeto, e o número de cobertura muda conforme exista ou não um build local.

## Sugestão de Correção
1. Em `frontend/eslint.config.js`, trocar por `globalIgnores(['dist', 'coverage'])`.
2. Em `frontend/vitest.config.js`, acrescentar `'dist/**'` a `coverage.exclude`.
3. Confirmar com `npm run test:coverage -- --run` seguido de `npm run lint`: nenhum aviso e nenhuma linha de `dist/assets` no relatório.

## Resolução
- `frontend/eslint.config.js`: `globalIgnores(['dist', 'coverage'])`.
- `frontend/vitest.config.js`: `'dist/**'` acrescentado a `coverage.exclude`.
- Verificação: `npm run test:coverage -- --run` com 366 testes passando e sem linha `dist/assets`; `npm run lint` com "No issues found" (antes: 1 aviso em `coverage/block-navigation.js`).
