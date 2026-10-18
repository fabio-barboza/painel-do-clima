# Tarefa 14.0: Infraestrutura E2E (mock server, global setup, primeira spec)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Cria a infraestrutura de testes E2E com Playwright em `e2e/` (passo 9 do sequenciamento da techspec): package próprio, configuração, **servidor HTTP mock das APIs externas** e global setup que sobe os três servidores (mock + backend apontando para o mock + frontend). É a base para as suítes determinísticas (Tarefas 15.0 e 16.0).

<requirements>
- `e2e/package.json` com `@playwright/test` como devDependency (única dependência do E2E)
- `playwright.config.js`: base URL `http://localhost:5173`, global setup/teardown, workers/retries sensatos
- **Servidor mock das APIs externas** (`e2e/setup/`): endpoints de geocoding (`/v1/search`) e forecast (`/v1/forecast`) servindo fixtures determinísticos — geocoding de "São Paulo" (com `results`) e de cidade inexistente (`results: []`); forecast fixo (24 hourly + 7 daily)
- **Global setup** que sobe, nesta ordem: (1) mock server, (2) backend com `GEOCODING_BASE_URL`/`FORECAST_BASE_URL` apontando para o mock (decisão D9), (3) frontend (Vite dev/preview); e derruba tudo no teardown
- Primeira spec determinística: carregar `/` → estado inicial com busca visível e sem dados
- Instalar os browsers do Playwright
- `.gitignore` da raiz: incluir `e2e/node_modules` e `e2e/test-results`
</requirements>

## Subtarefas

- [x] 14.1 Criar `e2e/package.json` + instalar `@playwright/test` e os browsers
- [x] 14.2 Criar `playwright.config.js` (base URL 5173, global setup/teardown)
- [x] 14.3 Implementar o servidor mock das APIs externas (geocoding + forecast com fixtures)
- [x] 14.4 Implementar o global setup (mock + backend com base URLs do mock + frontend) e teardown
- [x] 14.5 Criar a primeira spec: carga inicial de `/` (busca visível, sem dados)
- [x] 14.6 Atualizar `.gitignore` da raiz (`e2e/node_modules`, `e2e/test-results`)

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): seção "Testes de E2E (Playwright)" → "Setup (`e2e/`)" (configuração, mock server, global setup) e "Considerações Técnicas" (decisão D9 — base URLs externas configuráveis por env; D10 — E2E com mocks determinísticos + smoke real). O fixture de forecast deve espelhar a estrutura real da Open-Meteo (ver "Modelos de Dados" — payload 200).

## Critérios de Sucesso

- `cd e2e && npm test` sobe os 3 servidores, executa a spec e derruba tudo (sem processos órfãos)
- Spec de carga inicial verde: `/` renderiza o painel inicial com busca visível e sem dados
- A execução é **determinística** (nenhuma chamada às APIs reais nesta spec)
- `.gitignore` cobre `e2e/node_modules` e `e2e/test-results`
- Suítes de unidade/integração de backend e frontend continuam verdes (nenhuma regressão)

## Testes da Tarefa

- [x] Testes E2E: `e2e/tests/initial-load.spec.js` — carregar `/` → estado inicial com busca visível e sem dados

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `e2e/package.json` (novo)
- `e2e/playwright.config.js` (novo)
- `e2e/setup/` (novo — servidor mock das APIs externas)
- `e2e/global-setup.js` (novo)
- `e2e/tests/initial-load.spec.js` (novo)
- `.gitignore` (modificar)
