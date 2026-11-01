---
id: R-10
severidade: MENOR
status: resolvido
---

# Tarefa de Correção: useCountUp não cancela o requestAnimationFrame no cleanup

## Problema
Em `frontend/src/hooks/useCountUp.js` (linhas 18–39), o cleanup do `useEffect` cancela apenas o `setTimeout` do delay (`clearTimeout(delayId)`). Se o componente for desmontado **durante** a animação (ex.: nova busca remontando o card de condições, ou navegação), o loop `animate` via `requestAnimationFrame` continua rodando até o fim dos 1400 ms, chamando `setValue` em um hook desmontado. A TechSpec ("Riscos Conhecidos" — StrictMode) promete efeitos "idempotentes com cleanup (IO unobserve, **rAF cancelado**, abort no unmount)" — o cancelamento do rAF não está implementado.

## Arquivo
`frontend/src/hooks/useCountUp.js` — linhas 18–39

## Impacto
Vazamento menor de trabalho (~1,4 s após desmonte, em desmontes durante o count-up) e `setState` em componente desmontado (inofensivo no React 19, mas indesejado). Não afeta o resultado visual.

## Sugestão de Correção
1. Rastrear o id do `requestAnimationFrame` dentro do `setTimeout` e cancelá-lo no cleanup:
   ```js
   const [value, setValue] = useState(0)

   useEffect(() => {
     let rafId = null
     const delayId = setTimeout(() => {
       if (prefersReducedMotion()) {
         setValue(target)
         return
       }
       const start = performance.now()
       function animate(now) {
         const progress = Math.min(1, (now - start) / DUR_MS)
         setValue(Math.round(easeOutCubic(progress) * target))
         if (progress < 1) {
           rafId = requestAnimationFrame(animate)
         }
       }
       rafId = requestAnimationFrame(animate)
     }, DELAY_MS)
     return () => {
       clearTimeout(delayId)
       if (rafId !== null) {
         cancelAnimationFrame(rafId)
       }
     }
   }, [target])
   ```
2. Rodar a suíte do frontend (`cd frontend && npm test -- run`) — os testes existentes de `useCountUp` (terminar no valor final, reduced-motion direto) devem continuar verdes; o lint também.

## Resolução

Aplicada a correção da causa raiz em `frontend/src/hooks/useCountUp.js`:

- Declarado `let rafId = null` no escopo do `useEffect`, antes do `setTimeout`.
- A cada quadro `animate` passa a atribuir `rafId = requestAnimationFrame(animate)` (o último quadro agendado fica rastreado).
- O cleanup agora cancela ambos os timers: `clearTimeout(delayId)` **e**, se `rafId !== null`, `cancelAnimationFrame(rafId)`. Assim, desmonte durante a animação interrompe o loop imediatamente, impedindo `setValue` em hook desmontado e o ~1,4 s de trabalho ocioso.

Região alterada: `frontend/src/hooks/useCountUp.js`, bloco do `useEffect` (linhas 18–44). Nenhum outro arquivo de produto foi tocado.

Teste de regressão adicionado em `frontend/src/__tests__/useCountUp.test.js`: `cancela o requestAnimationFrame no cleanup quando desmonta durante a animação` — avança até a metade da contagem, desmonta e afirma que `cancelAnimationFrame` foi chamado.

Verificação: suíte do frontend `vitest run` = 178/178 verdes (arquivo useCountUp: 5/5); lint (`eslint .`) sem erros nem warnings.
