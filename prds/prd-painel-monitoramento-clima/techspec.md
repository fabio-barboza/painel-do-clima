# Especificação Técnica — Painel de Monitoramento de Clima

**Feature:** `painel-monitoramento-clima`
**PRD de origem:** `prds/prd-painel-monitoramento-clima/prd.md`
**Status:** Aprovada para planejamento de tasks
**Data:** 2026-10-17

## Resumo Executivo

A solução é composta por duas aplicações independentes: um frontend React 19 + Vite 8 (Recharts para o gráfico de 24h, CSS puro com custom properties para a identidade visual dinâmica por condição climática, SVGs próprios com animações CSS para os ícones) e um backend Node.js com Express 4 (CommonJS) que é o **único** ponto de contato com as APIs Open-Meteo (geocoding + forecast), usando `fetch` nativo do Node com timeout via `AbortController`.

A comunicação frontend↔backend usa **sempre URL absoluta** via variável `VITE_API_URL`, com CORS explícito no backend — uma única estratégia, documentada e consistente em desenvolvimento e produção (portas 5173 e 3000 nos dois ambientes; sem proxy no Vite). O requisito de **zero cache HTTP** é imposto por três frentes: `app.disable('etag')` no Express, middleware com `Cache-Control: no-store` em toda resposta e `cache: 'no-store'` em todo `fetch` do frontend.

O endpoint principal `GET /api/weather` aceita `?city=<nome>` (fluxo de busca) ou `?lat=&lon=` (fluxo de geolocalização) e responde 200/400/404/500 com payload que agrupa a `location` do geocoding e o `forecast` bruto da Open-Meteo (sem remodelagem, conforme PRD). Testes: Jest + Supertest (backend, `fetch` externo mockado), Vitest + React Testing Library (frontend, `fetch` e geolocalização mockados) e Playwright (E2E com suite determinística mockando as APIs externas por base URLs configuráveis + 1 smoke contra a API real).

## Arquitetura do Sistema

### Visão Geral dos Componentes

**Backend (`backend/`)** — Node.js, Express 4, CommonJS:

| Componente | Arquivo | Responsabilidade |
|---|---|---|
| Fábrica do app | `src/app.js` *(novo)* | Monta o app Express: middlewares (no-cache, CORS, JSON), rotas, tratamento de erros. Exportado para testes |
| Bootstrap | `src/index.js` *(modificar)* | Carrega env e inicia `listen(PORT)`. Sem lógica de negócio |
| Config de env | `src/config/env.js` *(novo)* | Centraliza variáveis de ambiente: porta, origens CORS, base URLs externas, timeout |
| Middleware no-cache | `src/middleware/noCache.js` *(novo)* | `Cache-Control: no-store` em todas as respostas (ETag desabilitado na fábrica) |
| Error handler | `src/middleware/errorHandler.js` *(novo)* | 404 JSON para rotas desconhecidas; 500 JSON para erros não tratados |
| Rota weather | `src/routes/weather.js` *(novo)* | `GET /api/weather` (city ou lat/lon), validações, orquestra o serviço, define status |
| Serviço Open-Meteo | `src/services/openMeteo.js` *(novo)* | `geocodeCity(name)` e `getForecast(lat, lon)` via `fetch` nativo + `AbortController` |

**Frontend (`frontend/`)** — React 19, Vite 8, ESM:

| Componente | Arquivo | Responsabilidade |
|---|---|---|
| App (painel) | `src/App.jsx` *(modificar)* | Orquestra os estados (idle/loading/success/error), aplica o tema dinâmico, monta o layout |
| Busca | `src/components/SearchBar.jsx` *(novo)* | Campo de texto simples, disparo da busca, botão de geolocalização, feedback de carregamento |
| Condições atuais | `src/components/CurrentWeather.jsx` *(novo)* | Temperatura, umidade, vento, precipitação, ícone animado e barra UV |
| Barra UV | `src/components/UVBar.jsx` *(novo)* | Barra gradiente verde→vermelho com marcador do valor atual (acessível) |
| Gráfico 24h | `src/components/HourlyChart.jsx` *(novo)* | Recharts `ComposedChart`: `Line` (temperatura) + `Bar` (precipitação) + `Tooltip` customizado |
| Previsão 7 dias | `src/components/WeeklyForecast.jsx` *(novo)* | 7 cards com indicador de variação mín/máx (barra de intervalo) e volume de chuva |
| Ícone de clima | `src/components/WeatherIcon.jsx` *(novo)* | SVGs próprios animados por categoria de código WMO |
| Erro | `src/components/ErrorState.jsx` *(novo)* | Mensagem amigável (cidade não encontrada / falha de rede) + botão "Tentar novamente" |
| Skeleton | `src/components/Skeletons.jsx` *(novo)* | Skeleton loading dos cards e do gráfico |
| Hook de clima | `src/hooks/useWeather.js` *(novo)* | Máquina de estados da busca, guarda contra respostas obsoletas, geolocalização |
| Cliente de API | `src/services/weatherApi.js` *(novo)* | `fetchWeather()` com `cache: 'no-store'` e base URL de `VITE_API_URL` |
| Códigos WMO | `src/utils/weatherCode.js` *(novo)* | Code → categoria, label PT-BR, tema, formatadores de data/hora |
| Design tokens | `src/index.css` *(modificar)* | CSS custom properties, temas por condição (`data-theme`), skeletons, responsivo |
| HTML base | `index.html` *(modificar)* | `lang="pt-BR"`, título e meta description |

**E2E (`e2e/`)** *(novo)* — Playwright: configuração, suite determinística (APIs externas mockadas via base URLs do backend) e smoke real.

**Relacionamentos principais e fluxo de dados:**

```
SearchBar ──> useWeather ──> weatherApi.fetchWeather({ city } | { lat, lon })
                                    │  GET {VITE_API_URL}/api/weather?city=...
                                    ▼
                  backend: routes/weather ──> services/openMeteo
                                          ├─> GET {GEOCODING_BASE_URL}/v1/search?name=&count=1&language=pt
                                          └─> GET {FORECAST_BASE_URL}/v1/forecast?latitude=&longitude=&...
                                    ▼
                 200 { location, forecast } ──> App (tema pela condição atual)
                                     ├─> CurrentWeather (+ UVBar + WeatherIcon)
                                     ├─> HourlyChart (24h)
                                     └─> WeeklyForecast (7 dias)
```

## Design de Implementação

### Interfaces Principais

**Backend (CommonJS):**

```js
// src/config/env.js
function getEnv()
// -> { port: number, nodeEnv: string, corsOrigins: string[],
//      geocodingBaseUrl: string, forecastBaseUrl: string, externalTimeoutMs: number }

// src/services/openMeteo.js
class CityNotFoundError extends Error {}

function geocodeCity(name: string): Promise<Location>
// GET {geocodingBaseUrl}/v1/search?name=<encodeURIComponent>&count=1&language=pt
// results[0] -> Location | results vazio -> CityNotFoundError | erro/timeout -> Error (vira 500)

function getForecast(latitude: number, longitude: number): Promise<ForecastPayload>
// GET {forecastBaseUrl}/v1/forecast?latitude=..&longitude=..
//   &current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m
//   &hourly=temperature_2m,precipitation,uv_index
//   &daily=weather_code,temperature_2m_min,temperature_2m_max,precipitation_sum
//   &timezone=auto&forecast_hours=24&forecast_days=7
//   &temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm
// -> ForecastPayload (resposta bruta da Open-Meteo)

// src/routes/weather.js (router exportado para app.js)
// GET /api/weather
//   ?city=<string>             -> geocodeCity + getForecast
//   ?lat=<number>&lon=<number> -> getForecast direto (sem geocoding)
//   ausente / ambos            -> 400 VALIDATION
// 200 { location, forecast } | 400 | 404 CITY_NOT_FOUND | 500 INTERNAL (JSON)
```

**Frontend (ESM):**

```js
// src/services/weatherApi.js
function fetchWeather(query: { city?: string, lat?: number, lon?: number }): Promise<WeatherResponse>
// GET `${import.meta.env.VITE_API_URL}/api/weather?...` com cache: 'no-store'
// não-2xx -> throws WeatherApiError { status, code, message }

// src/hooks/useWeather.js
function useWeather(): {
  status: 'idle' | 'loading' | 'success' | 'error',
  data: WeatherResponse | null,
  error: { type: 'city_not_found' | 'network' | 'invalid', message: string } | null,
  search(city: string): void,
  locate(): void
}
// Guarda contra resposta obsoleta: contador de requisições — apenas a busca mais recente renderiza

// src/utils/weatherCode.js
function categorizeWeatherCode(code: number): 'clear' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'thunder'
function getTheme(category: string): 'clear' | 'cloudy' | 'rain'
function getWeatherLabelPt(code: number): string
function formatHour(isoTime: string): string    // "14:00"
function formatDayPt(isoDate: string): string   // "seg., 19/10"
```

### Modelos de Dados

**`Location`** (subconjunto do resultado do geocoding):

```ts
interface Location {
  name: string; latitude: number; longitude: number;
  country: string; admin1?: string; timezone: string;
}
```

Para consultas por `lat/lon`: `Location = { latitude, longitude, timezone }` (sem `name` — o tempo é mostrado por coordenadas).

**`GET /api/weather` — 200** (`forecast` é a resposta bruta da Open-Meteo, sem remodelagem):

```json
{
  "location": { "name": "São Paulo", "latitude": -23.5475, "longitude": -46.6361,
                "country": "Brasil", "admin1": "São Paulo", "timezone": "America/Sao_Paulo" },
  "forecast": {
    "latitude": -23.5475, "longitude": -46.6361, "timezone": "America/Sao_Paulo",
    "utc_offset_seconds": -10800,
    "current": { "time": "2026-10-17T12:00", "interval": 900,
                 "temperature_2m": 18.3, "relative_humidity_2m": 72,
                 "precipitation": 0.0, "weather_code": 2, "wind_speed_10m": 11.4 },
    "hourly": { "time": ["2026-10-17T12:00"],
                "temperature_2m": [18.3], "precipitation": [0.0], "uv_index": [4.1] },
    "hourly_units": { "temperature_2m": "°C", "precipitation": "mm", "uv_index": "Index" },
    "daily": { "time": ["2026-10-17"],
               "weather_code": [2], "temperature_2m_min": [12.1],
               "temperature_2m_max": [19.8], "precipitation_sum": [0.0] },
    "daily_units": { "temperature_2m_min": "°C", "temperature_2m_max": "°C", "precipitation_sum": "mm" }
  }
}
```

**Erros (JSON):**

```json
{ "error": "VALIDATION",     "message": "Informe 'city' ou 'lat' e 'lon'." }
{ "error": "CITY_NOT_FOUND", "message": "Cidade 'xyz' não encontrada." }
{ "error": "INTERNAL",       "message": "Falha ao consultar o serviço de previsão." }
```

**View model derivada no frontend** (em `utils`/componentes):
- `current`: `{ temperature, humidity, windSpeed, uvIndex, precipitation, weatherCode }` — `uvIndex` = `hourly.uv_index` no índice em que `hourly.time` casa com a hora de `current.time`.
- `hourly24`: `[{ hour: "12:00", temperature, precipitation }]` — 24 pontos de `hourly` (já limitados por `forecast_hours=24`, a partir da hora atual).
- `daily7`: `[{ date, weekday, weatherCode, tMin, tMax, precipitation }]` — 7 pontos de `daily`.
- Tema: `getTheme(categorizeWeatherCode(current.weather_code))` → `clear` | `cloudy` | `rain`.

**Mapeamento código WMO → categoria** (`utils/weatherCode.js`):

| Categoria | Códigos | Tema |
|---|---|---|
| `clear` | 0, 1 | clear |
| `partly` | 2 | clear |
| `cloudy` | 3 | cloudy |
| `fog` | 45, 48 | cloudy |
| `rain` | 51–57, 61–67, 80–82 | rain |
| `snow` | 71–77, 85, 86 | rain |
| `thunder` | 95, 96, 97, 99 | rain |

### Endpoints de API

| Método/Caminho | Descrição | Respostas |
|---|---|---|
| `GET /health` | Health check existente (sem mudança) | 200 JSON |
| `GET /api/weather?city=<nome>` | Principal: geocoding + forecast | 200 `{location, forecast}` / 400 / 404 / 500 |
| `GET /api/weather?lat=<n>&lon=<n>` | Alternativa para o fluxo de geolocalização (sem geocoding) | 200 / 400 (coordenadas inválidas) / 500 |
| `GET /<rota desconhecida>` | Fallback | 404 JSON |

**Regras de validação (`/api/weather`):**
- `city` ausente e `lat`/`lon` ausentes → **400** `VALIDATION`.
- `city` e coordenadas presentes juntos → **400** `VALIDATION` (exclusão mútua).
- `lat`/`lon` não numéricos ou fora de domínio (±90 / ±180) → **400** `VALIDATION`.
- Geocoding sem resultados → **404** `CITY_NOT_FOUND`.
- Externo não-200, timeout ou erro inesperado → **500** `INTERNAL`.

**Headers (todas as rotas, inclusive erros):** `Cache-Control: no-store`; sem `ETag` (`app.disable('etag')`); CORS conforme o ambiente.

## Pontos de Integração

- **Open-Meteo Geocoding** — `https://geocoding-api.open-meteo.com/v1/search`. Pública, sem chave; tier gratuito (~10k chamadas/dia, não comercial). Parâmetros: `name` (obrigatório; matching por prefixo normalizado com 3+ caracteres, insensível a caixa/diacriticos), `count=1`, `language=pt`. **Sem match retorna 200 com `results: []`** (o backend converte para 404). Parâmetros inválidos → 400 `{error, reason}`.
- **Open-Meteo Forecast** — `https://api.open-meteo.com/v1/forecast`. Pública, sem chave. `timezone=auto` é **obrigatório** quando `daily` é usado; `forecast_hours=24` limita o hourly a 24 passos a partir da hora atual. Erros → 400 `{error, reason}`.
- **Geolocalização do navegador** — `navigator.geolocation.getCurrentPosition`; requer contexto seguro (localhost em dev é contexto seguro). Em caso de `PermissionDeniedError` / `PositionUnavailableError` / `TimeoutError` → mensagem amigável e a busca manual permanece disponível. O frontend envia as coordenadas via `?lat=&lon=`.
- **CORS (explícito no backend)** — `NODE_ENV=development` → qualquer origem (`*`), **documentado**; demais ambientes → allow-list via env `CORS_ORIGINS` (separada por vírgula). Métodos: `GET`. Headers autorizados: `Content-Type`, `Accept`.
- **Estratégia de comunicação (documentada e única)** — o frontend chama sempre a **URL absoluta** de `VITE_API_URL` (dev: `http://localhost:3000` em `frontend/.env.local`; produção: URL absoluta do ambiente de build). Sem proxy no Vite.

## Abordagem de Testes

### Testes Unidade

**Backend (Jest + Supertest; `backend/src/__tests__/`):**
- `openMeteo.service.test.js` — `global.fetch` mockado (`jest.spyOn`): geocoding com sucesso (usa `results[0]`, envia `language=pt` e `count=1`); `results` vazio → `CityNotFoundError`; forecast com URL correta (variáveis e `timezone=auto`); resposta 400/500 externa → erro propagado; timeout via `AbortController` (fetch mock que não responde); falha de rede.
- `weather.route.test.js` — serviço mockado (`jest.mock`): 200 por `city` (geocoding + forecast em cadeia); 200 por `lat/lon` (sem geocoding); 400 (parâmetros ausentes, ambos presentes, coordenadas inválidas); 404; 500.
- `noCache.test.js` — header `Cache-Control: no-store` e ausência de `ETag` em respostas 200 e de erro; headers CORS presentes.

**Frontend (Vitest + React Testing Library; `frontend/src/__tests__/`):**
- `weatherCode.test.js` — mapeamento completo de categorias, labels PT-BR, temas e formatadores.
- `weatherApi.test.js` — fetch mockado: URL montada com `VITE_API_URL`; **`cache: 'no-store'` presente em toda chamada**; mapeamento de erros (400/404/500/rede).
- `useWeather.test.js` — fluxo de estados (idle→loading→success/error); guarda de resposta obsoleta (duas buscas em sequência, apenas a última renderiza); geolocalização negada → erro com mensagem amigável.
- Componentes: `SearchBar.test.jsx` (input, submit, disabled durante loading, botão de localização), `CurrentWeather.test.jsx` (valores renderizados + barra UV), `UVBar.test.jsx` (posição do marcador + label acessível), `HourlyChart.test.jsx` (24 pontos, tooltip), `WeeklyForecast.test.jsx` (7 cards, mín/máx, chuva), `ErrorState.test.jsx` (cidade não encontrada vs rede + callback de retry), `Skeletons.test.jsx`, `WeatherIcon.test.jsx` (por categoria), `App.test.jsx` (render integrado: sucesso, loading, erro).
- Mocks: apenas de serviços externos (`fetch`, `navigator.geolocation`); componentes internos renderizados de verdade em `App`.

### Testes de Integração

**Backend (Jest + Supertest):**
- `weather.integration.test.js` — app completo, sem mocks de rota/serviço, apenas `global.fetch` mockado: cadeia geocoding → forecast (assert que a URL do forecast usa as coordenadas do geocoding); status 200/400/404/500 com payload e headers (no-cache, CORS).
- Dados de teste: fixtures fixos (`backend/src/__tests__/fixtures/`) — geocoding de "São Paulo" e forecast com 24 hourly + 7 daily.

### Testes de E2E (Playwright)

**Setup (`e2e/`)** — `@playwright/test` como devDependency de `e2e/package.json`; `playwright.config.js` com base URL `http://localhost:5173`; global setup sobe: (1) servidor HTTP mock das APIs externas, (2) backend com `GEOCODING_BASE_URL`/`FORECAST_BASE_URL` apontando para o mock, (3) frontend (Vite dev/preview).

- **Suite determinística (APIs externas mockadas):**
  1. Carregar `/` → estado inicial com busca visível e sem dados.
  2. Buscar "São Paulo" (mock) → condições atuais + gráfico 24h + 7 cards + tema claro (azulado).
  3. Buscar cidade inexistente (mock com `results: []`) → mensagem amigável de cidade não encontrada.
  4. Geolocalização: `context.grantPermissions(['geolocation'])` + `context.setGeolocation(...)` → clicar no botão → painel com os dados da localização.
  5. Geolocalização negada → mensagem amigável + busca manual continua funcional.
  6. Backend respondendo 500 (mock) → mensagem de erro + "Tentar novamente" reexecuta a busca.
  7. Headers das respostas: `Cache-Control: no-store` e ausência de `ETag` (observados via `page.on('response')`).
- **Smoke real (API Open-Meteo de verdade, executável via `RUN_REAL_E2E=1`):** buscar uma cidade real (ex.: "Curitiba") → assert presença de condições atuais, gráfico e 7 cards.
- **Acessibilidade:** HTML semântico e navegação por teclado (Tab até campo/botões) cobertos nos testes unitários/E2E; contraste WCAG AA validado no QA visual.

## Sequenciamento de Desenvolvimento

### Ordem de Construção

1. **Fundação do backend** — `config/env.js`, `middleware/noCache.js`, `middleware/errorHandler.js`, split `app.js`/`index.js`, 404 JSON. Testes de no-cache e 404. *(Por que primeiro: impõe as restrições de cache/CORS antes de tudo o mais.)*
2. **Serviço Open-Meteo** — `services/openMeteo.js` (geocoding + forecast, `fetch` + timeout) com testes de unidade. *(Depende de 1.)*
3. **Rota `/api/weather`** — `city` e `lat/lon`, validações, 200/400/404/500, testes de rota e integração. *(Depende de 2.)* — Milestone: backend validável por curl (APIs externas → endpoint interno), como prevê o PRD.
4. **Infraestrutura do frontend** — `index.html` (pt-BR), design tokens + temas em `index.css`, `services/weatherApi.js`, `utils/weatherCode.js`, `hooks/useWeather.js` com testes. *(Contrato: passo 3.)*
5. **Casca do painel** — `App.jsx` (estados), `SearchBar`, `ErrorState`, `Skeletons` com testes. *(Depende de 4.)*
6. **Condições atuais** — `CurrentWeather`, `UVBar`, `WeatherIcon` com testes. *(Depende de 5.)*
7. **Gráfico e semana** — `HourlyChart` (Recharts) e `WeeklyForecast` com testes. *(Depende de 5; adiciona a dependência `recharts`.)*
8. **Geolocalização** — `locate()` no hook + botão + erros de permissão com testes. *(Depende de 5 e da rota do passo 3.)*
9. **E2E Playwright** — setup de `e2e/`, suite determinística, smoke real. *(Depende de 3–8.)*
10. **Documentação final** — `README.md` (portas, estratégia de comunicação, env), `backend/.env.example`, `.gitignore`. *(Depende de tudo.)*

### Dependências Técnicas

- Node 18+ (fetch global) no backend e nos ambientes de desenvolvimento.
- Disponibilidade das APIs públicas Open-Meteo (sem chave; tier gratuito não comercial ~10k chamadas/dia) para dev/QA/smoke.
- Novas dependências: `recharts` (frontend) e `@playwright/test` (`e2e/`). Nenhuma outra.
- Navegador com geolocalização em contexto seguro (localhost em dev é suficiente).
- Instalação dos browsers do Playwright para a suite E2E.

## Monitoramento e Observabilidade

O projeto **não possui infraestrutura de monitoramento existente** (nenhum Prometheus/Grafana), então a abordagem é leve e evolutiva:

- **Logs de requisição** (middleware em `app.js`): JSON estruturado no stdout — `method`, `path`, `status`, `durationMs`, `city` (ou `lat/lon`). Nível `info` em produção e `debug` em desenvolvimento.
- **Chamadas externas** (`openMeteo.js`): log de cada chamada (alvo, status, duração, erro) — `warn` em respostas não-2xx; `error` em timeout/falha.
- **Erros não tratados**: o `errorHandler` loga `error` com contexto (rota, parâmetros, stack) e responde 500.
- **Evolução futura (fora de escopo):** endpoint `/metrics` em formato Prometheus e dashboards Grafana, quando o projeto sair do estágio de scaffold.

## Considerações Técnicas

### Decisões Principais

| # | Decisão | Justificativa / trade-offs |
|---|---|---|
| D1 | **URL absoluta + CORS** em todos os ambientes (escolha validada com o usuário) | Estratégia única e consistente; sem proxy no Vite. Custo: CORS sempre ativo (aceitável, explícito e documentado) |
| D2 | Split `app.js` (fábrica) / `index.js` (bootstrap) | Testabilidade com Supertest sem iniciar servidor; o `index.js` atual acopla app e `listen` |
| D3 | **`city` XOR `lat`/`lon`** no mesmo endpoint `GET /api/weather` | Geolocalização entrega coordenadas, não nome; evita reverse geocoding (chamada extra e imprecisão) e duplicação de rota. Alternativas rejeitadas: 2ª rota (duplicação de lógica) e reverse geocoding no frontend (impreciso) |
| D4 | **`fetch` nativo + `AbortController`** (timeout de 10 s) | Zero dependências; suficiente para dois GETs. Rejeitado: axios (sem ganho justificável) |
| D5 | **Recharts** para o gráfico de 24h | Declarativo/composável, compatível com React 19, `ComposedChart` (Line+Bar+Tooltip) é o padrão. Rejeitados: visx (mais código) e SVG manual (manutenção) |
| D6 | **SVGs próprios + animações CSS** para os ícones | Controle total da paleta por tema, bundle leve, sem dependência. Rejeitada: biblioteca de ícones (menos controle estético) |
| D7 | **CSS custom properties + `data-theme`** na raiz do painel | Identidade dinâmica sem injeção de estilos via JS; 3 temas (`clear`/`cloudy`/`rain`); o scaffold já usa CSS puro |
| D8 | UV a partir de **`hourly.uv_index`** (derivando a hora atual), não do bloco `current` | Mais robusto à disponibilidade da variável em `current`; validar via curl na implementação (previsto no PRD) |
| D9 | **Base URLs externas configuráveis** por env (`GEOCODING_BASE_URL`, `FORECAST_BASE_URL`) | Permite E2E determinístico com mocks sem alterar código; default = URLs de produção |
| D10 | **E2E com mocks determinísticos + smoke real** (escolha validada com o usuário) | CI determinístico + validação do caminho real; smoke opcional via `RUN_REAL_E2E=1` |
| D11 | **Apenas hooks** para estado (sem Redux/store global) | Scaffold com um único fluxo; o estado é local ao `useWeather` |
| D12 | **Guarda contra resposta obsoleta** (contador de requisições) | Garante que apenas a busca mais recente renderiza (caso extremo do PRD) |
| D13 | **Sem comentários no código novo** (restrição do PRD) | Aplica-se a todos os arquivos novos; apenas arquivos existentes mantêm os comentários já presentes |

**Conformidade com skills do projeto:** não existem skills de tecnologia em `.agents/skills/` (apenas skills de workflow `do-*`, excluídas desta análise). A conformidade é guiada pelas convenções do `AGENTS.md`: backend em CommonJS, frontend em ESM (`"type": "module"`), arquivos em camelCase, testes em `__tests__/` (`*.test.js`/`*.test.jsx`), variáveis de ambiente nunca versionadas, portas 5173/3000. Nenhuma desconflictância detectada; as novas dependências (Recharts, Playwright) seguem o princípio de preferir bibliotecas estabelecidas.

### Suposições Técnicas

- O geocoding da Open-Meteo retorna resultados relevantes para cidades brasileiras com `language=pt` e matching por prefixo (3+ caracteres) — **validar via curl** no início da implementação (previsto no PRD).
- `uv_index` está disponível no bloco `hourly` da Forecast API — **validar via curl**; fallback: usar `daily=uv_index_max` do dia atual.
- O tier gratuito da Open-Meteo (~10k chamadas/dia, não comercial) é suficiente para desenvolvimento, testes e QA.
- Node 18+ disponível em todos os ambientes (fetch global).
- `navigator.geolocation` disponível nos navegadores alvo, em contexto seguro (localhost em dev).
- Recharts v3.x compatível com React 19.2 (validar na instalação).
- Não há infraestrutura de monitoramento existente no projeto.

### Riscos Conhecidos

| Risco | Impacto | Mitigação |
|---|---|---|
| API externa indisponível ou lenta | Busca falha para o usuário | Timeout de 10 s; 500 com mensagem clara; retry na UI; E2E determinístico com mocks |
| Ambiguidade de geocoding (cidade homônima) | Clima da cidade errada | `language=pt`; primeiro resultado; usuário pode refazer a busca (comportamento aceito no PRD) |
| Temas dinâmicos violarem contraste WCAG AA | Falha de acessibilidade | Tokens fixos por tema; contraste validado no QA visual |
| Tooltip do Recharts inacessível | Falha de acessibilidade | Tooltip customizado com labels acessíveis + alternativa textual no HTML |
| Geolocalização em origem não segura (http) | Funcionalidade indisponível | localhost em dev (contexto seguro); documentado para produção (HTTPS) |
| `uv_index` indisponível em `hourly` | Índice UV ausente no card | Fallback para `daily.uv_index_max` do dia (suposição validada via curl) |

### Arquivos relevantes e dependentes

**Backend:**
- `backend/src/index.js` (modificar — vira apenas bootstrap)
- `backend/src/app.js` (novo)
- `backend/src/config/env.js` (novo)
- `backend/src/middleware/noCache.js` (novo)
- `backend/src/middleware/errorHandler.js` (novo)
- `backend/src/routes/weather.js` (novo)
- `backend/src/services/openMeteo.js` (novo)
- `backend/src/__tests__/weather.route.test.js` (novo)
- `backend/src/__tests__/openMeteo.service.test.js` (novo)
- `backend/src/__tests__/noCache.test.js` (novo)
- `backend/src/__tests__/weather.integration.test.js` (novo)
- `backend/src/__tests__/fixtures/*` (novos)
- `backend/.env.example` (modificar — adicionar `CORS_ORIGINS`, `GEOCODING_BASE_URL`, `FORECAST_BASE_URL`)
- `backend/jest.config.js` (revisar — a cobertura já exclui `src/index.js`, mantendo a regra após o split)

**Frontend:**
- `frontend/index.html` (modificar — `lang="pt-BR"`, título)
- `frontend/src/App.jsx` (modificar)
- `frontend/src/index.css` (modificar — tokens, temas, skeletons, responsivo)
- `frontend/src/App.css` (modificar — estilos do painel)
- `frontend/src/components/SearchBar.jsx` (novo)
- `frontend/src/components/CurrentWeather.jsx` (novo)
- `frontend/src/components/UVBar.jsx` (novo)
- `frontend/src/components/HourlyChart.jsx` (novo)
- `frontend/src/components/WeeklyForecast.jsx` (novo)
- `frontend/src/components/WeatherIcon.jsx` (novo)
- `frontend/src/components/ErrorState.jsx` (novo)
- `frontend/src/components/Skeletons.jsx` (novo)
- `frontend/src/hooks/useWeather.js` (novo)
- `frontend/src/services/weatherApi.js` (novo)
- `frontend/src/utils/weatherCode.js` (novo)
- `frontend/src/__tests__/*` (novos testes por componente + `weatherApi.test.js`, `weatherCode.test.js`, `useWeather.test.js`)
- `frontend/.env.local` (novo, fora do Git — `VITE_API_URL`)
- `frontend/package.json` (modificar — nova dependência `recharts`)
- `frontend/vite.config.js` (sem alteração — a estratégia escolhida não exige proxy)

**E2E / raiz:**
- `e2e/package.json` (novo)
- `e2e/playwright.config.js` (novo)
- `e2e/tests/*.spec.js` (novos)
- `e2e/setup/*` (novo — servidor mock das APIs externas)
- `README.md` (modificar — portas, estratégia de comunicação, variáveis de ambiente, como rodar)
- `.gitignore` (revisar — incluir `e2e/node_modules`, `e2e/test-results`, `.env.local`)
