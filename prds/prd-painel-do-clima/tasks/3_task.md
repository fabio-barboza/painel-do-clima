# Tarefa 3.0: Rota GET /api/weather (cidade e coordenadas)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementa o único endpoint de dados do produto, `GET /api/weather`, consumido pelo frontend: por nome de cidade (geocoding → forecast) ou por coordenadas (forecast ∥ reverse geocoding em paralelo), com validação estrita (400), cidade não encontrada (404), falha externa (502) e o envelope leve de 200 (formato Open-Meteo + `city` resolvido + `hourly` já fatiado para 24 h).

## Requisitos atendidos (FR)

- **FR-01** — `GET /api/weather?city=<nome>` é o único endpoint de dados do frontend.
- **FR-02** — busca por nome: geocoding → previsão.
- **FR-03** — `200` sucesso / `400` parâmetros inválidos ou ausentes / `404` cidade não encontrada.
- **FR-04** — resposta com no mínimo: cidade resolvida (nome, região, país, coordenadas), condições atuais completas, 24 h por hora e 7 dias (mín/máx/chuva/condição).
- **FR-05** — formato Open-Meteo preservado (envelope leve, sem remodelagem complexa).
- **FR-06** — consulta por coordenadas com nome resolvido via reverse geocoding.
- (Headers de cache/CORS sobre o endpoint: FR-07/FR-08 — task 1, verificados aqui na integração.)

## Subtarefas

- [x] 3.1 Criar `backend/src/routes/weather.js` — validação: `city` ausente/vazio (só espaços) sem coordenadas → 400; `city` + coordenadas juntos → 400; `latitude`/`longitude` inválidos (NaN ou fora de [-90..90]/[-180..180]) → 400; sempre `{ "error": string }` em pt-BR.
- [x] 3.2 Fluxo por cidade: `geocodeCity(name)` → `null` → 404 `{ error: "Cidade não encontrada." }`; `fetchForecast` → `ExternalError` → 502 `{ error }`.
- [x] 3.3 Fluxo por coordenadas: `Promise.all([fetchForecast, reverseGeocode])` (sem waterfall); falha do reverse → `city.name = null` e a resposta segue 200.
- [x] 3.4 Envelope leve conforme "Modelos de Dados → WeatherResponse": `city { name, region, country, display, latitude, longitude }` (`display = "Nome, Região"` quando `region` existe e difere), `timezone`, `utc_offset_seconds`, `current`, `hourly` (exatamente 24 entradas via `sliceHourly24`, a partir da hora local da cidade), `daily` (exatamente 7 entradas).
- [x] 3.5 Montar a rota em `backend/src/index.js` (o handler de erros da task 1 mapeia `ExternalError` → 502).
- [x] 3.6 Testes (unidade + integração + fumaça).

## Detalhes de Implementação

Ver `techspec.md`: "Interfaces Principais → Backend" (tabela `routes/weather.js` — todos os casos de validação e status), "Endpoints de API" (tabela de endpoints), "Modelos de Dados" (contrato completo do `WeatherResponse` + formato de erro), "Decisões Principais" (item 2 — envelope leve; item 3 — janela rolante de 24 h com "agora" no índice 0).

## Critérios de Sucesso

- 200 (city): envelope completo — `city.display` no formato "Curitiba, Paraná"; `hourly` com exatamente 24 entradas a partir da hora local corrente da cidade; `daily` com exatamente 7; `Cache-Control: no-store` e sem `ETag`.
- 400: sem parâmetros, `city=` vazio/só espaços, coordenadas inválidas, city+coordenadas juntos — sempre JSON `{ error }` em pt-BR.
- 404: geocoding sem resultado → `{ error: "Cidade não encontrada." }`.
- 502: falha/timeout do forecast → JSON `{ error }`.
- 200 (coordenadas): `city` resolvido via BigDataCloud; `city.name = null` quando o reverse falha (ainda 200); forecast e reverse executados em paralelo.
- Testes automatizados 100 % offline (serviços mockados); zero dependências novas.

## Testes da Tarefa

- [x] Testes de unidade: validação da rota (todos os casos 400, com serviços mockados); montagem do envelope (`display` com/sem região; `city.name` null no geo).
- [x] Testes de integração (`backend/src/__tests__/weather.test.js`, Supertest + `jest.mock` dos serviços): 200 city (envelope completo + headers de cache/CORS); 200 geo (nome resolvido; reverse falha → `city.name` null); 400 (todos os casos); 404; 502; headers presentes em 200/400/404/502; 404 JSON de rota desconhecida continua intacto.
- [x] Teste de fumaça do fluxo principal: com o backend no ar e **rede real**, `GET "http://localhost:3000/api/weather?city=Curitiba"` → `200` com `city.display = "Curitiba, Paraná"`, `hourly` com 24 entradas e `daily` com 7 (cobre o fluxo de sucesso entregue pela task 2).

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Criar: `backend/src/routes/weather.js`, `backend/src/__tests__/weather.test.js`.
- Modificar: `backend/src/index.js` (montagem da rota).
- Dependências já entregues: services e middlewares das tasks 1–2.
