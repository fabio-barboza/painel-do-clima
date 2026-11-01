---
id: BUG-01
severidade: Baixa
status: aberto
---

# Bug: Subtexto dos estados de erro é redundante em vez de orientativo

## Descrição
Nos três estados de erro (404, 400 e falha de rede), o subtexto do card exibe uma cópia da mensagem de erro (ou da mensagem local) em vez do texto orientativo definido na TechSpec. Exemplo (404): o título é "Cidade não encontrada" e o subtexto aparece como "Cidade não encontrada." — uma repetição sem informação adicional, quando a TechSpec especifica "Verifique a grafia do nome e tente novamente.".

**Causa raiz:** `frontend/src/components/ErrorState.jsx` linha 24 — `const subtitle = message ?? state.subtitle` — e `frontend/src/App.jsx` linha 64 sempre passa `message={error.message}` (a string de erro da API ou local). Como `message` nunca é nulo nestes fluxos, o `subtitle` orientativo definido no objeto `STATES` (linhas 4–18 do componente) nunca é exibido.

Observação: os textos de `STATES` existem e estão corretos — o bug é a priorização incorreta da `message` em tempo de execução sobre o texto orientativo.

## Passos para Reproduzir
1. Iniciar frontend (`cd frontend && npm run dev`) e backend (`cd backend && npm run dev`).
2. **Caso 404:** abrir `http://localhost:5173/` e buscar uma cidade inexistente (ex.: `Xyzqqqqqq123naoexiste`). Observar o subtexto do card de erro.
3. **Caso 400:** com o campo vazio (ou só espaços), clicar em "Pesquisar". Observar o subtexto.
4. **Caso rede:** parar o backend e buscar qualquer cidade. Observar o subtexto.

## Resultado Esperado
Conforme a TechSpec (seção "Acréscimos novos → Erros"):
- 404: subtexto "Verifique a grafia do nome e tente novamente."
- 400: subtexto "Digite o nome de uma cidade válida (ex.: Curitiba)."
- Rede/5xx: subtexto "Verifique sua conexão e tente novamente."

(Espera reforçada pelo FR-14: "mensagem amigável orientando nova tentativa (ex.: verificar a grafia)".)

## Resultado Atual
- 404: subtexto "Cidade não encontrada." (repete o título).
- 400: subtexto "Informe um nome de cidade." (repete o título).
- Rede: subtexto "Não foi possível carregar o clima." (repete o título).

Sem impacto funcional: o estado é exibido, o painel permanece utilizável e o botão de ação ("Nova busca" / "Tentar novamente") funciona — o problema é apenas a perda do texto orientativo (qualidade de UX / desvio da TechSpec).

## Evidência
`qa/qa-2/screenshots/req-14-city-not-found.png` (caso 404: título + subtexto idêntico)
`qa/qa-2/screenshots/req-16-empty-search-400.png` (caso 400)
`qa/qa-2/screenshots/req-15-network-error.png` (caso rede)

## Componente Afetado
`frontend/src/components/ErrorState.jsx` (linha 24: `const subtitle = message ?? state.subtitle`) e `frontend/src/App.jsx` (linha 64: passagem de `message={error.message}`). Correção provável: exibir o `subtitle` orientativo do `STATES` (e a `message` real apenas quando ela acrescentar informação — ex.: falha externa com mensagem distinta), ou remover a passagem de `message` para os estados em que ela é redundante.
