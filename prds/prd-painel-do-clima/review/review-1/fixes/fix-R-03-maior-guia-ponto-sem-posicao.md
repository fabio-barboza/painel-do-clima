---
id: R-03
severidade: MAIOR
status: resolvido
---

# Tarefa de Correção: linha-guia e ponto de hover do gráfico não são posicionados (ficam em 0,0)

## Problema
Em `frontend/src/components/HourlyChart.jsx` (linhas 200–201):

```jsx
<line className="guide" id="guide" y1={PT} y2={bottom} style={{ opacity: hover ? 1 : 0 }} />
<circle className="hoverdot" id="hoverdot" r="5.5" style={{ opacity: hover ? 1 : 0 }} />
```

O handler `position()` (linhas 71–86) calcula `hover.cx` e `hover.cy` para o ponto hoverado, mas só os usa para posicionar o tooltip — a `line.guide` nunca recebe `x1`/`x2` (SVG assume 0 → a linha fica na borda esquerda) e o `circle.hoverdot` nunca recebe `cx`/`cy` (fica no canto superior esquerdo). No protótipo `painel.html` (linhas 783–786) o JS faz `guide.setAttribute('x1'/'x2', cx)` e `hd.setAttribute('cx'/'cy', cx/cy)` a cada hover.

## Arquivo
`frontend/src/components/HourlyChart.jsx` — linhas 200–201

## Impacto
A interação central do gráfico (FR-25: "linha-guia vertical + ponto + tooltip") está visualmente quebrada: ao passar o mouse, a guia vertical aparece no lado errado e o ponto branco no canto do SVG, em vez de marcar a hora/temperatura hoverada. Quebra também a fidelidade visual com o protótipo (FR-33). Os testes atuais só checam `opacity` de `.guide`/`.hoverdot`, por isso não capturam o problema.

## Sugestão de Correção
1. Ligar os atributos geométricos ao estado `hover` (valores já calculados):
   ```jsx
   <line
     className="guide"
     id="guide"
     x1={hover ? hover.cx : 0}
     x2={hover ? hover.cx : 0}
     y1={PT}
     y2={bottom}
     style={{ opacity: hover ? 1 : 0 }}
   />
   <circle
     className="hoverdot"
     id="hoverdot"
     r="5.5"
     cx={hover ? hover.cx : 0}
     cy={hover ? hover.cy : 0}
     style={{ opacity: hover ? 1 : 0 }}
   />
   ```
2. Em `frontend/src/__tests__/HourlyChart.test.jsx`, no teste de hover (mousemove com `clientX: 300`), adicionar asserts de posição: `parseFloat(guide.getAttribute('x1'))`/`x2` e `cx`/`cy` do hoverdot próximos do ponto esperado (`X(idx)` e `Y(temps[idx])`, com `toBeCloseTo`).
3. Rodar a suíte do frontend (`cd frontend && npm test -- run`) e o lint.

## Resolução

Correção aplicada (causa raiz): os atributos geométricos da guia e do ponto de hover agora ligam ao estado `hover` (valores `hover.cx`/`hover.cy` já calculados em `position()`).

- `frontend/src/components/HourlyChart.jsx`: o `<line id="guide">` passou a receber `x1={hover ? hover.cx : 0}` e `x2={hover ? hover.cx : 0}`; o `<circle id="hoverdot">` passou a receber `cx={hover ? hover.cx : 0}` e `cy={hover ? hover.cy : 0}`. Antes ambos ficavam em (0,0).
- `frontend/src/__tests__/HourlyChart.test.jsx`: no teste de hover (mousemove `clientX: 300`, que cai no índice 8 → 22h/22°C), adicionados asserts de posição: `x1`/`x2` da guia e `cx`/`cy` do hoverdot próximos do ponto esperado (`X(8)` ≈ 287,5 e `Y(22)` = 113), com `toBeCloseTo`. O valor de cy (113) deriva da escala `PT + (1 - (t-tMin)/span)*PLOT` com tMin=12, tMax=28, PLOT=232, PT=26.

Suíte do frontend: 176/176 verdes. Lint: 0 erros (1 warning pré-existente em arquivo gerado sob `coverage/` — R-07, irrelevante para esta correção).
