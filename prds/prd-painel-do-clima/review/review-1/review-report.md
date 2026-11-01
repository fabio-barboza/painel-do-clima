# Relatório de Code Review - Painel do Clima

## Resumo
- Data: 2026-10-28
- Branch: `main` (mudanças não commitadas na working tree; base de comparação: `HEAD`/`origin/main`)
- Status: **APROVADO COM RESSALVAS**
- Arquivos Modificados: 72 (60 novos na feature + 12 modificados, sendo 2 exclusões)
- Linhas Adicionadas: 5938
- Linhas Removidas: 50

Escopo revisado: backend (config, middlewares cache/CORS/log, rota `GET /api/weather`, serviços geocoding/forecast/reverseGeocoding/externalError), frontend (18 componentes, 4 hooks, 3 libs, service, port verbatim do CSS, sprite SVG, App, `index.html`, `vite.config.js`), suítes de teste (5 arquivos Jest + 20 arquivos Vitest) e documentação (READMEs, `.env.example`).

## Conformidade com Rules
| Rule | Status | Observações |
|------|--------|-------------|
| Dois pacotes independentes, sem workspace na raiz | OK | `frontend/` (ESM) e `backend/` (CommonJS) mantidos separados |
| ESM no frontend, CommonJS no backend (sem mistura) | OK | `import`/`export` só no frontend; `require`/`module.exports` só no backend |
| Testes do backend em `**/__tests__/**/*.test.js` | OK | 5 arquivos, todos dentro de `backend/src/__tests__/` com sufixo `.test.js` |
| Testes do frontend em `src/__tests__/*.test.*` | OK | 20 arquivos, padrão aceito pelo Vitest |
| `VITE_` para variáveis expostas ao frontend | OK | único uso: `VITE_API_URL` (`.env.example` documenta dev vazio / prod absoluto) |
| Nenhum `.env` versionado | OK | apenas `.env.example` (backend e frontend); `.gitignore` cobre |
| Comentários no código (PRD: "fora de escopo — excluídos pelo requisito") | NOK | 7 comentários `//` adicionados nesta mudança (backend `index.js` e 3 arquivos de teste). Ver R-09. JSDoc dos serviços segue exigência explícita da TechSpec ("assinaturas JSDoc") — tratado como desvio justificado |
| Portas e estratégia de comunicação documentadas | OK | `vite.config.js` (proxy `:5173`→`:3000`), READMEs dos dois pacotes e `.env.example` consistentes com o PRD (dev 5173/3000; prod 4173/3000) |

## Aderência à TechSpec
| Decisão Técnica | Implementado | Observações |
|-----------------|--------------|-------------|
| Envelope leve (Open-Meteo + `city` + `hourly` 24 h rolante) | SIM | `buildEnvelope`/`sliceHourly24` conforme; janela testada em 00h/12h/23h |
| `app.listen` guardado por `require.main === module` | SIM | corrige o EADDRINUSE documentado no `AGENTS.md` |
| ETags desabilitadas + `Cache-Control: no-store` em toda resposta | SIM | `app.set('etag', false)` + middleware `cache.js`; coberto para 200/400/404/502 e preflight |
| CORS manual configurável (`CORS_ORIGINS`, `*` em dev documentado) | SIM | middleware próprio; preflight 204; produção ecoa só origem da lista (testado) |
| Reverse geocoding BigDataCloud best-effort, `city.name` null em falha, paralelo ao forecast | SIM | `Promise.all` confirmado por teste; falhas → `null` + `console.warn` sem derrubar a consulta |
| Timeout 8 s por chamada externa (`AbortSignal.timeout`) | SIM | nos três clientes externos |
| Zero dependências novas nos dois pacotes | SIM | `package.json` inalterados; `fetch` global, CORS à mão, SVG puro |
| CSS portado **ipsis litteris** + acréscimos delimitados com tokens do protótipo | SIM | verificação byte a byte (diff) do bloco 12–389 do `painel.html` vs. linhas 1–378 de `index.css`: idêntico; bloco de acréscimos (tint, skeleton, barras, estados) usa apenas tokens existentes |
| Sprite com os 16 símbolos do protótipo (mesmos ids e geometria) | SIM | comparado símbolo a símbolo com `painel.html` (394–486): idêntico |
| `cache: 'no-store'` em toda `fetch` do frontend (FR-36) | SIM | único `fetch` do app está em `services/weather.js`; nenhuma chamada externa direta no frontend (verificado por grep) |
| Nenhum valor de clima fixo no código (FR-35) | SIM | dados 100% da resposta; placeholders "–" só para null/ausente |
| Gráfico: geometria W=760/H=300, Catmull-Rom /6, eixos, marcador "agora", tooltip | PARCIAL | geometria, traçado, "agora", animação e reduced-motion conformes; **tooltip e eixo X exibem índice (00h, 0h…) em vez da hora real** (R-02) e **guia/ponto de hover não são posicionados** (R-03) |
| AbortController: nova busca/locate aborta a anterior (anterior ignorada) | PARCIAL | o abort acontece, mas o resultado/rejeição da busca abortada **não é descartado** — produz erro de rede falso (R-01) |
| Geo negado preserva o estado das seções anterior | PARCIAL | `stateRef` desatualizada no caminho de erro local (R-05) |
| "Nenhum dado pessoal é logado (geolocalização usada e descartada)" | PARCIAL | `logger` grava `originalUrl` completo, incluindo `latitude`/`longitude` na query (R-06) |
| Efeitos com cleanup (IO unobserve, rAF cancelado, abort no unmount) | PARCIAL | IO e abort OK; `useCountUp` não cancela o `requestAnimationFrame` em cleanup (R-10) |
| Barras de precipitação: altura `max(2, (p/pMax)×plot×0.28)`, `pMax = max(precip, 1mm)×1.25` | CONFORME (ambíguo) | implementação literal (pMax por hora) — ver **Decisão do usuário** em Recomendações (barras ≥ 1 mm ficam com altura idêntica) |
| Testes conforme "Abordagem de Testes" | SIM | todos os grupos listados presentes (rota, serviços, slice, CORS, funções puras, serviço, hook, componentes, App); mocks de `fetch`/`geo` por teste, sem vazamento global |

**Desvios justificados (documentados, sem reprovação):** JSDoc nos serviços do backend (exigido pela própria TechSpec — "assinaturas JSDoc") apesar da exclusão genérica de "comentários no código" do PRD; `fireEvent` no lugar de `userEvent` e ausência de MSW (restrição de zero dependências novas); `vite.config.js` em JS (convenção do projeto, não `.ts`).

## Tasks Verificadas
| Task | Status | Observações |
|------|--------|-------------|
| 1.0 Fundação do backend | COMPLETA | config, cache/cors/logger, externalError, guard de listen, 404 JSON, error handler |
| 2.0 Clientes de serviços externos | COMPLETA | geocoding/forecast(+sliceHourly24)/reverseGeocoding; timeout 8 s; best-effort no reverse |
| 3.0 Rota GET /api/weather | COMPLETA | validação 400 (parâmetros, coordenadas, city+coords), 404, 502, 200 nos dois fluxos; ver R-04 (caso coordenada única) |
| 4.0 Fundação do frontend | COMPLETA | `index.html` (lang pt-BR, título, fonte Inter, preconnect), CSS verbatim+acréscimos (verificado), proxy Vite, `.env.example` |
| 5.0 IconSprite + Icon + Reveal/useReveal | COMPLETA | 16 símbolos idênticos; IO threshold 0.15 one-shot |
| 6.0 SkyBackground/Header/Clock/Footer | COMPLETA | céu idêntico ao protótipo (140 estrelas, mesma faixa de aleatoriedade; nuvens/meteors idênticos); tint por crossfade de camadas |
| 7.0 Funções puras de domínio | COMPLETA | WMO (29 códigos + fallback), UV, 16 cardinais, formatação pt-BR (meses em array fixo; dia da semana por algoritmo determinístico — validado contra a data atual) |
| 8.0 Camada de dados | COMPLETA | service com `no-store`/timeout/AbortSignal.any; useCountUp (1400 ms, delay 450 ms, reduced-motion direto); useWeather (ver R-01/R-05) |
| 9.0 SearchBar | COMPLETA | form semântico, Enter + botão, `aria-busy` + spinner, geo-erro em `.search-error` |
| 10.0 CurrentConditions + WeatherIconBig | COMPLETA | "Atualizado HH:MM" do ISO da cidade, count-up, chips Máx/Mín/Sensação, ícones por variante |
| 11.0 StatsGrid + StatCard | COMPLETA | 4 cards com escalas da TechSpec (sensação −10…40, umidade 0–100, vento 0–40, UV 0–12), piso 4% |
| 12.0 HourlyChart | COMPLETA (com ressalvas) | 24 pontos, barras, legenda 2ª série, animação de traçado, reduced-motion, remontagem por key; ver R-02/R-03 |
| 13.0 WeeklyForecast + DayCard | COMPLETA | 7 dias, "Hoje" distinguido, prob. de chuva com "%" / "–", ícones coloridos |
| 14.0 EmptyState/Skeleton/ErrorState | COMPLETA | compostos com o design system (state-card, chips, botões); mensagens pt-BR por tipo (ver R-11) |
| 15.0 Orquestração do App.jsx | COMPLETA | máquina de estados, `data-tint`, remontagem do gráfico por key, geo-erro sem trocar as seções |
| 16.0 Completação | COMPLETA (com ressalvas) | a11y (roles, labels, reduced motion) ✓; lint roda (1 warning originado em `coverage/` — R-07); READMEs ✓; remoções de `App.css` e `public/icons.svg` ✓ |

## Testes
- Total de Testes: 227 (backend 53 + frontend 174)
- Passando: 227
- Falhando: 0
- Coverage: backend 96,55% stmts / 88,88% branch / 100% funcs; frontend 97,88% stmts / 91,11% branch / 93,97% funcs (`dist/` excluído da cobertura desde R-08, sem ruído de build)
- Lint (frontend, única checagem estática declarada): 0 erros, 1 warning (em arquivo gerado sob `coverage/` — R-07)
- Qualidade: testes de comportamento com queries acessíveis, mocks de rede por teste, casos de borda (slice 00h/12h/23h, acentos, coordenadas inválidas, CORS dev/prod, parallelismo, reduced motion, remontagem). Observação: os testes do gráfico usam dados onde índice == hora do dia, o que mascara a R-02; e o teste de abort não verifica o estado pós-abort (R-01).

## Problemas Encontrados
| Severidade | Arquivo | Linha | Descrição | Sugestão |
|------------|---------|-------|-----------|----------|
| MAIOR | `frontend/src/services/weather.js` | 31–37 | `request()` converte **toda** rejeição do `fetch` — inclusive `AbortError` de busca abortada — em `WeatherError('network')`; a guarda `err?.name === 'AbortError'` em `useWeather.js:55` é código morto. Nova busca sobre busca em voo mostra erro de rede falso ("Não foi possível carregar o clima") até a segunda resposta chegar. Viola "nova busca/locate aborta a anterior" da TechSpec | Re-lançar o erro original quando `signal.aborted` for true antes de converter em `WeatherError` (R-01) | **Status:** Corrigido — `request()` agora re-lança o erro original quando o `signal` foi abortado, permitindo que o `AbortError` alcance o `useWeather` e seja descartado pela guarda existente; adicionados testes de regressão no service e no hook. Suíte 176/176, lint 0 erros. |
| MAIOR | `frontend/src/components/HourlyChart.jsx` | 102, 143–148 | Eixo X (`{i}h`) e tooltip (`String(idx).padStart(2,'0')+'h'`) exibem o **índice** da janela em vez da hora real. No protótipo índice == hora (dados fixos 00h–23h); com a janela rolante ("agora" no índice 0) o eixo mostra "0h…21h" e o tooltip "00h · 21°C" — hora ilegível. Viola FR-25 (tooltip com a hora) e FR-38 (conteúdo dinâmico real) | Derivar rótulos de `hourly.time[i]` (ex.: `hourly.time[i].slice(11,13)+'h'`) no eixo (a cada 3) e no tooltip; atualizar os testes que hoje afirmam o comportamento por índice (R-02) | **Status:** Corrigido — helper `hourLabel(iso) = iso.slice(11,13)+'h'` aplicada ao eixo X (`{i}h` → `hourLabel(hourly.time[i])`) e ao tooltip (`String(idx).padStart(2,'0')+'h'` → `hourLabel(hourly.time[hover.idx])`), mantendo `°C`/`mm`/`· agora`; fixture `TIMES` dos testes virou janela rolante a partir de 14h e os rótulos/horas reais foram afirmados. Suíte do frontend 176/176, lint 0 erros. |
| MAIOR | `frontend/src/components/HourlyChart.jsx` | 200–201 | `.guide` sem `x1`/`x2` e `.hoverdot` sem `cx`/`cy`: no hover a linha-guia fica em x=0 (borda esquerda) e o ponto branco no canto superior, em vez do ponto hoverado (`hover.cx/cy` já é calculado em `position()` e só vai para o tooltip). O protótipo posiciona ambos via JS. Quebra a interação central (FR-25) e a fidelidade visual (FR-33) | Ligar os atributos ao estado: `x1/x2 = hover ? hover.cx : 0` no `line.guide`; `cx/cy = hover ? (hover.cx, hover.cy) : 0` no `circle.hoverdot`; testar as coordenadas no hover (R-03) | **Status:** Corrigido — `<line id="guide">` agora com `x1/x2 = hover ? hover.cx : 0` e `<circle id="hoverdot">` agora com `cx/cy = hover ? (hover.cx, hover.cy) : 0`, ligando aos valores já calculados em `position()` (antes ficavam em 0,0); adicionado assert de posição no hover do `HourlyChart.test.jsx` (`x1`/`x2`/`cx`/`cy` com `toBeCloseTo` ao ponto `X(idx)`/`Y(temps[idx])`). Suíte do frontend 176/176, lint 0 erros. |
| MENOR | `backend/src/routes/weather.js` | 49–82 | `parseCoords` com **apenas uma** coordenada (ex.: `?latitude=10`) passa como válida (`null` vira 0 nas comparações de range) e o forecast é chamado com `longitude=null` → 400 externo → **502** em vez de 400 (contrato: parâmetros inválidos/usentes → 400) | Tratar par incompleto como inválido (`hasLatitude !== hasLongitude` → `valid=false`) → 400 "Coordenadas inválidas."; adicionar testes `?latitude=10` e `?longitude=20` (R-04) | **Status:** Corrigido — `parseCoords` agora invalida par incompleto (`if (hasCoords && hasLatitude !== hasLongitude) { valid = false; }`); `?latitude=10`/`?longitude=20` respondem 400 "Coordenadas inválidas." sem chamar `fetchForecast`; adicionados 2 testes de regressão na suíte de validação (400). Suíte do backend 55/55 verdes. |
| MENOR | `frontend/src/hooks/useWeather.js` | 32, 50, 59, 67–71, 90–92 | `stateRef` só é atualizada nos `.then/.catch` do `runFetch`; após busca vazia local (erro `bad-request`) e com geo negado em seguida, `locate()` restaura o **sucesso antigo** em vez do estado atual das seções (a mensagem "Informe um nome de cidade" some e os dados antigos voltam) | Manter `stateRef` sincronizada em toda transição de estado (incluindo o caminho local de `search('')`); teste de regressão com a sequência sucesso → busca vazia → geo negado (R-05) | **Status:** Corrigido — helper único `commit` agora atualiza estado e `stateRef` juntos em todas as transições (`.then`, `.catch`, caminho local de `search('')` e callback de geo negado, que ainda preserva o estado anterior via `before`); `stateRef` já sincroniza após a busca vazia, de modo que o geo negado não volta a restaurar o sucesso antigo. Adicionado teste de regressão (sucesso → busca vazia → geo negado) em `useWeather.test.js`. Suíte do frontend 177/177, lint 0 erros. |
| MENOR | `backend/src/middleware/logger.js` | 5, 13 | `req.originalUrl` inclui a query: em `?latitude=..&longitude=..` o log de acesso grava as coordenadas do usuário — a TechSpec afirma "Nenhum dado pessoal é logado (a geolocalização é usada e descartada)" | Logar `req.path` (sem query) em `logger` e `logError`; ajustar o teste do logger se necessário (R-06) | **Status:** Corrigido — `logger` agora loga `req.path` (sem query) tanto na linha de acesso (`console.info`) quanto no `logError` (chave `url`→`path`); adicionado assertion de regressão afirmando que a query de coordenadas (`?latitude=..&longitude=..`) não chega ao log; suíte do backend 56/56, `logger.js` com 100% de instruções. |
| MENOR | `frontend/eslint.config.js` | 8 | `globalIgnores(['dist'])` não inclui `coverage/`: `npm run lint` aponta warning em `coverage/block-navigation.js` (arquivo gerado) | `globalIgnores(['dist', 'coverage'])` (R-07) | **Status:** Corrigido — `globalIgnores` passou a `['dist', 'coverage']`, excluindo o diretório de cobertura gerado do lint; `eslint .` sai sem warnings (exit 0) e sem tocar em código ou testes. |
| MENOR | `frontend/vitest.config.js` | 15–21 | `coverage.exclude` não cobre `dist/**`: o relatório de cobertura conta o bundle buildado (0%) e dilui os números | Adicionar `'dist/**'` ao `coverage.exclude` (R-08) | **Status:** Corrigido — `'dist/**'` adicionado ao `coverage.exclude`; `dist/assets` saiu do relatório de cobertura e a cobertura de instruções do frontend subiu de 97,04% para 97,88%. Suíte do frontend 177/177 verde, sem tocar em código de produto, PRD, TechSpec nem testes. |
| MENOR | `backend/src/index.js`, `backend/src/__tests__/{weather,middlewares,integration}.test.js` | vário | 7 comentários `//` adicionados nesta mudança — o PRD exclui "comentários no código" e a TechSpec reitera ("Sem comentários no código"). Há também um comentário pré-existente em `index.js` (`// Health check endpoint`) | Remover os comentários `//` adicionados (JSDoc dos serviços é mantido — exigência da TechSpec); avaliar remoção do pré-existente na mesma oportunidade (R-09) | **Status:** Corrigido — removidos os 7 comentários `//` adicionados (backend `index.js`: 3; `weather.test.js`, `middlewares.test.js` e `integration.test.js`: 4) e também o comentário pré-existente `// Health check endpoint`, deixando o arquivo `index.js` íntegro à regra; nenhuma linha de código alterada e JSDoc dos serviços mantido. Suíte do backend 56/56, cobertura de instruções 96,58%. |
| MENOR | `frontend/src/hooks/useCountUp.js` | 18–39 | O cleanup só cancela o `setTimeout` do delay; se o componente for desmontado durante a animação (ex.: nova busca remontando o card), o `requestAnimationFrame` continua até ~1,4 s chamando `setValue` em hook desmontado. A TechSpec promete "rAF cancelado" no cleanup | Rastrear o `rafId` e `cancelAnimationFrame` no cleanup (R-10) | **Status:** Corrigido — `useCountUp.js` agora trackea o id do `requestAnimationFrame` (`let rafId = null` no escopo do `useEffect`, atribuído em cada quadro `animate`) e o cleanup cancela ambos os timers: `clearTimeout(delayId)` + `cancelAnimationFrame(rafId)` quando `rafId !== null`. Desmonte durante a animação interrompe o loop imediatamente, impedindo `setValue` em hook desmontado e o ~1,4 s de trabalho ocioso; caminho reduced-motion preservado (sem rAF agendado, guard evita `cancelAnimationFrame(null)`). Adicionado teste de regressão em `useCountUp.test.js`. Suíte do frontend 178/178, lint 0 erros. |
| MENOR | `frontend/src/components/ErrorState.jsx` | 35 | Typo em rótulo acessível: `aria-label="Erro ao cargar clima"` ("cargar" é castelhano) — interface em pt-BR (FR-38) | Corrigir para `"Erro ao carregar o clima"` (R-11) | **Status:** Corrigido — `aria-label` em `ErrorState.jsx` (linha 35) passou de `"Erro ao cargar clima"` para `"Erro ao carregar o clima"`; nenhuma outra ocorrência de "cargar" na base, e nenhum teste referencia o rótulo antigo (o assert de acessibilidade usa o `heading`/`message`, não o `aria-label`). Suíte do frontend 178/178 verde, lint 0 erros. |

## Pontos Positivos
- **Port verbatim confirmado por diff byte a byte** do `<style>` do `painel.html` (linhas 12–389 → `index.css` 1–378), com o bloco de acréscimos delimitado e usando exclusivamente tokens do protótipo; baseline do céu byte-idêntica, tint por crossfade de camadas exatamente como especificado.
- **Sprite SVG idêntico** ao protótipo (16 símbolos, mesmos ids e geometrias) e céu animado replicado (140 estrelas com a mesma faixa de aleatoriedade, nuvens e meteors com posições/durações/delays idênticos).
- **Arquitetura inegociável respeitada**: frontend com um único ponto de rede (`services/weather.js`), zero chamadas externas diretas (verificado), `cache: 'no-store'` em todo fetch, zero dependências novas, zero valor de clima hard-coded.
- **Backend limpo e fiel à TechSpec**: middlewares isolados (cache/cors/logger), `ExternalError` com status opcional, validação completa de coordenadas/city, parallelismo forecast ∥ reverse (com teste de parallelismo), timeout 8 s por chamada, ETag desligado e `no-store` cobertos para todos os status, 404 JSON para rotas desconhecidas e guard de `app.listen` que resolve o EADDRINUSE do Jest.
- **Suítes robustes**: 227 testes, todos passando, comportamento e queries acessíveis, mocks isolados por teste, casos de borda reais (slice rolante cruzando o dia, acentos/trim, preflight, CORS dev vs. produção, reduced motion, remontagem de animação); cobertura alta nos dois pacotes.
- **Acessibilidade consistente**: form semântico com Enter, `role="search"`/`role="img"` com labels descritivos, `aria-busy` na busca, `role="alert"` no geo-erro, `prefers-reduced-motion` tratado em CSS e JS, informação nunca só por cor (texto+ícone).
- **Documentação coerente**: READMEs e `.env.example` documentam a estratégia de comunicação (proxy em dev, URL absoluta + `CORS_ORIGINS` em produção) e as portas, exatamente como manda o PRD.

## Pendências da Rodada Anterior
Nenhuma pendência da rodada anterior. (Esta é a `review-1` — primeira rodada.)

## Skills e MCPs do Projeto
- Skills do projeto: lidas: nodejs-backend-patterns, react-testing, javascript-typescript-jest, vercel-react-best-practices, vite, vitest, vercel-composition-patterns, web-design-guidelines, frontend-design
- MCPs do projeto: disponíveis: playwright (ui-testing), mcp-api-test (api-testing), context7 (documentation) · usados nesta etapa: nenhum necessário (review por leitura de código + suítes do projeto; E2E/HTTP pertencem à fase `do-execute-qa`; nenhum questionamento de API de biblioteca exigiu o `context7`)

## Recomendações
- **Decisão do usuário (barras de precipitação):** a TechSpec fixa `pMax = max(precip, 1mm)×1.25` de forma ambígua (por hora ou por janela). A implementação literal (pMax por hora) faz **todas as barras ≥ 1 mm saírem com a mesma altura** — o gráfico perde a comparação relativa de chuva (1 mm e 10 mm ficam iguais). Se a intenção for barras proporcionais, `pMax` deve ser o máximo da janela de 24 h (com piso de 1 mm). Pedir ao usuário: "as barras devem ser proporcionais entre si (pMax = maior valor da janela), mantendo o teto de 28% do plot?".
- **Decisão do usuário (faixas de UV):** `uvLabel` arredonda o valor antes de classificar (2,9 → "Moderado"), o que segue os casos de teste da TechSpec, mas difere da leitura contínua WHO (2,9 < 3 → "Baixo"). Se a convenção desejada for a contínua, ajustar `uvLabel` + spec + testes.
- **Decisão do usuário (comentários/JSDoc):** o PRD exclui "comentários no código"; a TechSpec exige assinaturas JSDoc no backend. Este review tratou JSDoc como desvio justificado e marcou apenas os comentários `//` simples (R-09). Confirmar se a exclusão do PRD deve se estender ao JSDoc.
- **Rodar `do-execute-qa`** para validar com rede real o que as suítes não cobrem: cenários 2 (busca real), 7 (gráfico interativo — especialmente após R-02/R-03), 10 (reduced motion) e a verificação visual lado a lado 360/768/1280 (FR-33).
- Considerar remover os assets de template sem referência em `frontend/src/assets/` (`react.svg`, `vite.svg`, `hero.png`) — a TechSpec não os lista para remoção; decisão de escopo.
- Os testes `HourlyChart.test.jsx` usam dados em que índice == hora do dia (mascaram a R-02) e o teste "nova busca aborta a anterior" de `useWeather.test.js` não afirma o estado após o abort (mascara a R-01) — as correções R-01/R-02 devem trazer testes que cubram os dois cenários reais.

## Conclusão
Implementação **madura e fiel ao PRD/TechSpec** nos pontos estruturais: arquitetura inegociável respeitada, contrato da API completo e testado, port visual verbatim comprovado, zero dependências novas, pt-BR consistente e suítes completas (227/227 verdes, cobertura ~97%). O status é **APROVADO COM RESSALVAS** porque há **3 problemas MAIORES não bloqueantes**, todos na camada de interação do gráfico/busca e com correções localizadas: (R-01) busca abortada gera erro de rede falso no fluxo principal de busca consecutiva; (R-02) eixo X e tooltip mostram índice em vez da hora real na janela rolante; (R-03) linha-guia e ponto de hover não são posicionados (ficam em 0,0). Nenhum problema de segurança, nenhum teste falhando, nenhuma violação do contrato HTTP. Recomenda-se aplicar as 11 fix tasks (3 maiores, 8 menores) e depois rodar `do-execute-qa` (rodada qa-1) para validação E2E.
