# Review: Task 2.0 - Serviço Open-Meteo (geocoding + forecast com timeout)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-17
**Arquivo da task**: 2_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Implementado `backend/src/services/openMeteo.js`, o único ponto de contato do backend com as APIs externas da Open-Meteo: `geocodeCity(name)` (nome → `Location` via `results[0]`, `CityNotFoundError` quando vazio) e `getForecast(lat, lon)` (payload bruto com as variáveis `current`/`hourly`/`daily`, `timezone=auto`, `forecast_hours=24`, `forecast_days=7` e unidades métricas), ambos com timeout via `AbortController` (10 s por padrão, configurável via `EXTERNAL_TIMEOUT_MS` do `getEnv()`), base URLs configuráveis (D9) e log estruturado JSON de cada chamada externa (alvo, status, duração, erro). Suíte de testes `openMeteo.service.test.js` com 12 testes cobrindo todos os cenários exigidos pela task, incluindo timeout com fetch mock que não responde. Suíte Jest completa: **31/31 testes passando**, cobertura de `openMeteo.js` em **100%** (statements, branches, functions, lines). As suposições da techspec foram validadas contra a fonte real via curl (subtarefa 2.7): geocoding com `language=pt` casa por prefixo e insensível a acentos/case para cidades brasileiras ("Sao Paulo" → São Paulo; "Curit" → Curitiba), e `uv_index` está disponível em `hourly` com 24 valores a partir da hora atual — premissa D8 confirmada, sem necessidade de fallback.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `backend/src/services/openMeteo.js` (novo) | ✅ OK | 0 |
| `backend/src/__tests__/openMeteo.service.test.js` (novo) | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. **Gap de E2E via MCP (documentado, não bloqueante)** — o mapa de capacidades disponíveis possui apenas `browser-testing` (playwright) e `documentation` (context7). Pelo guard de capacidade, backend + apenas `browser-testing` → E2E de API via MCP não executado; a validação do serviço é por testes de unidade (fetch mockado) + curl contra a API real. O E2E determinístico completo é entregue na Task 14.0 (Playwright com base URLs mockadas).
2. **Corpo da resposta de erro externo não incluído no log `warn`** (`openMeteo.js`, caminho de não-2xx) — a techspec exige apenas alvo/status/duração/erro no log, e isso está atendido; o `{error, reason}` retornado pela Open-Meteo em 400 poderia enriquecer o log para diagnóstico futuro. Melhoria opcional, sem impacto no contrato.

## ✅ Destaques Positivos

- Cobertura de 100% (statements/branches/functions/lines) no novo serviço, incluindo ramos defensivos (chave `results` ausente, nível de log em `NODE_ENV=production`).
- Timeout via `AbortController` com duração lida de `getEnv()` (D4/D9) — testável sem fake timers (teste usa `EXTERNAL_TIMEOUT_MS=50` e um fetch mock que rejeita no abort, validando também o `signal` passado ao fetch).
- Log estruturado JSON no stdout, consistente com o request logger da Task 1.0 (`level`, `target`, `status`, `durationMs`, `error`) — `debug`/`info` por ambiente, `warn` em não-2xx, `error` em timeout/falha de rede, exatamente como a seção "Monitoramento e Observabilidade" da techspec.
- URL do geocoding montada exatamente conforme o contrato (`name` com `encodeURIComponent`, `count=1`, `language=pt`) e validada em teste por string completa; URL do forecast validada parâmetro a parâmetro via `URLSearchParams`.
- Resposta do forecast repassada sem remodelagem (retorna o objeto bruto do `response.json()`), conforme PRD ("Formato de dados").
- Sem comentários no código novo (D13); CommonJS conforme convenção do backend; nomes em camelCase; funções com ≤3 parâmetros (objeto no logger); métodos ≤50 linhas.
- Validação real (subtarefa 2.7) executada e documentada com evidência: prefix matching, insensibilidade a acentos/case e `uv_index` em `hourly` confirmados na Open-Meteo.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Linguagem/Runtime | ✅ (Node 18+ / fetch nativo, CommonJS, zero novas dependências — D4) |
| REST/HTTP | ✅ (GET único, sem cache, erros propagados como `Error` para virar 500 na rota) |
| Logging | ✅ (JSON estruturado, níveis conforme techspec) |
| Framework UI | N/A |
| Testes | ✅ (12 testes novos; 31/31 da suíte backend passando) |

## Recomendações

1. (Opcional) Incluir o corpo da resposta não-2xx (ex.: `reason`) no log `warn` para facilitar diagnóstico de parâmetros inválidos na Open-Meteo.
2. (Informação) O E2E determinístico deste serviço será coberto pela Task 14.0 (Playwright + mock server apontando `GEOCODING_BASE_URL`/`FORECAST_BASE_URL`), que aproveita a configurabilidade por env já entregue.

## Veredito

**APROVADO COM OBSERVAÇÕES.** Todos os requisitos da task foram implementados e testados: `CityNotFoundError` exportada, `geocodeCity` e `getForecast` com contratos exatos da techspec, timeout de 10 s via `AbortController`, base URLs do `getEnv()`, log estruturado por chamada, suíte verde (31/31, cobertura 100% no novo arquivo) e suposições validadas contra a API real. As únicas observações são o gap de E2E via MCP (esperado pelo guard de capacidade; E2E vem na Task 14.0) e uma sugestão opcional de enriquecer o log de erro externo. Nenhum bloqueio para a próxima task (3.0 — Rota `/api/weather`).

### Evidência da validação real (subtarefa 2.7, via curl)

- `GET https://geocoding-api.open-meteo.com/v1/search?name=Sao%20Paulo&count=1&language=pt` → 200, `results[0].name = "São Paulo"`, `latitude=-23.5475`, `longitude=-46.63611`, `country="Brasil"` (case/acentos insensíveis).
- `GET https://geocoding-api.open-meteo.com/v1/search?name=Curit&count=1&language=pt` → 200, `results[0].name = "Curitiba"` (matching por prefixo com 3+ caracteres confirmado).
- `GET https://api.open-meteo.com/v1/forecast?latitude=-25.43&longitude=-49.27&hourly=uv_index,temperature_2m,precipitation&forecast_hours=24&timezone=auto` → 200, `hourly.uv_index` presente com 24 valores a partir da hora atual (ex.: `0.00 … 8.85 … 0.00`) — premissa D8 confirmada, fallback `daily.uv_index_max` não necessário.
