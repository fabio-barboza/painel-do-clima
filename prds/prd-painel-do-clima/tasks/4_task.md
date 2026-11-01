# Tarefa 4.0: Fundação do frontend: index.html, port verbatim do CSS (design system), proxy Vite e .env.example

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Prepara a base do frontend e **porta o design system do protótipo antes de qualquer componente visual** (regra obrigatória desta feature): `index.html` (lang pt-BR, título, meta, fonte Inter com os mesmos `preconnect`/`<link>` do protótipo), `index.css` com o **port verbatim** do bloco `<style>` do `painel.html` (tokens, céu, superfícies, layout, keyframes e as 4 media queries), `vite.config.js` (porta 5173 + proxy `/api` → `http://localhost:3000`) e `.env.example` com `VITE_API_URL`. Este é o bloco 1 do CSS; as tasks 6, 9, 12 e 14 **apenderão** os acréscimos (bloco 2) usando exclusivamente os tokens deste bloco.

## Requisitos atendidos (FR)

- **FR-33** — design system idêntico ao `painel.html` (cores, tipografia, espaçamentos) — a fundação.
- **FR-37** — fundação de tokens/componentes que os estados ausentes do protótipo usarão exclusivamente.
- **FR-32** — breakpoints/media queries do protótipo (920/640/480 + reduced-motion).
- **FR-09** — fundação da rota única `/` (shell da aplicação).
- **FR-36** — fundação da base de URL (`VITE_API_URL` vazia em dev → proxy).

## Referência visual (painel.html)

- **Bloco `<style>`, linhas 11–390** — port **ipsis litteris** para `frontend/src/index.css`: todos os seletores, valores, `@keyframes` (`skyShift`, `twinkle`, `moonGlow`, `drift`, `shoot`, `ping`, `spin`, `floaty`, `bob`) e os 4 blocos `@media` (≤920, ≤640, ≤480, `prefers-reduced-motion: reduce` — incluindo as regras `.reveal` visível, `.bar i` em `--w`, `.pt`/`.area-path` visíveis). Sem renomear seletores, sem valores "equivalentes".
- **Head, linhas 3–10** — `lang="pt-BR"`, título "Painel do Clima", meta description, `preconnect` (googleapis + gstatic) e `<link>` da fonte Inter (pesos `300;400;500;600;700`, `display=swap`).

## Subtarefas

- [x] 4.1 Modificar `frontend/index.html`: `lang="pt-BR"`, título "Painel do Clima", meta description (mesma do protótipo), `preconnect` + fonte Inter (mesmo `<link>` do protótipo); remover `link` de favicon do template se for o caso de quebrar (manter `/favicon.svg` existente em `public/`).
- [x] 4.2 Modificar `frontend/src/index.css`: port **byte-idêntico** do conteúdo do bloco `<style>` (linhas 12–389 do `painel.html`). Este é o bloco 1; o arquivo termina aqui (bloco 2 vazio, preenchido pelas tasks 6/9/12/14).
- [x] 4.3 Modificar `frontend/vite.config.js`: `server.port: 5173` + `server.proxy` com `'/api'` → `target: 'http://localhost:3000'` (**sem** rewrite — o backend mantém o prefixo `/api`).
- [x] 4.4 Criar `frontend/.env.example`: `VITE_API_URL=` (vazio em dev → proxy Vite; produção local: `http://localhost:3000`).
- [x] 4.5 Testes (unidade + integração + fumaça).

## Detalhes de Implementação

Ver `techspec.md`: "Design de Implementação → Design System" (valores exatos dos tokens/superfícies), "Estratégia de CSS (port)" (regras 1–4: verbatim, bloco 2 sem sobrescrever bloco 1, sem comentários no código — separação por ordem de bloco), "Endpoints de API" (estratégia dev/prod: proxy vs URL absoluta) e "Arquivos relevantes".

## Critérios de Sucesso

- **O bloco 1 de `index.css` é byte-idêntico ao conteúdo do `<style>` do `painel.html` (linhas 12–389)** — verificado por teste que extrai o bloco do protótipo e compara com o início de `index.css` (aceite de fidelidade — FR-33/FR-34).
- Todos os tokens `:root` presentes com os valores exatos (`--text #eef2ff`, `--muted`, `--faint`, `--cyan #6ee7ff`, `--violet #a78bfa`, `--amber #ffd76a`, `--border`, `--radius 24px`).
- Os 9 keyframes e os 4 blocos `@media` presentes (incluindo a regra global de `prefers-reduced-motion`).
- `index.html` com `lang="pt-BR"`, título "Painel do Clima", fonte Inter (300–700) com `preconnect`.
- `vite.config.js`: porta 5173 + proxy `'/api'` → `http://localhost:3000` sem rewrite.
- **Nenhum valor criado ou alterado no bloco 1** — o bloco 2 nasce vazio; qualquer acréscimo futuro usa apenas tokens do bloco 1.

## Testes da Tarefa

- [x] Testes de unidade (`frontend/src/__tests__/foundation.test.js`): (a) comparação byte a byte do bloco portado contra o `<style>` extraído de `painel.html` (leitura direta do arquivo-fonte no teste); (b) presença de tokens `:root`, dos 9 keyframes e dos 4 `@media` em `index.css`; (c) asserções sobre `index.html` (`lang="pt-BR"`, título, `<link>` da fonte Inter, `preconnect`).
- [x] Testes de integração: importar `vite.config.js` no teste e asserir `server.port === 5173` e `server.proxy['/api'].target === 'http://localhost:3000'` (sem `rewrite`).
- [x] Teste de fumaça do fluxo principal: com o backend das tasks 1–3 no ar (`:3000`) e `npm run dev` no frontend — `GET http://localhost:5173/` responde a página (com o `<link>` da fonte Inter no HTML) e `GET http://localhost:5173/api/health` → `200` **através do proxy** (fluxo de comunicação dev que esta task entrega).

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Modificar: `frontend/index.html`, `frontend/src/index.css`, `frontend/vite.config.js`.
- Criar: `frontend/.env.example`, `frontend/src/__tests__/foundation.test.js`.
- Referência: `painel.html` (linhas 3–10 e 11–390).
