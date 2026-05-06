# Tarefa 3.0: Frontend — Setup, Cliente API e Utilitários

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Preparar o ambiente do frontend: instalar dependências (`chart.js`, `react-chartjs-2`), configurar o proxy do Vite para `/api`, criar o cliente HTTP para o backend (`weatherApi.js`) e o utilitário de mapeamento de códigos WMO (`weatherCodes.js`). Estas são as fundações para todos os componentes futuros.

<requirements>
- RF-02: Frontend chama `GET /api/weather?city=<nome>` via weatherApi
- RF-05: Frontend envia coordenadas ao backend via weatherApi
- Cliente HTTP com métodos `fetchByCity(city)` e `fetchByCoords(lat, lon)`
- Utilitário weatherCodes com mapeamento completo de WMO codes (0-99) → labels, nomes de ícones e cores dinâmicas
- Vite proxy para `/api` em desenvolvimento (evitar CORS)
- Instalar `chart.js` e `react-chartjs-2`
- Nenhum comentário no código
</requirements>

## Subtarefas

- [x] 3.1 Instalar dependências: `chart.js`, `react-chartjs-2`
- [x] 3.2 Configurar proxy em `frontend/vite.config.js` para redirecionar `/api` → `http://localhost:3000`
- [x] 3.3 Implementar `frontend/src/services/weatherApi.js` — cliente HTTP para o backend
- [x] 3.4 Implementar `frontend/src/utils/weatherCodes.js` — mapa de códigos WMO
- [x] 3.5 Testes unitários de `weatherApi.js` — mock de fetch (sucesso cidade, sucesso coords, erro 404, erro de rede)
- [x] 3.6 Testes unitários de `weatherCodes.js` — mapeamento de códigos WMO conhecidos

## Detalhes de Implementação

### vite.config.js
- Adicionar `server.proxy` para redirecionar `/api` → `http://localhost:3000`
- Manter configuração existente do plugin React

### weatherApi.js
- Exportar objeto `weatherApi` com dois métodos:
  - `fetchByCity(city)` → `fetch(/api/weather?city=${encodeURIComponent(city)})`
  - `fetchByCoords(lat, lon)` → `fetch(/api/weather?lat=${lat}&lon=${lon})`
- Ambos fazem parse do JSON e verificam `response.ok` — se não, extrair mensagem de erro do body
- Referência: seção "Interfaces Principais" da techspec.md

### weatherCodes.js
- Exportar objeto `weatherCodes` com:
  - `getLabel(code)` → string (ex: "Céu limpo", "Chuva moderada")
  - `getIconName(code)` → string (ex: "clear", "rain", "snow")
  - `getThemeColor(code)` → string hex (cor dinâmica para o hero — azul para céu limpo, cinza para nublado, etc.)
- Mapear todos os códigos WMO (0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99)
- Referência: seção "Interfaces Principais" da techspec.md e documentação WMO

## Critérios de Sucesso

- `chart.js` e `react-chartjs-2` instalados sem erros
- Vite proxy redireciona `/api/*` para o backend
- `weatherApi.fetchByCity("São Paulo")` retorna payload correto
- `weatherApi.fetchByCoords(-23.55, -46.63)` retorna payload correto
- `weatherApi` lança erro com mensagem apropriada para 404 e erros de rede
- `weatherCodes.getLabel(0)` retorna "Céu limpo"
- Todos os testes unitários passam
- Zero comentários no código

## Testes da Tarefa

- [x] Testes unitários de `weatherApi.js`: sucesso por cidade, sucesso por coordenadas, erro 404, erro de rede
- [x] Testes unitários de `weatherCodes.js`: labels, iconName e themeColor para códigos WMO conhecidos

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/vite.config.js` (modificar)
- `frontend/package.json` (modificar — novas dependências)
- `frontend/src/services/weatherApi.js` (criar)
- `frontend/src/utils/weatherCodes.js` (criar)
- `frontend/src/__tests__/weatherApi.test.js` (criar)
- `frontend/src/__tests__/weatherCodes.test.js` (criar)
