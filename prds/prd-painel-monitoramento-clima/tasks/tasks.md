# Resumo de Tarefas de Implementação de Painel de Monitoramento de Clima

**Feature:** `painel-monitoramento-clima`
**PRD de origem:** `../prd.md`
**Especificação técnica:** `../techspec.md`
**Data:** 2026-10-17

## Tarefas

### Backend (contrato para todo o frontend)

- [x] 1.0 Fundação do backend (env, no-cache, error handler, split app/index)
- [x] 2.0 Serviço Open-Meteo (geocoding + forecast com timeout)
- [x] 3.0 Rota `/api/weather` (city e lat/lon) + testes de integração

### Frontend — fundação

- [x] 4.0 Fundação de design (HTML pt-BR, tokens, temas, skeletons)
- [x] 5.0 Utilitários (weatherCode) e cliente de API (weatherApi)
- [x] 6.0 Hook `useWeather` (máquina de estados + guarda de obsoletas)

### Frontend — painel

- [x] 7.0 SearchBar (busca com feedback de carregamento)
- [x] 8.0 Casca do painel (App, Skeletons, ErrorState)
- [x] 9.0 WeatherIcon (SVGs animados por categoria)
- [x] 10.0 CurrentWeather + UVBar
- [x] 11.0 HourlyChart (24h, Recharts)
- [x] 12.0 WeeklyForecast (7 dias)
- [x] 13.0 Geolocalização (locate + botão + erros de permissão)

### E2E (Playwright)

- [x] 14.0 Infraestrutura E2E (mock server, global setup, primeira spec)
- [x] 15.0 E2E determinístico — busca por cidade
- [x] 16.0 E2E determinístico — geolocalização e erros + smoke real

### Documentação e ambiente

- [x] 17.0 Documentação final (README, .env.example, .gitignore)
