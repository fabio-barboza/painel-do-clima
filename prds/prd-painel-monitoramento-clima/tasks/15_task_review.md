# Review: Task 15 - E2E determinístico — busca por cidade

**Revisor**: AI Code Reviewer
**Data**: 2026-10-18
**Arquivo da task**: 15_task.md
**Status**: APROVADO

## Resumo

Implementa as 3 specs E2E determinísticas de busca por cidade conforme a techspec (seção "Testes de E2E (Playwright)" → "Suite determinística", itens 2, 3 e 7), reaproveitando a infraestrutura da Tarefa 14.0 (mock server 9100 + backend E2E 3100 + frontend). As specs validam: (1) busca "São Paulo" (mock) → condições atuais (com barra UV) + gráfico 24h (24 pontos) + 7 cards semanais + tema `data-theme="clear"` na raiz; (2) cidade inexistente (mock `results: []`) → mensagem amigável "Cidade não encontrada" com o campo de busca ainda habilitado; (3) as respostas de `/api/weather` observadas pela página levam `Cache-Control: no-store` e **não** levam `ETag` (métrica de "zero cache HTTP" do PRD). A execução é 100% determinística — nenhuma chamada às APIs reais da Open-Meteo (tudo via `127.0.0.1:9100`). Nenhuma linha de código de backend/frontend foi alterada; o trabalho se limita a 3 arquivos novos de spec e a uma entrada em `.gitignore`. Evidência adicional capturada via MCP browser (screenshots + headers de rede reais da página). E2E 4/4, backend 45/45 e frontend 211/211 verdes (sem regressão).

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `e2e/tests/search-success.spec.js` | ✅ OK | 0 |
| `e2e/tests/search-not-found.spec.js` | ✅ OK | 0 |
| `e2e/tests/no-cache-headers.spec.js` | ✅ OK | 0 |
| `.gitignore` (entrada `.do-tmp/`) | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. **Determinismo depende do frontend E2E apontar para o mock (nota operacional).** O `global-setup` reutiliza um frontend já saudável em 5173 (`startFrontend` em `e2e/setup/frontend.js`). Havia um dev server legado em 5173 com `VITE_API_URL=http://localhost:3000` embutida (backend real → Open-Meteo real); se reutilizado, as specs de busca dariam **não determinísticas** (tema/temperatura dependentes do tempo real e chamadas à API real). **Mitigado nesta execução**: encerrei o dev server legado antes de rodar (e o E2E subiu o próprio 5173 → `127.0.0.1:3100`), e **restaurado** ao final (`cd frontend && npm run dev`, de volta a `VITE_API_URL=http://localhost:3000`). As specs em si estão corretas; o ponto é operacional. **Recomendação para a Tarefa 16.0 (e evolução):** endurecer o `startFrontend` para não reutilizar um 5173 cujo `VITE_API_URL` não aponte para a porta E2E do backend (ou forçar subida própria com `--strictPort`), de modo que o determinismo não dependa de o operador parar manualmente o dev server. Não bloqueia esta task.
2. **Assertões de valor exato acopladas ao fixture.** `search-success.spec.js` valida `18,3 °C`, `24` linhas e `7` cards a partir do fixture fixo. É o comportamento desejado para uma spec determinística (prova que o dado correto fluiu ponta a ponta), mas o acoplamento é intencional: qualquer ajuste do fixture da Tarefa 14 exigiria revisar estes valores. Documentado apenas para aviso futuro.

## ✅ Destaques Positivos

- **Determinismo comprovado, não apenas presumido:** os logs da execução mostram todas as chamadas externas indo para `http://127.0.0.1:9100/v1/search` e `/v1/forecast` (o mock) — zero chamadas à Open-Meteo real. O backend E2E (3100) responde 200 para "São Paulo" e 404 `CITY_NOT_FOUND` para cidade inexistente, exatamente o fluxo esperado.
- **Headers no-cache validados nas respostas reais da página:** a spec 15.3 captura via `page.on('response')` e a inspeção de rede do MCP browser confirmou `cache-control: no-store` e a **ausência de `etag`** na resposta real de `/api/weather` (com CORS presente). Cobre a métrica de "zero cache HTTP" do PRD de ponta a ponta.
- **Locators semânticos e acessíveis:** uso consistente de `getByRole`/`getByLabel`/`getByLabel('Cidade')`, alinhado à estrutura semântica implementada nas Tarefas 7.0–12.0 e aos requisitos de acessibilidade (WCAG) — não depende de classes CSS frágeis para os elementos interativos.
- **Consistência com a convenção E2E existente:** descreve as specs em PT-BR, usa `test` plano (como `initial-load.spec.js`), agrupa as assertões por bloco de UI e usa contagens literais (`24`, `7`) como as tests do projeto (`WeeklyForecast.test.jsx` usa `toHaveLength(7)`). Sem comentários (D13).
- **Higiene de ambiente:** ao final, o ambiente dev foi devolvido ao estado original (5173 → 3000 + 3000 no ar) e nenhuma porta E2E (9100/3100) ou processo órfão permaneceu.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ (camelCase; sem comentários — D13; funções/callbacks lineares com ≤ 1 nível de aninhamento; nomes curtos; assertões de contagem literais coerentes com as tests do projeto; agrupamento por blocos consistente com a spec E2E existente) |
| Linguagem/Runtime | ✅ (Node + Playwright, `require` CommonJS, `@playwright/test` — única dependência do E2E, inalterada) |
| REST/HTTP | ✅ (valida o contrato no-cache nas respostas reais: `Cache-Control: no-store` + ausência de `ETag`; CORS observado presente) |
| Logging | ✅ (não aplicável — as specs não emitem logs; logs JSON do backend permanecem inalterados) |
| Framework UI | ✅ (locators acessíveis/semânticos; sem acoplamento a classes CSS nos interativos) |
| Testes | ✅ (E2E 4/4 verdes em `cd e2e && npm test`; regressão backend 45/45 e frontend 211/211 — nenhuma quebra) |

## Recomendações

1. **(Tarefa 16.0 — prioridade alta)** Endurecer `e2e/setup/frontend.js` para garantir determinismo sem dependência manual: ao detectar um 5173 em execução, conferir que seu `VITE_API_URL` aponte para a porta do backend E2E (3100); caso contrário, não reutilizar (forçar subida própria). Isso elimina a necessidade de encerrar o dev server legado a cada rodada E2E.
2. **(Opcional — Tarefa 16.0)** Manter a convenção de extrair os valores do fixture (ex.: `HOURLY_POINTS = 24`, `WEEK_DAYS = 7`, temperatura atual) para constantes no fixture, de modo que specs de busca e geolocalização se auto-alinhem a mudanças do fixture.
3. **(Tarefa 17.0)** O `.gitignore` já cobre `e2e/node_modules`, `e2e/test-results` e `.do-tmp/`. Avaliar incluir `e2e/playwright-report` caso o HTML reporter seja adotado.

## Veredito

**APROVADO.** Todos os requisitos e critérios de sucesso da Tarefa 15.0 estão atendidos: as 3 specs estão verdes em `cd e2e && npm test`; o fluxo de sucesso exibe os 3 blocos (atual, 24h, semana) e o tema `clear` na raiz; o fluxo de "não encontrada" mostra a mensagem amigável e mantém a busca habilitada; os headers no-cache (`Cache-Control: no-store`, sem `ETag`) são assertados nas respostas reais da página; e a execução é totalmente determinística (zero chamadas às APIs reais). Não há problemas críticos ou maiores. Os únicos pontos são observações menores/operacionais (determinismo dependente do frontend E2E e acoplamento intencional ao fixture), ambos documentados e com recomendação para a Tarefa 16.0. Nenhuma regressão nas suítes de backend e frontend.

**Evidências:**
- `prds/prd-painel-monitoramento-clima/task-screenshots/task-15-search-success.png` — busca "São Paulo" (mock): condições atuais (18,3 °C, barra UV), gráfico 24h e 7 cards, com tema `clear` na raiz (via MCP browser).
- `prds/prd-painel-monitoramento-clima/task-screenshots/task-15-search-not-found.png` — cidade inexistente (mock `results: []`): alerta "Cidade não encontrada" com campo de busca ainda habilitado (via MCP browser).
- Headers de rede reais da página (via MCP browser `browser_network_request`): `cache-control: no-store`, sem `etag`, CORS presente, em `http://127.0.0.1:3100/api/weather?city=São Paulo`.
- Execução da suite: `4 passed (3.2s)` — E2E 4/4 (2 execuções limpas consecutivas); regressão backend 45/45 e frontend 211/211.
- Determinismo: logs da execução mostram exclusivamente chamadas a `http://127.0.0.1:9100` (mock); 200 "São Paulo", 404 cidade inexistente.
