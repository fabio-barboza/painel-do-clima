# Tarefa 12.0: Gráfico de previsão por hora

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Entrega o card de previsão por hora com o gráfico SVG em React puro: camadas, série de precipitação, desenho animado e interação com guia, ponto de destaque e tooltip.

**Depende de:** tarefas 9.0 e 11.0.

<requirements>
- Requisitos do PRD atendidos: RF-22, RF-23, RF-24, RF-25, RF-26, RF-27, RF-43 (gráfico com tooltip) e RF-45 (desenho da linha, `ping`).
- A seção deve ficar idêntica ao trecho citado de `painel.html`: estrutura, classes, ids, SVG, animações e interações.
- Os dados vêm sempre do backend, nunca dos valores de exemplo do protótipo.
- Nenhum valor novo de CSS: esta tarefa usa apenas `index.css` e `additions.css` da tarefa 3.0.
- A interação funciona também com `prefers-reduced-motion`. O comportamento de `painel.html`, que a desativa nesse modo, não é reproduzido.
- O marcador "agora" usa a hora de `current.time`, nunca `new Date()`.
- Sem biblioteca de gráficos.
</requirements>

## Subtarefas

- [x] 12.1 Criar `src/components/HourlyCard.jsx` com `.card-head`, `.chart-legend`, `.chart-hint`, `useReveal` e `--d:.16s`.
- [x] 12.2 Criar `src/components/HourlyChart.jsx` com as camadas na ordem da TechSpec.
- [x] 12.3 Implementar o desenho com `useLayoutEffect`, `getTotalLength()` e dois `requestAnimationFrame`, cancelados no cleanup.
- [x] 12.4 Implementar `onMouseMove`, `onMouseLeave`, `onTouchStart`, `onTouchMove` e `onTouchEnd`, sempre ativos.
- [x] 12.5 Implementar o tooltip `14h · <b>26°C</b> · 0,2 mm · agora`, com `left` limitado pela largura real.
- [x] 12.6 Compor `HourlyCard` em `src/components/Dashboard.jsx`, como segunda coluna de `.grid-main`.
- [x] 12.7 Escrever os testes de unidade e de integração.

## Detalhes de Implementação

**Referência em `painel.html`**

| Seletor | Linhas | Componente |
|---|---|---|
| `#chartCard`, `.card-head`, `.chip.plain`, `.dotline`, `.chart-hint` | 559–569 (`--d:.16s`) | `HourlyCard` |
| `#chartWrap` | 567 | `HourlyChart` |
| Pontos `.pt` | 714–716 (JS) | `HourlyChart` |
| `#chartSvg`, `lineGrad`, `areaGrad`, camadas, `.tip` | 718–738 (JS) | `HourlyChart` |
| Desenho | 740–766 (JS) | `HourlyChart` |
| Guia, ponto e tooltip | 773–803 (JS) | `HourlyChart` |
| Estilos do gráfico e do tooltip | 277–314 (CSS) | Já em `index.css` |

Ordem das camadas: grade e rótulos, barras de precipitação, área, linha, marcador "agora", pontos, guia, ponto de destaque.

As adições autorizadas são `rect.precip-bar`, a legenda "Precipitação (mm)" em `.chip` com `.dotline.rain`, e a precipitação no tooltip.

Ver na `techspec.md`: "Gráfico", "Interação (RF-25, RF-26)", "Desenho" e "Derivações no frontend".

## Critérios de Sucesso

- `#chartCard` idêntico às linhas 559–569, e o SVG idêntico às linhas 718–738 para os elementos existentes: classes, ids, `viewBox`, gradientes, `aria-label` e ordem.
- Precipitação adicionada sem remover nem deslocar a série de temperatura.
- A linha é desenhada, e área, pontos e barras aparecem com os tempos do arquivo; a animação só começa com o card revelado.
- Guia, ponto de destaque e tooltip aparecem com mouse e toque, inclusive com `prefers-reduced-motion`.
- Tooltip não sai do card em 375px.
- "agora" fica na hora local da cidade consultada.
- Nenhum valor de CSS novo foi criado nesta tarefa.

## Testes da Tarefa

- [x] Testes de unidade: `HourlyChart` com a fixture renderiza 24 `.pt`, camadas na ordem, gradientes e ids; tooltip com mouse e toque, com e sem movimento reduzido; temperatura negativa, constante e precipitação zero sem `NaN`; cancelamento dos frames no cleanup.
- [x] Testes de integração: `App` com `fetch` simulado exibe o card ao lado de `CurrentCard`, e `.show` é aplicado após a revelação.
- [x] Teste de fumaça: com frontend e backend no ar e sem mocks, via Playwright MCP, pesquisar "Curitiba" desenha o gráfico com dados reais, e passar o mouse mostra guia, ponto e tooltip com hora, temperatura e precipitação. Cobre também o fluxo da tarefa 11.0.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `painel.html`
- `frontend/src/components/HourlyCard.jsx`, `frontend/src/components/HourlyChart.jsx`
- `frontend/src/components/Dashboard.jsx`
- `frontend/src/lib/chartGeometry.js`
- `frontend/src/__tests__/`
