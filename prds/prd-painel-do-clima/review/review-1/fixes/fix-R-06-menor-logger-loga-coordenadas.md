---
id: R-06
severidade: MENOR
status: resolvido
---

# Tarefa de Correção: logger grava originalUrl completo, expondo coordenadas (geolocalização) nos logs

## Problema
Em `backend/src/middleware/logger.js`, `logger` (linha 5) e `logError` (linha 13) registram `req.originalUrl`, que inclui a query string. Para `GET /api/weather?latitude=-25.43&longitude=-49.27` (fluxo de geolocalização), o log de acesso grava as coordenadas do usuário. A seção "Monitoramento e Observabilidade" da TechSpec afirma: "Nenhum dado pessoal é logado (a geolocalização é usada e descartada)", e o PRD determina que a geolocalização "é obtida do navegador e usada apenas para a consulta do clima; nenhum dado pessoal deve ser persistido".

## Arquivo
`backend/src/middleware/logger.js` — linhas 5 e 13

## Impacto
Viola a restrição explícita de observabilidade da TechSpec: coordenadas (dado de localização pessoal) entram no log. Em scaffold local o risco é baixo, mas o padrão é incorreto para qualquer evolução com coleta de logs.

## Sugestão de Correção
1. Em `logger` (linha 5), trocar `req.originalUrl` por `req.path` (mantém método, rota, status e duração — exatamente o descrito na TechSpec: "método, rota, status, duração (ms)").
2. Em `logError` (linha 13), aplicar a mesma troca (`req.path`).
3. Ajustar o teste "escreve método, rota, status e duração via console, sem dados pessoais" em `backend/src/__tests__/middlewares.test.js` para usar `req.path` no mock e, de preferência, adicionar um caso com query de coordenadas (`{ method: 'GET', path: '/api/weather', originalUrl: '/api/weather?latitude=-25.43&longitude=-49.27' }`) afirmando que o log **não** contém os valores de latitude/longitude.
4. Rodar a suíte do backend (`cd backend && npm test`).

## Resolução
- `backend/src/middleware/logger.js`: em `logger`, trocar `req.originalUrl` por `req.path` na linha do `console.info` (mantém método, rota, status e duração). Em `logError`, trocar `url: req.originalUrl` por `path: req.path` (renomeado a chave para refletir que deixa de ser a URL completa).
- `backend/src/__tests__/middlewares.test.js`: o caso "escreve método, rota, status e duração via console, sem dados pessoais" passou a usar `path` no mock; adicionado o caso "não grava coordenadas da query de geolocalização" com `originalUrl` contendo `latitude`/`longitude`, afirmando que o log **não** traz tais valores; o caso de `logError` passou a passar `path` no mock.
- Suíte do backend: 56/56 verdes (antes 55); `logger.js` com 100% de instruções na cobertura.
