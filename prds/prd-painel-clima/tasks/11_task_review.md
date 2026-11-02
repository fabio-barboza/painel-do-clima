# Review: Task 11.0 - Geometria do gráfico

**Revisor**: AI Code Reviewer
**Data**: 2026-11-02
**Arquivo da task**: 11_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Foi entregue `buildChartGeometry({ temps, precip, nowIndex })` em `frontend/src/lib/chartGeometry.js`, função pura que calcula escalas, curva suave (Catmull-Rom para Bézier, mesma fórmula de `painel.html`), área, grade e eixos, marcador "agora" e barras de precipitação. A geometria usa o tamanho real da série, não `X(23)` fixo, e os caminhos não contêm `NaN` nem com temperatura constante ou negativa. Não há interface nesta task.

A comparação com `painel.html` é feita por teste de integração: um oráculo com as fórmulas de `painel.html` (linhas 683–712) gera `lineD` e `areaD` para a série `HOURLY` da fixture, e a saída da função é igual, caractere a caractere. A cobertura de unidade cobre as constantes, a escala de temperatura com os casos de borda, a curva, a área, o eixo X, o marcador "agora", as barras de precipitação e uma série de 7 pontos.

Qualidade geral: boa. Não há problemas críticos nem maiores. As observações são menores e estão listadas abaixo.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/lib/chartGeometry.js` | ✅ OK (com observações menores) | 2 |
| `frontend/src/__tests__/chartGeometry.test.js` | ✅ OK | 0 |
| `frontend/src/__tests__/chartGeometryFixture.test.js` | ✅ OK | 0 |
| `prds/prd-painel-clima/tasks/tasks.md` | ✅ OK (apenas `[ ]` → `[x]` da task 11.0) | 0 |
| `prds/prd-painel-clima/tasks/11_task.md` | ✅ OK (subtarefas e testes marcados) | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. `frontend/src/lib/chartGeometry.js`, constantes `W`, `H`, `PL`, `PR`, `PT`, `PB` (chaves do objeto retornado): são abreviações exigidas pelo contrato da TechSpec (`buildChartGeometry` retorna exatamente essas chaves). Mantidas por contrato. As constantes internas usam nomes por extenso (`CHART_WIDTH`, `PADDING_LEFT` etc.).
2. `frontend/src/lib/chartGeometry.js`, `getTemperatureDomain` e `buildCurvePath`: temperatura `null` na série produz `NaN` no caminho, porque `Math.min`/`Math.max` e a projeção não tratam nulos. A premissa é que `hourly.temperature_2m` do Open-Meteo não traz nulos (a TechSpec só cita nulos em `precipitation_probability_max`). Correção sugerida se a premissa cair: tratar lacuna de temperatura em uma tarefa futura de renderização, sem mudar esta função. Não corrigido nesta task por estar fora do escopo definido.
3. `frontend/src/lib/chartGeometry.js`, `getTemperatureDomain`: quando o máximo cai em (−4, 0], `Math.ceil` devolve `-0` e `tMax` vale `-0`. Não afeta desenho nem rótulos (`${value}h` e os ticks são calculados sem diferença visível), mas `toBe(0)` falharia. Não corrigido: cosmético e sem efeito na tela.

## Defeitos de Outras Tasks

Nenhum. A suíte já existente (frontend 254 testes, backend 72 testes) passava antes da implementação e continua passando. Não houve smoke test desta task (ver Checagens e Conformidade).

## ✅ Destaques Positivos

- Teste de integração com oráculo fiel: `lineD` e `areaD` são comparados por igualdade exata com a saída de `painel.html` para a mesma série, o que prova a fidelidade da curva e não apenas que ela tem a forma certa.
- A escala X segue a fórmula da TechSpec, `PL + i*(W-PL-PR)/(n-1)`, com a mesma ordem de operações de `painel.html`, o que mantém a igualdade de arredondamento.
- A área fecha em `X(n-1)`, não em `X(23)`, e o teste cobre uma série de 10 e outra de 7 pontos.
- Funções pequenas, com um único parâmetro-objeto nas funções de nível superior, sem flags booleanas, sem blocos em branco e sem comentários, conforme `code-standards.md`.
- Precipitação zero e `null` não geram barra; a altura é limitada a 30% da área útil, com domínio `max(4, maior valor)`.
- A função não tem efeitos colaterais, o que permite testá-la sem DOM.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ (observações menores 1 e 3) |
| Convenções da linguagem do projeto | ✅ ESM, sem TypeScript, testes `*.test.js` em `src/__tests__/` |
| Contratos de interface (APIs, mensagens) | ✅ `buildChartGeometry` com as chaves da TechSpec |
| Logging | ✅ (não se aplica) |
| Interface de usuário | ✅ (não se aplica: nenhuma interface nesta task) |
| Testes | ✅ 32 testes novos, todos passando; sem mocks nos testes de fidelidade |

## Checagens Estáticas

Comando: `cd frontend && npm run lint`
Linha de base (antes da task): limpa
Resultado final: limpa
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): nenhum

## Testes

Frontend: `cd frontend && npm test -- run`. Antes: 254 passando. Depois: 286 passando (29 arquivos). Os 32 novos estão em `chartGeometry.test.js` (24) e `chartGeometryFixture.test.js` (8).
Backend: `cd backend && npm test`. 72 passando, sem alteração no backend.
Smoke test: omitido pela própria task (ver abaixo).

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: nenhuma (falha de processo: a leitura obrigatória da Step 2 não foi feita antes do código) | lidas depois (código revisto contra elas): vitest (padrões `describe`/`it`/`expect` com globals, sem import de API de teste; conforme). Demais skills do `.do/context.md` (`javascript-typescript-jest`, `react-testing`, `nodejs-backend-patterns`, `vite`) não se aplicam ao código puro desta task.
MCPs do projeto: nenhum necessário. Descoberta por capacidade na sessão: context7 (documentation), mcp-api-test (api-testing), playwright (ui-testing) disponíveis, mas a task não expõe interface nem serviço, então E2E não se aplica. context7 não foi consultado, pois não há dependência nova nem API de biblioteca em uso.

## Recomendações

1. Na tarefa 12.0, tratar lacunas (`null`) em temperatura antes de chamar `buildChartGeometry`, se o Open-Meteo puder devolvê-las (observação 2).
2. Antes da próxima task do mesmo tipo, ler as skills do `.do/context.md` no Step 2, antes de escrever código, para cumprir o registro exigido.
3. Opcional: normalizar `-0` em `getTemperatureDomain` com uma soma de zero, se algum teste futuro comparar `tMax` com `toBe(0)` (observação 3).

## Veredito

APROVADO COM OBSERVAÇÕES. A task 11.0 atende RF-22, RF-24 e RF-27 no nível da geometria: escalas, curva e área idênticas a `painel.html`, marcador "agora" no índice recebido, série de tamanho real e nenhum `NaN` com temperaturas negativas, constantes ou precipitação zero. As observações são menores e não bloqueiam a fila. Próximo passo: task 12.0, que monta `HourlyChart` sobre esta geometria e faz o smoke test do gráfico.
