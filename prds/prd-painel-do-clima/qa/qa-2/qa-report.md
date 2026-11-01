# Relatório de QA - Painel do Clima

## Resumo
- Data: 2026-10-28
- Status: REPROVADO
- Total de Requisitos: 38
- Requisitos Atendidos (PASSOU): 37
- Requisitos Não Atendidos (FALHOU): 1
- Requisitos Verificados Só no Código: 0
- Requisitos Não Testados: 0
- Bugs Encontrados: 1 (1 baixa)

## Requisitos Verificados
| ID | Requisito | Status | Evidência |
|----|-----------|--------|-----------|
| FR-01 | Endpoint único `GET /api/weather` consumido pelo frontend | PASSOU | `mcp-api-test`: 200 em `?city=Curitiba`; network log do browser: das 50 requisições, a única dinâmica do app é `GET /api/weather` via proxy (domínios: localhost + Google Fonts apenas) |
| FR-02 | Busca por nome: geocoding Open-Meteo → forecast → resposta | PASSOU | `mcp-api-test`: 200 com dados reais de Curitiba (geocoding + forecast em rede real) |
| FR-03 | 200 sucesso / 400 inválido ou ausente / 404 não encontrada | PASSOU | `mcp-api-test`: 200; 400 sem parâmetros (msg pt-BR); 400 `city=` vazio; 400 `latitude=100` ("Coordenadas inválidas."); 404 `Xyzqqqqqq123naoexiste` ("Cidade não encontrada.") |
| FR-04 | Payload mínimo: cidade resolvida, atuais, 24 h, 7 dias | PASSOU | Body do 200 inspecionado: `city{name,region,country,display,lat,lon}`, `timezone`, `current` completo (temp, sensação, umidade, precip, code, vento+direção, UV), `hourly` com 24 entradas a partir da hora local corrente (14:00→13:00), `daily` com 7 entradas a partir de hoje |
| FR-05 | Formato passável da Open-Meteo, sem remodelagem complexa | PASSOU | Body inspecionado: campos Open-Meteo preservados; envelope leve apenas com `city` e `hourly` fatiado 24 h |
| FR-06 | Consulta por coordenadas + nome via reverse geocoding (API gratuita, sem chave) | PASSOU | `mcp-api-test` `?latitude=-25.43&longitude=-49.27` → 200 com `city.name="Curitiba"` (BigDataCloud, sem chave); nome resolvido exibido no painel no fluxo de geolocalização (FR-18) |
| FR-07 | `Cache-Control: no-store` em toda resposta, sem ETag | PASSOU | Headers inspecionados em 200, 400, 404 e preflight 204: `cache-control: no-store` presente em todos, nenhum `ETag`; código: `app.set('etag', false)` + `middleware/cache.js` |
| FR-08 | CORS explícito (origens, métodos, headers), dev documentado | PASSOU | `OPTIONS` → 204 com `access-control-allow-origin: http://localhost:5173` ecoado, `methods: GET, OPTIONS`, `headers: Content-Type, Authorization`, `vary: Origin`; `CORS_ORIGINS` no config (dev `*`, documentado) |
| FR-09 | Rota `/` cai direto no painel, sem telas intermediárias | PASSOU | Playwright: `http://localhost:5173/` renderiza o painel completo no load (snapshot a11y) |
| FR-10 | Estado vazio no primeiro acesso, com convite à busca | PASSOU | `visual-home-empty.png` + snapshot: card glassmorphism com ícone de busca, h2 "Pesquise uma cidade", subtexto e botões; search em destaque |
| FR-11 | Campo de texto simples, sem autocomplete | PASSOU | DOM: input `type=text`, sem `autocomplete`, sem `list`/`<datalist>` |
| FR-12 | Busca por botão "Pesquisar" e por Enter | PASSOU | Enter ("Curitiba") e clique no botão ("São Paulo") — ambas dispararam a busca |
| FR-13 | Sucesso: nome/região da cidade, dados, indicador de atualização | PASSOU | "Curitiba, Paraná" + "Atualizado 14:30" (hora local da cidade) + 3 blocos populados (`req-13-curitiba-loaded-1280.png`) |
| FR-14 | 404: mensagem amigável orientando nova tentativa, painel utilizável | FALHOU | Estado exibido e painel utilizável (botão "Nova busca"), mas o subtexto é redundante ("Cidade não encontrada.") em vez do texto orientativo "Verifique a grafia do nome e tente novamente." definido na TechSpec — BUG-01 (`req-14-city-not-found.png`) |
| FR-15 | Falha de comunicação: feedback claro + tentar novamente | PASSOU | Backend (iniciado por este QA) parado → "Não foi possível carregar o clima" + "Tentar novamente" (`req-15-network-error.png`); backend reiniciado → retry restaurou o painel (`req-15-retry-recovered.png`). Obs.: subtexto afetado pelo BUG-01 |
| FR-16 | 400 vazio: feedback indicando nome válido | PASSOU | Busca vazia → "Informe um nome de cidade" + botão "Nova busca"; zero requests de rede (4 antes e 4 depois). Obs.: subtexto afetado pelo BUG-01 (`req-16-empty-search-400.png`) |
| FR-17 | Botão dedicado de geolocalização | PASSOU | Botão "Localização Atual" presente na search e no estado vazio; clique dispara o fluxo |
| FR-18 | Geolocalização: nome resolvido pelo backend exibido | PASSOU | Contexto Playwright com geolocation grant + coords fixas (-25.43, -49.27) → painel exibe "Curitiba, Paraná" resolvido via BigDataCloud (`req-18-geolocation-success.png`) |
| FR-19 | Geolocalização negada: mensagem amigável, busca por cidade segue | PASSOU | Permissão revogada → `.search-error` "Localização negada." com `role="alert"`; busca "Florianópolis" em seguida carregou normalmente e a mensagem foi limpa (`req-19-geolocation-denied.png`) |
| FR-20 | Card atual: temperatura grande, condição, cidade, "atualizado", máx/mín/sensação | PASSOU | "21°" em destaque, "Nublado", "Curitiba, Paraná", "Atualizado 14:30", chips Máx 22 / Mín 12 / Sensação 22 (coerentes com o backend: 21.1°/22°/12°/21.5°) |
| FR-21 | Ícone animado coerente com a condição | PASSOU | Runtime: sol (Fortaleza, code 0) → `rotor` `spin 32s`; nuvem (Curitiba, code 3) → `floaty 6s`; chuva/garoa (São Paulo) → `floaty 6s`; sol+nuvem (Belo Horizonte, code 2) → composição com sol girando + nuvem flutuando (`req-21-icon-cloud-sun-bh.png`). Revalidação do BUG-01 da qa-1 (corrigido): **não reproduzido** |
| FR-22 | 4 stats: sensação, umidade %, vento km/h+cardeal, UV+qualitativo, com ícone e barra | PASSOU | "Sensação térmica 22°C", "Umidade 53 %", "Vento 1 km/h · SSE", "Índice UV 5 · Moderado" (faixa WHO 3–5); em BH "Índice UV 2 · Baixo" (faixa 0–2); barras proporcionais; ícones com animação do protótipo |
| FR-23 | Gráfico: temperatura em linha + precipitação em barras + legenda das 2 séries | PASSOU | Legendas "Temperatura (°C)" e "Precipitação (mm)"; 24 pontos `.pt`; São Paulo: 10 barras de chuva (alturas 5–52px, `#7cc4ff`, opacity .5); Curitiba: 0 barras (precipitação 0 mm — regra do spec: 0 → sem barra) |
| FR-24 | Marcador do horário atual no gráfico | PASSOU | `.now-line` + `.now-ring` + `.now-dot` + rótulo "agora" no índice da hora corrente (14h), visível nas screenshots |
| FR-25 | Tooltip em hover (desktop) e touch (mobile); some ao afastar/soltar | PASSOU | Desktop: hover → "01h · 14.9°C · 0 mm" com guia vertical e ponto (`req-25-tooltip-hover.png`); mouseleave → `opacity: 0`. Mobile (contexto `hasTouch`, CDP `touchStart`): "23h · 14.9°C · 0 mm" visível; `touchEnd` → oculto (`req-25-tooltip-touch-mobile.png`) |
| FR-26 | Animação de entrada do gráfico; desativada com prefers-reduced-motion | PASSOU | Busca fresca: linha traçada (`dasharray 778.3px`, `dashoffset 532.9px → 0px`, transição 1.8s) + 24 pontos revelados; com `reducedMotion: reduce`: `animation: none` em ícone/estrelas, 24/24 pontos opacos, `dashoffset 0px`, barras com width final e `transition 0s` |
| FR-27 | 7 dias: dia, data curta, ícone, mín/máx, chuva | PASSOU | 7 cards "Hoje 28 out … Ter 3 nov" com ícone colorido por condição, "22° 12°", prob. de chuva "82%" |
| FR-28 | Variação mín/máx com indicador no padrão do protótipo | PASSOU | Mesmo padrão do `painel.html`: máx em negrito + mín em tom claro (comparação visual nas 3 larguras) |
| FR-29 | Dia atual distinguido; rolagem horizontal com snap em telas estreitas | PASSOU | "Hoje" em cyan (`.today`); em 768/360px: `grid-auto-flow: column` + `scroll-snap-type: x mandatory` + `scroll-snap-align: start`; em 360px `scrollWidth 602 > clientWidth 267` (rolagem real) |
| FR-30 | Skeleton loading espelhando o layout + busca perceptível | PASSOU | `visual-skeleton-loading.png` (capturado com resposta retardada via `page.route`): 65 blocos `.sk` espelhando o layout (card atual, gráfico, 4 stats, 7 dias); form `aria-busy="true"`; botão com spinner `.is-loading` |
| FR-31 | Tingimento sutil do fundo por condição, sem alterar componentes | PASSOU | `data-tint` runtime: `clear` (Fortaleza, code 0), `cloudy` (Curitiba code 3 e BH code 2), `rain` (São Paulo, garoa) — três atmosferas distintas em screenshots, com componentes/tipografia/texto idênticos |
| FR-32 | Responsivo 360/768/1280 sem overflow, quebras do protótipo | PASSOU | Sem overflow horizontal nos 3 tamanhos (`scrollWidth = clientWidth`); grid 1 coluna e stats 2×2 em ≤920px; search em 2 linhas e `#btnLocate` compacto (`.btn-text` oculto) em 360px; `.temp` 104/65/64px |
| FR-33 | Visualmente idêntica ao `painel.html` no estado carregado | PASSOU | Comparação lado a lado nas 3 larguras (`app-1280.png`↔`proto-1280.png`, `visual-tablet-768.png`↔`proto-768.png`, `visual-mobile-360.png`↔`proto-360.png`): mesmo grid, tipografia, cores, cards glassmorphism, chips, geometria do gráfico com eixos e marcador "agora". Diferenças apenas as aceitas pela TechSpec (dados reais, barras+legenda de precipitação, "Atualizado HH:MM", rodapé adaptado, tint dinâmico, janela rolante 24 h) |
| FR-34 | Precedência: comportamento/dados do requisito, aparência do protótipo | PASSOU | Comportamento validado contra o PRD em runtime; aparência idêntica ao protótipo (FR-33); ex.: data do relógio com `text-transform: capitalize` idêntica nos dois |
| FR-35 | Nenhum valor de clima fixo no código; dados sempre do backend | PASSOU | Grep: nenhum valor de clima hardcoded no frontend; runtime: valores distintos por cidade (Curitiba 21°/53% vs São Paulo 23°/garoa vs Fortaleza 31°/céu limpo); network log: nenhuma requisição a domínio externo de dados |
| FR-36 | Todo `fetch` do frontend com `cache: 'no-store'` | PASSOU | Código: único `fetch(` do app em `frontend/src/services/weather.js:34` com `cache: 'no-store'` (coberto por teste de unidade) |
| FR-37 | Estados ausentes do protótipo compostos só com o design system | PASSOU | `visual-home-empty.png`, `visual-skeleton-loading.png`, `req-14/15/16*.png`: mesmos cards glassmorphism, ícones, tipografia, cores e raios do protótipo |
| FR-38 | Conteúdo real em pt-BR; rodapé sem "simulado" | PASSOU | Datas pt-BR ("quarta-feira, 28 de outubro", "28 out"…"3 nov"), condições ("Nublado", "Garoa fraca", "Céu limpo", "Parcialmente nublado"), cardinais pt-BR ("SSE", "NE"), hora local da cidade; rodapé: "dados reais via Open-Meteo · feito com React e Node.js" (sem "simulado") |

## Testes E2E Executados
| Fluxo | Resultado | Observações |
|-------|-----------|-------------|
| API: 200 cidade (Curitiba) | PASSOU | Envelope completo (24 h a partir da hora local, 7 dias), `no-store`, sem ETag |
| API: 400 (ausente / vazio / coords inválidas) | PASSOU | Mensagens pt-BR, `no-store`, sem ETag |
| API: 404 cidade inexistente | PASSOU | "Cidade não encontrada.", `no-store`, sem ETag |
| API: coordenadas + reverse geocoding | PASSOU | Nome "Curitiba" resolvido pelo BigDataCloud (sem chave) |
| API: CORS preflight | PASSOU | 204 com `allow-origin` ecoado, methods e headers corretos |
| UI: estado inicial (vazio) | PASSOU | Card de convite, search em destaque, céu animado (140 estrelas, lua, 3 nuvens), relógio pt-BR atualizando |
| UI: busca por Enter (Curitiba) | PASSOU | Skeleton → painel completo com dados reais |
| UI: busca por botão (São Paulo, acento) | PASSOU | Acentos resolvidos; garoa + tint rain + barras de chuva |
| UI: 404 (cidade inexistente) | PASSOU (estado) / FALHOU (subtexto) | Mensagem e painel utilizáveis; subtexto redundante — BUG-01 |
| UI: 400 (busca vazia) | PASSOU | Feedback local, zero requests de rede |
| UI: falha de rede + retry | PASSOU | Backend (desta execução) parado → erro; reiniciado → retry recuperou |
| UI: geolocalização (permitida, coords fixas) | PASSOU | Nome resolvido "Curitiba, Paraná" exibido |
| UI: geolocalização (negada) | PASSOU | `role="alert"` amigável; busca por cidade funcionou depois |
| UI: tooltip do gráfico (hover desktop) | PASSOU | Aparece com hora/temp/precipitação; some ao afastar |
| UI: tooltip do gráfico (touch mobile) | PASSOU | CDP touchStart em contexto hasTouch: visível no toque, some no touchEnd |
| UI: animação de entrada do gráfico | PASSOU | Traçado 778px com offset animando 532→0 (1.8s) em busca fresca |
| UI: ícone animado por condição (sun/cloud/rain/cloud-sun) | PASSOU | spin 32s / floaty 6s / floaty 6s / spin+floaty — revalidação do BUG-01 da qa-1: não reproduzido |
| UI: tingimento por condição (clear/cloudy/rain) | PASSOU | 3 tints distintos via `data-tint`, componentes inalterados |
| UI: responsividade 360/768/1280 | PASSOU | Sem overflow; quebras idênticas ao protótipo; snap no weekly em telas estreitas |
| UI: reduced motion | PASSOU | Animações `none`, conteúdo 100% visível |
| UI: fidelidade visual lado a lado (3 larguras) | PASSOU | Idêntica ao protótipo, exceto diferenças documentadas na TechSpec |
| Arquitetura: isolamento do frontend | PASSOU | 50 requests: só `localhost` (app + proxy) e Google Fonts; zero Open-Meteo/BigDataCloud do browser |

## Acessibilidade
- **Teclado:** ordem de Tab lógica e completa na página fresca (input → Pesquisar → Localização Atual → botões do estado vazio → wrap), 10 tabs consecutivos sem salto, sem armadilha de foco.
- **Foco visível:** botões com outline nativo (`auto 1px`); input com indicador via `:focus-within` no container (borda `rgba(141,181,255,.41)` + halo cyan) — `a11y-focus-input.png`.
- **Rótulos:** input "Pesquisar cidade ou região"; seções com `aria-label` ("Temperatura atual", "Previsão por hora", "Detalhes do clima", "Próximos sete dias", "Clima vazio", "Erro ao carregar o clima"); gráfico com `role="img"` + "Gráfico de temperatura e precipitação por hora".
- **Hierarquia de headings:** um h1 ("Painel do Clima") e h2 por seção.
- **Contraste:** texto claro sobre fundo escuro mantido em todos os estados (vazio, carregado, skeleton, erro) — consistente com a baseline aprovada do protótipo.
- **Informação não apenas por cor:** condição sempre acompanhada de texto ("Nublado", "Garoa fraca") além do ícone; dias com chuva por ícone + "%".
- **Movimento reduzido:** `prefers-reduced-motion: reduce` (emulado) desativa todas as animações/transições e exibe o conteúdo completo.
- **Conteúdo dinâmico:** erro de geolocalização em `role="alert"`; busca com `aria-busy` no form; loading comunicado (skeleton + spinner).
- **Touch:** alvos ≥ 24 px (botões com 41 px de altura); busca acessível por Enter ou botão.

## Bugs Encontrados
| ID | Descrição | Severidade | Screenshot |
|----|-----------|------------|------------|
| BUG-01 | Subtexto dos estados de erro (404/400/rede) redundante em vez do texto orientativo da TechSpec (FR-14) | Baixa | `qa/qa-2/screenshots/req-14-city-not-found.png`, `req-16-empty-search-400.png`, `req-15-network-error.png` |

## Pendências da Rodada Anterior
- **BUG-01 (qa-1, média)** — "Ícone grande estático nas condições nuvem/chuva/tempestade (FR-21)": marcado como `corrigido` pelo `do-execute-qa-fix` (classe `bi-float` + regra `.bi-float{animation:floaty 6s ease-in-out infinite}`). **Retestado nesta rodada: não reproduzido** — cloud (Curitiba, code 3) e rain (São Paulo) com `animationName: "floaty"` 6s; sun (Fortaleza) com `spin` 32s no rotor; cloud-sun (BH, code 2) com composição animada. Evidência: `qa/qa-2/screenshots/req-21-icon-cloud-sun-bh.png` + `getComputedStyle` em runtime. Nenhum novo arquivo de bug foi criado para este item.

## Ferramentas MCP Utilizadas
- `playwright` (ui-testing) — usado: E2E de interface (navegação, busca, estados de erro, geolocalização via grant/clear + coords fixas, tooltip touch via CDP em contexto `hasTouch`, responsividade, reduced motion, skeletons com `page.route`, screenshots, console e network log, protótipo via `file://` em contexto isolado).
- `mcp-api-test` (api-testing) — usado: contrato HTTP completo de `GET /api/weather` (200/400/404, coordenadas + reverse geocoding, headers de cache/CORS, preflight) e sondagem de condições para escolha de cidades de teste.
- `context7` (documentation) — descoberto; não foi necessário (comportamento das bibliotecas já determinado pela TechSpec, pelo código e pelas respostas reais das APIs).
- Serviços: dev servers de frontend (`:5173`) e backend (`:3000`) iniciados por esta execução; o backend foi momentaneamente parado e reiniciado apenas para o teste de falha de rede (FR-15); ambos encerrados ao final.

## Skills do Projeto
- lidas: webapp-testing (orientação de E2E com Playwright), web-design-guidelines (auditoria de UI)
- A validação de acessibilidade seguiu os requisitos de acessibilidade do próprio PRD (teclado, rótulos, contraste, movimento, conteúdo) + a checklist baseline da skill de QA; a validação visual seguiu os critérios de aceite do PRD (FR-32/FR-33) e o método lado a lado da TechSpec.

## Conclusão
A implementação mantém o altíssimo nível de conformidade da rodada anterior: 37 dos 38 requisitos passaram em validação E2E ponta a ponta (API real + interface real, com rede real), incluindo a **revalidação bem-sucedida da correção do BUG-01 da qa-1** (ícone animado agora presente em todas as condições). Todos os fluxos de erro, geolocalização, acessibilidade, reduced motion, responsividade, ausência de cache, isolamento do frontend e a fidelidade visual ao protótipo nas três larguras de referência foram confirmados novamente nesta rodada.

**Status REPROVADO** exclusivamente por **BUG-01 (baixa)** desta rodada: nos estados de erro (404, 400 e rede), o subtexto exibe uma cópia redundante da mensagem de erro em vez do texto orientativo confirmado na TechSpec — o FR-14 exige "mensagem amigável orientando nova tentativa". Sem impacto funcional (o estado funciona, o painel é utilizável e o retry opera); a correção é pontual em `ErrorState.jsx`/`App.jsx` (priorização do `subtitle` do `STATES` sobre a `message` redundante) e pode ser tratada por `do-execute-qa-fix`. Recomenda-se nova rodada de QA após a correção — ou `APROVADO COM RESSALVAS` se o produto aceitar a ressalva.
