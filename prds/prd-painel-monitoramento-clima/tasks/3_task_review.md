# Review: Task 3 - Rota `/api/weather` (city e lat/lon) + testes de integração

**Revisor**: AI Code Reviewer
**Data**: 2026-10-17
**Arquivo da task**: 3_task.md
**Status**: APROVADO

## Resumo

Foi implementada a rota `GET /api/weather` (`backend/src/routes/weather.js`), o endpoint principal do produto (FR-2/FR-3 do PRD). A rota suporta os dois fluxos — `?city=<nome>` (cadeia `geocodeCity` → `getForecast`) e `?lat=&lon=` (forecast direto, sem geocoding, decisão D3) — com validação de parâmetros (exclusão mútua, domínio de coordenadas), mapeamento de erros (400 `VALIDATION` / 404 `CITY_NOT_FOUND` / 500 `INTERNAL`) e payloads JSON. A rota foi registrada na fábrica `app.js`, foram criados fixtures fixos e duas suítes de teste (unidade com serviço mockado + integração com apenas `global.fetch` mockado). O backend foi validado por curl contra as APIs reais da Open-Meteo (exigência "validação contra a fonte real" do PRD). Suíte completa: **45/45 testes passando, 6 suítes verdes**, cobertura ~99%.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `backend/src/routes/weather.js` (novo) | ✅ OK | 0 (1 maior detectado e corrigido no review) |
| `backend/src/app.js` (modificado) | ✅ OK | 0 |
| `backend/src/__tests__/fixtures/geocoding-sao-paulo.js` (novo) | ✅ OK | 0 |
| `backend/src/__tests__/fixtures/forecast.js` (novo) | ✅ OK | 0 |
| `backend/src/__tests__/weather.route.test.js` (novo) | ✅ OK | 0 |
| `backend/src/__tests__/weather.integration.test.js` (novo) | ✅ OK | 0 |
| `.gitignore` (modificado) | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

1. **[CORRIGIDO]** `backend/src/routes/weather.js` — números mágicos `90` e `180` na validação do domínio das coordenadas, em violação ao padrão "No magic numbers — use named constants". **Correção aplicada no review:** extração das constantes nomeadas `MAX_LATITUDE = 90` e `MAX_LONGITUDE = 180` no topo do módulo, usadas na condição. Suíte reexecutada após a correção (45/45 passando).

### 🟢 Problemas Menores

Nenhum problema menor encontrado.

## ✅ Destaques Positivos

- **Separação de responsabilidades clara:** validação → orquestração dos fluxos (`respondByCity` / `respondByCoords`) → mapeamento de erros, com retornos antecipados (early returns) e condicionais planas (≤ 2 níveis de aninhamento).
- **Cobertura de testes completa e bem distribuída:** suíte de unidade isola a rota com o serviço mockado (todos os status + payload + chamadas esperadas); suíte de integração roda o app completo mockando apenas `global.fetch` e **prova que a URL do forecast usa as coordenadas do geocoding** (critério de sucesso explícito).
- **Validação real via curl (milestone do PRD):** `curl "http://localhost:3000/api/weather?city=Campinas"` retornou `200` com payload `{ location, forecast }` completo (current + 24 hourly com `uv_index` + 7 daily), além de `lat/lon`, 404 (cidade inexistente) e os três cenários de 400 confirmados contra as APIs reais.
- **Contrato de cabeçalhos cumprido:** todas as respostas (200 e erros) com `Cache-Control: no-store`, ausência de `ETag` e headers CORS — verificado tanto nos testes quanto no curl.
- **Conformidade com convenções:** backend em CommonJS, sem comentários no código novo (D13), fixtures determinísticos e sem aleatoriedade.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ (números mágicos corrigidos; nomenclatura, verbos, ≤3 parâmetros, early returns respeitados) |
| Linguagem/Runtime | ✅ (Node 18+, `fetch` nativo, CommonJS) |
| REST/HTTP | ✅ (status 200/400/404/500 + payloads JSON `{ error, message }`; no-cache e CORS) |
| Logging | ✅ (erro interno logado via `console.error` estruturado; chamadas externas já logadas no serviço) |
| Framework UI | N/A (backend) |
| Testes | ✅ (unidade + integração, 45/45 verdes, cobertura ~99%) |

## Recomendações

1. (Opcional, fora do escopo da task) A validação atual rejeita `city`/coordenadas combinadas com mensagem genérica; uma mensagem que indique explicitamente quais parâmetros conflitam poderia melhorar a legibilidade para o frontend.
2. (Opcional) Considerar um teste dedicado de timeout externo (fetch que não responde) cobrindo o caminho 500 por `AbortController` — este cenário já é coberto a nível de serviço (Tarefa 2.0), mas não explicitamente na rota.

## Veredito

**APROVADO.** A task atende integralmente os requisitos e critérios de sucesso: os dois fluxos (`city` e `lat/lon`), as três regras de validação (400), o 404 (`CITY_NOT_FOUND`) e o 500 (`INTERNAL`) estão implementados, registrados no `app.js`, cobertos por testes de unidade e integração, e validados por curl contra as APIs reais da Open-Meteo. O único problema maior identificado (números mágicos) foi corrigido no próprio ciclo de review, e a suíte completa permanece verde. Nenhuma ação bloqueante pendente.
