---
id: BUG-02
severidade: Baixa
status: corrigido
---

# Bug: skeleton das estatísticas é 26px mais alto que o painel em telas estreitas

## Descrição
Em larguras estreitas, o texto de exemplo `00 km/h · NNO` do card Vento quebra em duas linhas dentro do skeleton. A segunda linha da grade de estatísticas fica com 151px, contra 125px nos dados reais, e tudo abaixo dela salta 26px quando os dados chegam. Isso contraria o RF-35, que pede as mesmas dimensões do painel para evitar saltos de layout.

## Passos para Reproduzir
1. Abrir `/` com viewport de 375 x 812.
2. Pesquisar uma cidade com a resposta do backend atrasada.
3. Medir `.grid-stats` durante o skeleton.
4. Liberar a resposta e medir de novo.

## Resultado Esperado
`.grid-stats` tem a mesma altura no skeleton e nos dados.

## Resultado Atual
Altura de `.grid-stats`: 288px no skeleton e 262px nos dados em 375 px. A quebra ocorre em 375, 400 e 430 px e não ocorre em 479 px. Em 768 e 1280 px as alturas são iguais.

## Evidência
`qa/qa-1/screenshots/bug-02-skeleton-stats-375.png`

## Componente Afetado
`frontend/src/components/DashboardSkeleton.jsx`, linha 27 (valor de exemplo `00 km/h · NNO`, renderizado como um único bloco `.skel`).

## Resolução

**Causa raiz:** o skeleton renderizava cada valor de estatística como um único `<span class="skel">` com o texto inteiro (`00 km/h · NNO`) em `.stat-val` (22–28 px). Os dados reais usam `número<small> unidade</small>`, com a unidade em 13 px. Com o texto inteiro em tamanho grande, o card Vento quebrava em duas linhas em larguras estreitas e a linha da grade ficava 26 px mais alta.

**Correção aplicada:** `frontend/src/components/DashboardSkeleton.jsx` passou a montar o valor das estatísticas com a mesma estrutura do painel real: algarismo em `.skel` e unidade dentro de `<small>` (com `.skel` interno). Constante `PLACEHOLDER_STAT_VALUE` removida por ficar sem uso.

**Testes de regressão:** `frontend/src/__tests__/DashboardSkeleton.test.jsx`, teste `BugFix #02: should keep the unit of each stat value in <small> as the real panel when the skeleton renders`. Compara, para cada uma das 4 estatísticas, o número de `<small>` do skeleton com o do painel real. Falhou antes da correção (0 `<small>` no skeleton) e passa depois.

**Validação via MCP (Playwright, viewport 375 x 812):** com a busca de "Curitiba" com resposta pendente, `.grid-stats` mediu 262 px durante o skeleton (antes: 288 px), igual aos 262 px dos dados reais. Cada `.stat-val` tem 26 px (uma linha). Evidência: `prds/prd-painel-clima/qa/qa-1/screenshots/fix-BUG-02-skeleton-stats-375.png`.

**Suíte:** `cd frontend && npm test -- run` com 380 testes passando (379 antes + 1 novo). `npm run lint` sem erros.
