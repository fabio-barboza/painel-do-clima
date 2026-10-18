# Review: Task 1.0 - Fundação do backend (env, no-cache, error handler, split app/index)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-17
**Arquivo da task**: 1_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Funda o servidor Express com as restrições de cache/CORS e observabilidade de que todo o restante do backend depende. Foram criados `config/env.js` (getEnv com defaults de produção e timeout 10000 ms), `middleware/noCache.js`, `middleware/errorHandler.js` (404 + 500 com log estruturado), a fábrica `app.js` (split do bootstrap) e o `index.js` reduzido a bootstrap puro (env + listen). CORS explícito por ambiente, log de requisição em JSON estruturado e `app.disable('etag')` implementados. A suíte Jest foi ampliada para 18 testes com **cobertura de 100%** nos arquivos novos e a suíte completa está verde. Um smoke test ao vivo (curl contra o servidor real) confirmou o comportamento end-to-end: no-cache em 200 e 404, CORS presente, ausência de `ETag` e 404 JSON no contrato esperado.

> **Gap de E2E (capability guard):** task de backend; o ambiente possui apenas MCPs `context7` (documentation) e `playwright` (browser-testing). Nenhum MCP com capacidade `api-testing`/`database`/`cache`/`message-queue` está configurado, então o E2E backend via MCP foi **pulado** conforme o guard de capacidades. A validação HTTP real foi coberta pelos testes de integração com Supertest (que sobem o app Express real) e pelo smoke test ao vivo via curl.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| backend/src/config/env.js | ✅ OK | 0 |
| backend/src/middleware/noCache.js | ✅ OK | 0 |
| backend/src/middleware/errorHandler.js | ✅ OK | 0 |
| backend/src/app.js | ✅ OK | 0 |
| backend/src/index.js | ✅ OK | 0 |
| backend/src/__tests__/api.test.js | ✅ OK | 0 |
| backend/src/__tests__/noCache.test.js | ✅ OK | 0 |
| backend/src/__tests__/env.test.js | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. `backend/src/app.js` (CORS, linhas 38-45): em ambientes **não-dev**, requisições **sem** header `Origin` (ex.: health checks, server-to-server) recebem `Access-Control-Allow-Origin: *` como fallback. Justificativa: garante a presença do header CORS em todas as respostas (critério de sucesso "CORS presente nas respostas") sem comprometer a segurança — requisições cross-origin de navegador fora do allow-list continuam bloqueadas, pois enviam `Origin` ausente da allow-list e não recebem ACAO. Aceitável, mas deve ser documentado.
2. `backend/src/app.js` (log de requisição, linha 27): o middleware emite sempre via `console.log` independentemente do nível; o campo `level` (`info` em produção / `debug` em desenvolvimento) é metadado, não um filtro de emissão. Interpretação coerente com o requisito ("nível info em produção, debug em desenvolvimento"), mas em um deploy real um agregador de logs filtraria por `level`.

## ✅ Destaques Positivos

- Cobertura de **100%** (statements, branches, functions e lines) em todos os arquivos novos.
- Split fábrica (`app.js`) / bootstrap (`index.js`) — permite testes com Supertest sem iniciar servidor (decisão D2); `index.js` ficou sem nenhuma lógica de negócio.
- Constantes nomeadas para todos os defaults de env (sem magic numbers) + parsing defensivo de `CORS_ORIGINS` (trim/drop vazios) e de valores numéricos não-finitos (`toNumber` com fallback).
- Defesa em profundidade: `Cache-Control: no-store` reafirmado nos handlers de erro (404/500), garantindo cobertura mesmo que a ordem de middlewares mude.
- Log estruturado (JSON) de requisição e de erro com contexto (rota, query, params, stack) **sem vazar stack ao cliente**.
- Preflight CORS (OPTIONS → 204) tratado corretamente, com `Vary: Origin` no modo allow-list.
- Suíte ampliada para 18 testes: no-cache (200 + erro), ausência de ETag, CORS por ambiente (dev/allow-list/rejeição/preflight), 404 JSON, 500 JSON, defaults/override de env e log de requisição (debug/info + query context).

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Linguagem/Runtime | ✅ (CommonJS, Node 18+, camelCase) |
| REST/HTTP | ✅ |
| Logging | ✅ (JSON estruturado) |
| Framework UI | N/A (backend) |
| Testes | ✅ (18/18, cobertura 100%) |

## Recomendações

1. (Task 17) Documentar no `README`/`.env.example` o fallback CORS de `*` para requisições sem `Origin` e a semântica do campo `level` no log de requisição.
2. (Task 3) Ao montar `/api/weather`, confirmar que `city`/`lat`/`lon` aparecem no log de requisição (o middleware já suporta) e validar a cadeia real via curl.
3. (Futuro, fora de escopo) Se um agregador de logs for introduzido, considerar um filtro real por nível (suprimir `debug` em produção).

## Veredito

Fundação do backend concluída e validada. Todos os critérios de sucesso atendidos, suíte 100% verde com cobertura total nos arquivos novos, D13 (sem comentários) e convenções do `AGENTS.md` (CommonJS, camelCase, testes em `__tests__/`, porta 3000) respeitadas. Duas observações menores, ambas não bloqueantes e acompanhadas de recomendações. **APROVADO COM OBSERVAÇÕES** — pronto para a Task 2.0 (Serviço Open-Meteo).
