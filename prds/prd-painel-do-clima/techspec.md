# Tech Spec — Painel do Clima

> Feature: `painel-do-clima` · Fonte de verdade de comportamento/dados: `exemplo_requisito.txt` (via PRD) · Fonte de verdade de aparência: `painel.html` (FR-34)

## Resumo Executivo

A solução mantém a arquitetura fixada pelo PRD: SPA React 19 (Vite 8, ESM) em `frontend/` que fala **apenas** com a API Express (Node ≥ 18, CommonJS) em `backend/`, única porta para as APIs externas (Open-Meteo geocoding + forecast, BigDataCloud reverse geocoding). O backend expõe um único endpoint de dados, `GET /api/weather` (200/400/404/502), com envelope leve: payload no formato Open-Meteo + campo `city` resolvido + `hourly` já fatiado para as próximas 24 horas; respostas sempre com `Cache-Control: no-store` e ETags desabilitadas; CORS manual configurável. O frontend porta o CSS e os SVGs do `painel.html` **ipsis litteris** (mesmos seletores, valores, media queries e símbolos), adicionando apenas (a) barras de precipitação e legenda no gráfico por hora, (b) tingimento sutil do fundo por condição, (c) estados ausentes do protótipo (vazio, skeleton, erros) — todos compostos exclusivamente com os tokens do design system do protótipo. Gráfico por hora em SVG puro (mesma geometria W=760/H=300, Catmull-Rom, eixos e tooltip do protótipo), sem biblioteca de gráficos. **Zero dependências novas** nos dois pacotes: `fetch` global do Node 18+ e do navegador, CORS implementado à mão, sem router (rota única `/`). Decisões de contrato foram confirmadas com o produto: chuva semanal por **probabilidade (%)**, janela do gráfico **rolante de 24 h** ("agora" no índice 0), reverse geocoding **BigDataCloud** (best-effort) e QA E2E **com rede real**.

## Arquitetura do Sistema

### Visão Geral dos Componentes

Fluxo de dados: `SearchBar` → `useWeather` (máquina de estados) → `services/weather.js` (`fetch` com `cache: 'no-store'`) → backend `GET /api/weather` → `routes/weather.js` → (geocoding → forecast) ou (forecast ∥ reverse geocoding) → resposta → estado `success` → renderização de `CurrentConditions` + `StatsGrid` + `HourlyChart` + `WeeklyForecast` + `SkyBackground[data-tint]`.

**Backend (novos/modificados):**

| Módulo | Responsabilidade |
|---|---|
| `backend/src/index.js` (modificado) | App Express: `app.set('etag', false)`, middlewares (cache, CORS, log), rota `/api/weather`, 404 JSON, handler de erros; `app.listen` guardado por `require.main === module` (evita EADDRINUSE na suite Jest — particularidade documentada no `AGENTS.md`) |
| `backend/src/config.js` (novo) | Env: `PORT`, `NODE_ENV`, `CORS_ORIGINS` (separado por vírgula; `*` em dev, documentado), URLs das 3 APIs externas, timeout (8 s) |
| `backend/src/middleware/cache.js` (novo) | `Cache-Control: no-store` em toda resposta (FR-07) |
| `backend/src/middleware/cors.js` (novo) | CORS manual (origens/métodos/headers por env; preflight `OPTIONS` → 204) (FR-08) |
| `backend/src/middleware/logger.js` (novo) | Log de acesso: método, rota, status, duração (ms); erros com stack |
| `backend/src/routes/weather.js` (novo) | `GET /api/weather` — validação (400), geocoding (404), forecast (502), envelope (200) |
| `backend/src/services/geocoding.js` (novo) | Cliente Open-Meteo geocoding (`name`, `count=1`, `language=pt`, `format=json`) |
| `backend/src/services/forecast.js` (novo) | Cliente Open-Meteo forecast (`timezone=auto`, `wind_speed_unit=kmh`, `forecast_days=7`) + `sliceHourly24` |
| `backend/src/services/reverseGeocoding.js` (novo) | Cliente BigDataCloud (`localityLanguage=pt`); **sempre** resolve para `Place \| null` (best-effort, nunca derruba a consulta) |
| `backend/src/services/externalError.js` (novo) | Classe `ExternalError { status? }` para falhas/timeout de APIs externas |

**Frontend (novos/modificados):**

| Módulo | Responsabilidade |
|---|---|
| `frontend/index.html` (modificado) | `lang="pt-BR"`, título "Painel do Clima", meta description, `preconnect` + fonte Inter (mesmo `<link>` do protótipo) |
| `frontend/src/index.css` (modificado) | Port **verbatim** do `<style>` do `painel.html` + bloco de acréscimos delimitado (design states, tint, barras do gráfico) usando apenas tokens do protótipo |
| `frontend/src/App.jsx` (modificado) | Orquestração: estado via `useWeather`, layout (Header, SearchBar, seções por estado), `data-tint` no wrapper raiz |
| `frontend/vite.config.js` (modificado) | `server.port: 5173` + proxy `'/api' → http://localhost:3000` (dev) |
| `frontend/.env.example` (novo) | `VITE_API_URL=` (vazio em dev → proxy; produção: `http://localhost:3000`) |
| `frontend/src/components/IconSprite.jsx` (novo) | Sprite SVG oculto com os 16 símbolos do protótipo (mesmos ids `i-*`, mesma geometria) |
| `frontend/src/components/Icon.jsx` (novo) | `<svg class="ico" aria-hidden="true"><use href="#{name}"/></svg>` |
| `frontend/src/components/SkyBackground.jsx` (novo) | `#stars` (140 estrelas com os mesmos ranges de aleatoriedade), `.moon`, 3× `.bg-cloud`, 2× `.shoot` + 2 camadas de tint (FR-31) |
| `frontend/src/components/Header.jsx` (novo) | `.top`: `.brand` (mark + h1 + small) e `Clock` |
| `frontend/src/components/Clock.jsx` (novo) | `.clock`: hora `HH:MM:SS` + data longa pt-BR via `useClock` (tick 1 s) |
| `frontend/src/components/SearchBar.jsx` (novo) | `.search`: ícone, input, botão "Pesquisar" (primary) e "Localização Atual" (ghost); Enter + clique; estado de busca no botão |
| `frontend/src/components/CurrentConditions.jsx` (novo) | `section.card.current`: `.loc`, `.updated` (pulse-dot + "Atualizado HH:MM"), `WeatherIconBig`, temperatura com count-up, condição, chips Máx/Mín/Sensação |
| `frontend/src/components/WeatherIconBig.jsx` (novo) | `.big-icon` por variante de condição: `sun` / `cloud-sun` (composição exata do protótipo) / `cloud` / `rain` / `storm`, animações `spin`/`floaty` do protótipo |
| `frontend/src/components/StatsGrid.jsx` (novo) | `.grid-stats` com 4× `StatCard` (ícone, rótulo, valor, barra `--w`) |
| `frontend/src/components/StatCard.jsx` (novo) | `.card.stat` |
| `frontend/src/components/HourlyChart.jsx` (novo) | `section.card` do gráfico: SVG idêntico ao protótipo + barras de precipitação + legenda 2ª série + tooltip (hover/touch) + animação de entrada |
| `frontend/src/components/WeeklyForecast.jsx` (novo) + `DayCard.jsx` (novo) | `section.card` 7 dias: `.weekly-grid`/`.day` (nome, data, ícone colorido, mín/máx, prob. chuva) |
| `frontend/src/components/EmptyState.jsx` (novo) | Estado vazio (FR-10) — card glassmorphism com convite à busca |
| `frontend/src/components/Skeleton.jsx` (novo) | Skeleton loading espelhando o layout carregado (FR-30) |
| `frontend/src/components/ErrorState.jsx` (novo) | Erros 404/400/rede com retry (FR-14/15/16/37) |
| `frontend/src/components/Footer.jsx` (novo) | Rodapé com texto adaptado (sem "dados simulados" — FR-38) |
| `frontend/src/components/Reveal.jsx` (novo) | Wrapper `.reveal` com `--d` e IntersectionObserver (threshold 0.15, one-shot); prop `instant` para skeleton |
| `frontend/src/hooks/useClock.js` (novo) | Hora/data locais pt-BR a cada 1 s |
| `frontend/src/hooks/useCountUp.js` (novo) | Count-up 1400 ms ease-out cúbico, delay 450 ms, imediato com `prefers-reduced-motion` |
| `frontend/src/hooks/useReveal.js` (novo) | IntersectionObserver one-shot (threshold 0.15) |
| `frontend/src/hooks/useWeather.js` (novo) | Máquina de estados `idle/loading/success/error` + `search`/`locate`/`retry` + AbortController da requisição em voo |
| `frontend/src/services/weather.js` (novo) | `fetchWeather(city)` / `fetchWeatherAtCoords(lat, lon)` — sempre `cache: 'no-store'` (FR-36), base `import.meta.env.VITE_API_URL ?? ''`; mapeia status para `WeatherError.kind` |
| `frontend/src/lib/weatherCodes.js` (novo) | Mapa WMO → `{ label, icon, color, tint }`, faixas de UV, cardinais do vento (funções puras) |
| `frontend/src/lib/format.js` (novo) | Formatação pt-BR: "HH:MM" a partir do ISO da cidade, dia "Hoje/Seg…", data "16 ago" (meses pt-BR em array fixo), números pt-BR (funções puras) |
| `frontend/src/lib/chart.js` (novo) | Geometria do gráfico: escalas, `smoothPath` (Catmull-Rom idêntico ao protótipo), alturas das barras de chuva (funções puras) |

Remoções: `frontend/src/App.css` (vazio, não importado) e `frontend/public/icons.svg` (sobras do template Vite — ícones sociais sem relação com o protótipo; o sprite é o do `painel.html`).

### Componentização — mapa `painel.html` → React

| `painel.html` (seção/elemento, linhas) | React correspondente | FRs |
|---|---|---|
| Bloco `<style>` (11–390) | `frontend/src/index.css` — port verbatim (seletores, valores, keyframes, media queries); bloco de acréscimos ao final | FR-33, FR-37 |
| Sprite `<svg><defs>` com 16 `<symbol id="i-*">` (394–486) | `IconSprite.jsx` (1×) + `Icon.jsx` (uso `<use href="#i-*">`) | FR-21, FR-27 |
| `body::before` céu (32–45), `#stars` (488), `.moon` (489), `.bg-cloud`×3 (490–492), `.shoot`×2 (493–494) | `SkyBackground.jsx` (+ camadas de tint para FR-31) | FR-31, FR-32 |
| `main.dashboard` (496) | `App.jsx` (layout + máquina de estados) | FR-09 |
| `header.top` — `.brand` + `.clock` (498–510) | `Header.jsx` + `Clock.jsx` + `hooks/useClock.js` | FR-38 |
| `.search` — input + `#btnSearch` + `#btnLocate` (512–523) | `SearchBar.jsx` (form semântico; Enter via `onSubmit`) | FR-11…FR-19 |
| `section.card.current` — `.current-top`, `.current-main`, chips (527–557) | `CurrentConditions.jsx` + `WeatherIconBig.jsx` + `useCountUp` | FR-20…FR-22 |
| `section.card#chartCard` + JS do gráfico (559–569, 683–804) | `HourlyChart.jsx` + `lib/chart.js` (+ barras de precipitação e 2ª legenda — acréscimo do PRD) | FR-23…FR-26 |
| `section.grid-stats` — 4× `.card.stat` (573–606) | `StatsGrid.jsx` + `StatCard.jsx` | FR-22 |
| `section.card` 7 dias + JS do grid semanal (608–616, 672–681) | `WeeklyForecast.jsx` + `DayCard.jsx` | FR-27…FR-29 |
| `footer` (618–620) | `Footer.jsx` (texto adaptado; mesmo estilo) | FR-38 |
| JS reveal + delays `--d` (839–847) | `Reveal.jsx` + `useReveal` (delay por seção: 0s/.06s/.08s/.16s/.24s/.32s/.4s) | FR-26, FR-30 |
| JS clock (662–670) | `hooks/useClock.js` | FR-38 |
| JS count-up da temperatura (806–817) | `hooks/useCountUp.js` | FR-20 |
| JS busca/localização (819–837) | `useWeather.js` + `services/weather.js` | FR-11…FR-19 |
| Dados fixos `HOURLY`, `WEEK`, `DEFAULT_LOC` (627–645) | **Removidos** — 100% dos dados vêm do backend (FR-35) | FR-35 |
| — (inexistente no protótipo) | `EmptyState.jsx` (FR-10), `Skeleton.jsx` (FR-30), `ErrorState.jsx` (FR-14/15/16), mensagem de geo-erro (FR-19), barras/legenda de precipitação (FR-23), camadas de tint (FR-31) | FR-10, FR-19…FR-23, FR-30, FR-31, FR-37 |

## Design de Implementação

### Design System (extraído do `painel.html` — valores exatos, sem equivalentes)

**Variáveis `:root`:**

| Token | Valor |
|---|---|
| `--text` | `#eef2ff` |
| `--muted` | `rgba(226,235,255,.62)` |
| `--faint` | `rgba(226,235,255,.38)` |
| `--cyan` | `#6ee7ff` |
| `--violet` | `#a78bfa` |
| `--amber` | `#ffd76a` |
| `--border` | `rgba(255,255,255,.12)` |
| `--radius` | `24px` |

**Tipografia:** família `'Inter', -apple-system, 'Segoe UI', Roboto, Ubuntu, sans-serif`; fonte Inter do Google Fonts com pesos **300;400;500;600;700** (mesmo `<link>` + `preconnect` do protótipo, incluído em `frontend/index.html`); `font-weight: 200` no `.temp` e `300` no `.clock .time` (exatamente como no protótipo, com a mesma síntese de peso); `font-variant-numeric: tabular-nums` onde o protótipo usa. Escala de tamanhos usada: 11 / 11.5 / 12 / 12.5 / 13 / 13.5 / 14 / 15 / 16.5 / 17 / 19 / 26 px e `clamp`s: `.temp clamp(64px,8.5vw,104px)`, `.condition clamp(15px,1.6vw,18px)`, `.stat-val clamp(22px,2.4vw,28px)`, `.big-icon clamp(96px,10vw,128px)`, paddings `clamp(20px,4vw,44px)` (dashboard), `clamp(18px,2.5vw,28px)` (card), `clamp(16px,2vw,22px)` (stat), `clamp(18px,3vw,34px)/clamp(10px,2vw,20px)` (current-main).

**Glassmorphism e superfícies:**

| Superfície | Recurso |
|---|---|
| `body` | `background:#070b1d`; `min-height:100vh`; `overflow-x:hidden`; antialiased |
| Card (`.card`) | `background: linear-gradient(155deg, rgba(255,255,255,.09), rgba(255,255,255,.03))`; `border: 1px solid var(--border)`; `border-radius: var(--radius)`; `backdrop-filter: blur(14px)` (+`-webkit-`); `box-shadow: 0 24px 60px -24px rgba(0,0,0,.55)`; hover: border `rgba(140,180,255,.32)` + sombra `0 24px 60px -20px rgba(0,0,0,.6), 0 0 40px -18px rgba(110,231,255,.35)`; fio de luz `.card::before` (left/right 14%, 1px, gradiente transparente→`rgba(255,255,255,.4)`→transparente) |
| `.search` | Mesma família de gradiente/borda/blur; `border-radius:20px`; `padding:8px`; sombra `0 18px 44px -22px rgba(0,0,0,.5)`; `:focus-within` border `rgba(140,180,255,.42)` + halo `0 0 34px -14px rgba(110,231,255,.4)` |
| `.chip` | `padding:7px 13px`; `border-radius:999px`; `background:rgba(255,255,255,.06)`; variantes `.hot #ffc98b / .cold #9dd7ff / .plain var(--muted)` (borders correspondentes) |
| `.btn` | `padding:11px 18px`; `border-radius:13px`; `:active scale(.95)`; `.btn-primary` gradiente `135deg var(--cyan)→var(--violet)`, texto `#0b1026`, sombra `0 10px 24px -8px rgba(110,231,255,.5)`; `.btn-ghost` `rgba(255,255,255,.06)` |
| `.day` (7 dias) | `border-radius:18px`; `background:rgba(255,255,255,.04)`; hover `translateY(-6px)` + `rgba(255,255,255,.08)` + border `rgba(140,180,255,.3)` |
| Cores de apoio | `.stat-ico` por ícone: thermo `#ff9f7a`, drop `#7cc4ff`, wind `#9be8c9`, uv `#ffd76a`; `.pulse-dot` `#4ade80`; `.now-*` `var(--amber)`; `.d-rain` `#7cc4ff`; `.bi-cloud` `#dbe7ff`; ícones semanais: sun/cloud-sun `#ffd76a`, cloud `#c9d6f2`, rain `#7cc4ff`, storm `#c9b8ff` |

**Céu animado (baseline noturna):** `body::before` com 3 radiais + linear exatamente do protótipo (`radial 1100×700 @85%,-10% rgba(59,90,180,.35)`; `radial 900×600 @-10%,110% rgba(124,58,237,.22)`; `radial 700×500 @50%,120% rgba(14,116,144,.18)`; `linear 180deg #070b1d→#0b1130 55%→#111a40`), animação `skyShift 26s ease-in-out infinite alternate` (`hue-rotate 0→-18deg`, `saturate 1→1.15`); 140 estrelas (tamanho 0.8–2.6 px, opacidade-alvo 0.4–1.0, duração 2–5 s, delay 0–4 s, `twinkle`); `.moon` 76 px `top:150px right:4.5%` com craters radiais + `moonGlow 9s`; 3× `.bg-cloud` (`blur(26px)`, `rgba(147,165,255,.07)`, `drift` 100/150/120 s com delays negativos −20/−80/−45 s, posições/larguras idênticas); 2× `.shoot` (`shoot 11s/15s`, rota 16°, translado 65vw/20vh).

**Layout e espaçamento:** `.dashboard max-width:1180px`, `padding:clamp(20px,4vw,44px)`, gap vertical 22 px; `.grid-main: grid-template-columns: minmax(300px,5fr) 7fr`, gap 22; `.grid-stats: repeat(4,1fr)` gap 18; `.weekly-grid: repeat(7,1fr)` gap 14; `.card-head margin-bottom:18px`; `.bar` 5 px (track `rgba(255,255,255,.08)`, fill gradiente `var(--cyan)→var(--violet)`, `transition: width 1.3s cubic-bezier(.22,1,.36,1) .45s` ativado por `.reveal.in`, largura via `--w`).

**Breakpoints (idênticos ao protótipo):** `≤920px` → `grid-main` 1 coluna, stats 2 colunas, weekly vira rolagem horizontal (`grid-auto-flow:column; grid-auto-columns:minmax(118px,1fr)`; `scroll-snap-type:x mandatory`; snap-align start; scrollbar thin), clock alinhado à esquerda, temp-block/condition à esquerda, moon 56 px; `≤640px` → search em duas linhas (input `flex:1 1 60%`, botões `order:2; flex:1 1 100%`); `≤480px` → stats gap 12, `.temp 64px`, `#btnLocate` compacto (`.btn-text` oculto, `padding:11px 15px`). **`prefers-reduced-motion: reduce`** → global `animation/transition: none !important` + `.reveal` visível, `.bar i` em `--w`, `.pt` e `.area-path` visíveis (comportamento já presente no protótipo, mantido integralmente).

**Acréscimos novos (mandados pelo PRD, compostos apenas com os tokens acima):**

| Acréscimo | Especificação |
|---|---|
| Tint do fundo (FR-31) | Duas camadas fixas `.tint-layer` (z-index entre o céu e o dashboard, `pointer-events:none`, mesmas 3 radiais + linear da baseline com cores derivadas) — `cloudy`: radiais `rgba(96,108,138,.32) / rgba(88,94,120,.20) / rgba(70,84,104,.16)` sobre `linear 180deg #0a0d18→#111527 55%→#181d31`; `rain`: radiais `rgba(37,64,128,.34) / rgba(23,42,84,.22) / rgba(10,40,74,.20)` sobre `linear 180deg #05070f→#080c1c 55%→#0b1024`. Camada ativa (por `data-tint` na raiz) com `opacity:1`, demais `opacity:0`, `transition: opacity 1.2s ease` (crossfade — gradientes não transicionam diretamente). Grupos: `clear` = códigos 0,1; `cloudy` = 2,3,45,48,71,73,75,77,85,86; `rain` = 51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99. A baseline `body::before` permanece byte-idêntica ao protótipo |
| Barras de precipitação no gráfico (FR-23) | No mesmo SVG, atrás da linha: `rect.rain-bar` por hora — largura `max(6, round(step×0.42))` px (step≈30.4), x centrado em `X(i)`, `rx:2`, altura `max(2, (p/pMax)×(H−PT−PB)×0.28)` px com `pMax = max(precip, 1mm)×1.25` (altura máxima ≈ 28% do plot, para não cobrir a linha); `fill:#7cc4ff` (cor existente do protótipo), `opacity:.5`, surgindo com o mesmo stagger de 45 ms/hora dos pontos (e visíveis imediatamente com reduced motion). Legenda: segundo chip `.chip.plain` no `card-head` com `.dotline.rain { background:#7cc4ff }` e texto "Precipitação (mm)" |
| Skeleton (FR-30) | Blocos `.sk` (`background:rgba(255,255,255,.08)`, `border-radius:6px`, shimmer `linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent)`, `background-size:200% 100%`, `animation: shimmer 1.6s linear infinite`) espelhando o layout: card atual (trilho `.loc`, círculo 96 px, bloco de temperatura, 3 chips), card gráfico (título + retângulo 100%×200), 4 stats (rótulo, valor, barra), 7 dias (nome, ícone 40 px, temps, rain). Mesmos containers `.card`/`.grid-*`; revelação instantânea (sem reveal animado) |
| Botão em busca (FR-30) | `.btn-primary.is-loading { opacity:.75 }` com spinner inline (`.spin` 14 px, anel `2px rgba(11,16,38,.35)` com topo `#0b1026`, `animation: spin .8s linear infinite` — reutiliza o keyframe `spin` existente) no lugar do `.ico`; `aria-busy="true"` no form |
| Estado vazio (FR-10) | Um `.card` centralizado (no lugar de `grid-main`/stats/weekly): ícone `i-search` a 56 px com `color:var(--muted)` e o mesmo `drop-shadow` do `.bi-sun` (cor ajustada p/ `rgba(110,231,255,.25)`), `h2` 17 px/600 "Pesquise uma cidade", `.sub` 12.5 px `var(--muted)` ("Digite o nome de uma cidade acima ou use sua localização para ver o clima agora."), fileira com `btn btn-primary` "Pesquisar" (foca o input) e `btn btn-ghost` "Localização Atual" (dispara locate). Header, search e footer permanecem |
| Erros (FR-14/15/16/37) | `.card` centralizado (mesma estrutura do vazio): ícone `i-cloud` a 48 px `var(--muted)`; `h2` + `.sub` por tipo: 404 "Cidade não encontrada" / "Verifique a grafia do nome e tente novamente." + `btn btn-primary` "Nova busca" (foca input e seleciona o texto); 400 "Informe um nome de cidade" / "Digite o nome de uma cidade válida (ex.: Curitiba)." + mesmo botão; rede/5xx "Não foi possível carregar o clima" / "Verifique sua conexão e tente novamente." + `btn btn-primary` "Tentar novamente" (reexecuta a última consulta). Painel permanece utilizável (search ativo) |
| Geo-erro (FR-19) | `.search-error` abaixo da search: `inline-flex gap:8px`, 12.5 px, `color:#ffc98b` (tom `.chip.hot`), ícone `i-drop` 14 px; mensagens por código (permissão negada / indisponível / tempo esgotado); persiste até a próxima ação bem-sucedida |
| "Atualizado" (FR-13) | `.updated` passa a exibir "Atualizado HH:MM" (extraído do ISO local da resposta — sem passar por `Date` do viewer, para refletir o fuso da cidade); pulse-dot mantido |

### Estratégia de CSS (port)

1. `frontend/src/index.css` recebe o conteúdo do `<style>` do `painel.html` **ipsis litteris** (bloco 1): todos os seletores, valores, `@keyframes` e as 4 blocos `@media` (920/640/480/reduced-motion) — sem renomear seletores, sem reescrever abordagens, sem valores "equivalentes".
2. Bloco 2 (após o portado): apenas as classes de acréscimo listadas acima, **usando exclusivamente** variáveis, cores, raios, sombras, blurs e easings já definidos no bloco 1 (o único gradiente novo é o do shimmer, construído com `rgba(255,255,255,α)`).
3. O bloco 2 não sobrescreve regra do bloco 1; diferenças de estado são feitas por classes aditivas (`.is-loading`, `.in`, `data-tint`).
4. Sem comentários no código (regra do PRD — "comentários no código" fora de escopo): a separação portado/acréscimo é por ordem de bloco, documentada aqui.

### Animações e interações (inventário completo do protótipo + acréscimos)

**De entrada (revelação):** `.reveal` por seção com delays `--d` = 0s (header), .06s (search), .08s (current), .16s (chart), .24s (stats), .32s (weekly), .4s (footer); IntersectionObserver `threshold:0.15`, one-shot (`unobserve` após `.in`); em reduced motion, visíveis sem animação (regra global do protótipo).

**Céu:** `skyShift` (26 s alternate), `twinkle` (por estrela), `moonGlow` (9 s), `drift` (nuvens, durações negativas iniciais idênticas), `shoot` (2 meteors, 11 s/15 s).

**Componentes:** `pulse-dot::after ping` 2 s; `.rotor spin` 32 s linear; `.bi-cloud floaty` 6 s; `.stat-ico bob` 5 s (delays 0/.6/1.2/1.8 s); `.bar i` width 1.3 s cúbico com delay .45 s (disparado por `.reveal.in`); `.day:hover translateY(-6px)`; `.card:hover` glow; `.btn` transitions (transform .25 s `cubic-bezier(.22,1,.36,1)` etc.).

**Gráfico (FR-26):** traçado da linha via `stroke-dasharray/dashoffset = getTotalLength()`, `transition: stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1) .25s`; `.area-path.show` (opacidade 1.4 s ease .9 s); pontos `.pt.show` com `transition-delay: i×45ms` (spring `cubic-bezier(.34,1.56,.64,1)`); animação disparada quando o card do gráfico intersecta a viewport (idêntico ao protótipo); reduced motion → tudo visível de imediato, sem dash. A animação se repete a cada nova busca (componente remontado por `key` da consulta).

**Temperatura:** count-up 1400 ms, easing `1−(1−p)³`, start 450 ms após render (reduced motion → valor direto).

**Interatividade do gráfico (FR-25):** `mousemove`/`mouseleave` + `touchstart`/`touchmove` (passive)/`touchend` no SVG; índice = `round((px−PL)/step)` clampado a 0..23; guias verticais tracejadas + `hoverdot` + tooltip `.tip` (posição com clamp lateral de 56 px, `transform:translate(-50%,-135%)`); conteúdo: `HHh · <b>T °C</b> · P mm` (+ `· agora` no índice 0); tooltip esconde ao sair/soltar. Marcador "agora": linha âmbar tracejada + `now-ring` (ping 2.4 s) + `now-dot` no índice 0 (janela rolante).

**Teclado/a11y:** form semântico (Enter envia), botões nativos, `aria-label` no input (mesmo texto do protótipo), `role="search"`, `aria-label` nas seções (mesmos textos do protótipo), `role="img"` + `aria-label` no SVG do gráfico ("Gráfico de temperatura e precipitação por hora"), `aria-busy` na busca, foco visível nativo preservado.

### Interfaces Principais

**Backend (CommonJS, assinaturas JSDoc):**

```
// routes/weather.js — único endpoint de dados (FR-01)
GET /api/weather?city=<nome>
GET /api/weather?latitude=<n>&longitude=<n>

// services/geocoding.js
geocodeCity(name: string) -> Promise<Place | null>
  // GET https://geocoding-api.open-meteo.com/v1/search?name=...&count=1&language=pt&format=json
  // results[0] -> Place; vazio/null -> null (rota responde 404)

// services/forecast.js
fetchForecast(latitude: number, longitude: number) -> Promise<Forecast>
  // GET https://api.open-meteo.com/v1/forecast
  //   current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,
  //           weather_code,wind_speed_10m,wind_direction_10m,uv_index
  //   hourly=temperature_2m,precipitation,weather_code
  //   daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,
  //         precipitation_sum,weather_code
  //   forecast_days=7&timezone=auto&wind_speed_unit=kmh
sliceHourly24(hourly: Hourly, currentTime: string) -> Hourly24
  // índice do horário local corrente em hourly.time (comparação por prefixo de hora)
  // e janela de 24 entradas a partir dele

// services/reverseGeocoding.js
reverseGeocode(latitude: number, longitude: number) -> Promise<Place | null>
  // GET https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=..&longitude=..&localityLanguage=pt
  // Place.name = locality (fallback city); Place.region = principalSubdivision
  // qualquer falha/timeout -> null (melhor esforço; consulta segue 200)

// services/externalError.js
class ExternalError extends Error { status?: number }  // timeout (AbortError) -> status undefined

// routes/weather.js — lógica
city vazio/ausente e sem coordenadas            -> 400 { error }
city vazio (apenas espaços)                     -> 400 { error }
coordenadas fora de [-90..90]/[-180..180] ou NaN -> 400 { error }
city + coordenadas juntos                        -> 400 { error }
geocodeCity(name) === null                       -> 404 { error: "Cidade não encontrada." }
ExternalError em forecast                        -> 502 { error }
sucesso                                          -> 200 WeatherResponse (envelope leve)
```

**Frontend (ESM, assinaturas JSDoc):**

```
// services/weather.js
fetchWeather(city: string) -> Promise<WeatherResponse>
fetchWeatherAtCoords(latitude: number, longitude: number) -> Promise<WeatherResponse>
  // base = import.meta.env.VITE_API_URL ?? ''  (dev: '' + proxy Vite; prod: URL absoluta)
  // fetch(url, { cache: 'no-store', signal })  (FR-36)
  // 404 -> WeatherError{kind:'not-found'}; 400 -> {'bad-request'}; resto/rede -> {'network'}
class WeatherError extends Error { status?: number, kind: 'bad-request'|'not-found'|'network' }

// hooks/useWeather.js
useWeather() -> {
  status: 'idle' | 'loading' | 'success' | 'error',
  data: WeatherResponse | null,
  error: { kind: 'not-found'|'bad-request'|'network'|'geo', message: string } | null,
  search(city: string): void,      // vazio após trim -> erro local 'bad-request' sem request
  locate(): void,                  // navigator.geolocation; erros -> kind 'geo' (mensagem em .search-error)
  retry(): void                    // reexecuta a última consulta (city ou geo)
}
  // AbortController por busca; nova busca/locate aborta a anterior; unmount aborta

// hooks/useClock.js   -> { time: 'HH:MM:SS', date: 'segunda-feira, 27 de outubro' }  (Intl pt-BR, 1 s)
// hooks/useCountUp.js -> number  (0 -> target, 1400ms, delay 450ms, easeOutCubic, reduced-motion direto)
// hooks/useReveal.js  -> [ref, visible]  (IO threshold .15, one-shot)

// lib/weatherCodes.js
weatherCodeInfo(code: number) -> { label: string, icon: 'sun'|'cloud-sun'|'cloud'|'rain'|'storm',
                                   color: string, tint: 'clear'|'cloudy'|'rain' }
uvLabel(value: number) -> 'Baixo' | 'Moderado' | 'Alto' | 'Muito Alto' | 'Extremo'
  // faixas WHO: 0–2 / 3–5 / 6–7 / 8–10 / 11+
windCardinal(deg: number) -> string  // 16 pontos pt-BR: N, NNE, NE, ENE, L, LSE, SE, SSE, S, SSO, SO, OSO, O, ONO, NO, NNO
  // índice = round(deg/22.5) % 16

// lib/format.js
formatTimeFromIso(iso: string) -> 'HH:MM'            // slice direto do ISO local da cidade
formatDayLabel(dateIso: string, index: number) -> 'Hoje' | 'Seg' | ...  // index 0 -> "Hoje"; senão weekday short pt-BR sem ponto, inicial maiúscula
formatShortDate(dateIso: string) -> '16 ago'         // dia + array fixo ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
formatNumber(value: number, digits = 0) -> string    // pt-BR (vírgula decimal)

// lib/chart.js
computeScales(temps: number[]) -> { tMin, tMax, step, X(i): number, Y(t): number }
  // tMin = floor(min/4)*4; tMax = ceil(max/4)*4; X(i) = PL + i*(W−PL−PR)/23; Y(t) = PT + (1−(t−tMin)/(tMax−tMin))*(H−PT−PB)
smoothPath(points: [number, number][]) -> string     // Catmull-Rom idêntico ao protótipo (controle /6)
rainBarHeights(precips: number[]) -> number[]        // regra de altura/`pMax` da tabela de acréscimos

// Componentes (props principais)
IconSprite()  ·  Icon({ name })
SkyBackground({ tint: 'clear'|'cloudy'|'rain' })
Header()  ·  Clock()
SearchBar({ onSubmit(city), onLocate, loading, geoError })
Reveal({ delay, instant?, className?, children })
EmptyState({ onSearchFocus, onLocate })
Skeleton({ variant: 'panel' })
ErrorState({ kind, message, onRetry })
CurrentConditions({ data })   WeatherIconBig({ code })
StatCard({ icon, color, label, value, unit, barPercent })  ·  StatsGrid({ data })
HourlyChart({ hourly: Hourly24, nowIndex = 0 })
DayCard({ day, index })  ·  WeeklyForecast({ daily })
Footer()
```

**Máquina de estados (useWeather):** `idle` →(search/locate)→ `loading` →(200)→ `success` | (400/404/rede)→ `error{kind}`; `error` →(retry)→ `loading`; busca vazia → `error{kind:'bad-request'}` direto (sem request); geo negado → `error{kind:'geo'}` exibido em `.search-error` (estado das seções anterior é preservado, ou `idle` no primeiro acesso). `retry` reexecuta a última consulta armazenada.

### Modelos de Dados

**`WeatherResponse` (contrato 200 — envelope leve, formato Open-Meteo preservado, FR-05):**

```
{
  city: {
    name: string | null,          // null só no fluxo geo quando o reverse geocoding falha
    region: string | null,        // admin1 (geocoding) / principalSubdivision (reverse)
    country: string | null,
    display: string | null,       // "Curitiba, Paraná" (name + ', ' + region quando region existe e difere)
    latitude: number, longitude: number
  },
  timezone: string,               // ex.: "America/Sao_Paulo" (timezone=auto)
  utc_offset_seconds: number,
  current: {
    time: string,                 // ISO local da cidade, ex.: "2026-10-27T19:15"
    temperature_2m: number, relative_humidity_2m: number, apparent_temperature: number,
    precipitation: number, weather_code: number,
    wind_speed_10m: number,       // km/h
    wind_direction_10m: number,   // graus
    uv_index: number
  },
  hourly: {                       // exatamente 24 entradas, a partir da hora local corrente
    time: string[24], temperature_2m: number[24], precipitation: number[24], weather_code: number[24]
  },
  daily: {                        // exatamente 7 entradas, a partir de hoje (fuso da cidade)
    time: string[7], temperature_2m_max: number[7], temperature_2m_min: number[7],
    precipitation_probability_max: (number|null)[7], precipitation_sum: number[7], weather_code: number[7]
  }
}
```

Erros: `{ "error": string }` em 400/404/502 (mensagens pt-BR). Headers de sucesso: `Cache-Control: no-store` (toda resposta), sem `ETag`, `Access-Control-Allow-*` conforme origem.

**Mapa WMO → condição/ícone/tint (frontend, `lib/weatherCodes.js`):**

| WMO | Condição (pt-BR) | Ícone grande | Ícone semanal (cor) | Tint |
|---|---|---|---|---|
| 0 | Céu limpo | sun | i-sun (#ffd76a) | clear |
| 1 | Predominantemente limpo | sun | i-sun (#ffd76a) | clear |
| 2 | Parcialmente nublado | cloud-sun | i-cloud-sun (#ffd76a) | cloudy |
| 3 | Nublado | cloud | i-cloud (#c9d6f2) | cloudy |
| 45 / 48 | Neblina / Neblina com geada | cloud | i-cloud (#c9d6f2) | cloudy |
| 51 / 53 / 55 | Garoa fraca / Garoa / Garoa intensa | rain | i-rain (#7cc4ff) | rain |
| 56 / 57 | Garoa congelante (fraca/intensa) | rain | i-rain (#7cc4ff) | rain |
| 61 / 63 / 65 | Chuva fraca / Chuva / Chuva forte | rain | i-rain (#7cc4ff) | rain |
| 66 / 67 | Chuva congelante (fraca/forte) | rain | i-rain (#7cc4ff) | rain |
| 71 / 73 / 75 / 77 | Neve fraca / Neve / Neve forte / Grãos de neve | cloud (a condição textual informa "Neve…") | i-cloud (#c9d6f2) | cloudy |
| 80 / 81 / 82 | Pancadas de chuva (fracas/fortes) | rain | i-rain (#7cc4ff) | rain |
| 85 / 86 | Pancadas de neve | cloud | i-cloud (#c9d6f2) | cloudy |
| 95 | Trovoada | storm | i-storm (#c9b8ff) | rain |
| 96 / 99 | Trovoada com granizo | storm | i-storm (#c9b8ff) | rain |

Código desconhecido → fallback `cloud` / "Nublado" / tint cloudy (defensivo; FR: layout não quebra).

**Derivações exibidas (regras fixas, sem valor fixo de clima — FR-35):** temperatura, sensação, mín/máx, umidade, vento, UV e chuva exibidos = valores da resposta (`Math.round` para °C e km/h; UV inteiro; prob. chuva inteira com "%" ou "–" quando null). Chips: Máx/Mín de `daily[0]`, Sensação de `current.apparent_temperature`. Barras dos stats (`--w`, com piso de 4% para valor zero): umidade = valor direto (0–100%); vento = escala 0–40 km/h; UV = escala 0–12; sensação térmica = escala −10…40 °C.

### Endpoints de API

| Método e caminho | Descrição | Request | Response |
|---|---|---|---|
| `GET /api/weather` | Clima por nome de cidade (FR-01…FR-05) | query `city` (string, acentos/maiúsculas permitidos) | `200 WeatherResponse` · `400 {error}` (ausente/vazio) · `404 {error}` (cidade não encontrada) · `502 {error}` (falha externa) |
| `GET /api/weather` | Clima por coordenadas + nome via reverse geocoding (FR-06) | query `latitude`, `longitude` (numéricos) | `200 WeatherResponse` (city.name pode ser null) · `400 {error}` (inválidos) · `502 {error}` |
| `GET /health` | Health check (existente, mantido) | — | `200 {status, message, timestamp, uptime}` |

Estratégia de comunicação frontend↔backend (documentada nos READMEs de cada pacote): **dev** — frontend `:5173` chama `/api/weather` relativo, roteado pelo proxy do Vite para `:3000` (sem CORS envolvido); **produção local** — frontend `:4173` (`npm run preview`) chama a URL absoluta `http://localhost:3000` via `VITE_API_URL` (`.env.example` documenta), com CORS habilitado no backend. Portas: dev 5173/3000; prod 4173/3000 (PRD).

## Pontos de Integração

| Serviço | Uso | Autenticação | Tratamento de erros |
|---|---|---|---|
| Open-Meteo Geocoding — `https://geocoding-api.open-meteo.com/v1/search` | nome → coordenadas (fluxo city) | nenhuma (uso livre, ~10 mil req/dia por IP) | `count=1&language=pt&format=json`; `results` vazio → 404; timeout 8 s / não-2xx → 502 |
| Open-Meteo Forecast — `https://api.open-meteo.com/v1/forecast` | clima por coordenadas (ambos os fluxos) | nenhuma | `timezone=auto` (horários locais da cidade no payload); `wind_speed_unit=kmh`; timeout 8 s / não-2xx → 502 |
| BigDataCloud Reverse Geocode — `https://api.bigdatacloud.net/data/reverse-geocode-client` | coordenadas → nome (fluxo geolocalização, FR-06) | **nenhuma chave** (requisito do PRD); cota gratuita do plano client | **best-effort**: timeout 8 s, não-2xx ou `locality` ausente → `city.name = null` e a consulta continua `200` (frontend exibe "Sua localização"); executado em paralelo ao forecast (`Promise.all`) |

Timeout global por chamada externa: 8 s (`AbortSignal.timeout`). O backend é o **único** consumidor de APIs externas (arquitetura inegociável do PRD); nenhuma URL externa aparece no bundle do frontend. CORS: `GET, OPTIONS`; em dev, qualquer origem aceita (documentado no README do backend e em `.env.example`); em produção, `CORS_ORIGINS` explícito (ex.: `http://localhost:4173`).

## Abordagem de Testes

### Testes Unidade

**Backend (Jest + Supertest — apenas `**/__tests__/**/*.test.js`, mocks de módulo via `jest.mock` da skill `javascript-typescript-jest`; zero rede):**
- `weather.test.js` (rota): 200 fluxo city (envelope completo, `hourly` com 24 entradas a partir da hora corrente, `city.display` "Curitiba, Paraná", headers `Cache-Control: no-store` e ausência de `ETag`); 400 (sem parâmetros, `city=` vazio, lat/lon inválidos, city+coordenadas juntos); 404 (geocoding vazio); 502 (forecast rejeita); fluxo geo (200 com `city` resolvido; reverse falha → 200 com `city.name` null); CORS (preflight 204 com allow-origins/methods; origem permitida ecoada).
- `services.test.js` (clientes com `fetch` global espionado): geocoding (URL/parâmetros `language=pt,count=1`; resultados vazios → null); forecast (parâmetros exatos, incluindo `timezone=auto` e `wind_speed_unit=kmh`; `sliceHourly24` com casos 00h, 12h e 23h — incluindo janela que cruza o meio-dia; timeout → `ExternalError`); reverse geocoding (URL; falha → null).
- `api.test.js` (existente, mantido): `/health` 200; rota desconhecida 404 JSON.

**Frontend (Vitest + React Testing Library, jsdom; testes de comportamento com queries acessíveis; `fetch` global mockado — sem MSW, sem dependência nova):**
- `format.test.js` / `weatherCodes.test.js` (funções puras): mapa WMO completo (todos os códigos → label/ícone/tint, incluindo fallback de código desconhecido); cardinais (0→N, 22.5→NNE, 90→L, 315→NO); faixas de UV (2.9→Moderado, 5→Moderado, 6→Alto, 8→Muito Alto, 11→Extremo); `formatShortDate` ("2026-10-16"→"16 ago"); `formatDayLabel` (índice 0→"Hoje", segunda→"Seg"); `formatTimeFromIso`.
- `chart.test.js` (funções puras): escalas (tMin/tMax múltiplos de 4; `X(0)=44`, `X(23)=744`; `Y` no domínio do plot); `smoothPath` (1 `M` + 23 curvas `C` para 24 pontos; idempotente com pontos colineares); `rainBarHeights` (0 → sem barra; p>0 ≥ 2 px; teto 28% do plot; `pMax` piso 1 mm).
- `weather-service.test.js`: `fetch` chamado com `cache:'no-store'`; URL com `encodeURIComponent` de city acentuada; 404→`not-found`, 400→`bad-request`, 500/rede→`network`; base `VITE_API_URL` vazia vs. absoluta.
- `useWeather.test.js` (`renderHook`): transições idle→loading→success; mapeamento de erros; `retry` reexecuta a última consulta (city e geo); nova busca aborta a anterior (AbortController).
- `SearchBar.test.jsx`: renders input com label acessível + botões; Enter envia (via form); envio vazio → feedback de 400 **sem** `fetch`; loading → `aria-busy` + spinner; geo-erro renderiza a mensagem.
- `CurrentConditions.test.jsx`: dados renderizados (cidade, condição, chips); count-up termina no valor final (`findBy`); estado de placeholder "–".
- `HourlyChart.test.jsx`: SVG com 24 pontos `.pt` e 24 rótulos/horas corretos; hover (mousemove no SVG) mostra tooltip com hora/temperatura/precipitação e some no mouseleave; touchstart mostra tooltip; marcador "agora" no índice 0. (jsdom: `getTotalLength` e `IntersectionObserver` stubados no setup.)
- `WeeklyForecast.test.jsx`: 7 cards; primeiro com "Hoje" e classe `today`; data "16 ago"; prob. de chuva com "%" e "–" quando null.
- `App.test.jsx` (reescrita): estado inicial = EmptyState + search em destaque (FR-09/10); fluxo de sucesso com fetch mockado popula os 3 blocos + tint aplicado; 404 → mensagem amigável e painel utilizável; erro de rede → retry refaz o request; geolocalização negada (mock de `navigator.geolocation`) → `.search-error` e busca por cidade segue funcionando.

**Mocks de ambiente (frontend `__tests__/setup.js`, estendido):** stub de `IntersectionObserver`, `matchMedia` (reduced motion off por padrão) e `getTotalLength`; mocks de `navigator.geolocation` e `fetch` por teste (nunca globais no setup, para não vazar entre testes).

### Testes de Integração

- Backend rota×middlewares juntos (Supertest contra o `app` real com serviços mockados): headers de cache/CORS presentes em 200, 400, 404 e 502; 404 de rota desconhecida continua JSON.
- Frontend: `App` com `services/weather.js` real e `fetch` mockado (integração hook→componente→UI nos 4 estados), incluindo remontagem do gráfico a cada busca (animação reinicia — verificado por presença da classe de entrada).
- Contrato ponta a ponta de dev (manual, documentado nos READMEs): `npm run dev` nos dois pacotes + busca no navegador via proxy (sem CORS).

### Cenários de Aceite

Validados na fase de QA (Playwright para UI, `mcp-api-test` para HTTP), **com rede real** (decisão confirmada):

1. **Estado inicial** em `/`: EmptyState + busca em destaque, céu animado, relógio atualizando (360/768/1280).
2. **Busca por cidade** ("Curitiba"): skeleton → painel completo com dados reais, "Atualizado HH:MM" e cidade "Curitiba, Paraná"; acentos ("São Paulo") e maiúsculas resolvidos.
3. **Cidade não encontrada** (404): mensagem amigável, busca segue utilizável.
4. **Busca vazia** (400): feedback sem disparar request.
5. **Falha de comunicação**: backend parado → erro + "Tentar novamente"; backend reiniciado → retry recupera.
6. **Geolocalização** (Playwright com permissão e coordenadas definidas): nome resolvido via BigDataCloud exibido no painel; permissão negada → `.search-error` amigável e busca por cidade funcional.
7. **Gráfico interativo**: hover (desktop) e touch (mobile) mostram tooltip (hora, temperatura, precipitação); "agora" visível; 24 h rolantes corretas.
8. **Tingimento (FR-31)**: cidade com céu limpo × cidade chuvosa → fundos diferentes em screenshots; componentes/tipografia/cores de texto inalterados.
9. **Responsividade (FR-32)**: sem overflow horizontal nem corte em 360/768/1280; weekly em rolagem com snap em telas estreitas; `#btnLocate` compacto ≤480 px.
10. **Reduced motion**: `prefers-reduced-motion: reduce` emulado → sem animações, conteúdo completo (regras globais do protótipo).
11. **Contrato HTTP** (`mcp-api-test`): 200/400/404; `Cache-Control: no-store` e ausência de ETag em todos; CORS headers (dev e `CORS_ORIGINS` explícito).
12. **Isolamento do frontend (FR-35/PRD)**: no network log do browser, nenhuma requisição para domínio externo de dados (apenas a API do backend e Google Fonts); nenhum valor de clima hard-coded (verificado por revisão + testes).

**Verificação de fidelidade visual lado a lado (FR-33, FR-37)** — método obrigatório na QA:
- Capturas full-page do app em estado carregado (busca "Curitiba", após as animações de entrada concluírem) e do `painel.html` aberto diretamente, nas larguras **360 px, 768 px e 1280 px** (Playwright, `file://` para o protótipo), lado a lado no relatório de QA.
- Critério de passagem: mesmo layout (grid, seções, ordem), mesma tipografia/cor/espaçamento (design system), mesmos componentes (cards glassmorphism, chips, ícones, geometria do gráfico com eixos/marcador "agora"/tooltip).
- Diferenças **aceitas e documentadas**: (a) valores reais vs. valores de exemplo; (b) barras + legenda de precipitação no gráfico (mandado pelo PRD); (c) texto do rodapé adaptado (FR-38); (d) tint dinâmico do fundo (FR-31); (e) estados que não existem no protótipo (vazio/skeleton/erro), que devem usar o design system (FR-37); (f) "Atualizado HH:MM" no lugar de "Atualizado agora".

## Sequenciamento de Desenvolvimento

### Ordem de Construção

1. **Backend — contrato da API** (desbloqueia o frontend): `config.js`, middlewares (cache, CORS, log), `externalError.js`, `geocoding.js`, `forecast.js` (+`sliceHourly24`), `reverseGeocoding.js`, `routes/weather.js`, ajuste de `index.js` (guard de listen, etag off, 404 JSON, error handler) + testes (Jest/Supertest).
2. **Frontend — fundação visual**: `index.html` (fonte/lang/título), `index.css` (port verbatim + bloco de acréscimos), `IconSprite`/`Icon`, `Reveal`/`useReveal`, `SkyBackground` (+tint), `Header`/`Clock`/`useClock`, `Footer`; `vite.config.js` (proxy) e `.env.example`.
3. **Frontend — camada de dados**: `services/weather.js`, `lib/format.js`, `lib/weatherCodes.js`, `lib/chart.js`, `useCountUp`, `useWeather` + testes das funções puras e do serviço.
4. **Frontend — componentes de dados**: `SearchBar` (+geolocalização), `CurrentConditions`/`WeatherIconBig`, `StatsGrid`/`StatCard`, `HourlyChart`, `WeeklyForecast`/`DayCard`, `EmptyState`, `Skeleton`, `ErrorState`, orquestração em `App.jsx` + testes RTL.
5. **Completação**: acessibilidade (foco, aria, reduced motion), lint (`npm run lint`), suítes completas nos dois pacotes, READMEs (estratégia de comunicação + portas), remoções (`App.css`, `public/icons.svg`).
6. **QA E2E** (fase `do-execute-qa`): cenários de aceite 1–12 + verificação lado a lado 360/768/1280.

### Dependências Técnicas

- Node.js ≥ 18 (global `fetch`/`AbortSignal.timeout`) — já exigido pelo PRD; dois `npm install` independentes (sem workspace).
- Disponibilidade das APIs externas apenas em runtime/QA (testes automatizados 100% offline com mocks).
- Fonte Inter via Google Fonts em runtime (fallback stack do protótipo cobre indisponibilidade).
- Geolocalização exige secure context (`localhost` em dev/QA atende).

## Monitoramento e Observabilidade

O projeto não possui infraestrutura de métricas (Prometheus/Grafana) — scaffold sem esse requisito. Abordagem proporcional:
- **Backend:** log estruturado de acesso via `console` no middleware `logger.js` — `INFO` por request (método, rota, status, duração ms) e por chamada externa (serviço, status, duração); `WARN` quando o reverse geocoding falha (fallback para `city.name = null`); `ERROR` com detalhes (serviço, status/timeout, params) em falha externa. Nenhum dado pessoal é logado (a geolocalização é usada e descartada).
- **Frontend:** sem telemetria (fora de escopo do PRD); falhas são visíveis ao usuário via estados de erro.
- **Evolução futura (não escopo):** endpoint de métricas e dashboards podem ser adicionados sem impactar o contrato atual.

## Considerações Técnicas

### Decisões Principais

1. **Zero dependências novas** (mandato do usuário/PRD): sem lib de gráfico (SVG manual no exato estilo do protótipo — alternativas rejeitadas: recharts/chart.js, violariam FR-33 e o bundle), sem `cors` (middleware manual de ~20 linhas; a skill `nodejs-backend-patterns` sugere libs de validação/CORS, mas a restrição de dependências prevalece — **desvio justificado**), sem `axios`/`node-fetch` (`fetch` global do Node 18+), sem router (rota única), sem MSW/`user-event` no frontend (mocks diretos de `fetch`; **desvio** da preferência `userEvent` da skill `react-testing`, justificado pela mesma restrição).
2. **Envelope leve** (confirmado com o produto): formato Open-Meteo + `city` + `hourly` fatiado 24 h — atende FR-05 ("sem remodelagem complexa") e centraliza no backend a única derivação necessária (fatiamento por fuso local); rejeitado pass-through integral (empurraria lógica de fuso para o frontend) e normalização profunda (complexidade desnecessária).
3. **Janela rolante de 24 h** (confirmado): preserva a geometria do protótipo (24 pontos, eixo a cada 3, marcador "agora") atendendo "próximas 24 horas" do PRD; "agora" no índice 0; rejeitado dia fixo 0h–23h (contraditório perto da meia-noite).
4. **Chuva semanal por probabilidade** (confirmado): `precipitation_probability_max` (%) — mantém o rótulo "Previsão diária com probabilidade de chuva" e o formato "%" do protótipo; `precipitation_sum` (mm) segue no payload para evoluções; null → "–".
5. **Reverse geocoding BigDataCloud** (confirmado): sem chave (requisito FR-06), CORS liberado, pt-BR nativo; best-effort com fallback (`city.name = null` → "Sua localização"); rejeitado Nominatim (política de uso restritiva: 1 req/s + User-Agent obrigatório).
6. **Mapa WMO no frontend** (`lib/weatherCodes.js`, funções puras testadas): backend permanece fino (repassa códigos), frontend dono da apresentação (ícone/texto/tint) — coerente com a regra de precedência (dados do backend, aparência do frontend).
7. **CSS portado verbatim** + acréscimos delimitados por ordem de bloco (sem comentários, por regra do PRD), usando exclusivamente tokens do protótipo; a baseline do céu fica byte-idêntica ao `painel.html`, e o tint é implementado por crossfade de camadas (gradientes não transicionam).
8. **Guard de `app.listen`** (`require.main === module`) em `backend/src/index.js`: corrige o EADDRINUSE documentado no `AGENTS.md` (a suite Jest não ocupa a porta 3000) sem mudar o `module.exports = app`.
9. **Meses pt-BR em array fixo** no `formatShortDate`: `Intl.DateTimeFormat('pt-BR', {day, month:'short'})` insere "de" ("16 de ago."), quebrando o formato "16 ago" do protótipo.
10. **Tint via `data-tint` no wrapper da raiz** (não no `<body>`): React controla o atributo sem efeitos colaterais globais; camadas entre o céu (z0) e o dashboard (z2).

### Suposições Técnicas

- Open-Meteo responde sem chave com volume suficiente para dev/QA (~10 mil req/dia por IP) e mantém os parâmetros `timezone=auto`, `wind_speed_unit=kmh`, `precipitation_probability_max` (verificados nesta pesquisa).
- `hourly.time` com `timezone=auto` é no fuso local da cidade e começa às 00:00 de hoje no fuso dela (verificado).
- BigDataCloud client API continua disponível sem chave, com cota suficiente para o produto (uso baixo); `locality`/`principalSubdivision` seguem presentes no payload.
- `uv_index` pode ser `null` em algumas horas/regiões (tratado como 0 na exibição); `precipitation_probability_max` pode ser `null` (exibido "–").
- Node ≥ 18 disponível em todos os ambientes (PRD) — `fetch`, `AbortSignal.timeout`.
- Google Fonts acessível em runtime (fallback stack cobre); ambiente de QA com rede real (confirmado).

### Riscos Conhecidos

- **Rate limiting das APIs externas no QA E2E (rede real)** → volume de requisições do fluxo de QA é baixo e reutiliza buscas; a regra de no-cache é mandato do produto (trade-off aceito); se uma API falhar durante o QA, o cenário 5 cobre o caminho de erro e o cenário pode ser reexecutado.
- **Cota gratuita do BigDataCloud** → fallback best-effort já projetado (nome null); QA usa coordenadas fixas via override do Playwright.
- **jsdom sem SVG layout/IntersectionObserver** → stubs no `setup.js` (`getTotalLength`, IO, `matchMedia`); se algum teste de animação exigir layout real, o cenário equivalente já está coberto no E2E (fronteira RTL vs. E2E por `react-testing`).
- **StrictMode (dev) monta efeitos duas vezes** → efeitos idempotentes com cleanup (IO unobserve, rAF cancelado, abort no unmount).
- **Screenshots de fidelidade capturados com animações em andamento** → o método de QA define espera de conclusão das animações (estado `success` + tempo fixo pós-`networkidle`) antes do capture.
- **Dados extremos (FR: layout/gráfico não quebram)** → escalas do gráfico com múltiplos de 4 e barras com teto de 28% do plot; barras de stats com clamp 4–100%; temperaturas negativas cobertas pelas funções puras testadas.

### Conformidade com standards do projeto

Skills do projeto: lidas: nodejs-backend-patterns, react-testing, vite, vercel-react-best-practices, frontend-design, javascript-typescript-jest · consultadas: vitest, vercel-composition-patterns, web-design-guidelines, webapp-testing
MCPs do projeto: disponíveis: playwright (ui-testing), mcp-api-test (api-testing), context7 (documentation) · usados nesta etapa: nenhum necessário (pesquisa de APIs feita por consulta direta à documentação/resposta real dos serviços)

- `nodejs-backend-patterns`: middlewares isolados, classe de erro customizada, validação de entrada no handler, env via dotenv, health check mantido, CORS restrito em produção. **Desvios:** sem TypeScript e sem lib de validação (stack JS fixada + restrição de dependências — justificadas acima).
- `react-testing`: testes por comportamento e queries acessíveis (role/label/text); mocks apenas em rede; fronteira com E2E explícita. **Desvio:** `fireEvent` no lugar de `userEvent` (dependência não instalada; restrição de novas dependências).
- `vite`: config ESM mantida (`vite.config.js` conforme convenção do projeto, não `.ts`), proxy `'/api'` no padrão da documentação, `import.meta.env` para configuração.
- `vercel-react-best-practices`: sem waterfall no fluxo geo (`Promise.all` forecast ∥ reverse), listeners touch passive, funções puras fora do render (`lib/`), dependências de hooks primitivas, remontagem por `key` intencional (reanimar gráfico/count-up).
- `frontend-design`: o brief fixa a direção visual (`painel.html` é a fonte de verdade — "when the brief pins down a visual direction, follow it exactly"); os acréscimos (tint, skeleton, estados, barras) usam apenas o token system do protótipo e preservam o movimento orquestrado de entrada já existente; nenhum "default gerado" foi introduzido.
- `javascript-typescript-jest`: mocks de módulo (`jest.mock`), `async/await`, nomes descritivos, `__tests__/*.test.js` (conforme `testMatch` do Jest).
- `web-design-guidelines` / `webapp-testing`: acessibilidade (foco, aria, contraste, reduced motion, informação não só por cor) coberta por requisitos do PRD e verificada nos cenários 10–11; E2E com Playwright conforme o método de QA documentado.

### Arquivos relevantes e dependentes

**Criar (backend):** `backend/src/config.js`, `backend/src/middleware/{cache,cors,logger}.js`, `backend/src/routes/weather.js`, `backend/src/services/{geocoding,forecast,reverseGeocoding,externalError}.js`, `backend/src/__tests__/{weather,services}.test.js`.
**Modificar (backend):** `backend/src/index.js` (guard de listen, etag off, middlewares, rota, error handler), `backend/.env.example` (+`CORS_ORIGINS`), `backend/README.md` (estratégia de comunicação e portas).
**Criar (frontend):** `frontend/.env.example`, `frontend/src/components/{IconSprite,Icon,SkyBackground,Header,Clock,SearchBar,CurrentConditions,WeatherIconBig,StatsGrid,StatCard,HourlyChart,WeeklyForecast,DayCard,EmptyState,Skeleton,ErrorState,Footer,Reveal}.jsx`, `frontend/src/hooks/{useClock,useCountUp,useReveal,useWeather}.js`, `frontend/src/services/weather.js`, `frontend/src/lib/{format,weatherCodes,chart}.js`, `frontend/src/__tests__/{format,weatherCodes,chart,weather-service,useWeather,SearchBar,CurrentConditions,HourlyChart,WeeklyForecast}.test.*` (e extensão do setup).
**Modificar (frontend):** `frontend/index.html`, `frontend/src/index.css`, `frontend/src/App.jsx`, `frontend/vite.config.js`, `frontend/src/__tests__/{App.test.jsx,setup.js}`, `frontend/README.md`.
**Remover (frontend):** `frontend/src/App.css` (vazio), `frontend/public/icons.svg` (sobra do template).
**Referências de entrada:** `painel.html` (fonte de verdade visual — CSS, sprite SVG, geometria do gráfico, animações), `exemplo_requisito.txt` (fonte de verdade de comportamento via PRD), `prds/prd-painel-do-clima/prd.md` (FR-01…FR-38), `AGENTS.md` e `.do/context.md` (comandos, convenções, particularidades de testes).
