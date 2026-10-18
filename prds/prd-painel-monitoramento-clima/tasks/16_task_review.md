# Review: Task 16 - E2E determinístico — geolocalização e erros + smoke real

**Revisor**: AI Code Reviewer
**Data**: 2026-10-18
**Arquivo da task**: 16_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Foram criadas as 4 specs E2E pendentes (`geo-granted`, `geo-denied`, `retry-500`, `real-smoke`) e o mock server (Tarefa 14.0) ganhou suporte ao cenário 500 via endpoint de controle `POST /__control/forecast` (flag transiente: `{"status":500}` para falhar o forecast e `{"status":200}`/corpo vazio para normalizar). O setup E2E recebeu dois ajustes de infraestrutura: (1) modo real (`RUN_REAL_E2E=1`) — global setup não sobe o mock e o backend usa as base URLs reais da Open-Meteo, com `testIgnore` no config excluindo as specs dependentes de mock; (2) porta do frontend E2E parametrizável (`E2E_FRONTEND_PORT`, default 5173) com verificação de compatibilidade do frontend reutilizado (o módulo servido deve apontar para o backend E2E) — sem essa verificação, um dev frontend do usuário rodando na porta 5173 (apontando para o backend real em 3000) seria reutilizado silenciosamente e a suite "determinística" rodaria contra APIs reais. Nenhum código de `frontend/` ou `backend/` foi alterado.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| e2e/tests/geo-granted.spec.js | ✅ OK | 0 |
| e2e/tests/geo-denied.spec.js | ✅ OK | 0 |
| e2e/tests/retry-500.spec.js | ✅ OK | 0 |
| e2e/tests/real-smoke.spec.js | ✅ OK | 0 |
| e2e/setup/mockServer.js | ✅ OK | 0 |
| e2e/setup/backend.js | ✅ OK | 0 |
| e2e/setup/frontend.js | ⚠️ Observação | 1 (menor) |
| e2e/global-setup.js | ✅ OK | 0 |
| e2e/playwright.config.js | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. **`e2e/setup/frontend.js` — `isFrontendCompatible` acopla a um caminho de módulo interno** (linhas ~39-52): a verificação de compatibilidade faz `GET /src/services/weatherApi.js` e procura a URL do backend E2E no código transformado. Se o arquivo `weatherApi.js` for movido/renomeado em tasks futuras, a verificação falha e o setup lança erro (comportamento falha-claro, não silencioso), mas o caminho precisará ser atualizado junto. Correção sugerida (opcional): derivar o caminho de um contrato estável (ex.: sondar `index.html` + um marker dedicado) quando houver mudança de estrutura.
2. **`e2e/tests/real-smoke.spec.js` — acoplamento leve ao nome de exibição real**: em modo real, `initial-load.spec.js` e `no-cache-headers.spec.js` também rodam (não dependem de dados de mock); o `no-cache-headers` busca "São Paulo" na API real e asserciona o heading "São Paulo". Se o geocoding real voltar um nome diferente para o prefixo, a spec de real-mode quebra. Aceitável (é o comportamento esperado de smoke real) e as specs determinísticas continuam independentes.

## ✅ Destaques Positivos

- **Cenário 500 com flag transiente**: o controle via `POST /__control/forecast` permite ao spec abrir a janela de falha, observar o erro e normalizar o mock antes do retry — o "Tentar novamente" é validado de ponta a ponta (2 requests de `/api/weather` contados via `page.on('request')`, com reset em `finally` para não vazar estado entre specs).
- **Verificação de compatibilidade do frontend reutilizado**: evita o modo de falha mais perigoso dessa suite (silenciosamente não-determinístico) com mensagem de erro acionável (instrui a definir `E2E_FRONTEND_PORT`). Em modo real a checagem é dispensada de propósito (qualquer frontend que chegue a uma API real é válido para o smoke).
- **Separação mock/real bem definida**: `test.skip` no corpo da `real-smoke` (skip visível no relatório no modo default) + `testIgnore` no config no modo real (specs dependentes de fixture não aparecem nem rodam).
- **Locators acessibilidade-first** consistentes com as specs 14/15 (`getByRole`/`getByLabel`, `role="alert"`), e asserções de contrato (URL `?lat=&lon=` na geolocalização, contagem de 24 linhas da tabela visualmente oculta do gráfico, 7 cards).
- **Smoke real valida o caminho completo**: frontend → backend (3100 ou 3000 do dev) → Open-Meteo real, sem chamadas diretas do frontend (confirmado via inspeção de rede no browser: apenas `GET http://localhost:3000/api/weather?city=Curitiba`).

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ (camelCase, constantes nomeadas p/ portas/timeouts, sem magic numbers, funções < 50 linhas, sem flags booleanas, sem comentários no código novo — D13) |
| Linguagem/Runtime | ✅ (CommonJS em `e2e/`, consistente com backend; specs sem dependências novas além de `@playwright/test` já instalada) |
| REST/HTTP | ✅ (endpoint de controle com método adequado POST, payload JSON, 400 para corpo inválido) |
| Logging | ✅ (sem novos logs de negócio; estado do mock auditável na resposta do controle) |
| Framework UI | ✅ (nenhuma alteração em `frontend/`) |
| Testes | ✅ (todas as specs criadas executadas e passando; suite completa verde) |

## Evidências

- **Suite determinística (mock)**: `E2E_FRONTEND_PORT=5174 npm test` → **7 passed, 1 skipped** (real-smoke), 2 execuções verdes (antes e depois do ajuste de review).
- **Smoke real**: `RUN_REAL_E2E=1 npm test` → **3 passed** (initial-load, no-cache-headers, real-smoke "Curitiba" contra Open-Meteo real).
- **Suites de unidade/integração**: backend Jest **45/45 passed**; frontend Vitest **211/211 passed**.
- **Validação interativa via MCP Playwright** (browser real, screenshots em `../task-screenshots/`):
  - `task-16-geo-granted.png` — geolocalização concedida (lat/lon via `context.grantPermissions` + `context.setGeolocation`) → painel "Sua localização" com dados.
  - `task-16-geo-denied.png` / `task-16-geo-denied-manual-search.png` — permissão removida → "Localização indisponível" + busca manual "São Paulo" concluída.
  - `task-16-error-500.png` — mock em 500 → "Falha de comunicação" + botão "Tentar novamente".
  - `task-16-retry-success.png` — retry após normalizar o mock → painel de sucesso.
  - `task-16-real-smoke-curitiba.png` — busca "Curitiba" via backend real (Open-Meteo) no dev stack rodando.
- **Observação de ambiente (não bloqueante)**: o console do browser exibia erros antigos de HMR do dev server do usuário em 5173 (ex.: `ReferenceError: maxWeeklyPrecipitation`) capturados da sessão anterior de outra task. Não reproduzível no código atual — 211 testes de unidade do frontend (incluindo 15 de `WeeklyForecast`) e as 8 specs E2E passam no código em disco; os erros são resíduos de hot-reload de edições feitas com o Vite em execução.

## Recomendações

1. (Baixa) Quando `frontend/src/services/weatherApi.js` mudar de caminho, atualizar `isFrontendCompatible` (frontend.js) — considerar um marker estável no HTML servido para acoplar menos à estrutura interna.
2. (Baixa) Documentar no README (Tarefa 17.0): uso de `RUN_REAL_E2E=1`, `E2E_FRONTEND_PORT` e o endpoint de controle do mock (útil para o QA rodar o cenário 500 manualmente).
3. (Informativa) Se o dev frontend do usuário estiver ocupando a porta 5173 apontando para outro backend, a suite determinística exige `E2E_FRONTEND_PORT=<outra porta>` (o setup falha com instrução clara nesse caso — comportamento intencional).

## Veredito

**APROVADO COM OBSERVAÇÕES.** Todos os requisitos da task estão implementados, testados e verdes em ambos os modos (determinístico e real), com evidência via suite Playwright e validação interativa de browser. Nenhuma regressão em backend/frontend (suites completas passando). Os dois pontos menores são observações de acoplamento aceitas, sem risco funcional. Task 16.0 concluída.
