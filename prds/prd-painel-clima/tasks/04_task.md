# Tarefa 4.0: Frontend — Hook `useWeather`

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementar o hook customizado `useWeather` que gerencia todo o estado da busca de clima: dados, carregamento e erro. Este hook é o centro nervoso do frontend — todos os componentes de UI dependem dele para obter dados e estados.

<requirements>
- Hook retorna `{ data, loading, error, searchCity, searchCoords, retry }`
- `searchCity(city)` dispara busca por nome de cidade
- `searchCoords(lat, lon)` dispara busca por coordenadas
- `retry()` repete a última busca realizada
- Estados: loading → success ou loading → error
- Referência de `weatherApi` para chamadas HTTP
- Nenhum comentário no código
</requirements>

## Subtarefas

- [x] 4.1 Implementar `frontend/src/hooks/useWeather.js`
- [x] 4.2 Testes do hook: transição loading → success (por cidade e por coordenadas)
- [x] 4.3 Testes do hook: transição loading → error e funcionamento do retry

## Detalhes de Implementação

### useWeather.js
- Hook customizado com `useState` para `data`, `loading`, `error` e `lastSearch`
- `searchCity(city)`: seta loading, chama `weatherApi.fetchByCity`, atualiza data ou error
- `searchCoords(lat, lon)`: seta loading, chama `weatherApi.fetchByCoords`, atualiza data ou error
- `retry()`: repete a última busca armazenada em `lastSearch` (tipo + parâmetros)
- Retornar objeto com `{ data, loading, error, searchCity, searchCoords, retry }`
- Referência: seção "Interfaces Principais" da techspec.md

## Critérios de Sucesso

- `searchCity("São Paulo")` transiciona loading → data preenchido
- `searchCity("CidadeInvalida")` transiciona loading → error com mensagem
- `searchCoords(-23.55, -46.63)` transiciona loading → data preenchido
- `retry()` após erro repete a busca e pode recuperar
- `loading` é `true` durante a busca e `false` ao finalizar
- Todos os testes passam
- Zero comentários no código

## Testes da Tarefa

- [x] Testes do hook com `renderHook` do React Testing Library: estados loading/success/error
- [x] Teste de retry após erro

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/hooks/useWeather.js` (criar)
- `frontend/src/__tests__/useWeather.test.js` (criar)
- `frontend/src/services/weatherApi.js` (dependência — tarefa 3)
