# Tarefa 15.0: E2E determinístico — busca por cidade

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementa os fluxos E2E determinísticos de **busca por cidade** (APIs externas mockadas — Tarefa 14.0): busca de sucesso completa (condições atuais + gráfico 24h + 7 cards + tema), cidade não encontrada (mensagem amigável) e verificação dos headers de **zero cache HTTP** nas respostas do backend.

<requirements>
- Spec de busca de sucesso: buscar "São Paulo" (mock) → painel exibe **condições atuais** (incluindo barra UV), **gráfico de 24h** e **7 cards** da semana, com **tema claro/azulado** (`data-theme="clear"`) aplicado na raiz
- Spec de cidade não encontrada: buscar cidade inexistente (mock com `results: []`) → mensagem amigável de cidade não encontrada; campo de busca continua disponível
- Spec de headers: as respostas de `/api/weather` observadas pela página (via `page.on('response')`) carregam `Cache-Control: no-store` e **não** carregam `ETag` (regra de produto "zero cache HTTP" — métrica do PRD)
- Todas as specs determinísticas (sem dependência de APIs externas reais)
</requirements>

## Subtarefas

- [x] 15.1 Spec: busca de sucesso "São Paulo" (mock) → condições atuais + gráfico 24h + 7 cards + tema `clear`
- [x] 15.2 Spec: cidade inexistente (mock `results: []`) → mensagem amigável + busca disponível
- [x] 15.3 Spec: headers no-cache (`Cache-Control: no-store`, sem `ETag`) via `page.on('response')`

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): seção "Testes de E2E (Playwright)" → "Suite determinística (APIs externas mockadas)", itens 2 (busca "São Paulo"), 3 (cidade inexistente) e 7 (headers observados via `page.on('response')`). Os seletores devem usar a estrutura semântica implementada no frontend (Tarefas 7.0–12.0).

## Critérios de Sucesso

- As 3 specs verdes em `cd e2e && npm test`
- Fluxo de sucesso mostra os 3 blocos de dados (atual, 24h, semana) e o tema `clear` na raiz
- Fluxo de "não encontrada" mostra a mensagem amigável e permite nova busca
- Headers no-cache assertados nas respostas reais da página
- Execução totalmente determinística

## Testes da Tarefa

- [x] Testes E2E: `e2e/tests/search-success.spec.js` — busca "São Paulo" → condições atuais + gráfico 24h + 7 cards + tema claro
- [x] Testes E2E: `e2e/tests/search-not-found.spec.js` — cidade inexistente → mensagem amigável
- [x] Testes E2E: `e2e/tests/no-cache-headers.spec.js` — `Cache-Control: no-store` e ausência de `ETag` nas respostas

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `e2e/tests/search-success.spec.js` (novo)
- `e2e/tests/search-not-found.spec.js` (novo)
- `e2e/tests/no-cache-headers.spec.js` (novo)
- `e2e/setup/` (dependência — mock server da Tarefa 14.0)
