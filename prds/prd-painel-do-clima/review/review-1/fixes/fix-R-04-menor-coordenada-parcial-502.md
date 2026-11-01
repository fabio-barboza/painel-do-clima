---
id: R-04
severidade: MENOR
status: resolvido
---

# Tarefa de Correção: coordenada única (apenas latitude ou apenas longitude) retorna 502 em vez de 400

## Problema
Em `backend/src/routes/weather.js`, `parseCoords` (linhas 49–82) trata a presença de apenas uma coordenada como consulta válida: com `?latitude=10` (sem `longitude`), `hasLatitude=true`, `hasCoords=true`, `longitude=null`; as comparações de range com `null` (`null < -180`, `null > 180`) viram `false` (null → 0), então `valid` permanece `true`. A rota segue para `fetchForecast(lat, null)`, que envia `longitude=null` para a Open-Meteo; a API externa responde 400 e o backend converte em `ExternalError` → **502**. Pelo contrato (TechSpec "coordenadas fora de [-90..90]/[-180..180] ou NaN → 400" e PRD FR-03: 400 para parâmetros inválidos/ausentes), par incompleto é parâmetro inválido → **400**.

## Arquivo
`backend/src/routes/weather.js` — linhas 49–82 (`parseCoords`)

## Impacto
Viola o contrato de status codes do endpoint em caso de entrada malformada (502 "falha externa" em vez de 400 "parâmetro inválido"). Caso de borda — o frontend sempre envia as duas coordenadas ou nenhuma — mas é uma entrada legítima de API pública.

## Sugestão de Correção
1. Em `parseCoords`, tratar par incompleto como inválido — por exemplo, logo após calcular `hasCoords`:
   ```js
   if (hasCoords && hasLatitude !== hasLongitude) {
     valid = false
   }
   ```
   (ou equivalently: exigir `hasLatitude && hasLongitude` para considerar coordenadas presentes/válidas). A rota já responde 400 com "Coordenadas inválidas." quando `!coords.valid`.
2. Adicionar testes em `backend/src/__tests__/weather.test.js` (suíte "validação (400)"): `query({ latitude: '10' })` → 400 e `query({ longitude: '20' })` → 400, ambos com `fetchForecast` não chamado.
3. Rodar a suíte do backend (`cd backend && npm test`).

## Resolução
Correção aplicada em `backend/src/routes/weather.js` (na função `parseCoords`). Adicionado, logo após calcular `hasCoords`, o bloco que invalida par incompleto:
```js
if (hasCoords && hasLatitude !== hasLongitude) {
  valid = false;
}
```
Com isso, `?latitude=10` e `?longitude=20` chegam ao `if (!coords.valid)` existente e respondem `400 "Coordenadas inválidas."` sem jamais chamar `fetchForecast` (antes o `longitude=null`/`latitude=null` passava nas comparações de range e gerava 502 via `ExternalError`).

Testes adicionados em `backend/src/__tests__/weather.test.js`, suíte "validação (400)":
- `coordenada única (latitude) -> 400 { error }, sem fetchForecast` (query `{ latitude: '10' }`).
- `coordenada única (longitude) -> 400 { error }, sem fetchForecast` (query `{ longitude: '20' }`).

Suíte do backend (`cd backend && npm test`): 55/55 testes passando (53 prévios + 2 novos). Cobertura da rota `weather.js` mantida em ~97%. Nenhum serviço foi iniciado; sem saída redirecionada para arquivo fora do projeto.
