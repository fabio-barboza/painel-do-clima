# Review: Task 6.0 - Barra de busca, estado vazio e avisos

**Revisor**: AI Code Reviewer
**Data**: 2026-11-02
**Arquivo da task**: 6_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Entregues a barra de busca (`SearchBar`), o card de estado vazio (`EmptyState`) e o componente de avisos (`Notice`), todos guiados apenas por props. `App` compõe cabeçalho, `SearchBar`, `EmptyState` e rodapé, com handlers provisórios que não disparam consulta. Nenhum valor de CSS novo foi criado: a tarefa usa somente `index.css` e `additions.css` da tarefa 3.0. A suíte do frontend passou de 44 para 67 testes, todos verdes, e o lint permanece limpo. O teste de fumaça no navegador confirmou o estado vazio, o foco visível de `.search:focus-within` e o comportamento do botão de localização. A observação registrada abaixo é de interpretação da regra de bloqueio do botão de busca com `busy: 'locate'` e `status: 'loading'`, que a TechSpec não detalha.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/components/SearchBar.jsx` | ✅ OK | 0 |
| `frontend/src/components/EmptyState.jsx` | ✅ OK | 0 |
| `frontend/src/components/Notice.jsx` | ✅ OK | 0 |
| `frontend/src/App.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/SearchBar.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/EmptyState.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/Notice.test.jsx` | ✅ OK | 0 |
| `frontend/src/__tests__/App.test.jsx` | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. `frontend/src/components/SearchBar.jsx`: a regra de bloqueio da busca com `busy: 'locate'` e `status: 'loading'` foi implementada como "bloqueia a busca". A TechSpec diz que só o botão de localização fica bloqueado enquanto `status` não for `loading`, mas não define o comportamento durante `loading`. A escolha foi bloquear os dois botões nesse caso, para não disparar uma nova consulta enquanto a anterior está em curso. Se o produto preferir outro comportamento, a mudança é uma única linha em `searchBlocked`.

## Defeitos de Outras Tasks

Nenhum.

## ✅ Destaques Positivos

- `SearchBar` reproduz a estrutura, as classes, os ids, os SVGs, os textos e o `--d:.06s` de `painel.html` (linhas 512–523).
- Busca por Enter usa `preventDefault` e `aria-disabled` com `is-busy`, sem o atributo `disabled`, preservando o foco do teclado.
- Os handlers retornam sem agir quando bloqueados, e o texto dos botões não muda durante o processamento.
- `Notice` escolhe `role="alert"` ou `role="status"` pelo tipo, e o botão "Tentar novamente" é um `button` nativo.
- Nenhum valor de CSS novo foi introduzido nesta tarefa.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ Funções com verbo, constantes nomeadas, sem blocos vazios dentro de funções |
| Convenções da linguagem do projeto | ✅ JavaScript ESM, componentes em PascalCase, testes em `src/__tests__/` |
| Contratos de interface (APIs, mensagens) | ✅ Props `status`, `busy`, `onSearch`, `onLocate`, `kind`, `message`, `canRetry`, `onRetry` |
| Logging | ➖ Não aplicável |
| Interface de usuário | ✅ Igual ao trecho de `painel.html`, com foco visível e teclado |
| Testes | ✅ 67 testes passando (23 novos nesta tarefa) |

## Checagens Estáticas

Comando: `cd frontend && npm run lint`
Linha de base (antes da task): limpa
Resultado final: limpa
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): nenhum

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: react-testing, vitest (leitura parcial, seções de consulta e de interação) | demais skills instaladas não aplicáveis a esta tarefa
MCPs do projeto: usados: playwright (ui-testing) para o teste de fumaça com o `npm run dev` no ar em `http://localhost:5173/` | context7 não necessário (sem dúvida de biblioteca) | mcp-api-test não necessário (sem serviço de API nesta tarefa)

Observação sobre o registro: a skill `react-testing` recomenda `userEvent`, mas o projeto não declara `@testing-library/user-event`, conforme a TechSpec (seção Conformidade com padrões). Os testes usam `fireEvent`, como previsto na TechSpec.

## Recomendações

1. Confirmar com o produto a regra de bloqueio da busca durante `busy: 'locate'` com `status: 'loading'` (ver item menor 1) antes da tarefa 7.0, que liga o `useWeather` a estes componentes.
2. Na tarefa 7.0, substituir os handlers provisórios de `App.jsx` pelos do `useWeather`, mantendo a regra de bloqueio já testada.

## Veredito

**APROVADO COM OBSERVAÇÕES.** Não há problemas críticos nem maiores. A tarefa 6.0 pode ser marcada como concluída. Próximo passo: a tarefa 7.0 liga `SearchBar` e `Notice` ao `useWeather` e à API.
