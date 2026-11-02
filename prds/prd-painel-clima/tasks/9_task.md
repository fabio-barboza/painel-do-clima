# Tarefa 9.0: Card de condições atuais

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Entrega o card principal: local, indicador de atualização, ícone animado, temperatura com contagem, condição e chips. Cria também `Dashboard`, que agrupa os blocos de dados, e `Chip`. É a primeira tarefa em que dados reais aparecem na tela.

**Depende de:** tarefas 7.0 e 8.0.

<requirements>
- Requisitos do PRD atendidos: RF-16, RF-17, RF-34, RF-41, RF-43 (`.card`, `.chip`), RF-45 (`ping`, `spin`, `floaty`, contagem da temperatura) e RF-46.
- A seção deve ficar idêntica ao trecho citado de `painel.html`: estrutura, classes, ids, SVGs, animações e interações.
- Os dados vêm sempre do backend, nunca dos valores de exemplo do protótipo: nada de `HOURLY`, `DEFAULT_LOC`, `cur + 1` ou "Parcialmente nublado" fixo.
- Nenhum valor novo de CSS: esta tarefa usa apenas `index.css` e `additions.css` da tarefa 3.0.
- O valor final em movimento reduzido é derivado durante o render, sem `setState` síncrono em efeito (lint `set-state-in-effect`).
</requirements>

## Subtarefas

- [x] 9.1 Criar `src/hooks/useCountUp.js`, com atraso de 450 ms, duração de 1400 ms e curva `1 - (1 - p)^3`.
- [x] 9.2 Criar `src/components/WeatherIcon.jsx` por grupo de condição.
- [x] 9.3 Criar `src/components/Chip.jsx`.
- [x] 9.4 Criar `src/components/CurrentCard.jsx`, usando `useReveal`, `useCountUp`, `format` e `weatherCodes`.
- [x] 9.5 Criar `src/components/Dashboard.jsx` com `.grid-main` e compor em `src/App.jsx` com `status: 'ready'`.
- [x] 9.6 Escrever os testes de unidade e de integração.

## Detalhes de Implementação

**Referência em `painel.html`**

| Seletor | Linhas | Componente |
|---|---|---|
| `.grid-main` | 525 | `Dashboard` |
| `section.current` | 527–557 (`--d:.08s`) | `CurrentCard` |
| `.current-top`, `.loc`, `.updated`, `.pulse-dot` | 528–531 | `CurrentCard` |
| `.big-icon`, `.bi-sun`, `.rotor`, `.bi-cloud` | 533–546 | `WeatherIcon` |
| `.temp-block`, `.temp`, `.condition` | 547–550 | `CurrentCard` |
| `.current-foot`, `.chip` | 552–556 | `CurrentCard`, `Chip` |
| Máx, Mín e Sensação | 643–645 (JS) | `CurrentCard`, com dados reais |
| Contagem | 806–817 (JS) | `useCountUp` |

O chip de precipitação (`.plain`, `i-drop`, `Precipitação <b>0,0 mm</b>`) é um desvio autorizado.

Ver na `techspec.md`: "Componentização", "Ícone grande (`WeatherIcon`)" e "Derivações no frontend". O grupo `i-cloud-sun` reproduz as linhas 533–546 sem alterações, `i-sun` usa só `.bi-sun` e os demais usam `.big-icon.solo` com `.bi-cloud`.

Até a tarefa 12.0, a segunda coluna de `.grid-main` fica vazia. Isso é transitório.

## Critérios de Sucesso

- `section.current` idêntica às linhas 527–557: estrutura, classes, ids (`locName`, `tempVal`, `maxT`, `minT`, `feels`), `aria-label`, `--d`, SVGs, animações e hover de `.card`.
- A única adição é o chip de precipitação.
- Local, ícone, temperatura, condição, Máx, Mín, Sensação e precipitação vêm da resposta do backend.
- Todo grupo de condição tem ícone animado, com `spin` e/ou `floaty`.
- A contagem termina no valor real, inclusive negativo, e vai direto ao valor com `prefers-reduced-motion`.
- Campo `null` aparece como `–`.
- Nenhum valor de CSS novo foi criado nesta tarefa.

## Testes da Tarefa

- [x] Testes de unidade: `useCountUp` com timers simulados e movimento reduzido; `WeatherIcon` por grupo (`i-cloud-sun`, `i-sun`, `.solo`); `CurrentCard` com a fixture, conferindo classes, ids e valores; nulos como `–`.
- [x] Testes de integração: `App` com `fetch` simulado, da busca ao card exibido, sem `EmptyState`.
- [x] Teste de fumaça: com frontend e backend no ar e sem mocks, via Playwright MCP, pesquisar "Curitiba" exibe o card com valores iguais aos da resposta real de `/api/weather`. Cobre também o fluxo da tarefa 8.0.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `painel.html`
- `frontend/src/components/CurrentCard.jsx`, `frontend/src/components/WeatherIcon.jsx`, `frontend/src/components/Chip.jsx`, `frontend/src/components/Dashboard.jsx`
- `frontend/src/hooks/useCountUp.js`
- `frontend/src/App.jsx`
- `frontend/src/__tests__/`
