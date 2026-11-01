# Review: Task 4.0 - Fundação do frontend: index.html, port verbatim do CSS (design system), proxy Vite e .env.example

**Revisor**: AI Code Reviewer
**Data**: 2026-10-28
**Arquivo da task**: 4_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Fundação do frontend entregue: `index.html` (lang pt-BR, título "Painel do Clima", meta description, `preconnect` + fonte Inter), `index.css` com **port byte-idêntico** do bloco `<style>` do `painel.html` (bloco 1, sem acréscimos), `vite.config.js` com porta 5173 + proxy `/api` → `http://localhost:3000` sem rewrite, e `.env.example` com `VITE_API_URL=`. Os 12 testes (unidade + integração) passam. O test de fumaça validou o fluxo principal pelo MCP Playwright: a página servida em `:5173` traz o `<link>` da Inter e o `<style>` portado (o céu do protótipo aparece no screenshot), e o proxy encaminha `/api/*` para o backend. Registrada uma **observação** sobre o endpoint de saúde (`/api/health` não existe no backend — ver Observações).

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/index.html` | ✅ OK | 0 |
| `frontend/src/index.css` | ✅ OK (port verbatim) | 0 |
| `frontend/vite.config.js` | ✅ OK | 0 |
| `frontend/.env.example` | ✅ OK | 0 |
| `frontend/src/__tests__/foundation.test.js` | ✅ OK | 0 |
| `frontend/src/__tests__/App.test.jsx` | ⚠️ Pré-existente (não tocado) | 4 (linha de base) |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado **na desta task**.

Observação de outra task (não bloqueante, registrada conforme Step 4 item 7): o test de fumaça da task espera `GET http://localhost:5173/api/health → 200` pelo proxy, mas o **backend (tasks 1–3) expõe a saúde em `/health` (raiz), não `/api/health`**. Pelo proxy sem rewrite, `/api/health` → backend `/api/health` → `404` (`{"error":"Rota não encontrada."}`, response do próprio backend). O encaminhamento do proxy **foi validado** (o 404 é do backend, provando que a requição chegou a `:3000` pelo proxy); o `/api/weather` é a única rota `/api` e exige a API externa Open-Meteo (inacessível neste ambiente), portanto não há como obter `200` pelo proxy `/api` offline. Sem ação possível dentro da escopo da task 4 (não editar código de outra task). Evidência: `prds/prd-painel-do-clima/task-screenshots/` + requisições Playwright registradas na review.

### 🟢 Problemas Menores

Nenhum problema menor encontrado.

## ✅ Destaques Positivos

- **Port verbatim fiel**: `index.css` é byte-idêntico ao `<style>` do `painel.html` (bloco 1) — verificado por teste que extrai o bloco do arquivo-fonte e compara, sem renomear seletores nem alterar valores.
- **Teste de fidelidade autossustentável**: a comparação byte-a-byte lê `painel.html` diretamente no teste (sem hardcoding do conteúdo portado).
- **Proxy sem rewrite** respeita a convenção do backend (mantém o prefixo `/api`).
- **Favicon mantido** (`/favicon.svg`), sem quebrar o template.
- O céu do protótipo (`body::before`) renderiza corretamente no dev server — evidência visual de que o design system está servido.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Convenções da linguagem do projeto | ✅ (ESM no frontend; `import`/`export`; sem comentários no CSS portado) |
| Contratos de interface (APIs, mensagens) | ✅ (proxy documentado dev/prod) |
| Logging | ✅ (aplicável) |
| Interface de usuário | ✅ |
| Testes | ✅ (12/12 passando) |

## Checagens Estáticas

Comando: `cd frontend && npm run lint` (ESLint 9 flat config)
Linha de base (antes da task): 4 erros em 1 arquivo (`frontend/src/__tests__/App.test.jsx` — `no-unused-vars` `screen`; `no-undef` `describe`/`test`/`expect`)
Resultado final: 4 erros em 1 arquivo — **os mesmos da linha de base**
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): `frontend/src/__tests__/App.test.jsx` — 4 erros. Os arquivos criados/alterados pela task (`index.html`, `index.css`, `vite.config.js`, `.env.example`, `foundation.test.js`) **não geram nenhum erro** (o `foundation.test.js` importa `{ describe, test, expect }` do `vitest`, evitando os `no-undef`).

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: `vite` (alteração de `vite.config.js` e proxy), `vitest` (escrita dos testes). Não aplicadas nesta task (lida depois/sem efeito): `react-testing` (sem testes de comportamento de componentes nesta fundação), `frontend-design` (port verbatim, sem decisões novas de design).
MCPs do projeto: usados: `playwright` (ui-testing) — navegação em `:5173`, leitura do HTML servido, validação do proxy via `fetch` de mesma origem (same-origin) e screenshot de evidência. Não usados: `mcp-api-test` (api-testing) — a validação do proxy foi feita pelo Playwright conforme o test de fumaça (página servida + proxy); `context7` (documentation) — não necessário.

## Recomendações

1. (Outra task) Harmonizar o nome do endpoint de saúde: ou expor `/api/health` no backend (mantendo `/health` também), ou ajustar o test de fumaça da task 4 para `GET http://localhost:5173/api/...` contra uma rota `/api` real. Decisão de produto/contrato — fora do escopo desta task.
2. (Outra task) Corrigir `App.test.jsx` (linha de base): remover `screen` não usado e habilitar os globals do Vitest (ou importá-los), para limpar a linha de base do lint do frontend.

## Veredito

Task concluída com todos os artefatos entregues e **12/12 testes passando**. O port verbatim do design system, o `index.html`, o proxy Vite e o `.env.example` estão corretos e validados. O test de fumaça validou o fluxo principal (página servida com a fonte Inter + `<style>` portado; proxy encaminhando `/api/*` para o backend). A única ressalva é uma **observação** de que o `200` esperado em `/api/health` pelo proxy não é obtido porque o backend expõe a saúde em `/health` (raiz) — o encaminhamento do proxy ficou provado, e não há rota `/api` que responda `200` neste ambiente offline. Sem bloqueios para a fila.
