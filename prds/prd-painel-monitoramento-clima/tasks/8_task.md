# Tarefa 8.0: Casca do painel (App, Skeletons, ErrorState)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Monta a casca do painel: `App.jsx` orquestra os estados da busca via `useWeather` e aplica o **tema dinâmico** na raiz; `Skeletons.jsx` cobre o estado de carregamento (FR-17); `ErrorState.jsx` cobre os erros com mensagem amigável e retry (FR-15/FR-16). O painel é a rota principal `/`, sem telas intermediárias (FR-4). Os componentes de dados (clima atual, gráfico, semana) entram nas Tarefas 9.0–12.0.

<requirements>
- `App.jsx`: consome `useWeather`; aplica o tema na raiz do painel via `data-theme` = `getTheme(categorizeWeatherCode(current.weather_code))` nos estados de sucesso; monta o layout completo (SearchBar + área de conteúdo)
- Estados renderizados: `idle` → painel inicial com busca visível e sem dados; `loading` → skeleton; `error` → `ErrorState`; `success` → layout de dados (área reservada — componentes reais entram nas Tarefas 9.0–12.0)
- `Skeletons.jsx`: skeleton loading em substituição aos cards e ao gráfico (FR-17), usando os estilos base da Tarefa 4.0
- `ErrorState.jsx`: mensagem amigável por tipo de erro — cidade não encontrada (orienta nova tentativa, FR-15) vs falha de comunicação/inválido (FR-16) + botão "Tentar novamente" que reexecuta a última busca (callback `onRetry`)
- Rota principal `/` — o painel é a própria aplicação (FR-4; não há tela intermediária)
- Acessibilidade: estrutura semântica de página, labels para leitores de tela, foco visível
- Sem comentários em código novo (D13)
</requirements>

## Subtarefas

- [x] 8.1 Implementar `Skeletons.jsx` (skeleton de cards + gráfico)
- [x] 8.2 Implementar `ErrorState.jsx` (mensagens por tipo + botão "Tentar novamente" com `onRetry`)
- [x] 8.3 Implementar `App.jsx` (orquestração de estados, tema dinâmico via `data-theme`, layout com SearchBar)
- [x] 8.4 Criar testes de unidade dos novos componentes e teste integrado do `App` (ver "Testes da Tarefa")

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): "Arquitetura do Sistema" (tabela frontend — `App.jsx`, `ErrorState.jsx`, `Skeletons.jsx`), "Modelos de Dados" (derivado do tema: `getTheme(categorizeWeatherCode(current.weather_code))` → `clear|cloudy|rain`) e o fluxo de dados (SearchBar → useWeather → weatherApi). FR-4, FR-15, FR-16, FR-17 e FR-19 do PRD definem o comportamento.

## Critérios de Sucesso

- Painel acessível diretamente em `/`, sem tela intermediária
- `loading` → skeleton substitui cards e gráfico
- `error` → mensagem amigável correta por tipo; "Tentar novamente" reexecuta a última busca
- `success` → `data-theme` aplicado na raiz conforme o `weather_code` atual
- `idle` → busca visível, sem dados
- Estrutura semântica e labels acessíveis
- Suíte de testes verde (`cd frontend && npm run test -- run`)
- Sem comentários em código novo (D13)

## Testes da Tarefa

- [x] Testes de unidade: `frontend/src/__tests__/Skeletons.test.jsx` — renderiza skeleton de cards e gráfico
- [x] Testes de unidade: `frontend/src/__tests__/ErrorState.test.jsx` — cidade não encontrada vs falha de rede; callback de retry chamado ao clicar em "Tentar novamente"
- [x] Testes de integração: `frontend/src/__tests__/App.test.jsx` — render integrado (componentes internos de verdade, `fetch` mockado): estado inicial, loading (skeleton), erro (mensagem + retry) e sucesso (tema aplicado)

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/App.jsx` (modificar)
- `frontend/src/components/Skeletons.jsx` (novo)
- `frontend/src/components/ErrorState.jsx` (novo)
- `frontend/src/__tests__/App.test.jsx` (modificar/estender)
- `frontend/src/__tests__/Skeletons.test.jsx` (novo)
- `frontend/src/__tests__/ErrorState.test.jsx` (novo)
