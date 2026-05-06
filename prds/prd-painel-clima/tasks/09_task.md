# Tarefa 9.0: Frontend — App.jsx Orquestração e Geolocalização

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Reescrever `App.jsx` como o componente orquestrador que integra todos os componentes: usa o hook `useWeather` para gerenciar estado, renderiza SearchBar, CurrentWeather, HourlyForecast, DailyForecast com os dados retornados, SkeletonLoader durante carregamento e ErrorMessage em caso de erro. Inclui integração de geolocalização do navegador.

<requirements>
- RF-04: Botão de geolocalização solicita permissão via `navigator.geolocation`
- RF-05: Ao obter localização, frontend chama backend com coordenadas
- RF-06: Se permissão negada, exibir mensagem sem bloquear uso manual
- RF-19: Skeleton loading durante carregamento
- RF-20: Cores dinâmicas conforme condição climática (hero muda de cor)
- RF-22: Seguir design system
- Fluxo principal: usuário abre `/` → painel direto, sem tela intermediária
- Orquestração: useWeather hook → SearchBar → CurrentWeather + HourlyForecast + DailyForecast
- Nenhum comentário no código
</requirements>

## Subtarefas

- [x] 9.1 Reescrever `frontend/src/App.jsx` — orquestração completa com useWeather e todos os componentes
- [x] 9.2 Implementar integração de geolocalização no fluxo do App
- [x] 9.3 Implementar hero dinâmico — cor muda conforme `weatherCodes.getThemeColor()`
- [x] 9.4 Atualizar `frontend/src/App.css` se necessário para estilos do App orquestrado
- [x] 9.5 Testes: fluxo completo (renderização inicial → busca → exibição de dados)
- [x] 9.6 Testes: fluxo de erro e retry, fluxo de geolocalização

## Detalhes de Implementação

### App.jsx (reescrita)
- Usar hook `useWeather()` para obter `{ data, loading, error, searchCity, searchCoords, retry }`
- Renderizar layout principal:
  1. **Hero section** (topo): gradiente Mysteria Purple (`#1b1938`) que muda de cor quando dados carregam (usa `weatherCodes.getThemeColor`)
  2. **SearchBar** dentro do hero: callbacks conectados ao hook
     - `onSearch={searchCity}`
     - `onGeoSearch={searchCoords}`
     - `onGeoError` → exibir toast/mensagem temporária
  3. **Estado loading**: renderizar SkeletonLoader (current + hourly + daily)
  4. **Estado error**: renderizar ErrorMessage com `onRetry={retry}`
  5. **Estado data**: renderizar CurrentWeather, HourlyForecast, DailyForecast com dados do payload
- Exibir nome da cidade ou "Sua localização" quando dados carregam (via `data.location.name` — se ausente, usar "Sua localização")
- Referência: seção "Fluxo principal" e "Fluxo alternativo — Geolocalização" do PRD

### Hero dinâmico
- Cor de fundo padrão: Mysteria Purple (`#1b1938`)
- Quando dados carregam: transição suave para `weatherCodes.getThemeColor(data.current.weather_code)`
- Implementar via CSS transition ou inline style dinâmico

### Geolocalização
- SearchBar já faz a integração com `navigator.geolocation` (tarefa 5)
- App apenas conecta o callback `searchCoords` ao SearchBar
- Se erro de permissão: exibir mensagem temporária (não bloqueia busca manual)
- Referência: seção "Decisões Principais" da techspec.md (Geolocalização sem reverse geocoding)

## Critérios de Sucesso

- Tela inicial exibe hero + SearchBar sem dados climáticos
- Busca por cidade funciona: loading → dados exibidos (current, hourly, daily)
- Busca por geolocalização funciona (com permissão)
- Geolocalização negada exibe mensagem mas não bloqueia
- Hero muda de cor conforme condição climática
- Retry após erro funciona
- Nome da cidade exibido ("Sua localização" se via coords)
- Layout responsivo completo
- Todos os testes passam
- Zero comentários no código

## Testes da Tarefa

- [ ] Teste de renderização inicial: hero + SearchBar sem dados
- [ ] Teste de fluxo de busca: simular busca → loading → dados exibidos
- [ ] Teste de fluxo de erro: simular erro → ErrorMessage exibida → retry
- [ ] Teste de geolocalização: mock de navigator.geolocation → dados carregados

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/App.jsx` (reescrever)
- `frontend/src/App.css` (atualizar se necessário)
- `frontend/src/__tests__/App.test.jsx` (criar)
- `frontend/src/hooks/useWeather.js` (dependência — tarefa 4)
- `frontend/src/components/SearchBar.jsx` (dependência — tarefa 5)
- `frontend/src/components/CurrentWeather.jsx` (dependência — tarefa 6)
- `frontend/src/components/HourlyForecast.jsx` (dependência — tarefa 7)
- `frontend/src/components/DailyForecast.jsx` (dependência — tarefa 8)
- `frontend/src/components/SkeletonLoader.jsx` (dependência — tarefa 5)
- `frontend/src/components/ErrorMessage.jsx` (dependência — tarefa 5)
- `frontend/src/utils/weatherCodes.js` (dependência — tarefa 3)
