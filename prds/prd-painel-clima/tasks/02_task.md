# Tarefa 2.0: Backend — Router, Error Handler e Endpoint `/api/weather`

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Criar o router Express com o endpoint `GET /api/weather` que aceita busca por nome de cidade ou por coordenadas, o middleware global de tratamento de erros e integrar tudo no `index.js` existente. O endpoint orquestra geocoding + forecast (ou apenas forecast se coordenadas forem fornecidas).

<requirements>
- RF-02: Ao submeter a busca, o frontend chama `GET /api/weather?city=<nome>`
- RF-05: Ao obter localização, o frontend chama o backend com coordenadas
- RF-23: Mensagem amigável quando cidade não for encontrada (HTTP 404)
- RF-24: Mensagem de erro com opção de retry para falhas na API (HTTP 400)
- RF-25: Payload de erro segue formato consistente `{ error: true, message: "..." }`
- Endpoint aceita `GET /api/weather?city=<nome>` e `GET /api/weather?lat=<lat>&lon=<lon>`
- Validação de parâmetros: city vazio, lat/lon inválidos, ausência de parâmetros → 400
- Geocoding sem resultados → 404
- Erro em APIs externas → 500 com mensagem genérica + log no console
- Nenhum comentário no código
</requirements>

## Subtarefas

- [x] 2.1 Implementar `backend/src/middleware/errorHandler.js` — middleware global de erros com formato consistente
- [x] 2.2 Implementar `backend/src/routes/weather.js` — router com endpoint `GET /api/weather`
- [x] 2.3 Atualizar `backend/src/index.js` — registrar router e error handler
- [x] 2.4 Testes de integração com Supertest: request completo → geocoding + forecast → response unificada
- [x] 2.5 Testes unitários do router: validação de parâmetros (city vazio, lat/lon inválidos, sem parâmetros)

## Detalhes de Implementação

### weather.js (Router)
- Detecta modo pelos parâmetros: se `city` presente → geocoding + forecast; se `lat` + `lon` presentes → forecast direto
- Validações: `city` não vazio, `lat` e `lon` numéricos válidos, pelo menos um par de parâmetros
- Chama `geocode()` de `geocoding.js` e `getForecast()` de `forecast.js`
- Monta resposta unificada com `location` (nome presente apenas no modo city), `current`, `hourly`, `daily`
- Referência: seção "Modelos de Dados" e "Endpoints de API" da techspec.md

### errorHandler.js
- Middleware Express de 4 parâmetros `(err, req, res, next)`
- Formato de resposta: `{ error: true, message: "..." }`
- Status code: usa `err.statusCode` se presente, senão 500
- Log do erro via `console.error`
- Referência: seção "Tratamento de erros" da techspec.md

### index.js (modificação)
- Importar e registrar `weatherRouter` em `/api/weather`
- Importar e registrar `errorHandler` como último middleware
- Manter endpoint `/health` existente

## Critérios de Sucesso

- `GET /api/weather?city=São Paulo` retorna 200 com payload completo (location, current, hourly, daily)
- `GET /api/weather?lat=-23.55&lon=-46.63` retorna 200 com payload (sem `location.name`)
- `GET /api/weather` sem parâmetros retorna 400
- `GET /api/weather?city=CidadeInexistenteXYZ` retorna 404
- Todos os testes de integração e unitários passam
- Zero comentários no código

## Testes da Tarefa

- [x] Testes de unidade do router: validação de parâmetros
- [x] Testes de integração: fluxo completo com mocks das APIs externas (geocoding + forecast → response unificada)
- [x] Teste do errorHandler: formato consistente de erro

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `backend/src/routes/weather.js` (criar)
- `backend/src/middleware/errorHandler.js` (criar)
- `backend/src/index.js` (modificar)
- `backend/src/__tests__/weather.test.js` (criar)
- `backend/src/__tests__/errorHandler.test.js` (criar)
- `backend/src/services/geocoding.js` (dependência — tarefa 1)
- `backend/src/services/forecast.js` (dependência — tarefa 1)
