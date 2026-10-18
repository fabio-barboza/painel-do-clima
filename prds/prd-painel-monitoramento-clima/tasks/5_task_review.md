# Review: Task 5.0 - Utilitários (weatherCode) e cliente de API (weatherApi)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-17
**Arquivo da task**: 5_task.md
**Status**: APROVADO

## Resumo

Implementada a camada de dados do frontend: `frontend/src/utils/weatherCode.js` (mapeamento completo da tabela WMO → categoria da techspec, `getTheme`, labels PT-BR, `formatHour`/`formatDayPt`) e `frontend/src/services/weatherApi.js` (`WeatherApiError` + `fetchWeather` com `cache: 'no-store'` obrigatório e URL absoluta via `VITE_API_URL`). Criado `frontend/.env.local` (fora do Git, confirmado via `git check-ignore`) com `VITE_API_URL=http://localhost:3000`. Criados os dois arquivos de teste especificados pela task. Suíte completa do frontend (99 testes) e do backend (45 testes) passando; ESLint sem erros.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/utils/weatherCode.js` | ✅ OK | 0 |
| `frontend/src/services/weatherApi.js` | ✅ OK | 0 |
| `frontend/.env.local` | ✅ OK | 0 |
| `frontend/src/__tests__/weatherCode.test.js` | ✅ OK | 0 |
| `frontend/src/__tests__/weatherApi.test.js` | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. `frontend/src/utils/weatherCode.js` — o fallback para código WMO desconhecido (`categorizeWeatherCode(999)` → `'cloudy'`, `getWeatherLabelPt(123)` → `'Condição desconhecida'`) é uma decisão de projeto não explicitada na techspec (a tabela só cobre os códigos listados). A escolha é neutra e documentada em teste; sem impacto, mas vale registrar como convenção para as tasks seguintes (componentes de ícone).

## ✅ Destaques Positivos

- Tabela WMO → categoria fiel à techspec (29 códigos cobertos), implementada como dados (constantes de tabela) e não como cadeias de `if` — legível e fácil de auditar.
- `formatDayPt` usa `Date.UTC`/`getUTCDay`, imune a fuso horário local — o resultado "seg., 19/10" é determinístico em qualquer ambiente (validado por teste com datas de sábado/domingo/segunda/terça).
- `fetchWeather` lê `import.meta.env.VITE_API_URL` no momento da chamada (não no import), o que permite testar com `vi.stubEnv` sem mockar o módulo.
- Tratamento de erro em três camadas cobertas por testes: falha de rede (`NETWORK`, `status: null`), não-2xx com corpo JSON do backend (propaga `error`/`message` do payload: 400/404/500) e não-2xx sem corpo JSON válido (`UNKNOWN`).
- `cache: 'no-store'` presente em toda chamada, com teste que executa duas buscas e verifica o parâmetro de cada chamada — requisito de produto "zero cache HTTP" coberto de forma verificável.
- Sem comentários em nenhum arquivo novo (D13) e nomes em inglês, camelCase, verbais — conformidade com `code-standards.md`.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Linguagem/Runtime | ✅ (frontend ESM, conforme AGENTS.md) |
| REST/HTTP | ✅ (GET, URL absoluta via `VITE_API_URL`, `Accept: application/json`) |
| Logging | ✅ (N/A — camada sem logging próprio; logging é do backend) |
| Framework UI | ✅ (N/A — task sem componentes de UI) |
| Testes | ✅ (16 testes de unidade + 9 de integração, todos passando) |

## Recomendações

1. Ao implementar as tasks seguintes (hook `useWeather` e componentes), manter o contrato de `WeatherApiError` consumido por `error.type` (`CITY_NOT_FOUND` → cidade não encontrada; `NETWORK`/`UNKNOWN` → falha de comunicação) — os códigos já estão alinhados com os payloads do backend.
2. Na task de `WeatherIcon`, tratar o fallback `'cloudy'`/`'Condição desconhecida'` explicitamente (ícone genérico) para cobrir códigos WMO fora da tabela.
3. O `frontend/.env.local` não é versionado; a task 17.0 (documentação final) deve registrar a necessidade de criá-lo em `README.md`/`.env.example` do frontend para novos clones.

## Gap de E2E (documentado)

O MCP `playwright` (browser-testing) está configurado, mas esta task entrega apenas módulos de camada de dados — não há UI nova para exercitar (o `App.jsx` ainda é o scaffold da task 4.0, e a busca só aparece na task 7.0). Os testes especificados pela task ("Testes da Tarefa") são de unidade e integração com `fetch` mockado, todos executados e passando. Nenhum gap funcional: o contrato client ↔ API está coberto pelos testes de integração.

## Veredito

**APROVADO.** Todos os requisitos da task foram implementados e testados: mapeamento WMO completo, temas, labels PT-BR, formatadores, `fetchWeather` com `cache: 'no-store'` e mapeamento de erros, `.env.local` fora do Git. Suítes frontend (99) e backend (45) verdes, lint limpo. Nenhuma ação bloqueante; recomendações acima são orientações para as tasks seguintes.
