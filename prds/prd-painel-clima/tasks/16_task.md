# Tarefa 16.0: Documentação de comunicação e portas

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Documenta a estratégia de comunicação entre frontend e backend, as portas de desenvolvimento e produção e as variáveis de ambiente.

**Depende de:** tarefas 1.0, 2.0, 3.0 e 7.0.

<requirements>
- Requisitos do PRD atendidos: RF-01 (registro de que toda comunicação externa passa pelo backend). O PRD não numera os demais itens: esta tarefa atende às restrições "Comunicação", "Portas" e "CORS explícito" e ao objetivo de estratégia de comunicação e portas documentadas.
- A estratégia documentada é URL absoluta com CORS, sem proxy do Vite.
- A liberação de qualquer origem em desenvolvimento fica documentada.
- Portas: 5173 e 3000 em desenvolvimento, 4173 e 3000 em produção.
</requirements>

## Subtarefas

- [x] 16.1 Atualizar `README.md` com a tabela de comunicação e portas e os comandos de cada ambiente.
- [x] 16.2 Acrescentar `CORS_ORIGINS` a `backend/.env.example`.
- [x] 16.3 Criar `frontend/.env.example` com `VITE_API_URL`.
- [x] 16.4 Escrever os testes de unidade e de integração.

## Detalhes de Implementação

Ver na `techspec.md`: "Comunicação e portas" e "Endpoints de API" (bloco CORS). Registrar também que `npm test` no frontend fica em modo watch e que a geolocalização exige contexto seguro fora de `localhost`.

## Critérios de Sucesso

- `README.md`, `.env.example` e código dizem o mesmo sobre portas, origens e estratégia.
- Uma pessoa consegue subir os dois ambientes seguindo apenas o `README.md`.
- `backend/.env.example` mantém `PORT` e `NODE_ENV`.

## Testes da Tarefa

- [x] Testes de unidade: leitura dos arquivos, conferindo `CORS_ORIGINS` em `backend/.env.example` e `VITE_API_URL` em `frontend/.env.example`.
- [x] Testes de integração: Supertest com `NODE_ENV=production` e `CORS_ORIGINS=http://localhost:4173`, conferindo a origem liberada e a bloqueada, conforme documentado.
- [x] Teste de fumaça: seguindo o `README.md` no modo de produção, com `npm start` e `CORS_ORIGINS=http://localhost:4173` no backend e `npm run build` + `npm run preview` no frontend, sem mocks, via Playwright MCP, pesquisar "Curitiba" em `http://localhost:4173` exibe os dados sem erro de CORS.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `README.md`
- `backend/.env.example`
- `frontend/.env.example`
- `backend/src/app.js`, `backend/src/middleware/cors.js`
- `frontend/src/api/weather.js`
