# Tarefa 6.0: Hook `useWeather` (máquina de estados + guarda de obsoletas)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Cria `frontend/src/hooks/useWeather.js` — a máquina de estados da busca do painel: orquestra `fetchWeather` e expõe os estados `idle` | `loading` | `success` | `error` com erro tipado. Inclui a **guarda contra resposta obsoleta** (contador de requisições — decisão D12): se o usuário dispara uma nova busca enquanto a anterior está em voo, apenas o resultado da busca mais recente é exibido (caso extremo do PRD).

<requirements>
- Retorno do hook: `{ status, data, error, search }` com:
  - `status: 'idle' | 'loading' | 'success' | 'error'`
  - `data: WeatherResponse | null`
  - `error: { type: 'city_not_found' | 'network' | 'invalid', message: string } | null`
  - `search(city: string): void`
- `search(city)` → `loading` → `fetchWeather({ city })` → `success` (com `data`) ou `error`
- Mapeamento de `WeatherApiError` para erro tipado: 404/`CITY_NOT_FOUND` → `city_not_found`; 400/`VALIDATION` → `invalid`; 500/`INTERNAL` e falha de rede → `network`
- **Guarda contra resposta obsoleta**: contador de requisições — respostas de buscas anteriores são descartadas (D12)
- Ainda SEM `locate()` (geolocalização entra na Tarefa 13.0)
- Apenas hooks para estado (sem Redux/store global — decisão D11)
- Mocks apenas de serviços externos (`fetch`); sem comentários em código novo (D13)
</requirements>

## Subtarefas

- [x] 6.1 Implementar o esqueleto do hook (`status`, `data`, `error`)
- [x] 6.2 Implementar `search(city)` com fluxo `idle → loading → success/error`
- [x] 6.3 Implementar a guarda contra resposta obsoleta (contador de requisições)
- [x] 6.4 Implementar o mapeamento de `WeatherApiError` → erro tipado (`city_not_found` / `network` / `invalid`)
- [x] 6.5 Criar testes de unidade do hook (ver "Testes da Tarefa")

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): "Interfaces Principais" (assinatura exata de `useWeather`), "Modelos de Dados" (forma de `error`) e "Considerações Técnicas" (decisões D11 — apenas hooks; D12 — guarda contra resposta obsoleta). O caso extremo correspondente está no PRD ("Nova busca durante carregamento da anterior").

## Critérios de Sucesso

- Fluxo `idle → loading → success` com `data` preenchida após busca válida
- Fluxo `idle → loading → error` com mensagem amigável e tipo correto
- 404 da API → `error.type === 'city_not_found'`; 400 → `invalid`; 500/rede → `network`
- Duas buscas em sequência (primeira responde depois da segunda): apenas a última renderiza
- Suíte de testes verde (`cd frontend && npm run test -- run`)
- Sem comentários em código novo (D13)

## Testes da Tarefa

- [x] Testes de unidade: `frontend/src/__tests__/useWeather.test.js` — fluxo de estados (idle→loading→success/error); guarda de resposta obsoleta (duas buscas em sequência, apenas a última renderiza); 404 → erro `city_not_found` com mensagem amigável

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/hooks/useWeather.js` (novo)
- `frontend/src/__tests__/useWeather.test.js` (novo)
- `frontend/src/services/weatherApi.js` (dependência — criado na Tarefa 5.0)
