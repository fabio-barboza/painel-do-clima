# Tarefa 17.0: Documentação final (README, .env.example, .gitignore)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Documenta e consolida o ambiente: `README.md` da raiz com portas, estratégia de comunicação frontend↔backend, variáveis de ambiente e como rodar/testar; `backend/.env.example` completo; `.gitignore` revisado. Cumprimento objetivo do PRD: "Documentação de infraestrutura — portas de desenvolvimento e produção e a estratégia de comunicação frontend↔backend ficam explicitamente documentadas e consistentes em todo o projeto."

<requirements>
- `README.md` (raiz) contendo:
  - Como rodar: backend (`cd backend && npm run dev`), frontend (`cd frontend && npm run dev`), E2E (`cd e2e && npm test`)
  - **Portas**: frontend `5173` e backend `3000` em desenvolvimento **e** produção (requisito do PRD)
  - **Estratégia de comunicação** (única, decision D1): URL absoluta via `VITE_API_URL` + CORS explícito no backend — sem proxy no Vite
  - **Regra de zero cache HTTP**: backend (`app.disable('etag')` + `Cache-Control: no-store`) e frontend (`cache: 'no-store'` em todo fetch)
  - CORS: dev aceita qualquer origem (`*`); produção usa allow-list `CORS_ORIGINS`
  - Variáveis de ambiente do frontend (`VITE_API_URL`) e do backend (tabela abaixo)
  - Como rodar os testes: backend (Jest), frontend (Vitest) e E2E (Playwright, incluindo `RUN_REAL_E2E=1` para o smoke)
- `backend/.env.example` completo: `PORT`, `NODE_ENV`, `CORS_ORIGINS`, `GEOCODING_BASE_URL`, `FORECAST_BASE_URL`, `EXTERNAL_TIMEOUT_MS` — sem comentários no arquivo (restrição do PRD; as explicações ficam no README)
- Documentar `frontend/.env.local` (fora do Git): `VITE_API_URL=http://localhost:3000`
- `.gitignore` (raiz): garantir `e2e/node_modules`, `e2e/test-results`, `frontend/.env.local` e `backend/.env` (variáveis de ambiente nunca versionadas)
- Revisão de consistência: documentação ↔ configuração ↔ código (portas, URLs, variáveis)
</requirements>

## Subtarefas

- [x] 17.1 Escrever a seção "Como rodar" do README (backend, frontend, E2E)
- [x] 17.2 Documentar no README: portas 5173/3000 (dev e produção), estratégia de comunicação (URL absoluta + CORS, sem proxy), regra de zero cache, CORS por ambiente
- [x] 17.3 Documentar no README: variáveis de ambiente (frontend e backend) e como rodar todos os testes (incluindo smoke real)
- [x] 17.4 Completar `backend/.env.example` (todas as variáveis lidas pelo `getEnv()`, sem comentários)
- [x] 17.5 Revisar `.gitignore` da raiz (e2e, `.env.local`, `.env`)
- [x] 17.6 Executar a revisão de consistência (docs ↔ configs ↔ código)
- [x] 17.7 Criar teste de consistência do `.env.example` (ver "Testes da Tarefa")

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): "Pontos de Integração" (CORS e estratégia de comunicação — URL absoluta documentada), "Restrições Técnicas de Alto Nível" do PRD (portas 5173/3000, zero cache, CORS documentado) e "Arquivos relevantes e dependentes" (README, `backend/.env.example`, `.gitignore`). As variáveis do `.env.example` devem corresponder exatamente às lidas em `backend/src/config/env.js` (Tarefa 1.0).

## Critérios de Sucesso

- README cobre: como rodar, portas (dev e produção), estratégia de comunicação, zero cache, CORS, variáveis de ambiente e como testar
- `backend/.env.example` contém exatamente as variáveis lidas pelo `getEnv()` (verificado por teste)
- `.gitignore` cobre `e2e/node_modules`, `e2e/test-results`, `frontend/.env.local` e `backend/.env`
- Revisão de consistência sem divergências (portas/URLs/variáveis idênticas em docs, configs e código)
- Todos os testes do projeto verdes (backend + frontend + E2E determinístico)

## Testes da Tarefa

- [x] Testes de unidade: `backend/src/__tests__/envExample.test.js` — `backend/.env.example` contém todas as variáveis lidas pelo `getEnv()` (consistência docs ↔ código)
- [x] Validação manual: os comandos documentados no README executam com sucesso (backend, frontend, testes, E2E)

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `README.md` (modificar)
- `backend/.env.example` (modificar)
- `.gitignore` (modificar)
- `backend/src/__tests__/envExample.test.js` (novo)
