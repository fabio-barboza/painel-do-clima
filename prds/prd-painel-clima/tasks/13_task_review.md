# Review: Task 13.0 - Previsão de sete dias

**Revisor**: AI Code Reviewer
**Data**: 2026-11-02
**Arquivo da task**: 13_task.md
**Status**: APROVADO

## Resumo

Entregues a seção semanal `WeeklyCard` com sete cards `DayCard` (ícone, máxima, mínima, probabilidade e volume de chuva, e faixa `.d-range` em escala comum aos sete dias). Dados vêm da resposta do backend, sem valores de `WEEK`. As datas usam `Date.UTC` e tabelas fixas de nomes. Nenhum CSS novo foi criado: a faixa usa `.d-range` já presente em `additions.css`. `Dashboard.jsx` compõe a seção após `StatsGrid`. Revisão sem problemas críticos ou maiores.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| frontend/src/components/DayCard.jsx | ✅ OK | 0 |
| frontend/src/components/WeeklyCard.jsx | ✅ OK | 0 |
| frontend/src/components/Dashboard.jsx | ✅ OK | 0 |
| frontend/src/lib/format.js | ✅ OK | 0 |
| frontend/src/__tests__/DayCard.test.jsx | ✅ OK | 0 |
| frontend/src/__tests__/WeeklyCard.test.jsx | ✅ OK | 0 |
| frontend/src/__tests__/formatWeekly.test.js | ✅ OK | 0 |
| frontend/src/__tests__/AppWeekly.test.jsx | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

- `frontend/src/components/DayCard.jsx`: o texto de `.d-rain` segue o padrão de `painel.html` (ícone, espaço e valor), por isso o `textContent` começa com espaço. Os testes usam `trim()`. Sem ação necessária.

## Defeitos de Outras Tasks

Nenhum.

## ✅ Destaques Positivos

- Escala comum calculada uma vez por `buildDayEntries`, com casos de valores iguais (`--l:0%`, `--w:100%`), largura mínima de 4% e nulos (`0%`).
- Testes de unidade cobrem os valores esperados da fixture (posições e larguras calculadas à mão).
- Smoke test com dados reais: valores de máxima, mínima, chuva e faixa batem com o cálculo sobre a resposta do backend.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Convenções da linguagem do projeto | ✅ |
| Contratos de interface (APIs, mensagens) | ✅ |
| Logging | ✅ (não aplicável) |
| Interface de usuário | ✅ |
| Testes | ✅ |

## Checagens Estáticas

Comando: `cd frontend && npm run lint`
Linha de base (antes da task): limpa
Resultado final: limpa
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): nenhum

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: nenhuma (a consulta da Step 2 não foi feita antes do código; registrado como desvio de processo) | lidas depois (código revisto contra elas): webapp-testing (Playwright). A skill é orientada a scripts Python, não usados: a validação foi feita pelo Playwright MCP, conforme a regra da tarefa. A revisão do código contra a skill não gerou alterações.
MCPs do projeto: usados: playwright (ui-testing) para o smoke test em 1280px e 375px | lacuna: nenhuma. context7 (documentation) não foi necessário, pois a task não envolveu APIs de biblioteca novas.

## Recomendações

1. Os testes de comparação visual completos (CA-01 e CA-02) continuam sendo responsabilidade da etapa de QA, conforme a TechSpec.

## Veredito

APROVADO. Tarefa 13.0 concluída: lint limpo, 335 testes do frontend e 72 do backend passando, smoke test OK em 1280px e 375px (a semana rola na horizontal e a página não tem rolagem horizontal). Evidências em `prds/prd-painel-clima/task-screenshots/task-13-semana-1280px.png` e `task-13-semana-375px.png`.
