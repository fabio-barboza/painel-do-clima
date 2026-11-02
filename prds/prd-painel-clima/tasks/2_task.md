# Tarefa 2.0: Endpoint `GET /api/weather`

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Entrega o endpoint que resolve a cidade na API de geocoding da Open-Meteo, consulta a previsão e devolve o payload original acrescido de `location`. Aceita também consulta por coordenadas, sem geocoding.

**Depende de:** tarefa 1.0.

<requirements>
- Requisitos do PRD atendidos: RF-01, RF-02, RF-03, RF-04, RF-05, RF-06 e RF-07, além da restrição de privacidade (coordenadas sem persistência).
- `services/openMeteo.js` é a única camada que conhece as URLs externas.
- O payload da Open-Meteo não é remodelado; apenas `location` é acrescentado.
- Cidades homônimas usam o primeiro resultado (`count=1`).
- Dados no fuso da localização (`timezone=auto`).
- Nenhum log de coordenadas.
</requirements>

## Subtarefas

- [x] 2.1 Criar `src/lib/parseWeatherQuery.js`.
- [x] 2.2 Criar `src/services/openMeteo.js` com `geocodeCity` e `fetchForecast`, usando `fetch` global, `URLSearchParams` e `AbortSignal.timeout(8000)`.
- [x] 2.3 Criar `src/routes/weather.js` e registrá-la em `app.js`.
- [x] 2.4 Montar `location`: `name` e `region` por nome, com `region` vindo de `admin1` e fallback para `country`; os três campos `null` por coordenadas.
- [x] 2.5 Registrar com `console.error` cada 502, com serviço, status ou motivo e duração.
- [x] 2.6 Escrever os testes de unidade e de integração.

## Detalhes de Implementação

Ver na `techspec.md`: "Interfaces Principais" (Backend), "Modelos de Dados" (`WeatherResponse`, Erro), "Endpoints de API" (tabela de status) e "Pontos de Integração" (URLs, parâmetros e comportamentos verificados por curl).

Sem resultado, o geocoding responde 200 sem o campo `results`, inclusive para nomes de um caractere: isso é 404, não 502. Qualquer falha externa vira `HttpError(502, 'UPSTREAM_ERROR')`, sem repassar a mensagem externa ao cliente.

## Critérios de Sucesso

- `GET /api/weather?city=Curitiba` responde 200 com `current`, `hourly`, `daily` e `location`.
- `GET /api/weather?lat=-25.41&lon=-49.24` responde 200 com `location` de campos `null`, sem chamar o geocoding.
- Todos os casos de 400 da tabela da TechSpec respondem `INVALID_PARAMS`.
- Cidade inexistente responde 404 `CITY_NOT_FOUND`.
- Timeout, rede, status não 2xx ou JSON inválido respondem 502 `UPSTREAM_ERROR`.
- Todas essas respostas têm `Cache-Control: no-store` e nenhuma tem `ETag`.
- `uv_index` faz parte de `current`.

## Testes da Tarefa

- [x] Testes de unidade: `parseWeatherQuery` (todos os casos de 400, limites de coordenadas, `city` repetido, `city` com coordenadas); `openMeteo` com `global.fetch` simulado (montagem de URL, ausência de `results`, status não 2xx, timeout, JSON inválido).
- [x] Testes de integração: Supertest sobre `app.js` com 200 por cidade e por coordenadas, 400, 404, 502, `Cache-Control: no-store` e ausência de `ETag`.
- [x] Teste de fumaça: com o backend no ar e sem mocks, `GET /api/weather?city=Curitiba` via mcp-api-test retorna 200 com dados reais da Open-Meteo e `location` preenchido; em seguida, `GET /api/weather?lat=-25.41&lon=-49.24` retorna 200.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `backend/src/routes/weather.js`
- `backend/src/lib/parseWeatherQuery.js`
- `backend/src/services/openMeteo.js`
- `backend/src/app.js`
- `backend/src/__tests__/`
