# Tarefa 8.0: Formatação e condições meteorológicas

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Entrega as funções puras que transformam o payload em valores de exibição: formatação, escalas das barras, classificação de UV, direção do vento, datas e a tabela de condições WMO. Não há interface nesta tarefa.

**Depende de:** tarefa 7.0 (fixture).

<requirements>
- Requisitos do PRD atendidos: RF-16 (descrição em português), RF-18, RF-19, RF-28 (datas), RF-32 (variante por condição) e RF-34 (cobertura de todos os códigos).
- Data e hora "agora" vêm de `current.time`, nunca de `new Date()`.
- Dias de `daily.time` são lidos com `Date.UTC` e `getUTCDay`, nunca com `new Date('YYYY-MM-DD')` e getters locais.
- `Intl` não é usado nos cards dos dias, pois gera `seg.` e `ago.` com ponto.
- Qualquer valor `null` é exibido como `–`.
- Código desconhecido usa "Condição indisponível", ícone de nuvem e fundo de referência.
</requirements>

## Subtarefas

- [x] 8.1 Criar `src/lib/weatherCodes.js` com `getWeatherInfo(code)` e a tabela completa de códigos.
- [x] 8.2 Criar `src/lib/format.js` com temperatura, precipitação com vírgula, vento e UV.
- [x] 8.3 Acrescentar as escalas das barras, com porcentagem inteira limitada a 0–100.
- [x] 8.4 Acrescentar datas dos cards e seleção das 24 horas do dia atual e do índice "agora".
- [x] 8.5 Escrever os testes de unidade e de integração.

## Detalhes de Implementação

Ver na `techspec.md`: "Derivações no frontend", "Escalas das barras" e "Condições".

A interface da TechSpec lista `getWeatherInfo(code)` como `{ label, icon, sky }`, mas a tabela de condições também define a cor de `.d-ico`. Por isso, a função retorna `{ label, icon, sky, color }`. No código desconhecido, a cor é `#c9d6f2`, a mesma do ícone de nuvem.

**Referência em `painel.html`:** as cores de `.d-ico` vêm de `WEEK` (linhas 629–635). Os valores das barras (linhas 580–604) servem apenas de conferência das escalas e não entram no código.

## Critérios de Sucesso

- Todos os códigos WMO da tabela retornam descrição, ícone, cor e variante corretos.
- As escalas reproduzem a conferência da TechSpec: 20 °C é 55%, 62% é 62%, 14 km/h é 40% e UV 6 é 50%.
- Datas corretas em fusos negativos, sem voltar um dia.
- Formato de data `16 ago`, e precipitação `0,2 mm`.
- Nenhuma função lê o relógio do sistema.

## Testes da Tarefa

- [x] Testes de unidade: `weatherCodes` com todos os códigos e o desconhecido; `format` com vento nos 16 pontos, limites de UV, escalas com limites, data por `Date.UTC`, vírgula decimal e nulos.
- [x] Testes de integração: aplicar as funções à fixture completa, conferindo as 24 horas do dia atual, os sete dias e os valores de `painel.html`.
- Teste de fumaça: omitido, pois a tarefa não entrega nada executável sozinha. A tarefa 9.0 cobre este fluxo em seu teste de fumaça.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/lib/weatherCodes.js`
- `frontend/src/lib/format.js`
- `frontend/src/__tests__/fixtures/weather.js`
