# Tarefa 11.0: Geometria do gráfico

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Entrega `buildChartGeometry`, função pura que calcula toda a geometria do gráfico: escalas, curva, área, eixos, marcador "agora" e barras de precipitação. Não há interface nesta tarefa.

**Depende de:** tarefa 8.0.

<requirements>
- Requisitos do PRD atendidos: RF-22, RF-24 e RF-27.
- A geometria reproduz exatamente a de `painel.html`, com as constantes `W=760, H=300, PL=44, PR=16, PT=26, PB=42`.
- Sem biblioteca de gráficos.
- A série usa o tamanho real `n`, nunca `X(23)` fixo.
- Nenhum `NaN` nos caminhos, inclusive com temperatura constante.
</requirements>

## Subtarefas

- [x] 11.1 Criar `src/lib/chartGeometry.js`, com escalas, `X`, `Y` e `smooth`.
- [x] 11.2 Calcular `lineD`, `areaD`, `yTicks`, `xTicks`, `nowX`, `nowY` e `step`.
- [x] 11.3 Calcular `bars`, as barras de precipitação.
- [x] 11.4 Escrever os testes de unidade e de integração.

## Detalhes de Implementação

**Referência em `painel.html`:** JS nas linhas 683–712 (constantes 683, escalas 684–687, `smooth` 690–699, área 702, grade e eixos 704–712).

Ver na `techspec.md`: "Interfaces Principais" (`buildChartGeometry`) e a tabela de "Gráfico". Se `tMax === tMin`, some 4 a `tMax`. Isso cobre temperaturas constantes múltiplas de 4.

## Critérios de Sucesso

- Com `HOURLY` da fixture, `lineD` é igual à curva gerada por `painel.html` para a mesma série.
- Temperaturas negativas, constantes (inclusive múltiplas de 4) e precipitação zero geram caminhos válidos.
- Precipitação zero não gera barra.
- Altura das barras limitada a 30% da área útil, com domínio `max(4, maior valor)`.

## Testes da Tarefa

- [x] Testes de unidade: constantes, escalas, curva, área com `X(n-1)`, temperaturas negativas, constantes, precipitação zero e série com tamanho diferente de 24, sem `NaN`.
- [x] Testes de integração: geometria calculada a partir da fixture completa, com as derivações de `format.js` para as 24 horas e o índice "agora".
- Teste de fumaça: omitido, pois a tarefa não entrega nada executável sozinha. A tarefa 12.0 cobre este fluxo em seu teste de fumaça.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `painel.html`
- `frontend/src/lib/chartGeometry.js`
- `frontend/src/lib/format.js`
- `frontend/src/__tests__/fixtures/weather.js`
