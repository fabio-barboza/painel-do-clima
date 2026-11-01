---
id: R-01
severidade: MAIOR
status: resolvido
---

## Resolução

Correção aplicada em `frontend/src/services/weather.js` (função `request`): no `catch`, antes de converter em `WeatherError('network')`, re-lança-se o erro original quando o `signal` foi abortado (`signal.aborted`). Assim o `AbortError` original alcança o `useWeather`, onde a guarda `err?.name === 'AbortError'` descarta corretamente a busca abortada — sem sobrepor o estado com um erro de rede falso.

Testes de regressão adicionados:
- `frontend/src/__tests__/weather-service.test.js`: `fetch abortado re-lança o AbortError original (não vira WeatherError)` — verifica que a requisição abortada rejulga com o erro original, não com um `WeatherError`.
- `frontend/src/__tests__/useWeather.test.js`: `nova busca aborta a anterior sem mostrar erro de rede falso` — duas buscas em sequência onde a primeira é abortada; afirma que, enquanto a segunda está em voo, o estado **não** vira `error{kind:'network'}` (mantém `loading`/`error` nulo) e que a segunda resolve em `success` sem erro falso intermediário.

Validação: suíte do frontend (`npm test -- run`) com 176/176 testes passando (useWeather: 13, weather-service: 10); lint com 0 erros. A correção altera só código e testes; PRD/TechSpec/tasks não modificados.

# Tarefa de Correção: busca abortada gera erro de rede falso (AbortError convertido em WeatherError)

## Problema
Em `frontend/src/services/weather.js`, a função `request()` (linhas 31–37) faz `catch` de **toda** rejeição do `fetch` — inclusive o `AbortError` gerado quando `useWeather` aborta a busca anterior em uma nova busca — e converte tudo em `WeatherError('network', undefined)`. Com isso, a guarda de abort em `frontend/src/hooks/useWeather.js` (linha 55: `if (err?.name === 'AbortError') return;`) nunca é atingida, porque o erro que chega ao hook tem `name === 'WeatherError'`.

Consequência no fluxo real (navegador): o usuário dispara a busca B enquanto a busca A está em voo; `runFetch(B)` aborta A; a rejeição de A vira `WeatherError('network')` e o `.catch` de A sobreescreve o estado com `error{kind:'network'}` ("Não foi possível carregar o clima") **durante o carregamento de B**. O estado só volta a `success` quando B responde — o usuário vê um erro falso (com botão "Tentar novamente") em toda busca consecutiva. Viola a TechSpec: "AbortController por busca; nova busca/locate aborta a anterior; unmount aborts" (a busca anterior deve ser ignorada, não vira erro).

## Arquivo
`frontend/src/services/weather.js` — linhas 31–37 (`request`); guarda relacionada em `frontend/src/hooks/useWeather.js` — linha 55

## Impacto
Fluxo principal (busca) exibe estado de erro falso e transitório em busca consecutiva — comportamento errado percebido pelo usuário em toda troca rápida de cidade; a proteção de abort existente no hook é inoperante.

## Sugestão de Correção
1. Em `request(url, signal)` de `frontend/src/services/weather.js`, no `catch`, re-lançar o erro original quando o sinal foi abortado, antes de converter:
   ```js
   } catch (err) {
     if (signal && signal.aborted) {
       throw err
     }
     throw new WeatherError('network', undefined)
   }
   ```
   (Assim o `AbortError` original chega ao hook e a guarda existente `err?.name === 'AbortError'` descarta a busca abortada.)
2. Adicionar teste de regressão em `frontend/src/__tests__/useWeather.test.js` (e/ou `weather-service.test.js`): mock de `fetch` que rejeita com `DOMException`/`Error` de `name === 'AbortError'` quando o `signal` é abortado; disparar duas buscas em sequência e afirmar que, após o abort, o estado **não** vira `error{kind:'network'}` (mantém `loading`/sucesso da segunda busca). O teste atual "nova busca aborta a anterior" só verifica `signal.aborted` e resolve a primeira busca manualmente — ele não cobre este cenário.
3. Rodar a suíte do frontend (`cd frontend && npm test -- run`) e o lint.
