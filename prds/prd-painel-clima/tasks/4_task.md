# Tarefa 4.0: Fundo de referência e estrutura do painel

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Entrega o fundo decorativo de referência (estrelas, lua, nuvens e estrelas cadentes) e o contêiner `main.dashboard`, que recebe os demais componentes. As camadas das variantes `cloudy` e `rain` ficam para a tarefa 15.0.

**Depende de:** tarefa 3.0.

<requirements>
- Requisitos do PRD atendidos: RF-08, RF-10 (fundo de referência), RF-32 (variante de referência), RF-41 e RF-45 (`twinkle`, `moonGlow`, `drift`, `shoot`).
- O resultado deve ficar idêntico ao trecho citado de `painel.html`: estrutura, classes, ids, estilos inline e animações.
- Nenhum valor novo de CSS: esta tarefa usa apenas `index.css` e `additions.css` da tarefa 3.0.
- As 140 estrelas são geradas uma única vez, em nível de módulo, nunca durante o render (lint `purity`).
- `#root` e `.sky` ficam sem estilo próprio, para não criar contexto de empilhamento.
</requirements>

## Subtarefas

- [x] 4.1 Criar `src/lib/stars.js`, com a mesma geração das linhas 648–660.
- [x] 4.2 Criar `src/components/SkyBackground.jsx` com o wrapper `<div class="sky" data-sky="reference">` e os elementos decorativos.
- [x] 4.3 Compor `SkyBackground` e `main.dashboard` em `src/App.jsx`.
- [x] 4.4 Escrever os testes de unidade e de integração.

## Detalhes de Implementação

**Referência em `painel.html`**

| Seletor | Linhas | Componente |
|---|---|---|
| `#stars` | 488 (markup), 47–56 (CSS), 648–660 (JS) | `SkyBackground`, `lib/stars.js` |
| `.moon` | 489 | `SkyBackground` |
| `.bg-cloud` (3) | 490–492 | `SkyBackground`, com estilos inline iguais |
| `.shoot`, `.shoot2` | 493–494 | `SkyBackground` |
| `main.dashboard` | 496 | `App` |

Ver na `techspec.md`: "Componentização" e "Fidelidade visual: animações e interações". As propriedades `--o`, `--td` e `--tdel` de cada estrela seguem as faixas das linhas 652–658.

## Critérios de Sucesso

- O fundo fica idêntico às linhas 488–494 de `painel.html`, salvo a posição aleatória das estrelas (desvio autorizado): estrutura, classes, `aria-hidden`, estilos inline e animações.
- A ordem dos elementos é a mesma do arquivo, e `main.dashboard` fica acima do fundo.
- As estrelas não mudam de posição em novos renders.
- Nenhum valor de CSS novo foi criado nesta tarefa.

## Testes da Tarefa

- [x] Testes de unidade: `stars` gera 140 itens com valores dentro das faixas; `SkyBackground` renderiza `#stars` com 140 `i`, `.moon`, 3 `.bg-cloud` e 2 `.shoot` com os estilos inline do arquivo.
- [x] Testes de integração: `App` renderiza `.sky` antes de `main.dashboard`, sem nenhuma chamada a `fetch`.
- [x] Teste de fumaça: com `npm run dev` no ar, via Playwright MCP, `/` abre sem tela intermediária, com fundo, estrelas, lua, nuvens e estrelas cadentes animados e sem erros no console.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `painel.html`
- `frontend/src/components/SkyBackground.jsx`
- `frontend/src/lib/stars.js`
- `frontend/src/App.jsx`
- `frontend/src/__tests__/`
