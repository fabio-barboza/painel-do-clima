# Review: Task 13.0 — WeeklyForecast + DayCard (próximos 7 dias)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-27
**Arquivo da task**: `13_task.md`
**Status**: **APROVADO COM OBSERVAÇÕES**

## Resumo

Implementados o `WeeklyForecast.jsx` (seção `section.card` 7 dias) e o `DayCard.jsx` (card de dia), mais a suíte de testes `WeeklyForecast.test.jsx` (11 testes, unidade + integração). A estrutura DOM replica trechos das linhas 608–616 e 672–681 do `painel.html` (`.card-head` h2/`.sub`, `.weekly-grid`, `.day` com `.d-name`/`.d-date`/`.d-ico`/`.d-temps`/`.d-rain`), os dados vêm 100 % do `daily` (FR-35), sem valores fixos do `WEEK` do protótipo. Ícone/cor por código WMO, chuva por probabilidade com "–" quando `null` (decisão 4 da TechSpec), "Hoje"+classe `today` somente no índice 0. Nenhum valor de clima hard-coded. Todos os testes da task passam. Um defeito de outra task (CSS port, task 4) e um problema de lint de outra task (App.test.jsx, task 15) foram identificados e registrados abaixo como observações — não impactam esta entrega.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/components/DayCard.jsx` | ✅ OK | 0 |
| `frontend/src/components/WeeklyForecast.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/WeeklyForecast.test.jsx` | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

> Obs.: durante a revisão inicial, detectei que o `DayCard` estava adicionando a classe `today` ao `.day` (div pai) **e** ao `.d-name`. O protótipo (linhas 674–675) coloca `today` **somente** em `.d-name`. A correção foi aplicada (removida do `.day`) e um novo caso de teste travou o comportamento. Não resta divergência.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. **`WeeklyForecast` — leituras repetidas por índice** (`toIndexArray`, 5 chamadas). Funcional e legível; para 7 entradas o custo é irrelevante. Sugestão opcional: ler `daily` uma vez e derivar o array de dias de uma passada. (Não bloqueante; mantido por clareza.)

## ✅ Destaques Positivos

- Fidelidade estrutural ao protótipo (mesmas classes, mesma ordem, `.d-ico` com cor inline por condição, ícone `i-drop` na `.d-rain`).
- Reaproveitamento integal das dependências já entregues (`Icon`, `format`, `weatherCodes`): **zero dependências novas**.
- Robustez a `null`/valores extremos: `roundOrNull` e `rainLabel` evitam `NaN` e `null` visível (testado com temperaturas negativas e probabilidade nula).
- Testes cobrem todos os grupos WMO semanais (sol, parcial, nuvem, chuva, tempestade), arredondamento, ordenação "hoje primeiro" e a regra de `today` somente em `.d-name`.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ (sem comentários — regra do PRD; sem magic numbers; ≤3 params; estado derivado no render; funções com verbo; lint limpo) |
| Convenções da linguagem do projeto | ✅ (ESM `import`/`export`, camelCase `.jsx`, `src/components/`, `src/__tests__/`) |
| Contratos de interface (APIs, mensagens) | ✅ (`DayCard({ day, index })`, `WeeklyForecast({ daily })`, conforme TechSpec) |
| Testes | ✅ (11/11 passando) |

**Nota sobre o skill `react-testing`:** os testes usam queries estruturais (`querySelectorAll('.weekly-grid > .day')`, classes CSS) em vez de queries acessíveis (`getByRole`/`getByText`). Escolha deliberada, alinhada à convenção já estabelecida nos testes do projeto (`StatsGrid.test.jsx`, `HourlyChart.test.jsx`) e ao critério de sucesso FR-33, que exige fidelidade a classes/estrutura exatas do protótipo — para este componente presentacional, a estrutura CSS é o contrato observável. Nenhum desvio bloqueante.

## Checagens Estáticas

Comando: `cd frontend && npm run lint` (ESLint 9) e `cd frontend && npm test -- run`.

Linha de base (antes da task):
- Lint frontend: **4 erros pré-existentes em `App.test.jsx`** (não tocou nesta task) — `'screen'` não usado + `describe/test/expect` sem defs (`no-undef`).
- Suite frontend: **1 erro pré-em `foundation.test.js`** — port CSS de `index.css` não é byte-idêntico ao `<style>` do `painel.html` (difere no char 14453 — bloco portado diverge no fechamento). Corresponde à task 4.

Resultado final:
- Lint nos arquivos desta task (`DayCard.jsx`, `WeeklyForecast.jsx`, `WeeklyForecast.test.jsx`): **limpo** (exit 0).
- Suite frontend: **150 passing / 1 failing** — o único erro é o pré-existente `foundation.test.js` (não tocou nesta task).

Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou):
- `frontend/src/__tests__/foundation.test.js` (via `frontend/src/index.css`) — port CSS byte-idêntico (task 4).
- `frontend/src/__tests__/App.test.jsx` — 4 erros de lint (task 15).

## Skills e MCPs do Projeto

Skills do projeto: **lidas depois da implementação** (código revisto contra elas, sem desvio bloqueante): `react-testing`, `vercel-react-best-practices`. (`frontend-design` disponível, mas não aplicado como escolha — a identidade visual desta task é ditada pelo port verbatim do `painel.html` / FR-33, sem decisão de design discricionária.)

MCPs do projeto: **nenhum usado**. Lacuna: `ui-testing` (Playwright) não aplicado — o `WeeklyForecast` ainda não está montado no `App.jsx` (montagem é da task 15); o arquivo de task define o teste de fumaça como **omitido** e o fluxo visível coberto pela fumaça da task 15. O sucesso principal do componente foi validado por testes unitários + de integração (11 testes).

## Recomendações

1. (Outra task — task 4) Corrigir o port de `index.css` para ficar byte-idêntico ao `<style>` do `painel.html`, reaprovando `foundation.test.js`.
2. (Outra task — task 15) Ajustar `App.test.jsx` (remover `screen` não usado e definir o ambiente de teste `describe`/`test`/`expect`) para limpar o lint do frontend.
3. (Opcional) Consolidar a derivação de dias no `WeeklyForecast` em uma passada única sobre `daily`.

## Veredito

Task concluída com qualidade. Componentes fiéis ao protótipo, sem dependências novas, dados 100 % do backend, suíte verde (11/11) e lint dos arquivos da task limpo. Os dois problemas encontrados são de **outras tasks** (task 4 — CSS port; task 15 — lint do `App.test.jsx`) e não impedem o fluxo principal desta entrega: status **APROVADO COM OBSERVAÇÕES**.
