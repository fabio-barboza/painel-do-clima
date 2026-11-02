---
id: R-04
severidade: MENOR
status: resolvido
---

# Tarefa de Correção: helpers duplicados no frontend

## Problema
Há definições repetidas da mesma lógica:

- `formatDegrees` em `CurrentCard.jsx` (linha 19) repete a função exportada por `lib/format.js` (linha 144).
- `hasValue` em `CurrentCard.jsx` (linha 15) e `StatsGrid.jsx` (linha 25) é o inverso de `isMissing`, privado em `lib/format.js` (linha 41).
- `REDUCED_MOTION_QUERY` e `prefersReducedMotion` em `HourlyChart.jsx` (linhas 5 e 31) repetem `isReducedMotion`, exportado por `hooks/useCountUp.js` (linha 9).
- `DATE_LENGTH` aparece em `WeeklyCard.jsx` (linha 15) e `lib/format.js` (linha 30).

## Arquivo
`frontend/src/components/CurrentCard.jsx` — linha 15 (demais locais listados acima)

## Impacto
Mudanças de formatação ou de tratamento de nulos precisam ser repetidas em vários pontos, com risco de divergência entre os cards.

## Sugestão de Correção
1. Remover o `formatDegrees` local de `CurrentCard.jsx` e importar o de `lib/format.js`.
2. Exportar `hasValue` de `lib/format.js` e usá-lo em `CurrentCard.jsx` e `StatsGrid.jsx`.
3. Mover `isReducedMotion` para um módulo neutro, como `lib/motion.js`, e usá-lo em `useCountUp.js` e `HourlyChart.jsx`, ajustando os imports nos testes se houver.
4. Em `WeeklyCard.jsx`, trocar o cálculo local da data por uma função exportada de `lib/format.js`, como `getDatePart(currentTime)`, usada também por `selectTodayHours`.
5. Não mudar comportamento. A suíte atual deve passar sem alterações nas asserções.

## Resolução

Helpers centralizados, sem alteração de asserções nos testes:

- `frontend/src/lib/format.js`: `hasValue` exportado (inverso de `isMissing`) e `getDatePart` exportado, usado por `selectTodayHours` e `WeeklyCard`. `formatDegrees` passa a ser a única definição; a cópia local de `CurrentCard.jsx` foi removida.
- `frontend/src/lib/motion.js` (novo): `isReducedMotion`, movido de `hooks/useCountUp.js`. Usado por `useCountUp.js` e `HourlyChart.jsx`, que perde `REDUCED_MOTION_QUERY` e `prefersReducedMotion`.
- Locais removidos: `hasValue` em `CurrentCard.jsx` e `StatsGrid.jsx`; `DATE_LENGTH` e `buildTodayText` em `WeeklyCard.jsx`.
- Diferença de comportamento: `isReducedMotion` passou a ser tolerante a `window.matchMedia` ausente (retorna `false`). Antes, `HourlyChart` lançava erro nesse caso. Os testes não cobrem esse cenário.
- Verificação: `npm test -- run` com 366 testes passando (mesma contagem de antes); `npm run lint` com 0 erros e apenas o aviso já existente em `block-navigation.js`.
