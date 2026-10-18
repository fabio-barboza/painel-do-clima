# Tarefa 16.0: E2E determinístico — geolocalização e erros + smoke real

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Completa a cobertura E2E: fluxos de **geolocalização** (permissão concedida e negada), o fluxo de **falha 500 com retry**, e o **smoke test real** contra a Open-Meteo de verdade (executável via `RUN_REAL_E2E=1` — decisão D10). Ao final, a métrica do PRD "fluxos principais funcionando ponta a ponta 100%" está coberta por E2E.

<requirements>
- Spec geolocalização concedida: `context.grantPermissions(['geolocation'])` + `context.setGeolocation(...)` → clicar no botão → painel exibe os dados da localização
- Spec geolocalização negada: permissão negada → mensagem amigável + busca manual por cidade continua funcional
- Spec falha 500: backend respondendo 500 (mock) → mensagem de erro + botão "Tentar novamente" reexecuta a busca
- **Smoke real** (gateado por `RUN_REAL_E2E=1`; sem o flag a spec é pulada): buscar uma cidade real (ex.: "Curitiba") → assert presença de condições atuais, gráfico e 7 cards — valida o caminho completo contra a API de verdade (objetivo do PRD: "Validação contra a fonte real")
- Specs determinísticas (geolocalização/500) sem dependência de APIs reais
</requirements>

## Subtarefas

- [x] 16.1 Spec: geolocalização concedida (grantPermissions + setGeolocation → dados da localização no painel)
- [x] 16.2 Spec: geolocalização negada (mensagem amigável + busca manual funcional)
- [x] 16.3 Spec: backend 500 (mock) → erro + "Tentar novamente" reexecuta a busca
- [x] 16.4 Spec: smoke real (gateado por `RUN_REAL_E2E=1`) — cidade real → condições atuais + gráfico + 7 cards

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): seção "Testes de E2E (Playwright)" → itens 4 (geolocalização: `context.grantPermissions` + `context.setGeolocation`), 5 (geolocalização negada), 6 (backend 500 + retry) e "Smoke real (API Open-Meteo de verdade, executável via `RUN_REAL_E2E=1`)". O mock server (Tarefa 14.0) deve suportar o cenário 500 (ex.: flag/route que faz o forecast responder erro).

## Critérios de Sucesso

- Geolocalização concedida: painel exibe dados da localização definida
- Geolocalização negada: mensagem amigável e busca manual continua funcionando
- 500: mensagem de erro + retry reexecuta a busca com sucesso
- Smoke real verde com `RUN_REAL_E2E=1` (APIs disponíveis) e pulada sem o flag
- Todas as specs determinísticas verdes em `cd e2e && npm test`

## Testes da Tarefa

- [x] Testes E2E: `e2e/tests/geo-granted.spec.js` — geolocalização concedida → dados da localização
- [x] Testes E2E: `e2e/tests/geo-denied.spec.js` — geolocalização negada → mensagem amigável + busca manual
- [x] Testes E2E: `e2e/tests/retry-500.spec.js` — 500 (mock) → erro + "Tentar novamente" reexecuta
- [x] Testes E2E: `e2e/tests/real-smoke.spec.js` — smoke real gateado por `RUN_REAL_E2E=1`

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `e2e/tests/geo-granted.spec.js` (novo)
- `e2e/tests/geo-denied.spec.js` (novo)
- `e2e/tests/retry-500.spec.js` (novo)
- `e2e/tests/real-smoke.spec.js` (novo)
- `e2e/setup/` (modificar — suportar cenário 500 no mock)
