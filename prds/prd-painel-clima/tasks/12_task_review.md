# Review: Task 12.0 - Gráfico de previsão por hora

**Revisor**: AI Code Reviewer
**Data**: 2026-11-02
**Arquivo da task**: 12_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Entregue a segunda coluna de `.grid-main` com o card `#chartCard` e o gráfico SVG em React puro. O gráfico tem as camadas na ordem da TechSpec (grade e rótulos, barras de precipitação, área, linha, marcador "agora", pontos, guia, ponto de destaque), desenho animado com `useLayoutEffect`, `getTotalLength()` e dois `requestAnimationFrame` cancelados no cleanup, e interação com mouse e toque sempre ativa. A série vem de `selectTodayHours` (já existente em `lib/format.js`), e o marcador "agora" usa `current.time`, sem `new Date()`. Nenhum valor de CSS novo foi criado; as classes usadas (`.precip-bar`, `.chart-legend`, `.dotline.rain`) já estavam em `additions.css`.

A avaliação geral é boa. Os testes passam (305 de 305 no frontend) e o lint está limpo. No smoke test com dados reais de Curitiba, o gráfico desenhou 24 pontos, área e 12 barras; o hover mostrou guia, ponto e tooltip; em 375px o tooltip ficou dentro do card e sem rolagem horizontal.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/components/HourlyChart.jsx` | ✅ OK | 1 (menor) |
| `frontend/src/components/HourlyCard.jsx` | ✅ OK | 0 |
| `frontend/src/components/Dashboard.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/HourlyChart.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/HourlyCard.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/AppHourly.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/Dashboard.test.jsx` | ✅ OK | 0 (asserção ajustada, ver abaixo) |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

- `frontend/src/components/HourlyChart.jsx`: a série de temperatura não filtra valores `null` vindos da Open-Meteo. Um `null` em `hourly.temperature_2m` geraria `NaN` na geometria (a especificação exibe `null` como `–` nos textos, mas o gráfico não tem como representar um ponto ausente). Não corrigido: o caso não aparece na API em uso e a correção mudaria a posição X dos pontos, o que é decisão de design. Registrado como observação para revisão futura.
- `frontend/src/components/HourlyChart.jsx`: alguns blocos das funções `useLineDrawing` e `useHourHover` têm linha em branco entre declarações. O `code-standards.md` pede ausência de linhas em branco dentro de funções; o restante do projeto (ex.: `useReveal.js`) também as usa, então a convenção local prevalece e nada foi alterado.

## Defeitos de Outras Tasks

Nenhum.

## ✅ Destaques Positivos

- Reutilização de `selectTodayHours` e `buildChartGeometry` já existentes, sem duplicar a derivação de dados.
- Cleanup de `requestAnimationFrame` coberto por teste que verifica o `cancelAnimationFrame` no unmount.
- Tooltip com `left` limitado por `max(56, largura/2)`, validado no navegador em 375px.
- Interação não depende de `prefers-reduced-motion`, como exigido pelo RF-26, e há teste específico para isso.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ (nomes sem abreviação, constantes nomeadas, funções com verbo) |
| Convenções da linguagem do projeto | ✅ (JSX, ESM, `*.test.jsx` em `src/__tests__/`) |
| Contratos de interface (APIs, mensagens) | ✅ (consumo de `GET /api/weather` com `cache: 'no-store'`, verificado no teste de integração) |
| Logging | ⚠️ não aplicável (nenhum log nesta task) |
| Interface de usuário | ✅ (idêntica às linhas 559–569 e 718–738 de `painel.html` para os elementos existentes; adições só as autorizadas) |
| Testes | ✅ (unidade, integração e smoke executados e passando) |

Ajuste de teste existente: `Dashboard.test.jsx` afirmava `grid.children` com comprimento 1. Passou a afirmar 2 e a posição de `#chartCard` como segundo filho. Justificativa: a própria task 12.6 exige o card como segunda coluna de `.grid-main`, então a asserção antiga contradizia o requisito.

## Checagens Estáticas

Comando: `cd frontend && npm run lint`
Linha de base (antes da task): limpa
Resultado final: limpa
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): nenhum

Suíte de testes do frontend: `cd frontend && npm test -- run`, 32 arquivos e 305 testes passando (linha de base anterior: 29 arquivos e 286 testes).

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: react-testing, vitest | nenhuma aplicável adicional. As skills foram consultadas pelo `.do/context.md` e pela lista nativa da sessão antes de qualquer alteração de código. A do `react-testing` foi lida parcialmente (trecho inicial com princípios de consulta e `fireEvent`); a biblioteca `user-event` e o MSW não estão no projeto e não foram usados, conforme a TechSpec.
MCPs do projeto: usados: playwright (ui-testing) no smoke test, com snapshot, hover, screenshot e avaliação de DOM em 1280px e 375px; context7 não foi necessário, pois a task não dependeu de biblioteca nova. Lacuna: `mcp-api-test` (api-testing) não foi usado nesta task; a verificação do endpoint foi feita com `curl` na checagem de saúde do serviço, pois a task não expõe API própria.

## Smoke test (registro)

- Pré-requisitos: backend em `http://localhost:3000` (`/health` 200, `GET /api/weather?city=Curitiba` 200 com `Cache-Control: no-store`) e frontend em `http://localhost:5173`, ambos iniciados por esta execução e encerrados ao final. Nenhum serviço preexistente foi tocado.
- Fluxo principal: busca "Curitiba" pelo campo de texto e botão "Pesquisar" no navegador real, com dados reais. Resultado: 24 `.pt`, `.area-path.show`, 12 `.precip-bar`, card com `in`.
- Hover no `#chartSvg`: tooltip `11h · 23°C · 0,0 mm` com opacidade 1 e guia visível.
- Divergência do roteiro: a captura com tooltip ativo não foi feita por causa da troca de foco entre ações do MCP. A evidência visual de 1280px mostra o gráfico completo sem tooltip, e o estado com tooltip foi confirmado por avaliação de DOM.
- Em 375px: tooltip entre 107 e 252 px, dentro do card (20 a 340 px), sem rolagem horizontal da página.
- Movimento reduzido não foi validado no smoke (apenas em teste unitário com `matchMedia` simulado).
- Evidência: `prds/prd-painel-clima/task-screenshots/task-12-hourly-chart-hover-1280.png`.

## Recomendações

1. Tratar `null` em `hourly.temperature_2m` no `HourlyChart` (filtrar ou representar a lacuna) quando a TechSpec definir a regra para ponto ausente.
2. Incluir o caso de movimento reduzido no smoke da task 13 ou no QA, usando `browser_emulate_media`.

## Veredito

APROVADO COM OBSERVAÇÕES. A task 12.0 atende aos requisitos RF-22 a RF-27, RF-43 (gráfico com tooltip) e RF-45 (desenho da linha; o pulso do marcador "agora" usa as classes `.now-ring` e `.now-dot` já existentes em `index.css`, sem keyframes novos). Não há bloqueio para a fila; as observações acima são de revisão futura e não exigem nova rodada de implementação.
