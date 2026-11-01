# Tarefa 14.0: EmptyState, Skeleton e ErrorState (estados ausentes do protótipo)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementa os três estados visuais que **não existem no protótipo** — vazio (primeiro acesso), carregando (skeleton) e erro (404/400/rede) — compostos **exclusivamente com o design system portado na task 4** (mesmos cards glassmorphism, ícones do sprite, tipografia, cores, bordas, raios e espaçamentos), de modo que o painel carregado continue indistinguível do `painel.html`.

## Requisitos atendidos (FR)

- **FR-10** — estado vazio no primeiro acesso: convite claro para pesquisar/usar localização, busca em destaque, mesmo design system.
- **FR-30** — skeleton loading nas seções (atual, estatísticas, gráfico, 7 dias) com o mesmo formato dos componentes carregados.
- **FR-14** — cidade não encontrada (404): mensagem amigável orientando nova tentativa, painel utilizável.
- **FR-15** — falha de comunicação (rede/5xx): feedback claro + ação de "tentar novamente".
- **FR-16** — parâmetros inválidos/vazios (400): feedback indicando que um nome válido precisa ser informado.
- **FR-37** — estados ausentes compostos exclusivamente com o design system do protótipo.

## Referência visual (painel.html)

- **Não há trecho correspondente no protótipo** — esses estados não existem em `painel.html`. A composição usa **somente** o design system portado (bloco 1 da task 4): `.card` (glassmorphism), `.btn`/`.btn-primary`/`.btn-ghost`, `.chip`, `.ico` (ícones `i-search` e `i-cloud` do sprite), tokens `--text`/`--muted`/`--faint`/`--radius`. Especificações exatas dos acréscimos: tabela "Acréscimos novos" da TechSpec (linhas "Estado vazio (FR-10)", "Skeleton (FR-30)", "Erros (FR-14/15/16/37)").

## Subtarefas

- [x] 14.1 Criar `frontend/src/components/EmptyState.jsx`: um `.card` centralizado (no lugar de `grid-main`/stats/weekly) — ícone `i-search` a 56 px com `color:var(--muted)` e `drop-shadow` (cor ajustada para `rgba(110,231,255,.25)`, por especificação), `h2` 17 px/600 "Pesquise uma cidade", `.sub` 12.5 px `var(--muted)` ("Digite o nome de uma cidade acima ou use sua localização para ver o clima agora."), fileira com `btn btn-primary` "Pesquisar" (foca o input) e `btn btn-ghost` "Localização Atual" (dispara locate); props `{ onSearchFocus, onLocate }`.
- [x] 14.2 Criar `frontend/src/components/Skeleton.jsx`: prop `variant: 'panel'` — blocos `.sk` (shimmer) espelhando o layout carregado: card atual (trilho `.loc`, círculo 96 px, bloco de temperatura, 3 chips), card gráfico (título + retângulo 100%×200), 4 stats (rótulo, valor, barra) e 7 dias (nome, ícone 40 px, temps, rain) — nos mesmos containers `.card`/`.grid-main`/`.grid-stats`/`.weekly-grid`; revelação instantânea (sem reveal animado).
- [x] 14.3 Criar `frontend/src/components/ErrorState.jsx`: `.card` centralizado (mesma estrutura do vazio) — ícone `i-cloud` a 48 px `var(--muted)`; `h2` + `.sub` por `kind`: `not-found` → "Cidade não encontrada" / "Verifique a grafia do nome e tente novamente." + `btn btn-primary` "Nova busca" (foca input e seleciona o texto); `bad-request` → "Informe um nome de cidade" / "Digite o nome de uma cidade válida (ex.: Curitiba)." + mesmo botão; `network` → "Não foi possível carregar o clima" / "Verifique sua conexão e tente novamente." + `btn btn-primary` "Tentar novamente" (reexecuta a última consulta); props `{ kind, message, onRetry }` + ação de foco quando aplicável.
- [x] 14.4 Modificar `frontend/src/index.css` — **apêndice ao bloco 2**: `.sk` (`background:rgba(255,255,255,.08)`, `border-radius:6px`, shimmer `linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent)`, `background-size:200% 100%`, `animation: shimmer 1.6s linear infinite`) e o keyframe `shimmer` (único gradiente novo, construído com `rgba(255,255,255,α)` — permitido pela TechSpec) + ajustes de tamanho/drop-shadow dos ícones dos estados vazio/erro — **usando exclusivamente tokens do bloco 1** (sem novos valores de cor/raio/sombra fora da especificação).
- [x] 14.5 Testes (unidade + integração).

## Detalhes de Implementação

Ver `techspec.md`: "Acréscimos novos (mandados pelo PRD…)" — linhas "Estado vazio (FR-10)", "Skeleton (FR-30)" e "Erros (FR-14/15/16/37)" (especificações exatas de cada estado); "Estratégia de CSS" (bloco 2 sem sobrescrever o bloco 1); "Interfaces" (`EmptyState({ onSearchFocus, onLocate })`, `Skeleton({ variant })`, `ErrorState({ kind, message, onRetry })`).

## Critérios de Sucesso

- **FR-37 (obrigatório): os três estados usam exclusivamente o design system portado** — apenas `.card`, `.btn`/`.btn-primary`/`.btn-ghost`, `.chip`, `.ico` + ícones do sprite (`i-search`, `i-cloud`) e tokens `--text`/`--muted`/`--faint`/`--radius`; **nenhuma** cor, raio, borda, sombra ou efeito novo fora do bloco 1 (exceção única autorizada: o gradiente de shimmer, construído com `rgba(255,255,255,α)`); teste automatizado asserindo que todas as classes renderizadas existem em `index.css`.
- Estado vazio (FR-10): convite claro + 2 botões funcionais ("Pesquisar" foca o input; "Localização Atual" chama `onLocate`).
- Skeleton (FR-30): espelha o layout carregado (mesmos containers `.card`/grids, mesmas posições de elementos), revelação instantânea (sem animação de reveal), shimmer sutil.
- Erros (FR-14/15/16): mensagem e ação corretas por `kind` — 404 → "Nova busca" (foca/seleciona o input); 400 → "Informe um nome de cidade"; rede → "Tentar novamente" chama `onRetry`; painel permanece utilizável (a busca não é desabilitada).
- Contraste mantido do design system (texto claro sobre fundo escuro) em todos os estados (acessibilidade do PRD).

## Testes da Tarefa

- [x] Testes de unidade (`frontend/src/__tests__/states.test.jsx`): `EmptyState` (rótulos exatos; botões disparam `onSearchFocus`/`onLocate`); `Skeleton` (blocos `.sk` espelhando o layout — card atual, gráfico, 4 stats, 7 dias; revelação instantânea); `ErrorState` (título/subtítulo por `kind`; `onRetry` chamado no botão de rede; botão de 404/400 chama a ação de foco).
- [x] Testes de integração: cada estado renderizado no lugar da região de dados (estrutura do App) — (a) asserção FR-37: toda classe usada nos três estados existe em `index.css` (extraída do arquivo no teste); (b) estados substituem as seções sem quebrar header/busca/rodapé; (c) após erro, a busca segue funcional (form habilitado).
- [x] Teste de fumaça: **omitido (deferido para task 15)** — estados ainda não montados no App; o fluxo visível (app nos 4 estados) é coberto pela fumaça da task 15.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Criar: `frontend/src/components/EmptyState.jsx`, `frontend/src/components/Skeleton.jsx`, `frontend/src/components/ErrorState.jsx`, `frontend/src/__tests__/states.test.jsx`.
- Modificar: `frontend/src/index.css` (apêndice bloco 2: `.sk` + keyframe `shimmer`, ajustes de ícones dos estados).
- Dependências já entregues: design system portado (task 4), `Icon`/sprite (task 5).
- Especificação: `techspec.md` — tabela "Acréscimos novos".
