---
id: R-05
severidade: MENOR
status: resolvido
---

# Tarefa de Correção: stateRef desatualizada em useWeather — geo negado restaura sucesso antigo

## Problema
Em `frontend/src/hooks/useWeather.js`, `stateRef.current` (linha 32) só é atualizado nos `.then`/`.catch` do `runFetch` (linhas 50 e 59). O caminho de erro local da busca vazia (linhas 67–71) e o caminho de erro de geolocalização (linhas 89–95) não sincronizam a ref. Sequência reproduzível: busca com sucesso (dados A) → busca vazia (erro local `bad-request`, painel exibe "Informe um nome de cidade") → clique em "Localização Atual" com permissão negada: `locate()` lê `before = stateRef.current`, que ainda aponta para o **sucesso antigo** (A), e restaura `status='success'` + `data=A`. O estado das seções que existia antes do `locate()` (o erro `bad-request`) é perdido.

A TechSpec define: "geo negado → `error{kind:'geo'}` exibido em `.search-error` (estado das seções anterior é preservado, ou `idle` no primeiro acesso)".

## Arquivo
`frontend/src/hooks/useWeather.js` — linhas 32, 50, 59, 67–71 e 90–92

## Impacto
Comportamento de borda (exige erro local seguido de geo negado): o painel volta a exibir dados antigos em vez de preservar o estado anterior, mascarando o feedback de busca vazia. Não há corrupção de dados.

## Sugestão de Correção
1. Sincronizar `stateRef` em toda transição de estado — por exemplo, criar um helper único que atualiza estado e ref juntos, e usá-lo nos três caminhos (`runFetch.then`, `runFetch.catch`, busca vazia e, se necessário, no erro geo). Alternativa mínima: atualizar `stateRef.current = { status: 'error', data: null }` no caminho de busca vazia (linhas 67–71).
2. Adicionar teste de regressão em `frontend/src/__tests__/useWeather.test.js`: sequência `search('Curitiba')` → flush (success) → `search('  ')` (erro local) → `locate()` com geo negado; afirmar que o estado permanece `error` com `kind 'bad-request'` (seções preservadas) e que `error.kind` do geo aparece como mensagem de geo (conforme o desenho atual de `App`/`SearchBar` que lê `error.kind === 'geo'` para a `.search-error` — confirmar o comportamento escolhido nos asserts: o essencial é que o sucesso antigo **não** volte).
3. Rodar a suíte do frontend (`cd frontend && npm test -- run`) e o lint.

## Resolução

Correção da causa raiz: `stateRef` passava a ser atualizada em **toda** transição de estado por meio de um helper único `commit`, que escreve estado e ref juntos.

- `useWeather.js`: criado `commit(next)` (sincroniza `stateRef.current`, `status`, `data` e, quando presente, `error`);
  - `.then` do `runFetch` → `commit({ status: 'success', data: result })`;
  - `.catch` do `runFetch` → `commit({ status: 'error', data: null, error: { kind, message } })`;
  - caminho local de `search('')` (era o divergente) → `commit({ status: 'error', data: null, error: { kind: 'bad-request', ... } })`;
  - callback de geo negado → `commit({ status: before.status, data: before.data, error: { kind: 'geo', ... } })`, preservando o estado anterior das seções.
- Ajustados os arrays de dependência dos `useCallback` (`commit` incluído onde usado).

Teste de regressão adicionado em `frontend/src/__tests__/useWeather.test.js`: sequência `search('Curitiba')` → flush (success) → `search('   ')` (erro local `bad-request`) → `locate()` com geo negado; afirma `error.kind === 'geo'`, `status === 'error'`, `data === null` e `data not.toBe(antes)` (o sucesso antigo **não** volta).

Resultados: suíte do frontend 177/177 verdes; lint do frontend 0 erros (o único warning remanescente é o pré-existente em `coverage/`, R-07).
