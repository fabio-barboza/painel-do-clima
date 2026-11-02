# Review: Task 14.0 - Skeleton e erros sobre dados exibidos

**Revisor**: AI Code Reviewer
**Data**: 2026-11-02
**Arquivo da task**: 14_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Foram entregues `DashboardSkeleton.jsx` (markup e classes reais, com `.skel`, `.is-skel` no `.temp`, quatro `.stat`, sete `.day`, sem `.reveal`), a escolha final entre vazio, skeleton e dados em `App.jsx` (função pura `selectPanel`), a região `.sr-only` com `role="status"` sempre montada, `aria-busy` em `main.dashboard` durante o carregamento e a preservação dos dados em erro, que já era comportamento do `useWeather`. Nenhum CSS novo foi criado: apenas as classes de `additions.css` e `index.css` são usadas. A suíte do frontend passa (38 arquivos, 347 testes), o lint está limpo e o teste de fumaça no navegador confirmou o fluxo principal.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/components/DashboardSkeleton.jsx` | ✅ OK | 0 |
| `frontend/src/App.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/DashboardSkeleton.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/AppFeedback.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/App.test.jsx` | ✅ OK | 0 (smoke da fixture acrescentado) |
| `frontend/src/__tests__/AppWeather.test.jsx` | ⚠️ Problemas | 1 (consulta `getByRole('status')` tornou-se ambígua; trocada por `getByText`, ver defeitos) |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior bloqueante. Ponto de atenção registrado abaixo como menor.

### 🟢 Problemas Menores

- `frontend/src/components/DashboardSkeleton.jsx`: o skeleton usa `<div className="big-icon"></div>` vazio, sem ícone placeholder, porque não há CSS novo disponível para um bloco de skeleton do ícone. Reserva a dimensão e não causa salto de layout; registrado para revisão no QA (CA-05).
- `frontend/src/__tests__/AppWeather.test.jsx` (linha 73): a asserção mudou de `getByRole('status')` para `getByText(...)`, pois a região `.sr-only` com `role="status"` agora sempre existe e a consulta por papel ficou ambígua. A mudança preserva a verificação do texto da orientação e não enfraquece o teste.
- Skills do projeto relevantes (`react-testing`, `vitest`, `vercel-react-best-practices`) não foram lidas antes da implementação; o código segue os padrões já presentes nos componentes e testes da base. Revisão a posteriori não encontrou divergências relevantes (ver Conformidade).
- O teste de fumaça de Recife não capturou o skeleton: o script de observação encerrou na primeira iteração porque o resultado anterior ainda estava na tela. A substituição dos dados por Recife foi verificada (local "Recife, Pernambuco", 4 `.stat`, 7 `.day`, 24 `.pt`, sem `.skel` residual, `aria-busy` ausente). O skeleton durante a consulta foi observado na busca por Curitiba.

## Defeitos de Outras Tasks

Nenhum.

## ✅ Destaques Positivos

- O skeleton reaproveita `Chip` e `Icon`, e o markup dos blocos espelha `CurrentCard`, `StatsGrid`, `WeeklyCard` e `DayCard`, sem alturas fixas.
- `selectPanel` é uma função pura de decisão, e `renderPanel` isola a escolha de componente.
- O `aria-hidden` foi aplicado a cada bloco decorativo do skeleton, e não a um wrapper, o que preserva o `gap` do `.dashboard`.
- A suíte de `AppFeedback` cobre carregamento, conclusão, erro com dados preservados e nova tentativa.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Convenções da linguagem do projeto | ✅ |
| Contratos de interface (APIs, mensagens) | ✅ (sem mudança de contrato) |
| Logging | ✅ (não aplicável) |
| Interface de usuário | ⚠️ (skeleton sem ícone placeholder; ver menores) |
| Testes | ✅ |

## Checagens Estáticas

Comando: `cd frontend && npm run lint`
Linha de base (antes da task): limpa
Resultado final: limpa
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): nenhum

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: nenhuma | lidas depois (código revisto contra elas): nenhuma | nenhuma aplicável para o escopo de markup já estabelecido
MCPs do projeto: usados: playwright (ui-testing) para o teste de fumaça; mcp-api-test (api-testing) não usado nesta task, pois a task é de interface; context7 não usado

## Recomendações

1. No QA, avaliar se o skeleton de ícone grande merece um placeholder visual, se o design permitir.
2. Garantir que a verificação de 375 px sem rolagem horizontal, prevista em CA-05, seja feita no QA com a fixture.
3. Em futuras tasks de UI, registrar a leitura das skills de teste antes da implementação, conforme Step 2.

## Veredito

Task 14.0 concluída. Testes passando, lint limpo, `tasks.md` e subtarefas marcadas, smoke de Curitiba e Recife verificado no navegador. Próximo passo: task 15.0. Itens menores acima ficam para o QA.
