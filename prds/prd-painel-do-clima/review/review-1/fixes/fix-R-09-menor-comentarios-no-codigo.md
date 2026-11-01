---
id: R-09
severidade: MENOR
status: resolvido
---

# Tarefa de Correção: comentários `//` adicionados nesta mudança (regra do PRD: "comentários no código" fora de escopo)

## Problema
O PRD lista "Comentários no código" entre os itens **explicitamente excluídos pelo requisito**, e a TechSpec reitera: "Sem comentários no código (regra do PRD — 'comentários no código' fora de escopo)". A implementação adicionou 7 comentários `//` simples:
- `backend/src/index.js`: `// Weather data endpoint (FR-01...FR-06)`, `// Unknown routes -> 404 JSON`, `// Error handler` (adicionados nesta mudança);
- `backend/src/__tests__/weather.test.js` linha 256: `// dispara os dois quase simultaneamente; ...`;
- `backend/src/__tests__/middlewares.test.js` linha 1: `// Testa o comportamento de desenvolvimento do CORS (aceita qualquer origem).`;
- `backend/src/__tests__/integration.test.js` linhas 1–2: `// O Jest define NODE_ENV=test por padrão; ...`.

Há ainda um comentário pré-existente em `backend/src/index.js` (`// Health check endpoint`), anterior a esta feature.

Observação: os blocos JSDoc dos serviços (`geocoding.js`, `forecast.js`, `reverseGeocoding.js`) **não** entram nesta tarefa — a TechSpec os exige explicitamente ("Backend (CommonJS, assinaturas JSDoc)"), o que os torna desvio justificado.

## Arquivo
`backend/src/index.js` — linhas com `// Weather data endpoint (FR-01...FR-06)`, `// Unknown routes -> 404 JSON`, `// Error handler`; `backend/src/__tests__/weather.test.js` — linha 256; `backend/src/__tests__/middlewares.test.js` — linha 1; `backend/src/__tests__/integration.test.js` — linhas 1–2

## Impacto
Violação da regra de estilo fixada pelo PRD/TechSpec (entrega não deve conter comentários no código). Sem impacto funcional.

## Sugestão de Correção
1. Remover os 7 comentários `//` listados acima (apenas as linhas de comentário; não alterar código).
2. Avaliar remover também o comentário pré-existente `// Health check endpoint` em `backend/src/index.js` para o arquivo ficar íntegro à regra (o arquivo já é modificado por esta feature).
3. Não remover JSDoc dos serviços (exigência da TechSpec).
4. Rodar a suíte do backend (`cd backend && npm test`) para confirmar nada quebrou.

## Resolução
- Removidos os 7 comentários `//` adicionados nesta mudança:
  - `backend/src/index.js`: `// Weather data endpoint (FR-01...FR-06)`, `// Unknown routes -> 404 JSON`, `// Error handler`;
  - `backend/src/__tests__/weather.test.js` (linha do "dispara os dois quase simultaneamente…");
  - `backend/src/__tests__/middlewares.test.js` (linha 1);
  - `backend/src/__tests__/integration.test.js` (linhas 1–2).
- Removido também o comentário pré-existente `// Health check endpoint` em `backend/src/index.js`, para o arquivo ficar íntegro à regra (o arquivo já era modificado por esta feature).
- JSDoc dos serviços mantido (exigência da TechSpec — desvio justificado).
- Nenhuma linha de código alterada; removi apenas as linhas de comentário.
- Suíte do backend: 56/56 testes verdes (5 suítes), cobertura de instruções 96,58%.
