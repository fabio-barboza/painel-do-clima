---
id: R-01
severidade: MAIOR
status: resolvido
---

# Tarefa de Correção: tooltip do gráfico perde posição e conteúdo ao ocultar

## Problema
Em `HourlyChart.jsx`, o estado `hover` vira `null` ao ocultar. `buildTipStyle(null)` devolve só `opacity`, e `TooltipContent` deixa de renderizar. Com isso, `left` e `top` são removidos e o texto some antes do fade de `.15s`, de modo que uma caixa vazia aparece na posição estática, abaixo do gráfico. Em `painel.html`, `hide()` altera só a opacidade.

Além disso, `measureElementWidth` lê `tipRef.current.offsetWidth` antes de renderizar o conteúdo novo. Como o tooltip fica vazio depois de ocultar, todo novo toque mede cerca de 26 px, e o limite da borda cai para 56 px, valor que a TechSpec declara insuficiente.

## Arquivo
`frontend/src/components/HourlyChart.jsx` — linha 106 (também nas linhas 95 a 104, 111 a 121 e 276 a 285)

## Impacto
Contraria o CA-03, e o PRD trata divergências visuais como bloqueantes da aceitação. Em toques sem arrasto perto das bordas, o tooltip ultrapassa o gráfico, sobretudo em 375 px, e a mitigação prevista na TechSpec não funciona.

## Sugestão de Correção
1. Separar a visibilidade do último ponto exibido: manter `index`, `left` e `top` no estado ao ocultar e alternar apenas um campo como `visible`.
2. Fazer `buildTipStyle` sempre devolver `left` e `top` quando houver última posição, com `opacity: 0` se oculto. Manter `TooltipContent` montado com o último índice. Guia e ponto de destaque continuam dependendo de `visible`.
3. Calcular o limite da borda depois do render: em `useLayoutEffect`, dependente do índice e da largura do retângulo, ler `offsetWidth` com o conteúdo já atualizado e aplicar o `left` limitado por `max(56, largura / 2)`.
4. Em `frontend/src/__tests__/HourlyChart.test.jsx`, adicionar testes de regressão: depois de `mouseLeave`, o tooltip mantém `left`, `top` e o texto, com `opacity: 0`; e, simulando `offsetWidth` de 180 px, o primeiro `touchStart` perto da borda aplica `left` de 90 px. Os testes atuais de ocultar e de borda devem continuar passando.

## Resolução

Aplicada em `frontend/src/components/HourlyChart.jsx`, sem mudança de contrato:

- `useHourHover` passou a manter o último ponto (`hover`, com `index`, `anchorX`, `rectWidth` e `top`) e um flag `visible`. Ocultar (`mouseLeave`, `touchEnd`) altera só `visible`, então o tooltip mantém posição e texto durante o fade. Guia e ponto de destaque seguem `visible`.
- `buildTipStyle` sempre devolve `left` e `top` quando há último ponto, com `opacity` 0 se oculto. O `TooltipContent` continua montado com o último índice.
- A largura do tooltip é medida em `useLayoutEffect`, depois do render, dependente do índice e de `visible`. O `left` é limitado por `max(56, largura / 2)` no momento de montar o estilo, então o primeiro toque usa a largura do conteúdo novo.
- Testes de regressão em `frontend/src/__tests__/HourlyChart.test.jsx`: (a) após `mouseLeave`, o tooltip mantém `left`, `top` e o texto com `opacity: 0`; (b) com `offsetWidth` de 180 px, o primeiro `touchStart` na borda aplica `left` de 90 px. Os testes existentes de ocultar e de borda seguem passando.

Suíte do frontend: 40 arquivos e 365 testes passando. `npm run lint`: 0 erros; o aviso restante está em `block-navigation.js`, fora do escopo deste fix.
