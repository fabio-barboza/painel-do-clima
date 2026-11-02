# Tarefa 7.0: Cliente da API e estado da consulta

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Conecta o frontend ao backend: cliente `fetchWeather`, hook `useWeather` (estado, concorrência, geolocalização e nova tentativa) e ligação com `SearchBar` e `Notice` em `App`. Cria também a fixture de testes reutilizada pelas tarefas seguintes e pelo QA.

**Depende de:** tarefas 2.0 e 6.0.

<requirements>
- Requisitos do PRD atendidos: RF-01, RF-09, RF-13, RF-14, RF-15, RF-36, RF-37 e RF-38, além das restrições de cache, comunicação e privacidade.
- Toda chamada `fetch` usa `cache: 'no-store'`.
- O frontend chama somente o backend, por `VITE_API_URL`, com padrão `http://localhost:3000`.
- Nenhuma consulta é disparada ao abrir a página.
- Busca vazia ou só com espaços não chama o backend.
- Somente a consulta mais recente altera o estado.
- Coordenadas ficam apenas em memória.
- A fixture existe só em `src/__tests__/`: nenhum valor de exemplo de `painel.html` entra no código de produção.
- Sem dependências npm novas.
</requirements>

## Subtarefas

- [x] 7.1 Criar `src/api/weather.js` com `fetchWeather(query, { signal })` e `WeatherApiError { kind }`.
- [x] 7.2 Criar `src/hooks/useWeather.js`, com `requestId`, `AbortController` e timeout de 20 s.
- [x] 7.3 Implementar a geolocalização com `{ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }`.
- [x] 7.4 Implementar `retry()`, repetindo a última consulta guardada em `useRef`.
- [x] 7.5 Mapear cada situação para `notice`, conforme a tabela da TechSpec.
- [x] 7.6 Calcular `locationLabel`: `name, region` por nome, "Sua localização" por coordenadas.
- [x] 7.7 Ligar `SearchBar` e `Notice` em `src/App.jsx`. `EmptyState` aparece apenas com `status: 'idle'` e sem dados.
- [x] 7.8 Criar `src/__tests__/fixtures/weather.js`, com `HOURLY` e `WEEK` de `painel.html` e início em `2026-08-16`.
- [x] 7.9 Escrever os testes de unidade e de integração.

## Detalhes de Implementação

**Referência em `painel.html`:** comportamento de busca e localização nas linhas 825–837 (JS). O valor padrão "Curitiba, PR" não é reproduzido (RF-09). `HOURLY` (627) e `WEEK` (628–636) servem somente à fixture.

Ver na `techspec.md`: "Interfaces Principais" (Frontend), "Concorrência em `useWeather`", "Regras de interação", tabela de `notice`, "Comunicação e portas" e "Testes Unidade".

Em nova busca, `data` permanece no estado e, se a consulta falhar, o painel volta para a última consulta bem-sucedida. A exibição disso em tela é da tarefa 14.0; aqui só o comportamento do hook é entregue.

Como os blocos de dados só chegam a partir da tarefa 9.0, nesta tarefa `App` não exibe dados em `ready`.

## Critérios de Sucesso

- Busca por nome e por coordenadas chegam a `GET /api/weather`, com `cache: 'no-store'`.
- O navegador não faz nenhuma requisição à Open-Meteo.
- A tela não dispara consulta ao abrir.
- Consultas sobrepostas: a resposta antiga é descartada, inclusive quando a geolocalização retorna depois de uma busca por nome.
- Um pedido de permissão ignorado não trava a busca por nome.
- Cada situação da tabela exibe a mensagem exata, e "Tentar novamente" aparece somente nos casos de falha de comunicação.
- `npm run lint` passa, sem violações de `set-state-in-effect` e `refs`.

## Testes da Tarefa

- [x] Testes de unidade: `fetchWeather` com `fetch` simulado (`vi.stubGlobal`), URL, `cache: 'no-store'` e mapeamento de 400, 404, 502, rede e timeout; `useWeather` com busca vazia sem chamada, última consulta vence, manutenção dos dados em erro, nova tentativa e geolocalização negada.
- [x] Testes de integração: `App` com a fixture e `fetch` simulado, com estado vazio sem `fetch`, busca bem-sucedida, 404 com mensagem e falha com "Tentar novamente".
- [x] Teste de fumaça: com frontend e backend no ar e sem mocks, via Playwright MCP, pesquisar "Curitiba" gera `GET http://localhost:3000/api/weather?city=Curitiba` com 200 e nenhuma requisição à Open-Meteo em `browser_network_requests`.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `painel.html`
- `frontend/src/api/weather.js`
- `frontend/src/hooks/useWeather.js`
- `frontend/src/App.jsx`
- `frontend/src/__tests__/fixtures/weather.js`
