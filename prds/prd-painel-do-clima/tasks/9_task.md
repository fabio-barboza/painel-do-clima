# Tarefa 9.0: SearchBar (busca + geolocalização + estado de busca)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementa a barra de busca do protótipo como componente React: campo de texto simples (sem autocomplete), botão "Pesquisar" (primary) e "Localização Atual" (ghost), disparo por **botão e Enter** (form semântico), estado de busca perceptível no botão (spinner + `aria-busy`) e a mensagem de erro de geolocalização abaixo da barra.

## Requisitos atendidos (FR)

- **FR-11** — campo de texto simples, **sem autocomplete**.
- **FR-12** — disparo pelo botão "Pesquisar" **e** pela tecla Enter.
- **FR-17** — botão dedicado de geolocalização do navegador.
- **FR-19** — geolocalização negada/indisponível → mensagem amigável (`.search-error`); busca por cidade segue funcional.
- **FR-30** — estado de busca perceptível no campo/botão.

## Referência visual (painel.html)

- **`.search`, linhas 512–523** — `role="search"`; ícone `i-search` (`.search-ico`); `input` com `placeholder="Pesquisar cidade ou região…"` e `aria-label` com o mesmo texto; `.search-btns` com `#btnSearch` (`.btn btn-primary`, ícone `i-search` + `.btn-text` "Pesquisar") e `#btnLocate` (`.btn btn-ghost`, ícone `i-gps` + `.btn-text` "Localização Atual" + `title="Usar minha localização"`).
- CSS já portado na task 4 (linhas 124–167: `.search`, `:focus-within` com halo, `.btn`, `.btn-primary`, `.btn-ghost`; linha 380–381: `#btnLocate` compacto ≤ 480 px) — **reutilizar, sem criar novos valores**.

## Subtarefas

- [x] 9.1 Criar `frontend/src/components/SearchBar.jsx`: props `{ onSubmit(city), onLocate, loading, geoError }`; `<form role="search" class="search">` (Enter via `onSubmit`), input controlado `type="text"` (sem `list`/`datalist` — FR-11), botões com os ids/classes exatos do protótipo (`#btnSearch`, `#btnLocate`); envia o valor com `trim()`.
- [x] 9.2 Estado de busca (FR-30): `loading` → classe aditiva `.btn-primary.is-loading` no `#btnSearch` (opacidade .75 + spinner inline `.spin` de 14 px no lugar do ícone; reutiliza o keyframe `spin` existente) + `aria-busy="true"` no form. **Apenas** estas classes entram no bloco 2 do `index.css`, usando exclusivamente tokens do bloco 1 (anel do spinner com `rgba(11,16,38,.35)` e topo `#0b1026`, por especificação da TechSpec).
- [x] 9.3 Geo-erro (FR-19): `geoError` → `.search-error` abaixo da search (`inline-flex`, gap 8 px, 12.5 px, `color:#ffc98b` — tom `.chip.hot`, ícone `i-drop` 14 px), mensagens por código (permissão negada / indisponível / tempo esgotado); persiste até a próxima ação bem-sucedida. **Apenas** `.search-error` entra no bloco 2.
- [x] 9.4 Testes (unidade + integração).

## Detalhes de Implementação

Ver `techspec.md`: "Componentização — mapa painel.html → React" (linha `.search`), "Acréscimos → Botão em busca (FR-30)" e "→ Geo-erro (FR-19)", "Animações e interações → Teclado/a11y" (form semântico, `role="search"`, `aria-label`, `aria-busy`), "Interfaces" (`SearchBar({ onSubmit, onLocate, loading, geoError })`).

## Critérios de Sucesso

- **A seção fica idêntica ao trecho de linhas 512–523 do `painel.html`** — mesma estrutura (form com `role="search"`, `.search-ico`, input, `.search-btns` com `#btnSearch`/`#btnLocate`), mesmas classes (`.search`, `.btn-primary`, `.btn-ghost`, `.btn-text`), mesmos ícones (`i-search`, `i-gps`), mesmo placeholder e `aria-label`, mesmas interações (focus-within, `:active scale(.95)`, hover, `#btnLocate` compacto ≤ 480 px) — com as diferenças autorizadas por PRD: spinner `is-loading` + `aria-busy` (FR-30) e `.search-error` (FR-19).
- Campo simples **sem autocomplete** (FR-11); Enter no campo e clique no botão disparam `onSubmit(city com trim)` (FR-12); envio vazio (só espaços) não dispara request (via `useWeather` — verificado na integração).
- `onLocate` dispara o botão de localização (FR-17).
- `loading` → `aria-busy="true"` + spinner no lugar do ícone do botão primary (FR-30).
- `geoError` → `.search-error` com a mensagem correspondente; o campo de busca segue utilizável (FR-19).
- Nenhum valor visual novo: o CSS adicionado ao bloco 2 usa apenas tokens do bloco 1.

## Testes da Tarefa

- [x] Testes de unidade (`frontend/src/__tests__/SearchBar.test.jsx`): renderiza input com rótulo acessível + 2 botões; Enter envia via form (evento `submit`); clique no botão envia; envio vazio não chama `onSubmit` com valor útil (ou chama e a camada de dados trata — definir e testar o contrato com a task 8: `onSubmit` sempre chamado, `useWeather` rejeita vazio); `loading` → `aria-busy` + spinner (ícone substituído); `geoError` → mensagem renderizada em `.search-error`.
- [x] Testes de integração: `SearchBar` + `useWeather` real (fetch mockado): submeter "Curitiba" → `loading` visível no botão → sucesso; submeter vazio → erro `bad-request` **sem** `fetch`; geolocalização negada (mock de `navigator.geolocation`) → `.search-error` amigável e a busca por cidade continua funcionando.
- [x] Teste de fumaça: **omitido** — componente ainda não montado no App; o fluxo visível (busca no painel) é coberto pela fumaça da task 15.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Criar: `frontend/src/components/SearchBar.jsx`, `frontend/src/__tests__/SearchBar.test.jsx`.
- Modificar: `frontend/src/index.css` (apêndice bloco 2: `.is-loading`, `.spin`, `.search-error`).
- Dependências já entregues: CSS portado (task 4), `Icon` (task 5), `useWeather` (task 8).
- Referência: `painel.html` (linhas 512–523).
