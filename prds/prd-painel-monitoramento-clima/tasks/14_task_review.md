# Review: Task 14 - Infraestrutura E2E (mock server, global setup, primeira spec)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-18
**Arquivo da task**: 14_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Cria a infraestrutura de testes E2E em `e2e/` conforme a techspec (passo 9 do sequenciamento): package próprio com `@playwright/test` como única dependência, `playwright.config.js` (base URL `http://localhost:5173`, global setup/teardown, workers 1 / retries 0), servidor mock HTTP das APIs Open-Meteo (`/v1/search` e `/v1/forecast` com fixtures determinísticos espelhando a estrutura real do payload 200) e global setup que sobe, em ordem, mock (127.0.0.1:9100), backend E2E in-process na porta 3100 com `GEOCODING_BASE_URL`/`FORECAST_BASE_URL` apontando para o mock (decisão D9) e frontend Vite na porta 5173. A primeira spec (`initial-load.spec.js`) valida a carga de `/` com busca visível e sem dados. A execução é determinística (zero chamadas às APIs reais na spec, verificado via network requests do MCP browser). Nenhuma alteração em código do backend/frontend foi necessária — o backend é reutilizado através da fábrica `createApp()` (decisão D2) apenas com env. A suite E2E, a suite de backend (45 testes) e a de frontend (211 testes) passam inteiramente.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `e2e/package.json` | ✅ OK | 0 |
| `e2e/playwright.config.js` | ✅ OK | 0 |
| `e2e/setup/fixtures.js` | ✅ OK | 0 |
| `e2e/setup/mockServer.js` | ✅ OK | 0 |
| `e2e/setup/backend.js` | ✅ OK | 0 |
| `e2e/setup/frontend.js` | ⚠️ Problemas | 1 |
| `e2e/global-setup.js` | ✅ OK | 0 |
| `e2e/global-teardown.js` | ✅ OK | 0 |
| `e2e/tests/initial-load.spec.js` | ✅ OK | 0 |
| `.gitignore` (seção E2E) | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

1. **`e2e/setup/frontend.js` / ambiente — frontend reutilizado pode invalidar a determinismo das specs de busca das Tarefas 15.0/16.0.** O global setup reutiliza um dev server Vite já rodando em 5173 (regra "nunca matar serviço em execução"). O servidor existente foi iniciado com `VITE_API_URL=http://localhost:3000` embutida (verificado inspecionando o módulo transformado servido por 5173) — ou seja, uma busca feita a partir dele acionaria o backend dev em 3000, que aponta para as APIs reais da Open-Meteo. Para a Task 14 isso é irrelevante (a spec de carga inicial não dispara nenhum `fetch` — confirmado com zero requests `/api/weather` no network do browser). **Ação para as Tarefas 15.0/16.0:** as specs de busca determinística exigem que o frontend usado aponte para o backend E2E (3100); será necessário garantir que o frontend 5173 em uso seja o gerenciado pelo E2E (ex.: com `VITE_API_URL=http://127.0.0.1:3100`), encerrando/evitando o dev server legado durante a execução, ou documentar a exceção. Não bloqueia esta task.

### 🟢 Problemas Menores

1. **`e2e/setup/frontend.js` (killProcessGroup):** o teardown mata o grupo de processos via `process.kill(-pid, ...)` — portável apenas em Unix/Linux. Aceitável para o ambiente de desenvolvimento do projeto (Linux); em Windows seria necessário `taskkill /T`.
2. **Browsers instalados:** apenas o Chromium foi instalado (`npx playwright install chromium`), que é o único browser usado pela suite (projeto `chromium` no config). Firefox/WebKit exigiriam dependências de sistema não presentes nesta máquina e não são necessários para as specs planejadas.

## ✅ Destaques Positivos

- **Zero dependências extras no E2E:** o mock server usa apenas `node:http`; `@playwright/test` é a única devDependency de `e2e/`, conforme o requisito.
- **Reaproveitamento sem tocar no backend:** o backend E2E é o próprio app de produção via `createApp()` (D2), com as base URLs injetadas por env (D9) — nenhuma linha de código do backend foi alterada.
- **Teardown robusto e verificado:** `closeAllConnections()` + `close()` nos servidores in-process; SIGTERM → grace de 5 s → SIGKILL no grupo de processos do Vite; verificado com `ss` que não restam processos nas portas 3100/9100 após as execuções.
- **Determinismo comprovado:** fixtures com 24 hourly + 7 daily espelhando o payload real da Open-Meteo; geocoding de "São Paulo" (com `results`) e cidade inexistente (`results: []`); cadeia completa mock→backend→rota validada (200 São Paulo, 404 cidade inexistente, 200 lat/lon, `Cache-Control: no-store`, sem `ETag`).
- **Respeito ao ambiente:** o dev server existente em 5173 e o backend dev em 3000 não foram alterados nem encerrados (ambos continuaram respondendo 200 após as execuções); `--strictPort` impede deriva de porta quando o E2E precisa subir o próprio frontend; portas E2E (9100/3100) separadas das portas dev com erro claro em caso de conflito.
- **Diagnóstico amigável de falha:** erro de porta em uso, Vite que termina cedo (com stderr capturado) e timeout de readiness produzem mensagens acionáveis.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ (camelCase, funções com verbo, sem comentários — D13, sem blank lines em métodos, constantes nomeadas, máx. 2 níveis de aninhamento, ≤ 3 parâmetros) |
| Linguagem/Runtime | ✅ (CommonJS, Node 18+ com `fetch` global; campos snake_case do fixture apenas por espelho fiel do payload Open-Meteo) |
| REST/HTTP | ✅ (mock reflete o contrato real: 200 com `results: []` para cidade inexistente, `Cache-Control: no-store`) |
| Logging | ✅ (logs do setup em PT-BR no stdout; logs JSON do backend permanecem inalterados) |
| Framework UI | ✅ (não aplicável — infraestrutura de teste) |
| Testes | ✅ (spec criada e executada 2× verde; regressão backend 45/45 e frontend 211/211) |

## Recomendações

1. **(Tarefas 15.0/16.0 — prioridade alta)** Resolver o item MAIOR 1: garantir que o frontend consumido pelas specs de busca aponte para o backend E2E (3100), seja reutilizando apenas um 5173 gerenciado pelo E2E ou documentando/encerrando o dev server legado antes da execução.
2. **(Tarefas 15.0/16.0)** Estender o mock server com o modo de falha (500) necessário à spec "backend respondendo 500 + Tentar novamente" — o handler atual já isola a lógica de roteamento, tornando a extensão trivial.
3. **(Opcional)** Se o projeto adotar CI multi-OS no futuro, adaptar `killProcessGroup` para Windows.
4. **(Task 17.0)** O `.gitignore` atual cobre `e2e/node_modules` e `e2e/test-results`; avaliar incluir `e2e/playwright-report` se o HTML reporter for adotado.

## Veredito

**APROVADO COM OBSERVAÇÕES.** Todos os requisitos e critérios de sucesso da Task 14 estão atendidos: `cd e2e && npm test` sobe os três servidores na ordem especificada, executa a spec verde e derruba tudo sem processos órfãos; a execução é determinística; o `.gitignore` cobre as entradas exigidas; não houve regressão nas suítes de backend e frontend. Única ressalva relevante é o item MAIOR 1, que não afeta esta task (spec sem `fetch`) mas deve ser tratado na primeira spec de busca (Tarefa 15.0). Próximos passos: executar a Tarefa 15.0 já contemplando a recomendação 1.

**Evidências:**
- `prds/prd-painel-monitoramento-clima/task-screenshots/task-14-initial-load.png` — estado inicial de `/` (busca visível, sem dados) capturada via MCP browser.
- Execução da suite: `1 passed (913ms)` (duas execuções consecutivas verdes).
- Cadeia mock→backend validada: `SP 200 (hourly 24, daily 7)`, `XYZ 404 CITY_NOT_FOUND`, `lat/lon 200`, `Cache-Control: no-store`, `ETag` ausente.
