# Tarefa 12.0: WeeklyForecast (7 dias)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Cria `frontend/src/components/WeeklyForecast.jsx` — a previsão dos próximos 7 dias (FR-10/FR-11/FR-12 do PRD): 7 cards comparativos, cada um com dia (PT-BR), ícone do clima, **indicador gráfico de variação mín/máx** (barra de intervalo) e **volume de chuva apresentável de forma comparativa** entre os dias.

<requirements>
- 7 cards (um por dia) com: dia formatado em PT-BR (`formatDayPt`), ícone do clima (`WeatherIcon` pela categoria do `weather_code` do dia), temperatura mínima e máxima (°C) e volume de chuva (mm)
- Indicador gráfico de variação mín/máx: **barra de intervalo** (FR-11) — posição/altura relativas a uma escala sensata (ex.: intervalo da semana)
- Volume de chuva comparável ao longo dos 7 dias (FR-12) — indicador visual proporcional (ex.: mini-barra ou gota proporcional)
- View model `daily7` (`[{ date, weekday, weatherCode, tMin, tMax, precipitation }]`, derivada de `daily`)
- Acessibilidade: labels para leitores de tela nos indicadores gráficos de mín/máx (requisito do PRD)
- Responsivo (cards se adaptam a mobile/tablet/web)
- Sem comentários em código novo (D13)
</requirements>

## Subtarefas

- [x] 12.1 Derivar a view model `daily7` (7 pontos: `date`, `weekday`, `weatherCode`, `tMin`, `tMax`, `precipitation`)
- [x] 12.2 Implementar o card do dia com barra de intervalo mín/máx
- [x] 12.3 Implementar o indicador de volume de chuva comparativo
- [x] 12.4 Implementar `WeeklyForecast.jsx` (7 cards, layout responsivo)
- [x] 12.5 Integrar a previsão semanal na área de sucesso do `App.jsx` (substituir o skeleton correspondente)
- [x] 12.6 Criar testes de unidade do componente (ver "Testes da Tarefa")

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): "Arquitetura do Sistema" (tabela frontend — `WeeklyForecast.jsx`: 7 cards com indicador de variação mín/máx e volume de chuva) e "Modelos de Dados" (view model `daily7`). FR-10, FR-11 e FR-12 do PRD definem o comportamento; os requisitos de acessibilidade do PRD cobrem os labels dos indicadores gráficos.

## Critérios de Sucesso

- 7 cards renderizados (um por dia) com dia em PT-BR
- Barra de intervalo reflete a variação mín/máx de cada dia
- Volume de chuva visível e comparável entre os 7 dias
- Ícone do clima correto por dia (categoria do `weather_code`)
- Labels acessíveis nos indicadores
- Layout responsivo nos 3 contextos
- Suíte de testes verde (`cd frontend && npm run test -- run`)
- Sem comentários em código novo (D13)

## Testes da Tarefa

- [x] Testes de unidade: `frontend/src/__tests__/WeeklyForecast.test.jsx` — 7 cards renderizados; mín/máx corretos por dia (barra de intervalo); volume de chuva presente e comparativo

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/components/WeeklyForecast.jsx` (novo)
- `frontend/src/App.jsx` (modificar — integrar a previsão semanal)
- `frontend/src/__tests__/WeeklyForecast.test.jsx` (novo)
