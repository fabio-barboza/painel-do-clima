# Tarefa 14.0: Skeleton e erros sobre dados exibidos

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Entrega o skeleton de carregamento, a escolha final entre vazio, skeleton e dados em `App`, a preservação dos dados em caso de erro e o anúncio de estados a tecnologias assistivas.

**Depende de:** tarefas 10.0, 12.0 e 13.0.

<requirements>
- Requisitos do PRD atendidos: RF-35, RF-37, RF-39 e RF-40, além dos itens de acessibilidade do PRD sobre anúncio de carregamento e erros.
- Skeleton, mensagens e erros não existem no protótipo: usam apenas os tokens e componentes do design system portado.
- `DashboardSkeleton` repete exatamente o markup e as classes reais, sem alturas fixas.
- Nenhum valor novo de CSS: esta tarefa usa apenas `index.css` e `additions.css` da tarefa 3.0 (`.skel`, `.is-skel`, `.chart-skel`, `.sr-only`).
- O skeleton não usa `.reveal`.
- Um erro não apaga os dados da última consulta bem-sucedida.
</requirements>

## Subtarefas

- [x] 14.1 Criar `src/components/DashboardSkeleton.jsx`, com `<span class="skel">` e texto de exemplo invisível.
- [x] 14.2 Aplicar `.is-skel` em `.temp` e usar sete `.day` e quatro `.stat`.
- [x] 14.3 Finalizar a escolha entre `EmptyState`, `DashboardSkeleton` e `Dashboard` em `src/App.jsx`.
- [x] 14.4 Exibir `Notice` junto dos dados quando houver erro.
- [x] 14.5 Acrescentar a região `.sr-only` com `role="status"`, sempre montada, e `aria-busy` no painel durante o carregamento.
- [x] 14.6 Completar o teste de `App` previsto na TechSpec.
- [x] 14.7 Escrever os demais testes de unidade e de integração.

## Detalhes de Implementação

**Referência em `painel.html`:** o skeleton não tem trecho próprio, mas espelha `.grid-main` (525), `section.current` (527–557), `#chartCard` (559–569), `.grid-stats` (573–606), a seção da semana (608–616) e `.day` (JS 673–681). `Notice` é reaproveitado da tarefa 6.0.

Ver na `techspec.md`: "Skeleton", "Acessibilidade", "Regras de interação" (em nova busca, o skeleton substitui os cards e `data` permanece no estado) e "Lista fechada de adições".

## Critérios de Sucesso

- O skeleton tem a mesma estrutura e as mesmas dimensões do painel, sem salto de layout ao trocar para os dados.
- O gradiente de `.temp` não aparece sobre o placeholder.
- Em consulta que falha com dados na tela, os cards voltam com a mensagem.
- "Tentar novamente" repete a última consulta.
- Carregamento e erros são anunciados, e a nova tentativa funciona só pelo teclado.
- Blocos remontados repetem a revelação.
- Estado vazio, skeleton e mensagens sem rolagem horizontal da página em 375px.
- Nenhum valor de CSS novo foi criado nesta tarefa.

## Testes da Tarefa

- [x] Testes de unidade: `DashboardSkeleton` com as mesmas classes dos blocos reais, 4 `.stat`, 7 `.day`, `.is-skel` e nenhum `.reveal`.
- [x] Testes de integração: smoke de `App` com a fixture: estado vazio sem `fetch`; depois da busca, seções principais, 4 `.stat`, 7 `.day` e 24 `.pt`; skeleton durante a consulta; erro com dados preservados; nova tentativa; `aria-busy` e região `role="status"`.
- [x] Teste de fumaça: com frontend e backend no ar e sem mocks, via Playwright MCP, pesquisar "Curitiba" mostra o skeleton e depois os dados; uma segunda busca, por "Recife", repete o feedback e substitui os dados.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `painel.html`
- `frontend/src/components/DashboardSkeleton.jsx`, `frontend/src/components/Notice.jsx`
- `frontend/src/App.jsx`
- `frontend/src/__tests__/App.test.jsx`, `frontend/src/__tests__/fixtures/weather.js`
