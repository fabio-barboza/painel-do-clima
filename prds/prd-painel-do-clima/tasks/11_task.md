# Tarefa 11.0: StatsGrid + StatCard (estatísticas)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementa a fileira "Detalhes do clima" (`section.grid-stats`): 4 cards de estatística (sensação térmica, umidade, vento, índice UV), cada um com ícone animado (cor por ícone), rótulo, valor e barra de progresso proporcional ao valor (`--w`), exatamente como no protótipo.

## Requisitos atendidos (FR)

- **FR-22** — 4 cards com ícone animado, rótulo, valor e barra proporcional: sensação térmica, umidade (%), vento (km/h + direção em pontos cardeais), índice UV (valor + rótulo qualitativo pelas faixas convencionais).

## Referência visual (painel.html)

- **`section.grid-stats`, linhas 573–606** — 4× `.card.stat`: `.stat-top` (`.stat-ico` com cor inline por ícone — thermo `#ff9f7a`, drop `#7cc4ff`, wind `#9be8c9`, uv `#ffd76a` — + ícone `i-thermo`/`i-drop`/`i-wind`/`i-uv` + `.stat-label`), `.stat-val` (número + `small` para unidade/rótulo) e `.bar > i` com `--w` inline.
- CSS já portado na task 4 (linhas 253–275: grid 4 colunas, animação `bob` com delays 0/.6/1.2/1.8 s nos ícones, barra com fill em gradiente `--cyan→--violet` e `transition: width 1.3s … .45s` ativada por `.reveal.in`; 2 colunas ≤ 920 px) — **reutilizar, sem criar novos valores**.

## Subtarefas

- [x] 11.1 Criar `frontend/src/components/StatCard.jsx`: `.card.stat` com a estrutura exata dos cards do protótipo; props `{ icon, color, label, value, unit, barPercent }` (`unit` renderizado em `small`; `barPercent` → `--w` inline).
- [x] 11.2 Criar `frontend/src/components/StatsGrid.jsx`: `section.grid-stats` com os 4 cards derivados de `data` (regras da TechSpec "Derivações exibidas"): Sensação térmica (`apparent_temperature` °C; barra escala −10…40 °C), Umidade (`relative_humidity_2m` %, barra = valor direto 0–100), Vento (`wind_speed_10m` km/h + `windCardinal(wind_direction_10m)` em `small`; barra escala 0–40 km/h), Índice UV (`uv_index` + `uvLabel` em `small`; barra escala 0–12); **piso de 4 % na barra para valor zero**.
- [x] 11.3 Testes (unidade + integração).

## Detalhes de Implementação

Ver `techspec.md`: "Componentização" (linha `section.grid-stats`), "Derivações exibidas" (escalas das barras e piso de 4 %), "Modelos de Dados" (faixas de UV, cardinais), "Interfaces" (`StatCard({ icon, color, label, value, unit, barPercent })`, `StatsGrid({ data })`).

## Critérios de Sucesso

- **A seção fica idêntica ao trecho de linhas 573–606 do `painel.html`** — mesma estrutura (4× `.card.stat` com `.stat-top`/`.stat-ico`/`.stat-label`/`.stat-val`/`.bar > i`), mesmas classes, mesmos ícones e cores por ícone (`#ff9f7a`, `#7cc4ff`, `#9be8c9`, `#ffd76a`), mesmas animações (`bob` com delays, barra animada por `.reveal.in`, grid 2 colunas ≤ 920 px) — **com valores 100 % da resposta do backend** (FR-35): nenhum valor de exemplo do protótipo ("62 %", "14 km/h · NNO", "6 · Alto") fixo no código.
- Barras: umidade = valor direto; vento = escala 0–40 km/h; UV = escala 0–12; sensação = escala −10…40 °C; piso de 4 % para valor zero.
- UV exibe rótulo qualitativo pelas faixas WHO (FR-22); vento exibe a direção em pontos cardeais pt-BR.
- Valores extremos (umidade 0/100, vento 0, uv null → 0) não quebram layout nem barra.

## Testes da Tarefa

- [x] Testes de unidade (`frontend/src/__tests__/StatsGrid.test.jsx`): renderiza 4 cards com os rótulos; `--w` correto por escala (ex.: umidade 62 → 62 %; vento 14 → 35 %; UV 6 → 50 %; sensação dentro da escala); piso de 4 % para valor zero; ícones/cores por posição.
- [x] Testes de integração: `StatsGrid` com `WeatherResponse` sintético completo — vento com cardinal ("NNO" para a direção correspondente), UV com rótulo ("Alto" para 6), `uv_index` null → 0/"Baixo", valores extremos sem quebra.
- [ ] Teste de fumaça: **omitido** — componente ainda não montado no App; o fluxo visível é coberto pela fumaça da task 15.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Criar: `frontend/src/components/StatsGrid.jsx`, `frontend/src/components/StatCard.jsx`, `frontend/src/__tests__/StatsGrid.test.jsx`.
- Dependências já entregues: CSS portado (task 4), `Icon` (task 5), `format`/`weatherCodes` (task 7).
- Referência: `painel.html` (linhas 573–606).
