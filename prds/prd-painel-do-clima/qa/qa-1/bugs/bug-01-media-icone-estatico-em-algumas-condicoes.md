---
id: BUG-01
severidade: Média
status: corrigido
---

# Bug: Ícone grande estático nas condições nuvem/chuva/tempestade

## Descrição
O FR-21 exige que o card de condições atuais exiba um **ícone animado** coerente com a condição recebida do backend (sol, nuvem, sol com nuvem, chuva, tempestade). As variantes `sun` e `cloud-sun` usam as classes animadas do protótipo (`bi-sun` com `rotor` → `spin 32s`; `bi-cloud` → `floaty 6s`), mas as variantes `cloud`, `rain` e `storm` são renderizadas com a classe `bi-big`, que (em `frontend/src/index.css:407`) define apenas `position` e `drop-shadow` — **nenhuma animação**. O resultado: nas condições nublado, chuva e tempestade (os mais comuns no Brasil) o ícone grande fica estático, enquanto no protótipo a nuvem flutua (`floaty`).

Evidência em runtime (condição "Nublado", `weather_code` 3, Curitiba):
- `getComputedStyle(.big-icon).animationName === "none"` e nenhum descendente com animação ativa.
- O SVG renderizado: `<svg class="bi-big" style="color: rgb(201, 214, 242)"><use href="#i-cloud"/></svg>` (sem `bi-cloud`/`bi-sun`/`rotor`).

## Passos para Reproduzir
1. Iniciar frontend (`cd frontend && npm run dev`) e backend (`cd backend && npm run dev`).
2. Abrir `http://localhost:5173/` e buscar uma cidade com condição nublada, de chuva ou tempestade (ex.: "Curitiba" — code 3; "Jakarta" — code 55).
3. Observar o ícone grande do card de condições atuais durante alguns segundos.
4. Comparar com a busca de uma cidade com céu limpo (ex.: "Mumbai" — code 0), onde o sol gira.

## Resultado Esperado
O ícone grande é animado em todas as condições (conforme FR-21 e o padrão do protótipo): nuvem com flutuação (`floaty`), sol com raios girando (`spin`) — incluindo as variantes chuva e tempestade, que no protótipo seguem o mesmo padrão de movimento (a nuvem do `bi-cloud` flutua).

## Resultado Atual
Nas condições `cloud` (códigos 3, 45, 48, 71–77, 85, 86), `rain` (51–57, 61–67, 80–82, 95–99) e `storm`, o ícone grande permanece 100% estático — sem `spin` nem `floaty`.

## Evidência
`qa/qa-1/screenshots/req-31-tint-cloudy-curitiba.png` (condição Nublado, ícone estático)
`qa/qa-1/screenshots/req-31-tint-rain-jakarta.png` (condição Garoa intensa, ícone estático)

## Componente Afetado
`frontend/src/components/WeatherIconBig.jsx` (função de fallback que renderiza `<svg className="bi-big">` para `cloud`/`rain`/`storm`) e `frontend/src/index.css` (regra `.bi-big` sem animação). Correção provável: reaproveitar `bi-cloud`/`floaty` para essas variantes (ex.: wrapper `.big-icon` com animação `floaty` para cloud/rain/storm, mantendo as cores atuais), de modo a alinhar com o comportamento do protótipo.

## Resolução

**Correção aplicada:** a variante estática agora reaproita o keyframe `floaty` do protótipo.

- `frontend/src/components/WeatherIconBig.jsx`: o SVG de fallback de `cloud`/`rain`/`storm` passou a carregar a classe `bi-float` (`className="bi-big bi-float"`), mantendo a cor inline atual de cada condição (`BIG_COLOR`).
- `frontend/src/index.css`: adicionada a regra `.bi-float{animation:floaty 6s ease-in-out infinite}`, que reaproita o keyframe `floaty` já existente (o mesmo do `bi-cloud` do protótipo). O `prefers-reduced-motion:reduce` continua desativando todas as animações (incluando esta), conforme o resto da app.

Motivo: a classe `.bi-big` só define posição/tamanho/filtro — sem animação — e era usada nas variantes que o FR-21 exige animadas. Reaproveitar `floaty` alina `cloud`/`rain`/`storm` ao comportamento de flutuação do protótipo sem alterar as cores.

**Testes de regressão criados:** `frontend/src/__tests__/WeatherIconBig.test.jsx` (5 testes).
- Verifica que `cloud` (code 3), `rain` (code 63) e `storm` (code 95) renderizam o SVG com a classe `bi-float` — o caso do bug.
- Edge cases: `sun` (code 0) e `cloud-sun` (code 2) **não** recebem `bi-float` (o sol gira pelo `rotor`, não flutua).
- A suíte do frontend (183 testes) passa íntegra. A regressão falha quando a correção é revertida (verificado), confirmando que o teste realmente cobre o bug.

**Validação E2E (via Playwright):** frontend + backend iniciados em `:5173` e `:3000`; buscada a cidade "Curitiba" (`weather_code: 3`, Nublado). `getComputedStyle` do ícone grande retornou `animationName === "floaty"` (antes `"none"`), e a evidência visual ficou em `qa/qa-1/screenshots/fix-BUG-01-media-icone-estatico-curitiba.png`.
