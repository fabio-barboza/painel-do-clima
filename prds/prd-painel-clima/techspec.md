# Especificação Técnica — Painel do Clima

## Resumo Executivo

O backend Express passa a expor `GET /api/weather`, que resolve a cidade na API de geocoding da Open-Meteo, consulta a API de previsão e devolve o payload original acrescido de `location`. O frontend React consome esse endpoint por URL absoluta (`VITE_API_URL`) com CORS explícito, e nunca fala com a Open-Meteo. Não há cache HTTP em nenhum ponto: ETag desabilitada, `Cache-Control: no-store` em toda resposta e `cache: 'no-store'` em todo `fetch`.

A interface é um porte direto de `painel.html`, a fonte de verdade visual. O bloco `<style>` é copiado sem alterações para `frontend/src/index.css`, o sprite SVG é copiado sem alterações para `frontend/index.html` e o markup é convertido em componentes React que mantêm classes, ids, hierarquia e textos. Tudo o que o PRD autoriza acrescentar fica isolado em `frontend/src/additions.css`, com uma lista fechada de valores novos. Nenhuma dependência nova é adicionada a nenhum dos pacotes.

## Arquitetura do Sistema

### Visão Geral dos Componentes

```
Navegador (5173 / 4173)                Backend (3000)                  Open-Meteo
React ── fetch no-store ──► GET /api/weather ──► geocoding-api.open-meteo.com/v1/search
                            └─ cidade ou lat/lon ─► api.open-meteo.com/v1/forecast
```

**Backend (arquivos novos, salvo indicação)**

| Arquivo | Responsabilidade |
|---|---|
| `backend/src/app.js` | Monta o app Express: ETag desligada, middlewares, rotas e tratamento de erro. Não chama `listen`. |
| `backend/src/index.js` (modificado) | Carrega `dotenv`, importa `app` e chama `listen`. Exporta `app`. |
| `backend/src/routes/health.js` | Rota `GET /health`, movida de `index.js` sem mudança de contrato. |
| `backend/src/routes/weather.js` | Rota `GET /api/weather`: orquestra validação, geocoding e previsão. |
| `backend/src/lib/parseWeatherQuery.js` | Valida e normaliza a query string. |
| `backend/src/lib/httpError.js` | Classe `HttpError(status, code, message)`. |
| `backend/src/services/openMeteo.js` | `geocodeCity` e `fetchForecast`: única camada que conhece as URLs externas. |
| `backend/src/middleware/noStore.js` | Define `Cache-Control: no-store` em toda resposta. |
| `backend/src/middleware/cors.js` | CORS explícito, sem o pacote `cors`. |
| `backend/src/middleware/errorHandler.js` | Traduz erros para o JSON de erro. |

A separação entre `app.js` e `index.js` elimina dois problemas conhecidos do scaffold: importar `index.js` sobe um servidor real nos testes (`EADDRINUSE`) e a cobertura exclui `src/index.js`.

**Frontend (arquivos novos, salvo indicação)**

| Arquivo | Responsabilidade |
|---|---|
| `frontend/index.html` (modificado) | `lang="pt-BR"`, título, descrição, links de fonte e sprite SVG, iguais a `painel.html`. |
| `frontend/vite.config.js` (modificado) | Fixa `server.port: 5173` e `preview.port: 4173`. |
| `frontend/src/main.jsx` (modificado) | Importa `index.css` e, depois, `additions.css`. |
| `frontend/src/index.css` (modificado) | Cópia literal do conteúdo do `<style>` de `painel.html` (linhas 12 a 389). |
| `frontend/src/additions.css` | Somente as adições autorizadas. |
| `frontend/src/App.jsx` (modificado) | Composição do painel e escolha entre vazio, skeleton e dados. |
| `frontend/src/api/weather.js` | `fetchWeather` e `WeatherApiError`. |
| `frontend/src/hooks/useWeather.js` | Estado da consulta, concorrência, geolocalização e nova tentativa. |
| `frontend/src/hooks/useReveal.js` | `IntersectionObserver` da revelação. |
| `frontend/src/hooks/useCountUp.js` | Contagem animada da temperatura. |
| `frontend/src/lib/weatherCodes.js` | Código WMO para descrição, grupo de ícone e variante de fundo. |
| `frontend/src/lib/format.js` | Formatação, escalas das barras, UV, direção do vento e datas. |
| `frontend/src/lib/chartGeometry.js` | Geometria pura do gráfico. |
| `frontend/src/lib/stars.js` | Gera as 140 estrelas uma única vez, em nível de módulo. |
| `frontend/src/components/*.jsx` | Ver a tabela de componentização. |

`frontend/src/App.css` permanece vazio e não é importado.

**Fluxo de dados:** `SearchBar` chama `useWeather`, que chama `fetchWeather`, que chama o backend. O resultado desce por props até os componentes de exibição, que apenas formatam e renderizam. A variante de fundo é derivada de `data.current.weather_code` durante o render.

### Comunicação e portas

| Ambiente | Frontend | Backend | Origem da API | CORS |
|---|---|---|---|---|
| Desenvolvimento | `npm run dev`, porta 5173 | `npm run dev`, porta 3000 | `VITE_API_URL=http://localhost:3000` | Sem `CORS_ORIGINS`, responde `Access-Control-Allow-Origin: *` |
| Produção | `npm run build` + `npm run preview`, porta 4173 | `npm start`, porta 3000 | `VITE_API_URL` definido no build | Somente as origens de `CORS_ORIGINS`, ex.: `http://localhost:4173` |

A estratégia é **URL absoluta com CORS**, sem proxy do Vite. `VITE_API_URL` usa `http://localhost:3000` como padrão quando ausente. Em `NODE_ENV=production` sem `CORS_ORIGINS`, nenhuma origem é liberada. O `README.md` e os arquivos `.env.example` documentam essa tabela. `frontend/.env.example` é um arquivo novo.

## Design de Implementação

### Interfaces Principais

**Backend (CommonJS)**

```js
parseWeatherQuery(query)
// { type: 'city', city } | { type: 'coords', latitude, longitude } | lança HttpError(400)

geocodeCity(name)
// Promise<{ name, region, country, latitude, longitude } | null>; lança HttpError(502)

fetchForecast({ latitude, longitude })
// Promise<objeto da Open-Meteo>; lança HttpError(502)

createCors({ origins, isProduction })
// middleware Express
```

**Frontend (ESM)**

```js
fetchWeather(query, { signal })
// query: { city } | { lat, lon }
// Promise<WeatherResponse>; lança WeatherApiError { kind: 'invalid' | 'not_found' | 'network' }

useWeather()
// { status, busy, data, locationLabel, notice, search(text), locate(), retry() }
// status: 'idle' | 'loading' | 'ready'
// busy: null | 'search' | 'locate'
// notice: null | { kind: 'info' | 'error', message, canRetry }

useReveal()                    // [ref, revealed]
useCountUp(target)             // inteiro atual da animação
getWeatherInfo(code)           // { label, icon, sky }
buildChartGeometry({ temps, precip, nowIndex })
// { W, H, PL, PR, PT, PB, tMin, tMax, points, lineD, areaD, yTicks, xTicks, nowX, nowY, bars, step }
```

**Concorrência em `useWeather` (RF-15):** cada consulta incrementa um `requestId` em `useRef` e aborta o `AbortController` anterior. Só a consulta com o id corrente altera o estado, inclusive quando o callback de geolocalização retorna depois de uma busca por nome. Um timeout de 20 s no cliente aborta o fetch e conta como falha de comunicação.

**Regras de interação:**

- Enquanto `busy` estiver ativo, os botões recebem `aria-disabled="true"` e a classe `is-busy`, e os handlers retornam sem agir. O atributo `disabled` não é usado porque tiraria o foco do teclado.
- O botão de localização entra em `busy` já no pedido de permissão, e `status` só vira `loading` depois de obter as coordenadas. A busca por nome continua disponível nessa espera e substitui o pedido, para que um prompt de permissão ignorado não trave o painel.
- A geolocalização usa `{ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }`. Ao clicar, o campo é limpo e recebe foco, como em `painel.html`.
- `retry()` repete a última consulta guardada em `useRef`. Coordenadas ficam apenas em memória (restrição de privacidade do PRD).
- Em nova busca, o skeleton substitui os cards, `data` permanece no estado e, se a consulta falhar, os cards voltam com a mensagem (RF-39). Os blocos remontados repetem a revelação.

| Situação | `notice` | Retry |
|---|---|---|
| Busca vazia | `info`: "Digite o nome de uma cidade ou região para pesquisar." | Não |
| 400 | `error`: "Não entendemos essa busca. Revise o texto e tente novamente." | Não |
| 404 | `error`: "Não encontramos essa cidade. Confira o nome e tente novamente." | Não |
| 502, 5xx, rede ou timeout | `error`: "Não foi possível obter os dados do clima agora." | Sim, "Tentar novamente" |
| Geolocalização indisponível ou negada | `error`: "Não foi possível obter sua localização. Verifique a permissão do navegador ou pesquise pelo nome da cidade." | Não |

### Modelos de Dados

**`WeatherResponse`:** payload da Open-Meteo sem remodelagem, com o campo `location` acrescentado.

```json
{
  "latitude": -25.41,
  "longitude": -49.24,
  "timezone": "America/Sao_Paulo",
  "utc_offset_seconds": -10800,
  "current": {
    "time": "2026-11-02T12:45",
    "temperature_2m": 26.0,
    "relative_humidity_2m": 61,
    "apparent_temperature": 28.1,
    "precipitation": 0.0,
    "weather_code": 2,
    "wind_speed_10m": 18.1,
    "wind_direction_10m": 313,
    "uv_index": 5.65
  },
  "hourly": { "time": ["..."], "temperature_2m": [], "precipitation": [] },
  "daily": {
    "time": ["..."],
    "weather_code": [],
    "temperature_2m_max": [],
    "temperature_2m_min": [],
    "precipitation_sum": [],
    "precipitation_probability_max": []
  },
  "location": { "name": "Curitiba", "region": "Paraná", "country": "Brasil" }
}
```

Consulta por coordenadas devolve `location: { "name": null, "region": null, "country": null }`, e o frontend exibe "Sua localização". Por nome, o rótulo é `name, region` (`Curitiba, Paraná`). `region` vem de `admin1`, com fallback para `country`.

**Erro:** `{ "error": { "code": "CITY_NOT_FOUND", "message": "..." } }`. Códigos: `INVALID_PARAMS`, `CITY_NOT_FOUND`, `UPSTREAM_ERROR`, `INTERNAL_ERROR`.

**Derivações no frontend**

| Dado | Regra |
|---|---|
| Hoje e hora "agora" (RF-22, RF-24) | Data e hora vêm de `current.time`, que já está no fuso do local. Nunca usar `new Date()` para isso. |
| 24 horas do gráfico | `hourly.*` filtrado pelos índices cujo `time` começa com a data de `current.time`. |
| Cards dos dias (RF-28) | `daily.time` lido com `Date.UTC` e `getUTCDay`, nunca `new Date('YYYY-MM-DD')` com getters locais, que voltam um dia em fusos negativos. Nomes em tabelas fixas: `Dom, Seg, Ter, Qua, Qui, Sex, Sáb` e `jan` a `dez`. O `Intl` não serve aqui, pois gera `seg.` e `ago.` com ponto. Formato: `16 ago`. |
| Temperaturas | `Math.round`, exibidas como em `painel.html`. |
| Máx e Mín | `daily.temperature_2m_max[0]` e `daily.temperature_2m_min[0]`. |
| Vento | `km/h · NNO`. 16 pontos: `N, NNE, NE, ENE, L, ESE, SE, SSE, S, SSO, SO, OSO, O, ONO, NO, NNO`; índice `Math.round(graus / 22.5) % 16`. |
| UV | Arredondado antes de classificar: 0–2 Baixo, 3–5 Moderado, 6–7 Alto, 8–10 Muito alto, 11+ Extremo. |
| Precipitação | Uma casa decimal com vírgula, `0,2 mm`. |
| Valor nulo | Qualquer campo `null` da Open-Meteo é exibido como `–`, o mesmo placeholder de `painel.html`. |

**Escalas das barras (RF-19):** porcentagem inteira com limite de 0 a 100. As escalas foram escolhidas para reproduzir os valores de `painel.html`.

| Barra | Escala | Conferência com `painel.html` |
|---|---|---|
| Sensação | −10 a 45 °C | 20 °C resulta em 55% |
| Umidade | 0 a 100% | 62% resulta em 62% |
| Vento | 0 a 35 km/h | 14 km/h resulta em 40% |
| UV | 0 a 12 | 6 resulta em 50% |

**Condições (RF-32, RF-34):** tabela completa em `weatherCodes.js`. Código desconhecido usa "Condição indisponível", ícone de nuvem e fundo de referência.

| Códigos WMO | Descrições | Ícone | Cor em `.d-ico` | Fundo |
|---|---|---|---|---|
| 0, 1 | Céu limpo; Predominantemente limpo | `i-sun` | `#ffd76a` | `reference` |
| 2 | Parcialmente nublado | `i-cloud-sun` | `#ffd76a` | `reference` |
| 3 | Encoberto | `i-cloud` | `#c9d6f2` | `cloudy` |
| 45, 48 | Neblina; Neblina com geada | `i-fog` (novo) | `#c9d6f2` | `cloudy` |
| 51, 53, 55 | Garoa leve, moderada, intensa | `i-rain` | `#7cc4ff` | `rain` |
| 56, 57 | Garoa congelante leve, intensa | `i-rain` | `#7cc4ff` | `rain` |
| 61, 63, 65 | Chuva fraca, moderada, forte | `i-rain` | `#7cc4ff` | `rain` |
| 66, 67 | Chuva congelante fraca, forte | `i-rain` | `#7cc4ff` | `rain` |
| 71, 73, 75, 77 | Neve fraca, moderada, forte; Grãos de neve | `i-snow` (novo) | `#c9d6f2` | `rain` |
| 80, 81, 82 | Pancadas de chuva fracas, moderadas, violentas | `i-rain` | `#7cc4ff` | `rain` |
| 85, 86 | Pancadas de neve fracas, fortes | `i-snow` | `#c9d6f2` | `rain` |
| 95 | Trovoada | `i-storm` | `#c9b8ff` | `rain` |
| 96, 99 | Trovoada com granizo fraco, forte | `i-storm` | `#c9b8ff` | `rain` |
| 97 | Trovoada forte | `i-storm` | `#c9b8ff` | `rain` |

### Endpoints de API

**`GET /api/weather`**

Aceita `city` ou o par `lat` e `lon`. Enviar `city` junto com coordenadas é inválido.

| Status | Quando |
|---|---|
| 200 | Consulta bem-sucedida. |
| 400 | Sem parâmetros; `city` vazio, só com espaços, repetido ou com mais de 100 caracteres; só `lat` ou só `lon`; coordenada não decimal ou fora de −90..90 e −180..180; `city` junto com coordenadas. |
| 404 | Geocoding sem o campo `results`. Inclui nomes de um caractere, que a Open-Meteo responde com 200 sem resultados. |
| 502 | Timeout, falha de rede, status não 2xx ou JSON inválido em qualquer serviço externo. |

`GET /health` mantém o contrato atual. Todas as respostas, inclusive erros, 404 de rota e preflight, levam `Cache-Control: no-store` e não têm `ETag`.

**CORS:** `Access-Control-Allow-Methods: GET, OPTIONS`, `Access-Control-Allow-Headers: Content-Type` e `Vary: Origin` quando há lista de origens. `OPTIONS` responde 204. Ordem em `app.js`: `app.disable('etag')`, `noStore`, `cors`, `express.json`, rotas, `errorHandler`.

### Fidelidade visual: design system

`painel.html` é a fonte de verdade, e os valores abaixo são registro para consulta. A implementação usa o CSS copiado, sem valores "equivalentes". Em caso de divergência, vale o arquivo.

**Tokens e cores**

| Papel | Valor |
|---|---|
| `--text` | `#eef2ff` |
| `--muted` | `rgba(226,235,255,.62)` |
| `--faint` | `rgba(226,235,255,.38)` |
| `--cyan` | `#6ee7ff` |
| `--violet` | `#a78bfa` |
| `--amber` | `#ffd76a` |
| `--border` | `rgba(255,255,255,.12)` |
| `--radius` | `24px` |
| Fundo do `body` | `#070b1d` |
| Gradiente base | `linear-gradient(180deg,#070b1d 0%,#0b1130 55%,#111a40 100%)` |
| Brilhos radiais | `rgba(59,90,180,.35)`, `rgba(124,58,237,.22)`, `rgba(14,116,144,.18)` |
| Texto sobre destaque | `#0b1026` |
| Superfícies | `linear-gradient(155deg,rgba(255,255,255,.09),rgba(255,255,255,.03))`, `rgba(255,255,255,.04)`, `.06`, `.07`, `.08` |
| Estados | `#4ade80` (pulso), `#ffc98b` (chip hot), `#9dd7ff` (chip cold) |
| Ícones de estatística | `#ff9f7a`, `#7cc4ff`, `#9be8c9`, `#ffd76a` |
| Gráfico | `#6ee7ff` a `#a78bfa` (linha), `rgba(110,231,255,.30)` a `0` (área), `#0b1130` (pontos) |

**Tipografia:** `'Inter',-apple-system,'Segoe UI',Roboto,Ubuntu,sans-serif`, carregada do Google Fonts com a mesma URL do arquivo (pesos 300, 400, 500, 600, 700) e os mesmos `preconnect`.

| Elemento | Tamanho | Peso | Outros |
|---|---|---|---|
| `.brand h1` | 19px | 600 | `letter-spacing:-.01em` |
| `.brand small` | 12px | 400 | `--muted` |
| `.clock .time` | 26px | 300 | `.04em`, tabular |
| `.clock .date` | 12.5px | herdado | capitalizado |
| `.search input` | 15px | 400 | |
| `.btn` | 14px | 500 (600 em primary) | `line-height:1` |
| `.card-head h2` | 17px | 600 | `-.01em` |
| `.card-head .sub` | 12.5px | herdado | `--muted` |
| `.loc` | 14px | 500 | |
| `.temp` | `clamp(64px,8.5vw,104px)`; 64px até 480px | 200 declarado | `line-height:.95`, `-.04em`, tabular |
| `.condition` | `clamp(15px,1.6vw,18px)` | 500 | |
| `.chip` | 12.5px | 500, `b` 600 | |
| `.stat-label` | 12.5px | 500 | |
| `.stat-val` | `clamp(22px,2.4vw,28px)` | 600 | `-.02em`, tabular |
| `.stat-val small` | 13px | 400 | |
| `.axis-label` | 12px | herdado (600 em `.now-label`) | |
| `.tip` | 13px | 500 | |
| `.d-name` | 13.5px | 600 | |
| `.d-temps b` / `span` | 16.5px / 13px | 600 / herdado | |
| `.d-date`, `.chart-hint` | 11.5px | herdado | |
| `.d-rain` | 11px | herdado | |
| `footer` | 12px | herdado | |

**Armadilha de `.temp`:** o peso 200 é declarado, mas não é carregado. Não acrescente 200 à URL da fonte nem altere a regra, pois o navegador usa o peso carregado mais próximo (300). Assim, o resultado renderizado e o valor computado ficam iguais aos do arquivo.

**Espaçamentos, raios, sombras e blur**

| Grupo | Valores |
|---|---|
| Container | `max-width:1180px`, `padding:clamp(20px,4vw,44px)`, `gap:22px` |
| Grades | `.grid-main` `minmax(300px,5fr) 7fr` gap 22px; `.grid-stats` 4 colunas gap 18px; `.weekly-grid` 7 colunas gap 14px |
| Paddings | `.card` `clamp(18px,2.5vw,28px)`; `.stat` `clamp(16px,2vw,22px)`; `.day` `16px 8px`; `.search` `8px`; `.btn` `11px 18px`; `.chip` `7px 13px` |
| Raios | 24px (`.card`), 20px (`.search`), 18px (`.day`), 15px (`.brand-mark`), 13px (`.btn`), 12px (`.tip`), 11px (`.stat-ico`), 5px (`.bar`), 999px (`.chip`, `.bg-cloud`) |
| Sombras | `.card`: `0 24px 60px -24px rgba(0,0,0,.55)`; `.search`: `0 18px 44px -22px rgba(0,0,0,.5)`; `.btn-primary`: `0 10px 24px -8px rgba(110,231,255,.5)`; `.brand-mark`: `0 8px 24px -6px rgba(110,231,255,.45)`; `.tip`: `0 10px 30px -10px rgba(0,0,0,.6)`; `.moon`: `0 0 70px 20px rgba(253,246,216,.25)` |
| Blur | `backdrop-filter:blur(14px)` com prefixo em `.card` e `.search`; `blur(8px)` em `.tip`; `filter:blur(26px)` em `.bg-cloud` |
| Breakpoints | `max-width` 920px, 640px, 480px e `prefers-reduced-motion:reduce` |

**Keyframes e tempos**

| Animação | Uso |
|---|---|
| `skyShift` 26s alternate | Fundo do `body::before` |
| `twinkle` | Estrelas: duração 2–5 s, atraso 0–4 s, opacidade .4–1, tamanho .8–2.6 px |
| `moonGlow` 9s | Lua |
| `drift` | Nuvens: 100 s, 150 s e 120 s, com atrasos −20 s, −80 s e −45 s |
| `shoot` | 11 s com atraso 2.5 s; 15 s com atraso 9 s |
| `ping` | 2 s no pulso; 2.4 s no anel do "agora" |
| `spin` 32s | Raios do sol |
| `floaty` 6s | Nuvem do ícone |
| `bob` 5s | Ícones de estatística, atrasos de 0, .6, 1.2 e 1.8 s |
| Revelação | `.8s cubic-bezier(.22,1,.36,1)` com `--d`: `.top` 0s, `.search` .06s, `.current` .08s, gráfico .16s, estatísticas .24s, semana .32s, rodapé .4s |
| Barras | `1.3s cubic-bezier(.22,1,.36,1) .45s` |
| Contagem | Atraso 450 ms, duração 1400 ms, `1 - (1 - p)^3` |
| Linha do gráfico | `stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1) .25s` |
| Área | `opacity 1.4s ease .9s` |
| Pontos | `.4s` e `.5s cubic-bezier(.34,1.56,.64,1)`, atraso `índice * 45ms` |

### Fidelidade visual: estilos

1. `index.css` é a cópia literal das linhas 12 a 389 de `painel.html`. Nenhuma regra é editada, reordenada ou removida, e não há CSS Modules, Tailwind ou CSS-in-JS.
2. `additions.css` é importado depois e só contém classes novas ou modificadores novos. Ele não redefine propriedades de seletores existentes, salvo os casos listados abaixo.
3. Ids usados pelo CSS são obrigatórios no DOM: `#stars`, `#btnLocate`. Os demais ids do arquivo também são mantidos (`searchInput`, `btnSearch`, `chartCard`, `chartWrap`, `clockTime`, `clockDate`, `tempVal`, `locName`, `maxT`, `minT`, `feels`, `statFeels`, `weeklyGrid`).
4. A hierarquia precisa ser preservada. `.card.stat` deve ser filho direto de `.grid-stats`, por causa de `.stat:nth-child`. `.bar i` precisa ficar dentro de um `.reveal.in`.
5. Em `.card.reveal`, a regra `.reveal` sobrescreve o `transition` de `.card` por vir depois no arquivo. Isso é parte do comportamento de referência e não deve ser "corrigido".

**Lista fechada de adições em `additions.css`**

| Adição | Regra |
|---|---|
| UV (RF-20) | `.bar-uv i { background: linear-gradient(90deg,#4ade80,#ffd76a,#ff8a5c,#ef4444); background-size: calc(100% / var(--f)) 100%; }`. `--f` é a fração do preenchimento, com mínimo `.01`, para que a cor corresponda à posição na escala e não ao tamanho do preenchimento. `#ef4444` é a única cor nova do gradiente. |
| Faixa semanal (RF-30) | `<div class="bar d-range"><i>` com `--l` e `--w`: `.d-range { width:100%; margin-top:6px }` e `.d-range i { margin-left:var(--l) }`. Escala: menor mínima e maior máxima dos sete dias. Se forem iguais, `--l:0%` e `--w:100%`. Largura mínima de 4%. |
| Volume de chuva (RF-29) | Dentro de `.d-rain`: `20% · 1,2 mm`. |
| Precipitação no gráfico (RF-23) | `.precip-bar { fill:#7cc4ff; opacity:0; transition:opacity 1.4s ease .9s }`, `.precip-bar.show { opacity:.55 }`, e `opacity:.55` em `prefers-reduced-motion`. |
| Legendas (RF-23) | `.chart-legend { display:flex; gap:10px; flex-wrap:wrap }` e `.dotline.rain { background:#7cc4ff }`. |
| Estado vazio e mensagens | `.notice { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap }`, `.notice p { font-size:14px; font-weight:500 }`. Base em `.card`. |
| Processamento (RF-15) | `.btn.is-busy { opacity:.7; cursor:progress }`, `.btn.is-busy .ico { animation:spin 1.1s linear infinite }`. O texto do botão não muda, para evitar salto de largura. |
| Skeleton (RF-35) | `.skel { color:transparent; background:rgba(255,255,255,.08); border-radius:5px; animation:skelPulse 1.6s ease-in-out infinite }`, keyframe `skelPulse` em opacidade (50% = .5). `.temp.is-skel { background:none }`. `.chart-skel { aspect-ratio:760/300 }`. |
| Ícones grandes | `.big-icon.solo .bi-sun`, `.big-icon.solo .bi-cloud { left:0; bottom:0; width:100% }`. Reutiliza `spin` e `floaty`, sem keyframes novos. |
| Rodapé | `footer a { color:var(--muted) }`. |
| Leitor de tela | `.sr-only`, padrão de ocultação visual. |
| Variantes de fundo | Ver abaixo. |

**Variantes de fundo (RF-31 a RF-33).** O `body::before` não é alterado, e a referência é exatamente ele. Camadas `.sky-layer.sky-cloudy` e `.sky-layer.sky-rain` ficam antes de `#stars`, com `position:fixed; inset:0; z-index:0; pointer-events:none; opacity:0; transition:opacity 1.2s ease; animation:skyShift 26s ease-in-out infinite alternate`. A transição é um crossfade por `opacity`, pois gradientes não interpolam. O wrapper `<div class="sky" data-sky="...">` não recebe estilo próprio, para não criar contexto de empilhamento.

| Variante | Base | Brilhos | Decoração |
|---|---|---|---|
| `reference` | `body::before` | Originais | Todos, sem alteração |
| `cloudy` | `linear-gradient(180deg,#090b11 0%,#0f121a 55%,#181c28 100%)` | `rgba(120,130,150,.18)`, `rgba(90,98,115,.14)` | Estrelas `.25`, lua `.35`, `.bg-cloud` com `rgba(170,178,195,.10)`, sem `.shoot` |
| `rain` | `linear-gradient(180deg,#04070f 0%,#071019 55%,#0a1826 100%)` | `rgba(40,80,120,.25)`, `rgba(30,60,100,.20)` | Estrelas e lua com opacidade 0, sem `.shoot` |

Cada parada foi definida com luminância relativa menor ou igual à parada correspondente da referência, o que atende ao RF-33. Estrelas e lua transitam em `opacity 1.2s ease`. `.shoot` fica oculto por `display:none`, porque sua opacidade é controlada pela animação.

### Fidelidade visual: ícones e gráfico

**Sprite:** as linhas 394 a 486 de `painel.html` são coladas sem alterações em `frontend/index.html`, logo após `<body>` e antes de `#root`. Assim, os atributos SVG não passam por conversão para JSX. Os componentes usam `<svg class="ico"><use href="#i-..."/></svg>` por meio de `Icon.jsx`. Símbolos: `i-sun`, `i-sun-rays`, `i-cloud`, `i-cloud-sun`, `i-rain`, `i-storm`, `i-drop`, `i-wind`, `i-thermo`, `i-uv`, `i-pin`, `i-up`, `i-down`, `i-brand`, `i-search`, `i-gps`.

Só dois símbolos são acrescentados ao final do sprite, derivados dos existentes (RF-34):

- `i-fog`: nuvem de `i-rain` com três linhas horizontais no lugar dos pingos, com `stroke-width="2"` e `stroke-linecap="round"`.
- `i-snow`: nuvem de `i-rain` com três círculos de raio 1.3 no lugar dos pingos.

**Ícone grande (`WeatherIcon`):** o grupo `i-cloud-sun` reproduz as linhas 533 a 546 sem alterações. `i-sun` usa só `.bi-sun`. Os demais grupos usam `.big-icon.solo` com `.bi-cloud`, apontando para o símbolo do grupo e mantendo `floaty`.

**Gráfico:** sem biblioteca, em SVG gerado por JSX, com a mesma ordem de camadas das linhas 718 a 738. Constantes: `W=760, H=300, PL=44, PR=16, PT=26, PB=42`.

| Item | Regra |
|---|---|
| Escala Y | `tMin = floor(min/4)*4`, `tMax = ceil(max/4)*4`, grade a cada 4°. Se `tMax === tMin`, soma 4 a `tMax` (RF-27). |
| Coordenadas | `X(i) = PL + i*(W-PL-PR)/(n-1)` e `Y(t) = PT + (1-(t-tMin)/(tMax-tMin))*(H-PT-PB)`. |
| Curva | Catmull-Rom para Bézier, função `smooth` das linhas 690 a 699, com `toFixed(1)`. |
| Área | Linha + `L X(n-1) H-PB L X(0) H-PB Z`. Usa o último índice real, não `X(23)` fixo. |
| Eixo X | Rótulo a cada 3 horas em `H-PB+24`, "agora" em `H-PB+40`. |
| Agora | `.now-line`, `.now-ring` (r 7) e `.now-dot` (r 4.5), em `X(hora)` e `Y(temperatura da hora)`. |
| Pontos | `.pt` com r 4 e `transitionDelay` de `índice*45ms`. |
| Gradientes | `lineGrad` e `areaGrad`, iguais ao arquivo. |
| Precipitação | `rect.precip-bar` entre a grade e a área: largura `step*.6`, base em `H-PB`, `rx=2`, altura máxima de 30% da área útil, domínio `max(4, maior valor)` mm. Zero não desenha barra. Sem eixo adicional. |

Ordem das camadas: grade e rótulos, barras de precipitação, área, linha, marcador "agora", pontos, guia, ponto de destaque.

**Interação (RF-25, RF-26):** `onMouseMove`, `onMouseLeave`, `onTouchStart`, `onTouchMove` e `onTouchEnd` no `<svg>`, sempre ativos. A divergência de `painel.html`, que não registra esses eventos com `prefers-reduced-motion`, não é reproduzida. O índice é `round((px-PL)/step)`, limitado à série, com `px = (clientX - r.left)/r.width*W`. O tooltip fica em `.chart-wrap`, com `left` limitado por `max(56, largura do tip / 2)`, pois o texto agora é maior que o previsto pelo valor fixo de 56. Formato: `14h · <b>26°C</b> · 0,2 mm · agora`.

**Desenho:** quando o card é revelado, um `useLayoutEffect` lê `getTotalLength()` e define `strokeDasharray` e `strokeDashoffset`. Dois `requestAnimationFrame` aplicam a transição, zeram o offset e adicionam `.show` em área, pontos e barras. O cleanup cancela os frames, necessário para o `StrictMode`. Com movimento reduzido, apenas adiciona `.show`.

### Fidelidade visual: animações e interações

Cada comportamento do `<script>` de `painel.html` tem um destino definido:

| Linhas | Comportamento | Destino |
|---|---|---|
| 625 | Detecção de movimento reduzido | `matchMedia` lido nos efeitos que animam |
| 643–646 | Máx, Mín e Sensação | `CurrentCard`, `StatsGrid` com dados reais |
| 648–660 | 140 estrelas aleatórias | `lib/stars.js` + `SkyBackground` |
| 662–670 | Relógio a cada segundo | `Clock`, com estado próprio e cleanup; `Intl.DateTimeFormat('pt-BR')` com as mesmas opções |
| 672–681 | Grade semanal | `WeeklyCard`, `DayCard` |
| 683–738 | Geometria e SVG | `lib/chartGeometry.js`, `HourlyChart` |
| 740–766 | Desenho do gráfico | `HourlyChart` |
| 773–803 | Guia, ponto e tooltip | `HourlyChart` |
| 806–817 | Contagem da temperatura | `useCountUp`, com valor final direto em movimento reduzido |
| 825–832 | Busca por clique e Enter | `SearchBar` + `useWeather`. O valor padrão "Curitiba, PR" não é reproduzido (RF-09). |
| 833–837 | Localização: limpa e foca o campo | `SearchBar` + `useWeather`, com geolocalização real |
| 839–847 | Revelação com `threshold: 0.15` | `useReveal`, um observador por elemento, com `disconnect` no cleanup |

Hover e foco ficam a cargo do CSS copiado. Os blocos de dados só montam depois da consulta, portanto a revelação ocorre nesse momento. Cabeçalho, busca e rodapé revelam ao abrir a página.

**Skeleton:** `DashboardSkeleton` repete exatamente o markup e as classes reais (`.grid-main`, `.card`, `.current-top`, `.stat`, `.day` etc.), trocando os valores por `<span class="skel">` com texto de exemplo invisível, como `00°`. A altura vem da mesma tipografia, o que evita saltos de layout. `.temp` recebe `.is-skel`, pois o gradiente recortado no texto apareceria sobre o placeholder. A semana usa sete `.day`. O skeleton não usa `.reveal`.

**Acessibilidade:** `lang`, `role="search"`, `aria-label` e `aria-hidden` iguais ao arquivo. Uma região `.sr-only` com `role="status"` fica sempre montada e anuncia "Carregando dados do clima". Erros usam `role="alert"`, orientações usam `role="status"`, e o painel usa `aria-busy` durante o carregamento.

### Componentização

| Seção ou elemento em `painel.html` | Linhas | Componente | Observações |
|---|---|---|---|
| Sprite `<svg><defs>` | 394–486 | Estático em `index.html`; `Icon` para o uso | Acrescenta `i-fog`, `i-snow` |
| `#stars` | 488 | `SkyBackground` | Dentro de `.sky` |
| `.moon` | 489 | `SkyBackground` | |
| `.bg-cloud` (3) | 490–492 | `SkyBackground` | Estilos inline iguais |
| `.shoot`, `.shoot2` | 493–494 | `SkyBackground` | |
| Camadas `.sky-layer` | Nova | `SkyBackground` | Prop `sky` |
| `main.dashboard` | 496 | `App` | |
| `header.top`, `.brand` | 498–505 | `Header` | `--d:0s` |
| `.clock` | 506–509 | `Clock` | Filho de `Header` |
| `.search` e botões | 512–523 | `SearchBar` | `--d:.06s` |
| Avisos | Nova | `Notice` | Entre a busca e os dados |
| Estado vazio | Nova | `EmptyState` | `.card` com `.card-head`, `--d:.08s` |
| Carregamento | Nova | `DashboardSkeleton` | Espelha os blocos de dados |
| `.grid-main` | 525 | `Dashboard` | Agrupa os blocos de dados |
| `section.current` | 527–557 | `CurrentCard` | `--d:.08s` |
| `.current-top` | 528–531 | `CurrentCard` | `.loc`, `.updated`, `.pulse-dot` |
| `.big-icon` | 533–546 | `WeatherIcon` | Por grupo |
| `.temp-block` | 547–550 | `CurrentCard` | `useCountUp` |
| `.current-foot` e `.chip` | 552–556 | `CurrentCard`, `Chip` | Chip novo de precipitação (`.plain`, `i-drop`) |
| `#chartCard` | 559–569 | `HourlyCard` | `--d:.16s`, `.chart-legend`, `.chart-hint` |
| `#chartWrap`, `.tip` | 567 + JS | `HourlyChart` | |
| `.grid-stats` | 573–606 | `StatsGrid` | `--d:.24s`, filhos diretos |
| `.card.stat` e `.bar` | 574–605 | `StatCard` | UV com `.bar-uv` |
| Seção da semana | 608–616 | `WeeklyCard` | `--d:.32s` |
| `.day` | JS 673–681 | `DayCard` | Faixa e volume |
| `footer` | 618–620 | `Footer` | `--d:.4s` |

Marcações de valor mantêm o espaçamento exato: `62<small> %</small>`, `14<small> km/h · NNO</small>`, `6 <small>· Alto</small>`, `20<small> °C</small>`. Em JSX, use `{' '}` onde houver espaço fora do `<small>`.

Textos fixos são iguais aos do arquivo. O rodapé passa a ser `<b>Painel do Clima</b> · dados meteorológicos por <a href="https://open-meteo.com/">Open-Meteo.com</a>`. Estado vazio: título "Consulte o clima" e subtítulo "Pesquise uma cidade ou use sua localização atual para ver as condições do tempo." Legenda de precipitação: "Precipitação (mm)". Chip: `Precipitação <b>0,0 mm</b>`.

**Dados:** todo valor de `painel.html` é exemplo. `HOURLY`, `WEEK`, `DEFAULT_LOC`, `cur + 1`, porcentagens fixas de `--w` e "Parcialmente nublado" não entram no código de produção. Esses valores só existem na fixture de testes.

## Pontos de Integração

| Serviço | Requisição | Observações verificadas por curl |
|---|---|---|
| Geocoding | `GET /v1/search?name={city}&count=1&language=pt&format=json` | Sem resultado, responde 200 sem o campo `results`. Nome de um caractere se comporta igual. `count=1` atende RF-07. |
| Previsão | `GET /v1/forecast?latitude&longitude&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=7` | `uv_index` em `current` funciona, embora a página da documentação não o liste. Erros vêm como 400 com `{ error: true, reason }`. |

- Sem autenticação nem chave.
- Usa o `fetch` global do Node 18+, com `AbortSignal.timeout(8000)` por chamada e sem retentativas automáticas.
- Valores são codificados com `URLSearchParams`.
- Qualquer falha externa vira `HttpError(502, 'UPSTREAM_ERROR')`. A mensagem externa não é repassada ao cliente.

## Abordagem de Testes

Decisão do projeto: fidelidade visual tem somente smoke test durante as tasks. Comparação de capturas, valores computados e comportamento visual pertencem à etapa de QA.

### Testes Unidade

**Backend (Jest), com `global.fetch` simulado:**

- `parseWeatherQuery`: todos os casos da tabela de 400, limites de coordenadas, `city` repetido e combinação inválida.
- `openMeteo`: montagem de URL, ausência de `results`, status não 2xx, timeout e JSON inválido.
- `cors`: origem liberada, bloqueada, `*` em desenvolvimento e produção sem lista.

**Frontend (Vitest), com `fetch` simulado por `vi.stubGlobal`:**

- `weatherCodes`: todos os códigos WMO da tabela e o código desconhecido.
- `format`: vento nos 16 pontos, limites de UV, escalas com limites, data por `Date.UTC`, vírgula decimal e nulos.
- `chartGeometry`: temperaturas negativas, constantes (inclusive múltiplas de 4) e precipitação zero, sem `NaN` nos caminhos (RF-27).
- `useWeather`: busca vazia sem chamada, última consulta vence (RF-15), manutenção dos dados em erro (RF-39), nova tentativa e geolocalização negada.

`frontend/src/__tests__/setup.js` passa a simular `IntersectionObserver`, `matchMedia` e `SVGElement.prototype.getTotalLength`, ausentes no jsdom. O scaffold não declara `user-event` nem MSW, então os testes usam `fireEvent` e `fetch` simulado.

### Testes de Integração

- **Backend, com Supertest sobre `app.js`:** 200 por cidade e por coordenadas, 400, 404, 502, `Cache-Control: no-store`, ausência de `ETag` e preflight `OPTIONS`. `backend/src/__tests__/api.test.js` passa a importar `../app`.
- **Frontend, smoke de `App`:** com a fixture, o estado vazio aparece sem nenhum `fetch`. Depois da busca, aparecem as seções principais, 4 `.stat`, 7 `.day` e 24 `.pt`. A fixture fica em `frontend/src/__tests__/fixtures/weather.js`, reproduz os dados de `painel.html` (`HOURLY`, `WEEK`, início em `2026-08-16`) e será reutilizada no QA.

### Cenários de Aceite

Validados na etapa de QA, com Playwright MCP (`ui-testing`) e mcp-api-test (`api-testing`):

1. **Open-Meteo direto:** curl nas duas APIs confere estrutura e retorno. Depois, o endpoint interno confirma o repasse, incluindo 200, 400, 404 e headers.
2. **CA-01:** capturas de app e `painel.html` em 1280, 768 e 375 px, com a fixture interceptada em `/api/weather`, relógio fixado no mesmo horário nos dois e fundo de referência.
3. **CA-02:** valores computados dos componentes do RF-43 nos três breakpoints.
4. **CA-03:** hover, foco, tooltip, animações e RF-26 com `browser_emulate_media`.
5. **CA-04:** revisão das adições contra a lista fechada desta especificação.
6. **CA-05:** estado vazio, skeleton e erros nos três breakpoints, sem rolagem horizontal.
7. **Fluxos:** busca por cidade, geolocalização concedida e negada, cidade inexistente, falha com nova tentativa e troca entre as três variantes.

## Sequenciamento de Desenvolvimento

### Ordem de Construção

1. **Base do backend:** separar `app.js`, adicionar `noStore`, `cors`, `errorHandler` e ajustar o teste atual. Tudo depende disso.
2. **`GET /api/weather`:** validação, serviço Open-Meteo e rota.
3. **Fundação visual:** `index.html`, `index.css`, sprite, `additions.css`, `vite.config.js` e `SkyBackground`.
4. **Estrutura fixa:** `Header`, `Clock`, `SearchBar`, `Footer`, `EmptyState`, `Notice` e `useReveal`.
5. **Dados no frontend:** `api/weather.js`, `useWeather`, `lib/format.js` e `lib/weatherCodes.js`.
6. **Blocos atuais:** `CurrentCard`, `WeatherIcon`, `StatsGrid`, `useCountUp`.
7. **Gráfico:** `chartGeometry` e `HourlyChart`.
8. **Semana:** `WeeklyCard` e `DayCard`.
9. **Estados e variantes:** `DashboardSkeleton`, regras de erro em tela e variantes `cloudy` e `rain`.
10. **Documentação:** `README.md`, `.env.example` e smoke test final.

### Dependências Técnicas

- Node.js 18+ para o `fetch` global.
- `npm install` nos dois pacotes: `node_modules` não existe hoje em nenhum deles.
- `painel.html` na raiz do repositório.
- Acesso de saída à Open-Meteo e ao Google Fonts.
- Nenhuma dependência npm nova. O pacote `cors` foi dispensado porque o middleware tem poucas linhas.

## Monitoramento e Observabilidade

O projeto não tem Prometheus nem Grafana, e o escopo não justifica introduzi-los. A observabilidade usa o `GET /health` existente e logs em `console`:

- `console.error` para cada 502, com serviço, status ou motivo e duração.
- `console.error` para erros 500 inesperados.
- Nenhum log de coordenadas (restrição de privacidade do PRD).

## Considerações Técnicas

### Decisões Principais

| Decisão | Justificativa | Alternativa rejeitada |
|---|---|---|
| Copiar CSS e sprite sem alterações | Garante igualdade de seletores, valores e media queries | CSS Modules ou reescrita, que abrem espaço para desvios |
| Adições em arquivo separado | Mantém `index.css` comparável ao original | Editar `index.css` |
| Crossfade por camadas | Gradiente não transiciona, e `body::before` fica intacto | Trocar o gradiente do `body::before`, que causaria um corte seco |
| Skeleton com markup real | Mesma altura sem medidas manuais | Blocos com alturas fixas |
| Gráfico em React puro com geometria isolada | Mesma geometria, sem biblioteca e testável | Biblioteca de gráficos, proibida pelo pedido |
| Hora e data vindas do payload | Respeita o fuso do local em RF-22, RF-24 e RF-28 | `new Date()` no cliente |
| `aria-disabled` em vez de `disabled` | Mantém o foco no botão | `disabled`, que perde o foco de teclado |
| URL absoluta com CORS | Comportamento igual em dev e produção | Proxy do Vite |
| `admin1` por extenso | Funciona em qualquer país, sem tabela | Siglas de UF no Brasil |
| Skeleton substitui dados em nova busca | Mesmo feedback do PRD e dados preservados em memória | Manter cards antigos visíveis |

### Suposições Técnicas

- `current.uv_index` continua disponível na API, como confirmado por curl em 2026-11-02, embora não apareça na lista da documentação.
- A Open-Meteo usa deslocamento fixo por resposta com `timezone=auto`, gerando 24 entradas por dia. Uma consulta em dia de mudança de horário em Sydney retornou 24. A geometria aceita outro tamanho de série, usando `n` real.
- A Open-Meteo pode devolver `null` em campos como `precipitation_probability_max`, tratado como `–`.
- O uso permanece dentro do plano gratuito, não comercial, com atribuição CC BY 4.0 no rodapé.
- A geolocalização exige contexto seguro. `localhost` atende em desenvolvimento, e produção fora de `localhost` precisa de HTTPS.
- O `eslint-plugin-react-hooks` 7 traz regras do React Compiler. Essa suposição não foi verificada localmente, pois `node_modules` não está instalado. Por isso, o plano evita `Math.random` e `Date` durante o render, usando módulo e inicializadores preguiçosos, e o lint confirma na execução.

### Riscos Conhecidos

| Risco | Mitigação |
|---|---|
| `backdrop-filter` e empilhamento mudam com wrappers do React | `#root` e `.sky` sem estilos; verificação no CA-01 |
| Ícones com aparência destoante | Derivados dos símbolos existentes, revisão no QA |
| Tooltip mais largo em 375 px | Limite por largura real medida |
| Legendas extras quebram linha no cabeçalho do gráfico | Quebra permitida em `.chart-legend`; adição autorizada pelo PRD |
| Faixa e volume aumentam a altura de `.day` | Adições autorizadas; verificação em 375 px |
| Barras de precipitação cobrem a curva | Altura máxima de 30%, camada atrás da área e da linha |
| Fonte externa instável altera a comparação de capturas | Aguardar `document.fonts.ready` no QA |
| Regressão de CSS sem teste automatizado | Decisão aceita; revisão por diff entre `index.css` e `painel.html` no QA |

### Conformidade com padrões

Skills do projeto: lidas: frontend-design, javascript-typescript-jest, nodejs-backend-patterns, react-testing, vercel-composition-patterns, vercel-react-best-practices, vite, vitest, web-design-guidelines, webapp-testing

MCPs do projeto: usados: context7 (documentation)

| Skill | Desvio | Justificativa |
|---|---|---|
| nodejs-backend-patterns | Sem TypeScript, Zod ou Joi, Pino, rate limiting, compressão | Projeto em JavaScript e sem dependências novas; validação manual e logs em `console`. A recomendação de não usar `*` em produção é seguida. |
| vite | `vite.config.js` em vez de `.ts` | Mantém o arquivo e a linguagem do scaffold. |
| react-testing | Sem MSW, axe e `user-event` | Não declarados no projeto. `fetch` simulado e `fireEvent`. |
| frontend-design | Sem direção visual própria | `painel.html` define o visual, e o brief prevalece. |
| vercel-react-best-practices | Sem SWR | Uma única consulta iniciada pelo usuário não justifica a dependência. `Clock` isola o estado por segundo, conforme as regras de re-render. |

### Arquivos relevantes e dependentes

- `painel.html`, `prds/prd-painel-clima/prd.md`
- `backend/src/index.js`, `backend/src/__tests__/api.test.js`, `backend/jest.config.js`, `backend/.env.example`, `backend/package.json`
- `frontend/index.html`, `frontend/vite.config.js`, `frontend/vitest.config.js`, `frontend/eslint.config.js`, `frontend/package.json`, `frontend/.env.example`
- `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/index.css`, `frontend/src/additions.css`
- `frontend/src/__tests__/App.test.jsx`, `frontend/src/__tests__/setup.js`, `frontend/src/__tests__/fixtures/weather.js`
- `README.md`
