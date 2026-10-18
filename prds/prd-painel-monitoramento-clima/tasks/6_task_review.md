# Review: Task 6.0 - Hook `useWeather` (máquina de estados + guarda de obsoletas)

**Revisor**: AI Code Reviewer
**Data**: 2026-10-17
**Arquivo da task**: 6_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Criado `frontend/src/hooks/useWeather.js` — a máquina de estados da busca do painel: expõe `{ status, data, error, search }` com os estados `idle` | `loading` | `success` | `error`, orquestra `fetchWeather` do módulo real (Task 5.0) e implementa a guarda contra resposta obsoleta via contador de requisições em `useRef` (decisão D12), mais o mapeamento de `WeatherApiError` para erro tipado (`city_not_found` / `invalid` / `network`). `locate()` intencionalmente ausente (entra na Task 13.0), conforme o requisito da task. Criado `frontend/src/__tests__/useWeather.test.js` com 9 testes de unidade que exercitam o fluxo de estados, os quatro raios de mapeamento de erro, a URL enviada ao backend e os dois sentidos da guarda de obsoletas (resposta e erro obsoletos descartados), mockando apenas o `fetch` global (`vi.stubGlobal`) + `VITE_API_URL` (`vi.stubEnv`), na convenção já estabelecida por `weatherApi.test.js`. Suíte completa do frontend (108 testes) e do backend (45 testes) passando; ESLint sem erros.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| `frontend/src/hooks/useWeather.js` | ✅ OK | 1 menor |
| `frontend/src/__tests__/useWeather.test.js` | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

1. `frontend/src/hooks/useWeather.js` — a mensagem de fallback para falha de rede (`'Falha de comunicação com o servidor. Tente novamente.'`) é uma constante local que duplica a mensagem já produzida por `weatherApi.js` (código `NETWORK`). Em cenários reais os dois caminhos raramente divergem (o `fetchWeather` sempre converte falha de rede em `WeatherApiError`), mas a duplicação de copy PT-BR em dois módulos pode divergir em manutenção futura. Sugestão: exportar a constante de `weatherApi.js` e importá-la no hook (refinamento opcional, sem impacto funcional).

## ✅ Destaques Positivos

- Guarda de obsoletas fiel à decisão D12: contador monotônico em `useRef` capturado por closure em cada `search`; as duas callbacks (sucesso **e** erro) verificam a identidade antes de escrever estado — o teste comprova que tanto uma resposta obsoleta quanto um **erro** obsoleto são descartados, não apenas o resultado.
- Mapeamento de erro cobre os dois eixos (`status` **ou** `code`) para `city_not_found` e `invalid`, exatamente como pedido pela task ("404/`CITY_NOT_FOUND`", "400/`VALIDATION`"), e o raio de fallback `network` captura 500/`INTERNAL`, `UNKNOWN` e erros não-`WeatherApiError` (inclusive não-`Error`), com mensagem amigável de fallback.
- Testes exercitam o módulo real de `fetchWeather` (mock apenas do `fetch` global + `VITE_API_URL` via `vi.stubEnv`), validando a integração hook ↔ API client, incluindo a URL codificada (`city=S%C3%A3o%20Paulo`) — requisito "mocks apenas de serviços externos" cumprido à letra.
- O teste da guarda usa promise com resolução controlada (`deferredPromise`), determinístico e sem timers/fake-time: dispara duas buscas, deixa a segunda concluir, resolve a primeira e re-asserta que o estado continua o da busca mais recente.
- `search` envolto em `useCallback` com deps vazias (depende apenas de ref e setters estáveis) — identidade estável para consumo futuro pelos componentes (Tasks 7.0/8.0) e validado pelo `eslint-plugin-react-hooks` (lint limpo).
- Sem comentários em nenhum arquivo novo (D13), estado apenas em hooks locais (D11), nomes em camelCase, funções com verbo, `toTypedError` com early returns e 2 níveis máximos de aninhamento — conformidade com `code-standards.md`.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Linguagem/Runtime | ✅ (frontend ESM, conforme AGENTS.md) |
| REST/HTTP | ✅ (N/A direto no hook — a chamada HTTP é do `fetchWeather` da Task 5.0, com `cache: 'no-store'`) |
| Logging | ✅ (N/A — camada frontend sem logging próprio) |
| Framework UI | ✅ (React 19, hooks apenas — `useState`/`useCallback`/`useRef`, sem store global, D11) |
| Testes | ✅ (9 testes de unidade do hook, todos passando; suíte total 108 frontend + 45 backend verdes) |

## Recomendações

1. (Opcional) Consolidar a mensagem de fallback de rede exportando a constante de `weatherApi.js` (ver Problemas Menores #1) — pode ser feito junto com a Task 8.0 (casca do painel), que primeiro consome `error.message` na UI.
2. Na Task 8.0 (App), ao integrar o hook, aproveitar a identidade estável de `search` (useCallback) para evitar re-renders desnecessários no `SearchBar` da Task 7.0.
3. Na Task 13.0 (geolocalização), o `locate()` deve reutilizar o **mesmo** contador de requisições da guarda (D12) para que uma busca manual em voo também descarte o resultado obsoleto da geolocalização — a estrutura atual (contador único no hook) já permite isso sem refatoração.

## Gap de E2E (documentado)

O MCP `playwright` (browser-testing) está configurado, mas esta task entrega apenas o hook — ainda não há UI que o consuma: `App.jsx` permanece o scaffold da Task 4.0, o `SearchBar` entra na Task 7.0 e a integração do hook no painel na Task 8.0. Não há, portanto, comportamento desta task observável no navegador antes dessas tasks. Os testes especificados pela task ("Testes da Tarefa") são de unidade com `fetch` mockado, todos executados e passando; a validação E2E do fluxo de busca ficará a cargo das Tasks 14.0–16.0 (Playwright), como sequenciado na techspec.

## Veredito

**APROVADO COM OBSERVAÇÕES.** Todos os requisitos e critérios de sucesso da task foram implementados e testados: assinatura `{ status, data, error, search }` conforme a techspec, fluxo `idle → loading → success/error`, mapeamento completo de `WeatherApiError` (404 → `city_not_found`, 400 → `invalid`, 500/rede → `network`), guarda contra resposta obsoleta (D12) validada nos dois sentidos (resposta e erro), sem `locate()` (reservado à Task 13.0), sem comentários (D13). Suítes frontend (108) e backend (45) verdes, lint limpo. A única observação é menor e não bloqueante; as recomendações são orientações para as Tasks 7.0/8.0/13.0.
