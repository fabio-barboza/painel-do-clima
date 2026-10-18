# Tarefa 10.0: CurrentWeather + UVBar

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Cria o card de condições climáticas atuais: `CurrentWeather.jsx` (temperatura, umidade, vento, precipitação, ícone animado e label do clima em PT-BR — FR-5/FR-6) e `UVBar.jsx` (barra de gradiente verde→vermelho com o marcador do índice UV atual — FR-7). Integra o bloco na área de sucesso do `App.jsx` e deriva o UV de `hourly.uv_index` (decisão D8).

<requirements>
- `CurrentWeather`: temperatura (°C), umidade (%), velocidade do vento (km/h) e precipitação (mm) — unidades métricas fixas (FR-6); ícone animado (`WeatherIcon` por categoria) e label do clima em PT-BR (`getWeatherLabelPt`)
- `UVBar`: barra de gradiente **verde→vermelho** com marcador na posição do valor atual (FR-7); escala fixa do índice UV (0–11); **acessível**: `aria-label` com o valor e texto alternativo legível por leitor de tela (requisito do PRD: descrição para a barra UV)
- Derivação do UV: `hourly.uv_index` no índice em que `hourly.time` casa com a hora de `current.time` (D8); se a suposição for invalidada pelo curl (Tarefa 2.7), fallback para `daily.uv_index_max` do dia atual
- Componentes apresentacionais (recebem dados por props — view model derivada documentada na techspec)
- Acessibilidade: labels para leitores de tela, contraste AA no tema ativo
- Sem comentários em código novo (D13)
</requirements>

## Subtarefas

- [x] 10.1 Implementar `UVBar.jsx` (gradiente verde→vermelho, marcador posicional, `aria-label` acessível)
- [x] 10.2 Implementar a derivação do UV (índice de `hourly` casando com `current.time`; fallback `daily.uv_index_max` se aplicável)
- [x] 10.3 Implementar `CurrentWeather.jsx` (valores métricos + ícone animado + label PT-BR + UVBar)
- [x] 10.4 Integrar o card na área de sucesso do `App.jsx`
- [x] 10.5 Criar testes de unidade dos componentes (ver "Testes da Tarefa")

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): "Arquitetura do Sistema" (tabela frontend — `CurrentWeather.jsx`, `UVBar.jsx`), "Modelos de Dados" (view model `current` com `uvIndex` derivado de `hourly.uv_index` casando com `current.time`) e "Considerações Técnicas" (decisão D8 — UV a partir do `hourly`). FR-5, FR-6, FR-7 e FR-20 do PRD.

## Critérios de Sucesso

- Valores atuais renderizados em unidades métricas (°C, %, km/h, mm)
- UVBar com marcador na posição correta do valor atual; `aria-label` legível
- Ícone animado da categoria atual e label PT-BR corretos
- Card integrado ao estado de sucesso do painel
- Suíte de testes verde (`cd frontend && npm run test -- run`)
- Sem comentários em código novo (D13)

## Testes da Tarefa

- [x] Testes de unidade: `frontend/src/__tests__/CurrentWeather.test.jsx` — valores renderizados (temperatura, umidade, vento, precipitação) + barra UV presente
- [x] Testes de unidade: `frontend/src/__tests__/UVBar.test.jsx` — posição do marcador proporcional ao valor + label acessível (`aria-label`)

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/components/CurrentWeather.jsx` (novo)
- `frontend/src/components/UVBar.jsx` (novo)
- `frontend/src/App.jsx` (modificar — integrar o card de sucesso)
- `frontend/src/__tests__/CurrentWeather.test.jsx` (novo)
- `frontend/src/__tests__/UVBar.test.jsx` (novo)
