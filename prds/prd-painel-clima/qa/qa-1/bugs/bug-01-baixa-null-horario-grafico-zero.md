---
id: BUG-01
severidade: Baixa
status: corrigido
---

# Bug: temperatura horária nula é plotada como 0° no gráfico

## Descrição
Quando `hourly.temperature_2m` traz `null` em uma das horas do dia, o gráfico trata o valor como 0. A curva despenca até 0°, a escala Y é recalculada a partir de 0° e toda a série fica comprimida. O tooltip dessa hora exibe `–°C`, combinando o placeholder com a unidade. A TechSpec define que qualquer campo `null` da Open-Meteo é exibido como `–`.

O caso foi reproduzido com resposta interceptada. Nenhum `null` horário apareceu nas consultas reais feitas nesta rodada, por isso a severidade é baixa, mas a informação exibida é falsa quando ocorre.

## Passos para Reproduzir
1. Interceptar `GET /api/weather` e devolver a fixture `frontend/src/__tests__/fixtures/weather.js` com `hourly.temperature_2m[3] = null`.
2. Pesquisar qualquer cidade e aguardar o desenho do gráfico.
3. Passar o mouse sobre 3h.

## Resultado Esperado
A hora sem dado não é representada como temperatura real: a escala considera só valores válidos, a curva não cai a 0° e o tooltip mostra `–`.

## Resultado Atual
Eixo Y de 0° a 28° (com dados válidos seria de 12° a 28°), ponto de 3h em `cy=258` (linha de base) e tooltip `03h · –°C · 0,0 mm`.

## Evidência
`qa/qa-1/screenshots/bug-01-null-horario-grafico.png`

## Componente Afetado
`frontend/src/lib/chartGeometry.js` (`getTemperatureDomain` usa `Math.min`/`Math.max` sobre `temps`, em que `null` vira 0, e os pontos usam o mesmo valor) e o formato do tooltip em `frontend/src/components/HourlyChart.jsx`.

## Resolução

**Correção aplicada**
- `frontend/src/lib/chartGeometry.js`: a escala Y (`getTemperatureDomain`) passa a considerar só temperaturas válidas (números finitos). A hora sem dado fica sem ponto (`points[i][1] === null`), mas mantém a posição X para a guia do tooltip. A linha e a área são traçadas só pelas horas válidas, ligando vizinhos válidos, sem valor inventado e sem queda a 0°. A área fecha na primeira e na última hora válidas. O marcador "agora" fica oculto quando a hora atual não tem temperatura. Um dia sem nenhuma temperatura válida gera geometria vazia, sem linha nem eixo Y.
- `frontend/src/components/HourlyChart.jsx`: não desenha ponto para hora sem temperatura, oculta o ponto de destaque (`.hoverdot`) sobre ela, ancora o tooltip no topo do gráfico nesse caso, e o tooltip mostra `–` sem a unidade `°C` (`formatTooltipTemperature`).

**Testes de regressão**
- `frontend/src/__tests__/chartGeometryMissing.test.js` (10 testes): domínio ignora `null`, path começa na primeira hora válida, hora nula sem ponto, segmento em ponte no meio da série, área fechada nas bordas válidas, marcador "agora" oculto em hora nula, série toda nula sem NaN, extremos nas bordas do plot.
- `frontend/src/__tests__/HourlyChartMissing.test.jsx` (4 testes): tooltip da hora nula com `–` e sem `°C`, tooltip de hora válida inalterado, eixo Y sem `0°`, ponto ausente e guia oculta sobre a hora nula.
- Antes da correção, 11 desses testes falharam. Depois, a suíte do frontend passou com 379 testes e o lint ficou sem erros.

**Validação E2E (Playwright MCP)**
- Dev server do frontend com `/api/weather` do backend (`http://localhost:3000`) interceptado com a fixture e `temperature_2m[3] = null`. Busca por "Curitiba", hover sobre 03h: tooltip `03h · – · 0,0 mm`, eixo Y 12° a 28°, `.hoverdot` com opacidade 0.
- Evidência: `prds/prd-painel-clima/qa/qa-1/screenshots/fix-BUG-01-null-horario-grafico.png`.

**Decisão de renderização**
- A curva liga as horas válidas vizinhas em vez de abrir um vão. Isso não inventa dado, mas é uma escolha visual que o usuário pode revisar se preferir uma quebra na linha.
