# Review: Task 16.0 - Documentação de comunicação e portas

**Revisor**: AI Code Reviewer
**Data**: 2026-11-02
**Arquivo da task**: 16_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Documentada a estratégia de comunicação (URL absoluta com CORS, sem proxy do Vite), a tabela de portas de desenvolvimento (5173 e 3000) e produção (4173 e 3000) e as variáveis de ambiente. Foram criados `frontend/.env.example`, acrescentado `CORS_ORIGINS` a `backend/.env.example` e atualizado o `README.md` (seção "Comunicação e portas", comandos de cada ambiente, linha de `/api/weather` na tabela de endpoints). Testes de unidade e de integração (Supertest em `NODE_ENV=production`, `CORS_ORIGINS=http://localhost:4173`) e o teste de fumaça via Playwright passaram. O código de aplicação não foi alterado.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `README.md` | ✅ OK | 0 |
| `backend/.env.example` | ✅ OK | 0 |
| `frontend/.env.example` | ✅ OK | 0 |
| `backend/src/__tests__/communicationDocs.test.js` | ✅ OK | 0 |
| `frontend/src/__tests__/communicationDocs.test.js` | ⚠️ Problemas | 1 menor |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

- `frontend/src/__tests__/communicationDocs.test.js`: a raiz do projeto é resolvida por `process.cwd()/..`, o que pressupõe que o Vitest rode a partir de `frontend/` (como o comando declarado em `.do/context.md` faz). `import.meta.url` não funcionou no ambiente jsdom do Vitest. Sugestão: manter, ou mover a verificação para um teste de nível de raiz se o comando mudar.

## Defeitos de Outras Tasks

Nenhum.

## ✅ Destaques Positivos

- Os valores de `.env.example` são verificados por parse (`dotenv.parse`), não por fragmento de texto.
- O teste de integração cobre origem liberada, origem bloqueada, preflight completo e ausência de ETag, com `Cache-Control: no-store`.
- O README e os `.env.example` usam a mesma tabela de portas e a mesma origem padrão do `weather.js`, e um teste garante isso.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Convenções da linguagem do projeto | ✅ |
| Contratos de interface (APIs, mensagens) | ✅ (CORS e preflight conferidos contra a TechSpec) |
| Logging | ✅ (não aplicável) |
| Interface de usuário | ✅ (não alterada) |
| Testes | ✅ |

## Checagens Estáticas

Comando: `cd frontend && npm run lint`
Linha de base (antes da task): limpa
Resultado final: limpa
Erros pré-existentes: nenhum

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: `javascript-typescript-jest` (estrutura de testes e convenções de mock). Nenhuma outra aplicável ao escopo documental.
MCPs do projeto: usados: playwright (ui-testing) para o teste de fumaça contra `http://localhost:4173`, com screenshot em `prds/prd-painel-clima/task-screenshots/task-16-smoke-curitiba.png`. mcp-api-test (api-testing) não usado: a verificação de CORS foi feita pelo Supertest e por uma requisição de conferência com `curl` ao backend em execução, com `Origin: http://localhost:4173`, que retornou `Access-Control-Allow-Origin`, `Cache-Control: no-store` e 200. context7 não necessário.

Resultado do teste de fumaça (Playwright): busca por "Curitiba" em `http://localhost:4173` gerou `GET http://localhost:3000/api/weather?city=Curitiba` com status 200, o painel exibiu "Curitiba, Paraná", "Garoa leve" e 24°, sem mensagens de erro no console (0 erros, 0 avisos) e sem erro de CORS.

## Recomendações

1. Rodar `npm run dev` nos dois pacotes e confirmar, em `http://localhost:5173`, a busca de Curitiba sem CORS (o caminho de desenvolvimento não foi exercitado no smoke test, que cobriu produção).
2. Decidir se a geolocalização em produção fora de `localhost` deve ter um aviso na UI, além da documentação de HTTPS.

## Veredito

Entrega aprovada com uma observação menor. Testes unitários, de integração e a suíte completa passam (backend 81 testes, frontend 363 testes), o lint está limpo e o teste de fumaça de produção retornou os dados sem erro de CORS. Serviços iniciados para o smoke test (backend em 3000 e preview em 4173) foram encerrados.
