---
id: BUG-04
severidade: Média
status: não-resolvido
---

# Bug: barras de precipitação introduzem um raio que não existe em painel.html

## Descrição
As barras de precipitação do gráfico usam `rx=2`. O `painel.html` não usa `rx` em nenhum elemento e `2` não faz parte da escala de raios do arquivo. O CA-04 exige que as adições não tragam novos raios, e o RF-40 exige somente tokens e padrões de `painel.html`.

O impacto visual é mínimo. A severidade Média vem da regra do PRD: a F9 é obrigatória e bloqueia a aceitação, e a lista de desvios autorizados é fechada. A TechSpec prescreve `rx=2` e diverge do PRD neste ponto, portanto a implementação segue a TechSpec. A decisão é corrigir o código ou registrar a exceção no PRD.

## Passos para Reproduzir
1. Pesquisar uma cidade com precipitação prevista no dia.
2. Inspecionar `rect.precip-bar` no gráfico.
3. Procurar `rx=` em `painel.html`.

## Resultado Esperado
Barras sem raio novo (sem o atributo `rx`), ou exceção registrada no PRD.

## Resultado Atual
`rect.precip-bar` recebe `rx="2"`. A busca em `painel.html` retorna 0 ocorrências.

## Evidência
`qa/qa-1/screenshots/req-27-grafico-precip-alta.png`

## Componente Afetado
`frontend/src/components/HourlyChart.jsx`, linhas 14 e 211 (`BAR_CORNER_RADIUS`), e a linha "Precipitação" da tabela do gráfico em `prds/prd-painel-clima/techspec.md`.

## Bloqueio

Correção não aplicada: exige decisão de escopo/contrato que o agente não pode tomar. Nenhum código ou documento foi alterado por esta execução.

Conflito registrado entre os documentos:
- **PRD (CA-04):** elementos adicionados não podem trazer novos raios; RF-40 e F9 exigem somente tokens e padrões de `painel.html`, que não usa `rx`.
- **TechSpec (tabela de gráfico, linha "Precipitação"):** prescreve `rx=2` para `rect.precip-bar`, e a implementação atual (`frontend/src/components/HourlyChart.jsx`, `BAR_CORNER_RADIUS = 2`, linha 211) segue essa prescrição.

Decisão necessária do usuário (uma das duas):
1. **Corrigir o código:** remover `rx` de `rect.precip-bar` (remover `BAR_CORNER_RADIUS` e o atributo `rx` em `HourlyChart.jsx`) e ajustar a TechSpec para não prescrever `rx=2`. Isso altera um contrato da TechSpec, por isso não foi feito aqui.
2. **Registrar exceção:** aceitar `rx=2` como desvio autorizado no PRD (lista de desvios de F9/CA-04). Isso altera o PRD, por isso não foi feito aqui.

Após a decisão, a correção é pequena: o teste de regressão deve verificar que `rect.precip-bar` não recebe `rx` (opção 1) ou que o desvio está documentado (opção 2).

Validação: suíte de testes do frontend executada sem alteração (40 arquivos, 366 testes passando). Sem validação por MCP de UI, pois não houve mudança a validar.
