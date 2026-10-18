# Tarefa 5.0: Utilitários (weatherCode) e cliente de API (weatherApi)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Cria a camada de dados do frontend: `src/utils/weatherCode.js` (mapeamento de códigos WMO → categoria, labels PT-BR, tema e formatadores de data/hora) e `src/services/weatherApi.js` (único ponto de `fetch` do painel, com `cache: 'no-store'` obrigatório e base URL de `VITE_API_URL` — garante as restrições do PRD de "frontend nunca consome Open-Meteo" e "zero cache HTTP").

<requirements>
- `categorizeWeatherCode(code: number)` → `'clear' | 'partly' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'thunder'` segundo a tabela exata da techspec ("Mapeamento código WMO → categoria")
- `getTheme(category: string)` → `'clear' | 'cloudy' | 'rain'`
- `getWeatherLabelPt(code: number)` → descrição em PT-BR
- `formatHour(isoTime: string)` → `"14:00"`; `formatDayPt(isoDate: string)` → `"seg., 19/10"`
- `fetchWeather(query: { city?: string, lat?: number, lon?: number }): Promise<WeatherResponse>` — `GET ${VITE_API_URL}/api/weather?...` com **`cache: 'no-store'` em toda chamada** (regra de produto); não-2xx → throws `WeatherApiError { status, code, message }`
- `VITE_API_URL` lida de `import.meta.env` (dev: `http://localhost:3000` via `frontend/.env.local`)
- Sem comentários em código novo (D13)
</requirements>

## Subtarefas

- [x] 5.1 Implementar mapeamento WMO → categoria (tabela completa da techspec)
- [x] 5.2 Implementar `getTheme` (categoria → tema)
- [x] 5.3 Implementar labels PT-BR por código WMO
- [x] 5.4 Implementar formatadores (`formatHour`, `formatDayPt`)
- [x] 5.5 Implementar `WeatherApiError` + `fetchWeather` (montagem de URL, `cache: 'no-store'`, mapeamento de erros não-2xx)
- [x] 5.6 Criar `frontend/.env.local` com `VITE_API_URL=http://localhost:3000` (fora do Git)
- [x] 5.7 Criar testes de unidade dos utilitários e do cliente (ver "Testes da Tarefa")

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): "Interfaces Principais" (assinaturas frontend), "Modelos de Dados" (tabela WMO → categoria e tema; `WeatherResponse`), "Pontos de Integração" (estratégia de comunicação: URL absoluta via `VITE_API_URL`, sem proxy) e "Restrições" do PRD (zero cache: `cache: 'no-store'` em todo `fetch`).

## Critérios de Sucesso

- Todos os códigos WMO da tabela da techspec mapeiam para categoria/tema/label corretos
- `formatHour` e `formatDayPt` produzem saída PT-BR (formatos exatos acima)
- `fetchWeather` monta a URL a partir de `VITE_API_URL` e usa `cache: 'no-store'` em TODA chamada
- Não-2xx (400/404/500) e falha de rede → `WeatherApiError` com `status`, `code`, `message`
- `frontend/.env.local` criado (não versionado)
- Suíte de testes verde (`cd frontend && npm run test -- run`)
- Sem comentários em código novo (D13)

## Testes da Tarefa

- [x] Testes de unidade: `frontend/src/__tests__/weatherCode.test.js` — mapeamento completo de categorias, labels PT-BR, temas e formatadores
- [x] Testes de integração (cliente ↔ contrato da API): `frontend/src/__tests__/weatherApi.test.js` — fetch mockado: URL montada com `VITE_API_URL`; **`cache: 'no-store'` presente em toda chamada**; mapeamento de erros (400/404/500/rede)

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/utils/weatherCode.js` (novo)
- `frontend/src/services/weatherApi.js` (novo)
- `frontend/.env.local` (novo, fora do Git — `VITE_API_URL`)
- `frontend/src/__tests__/weatherCode.test.js` (novo)
- `frontend/src/__tests__/weatherApi.test.js` (novo)
