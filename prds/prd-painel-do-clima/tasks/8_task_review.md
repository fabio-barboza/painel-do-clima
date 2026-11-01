# Review: Task 8.0 - Camada de dados: services/weather, useCountUp e useWeather

**Revisor**: AI Code Reviewer
**Data**: 2026-10-27
**Arquivo da task**: 8_task.md
**Status**: APROVADO

## Resumo

Camada de dados do frontend implementada conforme PRD/TechSpec: `services/weather.js` (sempre `cache: 'no-store'`, city codificada, mapeamento de status → `WeatherError.kind`), `hooks/useWeather.js` (máquina `idle/loading/success/error` com `search`/`locate`/`retry`, `AbortController` por busca e abort no unmount) e `hooks/useCountUp.js` (count-up 1400 ms, delay 450 ms, easing cúbico, reduced-motion direto). `setup.js` ganhou os stubs de ambiente (`IntersectionObserver`, `matchMedia`, `getTotalLength`); mocks de `fetch`/`geolocation` permanecem por teste. Todos os 95 testes do frontend passam (70 prévios + 25 novos) e o lint não introduz erros novos.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/services/weather.js` | ✅ OK | 0 |
| `frontend/src/hooks/useWeather.js` | ✅ OK | 0 |
| `frontend/src/hooks/useCountUp.js` | ✅ OK | 0 (refatorado para evitar `setState` síncrono em effect) |
| `frontend/src/__tests__/setup.js` | ✅ OK | 0 |
| `frontend/src/__tests__/weather-service.test.js` | ✅ OK | 0 |
| `frontend/src/__tests__/useWeather.test.js` | ✅ OK | 0 |
| `frontend/src/__tests__/useCountUp.test.js` | ✅ OK | 0 |
| `frontend/src/__tests__/App.test.jsx` | ⚠️ Pré-existente | 4 (não tocados por esta task) |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. **`useCountUp`: `setState` síncrono em effect (regra `react-hooks/set-state-in-effect`)** — a versão inicial chamava `setValue(target)` diretamente no body do effect para o caso de reduced-motion, gerando erro de lint. Refatorado para mover a atribuição para dentro do `setTimeout(450)` (coerente com as linhas 806–817 do protótipo, que também esperam o delay antes de fixar o valor). Correção aplicada na própria task.

## ✅ Destaques Positivos

- **FR-36 aplicado em todos os `fetch`** com `cache: 'no-store'` explícito, verificado em teste de unidade.
- **`AbortController` por busca** com abort na nova consulta e no unmount — cobertura de teste que confirma `signal.aborted`.
- **Mapeamento de erros completo** (404/400/5xx/rede) com a classe `WeatherError` carregando `kind` e `status`.
- **Busca vazia sem request** — verificada explcitamente (assert `fetch` não chamado).
- **Mocks por teste** (`fetch`/`geolocation`), sem vazamento entre casos; stubs de ambiente no `setup.js` sem quebrar as suítes prévias.
- **Base de URL condicional** (vazia em dev / absoluta com `VITE_API_URL`) testada nos dois cenários.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ (nomes descritivos ≤ 30 chars, sem magic numbers sem nome, ≤ 3 params, sem comentários — regra do PRD) |
| Convenções da linguagem do projeto | ✅ (ESM `import`/`export`, testes em `src/__tests__/` com `*.test.js`) |
| Contratos de interface (APIs, mensagens) | ✅ (assinaturas coerentes com a TechSpec) |
| Logging | ✅ (não aplicável) |
| Interface de usuário | ✅ (não aplicável — camada de dados; UI na task 15) |
| Testes | ✅ (unidade + integração + fumaça; 95 passando) |

## Checagens Estáticas

Comando: `cd frontend && npm run lint` (ESLint 9 flat config)
Linha de base (antes da task): 4 erros em 1 arquivo (`frontend/src/__tests__/App.test.jsx` — `screen` não usado + globals do Vitest não declarados), arquivo que esta task **não** modificou.
Resultado final: 4 erros em 1 arquivo (os mesmos da linha de base; arquivos desta task limpos).
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): `App.test.jsx` — 4 erros.

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: `react-testing` (padrões de hook/componente e mock de rede), `vitest` (API de teste, mocks, fake timers). `vercel-react-best-practices` consultada implicitamente pela TechSpec (hooks idempotentes/cleanup).
MCPs do projeto: nenhum necessário nesta etapa. A camada entregue não expõe UI navegável (orquestração do `App.jsx` é a task 15) nem endpoint novo de backend — portanto o guard de capacidade não ativa `ui-testing`/`api-testing` para o escopo desta task. O teste de fumaça do fluxo principal (`search('Curitiba')` → `success` com 24 entradas horárias) é validado pelos testes de unidade/integração via `npm test -- run` (comando oficial do projeto), e não por script de automação direto.

## Recomendações

1. (Sem bloqueio) Na task 15, garantir que o `App.jsx` consuma `useWeather` de modo que o erro de geolocalização seja exibido em `.search-error` preservando os dados anteriores (decisão de contrato desta task: `error.kind === 'geo'` não sobrescreve `status`/`data`).

## Veredito

APROVADO. Requisitos da task implementados e testados, suíte verde (95/95), sem erros novos no lint. Dois pontos observados (erros pré-existentes em `App.test.jsx` e E2E de UI adiado para a task 15) não bloqueiam.
