# Especificação Técnica — Painel de Monitoramento de Clima

## Resumo Executivo

O Painel do Clima será implementado como uma aplicação monorepo com backend Express (CommonJS) atuando como proxy para as APIs Open-Meteo e frontend React 19 + Vite (ESM) consumindo exclusivamente o backend. A arquitetura centraliza toda comunicação externa no backend, que orquestra geocoding + forecast em uma única chamada. O frontend adota o design system Superhuman-inspired documentado em `frontend/DESIGN.md`, com Chart.js (via react-chartjs-2) para o gráfico interativo de previsão horária e SVGs animados via CSS para ícones de condições climáticas WMO.

## Arquitetura do Sistema

### Visão Geral dos Componentes

**Backend (novos/modificados):**
- `src/routes/weather.js` — Router Express com o endpoint `GET /api/weather`
- `src/services/geocoding.js` — Serviço de geocoding via Open-Meteo Geocoding API
- `src/services/forecast.js` — Serviço de forecast via Open-Meteo Forecast API
- `src/middleware/errorHandler.js` — Middleware global de tratamento de erros
- `src/index.js` — Registro do router e middleware (modificação do existente)

**Frontend (novos):**
- `src/App.jsx` — Componente raiz com state management da busca (modificação)
- `src/components/SearchBar.jsx` — Campo de busca + botão de geolocalização
- `src/components/CurrentWeather.jsx` — Cards de clima atual (temperatura, umidade, vento, UV, precipitação)
- `src/components/WeatherIcon.jsx` — Mapeamento WMO code → SVG animado
- `src/components/HourlyForecast.jsx` — Gráfico Chart.js com temperatura + precipitação (dual Y-axis)
- `src/components/DailyForecast.jsx` — Cards horizontais de 7 dias com barras min/max
- `src/components/SkeletonLoader.jsx` — Skeletons animados para cada seção
- `src/components/ErrorMessage.jsx` — Mensagem de erro com retry
- `src/hooks/useWeather.js` — Hook customizado para busca de clima (city ou lat/lon)
- `src/services/weatherApi.js` — Cliente HTTP para o backend
- `src/utils/weatherCodes.js` — Mapa de WMO codes → labels, ícones, cores

**Fluxo de dados:**
```
Usuário → SearchBar → useWeather hook → weatherApi → GET /api/weather
  → Backend (geocoding.js → forecast.js) → Open-Meteo APIs
  → Response unificada → useWeather state → CurrentWeather + HourlyForecast + DailyForecast
```

## Design de Implementação

### Interfaces Principais

```js
// weatherApi.js — cliente HTTP
const weatherApi = {
  fetchByCity(city)  → Promise<WeatherPayload>
  fetchByCoords(lat, lon) → Promise<WeatherPayload>
}

// useWeather.js — hook
function useWeather() {
  // Retorna: { data, loading, error, searchCity, searchCoords, retry }
}

// weatherCodes.js — utilitário
const weatherCodes = {
  getLabel(code)       → string   // "Céu limpo", "Chuva moderada", etc.
  getIconName(code)    → string   // "clear", "rain", etc.
  getThemeColor(code)  → string   // cor dinâmica para o hero
}
```

### Modelos de Dados

**Parâmetros do endpoint:**
```
GET /api/weather?city=São Paulo     → geocoding + forecast
GET /api/weather?lat=-23.55&lon=-46.63  → forecast direto (sem geocoding)
```

**Payload de resposta do backend (segue formato Open-Meteo com adição mínima):**
```js
{
  location: {
    name: "São Paulo",       // ausente quando busca por lat/lon
    latitude: -23.5475,
    longitude: -46.63611,
    timezone: "America/Sao_Paulo"
  },
  current: {
    temperature_2m: 20.9,
    relative_humidity_2m: 81,
    wind_speed_10m: 4.9,
    weather_code: 0,
    precipitation: 0.0,
    is_day: 1
  },
  current_units: { /* unidades Open-Meteo */ },
  hourly: {
    time: ["2026-05-05T00:00", ...],       // próximas 24h
    temperature_2m: [19.0, ...],
    precipitation: [0.0, ...]
  },
  hourly_units: { /* unidades */ },
  daily: {
    time: ["2026-05-05", ...],             // 7 dias
    weather_code: [0, ...],
    temperature_2m_max: [27.2, ...],
    temperature_2m_min: [16.1, ...],
    uv_index_max: [6.2, ...],
    precipitation_sum: [1.5, ...]
  },
  daily_units: { /* unidades */ }
}
```

**Payload de erro (formato consistente):**
```js
{ error: true, message: "Cidade não encontrada" }    // 404
{ error: true, message: "Parâmetros inválidos" }      // 400
{ error: true, message: "Erro ao consultar o clima" } // 500
```

### Endpoints de API

| Método | Caminho | Descrição | Sucesso | Erro |
|--------|---------|-----------|---------|------|
| GET | `/api/weather?city=<nome>` | Busca clima por nome de cidade (geocoding + forecast) | 200 | 400, 404, 500 |
| GET | `/api/weather?lat=<lat>&lon=<lon>` | Busca clima por coordenadas (forecast direto, sem geocoding) | 200 | 400, 500 |

**Parâmetros Open-Meteo utilizados:**
- `current`: `temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,is_day`
- `hourly`: `temperature_2m,precipitation`
- `daily`: `weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum`
- `timezone`: `auto`
- `forecast_days`: `7`

## Pontos de Integração

- **Open-Meteo Geocoding API** (`https://geocoding-api.open-meteo.com/v1/search`): Usada apenas no fluxo de busca por cidade. Parâmetros: `name`, `count=1`, `language=pt`. Retorna `results[0].latitude/longitude` para a chamada de forecast.
- **Open-Meteo Forecast API** (`https://api.open-meteo.com/v1/forecast`): Chamada com coordenadas obtidas do geocoding ou recebidas diretamente do frontend (geolocalização). Sem autenticação necessária.
- **navigator.geolocation**: Usado no frontend para obter coordenadas do usuário. Fluxo: solicitar permissão → enviar lat/lon ao backend → exibir dados.

**Tratamento de erros:**
- Geocoding sem resultados → 404 com mensagem "Cidade não encontrada"
- Parâmetros ausentes/inválidos → 400 com mensagem descritiva
- Falha em APIs externas → 500 com mensagem genérica + log no console
- Timeout nas chamadas externas → 15s no backend via `AbortController`

## Abordagem de Testes

### Testes de Unidade

**Backend (Jest + Supertest):**
- `weather.js` router: validação de parâmetros (city vazio, lat/lon inválidos, sem parâmetros)
- `geocoding.js`: mock do fetch para Geocoding API — sucesso e lista vazia
- `forecast.js`: mock do fetch para Forecast API — sucesso e erro
- `errorHandler.js`: verifica formato consistente de erro

**Frontend (Vitest + React Testing Library):**
- `weatherApi.js`: mock de fetch para `/api/weather` — sucesso por cidade, sucesso por coords, erro 404, erro de rede
- `useWeather.js`: estados loading/success/error, retry
- `weatherCodes.js`: mapeamento de códigos WMO conhecidos
- Componentes: renderização condicional (loading → data → error)

### Testes de Integração

- Backend completo: request → geocoding + forecast → response unificada (com mocks das APIs externas)
- Validação de que o payload segue o contrato documentado

### Testes de E2E

- Usando Playwright: buscar cidade → verificar dados exibidos → verificar gráfico renderizado
- Fluxo de erro: buscar cidade inexistente → verificar mensagem de erro
- Fluxo de geolocalização: mock de `navigator.geolocation` → verificar carregamento

## Sequenciamento de Desenvolvimento

### Ordem de Construção

1. **Backend: serviços + endpoint** (`geocoding.js`, `forecast.js`, `weather.js`, `errorHandler.js`) — fundação para o frontend consumir
2. **Frontend: serviço API + hook** (`weatherApi.js`, `useWeather.js`) — camada de dados pronta antes dos componentes
3. **Frontend: utilitários** (`weatherCodes.js`) — WMO code mapping necessário para ícones e labels
4. **Frontend: SearchBar + ErrorMessage + SkeletonLoader** — UI de entrada e feedback
5. **Frontend: CurrentWeather + WeatherIcon** — cards de clima atual com SVGs animados
6. **Frontend: HourlyForecast** — gráfico Chart.js (depende de react-chartjs-2 instalado)
7. **Frontend: DailyForecast** — cards de 7 dias
8. **Frontend: App.jsx** — orquestração de todos os componentes
9. **Testes E2E** — validação completa com Playwright

### Dependências Técnicas

- `chart.js` e `react-chartjs-2` devem ser instalados no frontend (`npm install chart.js react-chartjs-2`)
- `node-fetch` ou `undici` no backend para chamadas HTTP (Node 18+ já inclui fetch global, verificar versão alvo)
- Fonte `Super Sans VF` — se não disponível como asset, definir fallback com `system-ui` conforme DESIGN.md
- Nenhum serviço de infraestrutura adicional necessário

## Monitoramento e Observabilidade

- **Métricas de performance do backend**: tempo de resposta do endpoint `/api/weather` (log de `generationtime_ms` do Open-Meteo + tempo total)
- **Logs**: `console.error` para falhas em APIs externas com status code e mensagem
- **Frontend**: nenhum sistema de monitoring externo nesta versão — apenas tratamento visual de erros

## Considerações Técnicas

### Decisões Principais

- **Endpoint único com dois modos** (`city` ou `lat/lon`): Evita duplicação de lógica de forecast e simplifica o contrato. O backend detecta o modo pelos parâmetros recebidos.
- **UV Index como `uv_index_max` diário**: A API Open-Meteo não oferece UV instantâneo — o valor diário máximo é exibido no card atual como referência do dia.
- **Geolocalização sem reverse geocoding**: Quando o usuário usa geolocalização, o display exibe "Sua localização" em vez do nome da cidade. Evita dependência de API adicional.
- **SVGs animados via CSS**: Ícones de clima como componentes SVG React com animações CSS (`@keyframes`). Sem dependência de biblioteca externa de ícones.
- **react-chartjs-2 v5 com Chart.js v4**: Wrapper oficial, gerencia ciclo de vida do canvas. Pode gerar aviso de peer dependency com React 19, mas funcionalmente compatível.

### Suposições Técnicas

- Open-Meteo APIs são gratuitas e não requerem chave para uso não-comercial nesta escala
- Node.js 18+ está disponível (fetch global nativo)
- O navegador do usuário suporta `navigator.geolocation`
- A fonte Super Sans VF pode não estar disponível — o fallback `system-ui` será usado

### Riscos Conhecidos

- **Rate limiting do Open-Meteo**: Sem autenticação, pode haver limites em uso intensivo. Mitigação: não há funcionalidade de autocomplete (reduz chamadas).
- **react-chartjs-2 peer dep warning**: Aviso de peer dependency com React 19. Mitigação: instalar com `--legacy-peer-deps` se necessário.
- **Fonte Super Sans VF**: Fonte proprietária pode não estar disponível. Mitigação: fallback system-ui já especificado no DESIGN.md.

### Arquivos relevantes e dependentes

- `backend/src/index.js` — ponto de entrada, receberá registro do router e error handler
- `frontend/src/App.jsx` — componente raiz, será reescrito
- `frontend/src/App.css` — estilos globais, será preenchido com design system
- `frontend/src/index.css` — reset CSS e variáveis de design tokens
- `frontend/DESIGN.md` — referência de design system (leitura, não modificação)
- `frontend/vite.config.js` — pode precisar de proxy para `/api` em desenvolvimento
- `backend/package.json` — pode precisar de `cors` se frontend e backend rodam em portas diferentes
