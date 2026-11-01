# Review: Task 9 - SearchBar (busca + geolocalização + estado de busca)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-27
**Arquivo da task**: 9_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Implementada a `SearchBar.jsx` conforme FR-11, FR-12, FR-17, FR-19 e FR-30. Componente com `form role="search"` semântico (Enter via `onSubmit`), input controlado sem autocomplete, botões `#btnSearch` (primary/submit) e `#btnLocate` (ghost) com ids/classes exatos do `painel.html`, estado de busca (`loading` → `aria-busy` + spinner `.spin` no lugar do ícone + classe `is-loading`) e mensagem de geo-erro (`.search-error`). CSS adicionado ao bloco 2 (`index.css`) limitado às três regras pedidas, reutilizando o keyframe `spin` e os tokens do bloco 1. Testes de unidade e integração criados e passando (10 testes). Suíte completa do frontend: 105 testes passando. Fumaça E2E omitida por definição da task (componente ainda não montado no App).

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/components/SearchBar.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/SearchBar.test.jsx` | ✅ OK | 0 |
| `frontend/src/index.css` | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

- **`frontend/src/__tests__/App.test.jsx`** (pré-existente, não tocado por esta task): 4 erros de lint (`'screen'` não usado; `describe`/`test`/`expect` não definidos — globals do Vitest sem import). É a **linha de base pré-existente**; o `App.test.jsx` não foi modificado nesta task, portanto registrado como observação, não como defeito desta entrega.

## ✅ Destaques Positivos

- Substituição do ícone pelo spinner apenas em `loading`, preservando a estrutura idêntica ao `painel.html` nos demais estados.
- `aria-busy` condicional no form e classe aditiva `is-loading` sem sobrescrever regras do bloco 1.
- `.search-error` com `role="alert"` usando tom `.chip.hot` e ícone `i-drop` 14 px — fiel à TechSpec.
- Contratos bem definidos nos testes: `onSubmit` sempre chamado (trim) e `useWeather` rejeita vazio sem `fetch`; fluxo geo-negado preserva estado e mantém a busca por cidade funcional.
- CSS do bloco 2 estritamente limitado às regras autorizadas, reutilizando o keyframe `spin` existente.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Convenções da linguagem do projeto | ✅ |
| Contratos de interface (APIs, mensagens) | ✅ |
| Logging | — (não aplicável) |
| Interface de usuário | ✅ |
| Testes | ✅ |

A assinatura `SearchBar({ onSubmit, onLocate, loading, geoError })` segue exatamente a interface fixada na TechSpec (um objeto de props — parâmetro único). Sem comentários no código (regra do PRD). Funções dentro dos limites de linhas.

## Checagens Estáticas

Comando: `cd frontend && npm run lint` (ESLint 9 flat config)
Linha de base (antes da task): 4 erros em `App.test.jsx` (arquivo que esta task não tocou) — pré-existentes
Resultado final: 0 erros nos arquivos desta task (`SearchBar.jsx`, `SearchBar.test.jsx`); apenas os 4 erros pré-existentes em `App.test.jsx` permanecem
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): `frontend/src/__tests__/App.test.jsx` — 4 erros (globals Vitest sem import + `screen` não usado)

Suite de testes: `cd frontend && npm test -- run` → **105 passing (15 files)**, incluindo os 10 novos de `SearchBar.test.jsx`.

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: react-testing, vite, vercel-react-best-practices, frontend-design (relevantes para componente React + testes + CSS). javascript-typescript-jest e nodejs-backend-patterns não aplicáveis (sem backend nesta task).
MCPs do projeto: nenhum necessário para validação ponta a ponta. O teste de fumaça E2E (playwright/ui-testing) foi **omitido por definição da task** — o `SearchBar` ainda não está montado no `App.jsx` (montagem na task 15); o feliz caminho da busca é coberto pelos testes de integração (`SearchBar` + `useWeather` com `fetch` mockado). `mcp-api-test` não aplicável (sem novo endpoint nesta task).

## Recomendações

1. (observação) Corrigir os 4 erros de lint pré-existentes em `App.test.jsx` em uma task futura, quando da completação (task 16) — fora do escopo desta.

## Veredito

Task concluída: componente implementado conforme PRD/TechSpec, CSS limitado aos tokens autorizados, todos os testes da task e da suíte completa do frontend passando, e o teste de fumaça E2E omitido por decisão explícita da task (fluxo coberto por integração e pela fumaça da task 15). Sem bloqueios. Próxima task: 10.0 (CurrentConditions + WeatherIconBig).
