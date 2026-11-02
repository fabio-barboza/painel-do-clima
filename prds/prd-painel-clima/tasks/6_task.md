# Tarefa 6.0: Barra de busca, estado vazio e avisos

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Entrega a barra de busca com seus botões, o card de estado vazio e o componente de avisos. Os três recebem tudo por props. A ligação com o backend fica para a tarefa 7.0.

**Depende de:** tarefa 5.0.

<requirements>
- Requisitos do PRD atendidos: RF-10, RF-11, RF-12, RF-15 (indicação visual), RF-40, RF-43 (busca e botões, com hover e foco), RF-44 (ocultação do texto de localização até 480px) e RF-46.
- `SearchBar` deve ficar idêntica ao trecho citado de `painel.html`: estrutura, classes, ids, SVGs, textos e interações.
- `EmptyState` e `Notice` não existem no protótipo: usam apenas tokens e componentes do design system portado (`.card`, `.card-head`, `.btn`, `.notice`).
- Nenhum valor novo de CSS: esta tarefa usa apenas `index.css` e `additions.css` da tarefa 3.0.
- Sem autocomplete.
- O atributo `disabled` não é usado: processamento usa `aria-disabled="true"` e a classe `is-busy`, para não perder o foco do teclado.
- O texto dos botões não muda durante o processamento.
</requirements>

## Subtarefas

- [x] 6.1 Criar `src/components/SearchBar.jsx`, com disparo por clique e Enter (`preventDefault`).
- [x] 6.2 No clique em localização, limpar o campo e devolver o foco a ele, como em `painel.html`.
- [x] 6.3 Aplicar `aria-disabled` e `is-busy` conforme a prop `busy`, com handlers que retornam sem agir.
- [x] 6.4 Criar `src/components/EmptyState.jsx`, com `--d:.08s`.
- [x] 6.5 Criar `src/components/Notice.jsx`, com `role="alert"` em erros, `role="status"` em orientações e botão "Tentar novamente" quando `canRetry`.
- [x] 6.6 Compor `SearchBar` e `EmptyState` em `src/App.jsx`, com handlers provisórios que não fazem consulta.
- [x] 6.7 Escrever os testes de unidade e de integração.

## Detalhes de Implementação

**Referência em `painel.html`**

| Seletor | Linhas | Componente |
|---|---|---|
| `.search`, `#searchInput`, `.search-btns` | 512–523 (markup, `--d:.06s`), 124–147 (CSS) | `SearchBar` |
| `.btn`, `.btn-primary`, `.btn-ghost`, `#btnSearch`, `#btnLocate` | 516–521 (markup), 149–167 (CSS) | `SearchBar` |
| Busca e localização | 825–837 (JS) | `SearchBar` |
| Responsividade da busca | 371–376, 380–381 (CSS) | Já em `index.css` |
| `.card`, `.card-head` | 171–194 (CSS) | Base de `EmptyState` e `Notice` |

`EmptyState` e `Notice` são novos na tabela "Componentização" da TechSpec, sem trecho correspondente no protótipo.

Ver na `techspec.md`: "Regras de interação", "Componentização" (textos do estado vazio) e "Lista fechada de adições" (`.notice`, `.is-busy`).

Regra de processamento: com `busy: 'search'`, os dois botões ficam bloqueados. Com `busy: 'locate'`, só o botão de localização fica bloqueado enquanto `status` não for `loading`, pois a busca por nome precisa continuar disponível durante o pedido de permissão.

## Critérios de Sucesso

- `SearchBar` idêntica às linhas 512–523: estrutura, classes, ids, `role="search"`, `aria-label`, placeholder, SVGs, textos, hover, foco e `--d`.
- Em 640px e 480px, a busca se comporta como nas linhas 371–381, com `#btnLocate` sem texto até 480px.
- `EmptyState` é um `.card` com `.card-head`, título "Consulte o clima" e o subtítulo da TechSpec.
- `Notice` usa `.card` e `.notice`, e "Tentar novamente" funciona só pelo teclado.
- Nenhum valor de CSS novo foi criado nesta tarefa.

## Testes da Tarefa

- [x] Testes de unidade: `SearchBar` com clique, Enter, limpeza e foco na localização, `aria-disabled`, `is-busy` e bloqueio dos handlers em `busy: 'search'` e `busy: 'locate'`; `Notice` com `role` por tipo e retry; `EmptyState` com textos e classes.
- [x] Testes de integração: `App` em estado vazio mostra cabeçalho, busca, card vazio e rodapé, sem nenhuma chamada a `fetch`.
- [x] Teste de fumaça: com `npm run dev` no ar, via Playwright MCP, `/` mostra o estado vazio completo; o campo aceita texto com o foco visível de `.search:focus-within`, e o botão de localização limpa o campo e devolve o foco.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `painel.html`
- `frontend/src/components/SearchBar.jsx`, `frontend/src/components/EmptyState.jsx`, `frontend/src/components/Notice.jsx`
- `frontend/src/App.jsx`
- `frontend/src/__tests__/`
