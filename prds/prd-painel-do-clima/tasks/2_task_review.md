# Review: Task 2.0 - Clientes de serviços externos: geocoding, forecast (+sliceHourly24) e reverse geocoding

**Revisor**: AI Code Reviewer
**Data**: 2026-10-27
**Arquivo da task**: 2_task.md
**Status**: APROVADO

## Resumo

Implementados os três clientes de APIs externas (CommonJS, assinaturas JSDoc, zero dependências — `fetch` global + `AbortSignal.timeout(8000)`): `geocodeCity` (Open-Meteo), `fetchForecast` (Open-Meteo) e `reverseGeocode` (BigDataCloud, best-effort). Todos usam `config.js` (task 1) para URLs e timeout, e reutilizam a classe `ExternalError` já existente. A função pura `sliceHourly24` implementa a janela rolante de 24 h por comparação de prefixo de hora, com wrap (módulo) quando a janela cruza o fim do dia. Testes de unidade e integração cobrem todos os subprodutos: 19 testes passando, e a suíte completa do backend (35 testes, 4 suites) verde. Conformidade total com a TechSpec (parâmetros exatos, `timezone=auto`, `wind_speed_unit=kmh`, `forecast_days=7`, `localityLanguage=pt`, fallback `city`, `principalSubdivision`).

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `backend/src/services/geocoding.js` | ✅ OK | 0 |
| `backend/src/services/forecast.js` | ✅ OK | 0 |
| `backend/src/services/reverseGeocoding.js` | ✅ OK | 0 |
| `backend/src/__tests__/services.test.js` | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

Nenhum problema menor encontrado.

## ✅ Destaques Positivos

- `sliceHourly24` lida defensivamente com `hourly` vazio (não quebra sem divisão por zero) e aplica wrap por módulo, cobriendo corretamente os casos 00 h, 12 h e 23 h (incluindo janela que cruza o fim do dia) — testados explicitamente.
- `reverseGeocode` é genuinamente best-effort: cada ponto de falha (timeout, não-2xx, corpo inválido, campo ausente) é capturado e logado com `WARN`, jamais derrubando a consulta.
- Parâmetros da URL do forecast verificados via `searchParams` decodificado no teste, garantindo o contrato exato (não só substrings).
- Constantes nomeadas para os parâmetros da API e o tamanho da janela, sem magic numbers.
- Teste de integração simula o pipeline completo da task 3 (`geocodeCity` → `fetchForecast` → `sliceHourly24`) com `fetch` stubado por URL, validando coerência das 24 h.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Convenções da linguagem do projeto (CommonJS, `__tests__/`, JSDoc) | ✅ |
| Contratos de interface (parâmetros/URLs da TechSpec) | ✅ |
| Logging | ✅ (WARN em falhas de reverse geocoding, conforme TechSpec) |
| Interface de usuário | — (sem UI nesta task) |
| Testes | ✅ |

## Checagens Estáticas

Comando: `cd backend && npm test` (Jest + Supertest; o backend não declara lint nem typecheck)
Linha de base (antes da task): limpa (sem erros nas suites existentes)
Resultado final: 35 testes, 4 suites — todos passando
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): nenhum

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: `javascript-typescript-jest`; lidas depois da implementação (código revisto contra elas): `nodejs-backend-patterns` — ambas relevantes para backend Node + testes Jest; nenhuma outra aplicável às clientes isoladas implementadas.
MCPs do projeto: nenhum necessário para validação automática nesta task. Lacuna documentada: `mcp-api-test` (api-testing) não foi usado — a task 2.0 entrega clientes isolados sem artefato executável por si, e o teste de fumaça foi omitido de propósito no arquivo da task (o fluxo principal de sucesso é coberto pela fumaça da task 3, `GET /api/weather?city=Curitiba` com rede real). `playwright` (ui-testing) e `context7` (documentation) não aplicáveis.

## Recomendações

Nenhuma requerida. O código está conforme a TechSpec e os padrões do projeto; as decisões de escopo (zero dependências, `fetch` global, timeout via `config`) já estavam fixadas na task 1 e nesta TechSpec.

## Veredito

Tarefa concluída e aprovada. Os three clientes foram implementados conforme as assinaturas e parâmetros exatos da TechSpec, com tratamento de erros correto (`ExternalError` para geocoding/forecast; best-effort `null` para reverse geocoding), e a função `sliceHourly24` cobre os casos de borda da janela rolante. A suíte de testes da task (19 testes, unidade + integração com `fetch` espionado/stubado) e a suíte completa do backend (35 testes) passam. Nenhuma divergência crítica, maior ou menor identificada.
