# Review: Task 15.0 - Variantes de fundo por condição

**Revisor**: AI Code Reviewer
**Data**: 2026-11-02
**Arquivo da task**: 15_task.md
**Status**: APROVADO

## Resumo

`SkyBackground` recebe a prop `sky` (padrão `reference`), grava em `data-sky` e renderiza as camadas `.sky-layer.sky-cloudy` e `.sky-layer.sky-rain` antes de `#stars`. A camada da variante ativa recebe `is-active`, que já existe em `additions.css`, e o crossfade fica por conta da transição de 1.2s do CSS. `App` deriva `sky` durante o render por `getWeatherInfo(data.current.weather_code).sky`, com `reference` quando não há dados. Nenhum valor de CSS novo foi criado. A implementação é pequena, sem estado próprio e sem efeitos. A avaliação geral é boa.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| frontend/src/components/SkyBackground.jsx | ✅ OK | 0 |
| frontend/src/App.jsx | ✅ OK | 0 |
| frontend/src/__tests__/SkyBackground.test.jsx | ✅ OK | 0 |
| frontend/src/__tests__/AppSky.test.jsx | ⚠️ Problemas | 1 menor |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

- `frontend/src/__tests__/AppSky.test.jsx`: o `fetch` simulado devolve a resposta sem checar a requisição enviada. O contrato da URL e do `cache: 'no-store'` já é verificado em `AppWeather.test.jsx`, então não há lacuna real, mas o teste de variantes poderia asserir a chamada. Correção sugerida: opcional, não bloqueante.

## Defeitos de Outras Tasks

Nenhum. A suíte e o smoke test passaram sem falhas de tasks anteriores, e o console não exibiu erros.

## ✅ Destaques Positivos

- A derivação da variante acontece no render, sem `useEffect` nem estado extra, como pede a task.
- Em erro com dados na tela, a variante da última consulta bem-sucedida permanece (teste de integração cobre esse caso).
- A variante `reference` sem dados mantém `data-sky="reference"` e nenhuma camada ativa.
- `body::before` e os estilos de `index.css` não foram tocados.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Convenções da linguagem do projeto | ✅ |
| Contratos de interface (APIs, mensagens) | ✅ |
| Logging | ✅ (não se aplica) |
| Interface de usuário | ✅ |
| Testes | ✅ |

## Checagens Estáticas

Comando: `cd frontend && npm run lint`
Linha de base (antes da task): limpa
Resultado final: limpa (exit 0)
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): nenhum

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: react-testing, vitest | lidas antes da implementação e não aplicadas por dependerem de scripts Python: webapp-testing | nenhuma aplicável adicional
MCPs do projeto: usados: playwright (ui-testing) para o smoke test; mcp-api-test (api-testing) não usado, pois a task não expõe serviço novo | context7 não necessário

## Testes executados

- Suíte do frontend (`npm test -- run`): 39 arquivos, 359 testes, todos passando. Inclui `SkyBackground.test.jsx` (13 testes, 6 novos) e `AppSky.test.jsx` (6 testes, novo).
- Smoke test via Playwright MCP, com frontend (5173) e backend (3000) no ar e sem mocks: pesquisa de "Curitiba" retornou `current.weather_code` 95 (trovoada), mapeado para `rain`. Resultado: `data-sky="rain"`, única camada ativa `sky-layer sky-rain is-active`, local exibido "Curitiba, Paraná", zero erros no console. Evidência: `prds/prd-painel-clima/task-screenshots/task-15-curitiba-rain.png`.
- Divergência do smoke em relação ao fluxo de sucesso: nenhuma.

## Recomendações

1. Opcional: em `AppSky.test.jsx`, asserir a URL e as opções passadas ao `fetch`, como já faz `AppWeather.test.jsx`.

## Veredito

**APROVADO.** A task atende RF-31, RF-32 e RF-33 no escopo entregue. Os testes passam, o lint está limpo, o smoke test confirma a variante `rain` com dados reais e não há pendências bloqueantes. Próximo passo: task 16.0.
