# Tarefa 8.0: Frontend — DailyForecast

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementar os cards horizontais de previsão dos próximos 7 dias, cada um exibindo temperatura mínima/máxima com barras visuais, precipitação diária e ícone da condição climática. Usa o componente WeatherIcon da tarefa 6.

<requirements>
- RF-16: Exibir temperatura mínima e máxima de cada dia
- RF-17: Exibir precipitação diária
- RF-18: Cada card contém barras visuais de mínima/máxima
- RF-20: Cores dinâmicas conforme condição climática
- Cards horizontais com layout scrollável em mobile
- Uso de WeatherIcon para ícone de cada dia
- Design system conforme `frontend/DESIGN.md`
- Nenhum comentário no código
</requirements>

## Subtarefas

- [x] 8.1 Implementar `frontend/src/components/DailyForecast.jsx` — cards de 7 dias com barras min/max
- [x] 8.2 Criar CSS do componente (cards, barras, scroll horizontal em mobile)
- [x] 8.3 Testes: renderização dos 7 dias, barras min/max, dados corretos

## Detalhes de Implementação

### DailyForecast.jsx
- Props: `dailyData` (objeto `daily` do payload com `time`, `weather_code`, `temperature_2m_max`, `temperature_2m_min`, `uv_index_max`, `precipitation_sum`)
- Renderiza lista horizontal de 7 cards, um por dia
- Cada card contém:
  - Dia da semana (formatado a partir de `daily.time[i]`) — ex: "Seg", "Ter"
  - WeatherIcon com `code={daily.weather_code[i]}` e `isDay={true}`
  - Barra visual de temperatura: gradiente entre min e max com marcadores
    - Largura proporcional à posição entre a min global e max global da semana
    - Cor: gradiente Lavender Glow a tom mais quente
  - Temperatura: "16° / 27°" (min/max)
  - Precipitação: ícone + valor em mm
- Layout responsivo: scroll horizontal em mobile (<768px), grid em desktop
- Estilização: cards com fundo branco, borda Parchment (`#dcd7d3`), 16px border-radius

### Barra visual de temperatura
- Calcular min global e max global da semana para escala
- Cada barra: `width` proporcional à posição do valor na escala
- Gradiente CSS do ponto min ao ponto max
- Marcadores nos extremos com valores

## Critérios de Sucesso

- 7 cards renderizados, um para cada dia
- Cada card exibe dia da semana, ícone, temperaturas min/max e precipitação
- Barra visual de temperatura proporcional à escala da semana
- Layout responsivo: scroll horizontal em mobile
- Cards seguem design system
- Todos os testes passam
- Zero comentários no código

## Testes da Tarefa

- [ ] Teste de renderização: 7 cards com dados mock
- [ ] Teste de barra de temperatura: proporções corretas
- [ ] Teste de responsividade: layout se adapta

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/components/DailyForecast.jsx` (criar)
- `frontend/src/components/DailyForecast.css` (criar)
- `frontend/src/__tests__/DailyForecast.test.jsx` (criar)
- `frontend/src/components/WeatherIcon.jsx` (dependência — tarefa 6)
- `frontend/src/utils/weatherCodes.js` (dependência — tarefa 3)
- `frontend/DESIGN.md` (referência — leitura obrigatória)
