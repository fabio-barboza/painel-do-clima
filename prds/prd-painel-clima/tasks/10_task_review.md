# Review: Task 10.0 - Cards de estatística

**Revisor**: AI Code Reviewer
**Data**: 2026-11-02
**Arquivo da task**: 10_task.md
**Status**: APROVADO

## Resumo

Entregues a grade `.grid-stats` com os quatro cards de estatística (sensação térmica, umidade, vento e índice UV), o `StatCard` (marcação de cada card), o `StatsGrid` (dados, escalas das barras e revelação com `useReveal` e `--d:.24s`) e a composição em `Dashboard`, abaixo de `.grid-main`. A marcação segue as linhas 573–606 de `painel.html`: classes, ids (`statFeels`), cores inline, SVGs (`#i-thermo`, `#i-drop`, `#i-wind`, `#i-uv`) e espaçamento dentro de `<small>`. Os valores vêm do backend, pelas escalas da TechSpec (`BAR_SCALES`, `getBarPercentage`, `getUvLevel`, `getCardinalDirection`). A única adição visual é a classe `.bar-uv`, já prevista em `additions.css` pela tarefa 3.0, com `--f` mínimo de `0.01`. Nenhum valor novo de CSS foi criado. Qualidade boa e aderente à TechSpec.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/components/StatCard.jsx` | ✅ OK | 0 |
| `frontend/src/components/StatsGrid.jsx` | ✅ OK | 0 |
| `frontend/src/components/Dashboard.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/StatCard.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/StatsGrid.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/AppDashboard.test.jsx` | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

- `frontend/src/components/StatsGrid.jsx`: a função `buildStatCards` tem 40 linhas e retorna os quatro cards com valores JSX, o que mistura dados e marcação. Dentro do limite de 50 linhas do padrão, sem correção nesta task.
- `frontend/src/components/StatsGrid.jsx`: a umidade é arredondada com `Math.round` direto no componente, enquanto as outras grandezas usam `lib/format.js`. Não há função de formatação de umidade em `format.js`; manter como está evita alterar um arquivo de tarefa anterior.

## Defeitos de Outras Tasks

Nenhum. O teste de fumaça com a API real (Curitiba) confirmou os valores da tarefa 8.0 sem divergência.

## ✅ Destaques Positivos

- A marcação de `.grid-stats` e de `.card.stat` coincide com `painel.html` (linhas 573–606), inclusive `aria-label`, `--d:.24s`, `id="statFeels"` e o espaço dentro e fora de `<small>` (`6 <small>· Alto</small>`).
- Valores nulos aparecem como `–`, sem unidade, e a barra fica em `--w: 0%`.
- A fração do UV é `max(0.01, pct / 100)`, então a cor do gradiente segue a posição na escala, não o tamanho do preenchimento. A conta foi confirmada no navegador: `--w` 62%, `--f` 0.62, largura de `i` 132,36 px em trilha de 213,5 px.
- Testes cobrem `--w` e `--f` com valores de borda (UV zero e nulos), ids e marcação exata de cada valor.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Convenções da linguagem do projeto | ✅ |
| Contratos de interface (APIs, mensagens) | ✅ (não aplicável: sem chamada nova) |
| Logging | ✅ (não aplicável) |
| Interface de usuário | ✅ |
| Testes | ✅ |

## Checagens Estáticas

Comando: `cd frontend && npm run lint`
Linha de base (antes da task): limpa
Resultado final: limpa (0 erros)
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): nenhum

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: react-testing, vitest | lidas depois: nenhuma | nenhuma aplicável restante (frontend-design, vercel-composition-patterns e web-design-guidelines não aplicáveis: o visual é definido por `painel.html` e a task proíbe valores de CSS novos)
MCPs do projeto: usados: playwright (ui-testing) para o teste de fumaça; mcp-api-test não usado, pois a resposta real de `GET /api/weather?city=Curitiba` foi lida por `curl`; context7 (documentation) não consultado, pois as APIs usadas já estavam no código e na TechSpec

## Testes executados

- Frontend (`cd frontend && npm test -- run`): 254/254 passando, 27 arquivos. Inclui os 6 testes de `StatCard`, os 7 de `StatsGrid` e 1 novo em `AppDashboard`.
- Frontend lint (`cd frontend && npm run lint`): 0 erros.
- Backend (`cd backend && npm test`): 72/72 passando, 6 suítes (sem alteração nesta task).
- Teste de fumaça (ui-testing via Playwright MCP, sem mocks, backend em 3000 e frontend em 5173 subidos por esta task): busca "Curitiba" exibiu os quatro cards dentro de `.grid-stats`, sem `EmptyState`.

| Campo | Tela | API (`/api/weather?city=Curitiba`) |
|-------|------|-----------------------------------|
| Sensação | 27 °C (barra 67%) | apparent_temperature 27.1 → 27, barra 67 |
| Umidade | 73 % (barra 73%) | relative_humidity_2m 73 |
| Vento | 14 km/h · NO (barra 39%) | wind_speed_10m 13.5 → 14, direção 315° → NO, barra 39 |
| Índice UV | 7 · Alto (barra 62%, `--f` 0.62) | uv_index 7.45 → 7, Alto, barra 62 |

Evidência: `prds/prd-painel-clima/task-screenshots/task-10-cards-estatistica-curitiba.png` (captura de página inteira, 1280 px).

Escopo do smoke: somente o fluxo principal de sucesso desta task, em 1280 px. Verificação visual em 768 e 375 px (2 colunas em 920 px, gap de 12 px em 480 px) e revisão visual do gradiente ficam para o QA.

Observação de ambiente: ao encerrar os serviços, o processo `nodemon src/index.js` (PID 153135) permaneceu ativo. Ele começou às 13:40, antes de esta task subir o backend, então não foi encerrado. As portas 3000 e 5173 estão livres.

## Recomendações

1. Revisar no QA a barra do UV em 375 px e a legibilidade de `Vento` com direção de duas letras.
2. Considerar, em tarefa futura, mover a formatação da umidade para `lib/format.js` (`formatHumidity`), para que todos os valores passem pelo mesmo módulo.

## Veredito

APROVADO. Nenhum problema crítico ou maior. A tarefa 10.0 está concluída com testes passando, smoke test com evidência e checkboxes marcados. Próximo passo: tarefa 11.0.
