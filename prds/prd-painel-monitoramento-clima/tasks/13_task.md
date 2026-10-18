# Tarefa 13.0: Geolocalização (locate + botão + erros de permissão)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Completa o fluxo de geolocalização (história 5 do PRD; FR-13/FR-14): `locate()` no hook `useWeather` usando `navigator.geolocation.getCurrentPosition`, o botão de geolocalização no `SearchBar` e o tratamento amigável de permissão negada/indisponível — a busca manual por cidade continua disponível em todos os casos. O frontend envia as coordenadas ao backend via `?lat=&lon=` (decisão D3 — sem reverse geocoding).

<requirements>
- `locate()` no `useWeather`: `navigator.geolocation.getCurrentPosition`; sucesso → busca via `fetchWeather({ lat, lon })` (fluxo da Tarefa 3.0, sem geocoding)
- Falhas de geolocalização (`PermissionDeniedError`, `PositionUnavailableError`, `TimeoutError`) → estado `error` com mensagem **amigável** orientando a busca manual por cidade (FR-14); a busca por cidade continua disponível
- Estado `loading` visível durante a geolocalização
- Botão de geolocalização no `SearchBar` (ícone + label acessível, foco visível, navegação por teclado)
- Guarda contra resposta obsoleta se aplica também à geolocalização (D12)
- Sem comentários em código novo (D13)
</requirements>

## Subtarefas

- [x] 13.1 Implementar `locate()` no `useWeather` (getCurrentPosition → sucesso → busca por coordenadas)
- [x] 13.2 Implementar o tratamento de erros de permissão/indisponibilidade (mensagem amigável, busca manual intacta)
- [x] 13.3 Adicionar o botão de geolocalização ao `SearchBar` (prop `onLocate` + estado de carregamento)
- [x] 13.4 Ligar o botão ao `App.jsx` (prop `onLocate` → `locate`)
- [x] 13.5 Estender os testes do hook e do componente (ver "Testes da Tarefa")

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): "Pontos de Integração" (geolocalização do navegador — `getCurrentPosition`, contexto seguro/localhost, tipos de erro) e "Interfaces Principais" (assinatura de `locate` no `useWeather`), além da decisão D3 (`city` XOR `lat/lon` — geolocalização entrega coordenadas, não nome). FR-13 e FR-14 do PRD e o caso extremo "Permissão de geolocalização negada ou indisponível".

## Critérios de Sucesso

- Clicar no botão de geolocalização → busca por coordenadas (payload 200 com `location` sem `name`)
- Permissão negada → mensagem amigável + busca manual por cidade continua funcional
- Estado `loading` visível durante a geolocalização
- Botão acessível (label, foco visível, teclado)
- Busca obsoleta descartada também no fluxo de geolocalização (D12)
- Suíte de testes verde (`cd frontend && npm run test -- run`)
- Sem comentários em código novo (D13)

## Testes da Tarefa

- [x] Testes de unidade: `frontend/src/__tests__/useWeather.test.js` (estender) — geolocalização permitida → busca por coordenadas; geolocalização negada → erro com mensagem amigável (tipo de erro de permissão)
- [x] Testes de unidade: `frontend/src/__tests__/SearchBar.test.jsx` (estender) — botão de localização presente, acessível e invoca `onLocate`

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/hooks/useWeather.js` (modificar — `locate()`)
- `frontend/src/components/SearchBar.jsx` (modificar — botão de geolocalização)
- `frontend/src/App.jsx` (modificar — ligar `onLocate`)
- `frontend/src/__tests__/useWeather.test.js` (estender)
- `frontend/src/__tests__/SearchBar.test.jsx` (estender)
