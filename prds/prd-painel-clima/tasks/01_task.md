# Tarefa 1.0: Backend — Serviços de API (Geocoding + Forecast)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementar os dois serviços de integração com APIs externas do Open-Meteo: o serviço de geocoding (converte nome de cidade em coordenadas) e o serviço de forecast (obtém dados climáticos a partir de coordenadas). Estes serviços são a fundação do backend e serão consumidos pelo router na tarefa 2.

<requirements>
- RF-01: Campo de busca aceita nomes em qualquer idioma suportado pelo Open-Meteo Geocoding
- Serviço de geocoding deve chamar `https://geocoding-api.open-meteo.com/v1/search` com parâmetros `name`, `count=1`, `language=pt`
- Serviço de forecast deve chamar `https://api.open-meteo.com/v1/forecast` com os parâmetros documentados na techspec
- Timeout de 15s via `AbortController` em todas as chamadas externas
- Tratamento de erros: geocoding sem resultados → erro específico, falha de rede → erro genérico com log
- Nenhum comentário no código
</requirements>

## Subtarefas

- [x] 1.1 Implementar `backend/src/services/geocoding.js` — serviço de geocoding via Open-Meteo Geocoding API
- [x] 1.2 Implementar `backend/src/services/forecast.js` — serviço de forecast via Open-Meteo Forecast API
- [x] 1.3 Testes unitários de `geocoding.js` — mock do fetch para sucesso, lista vazia e erro de rede
- [x] 1.4 Testes unitários de `forecast.js` — mock do fetch para sucesso e erro

## Detalhes de Implementação

### geocoding.js
- Exporta função `geocode(cityName)` que retorna `{ name, latitude, longitude, timezone }` do primeiro resultado
- Parâmetros da requisição: `name`, `count=1`, `language=pt`, `format=json`
- Se `results` for vazio ou ausente, lançar erro com mensagem "Cidade não encontrada"
- Timeout de 15s via `AbortController`
- Referência: seção "Pontos de Integração" da techspec.md

### forecast.js
- Exporta função `getForecast(latitude, longitude)` que retorna o payload bruto do Open-Meteo
- Parâmetros da requisição conforme techspec:
  - `current`: `temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day`
  - `hourly`: `temperature_2m,precipitation`
  - `daily`: `weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum`
  - `timezone=auto`, `forecast_days=7`
- Timeout de 15s via `AbortController`
- Referência: seção "Endpoints de API" e "Modelos de Dados" da techspec.md

## Critérios de Sucesso

- `geocoding.js` retorna coordenadas corretas para "São Paulo"
- `geocoding.js` lança erro apropriado para cidade inexistente
- `forecast.js` retorna payload com `current`, `hourly` e `daily`
- Todos os testes unitários passam
- Zero comentários no código

## Testes da Tarefa

- [x] Testes de unidade de `geocoding.js` (mock fetch): sucesso, cidade não encontrada, erro de rede
- [x] Testes de unidade de `forecast.js` (mock fetch): sucesso, erro de API

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `backend/src/services/geocoding.js` (criar)
- `backend/src/services/forecast.js` (criar)
- `backend/src/__tests__/geocoding.test.js` (criar)
- `backend/src/__tests__/forecast.test.js` (criar)
