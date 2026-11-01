# Tarefa 2.0: Clientes de serviços externos: geocoding, forecast (+sliceHourly24) e reverse geocoding

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementa os três clientes das APIs externas (CommonJS, assinaturas JSDoc, zero dependências — `fetch` global + `AbortSignal.timeout(8000)`): geocoding Open-Meteo (nome → coordenadas), forecast Open-Meteo (coordenadas → clima, com `sliceHourly24` para a janela rolante de 24 h) e reverse geocoding BigDataCloud (coordenadas → nome, **best-effort**: nunca derruba a consulta).

## Requisitos atendidos (FR)

- **FR-02** — nome → geocoding Open-Meteo → coordenadas → previsão.
- **FR-06** — consulta por coordenadas resolvendo o nome via API pública gratuita sem chave (BigDataCloud).
- **FR-05** — respostas preservam o formato Open-Meteo (sem remodelagem complexa — os clientes repassam o payload).
- PRD (Restrições) — o backend é o único consumidor de APIs externas.

## Subtarefas

- [x] 2.1 Criar `backend/src/services/geocoding.js`: `geocodeCity(name)` → `Promise<Place | null>` — `GET https://geocoding-api.open-meteo.com/v1/search?name=…&count=1&language=pt&format=json` (nome via `encodeURIComponent`); `results` vazio/ausente → `null`; não-2xx/timeout → `ExternalError`.
- [x] 2.2 Criar `backend/src/services/forecast.js`: `fetchForecast(latitude, longitude)` → `Promise<Forecast>` com os parâmetros exatos da TechSpec (`current`, `hourly`, `daily` — campos listados em "Interfaces Principais"; `forecast_days=7`, `timezone=auto`, `wind_speed_unit=kmh`) + `sliceHourly24(hourly, currentTime)` (índice da hora local corrente por comparação de prefixo; janela de exatamente 24 entradas a partir dele, cruzando o meio-dia quando necessário).
- [x] 2.3 Criar `backend/src/services/reverseGeocoding.js`: `reverseGeocode(latitude, longitude)` → `Promise<Place | null>` — `GET https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=…&longitude=…&localityLanguage=pt`; `Place.name = locality` (fallback `city`), `Place.region = principalSubdivision`; **qualquer** falha/timeout/campo ausente → `null` (melhor esforço, log WARN; a consulta segue 200).
- [x] 2.4 Testes (unidade + integração).

## Detalhes de Implementação

Ver `techspec.md`: "Interfaces Principais → Backend" (assinaturas e parâmetros exatos dos três clientes), "Pontos de Integração" (tabela de serviços: uso, ausência de auth, tratamento de erros, timeout 8 s, `Promise.all` no fluxo geo) e "Decisões Principais" (item 5 — BigDataCloud best-effort).

## Critérios de Sucesso

- `geocodeCity` monta a URL com `name` (codificado), `count=1`, `language=pt`, `format=json`; retorna `Place` a partir de `results[0]` ou `null`.
- `fetchForecast` usa exatamente os parâmetros da TechSpec (incluindo `timezone=auto` e `wind_speed_unit=kmh`); não-2xx/timeout → `ExternalError`.
- `sliceHourly24` retorna exatamente 24 entradas iniciando na hora local corrente — correto para 00 h, 12 h e 23 h (incluindo janela que cruza o meio-dia).
- `reverseGeocode` nunca lança: não-2xx, timeout ou `locality`/`city` ausentes → `null`.
- Zero dependências novas; testes 100 % offline (fetch global espionado).

## Testes da Tarefa

- [x] Testes de unidade (`backend/src/__tests__/services.test.js`): geocoding (URL/parâmetros; `results` vazio → `null`; não-2xx → `ExternalError`; timeout → `ExternalError`); forecast (parâmetros exatos; timeout → `ExternalError`); `sliceHourly24` (casos 00 h, 12 h, 23 h; cruzamento de meio-dia; sempre 24 entradas); reverse geocoding (URL com `localityLanguage=pt`; falha/timeout/campo ausente → `null`).
- [x] Testes de integração (fetch stubado): pipeline `geocodeCity` → `fetchForecast` → `sliceHourly24` para uma cidade fictícia devolve resultado coerente de 24 h (simula o fluxo da task 3).
- [x] Teste de fumaça: **omitido** — esta task não entrega artefato executável por si (clientes isolados); o fluxo de sucesso principal é coberto pela fumaça da task 3 (`GET /api/weather?city=Curitiba` com rede real).

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Criar: `backend/src/services/geocoding.js`, `backend/src/services/forecast.js`, `backend/src/services/reverseGeocoding.js`, `backend/src/__tests__/services.test.js`.
- Dependências já entregues: `backend/src/services/externalError.js` e `backend/src/config.js` (task 1).
