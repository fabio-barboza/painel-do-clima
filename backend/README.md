# Painel do Clima — Backend

API Node.js (Express, CommonJS) que é a **única porta** da aplicação para as APIs externas
(Open-Meteo geocoding + previsão e BigDataCloud reverse geocoding). O frontend **nunca** consome
esses serviços diretamente: toda requisição externa passa por este backend.

## O que faz

- `GET /api/weather?city=<nome>` — resolve o nome em coordenadas (geocoding Open-Meteo) e busca a
  previsão (Open-Meteo), devolvendo um envelope no formato Open-Meteo + `city` resolvido + `hourly`
  fatiado para as próximas 24 horas.
- `GET /api/weather?latitude=<n>&longitude=<n>` — busca a previsão e resolve o nome da cidade via
  reverse geocoding (BigDataCloud, best-effort).
- `GET /health` — health check.

Códigos de resposta: `200` (sucesso), `400` (parâmetros ausentes/válidos ou coordenadas inválidas),
`404` (cidade não encontrada), `502` (falha/timeout de API externa).

## Comunicação (CORS)

Como o frontend é uma aplicação separada, a comunicação respeita CORS. A estratégia é configurável
por `NODE_ENV` e por `CORS_ORIGINS`:

- **Desenvimento** (`NODE_ENV=development`): **qualquer origem é aceita** (`*`). Isso é intencional e
  documentado — o dev usa o proxy do Vite (`frontend/README.md`), mas o CORS liberado evita falhas
  caso o frontend seja servido por outra origem.
- **Produção local** (`NODE_ENV=production`): as origens são listadas em `CORS_ORIGINS`, separadas
  por vírgula. Exemplo para o `npm run preview` do frontend: `CORS_ORIGINS=http://localhost:4173`.
  A origem da requisição é ecoada no header `Access-Control-Allow-Origin` (ou ignorada quando não
  corresponde à lista).

Detalhes implementados no middleware manual `src/middleware/cors.js`:

- **Métodos permitidos:** `GET, OPTIONS`.
- **Headers autorizados:** `Content-Type, Authorization`.
- **Preflight** (`OPTIONS`): responde `204` sem corpo.
- Header `Vary: Origin` sempre setado.

Nenhum site de terceiros nem credencial é configurado aqui — apenas origens, métodos e headers.

## Ausência de cache

Toda resposta leva `Cache-Control: no-store` (middleware `src/middleware/cache.js`) e `ETag` está
desabilitado (`app.set('etag', false)` em `src/index.js`). Não há cache HTTP entre frontend e
backend.

## Portas

- Servidor (dev e produção): **3000** (`PORT`, default 3000).
- Produção local: backend em `3000` (`npm start`); frontend em `4173` (`npm run preview` no pacote
  `frontend/`).

## Configuração

Variagens de ambiente (copie `backend/.env.example` para `backend/.env`):

| Variável | Valor default | Uso |
|----------|---------------|-----|
| `PORT` | `3000` | porta do servidor |
| `NODE_ENV` | `development` | controla a política de CORS (`*` em dev) |
| `CORS_ORIGINS` | `*` (dev) / vazio (prod) | origens permitidas, separadas por vírgula |
| `GEOCODING_API_URL` | Open-Meteo geocoding | fonte do nome → coordenadas |
| `FORECAST_API_URL` | Open-Meteo forecast | fonte da previsão |
| `REVERSE_GEOCODING_API_URL` | BigDataCloud | nome → coordenadas (geolocalização) |

Cada chamada externa tem timeout de 8 s (`AbortSignal.timeout`).

## Comandos

| Comando | Finalidade |
|---------|-----------|
| `npm start` | roda o servidor em produção (`node src/index.js`, porta 3000) |
| `npm run dev` | roda com recarga automática via nodemon |
| `npm test` | roda a suíte Jest **uma vez** com cobertura (`jest --coverage`). Testes em
  `src/__tests__/**/*.test.js` (o `testMatch` do Jest só reconhece esse padrão). |
| `npm run test:watch` | modo watch (não usado na validação automática). |

> **Atenção à porta:** a suíte não ocupa a porta 3000 — o `app.listen` está protegido por
> `require.main === module`. Não deixe o dev server rodando ao rodar `npm test` para evitar
> `EADDRINUSE`.

## Estrutura

```
src/
  index.js              app Express: etag off, middlewares, rota, handlers, guard de listen
  config.js             env (PORT, CORS_ORIGINS, URLs externas, timeout)
  middleware/           cache.js (no-store), cors.js (manual), logger.js (acesso)
  routes/weather.js     GET /api/weather (validação → geocoding → forecast → envelope)
  services/             geocoding, forecast (+sliceHourly24), reverseGeocoding, externalError
  __tests__/            weather, services, integration, middlewares, api
```
