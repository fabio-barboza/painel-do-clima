# Review: Task 15.0 - Orquestração do App.jsx (máquina de estados, data-tint, remontagem)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-28
**Arquivo da task**: 15_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Task 15 orquestrou todas as peças no `App.jsx`: a máquina de estados `useWeather` agora compõe por estado (`idle`→EmptyState, `loading`→Skeleton, `success`→4 blocos, `error`→ErrorState), a `SearchBar` ficou ligada (busca/locate/geoError/retry), o `data-tint` da raiz reflete a condição recebida e o gráfico remonta por `key` a cada consulta. O painel carregado ficou **funcional e visualmente completo** (validado por smoke check no browser com rede real: busca "Curitiba" → dados reais do backend, 4 blocos visíveis, `data-tint="cloudy"` para Nublado, delays de reveal exatos do protótipo).

Duas deficiências latentes de tasks anteriores **bloqueavam a própria entrega desta task** e foram corrigidas de forma mínima (detalhado em "Problemas"). Além disso, há uma falência pré-existente no teste de fundação (observação).

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/App.jsx` | ✅ OK | nenhum |
| `frontend/src/__tests__/App.test.jsx` | ✅ OK | nenhum |
| `frontend/src/hooks/useWeather.js` | ⚠️ Corrigido (task 8) | 1 — retry pós-erro de rede |
| `frontend/src/components/CurrentConditions.jsx` | ⚠️ Corrigido (task 10) | 1 — `.reveal` estranho (invisível) |
| `frontend/src/components/StatsGrid.jsx` | ⚠️ Corrigido (task 11) | 1 — `.reveal` estranho (invisível) |
| `frontend/src/components/WeeklyForecast.jsx` | ⚠️ Corrigido (task 13) | 1 — `.reveal` estranho (invisível) |
| `frontend/src/index.css` (foundation.test.js) | ⚠️ Observação (task 4) | falência pré-existente, não tocada |

## Problemas Encontrados

### 🔴 Problemas Críticos

**1. Seções de dados ficavam invisíveis (opacity 0) — `CurrentConditions`/`StatsGrid`/`WeeklyForecast` (tasks 10/11/13)**

- **Causa**: os três componentes carregavam uma classe `.reveal` (que define `opacity:0` sem `.in`) **sem observação própria** — ao contrário de `HourlyChart` (task 12), que se observa via `useReveal`. Ao compô-los dentro de um `Reveal` no `App`, o wrapper ficava visível (opacity 1) mas a seção filha mantinha `opacity:0`, deixando `current`, `chart` (exceto o próprio SVG auto-observado), `stats` e `weekly` **invisíveis** no estado de sucesso. Confirmado empiricamente via `getComputedStyle` no browser: antes da correção, `.card.current` e `.grid-stats` estavam com opacity 0 e sem `.in`.
- **Impacto**: o fluxo de sucesso principal (FR-33/FR-35) renderizava, mas o usuário veria só cabeçalho/busca/rodapé — os 4 blocos de dados ficavam ocultos.
- **Correção**: removida a classe `.reveal` das três seções, deixando-as no mesmo padrão dos componentes do cabeçalho/rodapé (revelados pelo `Reveal` da raiz, que carrega o `--d` correspondente). Sem alteração de layout, tipografia, cores ou comportamento. O `HourlyChart` foi mantido como está (já se observa sozinho).
- **Evidência**: após a correção, os 7 wrappers `Reveal` ficam com opacity 1 e `.in` nos delays `0s/.06s/.08s/.16s/.24s/.32s/.4s`; screenshot em `prds/prd-painel-do-clima/task-screenshots/task-15-loaded-curitiba.png`.

### 🟡 Problemas Maiores

**1. `retry` não re-tentava após erro de rede — `useWeather.js` (task 8)**

- **Causa**: `runFetch` armazenava a última consulta em `lastRef` **só no `.then` (sucesso)**. Em falha (rede/404/400), `lastRef` permanecia `null`, então `retry()` era noop — contrariando o próprio contrato da skill ("reexecuta a última consulta") e o FR-15 (retry funcional após falha de comunicação).
- **Correção**: mover o armazenamento de `lastRef` para o início do `runFetch` (condicional), de forma idempotente com os casos de geo/busca já existentes.
- **Evidência**: o teste de integração "network: retry refaz a consulta" passa (2ª chamada em `/api/weather?city=Curitiba`); os testes existentes de `useWeather` continuam verdes.

### 🟢 Problemas Menores

Nenhum.

## ✅ Destaques Positivos

- `App.jsx` com orquestração limpa: composição por estado, `data-tint` derivado de `weatherCodeInfo(...)`, `key` do gráfico basado na consulta, e `focusSearch` (foco + seleção) para "Nova busca".
- Dados 100 % do backend (FR-35): validado no browser — Umidade 90%, Vento 10 km/h ENE, UV, 7 dias, tudo via `GET /api/weather`.
- `data-tint` por grupo da condição (FR-31): `clear`/`cloudy`/`rain` — `cloudy` confirmado para Nublado.
- Testes reescritos cobrindo os 4 estados + geo + retry + remontagem + fumaça; todos verdes.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ (mínimo, idempotente, sem workarounds) |
| Convenções da linguagem do projeto | ✅ (ESM, camelCase, pt-BR) |
| Contratos de interface (APIs, mensagens) | ✅ (sem alteração de contrato) |
| Logging | ✅ (não aplicável) |
| Interface de usuário | ✅ (FR-33/FR-31/FR-35 validados no browser) |
| Testes | ✅ (8/8 no App, suíte frontend 173 passing) |

## Checagens Estáticas

Comando: `cd frontend && npm run lint` (ESLint 9 flat config)
Linha de base (antes da task): limpa (o `App.test.jsx` era um stub sem imports de teste)
Resultado final: **limpa** (0 erros, 0 warnings) — 2 erros de `no-unused-vars` (`flush`/`release`) do meu `App.test.jsx` foram corrigidos.
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): **`foundation.test.js` — "(a) bloco portado é byte-idêntico ao <style> dos painel.html"** falha. É propriedade de `frontend/src/index.css` vs `painel.html` (divergência já no bloco portado, byte ~14453); a task 15 **não modificou** `index.css` nem `painel.html`, logo é pré-existente (ligado à task 4/port CSS). Não bloqueia a task 15.

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: `react-testing` (padrões de teste React/Vitest, mocking de `fetch`, fronteira RTL vs E2E), `vite` (proxy dev/Portas). Consultadas na TechSpec: `nodejs-backend-patterns`, `vercel-react-best-practices`, `frontend-design`, `javascript-typescript-jest`, `vitest`, `vercel-composition-patterns`, `web-design-guidelines`, `webapp-testing`.
MCPs do projeto: **`playwright` (ui-testing)** usado no smoke check (navegação, `browser_type`, `browser_evaluate` para opacidade/classes, `browser_take_screenshot`); **`mcp-api-test`** não necessário (o backend já respondia via proxy Vite no mesmo fluxo; o endpoint foi validado indiretamente pelo dados reais exibidos). `context7` (documentation): não necessário.

## Recomendações

1. **(task 4, observação)** Investigar a divergência no port CSS (`index.css` vs `painel.html`) que faz o `foundation.test.js` falhar — mesmo sem impacto visual visível, indica drift no port verbatim.
2. **(task 8, já corrigido nesta task)** Considar explicitar no código/comentário da skill que `retry` deve re-executar a última consulta **independentemente do resultado** (contrato FR-15), para evitar regressão.
3. Manter o padrão de `Reveal`: componentes de dados devem ou se observar (como `HourlyChart`) ou depender do wrapper `Reveal` — nunca carregar `.reveal` sem observação.

## Veredito

**APROVADO COM OBSERVAÇÕES**. A orquestração do `App.jsx` está completa, testada (unidade + integração + fumaça, todos verdes) e lintada. Dois bugs latentes de tasks anteriores (visibilidade das seções de dados; retry após erro de rede) **impediam a entrega desta task** e foram corrigidos de forma mínima e idempotente, documentados acima. Uma observação pré-existente (falha do `foundation.test.js`, port CSS) fica registrada para as tasks 4/QA. O orquestrador tem a versão integral das correções no diff; nenhuma decisão de produto é necessária para prosseguir.
