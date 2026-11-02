# Tarefa 13.0: Previsão de sete dias

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Entrega a seção semanal com sete cards `.day`, incluindo volume de chuva e a faixa entre mínima e máxima em escala comum.

**Depende de:** tarefa 9.0.

<requirements>
- Requisitos do PRD atendidos: RF-28, RF-29, RF-30, RF-43 (`.day`) e RF-44 (rolagem horizontal abaixo de 920px).
- A seção deve ficar idêntica ao trecho citado de `painel.html`: estrutura, classes, ids, SVGs, animações e interações.
- Os dados vêm sempre do backend, nunca dos valores de exemplo do protótipo: nada de `WEEK`.
- Nenhum valor novo de CSS: esta tarefa usa apenas `index.css` e `additions.css` da tarefa 3.0, inclusive `.d-range`.
- Dia da semana e data no fuso da localização, sem getters locais em `new Date('YYYY-MM-DD')`.
</requirements>

## Subtarefas

- [x] 13.1 Criar `src/components/DayCard.jsx`.
- [x] 13.2 Criar `src/components/WeeklyCard.jsx`, com `useReveal` e `--d:.32s`.
- [x] 13.3 Calcular a faixa `--l` e `--w` pela menor mínima e pela maior máxima dos sete dias.
- [x] 13.4 Compor `WeeklyCard` em `src/components/Dashboard.jsx`.
- [x] 13.5 Escrever os testes de unidade e de integração.

## Detalhes de Implementação

**Referência em `painel.html`**

| Seletor | Linhas | Componente |
|---|---|---|
| Seção da semana, `.card-head`, `#weeklyGrid` | 608–616 (`--d:.32s`) | `WeeklyCard` |
| `.day`, `.d-name`, `.d-date`, `.d-ico`, `.d-temps`, `.d-rain` | 673–681 (JS) | `DayCard` |
| Estilos | 316–340 (CSS), 359–365 (responsivo) | Já em `index.css` |

Adições autorizadas, dentro de `.day`: volume em `.d-rain` (`20% · 1,2 mm`) e `<div class="bar d-range"><i>`, depois de `.d-rain`. Se a menor mínima e a maior máxima forem iguais, `--l:0%` e `--w:100%`. Largura mínima de 4%.

Ver na `techspec.md`: "Derivações no frontend" (cards dos dias), "Condições" e "Lista fechada de adições".

## Critérios de Sucesso

- Seção idêntica às linhas 608–616 e cada `.day` idêntico à marcação das linhas 674–680: classes, `id`, `aria-label`, `--d`, SVGs, cores de `.d-ico` e hover.
- As únicas adições são o volume de chuva e a faixa.
- Sete cards, começando em "Hoje" com `.d-name.today`, seguidos dos dias com o nome e a data da TechSpec.
- Ícone, máxima, mínima, probabilidade, volume e faixa vêm da resposta do backend.
- A faixa usa escala comum aos sete dias.
- Abaixo de 920px há rolagem horizontal da semana, sem rolagem horizontal da página.
- Campo `null`, como `precipitation_probability_max`, aparece como `–`.
- Nenhum valor de CSS novo foi criado nesta tarefa.

## Testes da Tarefa

- [x] Testes de unidade: `DayCard` com a fixture, conferindo classes, ícone, cor, temperaturas, chuva e nulos; faixa com escala comum, valores iguais e largura mínima.
- [x] Testes de integração: `App` com `fetch` simulado renderiza 7 `.day`, começando em "Hoje", com os valores de `WEEK` da fixture.
- [x] Teste de fumaça: com frontend e backend no ar e sem mocks, via Playwright MCP, pesquisar "Curitiba" exibe sete dias com valores iguais aos da resposta real; em 375px, a semana rola na horizontal e a página não.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `painel.html`
- `frontend/src/components/WeeklyCard.jsx`, `frontend/src/components/DayCard.jsx`
- `frontend/src/components/Dashboard.jsx`
- `frontend/src/__tests__/`
