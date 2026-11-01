# Review: Task 7.0 — Funções puras de domínio: lib/format, lib/weatherCodes e lib/chart

**Revisor**: AI Code Reviewer
**Data**: 2026-10-27
**Arquivo da task**: 7_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Implementadas as três funções puras de domínio que todo o frontend consome, sem React e sem DOM:

- `frontend/src/lib/format.js` — `formatTimeFromIso`, `formatDayLabel`, `formatShortDate`, `formatNumber`.
- `frontend/src/lib/weatherCodes.js` — `weatherCodeInfo` (mapa WMO completo + fallback), `uvLabel` (faixas WHO), `windCardinal` (16 pontos).
- `frontend/src/lib/chart.js` — `computeScales`, `smoothPath` (Catmull-Rom idêntico ao protótipo), `rainBarHeights`.

Testes de unidade (3 arquivos) + integração (1 arquivo) escritos e aprovados (28 testes na task, 70 na suíte inteira do frontend). Nenhuma dependência nova. A geometria do gráfico, as cores e a tabela WMO seguem `painel.html`/TechSpec.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/lib/format.js` | ✅ OK | 0 |
| `frontend/src/lib/weatherCodes.js` | ✅ OK | 0 |
| `frontend/src/lib/chart.js` | ✅ OK | 0 |
| `frontend/src/__tests__/format.test.js` | ✅ OK | 0 |
| `frontend/src/__tests__/weatherCodes.test.js` | ✅ OK | 0 |
| `frontend/src/__tests__/chart.test.js` | ✅ OK | 0 |
| `frontend/src/__tests__/domain.test.js` | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. **Exemplo contraditório na TechSpec (`formatShortDate`).** A TechSpec e a task listam `formatShortDate("2026-10-16") → "16 ago"`. Isso é inconsistente com o próprio array fixo de meses da decisão 9 (`...,'jul','ago','set','out',...`), em que agosto→`'ago'` e **outubro→'out'**. pt-BR correto (FR-38) exige `"16 out"` para 16 de outubro. Implementei conforme o array fixo (a fonte autoritativa) e os testes afirmam `"16 out"` para outubro e `"16 ago"` para agosto. Correção sugerida: corrigir o exemplo na TechSpec/task para `"2026-08-16" → "16 ago"`.

## ✅ Destaques Positivos

- `smoothPath` reproduzip exatamente o Catmull-Rom do protótipo (controle /6, `toFixed(1)`, 1 `M` + 23 `C`), idempotente com pontos colineares.
- `weatherCodeInfo` cobre **todos** os códigos da tabela WMO, incluindo 45/48, 56/57, 66/67, 71–77, 85/86, 95/96/99, com fallback defensivo.
- `uvLabel` aplica corretamente as faixas WHO (com arredondamento, de forma que 2.9→Moderado como pedido).
- `computeScales` respeita a geometria exata do protótipo (`X(0)=44`, `X(23)=744`, tMin/tMax múltiplos de 4) e se defende de divisão por zero quando todas as temperaturas são iguais.
- `formatTimeFromIso` é estritamente determinística (slice puro do ISO, sem `Date`).

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ (sem comentários, ≤ 50 linhas por função, sem flags booleanas, funções puras) |
| Convenções da linguagem do projeto | ✅ (ESM `import`/`export`, camelCase, `src/lib/`, testes em `src/__tests__/` com `*.test.js`) |
| Contratos de interface (APIs, mensagens) | ✅ (assinaturas idênticas às da TechSpec) |
| Logging | N/A |
| Interface de usuário | N/A (sem DOM) |
| Testes | ✅ (unidade + integração, todos passando) |

## Checagens Estáticas

Comando: `cd frontend && npm run lint` (ESLint 9 flat config)
Linha de base (antes da task): 4 erros em 1 arquivo (`frontend/src/__tests__/App.test.jsx` — dependencia das globals do Vitest sem importá-las; arquivo não tocado por esta task)
Resultado final: mesmos 4 erros pré-existentes em `App.test.jsx`; **zero** erros em qualquer arquivo criado ou alterado por esta task.
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): `frontend/src/__tests__/App.test.jsx` — `screen` não usado, `describe`/`test`/`expect` não definidos.

## Skills e MCPs do Projeto

Skills do projeto: **lidas depois da implementação**: `vitest` (API padrão: `describe`/`test`/`expect`, matchers e `expect.any` — código e testes confirmados contra a skill, nenhuma divergência). **Não aplicáveis nesta task** (funções puras, sem backend/componentes/Vite/E2E): `nodejs-backend-patterns`, `react-testing`, `frontend-design`, `webapp-testing`, `vite`, `vercel-react-best-practices`, `javascript-typescript-jest`, `web-design-guidelines`, `vercel-composition-patterns`.
MCPs do projeto: **necessário nenhum** — funções puras sem artefato executável (sem UI nem serviço) e o teste de fumaça E2E foi omitido pela própria task. Lacuna de E2E documentada (o fluxo visível é coberto pelas tasks 10–13 e 15).

## Recomendações

1. Corrigir o exemplo `formatShortDate("2026-10-16" → "16 ago")` na TechSpec/`7_task.md` para o mês coerente (`"2026-08-16" → "16 ago"`), já que outubro é `"out"` em pt-BR.
2. (Próximas tasks) aproveitar `computeScales`/`smoothPath`/`rainBarHeights` como contrato fixo na implementação do `HourlyChart` (task 12) para manter a geometria idêntica ao protótipo.

## Veredito

Task aprovada com observação menor (exemplo contraditório na TechSpec, já resolvido corretamente no código). Testes de unidade e integração passando (28/28 na task; 70/70 na suíte do frontend), lint sem erros nos arquivos da task, e todos os `<critical>` e critérios de sucesso atendidos. A observação sobre o exemplo não bloqueia a fila.
