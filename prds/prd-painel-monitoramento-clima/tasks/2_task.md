# Tarefa 2.0: Serviço Open-Meteo (geocoding + forecast com timeout)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Cria `backend/src/services/openMeteo.js`, o único ponto de contato com as APIs externas da Open-Meteo: `geocodeCity(name)` (nome → coordenadas) e `getForecast(lat, lon)` (previsão completa), usando `fetch` nativo do Node com timeout via `AbortController` (10 s). É a camada que o backend inteiro depende para resolver busca e geolocalização (passo 2 do sequenciamento da techspec).

<requirements>
- `geocodeCity(name: string): Promise<Location>` — `GET {geocodingBaseUrl}/v1/search?name=<encodeURIComponent>&count=1&language=pt`; `results[0]` → `Location`; `results` vazio → `CityNotFoundError`; erro/timeout externo → `Error` (virará 500 na rota)
- `getForecast(latitude: number, longitude: number): Promise<ForecastPayload>` — `GET {forecastBaseUrl}/v1/forecast` com as variáveis `current`, `hourly`, `daily`, `timezone=auto`, `forecast_hours=24`, `forecast_days=7` e unidades métricas (celsius/kmh/mm) exatamente como definido na techspec ("Interfaces Principais")
- Exportar `class CityNotFoundError extends Error`
- Timeout de 10 s por chamada via `AbortController` (duração vem de `externalTimeoutMs` do `getEnv()`)
- Log de cada chamada externa (alvo, status, duração, erro): `warn` em respostas não-2xx; `error` em timeout/falha de rede (seção "Monitoramento e Observabilidade" da techspec)
- Base URLs vindas do `getEnv()` (`geocodingBaseUrl`/`forecastBaseUrl`) — permite mocks em E2E (decisão D9)
- Sem comentários em código novo (D13)
</requirements>

## Subtarefas

- [x] 2.1 Criar `class CityNotFoundError extends Error` (exportada)
- [x] 2.2 Implementar `geocodeCity` (URL com `language=pt`, `count=1`; `results[0]` → `Location`; `results` vazio → `CityNotFoundError`)
- [x] 2.3 Implementar `getForecast` (URL completa com variáveis `current`/`hourly`/`daily`, `timezone=auto`, `forecast_hours=24`, `forecast_days=7`, unidades métricas)
- [x] 2.4 Aplicar timeout via `AbortController` (10 s) nas duas chamadas
- [x] 2.5 Adicionar log estruturado das chamadas externas (status, duração, erro)
- [x] 2.6 Criar testes de unidade do serviço (ver "Testes da Tarefa")
- [x] 2.7 Validar via curl as suposições da techspec: geocoding com `language=pt` para cidades brasileiras (matching por prefixo, 3+ caracteres) e disponibilidade de `uv_index` em `hourly` (suposições listadas na techspec; o PRD exige validação contra a fonte real)

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): "Interfaces Principais" (assinaturas e URLs de `geocodeCity`/`getForecast`), "Modelos de Dados" (interface `Location`), "Pontos de Integração" (comportamento das APIs: sem match → 200 com `results: []`; erros externos → 400 `{error, reason}`) e "Considerações Técnicas" (decisão D4: `fetch` nativo + `AbortController`, zero dependências).

## Critérios de Sucesso

- `geocodeCity` retorna `Location` do `results[0]` e lança `CityNotFoundError` quando `results` é vazio
- `getForecast` retorna o payload bruto da Open-Meteo (sem remodelagem, conforme PRD) com as variáveis e unidades corretas
- Chamada externa que não responde é abortada em ~10 s e lança `Error`
- Falha de rede (fetch rejeitado) propaga `Error`
- Log externo registra status/duração de cada chamada
- Suíte Jest completa verde (`cd backend && npm test`)
- Sem comentários em código novo (D13)

## Testes da Tarefa

- [x] Testes de unidade: `backend/src/__tests__/openMeteo.service.test.js` com `global.fetch` mockado (`jest.spyOn`):
  - [x] geocoding com sucesso (usa `results[0]`, envia `language=pt` e `count=1`)
  - [x] `results` vazio → `CityNotFoundError`
  - [x] forecast com URL correta (variáveis, `timezone=auto`, `forecast_hours=24`, `forecast_days=7`, unidades métricas)
  - [x] resposta 400/500 externa → erro propagado
  - [x] timeout via `AbortController` (fetch mock que não responde)
  - [x] falha de rede (fetch rejeitado) → erro propagado

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `backend/src/services/openMeteo.js` (novo)
- `backend/src/__tests__/openMeteo.service.test.js` (novo)
- `backend/src/config/env.js` (dependência — criado na Tarefa 1.0)
