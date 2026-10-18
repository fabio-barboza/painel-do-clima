# Tarefa 7.0: SearchBar (busca com feedback de carregamento)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Cria `frontend/src/components/SearchBar.jsx` — o campo de texto simples de busca por cidade (FR-1 do PRD): sem autocomplete nesta versão, com disparo da busca por submit e feedback visual claro durante o carregamento (FR-18). Componente apresentacional que recebe callback de busca e estado de carregamento por props (o botão de geolocalização é adicionado na Tarefa 13.0).

<requirements>
- Campo de texto simples para digitação do nome da cidade + botão de busca (FR-1; **sem autocomplete**)
- Submit do formulário (Enter ou botão) → invoca o callback `onSearch(city)` com o nome digitado
- Campo vazio (ou só espaços) não dispara busca
- Estado `loading` → input/botão **disabled** + feedback visual perceptível de busca em andamento (FR-18)
- Acessibilidade (WCAG 2.1 AA): label associada ao campo, foco visível e inequívoco, estrutura semântica
- Componente apresentacional: props `onSearch`, `loading` (sem estado de busca interno)
- Sem comentários em código novo (D13)
</requirements>

## Subtarefas

- [x] 7.1 Implementar campo de texto com label acessível e botão de busca
- [x] 7.2 Implementar submit → `onSearch(city)` (ignorar campo vazio/só espaços)
- [x] 7.3 Implementar estado `loading` (disabled + feedback visual)
- [x] 7.4 Criar testes de unidade do componente (ver "Testes da Tarefa")

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): "Arquitetura do Sistema" (tabela frontend — `SearchBar.jsx`: campo de texto simples, disparo da busca, feedback de carregamento) e os requisitos de acessibilidade do PRD (navegação por teclado, foco visível, labels). FR-1 e FR-18 definem o comportamento.

## Critérios de Sucesso

- Digitar cidade e submeter (Enter ou botão) → `onSearch` chamado com o nome
- Campo vazio ou só espaços → `onSearch` NÃO é chamado
- Com `loading=true` → input e botão disabled
- Label associada ao campo e foco visível em navegação por teclado
- Suíte de testes verde (`cd frontend && npm run test -- run`)
- Sem comentários em código novo (D13)

## Testes da Tarefa

- [x] Testes de unidade: `frontend/src/__tests__/SearchBar.test.jsx` — input, submit (callback com a cidade), campo vazio não dispara, disabled durante loading

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/components/SearchBar.jsx` (novo)
- `frontend/src/__tests__/SearchBar.test.jsx` (novo)
