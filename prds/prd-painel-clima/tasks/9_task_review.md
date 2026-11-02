# Review: Task 9.0 - Card de condições atuais

**Revisor**: AI Code Reviewer
**Data**: 2026-11-02
**Arquivo da task**: 9_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Entregues o `CurrentCard` (local, indicador de atualização, ícone animado, temperatura com contagem, condição e chips de máxima, mínima, sensação e precipitação), o `WeatherIcon` por grupo de condição, o `Chip`, o `Dashboard` com `.grid-main` e o hook `useCountUp`. O `App` renderiza o `Dashboard` quando `status` é `ready`. Os dados vêm sempre da resposta do backend, sem valores de exemplo do protótipo. Nenhum valor novo de CSS foi criado: só classes já existentes em `index.css` e `additions.css`. Avaliação geral: boa qualidade, aderente à TechSpec.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/hooks/useCountUp.js` | ✅ OK | 0 |
| `frontend/src/components/WeatherIcon.jsx` | ✅ OK | 0 |
| `frontend/src/components/Chip.jsx` | ✅ OK | 0 |
| `frontend/src/components/CurrentCard.jsx` | ✅ OK | 0 |
| `frontend/src/components/Dashboard.jsx` | ✅ OK | 0 |
| `frontend/src/App.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/useCountUp.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/WeatherIcon.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/Chip.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/CurrentCard.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/Dashboard.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/AppDashboard.test.jsx` | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

- `frontend/src/hooks/useCountUp.js`: ao trocar o alvo sem desmontar o componente, o valor anterior permanece por até 450 ms antes da nova contagem. Mitigado porque `Dashboard` só é montado com `status === 'ready'`, e a cada nova consulta o componente desmonta durante o carregamento. Sem correção nesta task.
- `frontend/src/components/Dashboard.jsx`: a segunda coluna de `.grid-main` fica vazia até a tarefa 12.0. Transitório, previsto em `9_task.md`.

## Defeitos de Outras Tasks

Nenhum. O teste de fumaça com a API real (Curitiba) confirmou os valores da tarefa 8.0 (formatação, código WMO 95 para `i-storm`, precipitação `0,2 mm`) sem divergência.

## ✅ Destaques Positivos

- `CurrentCard` reproduz a estrutura, as classes, os ids e os textos fixos de `painel.html` (linhas 527–557). A única adição é o chip de precipitação, autorizado.
- `useCountUp` deriva o valor final durante o render com `reduced` por inicializador preguiçoso, sem `setState` síncrono em efeito, conforme o requisito de lint.
- Campos `null` aparecem como `–`, sem sinal de grau.
- Testes cobrem temperatura negativa, movimento reduzido, códigos meteorológicos e nulos.

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
Resultado final: limpa (0 erros)
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): nenhum

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: react-testing, vercel-react-best-practices, vitest | lidas depois: nenhuma | nenhuma aplicável restante (frontend-design e vercel-composition-patterns não aplicáveis: o visual é definido por `painel.html`)
MCPs do projeto: usados: playwright (ui-testing) para o teste de fumaça; mcp-api-test (api-testing) para ler a resposta de `GET /api/weather?city=Curitiba`; context7 (documentation) não consultado nesta task, pois as APIs usadas já estavam no código e na TechSpec

## Testes executados

- Backend (`cd backend && npm test`): 72/72 passando, 6 suítes.
- Frontend (`cd frontend && npm test -- run`): 240/240 passando, 25 arquivos. Inclui os 26 novos testes desta task.
- Frontend lint (`cd frontend && npm run lint`): 0 erros.
- Teste de fumaça (ui-testing via Playwright MCP, sem mocks, backend e frontend no ar): busca "Curitiba" exibe o card, sem `EmptyState`. Valores comparados com a resposta real de `/api/weather`:

| Campo | Tela | API |
|-------|------|-----|
| Local | Curitiba, Paraná | Curitiba, Paraná |
| Temperatura | 25° | 24.5 (arredondado) |
| Máxima | 26° | 26 |
| Mínima | 16° | 16.4 (arredondado) |
| Sensação | 27° | 27.1 (arredondado) |
| Precipitação | 0,2 mm | 0.2 |
| Condição | Trovoada (`#i-storm`) | código 95 |

Evidência: `prds/prd-painel-clima/task-screenshots/task-9-card-curitiba.png` (1280 px).

Escopo do smoke: somente o fluxo principal de sucesso desta task, em 1280 px. Verificação visual em 768 e 375 px, CA-01 e CA-02 ficam para o QA.

## Recomendações

1. Revisar, no QA, a contagem da temperatura em 375 px e a legibilidade do chip de precipitação.
2. Quando a tarefa 12.0 entrar, avaliar se `Dashboard` deve receber `key` para reiniciar a contagem em trocas de alvo sem desmontagem.

## Veredito

APROVADO COM OBSERVAÇÕES. Nenhum problema crítico ou maior. A tarefa 9.0 está concluída com testes passando e checkboxes marcados. Próximo passo: tarefa 10.0.
