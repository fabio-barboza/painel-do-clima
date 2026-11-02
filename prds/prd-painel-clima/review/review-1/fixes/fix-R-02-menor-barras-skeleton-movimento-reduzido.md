---
id: R-02
severidade: MENOR
status: resolvido
---

# Tarefa de Correção: barras do skeleton ficam cheias com movimento reduzido

## Problema
O bloco `prefers-reduced-motion` de `index.css` aplica `.bar i{width:var(--w)}` a qualquer barra. Os `<i>` do skeleton não definem `--w`, então a declaração fica inválida no valor computado, a largura volta a `auto` e a barra ocupa todo o trilho, com o gradiente visível.

## Arquivo
`frontend/src/components/DashboardSkeleton.jsx` — linhas 112 a 114 e 149 a 151

## Impacto
Quem usa movimento reduzido vê, durante o carregamento, quatro barras de estatística e sete faixas de dias cheias, como se fossem dados reais. Isso contraria a função do skeleton (RF-35).

## Sugestão de Correção
1. Criar em `DashboardSkeleton.jsx` a constante `EMPTY_BAR_STYLE = Object.freeze({ '--w': '0%' })` e aplicá-la nos `<i>` de `SkeletonStat` e `SkeletonDay`. Não alterar `index.css`, que é cópia literal de `painel.html`.
2. Em `frontend/src/__tests__/DashboardSkeleton.test.jsx`, adicionar teste que confirme que todo `.bar i` do skeleton tem `--w` igual a `0%`.

## Resolução

Causa: os `<i>` das barras do skeleton não definiam `--w`, e a regra `.bar i{width:var(--w)}` do bloco `prefers-reduced-motion` ficava inválida, deixando a largura em `auto`.

Correção aplicada somente em código e teste:
- `frontend/src/components/DashboardSkeleton.jsx`: constante `EMPTY_BAR_STYLE = Object.freeze({ '--w': '0%' })`, aplicada nos `<i>` de `SkeletonStat` (4 cards) e `SkeletonDay` (7 dias).
- `frontend/src/__tests__/DashboardSkeleton.test.jsx`: teste "toda barra do skeleton define --w como 0%", que exige 11 barras (4 + 7), todas com `--w: 0%`.
- `frontend/src/index.css` não foi alterado (cópia literal de `painel.html`).

Validação: `npx vitest run src/__tests__/DashboardSkeleton.test.jsx` com 7 testes passando; suíte completa do frontend (`npm test -- run`) com 40 arquivos e 366 testes passando. `npm run lint` sem erros; o único aviso está em `block-navigation.js`, fora dos arquivos desta correção.
