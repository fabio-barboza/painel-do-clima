# Relatório de tempo: Painel do Clima

Data da execução: 02/11/2026

Este relatório compara o tempo gasto para construir o Painel do Clima com o fluxo do Development Orchestrator (DO) e o tempo estimado para um desenvolvedor full stack pleno fazer o mesmo trabalho sem IA.

## Resumo

| Indicador                         | Com DO e IA           | Sem IA (estimativa) |
| --------------------------------- | ---------------------:| -------------------:|
| Tempo de relógio                  | 2h42 (12:39 às 15:21) | 75 a 112 h          |
| Tempo de agente ativo             | 2h00                  | Não se aplica       |
| Dias úteis                        | Menos de 1            | 10 a 15             |
| Custo de tokens equivalente à API | US$ 19,27             | Não se aplica       |

Na comparação de tempo de relógio, o fluxo com IA foi cerca de 28 a 42 vezes mais rápido. Os dois lados incluem refinamento técnico (TechSpec e quebra em tasks).

## Tempo gasto com o Development Orchestrator

| Etapa                     | Modelo    | Requests | Tempo ativo   | Janela             | Custo (US$) |
| ------------------------- | --------- | --------:| -------------:| ------------------ | -----------:|
| Setup                     | Opus 5.5  | 10       | 1,6 min       | 12:39 às 12:41     | 0,86        |
| PRD                       | Opus 5.5  | 5        | 2,7 min       | 12:43 às 12:49     | 0,93        |
| TechSpec                  | Opus 5.5  | 15       | 8,5 min       | 12:50 às 13:10     | 2,70        |
| Tasks                     | Opus 5.5  | 9        | 6,3 min       | 13:11 às 13:19     | 2,10        |
| Execução (16 subagentes)  | Haiku 5.5 | 525      | 57,6 min      | 13:19 às 14:18     | 5,02        |
| Review                    | Opus 5.5  | 11       | 6,7 min       | 14:18 às 14:28     | 2,84        |
| Review fix (5 subagentes) | Haiku 5.5 | 74       | 9,5 min       | 14:41 às 14:50     | 0,13        |
| QA                        | Opus 5.5  | 22       | 19,5 min      | 14:51 às 15:11     | 4,42        |
| QA fix (4 subagentes)     | Haiku 5.5 | 84       | 7,6 min       | 15:13 às 15:21     | 0,28        |
| **Total**                 |           | **755**  | **119,9 min** | **12:39 às 15:21** | **19,27**   |

Por modelo, o custo foi de US$ 13,85 no Opus 5.5 e US$ 5,42 no Haiku 5.5.

## Escopo entregue

- 16 tasks concluídas
- Cerca de 3.000 linhas de código de produção (backend: 409; frontend: 2.553)
- Cerca de 5.300 linhas de testes em 52 arquivos

## Estimativa sem IA

Estimativa para um desenvolvedor full stack pleno, com jornada de 7,5 horas por dia.

| Bloco                                                                                   | Dias úteis  |
| --------------------------------------------------------------------------------------- | -----------:|
| Refinamento técnico: análise da API Open-Meteo, arquitetura, TechSpec e quebra em tasks | 1,5 a 2,5   |
| Backend: `GET /api/weather`, CORS, cache, erros e integração com Open-Meteo             | 1 a 1,5     |
| Design system, CSS, fundos por condição e animações                                     | 2 a 3       |
| Componentes, busca, estados, skeleton e cliente da API                                  | 2,5 a 3,5   |
| Gráfico por hora com geometria própria                                                  | 1 a 1,5     |
| Testes automatizados                                                                    | 2 a 3       |
| **Total**                                                                               | **10 a 15** |

Esse total corresponde a 75 a 112 horas. A documentação de comunicação e portas está incluída.

Se incluirmos a escrita do PRD (1 a 2 dias) e review e QA feitos por outra pessoa (2 a 3 dias), o total sobe para 13 a 20 dias úteis, ou cerca de 3 a 4 semanas.

## Metodologia e limitações

**Tempo com IA**

- Os dados vêm dos transcripts locais do Claude Code, incluindo os subagentes.
- O tempo ativo soma a duração dos turnos registrada nas sessões. O tempo de relógio vai do início do setup ao fim do QA fix, incluindo esperas por interação humana e intervalos entre sessões.
- O tempo de revisão humana fora das sessões não foi medido e não está nas 2h42.

**Custo**

- O valor é um equivalente calculado com a tabela oficial da API da Anthropic, não uma cobrança real. O trabalho rodou em plano de assinatura, cujo gasto sai da cota do plano.
- Os requests duplicados foram removidos, e cada request foi precificado individualmente, separando leitura de cache, escrita de cache de 5 minutos e de 1 hora.
- O Haiku 5.5 custa cinco vezes mais em prompts acima de 100.000 tokens. Isso atingiu 78% dos requests da Execução, a etapa mais cara do fluxo.
- Ficaram de fora a conversão do `.mcp.json` e a checagem de RTK e Caveman, que somam cerca de US$ 0,42.

**Estimativa sem IA**

- É uma estimativa de julgamento baseada no escopo entregue, não uma medição. O tempo real varia com a experiência do desenvolvedor e a familiaridade com a stack.
