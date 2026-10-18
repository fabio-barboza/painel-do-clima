# Tarefa 3.0: Rota `/api/weather` (city e lat/lon) + testes de integração

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Cria `backend/src/routes/weather.js` — o endpoint principal do produto (FR-2/FR-3 do PRD): `GET /api/weather` com `?city=<nome>` (fluxo de busca: geocoding + forecast em cadeia) ou `?lat=&lon=` (fluxo de geolocalização: forecast direto, sem geocoding — decisão D3). Ao final desta tarefa o backend está **validável por curl** contra as APIs reais, como exige o PRD ("Validação contra a fonte real").

<requirements>
- `GET /api/weather?city=<nome>` → `geocodeCity` + `getForecast` → **200** `{ location, forecast }` (`forecast` = payload bruto da Open-Meteo)
- `GET /api/weather?lat=<n>&lon=<n>` → `getForecast` direto (sem geocoding) → **200** com `location = { latitude, longitude, timezone }` (sem `name`)
- Validações (regras exatas na techspec, seção "Endpoints de API"):
  - `city` ausente E `lat`/`lon` ausentes → **400** `{ error: "VALIDATION", message }`
  - `city` E coordenadas presentes juntos → **400** `VALIDATION` (exclusão mútua)
  - `lat`/`lon` não numéricos ou fora de domínio (±90 / ±180) → **400** `VALIDATION`
  - Geocoding sem resultados → **404** `{ error: "CITY_NOT_FOUND", message }`
  - Externo não-200, timeout ou erro inesperado → **500** `{ error: "INTERNAL", message }`
- Rota registrada na fábrica `app.js`
- Fixtures de teste fixos em `backend/src/__tests__/fixtures/` (geocoding de "São Paulo"; forecast com 24 hourly + 7 daily)
- Sem comentários em código novo (D13)
</requirements>

## Subtarefas

- [x] 3.1 Implementar validação de query (city XOR lat/lon; domínio de coordenadas) com respostas 400
- [x] 3.2 Implementar fluxo `?city` (cadeia `geocodeCity` → `getForecast` com as coordenadas resolvidas)
- [x] 3.3 Implementar fluxo `?lat&lon` (forecast direto; `location` sem `name`)
- [x] 3.4 Mapear `CityNotFoundError` → 404 e erros externos → 500 com payloads JSON `{ error, message }`
- [x] 3.5 Registrar a rota em `src/app.js`
- [x] 3.6 Criar fixtures fixos (geocoding "São Paulo"; forecast 24 hourly + 7 daily)
- [x] 3.7 Criar testes de unidade da rota (serviço mockado)
- [x] 3.8 Criar teste de integração (app completo, apenas `global.fetch` mockado)
- [x] 3.9 Validar via curl: APIs externas (geocoding + forecast) e, em seguida, o endpoint interno `GET /api/weather?city=` com cidade real (exigência do PRD)

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): "Interfaces Principais" (comportamento da rota e payloads de erro), "Modelos de Dados" (payload 200 `{location, forecast}` e exemplos de erro), "Endpoints de API" (regras de validação e headers) e "Abordagem de Testes" (escopo dos testes de rota e integração + fixtures). Milestone: backend validável por curl (passo 3 do sequenciamento).

## Critérios de Sucesso

- 200 com `{ location, forecast }` para `city` válida e para `lat/lon` válidos
- 400 `VALIDATION` nos três cenários de parâmetro (ausentes, ambos presentes, coordenadas inválidas)
- 404 `CITY_NOT_FOUND` para cidade inexistente
- 500 `INTERNAL` para falha/timeout externo
- Teste de integração prova que a URL do forecast usa as coordenadas do geocoding
- Todas as respostas com `Cache-Control: no-store`, sem `ETag` e headers CORS
- curl real: `curl "http://localhost:3000/api/weather?city=Campinas"` retorna 200 com payload completo
- Suíte Jest completa verde (`cd backend && npm test`)
- Sem comentários em código novo (D13)

## Testes da Tarefa

- [x] Testes de unidade: `backend/src/__tests__/weather.route.test.js` (serviço mockado com `jest.mock`): 200 por `city` (cadeia geocoding + forecast); 200 por `lat/lon` (sem geocoding); 400 (parâmetros ausentes, ambos presentes, coordenadas inválidas); 404; 500
- [x] Testes de integração: `backend/src/__tests__/weather.integration.test.js` — app completo, sem mocks de rota/serviço, apenas `global.fetch` mockado: cadeia geocoding → forecast (assert que a URL do forecast usa as coordenadas do geocoding); status 200/400/404/500 com payload e headers (no-cache, CORS)

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `backend/src/routes/weather.js` (novo)
- `backend/src/app.js` (modificar — registrar a rota)
- `backend/src/services/openMeteo.js` (dependência — criado na Tarefa 2.0)
- `backend/src/__tests__/weather.route.test.js` (novo)
- `backend/src/__tests__/weather.integration.test.js` (novo)
- `backend/src/__tests__/fixtures/` (novos)
