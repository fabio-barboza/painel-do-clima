# Tarefa 10.0: Cards de estatística

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Entrega a grade com sensação térmica, umidade, vento e índice UV, com barras em escala real e a barra de gradiente do UV.

**Depende de:** tarefa 9.0.

<requirements>
- Requisitos do PRD atendidos: RF-18, RF-19, RF-20, RF-43 (`.stat`, barras) e RF-45 (`bob`, preenchimento das barras).
- A seção deve ficar idêntica ao trecho citado de `painel.html`: estrutura, classes, ids, SVGs, animações e interações.
- Os dados vêm sempre do backend, nunca dos valores de exemplo do protótipo: nada de `62`, `14`, `NNO`, `6` ou `--w` fixos.
- Nenhum valor novo de CSS: esta tarefa usa apenas `index.css` e `additions.css` da tarefa 3.0, inclusive `.bar-uv`.
- `.card.stat` é filho direto de `.grid-stats`, por causa de `.stat:nth-child`.
- `.bar i` fica dentro de um `.reveal.in`.
</requirements>

## Subtarefas

- [x] 10.1 Criar `src/components/StatCard.jsx`.
- [x] 10.2 Criar `src/components/StatsGrid.jsx`, com `useReveal` e `--d:.24s`.
- [x] 10.3 Aplicar `.bar-uv` ao UV, com `--f` mínimo de `.01`.
- [x] 10.4 Compor `StatsGrid` em `src/components/Dashboard.jsx`.
- [x] 10.5 Escrever os testes de unidade e de integração.

## Detalhes de Implementação

**Referência em `painel.html`**

| Seletor | Linhas | Componente |
|---|---|---|
| `.grid-stats` | 573–606 (`--d:.24s`) | `StatsGrid` |
| `.card.stat`, `.stat-top`, `.stat-ico`, `.stat-label`, `.stat-val` | 574–605 | `StatCard` |
| Sensação, `#statFeels` | 574–581, cor `#ff9f7a`, `#i-thermo` | `StatCard` |
| Umidade | 582–589, cor `#7cc4ff`, `#i-drop` | `StatCard` |
| Vento | 590–597, cor `#9be8c9`, `#i-wind` | `StatCard` |
| Índice UV | 598–605, cor `#ffd76a`, `#i-uv` | `StatCard`, com `.bar-uv` |
| `.bar`, `.bar i` | 269–275 (CSS) | `StatCard` |

Marcações de valor mantêm o espaçamento exato: `20<small> °C</small>`, `62<small> %</small>`, `14<small> km/h · NNO</small>` e `6 <small>· Alto</small>`. Em JSX, use `{' '}` onde houver espaço fora do `<small>`.

Ver na `techspec.md`: "Escalas das barras", "Derivações no frontend" e "Lista fechada de adições" (UV).

## Critérios de Sucesso

- `.grid-stats` idêntica às linhas 573–606: estrutura, classes, `aria-label`, ordem, cores inline, SVGs, animação `bob` com atrasos e hover de `.card`.
- A única adição visual é o gradiente de `.bar-uv`, com as dimensões de `.bar`.
- Valores, unidades, direção do vento, classificação de UV e `--w` vêm da resposta do backend, pelas escalas da TechSpec.
- A cor da barra de UV corresponde à posição na escala, não ao tamanho do preenchimento.
- Em 920px a grade tem 2 colunas e em 480px o gap é 12px.
- Nenhum valor de CSS novo foi criado nesta tarefa.

## Testes da Tarefa

- [x] Testes de unidade: `StatCard` com a marcação exata de cada valor, inclusive os espaços; `--w` e `--f` corretos; nulos como `–`.
- [x] Testes de integração: `App` com `fetch` simulado renderiza 4 `.stat` como filhos diretos de `.grid-stats`, com os valores da fixture iguais aos de `painel.html`.
- [x] Teste de fumaça: com frontend e backend no ar e sem mocks, via Playwright MCP, pesquisar "Curitiba" exibe os quatro cards com valores iguais aos da resposta real e barras preenchidas.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `painel.html`
- `frontend/src/components/StatsGrid.jsx`, `frontend/src/components/StatCard.jsx`
- `frontend/src/components/Dashboard.jsx`
- `frontend/src/__tests__/`
