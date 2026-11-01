# Tarefa 16.0: Completação: acessibilidade, lint, READMEs e remoções

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Passada final de qualidade do scaffold: revisão de acessibilidade (teclado, rótulos, foco, contraste, movimento reduzido), `npm run lint` sem erros, READMEs dos dois pacotes documentando a estratégia de comunicação dev/prod e as portas, e remoção das sobras do template Vite (`App.css` vazio e `public/icons.svg`). Deixa as duas suítes de testes 100 % verdes e o build de produção local funcionando.

## Requisitos atendidos (FR)

- **FR-32** — responsividade final sem quebra (verificação integrada: os comportamentos de quebra do protótipo ativos no app completo).
- **FR-33** — identidade visual final (o app completo continua idêntico ao protótipo no estado carregado).
- PRD "Requisitos de acessibilidade" — teclado (toda funcionalidade utilizável, foco visível, Enter na busca), rótulos (busca, gráfico, seções), contraste (incluindo estados de erro/vazio), movimento (`prefers-reduced-motion` desativa todas as animações) e conteúdo (informação não só por cor — condição vem em texto + ícone).
- PRD (Restrições) — estratégia de comunicação documentada e consistente (dev: proxy Vite; produção local: URL absoluta + CORS); portas documentadas (dev 5173/3000; prod 4173/3000).

## Subtarefas

- [x] 16.1 Acessibilidade — verificar/ajustar nos componentes: foco visível preservado; `aria-label` no input de busca (mesmo texto do protótipo) e `role="search"`; `role="img"` + `aria-label` no SVG do gráfico ("Gráfico de temperatura e precipitação por hora"); `aria-label` nas seções de dados ("Temperatura atual", "Previsão por hora", "Detalhes do clima", "Próximos sete dias" — mesmos textos do protótipo); `aria-busy` na busca; `prefers-reduced-motion: reduce` → céu, ícones, gráfico, reveals e barras sem animação e conteúdo completo (regra global já portada — validar que nada a desrespeita, ex.: animações JS via rAF com cleanup); condição do tempo sempre acompanhada de texto/ícone (nunca só cor).
- [x] 16.2 Lint: `npm run lint` (frontend, ESLint 9 flat config) com 0 erros — corrigir o que aparecer (inclusive nas tasks anteriores).
- [x] 16.3 READMEs: `backend/README.md` — estratégia de CORS explícita (origens/métodos/headers; `*` em dev documentado; `CORS_ORIGINS` em produção, ex.: `http://localhost:4173`), portas (3000), `npm start`/`npm run dev`/`npm test`; `frontend/README.md` — estratégia de comunicação (dev: proxy Vite, `VITE_API_URL` vazia; produção local: `npm run preview` em 4173 + `VITE_API_URL=http://localhost:3000` com CORS), portas (5173/4173), `npm run dev`/`npm test -- run`/`npm run build`. Conteúdo conforme "Endpoints de API" (parágrafo de estratégia) da TechSpec.
- [x] 16.4 Remoções: excluir `frontend/src/App.css` (vazio, não importado) e `frontend/public/icons.svg` (sobra do template Vite — ícones sociais sem relação com o protótipo); garantir que nenhuma referência restou (o sprite do app é o `IconSprite`; o favicon `/favicon.svg` permanece).
- [x] 16.5 Validação final: suítes completas nos dois pacotes (`npm test` no backend, `npm test -- run` no frontend) + `npm run build` no frontend (produção local) sem erros.

## Detalhes de Implementação

Ver `techspec.md`: "Animações e interações → Teclado/a11y" (inventário de atributos), "Conformidade com standards do projeto" (`web-design-guidelines`/`react-testing`), "Endpoints de API" (estratégia e portas para os READMEs), "Arquivos relevantes e dependentes" (itens Modificar/Remover) e PRD "Requisitos de acessibilidade".

## Critérios de Sucesso

- Teclado: busca por Enter, botões nativos focáveis com foco visível, toda a funcionalidade utilizável sem mouse.
- Rótulos acessíveis presentes (busca, gráfico `role="img"`, seções) com os mesmos textos do protótipo quando aplicável.
- `prefers-reduced-motion: reduce` desativa **todas** as animações (céu, ícones, gráfico, reveals, barras, count-up) mantendo o conteúdo completo (regras globais do protótipo + effects JS com cleanup).
- Informação nunca só por cor: condição sempre em texto + ícone.
- `npm run lint` (frontend): 0 erros.
- READMEs documentam: estratégia dev (proxy) vs produção local (URL absoluta + CORS), portas (5173/3000 dev; 4173/3000 prod), `CORS_ORIGINS` e `VITE_API_URL`.
- Remoções concluídas: `frontend/src/App.css` e `frontend/public/icons.svg` inexistentes e sem referências quebradas (build passa).
- `npm test` (backend) e `npm test -- run` (frontend) 100 % verdes; `npm run build` (frontend) sem erros.

## Testes da Tarefa

- [x] Testes de unidade/integração (acessibilidade): asserções RTL nos testes existentes/ajustados — nomes acessíveis da busca/das seções/do gráfico (`role="img"`), `aria-busy` durante a busca; teste de reduced motion (stub de `matchMedia` com `reduce` → conteúdo visível sem animações de reveal/gráfico/barras; `useCountUp` imediato).
- [x] Testes de integração (validação final): suite completa do backend (`npm test`, com cobertura) e do frontend (`npm test -- run`) verdes; `npm run build` do frontend conclui sem referenciar arquivos removidos.
- [x] Teste de fumaça do fluxo principal: estado final do scaffold — `npm run lint` com 0 erros + suítes dos dois pacotes verdes + `npm run build` OK (a base completa pronta para a fase de QA).

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Modificar: `frontend/README.md`, `backend/README.md`; ajustes de acessibilidade pontuais em componentes (se a verificação de 16.1 exigir).
- Remover: `frontend/src/App.css`, `frontend/public/icons.svg`.
- Verificação: `frontend/eslint.config.js` (conventions do lint), `AGENTS.md` (particularidades das suítes: backend `testMatch` `__tests__`, frontend `npm test -- run`).
