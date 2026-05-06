# Tarefa 6.0: Frontend — CurrentWeather + WeatherIcon

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementar os cards de clima atual (temperatura, umidade, vento, UV, precipitação) e os ícones SVG animados que representam as condições climáticas (mapeamento WMO code → SVG). Estes são os componentes centrais de exibição de dados do painel.

<requirements>
- RF-07: Exibir temperatura atual (°C)
- RF-08: Exibir umidade relativa (%)
- RF-09: Exibir velocidade do vento (km/h)
- RF-10: Exibir índice UV com barra visual em gradiente (verde a vermelho)
- RF-11: Exibir precipitação atual (mm)
- RF-12: Cards com ícones animados representando condição climática
- RF-20: Cores dinâmicas conforme condição climática
- Ícones como componentes SVG React com animações CSS (`@keyframes`)
- Mapeamento de WMO codes para ícones via `weatherCodes.js`
- Design system conforme `frontend/DESIGN.md`
- Nenhum comentário no código
</requirements>

## Subtarefas

- [x] 6.1 Implementar `frontend/src/components/WeatherIcon.jsx` — componente SVG animado por condição climática
- [x] 6.2 Implementar `frontend/src/components/CurrentWeather.jsx` — cards de clima atual com todos os dados
- [x] 6.3 Criar CSS específico dos componentes (módulo ou arquivo separado)
- [x] 6.4 Testes: renderização condicional dos dados, ícones corretos por WMO code, barra de UV

## Detalhes de Implementação

### WeatherIcon.jsx
- Props: `code` (WMO code), `isDay` (booleano)
- Usa `weatherCodes.getIconName(code)` para determinar qual SVG renderizar
- Condições principais: clear (sol/lua), partly_cloudy, cloudy, fog, drizzle, rain, heavy_rain, snow, thunderstorm
- Cada ícone é um SVG inline com animações CSS (ex: chuva com gotas caindo, sol com raios pulsando, nuvens flutuando)
- Animações via `@keyframes` — sem dependência de biblioteca externa
- Referência: seção "Decisões Principais" da techspec.md (SVGs animados via CSS)

### CurrentWeather.jsx
- Props: `data` (objeto `current` do payload), `weatherCode`, `isDay`
- Renderiza cards em grid com:
  - Temperatura: valor grande + "°C"
  - Umidade: valor + "%" + ícone
  - Vento: valor + "km/h" + ícone
  - UV Index: valor + barra visual em gradiente (verde → amarelo → vermelho, 0-11+ escala)
  - Precipitação: valor + "mm" + ícone
- WeatherIcon exibido em destaque (hero ou card principal)
- Cor dinâmica do hero conforme `weatherCodes.getThemeColor(weatherCode)`
- Estilização: cards com fundo branco, borda Parchment (`#dcd7d3`), 16px border-radius
- Layout responsivo: grid de 2 colunas mobile, 3-5 colunas desktop

## Critérios de Sucesso

- CurrentWeather renderiza todos os 5 dados (temperatura, umidade, vento, UV, precipitação)
- WeatherIcon renderiza SVG diferente para código WMO 0 (clear) vs 61 (rain)
- Barra de UV exibe gradiente correto (verde para UV baixo, vermelho para UV alto)
- Cards seguem design system (cores, border-radius, tipografia)
- Layout responsivo funciona em mobile e desktop
- Animações CSS dos ícones são suaves e funcionais
- Todos os testes passam
- Zero comentários no código

## Testes da Tarefa

- [ ] Testes do CurrentWeather: renderização de todos os dados, exibição correta de valores
- [ ] Testes do WeatherIcon: renderização para diferentes WMO codes (0, 3, 61, 95)
- [ ] Teste da barra de UV: gradiente renderizado corretamente

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/components/CurrentWeather.jsx` (criar)
- `frontend/src/components/WeatherIcon.jsx` (criar)
- `frontend/src/components/CurrentWeather.css` (criar)
- `frontend/src/__tests__/CurrentWeather.test.jsx` (criar)
- `frontend/src/__tests__/WeatherIcon.test.jsx` (criar)
- `frontend/src/utils/weatherCodes.js` (dependência — tarefa 3)
- `frontend/DESIGN.md` (referência — leitura obrigatória)
