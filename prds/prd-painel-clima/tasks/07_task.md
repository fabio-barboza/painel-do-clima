# Tarefa 7.0: Frontend — HourlyForecast (Chart.js)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementar o gráfico interativo de previsão horária usando Chart.js (via react-chartjs-2) com duplo eixo Y: temperatura no eixo esquerdo e precipitação no eixo direito. O gráfico exibe as próximas 24 horas e suporta interação por hover para detalhes.

<requirements>
- RF-13: Utilizar Chart.js para renderizar gráfico de linha/área
- RF-14: Gráfico exibe temperatura e precipitação por hora
- RF-15: Gráfico interativo (hover para detalhes)
- Duplo eixo Y: temperatura (esquerda) e precipitação (direita)
- Dados das próximas 24 horas do payload `hourly`
- Estilização conforme design system (cores Lavender Glow para temp, azul suave para precipitação)
- Responsivo: redimensiona com o container
- Nenhum comentário no código
</requirements>

## Subtarefas

- [x] 7.1 Implementar `frontend/src/components/HourlyForecast.jsx` — gráfico Chart.js com dual Y-axis
- [x] 7.2 Criar CSS do componente (container, responsividade)
- [x] 7.3 Testes: renderização do canvas, dados corretos, responsividade

## Detalhes de Implementação

### HourlyForecast.jsx
- Props: `hourlyData` (objeto `hourly` do payload com `time`, `temperature_2m`, `precipitation`)
- Usa react-chartjs-2 (`Line` component) com Chart.js
- Registrar componentes necessários do Chart.js: `CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler`
- Configuração:
  - `type: 'line'`
  - Dataset temperatura: eixo Y esquerdo (`yAxisID: 'y'`), cor Lavender Glow (`#cbb7fb`), preenchimento com gradiente, linha suave (`tension: 0.4`)
  - Dataset precipitação: eixo Y direito (`yAxisID: 'y1'`), cor azul suave, tipo barra ou área
  - Labels: horas formatadas (ex: "14:00") a partir de `hourly.time`
  - Tooltips: `interaction: { mode: 'index', intersect: false }`
  - Eixo Y esquerdo: "Temperatura (°C)"
  - Eixo Y direito: "Precipitação (mm)", grid desabilitada (`drawOnChartArea: false`)
  - `responsive: true`, `maintainAspectRatio: false`
- Referência: seção "Previsão por hora" do PRD e documentação Chart.js multi-axis line chart

### Responsividade
- Container com altura mínima (ex: 300px mobile, 400px desktop)
- Chart.js `responsive: true` cuida do redimensionamento automático

## Critérios de Sucesso

- Gráfico renderiza com duplo eixo Y (temperatura esquerda, precipitação direita)
- Labels do eixo X mostram horas formatadas
- Hover sobre o gráfico exibe tooltip com valores de temperatura e precipitação
- Dataset de temperatura usa cor Lavender Glow (`#cbb7fb`)
- Gráfico é responsivo e redimensiona com a janela
- Dados das 24 horas são exibidos corretamente
- Todos os testes passam
- Zero comentários no código

## Testes da Tarefa

- [ ] Teste de renderização: canvas do Chart.js está presente no DOM
- [ ] Teste de dados: componente recebe dados mock e renderiza sem erros
- [ ] Teste de responsividade: container se adapta a larguras diferentes

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/components/HourlyForecast.jsx` (criar)
- `frontend/src/components/HourlyForecast.css` (criar)
- `frontend/src/__tests__/HourlyForecast.test.jsx` (criar)
- `frontend/DESIGN.md` (referência — leitura obrigatória)
