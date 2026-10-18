# Tarefa 11.0: HourlyChart (24h, Recharts)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Cria `frontend/src/components/HourlyChart.jsx` — o gráfico interativo das próximas 24 horas (FR-8/FR-9 do PRD) com **Recharts** (decisão D5): `ComposedChart` com `Line` (temperatura) + `Bar` (precipitação) + `Tooltip` customizado, em eixos duplos. Adiciona a dependência `recharts` ao frontend.

<requirements>
- Adicionar `recharts` como dependência do `frontend` (validar compatibilidade com React 19.2 na instalação — suposição da techspec)
- `ComposedChart` com `Line` (temperatura, °C) + `Bar` (precipitação, mm) e `ResponsiveContainer`
- 24 pontos da view model `hourly24` (`[{ hour, temperature, precipitation }]`, derivados de `hourly` — já limitado por `forecast_hours=24` no backend)
- Eixos duplos (temperatura à esquerda, precipitação à direita) com labels de unidade (°C / mm)
- **`Tooltip` customizado** interativo (hover e toque) mostrando hora, temperatura e precipitação do ponto (FR-9)
- Acessibilidade (mitiga o risco "Tooltip do Recharts inacessível" da techspec): labels acessíveis no tooltip + **alternativa textual no HTML** para os dados das 24h
- Responsivo (sem largura fixa)
- Sem comentários em código novo (D13)
</requirements>

## Subtarefas

- [x] 11.1 Instalar `recharts` em `frontend/` e validar compatibilidade com React 19.2 (build + testes)
- [x] 11.2 Derivar a view model `hourly24` (24 pontos: `hour`, `temperature`, `precipitation`)
- [x] 11.3 Implementar `HourlyChart.jsx` (ComposedChart, eixos duplos, Line + Bar)
- [x] 11.4 Implementar `Tooltip` customizado acessível (hora, temperatura, precipitação)
- [x] 11.5 Adicionar alternativa textual dos dados no HTML (a11y)
- [x] 11.6 Integrar o gráfico na área de sucesso do `App.jsx` (substituir o skeleton correspondente)
- [x] 11.7 Criar testes de unidade do componente (ver "Testes da Tarefa")

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): "Resumo Executivo" (Recharts para o gráfico de 24h), "Arquitetura do Sistema" (tabela frontend — `HourlyChart.jsx`: `ComposedChart` com Line + Bar + Tooltip customizado), "Modelos de Dados" (view model `hourly24`), "Considerações Técnicas" (decisão D5) e "Riscos Conhecidos" (tooltip inacessível → tooltip customizado + alternativa textual). FR-8 e FR-9 do PRD.

## Critérios de Sucesso

- Gráfico renderiza 24 pontos (linha de temperatura + barras de precipitação)
- Tooltip interativo (hover/toque) mostra hora, temperatura e precipitação
- Eixos com unidades (°C / mm)
- Alternativa textual dos dados presente no HTML
- Gráfico responsivo (sem largura fixa)
- Build (`npm run build`) e lint passam
- Suíte de testes verde (`cd frontend && npm run test -- run`)
- Sem comentários em código novo (D13)

## Testes da Tarefa

- [x] Testes de unidade: `frontend/src/__tests__/HourlyChart.test.jsx` — 24 pontos renderizados; tooltip customizado exibe temperatura e precipitação do ponto inspecionado

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/components/HourlyChart.jsx` (novo)
- `frontend/src/App.jsx` (modificar — integrar o gráfico)
- `frontend/package.json` (modificar — nova dependência `recharts`)
- `frontend/src/__tests__/HourlyChart.test.jsx` (novo)
