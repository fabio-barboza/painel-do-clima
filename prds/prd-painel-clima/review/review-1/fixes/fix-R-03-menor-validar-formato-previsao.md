---
id: R-03
severidade: MENOR
status: resolvido
---

# Tarefa de Correção: previsão com formato inesperado derruba o frontend

## Problema
`fetchJsonBody` aceita qualquer objeto, inclusive array e `{}`. Uma resposta 200 da previsão sem `current`, `hourly` ou `daily` chega ao frontend como sucesso. `selectSky` lê `data.current.weather_code` durante o render e, sem error boundary, a exceção desmonta toda a árvore React.

## Arquivo
`backend/src/services/openMeteo.js` — linha 104 (efeito em `frontend/src/App.jsx`, linha 29)

## Impacto
A probabilidade é baixa, mas o efeito é total: tela em branco, sem mensagem nem nova tentativa, e perda dos dados exibidos, ao contrário do RF-37 e do RF-39.

## Sugestão de Correção
1. Em `openMeteo.js`, validar o corpo da previsão dentro do fluxo de `requestJson`, para reaproveitar o log e a conversão em `HttpError(502, 'UPSTREAM_ERROR')`. Lançar `UpstreamFailure(INVALID_PAYLOAD_REASON)` se o corpo for array ou se `current`, `hourly` ou `daily` não forem objetos. Uma opção é `requestJson` receber um validador opcional, usado só por `fetchForecast`.
2. Não aplicar a validação ao geocoding, em que a ausência de `results` é o caso legítimo de cidade não encontrada.
3. Em `backend/src/__tests__/openMeteo.test.js`, adicionar casos para `{}`, array e cada campo ausente. Em `backend/src/__tests__/weather.test.js`, confirmar que a rota responde 502 com `UPSTREAM_ERROR`.

## Resolução
- `backend/src/services/openMeteo.js`: `requestJson` aceita um validador opcional, executado dentro do mesmo `try` que já converte falhas em log e `HttpError(502, 'UPSTREAM_ERROR')`. `fetchForecast` passa `validateForecastPayload`, que lança `UpstreamFailure('payload inválido')` se o corpo não for objeto, for array, ou se `current`, `hourly` ou `daily` não forem objetos. O geocoding não usa validador, então a ausência de `results` continua sendo cidade não encontrada.
- `backend/src/__tests__/openMeteo.test.js`: novos casos para `{}`, array, `current`/`hourly`/`daily` ausentes, `null` e não-objeto, verificando status, código, mensagem e log `forecast: payload inválido`; caso positivo com as três seções objetos.
- `backend/src/__tests__/openMeteo.test.js`: o fixture do teste existente "return the body unchanged" ganhou `hourly` e `daily`. Ele passava um corpo sem essas seções, que agora é rejeitado conforme a correção pedida; a asserção de retorno inalterado foi mantida.
- `backend/src/__tests__/weather.test.js`: rota `/api/weather` por coordenadas responde 502 `UPSTREAM_ERROR` com `no-store` e sem ETag quando a previsão vem em formato inesperado.
- Suíte: backend 91/91 passando; frontend 366/366 passando. Nenhuma alteração no frontend, PRD, TechSpec ou tasks.
