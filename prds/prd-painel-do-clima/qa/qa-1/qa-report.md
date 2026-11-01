# Relatório de QA - Painel do Clima

## Resumo
- Data: 2026-10-28
- Status: REPROVADO
- Total de Requisitos: 38
- Requisitos Atendidos (PASSOU): 37
- Requisitos Não Atendidos (FALHOU): 1
- Requisitos Verificados Só no Código: 0
- Requisitos Não Testados: 0
- Bugs Encontrados: 1 (1 média)

## Requisitos Verificados
| ID | Requisito | Status | Evidência |
|----|-----------|--------|-----------|
| FR-01 | Endpoint único `GET /api/weather` consumido pelo frontend | PASSOU | `mcp-api-test`: 200 em `?city=Curitiba`; network log do browser: única requisição dinâmica do app é `GET /api/weather` via proxy |
| FR-02 | Busca por nome: geocoding Open-Meteo → forecast → resposta | PASSOU | `mcp-api-test`: 200 com dados reais de Curitiba (geocoding + forecast em rede real) |
| FR-03 | 200 sucesso / 400 inválido ou ausente / 404 não encontrada | PASSOU | `mcp-api-test`: 200; 400 sem parâmetros, 400 `city=` vazio, 400 `lat=100`; 404 `Xyzqqqqqq123naoexiste` (msg pt-BR) |
| FR-04 | Payload mínimo: cidade resolvida, atuais, 24 h, 7 dias | PASSOU | 26 asserções em `mcp-api-test`: `city{name,region,country,display,coords}`, `timezone`, `current` completo, `hourly` 24 entradas a partir da hora local, `daily` 7 entradas com mín/máx/chuva |
| FR-05 | Formato passável da Open-Meteo, sem remodelagem complexa | PASSOU | Body inspecionado: campos Open-Meteo preservados + envelope leve (`city`, `hourly` fatiado) |
| FR-06 | Consulta por coordenadas + nome via reverse geocoding (API gratuita, sem chave) | PASSOU | `mcp-api-test` `?latitude=-25.43&longitude=-49.27` → 200 com `city.name="Curitiba"` (BigDataCloud, sem chave); nome exibido no painel no fluxo de geolocalização |
| FR-07 | `Cache-Control: no-store` em toda resposta, sem ETag | PASSOU | Headers inspecionados em 200, 400, 404 e preflight: `cache-control: no-store` presente, nenhum `ETag` |
| FR-08 | CORS explícito (origens, métodos, headers), dev documentado | PASSOU | `OPTIONS` → 204 com `access-control-allow-origin` ecoado, `methods: GET, OPTIONS`, `headers: Content-Type, Authorization`, `vary: Origin`; estratégia dev (proxy) documentada nos READMEs |
| FR-09 | Rota `/` cai direto no painel, sem telas intermediárias | PASSOU | Playwright: `http://localhost:5173/` renderiza o painel completo no load |
| FR-10 | Estado vazio no primeiro acesso, com convite à busca | PASSOU | `visual-home-empty.png` + snapshot: card glassmorphism com ícone de busca, h2 "Pesquise uma cidade", subtexto e botões; search em destaque |
| FR-11 | Campo de texto simples, sem autocomplete | PASSOU | DOM: input `type=text`, sem `autocomplete`, sem `list`/`<datalist>` |
| FR-12 | Busca por botão "Pesquisar" e por Enter | PASSOU | Enter ("Curitiba") e clique no botão ("São Paulo") — ambas dispararam a busca |
| FR-13 | Sucesso: nome/região da cidade, dados, indicador de atualização | PASSOU | Snapshot: "Curitiba, Paraná" + "Atualizado 11:30" (hora local da cidade — em Jakarta exibiu "21:45", não a hora do viewer) + 3 blocos populados |
| FR-14 | 404: mensagem amigável orientando nova tentativa, painel utilizável | PASSOU | `req-14-city-not-found.png` + snapshot: h2 "Cidade não encontrada" + botão "Nova busca"; search segue ativo |
| FR-15 | Falha de comunicação: feedback claro + tentar novamente | PASSOU | Backend (iniciado por este QA) parado → busca "Curitiba" → h2 "Não foi possível carregar o clima" + "Tentar novamente" (`req-15-network-error.png`); backend reiniciado → retry restaurou o painel (`req-15-retry-recovered.png`) |
| FR-16 | 400 vazio: feedback indicando nome válido | PASSOU | Busca vazia → h2 "Informe um nome de cidade" + botão; sem request de rede (sem novo erro no console) |
| FR-17 | Botão dedicado de geolocalização | PASSOU | Botão "Localização Atual" presente na search e no estado vazio; clique dispara o fluxo |
| FR-18 | Geolocalização: nome resolvido pelo backend exibido | PASSOU | Contexto Playwright com geolocation grant + coords fixas (-25.43, -49.27) → painel exibe "Curitiba, Paraná" resolvido via BigDataCloud (`req-18-geolocation-success.png`) |
| FR-19 | Geolocalização negada: mensagem amigável, busca por cidade segue | PASSOU | Permissão removida → `alert` "Localização negada." abaixo da search (`req-19-geolocation-denied.png`); busca "Florianópolis" em seguida carregou normalmente |
| FR-20 | Card atual: temperatura grande, condição, cidade, "atualizado", máx/mín/sensação | PASSOU | Snapshot: "18°", "Nublado", "Curitiba, Paraná", "Atualizado 11:30", chips Máx 22 / Mín 12 / Sensação 18 |
| FR-21 | Ícone animado coerente com a condição | FALHOU | Ícone coerente em forma/cor, mas estático em cloud/rain/storm (classe `bi-big` sem animação; `animationName: "none"` em runtime). Sol e sol+nuvem animados. Ver BUG-01 — `req-31-tint-cloudy-curitiba.png`, `req-31-tint-rain-jakarta.png` |
| FR-22 | 4 stats: sensação, umidade %, vento km/h+cardeal, UV+qualitativo, com ícone e barra | PASSOU | Snapshot: "18°C", "65 %", "4 km/h · NNE", "6 · Alto" (faixa WHO 6–7 = Alto); barras proporcionais; ícones com animação `bob` do protótipo |
| FR-23 | Gráfico: temperatura em linha + precipitação em barras + legenda das 2 séries | PASSOU | Legendas "Temperatura (°C)" e "Precipitação (mm)"; barras visíveis em Jakarta (chuva) e corretamente ausentes em Curitiba (precipitação 0 mm — regra do spec: 0 → sem barra) |
| FR-24 | Marcador do horário atual no gráfico | PASSOU | Linha-guia âmbar tracejada + "agora" no eixo, no índice da hora corrente (11h em Curitiba; 21h em Jakarta) |
| FR-25 | Tooltip em hover (desktop) e touch (mobile); some ao afastar/soltar | PASSOU | Desktop: hover → "22h · 15°C · 0 mm", mouseleave → some. Mobile (contexto `hasTouch`, CDP touchStart mantido): tooltip visível durante o toque, oculto no touchEnd — exatamente o comportamento do PRD |
| FR-26 | Animação de entrada do gráfico; desativada com prefers-reduced-motion | PASSOU | Linha traçada via JS (dasharray 823px → offset 0, 1.8s), pontos com stagger 45ms, count-up 1.4s, reveal por seção; com `reducedMotion: reduce`: tudo `animation/transition: none`, conteúdo 100% visível (dashoffset 0, `.pt` opacos, barras cheias) |
| FR-27 | 7 dias: dia, data curta, ícone, mín/máx, chuva | PASSOU | Snapshot: "Hoje/28 out…Ter/3 nov" com ícone por condição, "22° 12°", "63%" (7 cards) |
| FR-28 | Variação mín/máx com indicador gráfico no padrão do protótipo | PASSOU | Mesmo padrão do `painel.html` (linhas 674–679): máx em negrito + mín em tom claro, sem barra — a app replica o padrão exato do protótipo (fonte de verdade de aparência, FR-34) |
| FR-29 | Dia atual distinguido; rolagem horizontal com snap em telas estreitas | PASSOU | `.d-name.today` em cyan (computado `rgb(110,231,255)`); em 360/768px: `grid-auto-flow: column`, `scroll-snap-type: x mandatory`, `scroll-snap-align: start`, `overflow-x: auto` (scrollWidth 602 > 267) |
| FR-30 | Skeleton loading espelhando o layout + busca perceptível | PASSOU | `visual-skeleton-loading.png`: skeleton com o mesmo formato dos componentes (card atual, gráfico, 4 stats, 7 dias); botão com spinner + form `aria-busy="true"` |
| FR-31 | Tingimento sutil do fundo por condição, sem alterar componentes | PASSOU | `data-tint` no runtime: `clear` (Recife, code 0), `cloudy` (Curitiba, code 3), `rain` (Jakarta, code 55) — screenshots mostram a atmosfera diferente com texto/componentes idênticos |
| FR-32 | Responsivo 360/768/1280 sem overflow, quebras do protótipo | PASSOU | Sem overflow horizontal nos 3 tamanhos (scrollWidth = clientWidth); 1 coluna e stats 2×2 em ≤920px; search em 2 linhas e `#btnLocate` compacto (`.btn-text` oculto) em 360px; `visual-mobile-360.png`, `visual-tablet-768.png`, `app-1280.png` |
| FR-33 | Visualmente idêntica ao `painel.html` no estado carregado | PASSOU | Comparação lado a lado nas 3 larguras (`proto-1280.png`/`app-1280.png`, `proto-360.png`/`visual-mobile-360.png`, `proto-768.png`/`visual-tablet-768.png`): mesmo grid, tipografia, cores, cards glassmorphism, chips, gráfico com eixos/marcador "agora". Diferenças apenas as aceitas pela TechSpec (dados reais, barras+legenda de precipitação, "Atualizado HH:MM", rodapé adaptado, tint dinâmico, janela rolante 24 h) |
| FR-34 | Precedência: comportamento/dados do requisito, aparência do protótipo | PASSOU | Comportamento validado contra o PRD em runtime; aparência idêntica ao `painel.html` na comparação (FR-33) |
| FR-35 | Nenhum valor de clima fixo no código; dados sempre do backend | PASSOU | Grep: componentes leem exclusivamente `current.*`/`hourly.*`/`daily.*`; runtime: valores distintos por cidade (Curitiba 18°/63% vs Jakarta 26°/92%); network log: nenhuma chamada a domínio externo de dados |
| FR-36 | Todo `fetch` do frontend com `cache: 'no-store'` | PASSOU | Código: único `fetch(` em `frontend/src/services/weather.js:34` com `cache: 'no-store'`; coberto por teste de unidade |
| FR-37 | Estados ausentes do protótipo compostos só com o design system | PASSOU | `visual-home-empty.png`, `visual-skeleton-loading.png`, `req-14-city-not-found.png`, `req-16-empty-search-400.png`, `req-15-network-error.png`: mesmos cards glassmorphism, ícones, tipografia e cores do protótipo |
| FR-38 | Conteúdo real em pt-BR; rodapé sem "simulado" | PASSOU | Datas pt-BR ("quarta-feira, 28 de outubro", "28 out"), condições ("Nublado", "Garoa intensa"), UV "Alto", cardeais pt-BR ("NNE", "SSO"), hora local da cidade; rodapé: "dados reais via Open-Meteo · feito com React e Node.js" |

## Testes E2E Executados
| Fluxo | Resultado | Observações |
|-------|-----------|-------------|
| API: 200 cidade (Curitiba) | PASSOU | Envelope completo, 26 asserções, `no-store`, sem ETag |
| API: 400 (ausente / vazio / coords inválidas) | PASSOU | Mensagens pt-BR, `no-store` |
| API: 404 cidade inexistente | PASSOU | Mensagem pt-BR, `no-store` |
| API: coordenadas + reverse geocoding | PASSOU | Nome "Curitiba" resolvido pelo BigDataCloud |
| API: CORS preflight | PASSOU | 204 com headers `allow-*` corretos |
| UI: estado inicial (vazio) | PASSOU | Card de convite, search em destaque, céu animado, relógio atualizando |
| UI: busca por Enter (Curitiba) | PASSOU | Skeleton → painel completo |
| UI: busca por botão (São Paulo, acento) | PASSOU | Acentos resolvidos normalmente |
| UI: 404 (cidade inexistente) | PASSOU | Mensagem amigável, "Nova busca", painel utilizável |
| UI: 400 (busca vazia) | PASSOU | Feedback local, sem request |
| UI: falha de rede + retry | PASSOU | Backend parado → erro; reiniciado → retry recuperou |
| UI: geolocalização (permitida, coords fixas) | PASSOU | Nome resolvido exibido |
| UI: geolocalização (negada) | PASSOU | `alert` amigável, busca por cidade funcional |
| UI: tooltip do gráfico (hover desktop) | PASSOU | Aparece/some corretamente |
| UI: tooltip do gráfico (touch mobile) | PASSOU | Visível com o dedo pressionado, some ao soltar (conforme PRD) |
| UI: tingimento por condição (clear/cloudy/rain) | PASSOU | 3 tints distintos, componentes inalterados |
| UI: responsividade 360/768/1280 | PASSOU | Sem overflow; quebras conforme protótipo |
| UI: reduced motion | PASSOU | Animações desativadas, conteúdo completo |
| UI: fidelidade visual lado a lado (3 larguras) | PASSOU | Idêntica ao protótipo, exceto diferenças documentadas na TechSpec |
| Arquitetura: isolamento do frontend | PASSOU | Network log: apenas `localhost:5173` + Google Fonts |

## Acessibilidade
- **Teclado:** todos os elementos interativos alcançáveis por Tab em ordem lógica que segue o layout (input → Pesquisar → Localização Atual → botões do estado) — verificado em 10 tabs consecutivos na página fresca.
- **Foco visível:** botões com outline nativo (`1px auto`); input com indicador via `:focus-within` no container (borda `rgba(145,183,255,.38)` + halo cyan) — `a11y-focus-input.png`, `a11y-focus-button.png`.
- **Rótulos:** input com nome acessível "Pesquisar cidade ou região"; gráfico com `role="img"` + "Gráfico de temperatura e precipitação por hora"; regiões com `aria-label` ("Temperatura atual", "Previsão por hora", "Detalhes do clima", "Próximos sete dias", "Clima vazio", "Erro ao carregar o clima"); botão de geolocalização com texto descritivo.
- **Hierarquia de headings:** um h1 ("Painel do Clima") e h2 por seção.
- **Contraste:** texto claro sobre fundo escuro mantido em todos os estados (vazio, carregado, erro) — consistente com o protótipo (baseline aprovada).
- **Informação não apenas por cor:** condição sempre acompanhada de texto ("Nublado", "Garoa intensa") além do ícone; dias com chuva indicados por ícone + "%".
- **Movimento reduzido:** `prefers-reduced-motion: reduce` desativa todas as animações/transições e exibe o conteúdo completo (verificado em runtime com emulação).
- **Conteúdo dinâmico:** erro de geolocalização em `role="alert"`; busca com `aria-busy` no form; estados de loading comunicados (skeleton + spinner).
- **Touch:** alvos ≥ 24 px (botões com 41 px de altura); nenhuma função exige gesto complexo sem alternativa (Enter/botão para busca).

## Bugs Encontrados
| ID | Descrição | Severidade | Screenshot |
|----|-----------|------------|------------|
| BUG-01 | Ícone grande estático nas condições nuvem/chuva/tempestade (FR-21) | Média | `qa/qa-1/screenshots/req-31-tint-cloudy-curitiba.png`, `qa/qa-1/screenshots/req-31-tint-rain-jakarta.png` |

## Pendências da Rodada Anterior
Nenhuma pendência da rodada anterior.

## Ferramentas MCP Utilizadas
- `playwright` (ui-testing) — usado: E2E de interface (navegação, busca, estados de erro, geolocalização via override, tooltip touch via CDP em contexto `hasTouch`, responsividade, reduced motion, screenshots, console e network log).
- `mcp-api-test` (api-testing) — usado: contrato HTTP completo de `GET /api/weather` (200/400/404), headers de cache/CORS e fluxo de coordenadas.
- `context7` (documentation) — descoberto; não foi necessário (comportamento das bibliotecas já determinado pela TechSpec e pelo código).
- Serviços: dev servers de frontend (`:5173`) e backend (`:3000`) iniciados por esta execução e encerrados ao final; o backend foi momentaneamente parado e reiniciado apenas para o teste de falha de rede (FR-15).

## Skills do Projeto
- lidas: webapp-testing (orientação de E2E com Playwright), web-design-guidelines (auditoria de UI)
- Nenhuma outra skill do projeto aplicável a esta fase de QA.

## Conclusão
A implementação está em altíssimo nível de conformidade: 37 dos 38 requisitos passaram em validação E2E ponta a ponta (API real + interface real, com rede real), incluindo todos os fluxos de erro, geolocalização, acessibilidade, reduced motion, responsividade, ausência de cache, isolamento do frontend e fidelidade visual ao protótipo nas três larguras de referência.

**Status REPROVADO** exclusivamente por **BUG-01 (média)**: o FR-21 exige ícone animado em todas as condições, mas as variantes nuvem/chuva/tempestade do `WeatherIconBig` usam a classe `bi-big` sem nenhuma animação (sol e sol+nuvem estão animados). É um desvio visual localizado, sem impacto funcional — corrigível de forma pontual em `WeatherIconBig.jsx`/`index.css` por `do-execute-qa-fix`. Recomenda-se nova rodada de QA após a correção.
