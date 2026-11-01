# Tarefa 6.0: SkyBackground (+tint), Header, Clock e Footer com montagem inicial no App

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementa o céu animado do protótipo (140 estrelas, lua, 3 nuvens à deriva, 2 estrelas cadentes) com as **2 camadas de tint** por condição (FR-31), o cabeçalho com relógio pt-BR em tempo real e o rodapé com texto adaptado. Inclui a **montagem inicial do `App.jsx`** (substituindo o placeholder do template Vite): `SkyBackground` + `main.dashboard` com `Header` e `Footer` — a região central será preenchida pelas tasks 9–15. Esta task torna o app visível pela primeira vez.

## Requisitos atendidos (FR)

- **FR-31** — tingimento sutil do fundo por condição (clear/cloudy/rain) via crossfade de camadas; não altera componentes/tipografia/cores de texto.
- **FR-32** — responsividade do céu (lua 56 px ≤ 920 px — CSS já portado na task 4).
- **FR-38** — relógio/data pt-BR em tempo real; rodapé **sem** afirmar que os dados são simulados (mantendo o estilo visual do protótipo).

## Referência visual (painel.html)

- **Elementos do céu, linhas 488–494** — `#stars` (140 estrelas geradas com os ranges de aleatoriedade das linhas 648–660: tamanho 0.8–2.6 px, opacidade-alvo 0.4–1.0, duração 2–5 s, delay 0–4 s), `.moon`, 3× `.bg-cloud` (mesmos inline styles: `top`/`width`/`height`/`animation-duration`/`animation-delay` negativos −20s/−80s/−45s) e 2× `.shoot` (+`.shoot2`).
- **`header.top`, linhas 498–510** — `.brand` (`.brand-mark` com `i-brand` + `h1` "Painel do Clima" + `small` "Tempo em tempo real") e `.clock` (`.time` + `.date`).
- **`footer`, linhas 618–620** — mesmo estilo; texto adaptado (FR-38).
- **JS do relógio, linhas 662–670** — `Intl.DateTimeFormat('pt-BR')`: hora `HH:MM:SS` e data longa ("segunda-feira, 27 de outubro"), tick a cada 1 s.
- CSS do céu/brand/clock: linhas 32–95 e 104–122 (já portadas na task 4 — reutilizar, sem criar novos valores).

## Subtarefas

- [x] 6.1 Criar `frontend/src/hooks/useClock.js`: retorna `{ time: 'HH:MM:SS', date: 'segunda-feira, 27 de outubro' }` via `Intl.DateTimeFormat('pt-BR')`, tick de 1 s, cleanup no unmount.
- [x] 6.2 Criar `frontend/src/components/SkyBackground.jsx`: `#stars` com as 140 estrelas (mesmos ranges de aleatoriedade do protótipo), `.moon`, 3× `.bg-cloud` (inline styles idênticos às linhas 490–492) e 2× `.shoot` (+ `.shoot2`); prop `tint: 'clear' | 'cloudy' | 'rain'`.
- [x] 6.3 Camadas de tint (FR-31): 2 `.tint-layer` fixas (cloudy/rain) entre o céu (z0) e o dashboard (z2), `pointer-events:none`, crossfade `opacity 1.2s ease` controlado por `data-tint` (camada ativa `opacity:1`, demais `0`). **Apenas** a cores/gradientes da tabela "Acréscimos" da TechSpec.
- [x] 6.4 Criar `frontend/src/components/Header.jsx` + `Clock.jsx`: estrutura idêntica às linhas 498–510 (`.top`/`.brand`/`.brand-mark`/`h1`/`small`/`.clock`/`.time`/`.date`), relógio via `useClock`.
- [x] 6.5 Criar `frontend/src/components/Footer.jsx`: texto adaptado (ex.: `<b>Painel do Clima</b> · dados reais via Open-Meteo · feito com React e Node.js`) — **sem** "dados simulados" (FR-38), mesmo estilo do protótipo.
- [x] 6.6 Modificar `frontend/src/App.jsx`: renderizar `IconSprite` + `SkyBackground` + `main.dashboard` com `Reveal` de `Header` (delay `--d:0s`) e `Footer` (`--d:.4s`); wrapper raiz com `data-tint` (valor inicial `clear`; passa a vir de `useWeather` na task 15); a região central (grid) fica como espaço reservado para as próximas tasks.
- [x] 6.7 Modificar `frontend/src/index.css` — **apêndice ao bloco 2** (após o portado, sem sobrescrever bloco 1): classes `.tint-layer` e os estados `data-tint` (cloudy/rain) — usando exclusivamente tokens do bloco 1 (as cores derivadas são as especificadas na tabela de acréscimos da TechSpec).
- [x] 6.8 Testes (unidade + integração + fumaça).

## Detalhes de Implementação

Ver `techspec.md`: "Design System → Céu animado (baseline noturna)" (valores exatos), "Acréscimos → Tint do fundo (FR-31)" (camadas, grupos de códigos, crossfade), "Interfaces Principais → Frontend" (`SkyBackground({ tint })`, `Header()`, `Clock()`), "Decisões Principais" (item 10 — `data-tint` no wrapper da raiz, não no `<body>`).

## Critérios de Sucesso

- **As seções entregues ficam idênticas aos trechos correspondentes do `painel.html`** — céu (linhas 488–494: 140 estrelas com os mesmos ranges, lua, 3 nuvens com os mesmos inline styles, 2 cadentes, animações `twinkle`/`moonGlow`/`drift`/`shoot`/`skyShift`), cabeçalho (linhas 498–510: mesma estrutura e classes `.top`/`.brand`/`.brand-mark`/`.clock`) e rodapé (linhas 618–620: mesmo estilo) — com as únicas diferenças autorizadas: o **texto** do rodapé (FR-38) e as camadas de tint (mandado pelo PRD, FR-31).
- Relógio: hora `HH:MM:SS` + data longa pt-BR **em tempo real** (tick 1 s — verificado com fake timers); dados do relógio vêm do `Intl` pt-BR, nunca de string fixa.
- `tint`: `clear` → apenas a baseline visível; `cloudy`/`rain` → camada correspondente em crossfade; componentes, tipografia e cores de texto inalterados (FR-31).
- Wrapper raiz com `data-tint`; sem nenhum estilo novo fora do design system (apêndice do bloco 2 só com `.tint-layer`/`data-tint`, tokens do bloco 1).
- App monta sem crash mostrando céu + cabeçalho + rodapé; lua 56 px em viewport ≤ 920 px (CSS portado).

## Testes da Tarefa

- [x] Testes de unidade (`frontend/src/__tests__/useClock.test.js`, `sky-background.test.jsx`, `header-footer.test.jsx`): `useClock` (formato pt-BR, tick 1 s, cleanup); `SkyBackground` (140 estrelas, 3 nuvens com os inline styles exatos, 2 cadentes, 2 camadas de tint, troca de `data-tint`); `Footer` (texto **não** contém "simulados").
- [x] Testes de integração: `Header` + `Clock` + `Footer` compostos (relógio pt-BR atualiza); `App` renderiza céu + cabeçalho + rodapé (a região central pode estar vazia).
- [x] Teste de fumaça do fluxo principal: `npm run dev` (`:5173`) — a página exibe o céu animado (estrelas/lua/nuvens presentes no DOM), o cabeçalho com relógio atualizando e o rodapé (fluxo visível entregue por esta task; cobre também o render do sprite da task 5).

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Criar: `frontend/src/components/SkyBackground.jsx`, `frontend/src/components/Header.jsx`, `frontend/src/components/Clock.jsx`, `frontend/src/components/Footer.jsx`, `frontend/src/hooks/useClock.js`, `frontend/src/__tests__/useClock.test.js`, `frontend/src/__tests__/sky-background.test.jsx`, `frontend/src/__tests__/header-footer.test.jsx`.
- Modificar: `frontend/src/App.jsx`, `frontend/src/index.css` (apêndice bloco 2: `.tint-layer`).
- Dependências já entregues: CSS portado e `IconSprite`/`Icon`/`Reveal` (tasks 4–5).
- Referência: `painel.html` (linhas 488–494, 498–510, 618–620, 648–670).
