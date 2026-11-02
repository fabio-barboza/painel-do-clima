---
id: BUG-03
severidade: Baixa
status: corrigido
---

# Bug: foco do teclado se perde ao acionar "Tentar novamente"

## Descrição
O botão "Tentar novamente" é desmontado durante a nova consulta e o foco vai para `body`. Se a consulta falhar de novo, o novo botão não recebe o foco. Quem usa leitor de tela perde o ponto de contexto na página. A nova tentativa continua possível só pelo teclado: no Chromium, um `Tab` volta ao botão, porque o navegador preserva o ponto de partida da navegação sequencial. Esse comportamento não foi verificado em outros navegadores.

## Passos para Reproduzir
1. Fazer o backend responder 502.
2. Pesquisar uma cidade.
3. Levar o foco a "Tentar novamente" com o teclado e pressionar Enter.
4. Aguardar a nova falha e consultar `document.activeElement`.

## Resultado Esperado
Depois da nova tentativa, o foco permanece em um elemento significativo, como o botão reaparecido ou a mensagem.

## Resultado Atual
`document.activeElement` é `BODY`.

## Evidência
`qa/qa-1/screenshots/a11y-foco-retry.png` (estado antes de acionar o botão; a perda de foco foi medida por script)

## Componente Afetado
`frontend/src/components/Notice.jsx` e `frontend/src/App.jsx`.

## Resolução

**Causa:** ao acionar "Tentar novamente", a notificação de erro é removida durante a consulta (`notice: null`), o que desmonta o botão. Quando a nova consulta falha, o `Notice` é remontado com um botão novo, que não recebe foco; o foco permanece em `body`.

**Correção aplicada:**
- `frontend/src/components/Notice.jsx`: nova prop opcional `focusRetry`. Quando `true` e `canRetry` estão ativos, o botão "Tentar novamente" recebe foco ao montar (via `ref` e `useEffect`).
- `frontend/src/App.jsx`: estado `retrying`. `handleRetry` marca `retrying` como `true` antes de repetir a consulta; `handleSearch` e `handleLocate` o zeram, para que uma nova pesquisa que falhe não roube o foco. A prop `focusRetry={retrying}` é repassada ao `Notice`.

**Testes de regressão:** `frontend/src/__tests__/AppRetryFocus.test.jsx`
- `BugFix BUG-03: should keep focus on the retry button when the retry fails again`: falha na nova tentativa e verifica que o botão reaparecido tem o foco (falhava antes da correção).
- `BugFix BUG-03: should not move focus to the retry button when a new search fails` (borda): após uma nova pesquisa que falha, o botão não recebe o foco.

**Validação:** suíte do frontend (`npm test -- run`) com 382 testes passando; `npm run lint` sem erros.

**Lacuna de validação:** a validação foi feita por testes de integração no jsdom, com a rede simulada no limite do `fetch`. Não houve validação E2E pelo MCP de navegador neste ciclo, nem verificação em outros navegadores (o relato original cita apenas o Chromium).
