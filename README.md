# Painel do Clima

Estrutura base (scaffold) de um projeto full stack para monitoramento climático, com separação clara entre frontend (React + Vite) e backend (Node.js + Express). O código de aplicação aqui é propositalmente mínimo: o que importa é a base servir de campo de provas para um fluxo de desenvolvimento orientado a especificação.

## 🎯 Objetivo

O objetivo deste repositório é **usar e validar o framework [Development Orchestrator](https://github.com/fabio-barboza/development-orchestrator) (DO)** sobre uma base full stack real, do zero até a entrega com QA.

O DO é um framework de **SDD (Spec-Driven Development / Desenvolvimento Orientado a Especificação)**: nada é implementado antes de estar documentado. Em vez de partir direto para o código, o trabalho percorre uma cadeia de artefatos rastreáveis que elimina ambiguidade e reduz retrabalho:

```
PRD → TechSpec → Tasks → Execução → Review → QA
```

- **PRD** — o *que* será construído e por quê (requisitos de produto).
- **TechSpec** — *como* será construído (decisões técnicas, contratos, arquitetura).
- **Tasks** — a quebra da TechSpec em unidades pequenas e executáveis.
- **Execução** — cada task é implementada individualmente, sempre acompanhada de testes.
- **Review** — a implementação é validada contra a especificação que a originou.
- **QA** — testes end-to-end automatizados via MCP (Model Context Protocol), com ciclo de bugfix.

Cada etapa gera artefatos versionados, então é sempre possível rastrear uma linha de código até a task, a TechSpec e o requisito de produto que a justificam.

### Fluxo do DO neste projeto

| Fase | Comandos principais |
|------|---------------------|
| 1. Planejamento | `do-setup`, `do-create-prd`, `do-create-techspec`, `do-create-tasks` |
| 2. Execução | `do-execute-task`, `do-execute-all-tasks` (subagentes isolados, em sequência) |
| 3. Code Review | `do-execute-review`, `do-execute-review-fix` |
| 4. QA & Bugfix | `do-execute-qa`, `do-execute-qa-bugfix` |
| Acompanhamento | `do-status` (progresso e ponto de retomada) |

Duas regras do framework valem destaque, porque moldam como este scaffold foi montado:

- **Uma task nunca é concluída com teste falhando.** Por isso frontend e backend já vêm com stack de testes e cobertura configuradas desde o commit inicial.
- **Sem artefato de review, a task continua aberta.** A validação faz parte da entrega, não é etapa opcional.

Consulte a documentação do [Development Orchestrator](https://github.com/fabio-barboza/development-orchestrator) para instalação dos comandos e detalhes de cada fase.

## 📋 Índice

- [Objetivo](#-objetivo)
- [Stack Tecnológica](#-stack-tecnologica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Inicialização](#-inicializacao)
- [Execução](#-execucao)
- [Testes](#-testes)
- [Scripts Disponíveis](#-scripts-disponiveis)
- [Endpoints da API](#-endpoints-da-api)

## 🛠 Stack Tecnológica

### Frontend
- **React 19** - Biblioteca UI
- **Vite** - Build tool
- **React Testing Library + Vitest** - Testes

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **Jest + Supertest** - Testes

## 📁 Estrutura do Projeto

```
painel-do-clima/
├── frontend/           # Aplicação React
│   ├── src/           # Código fonte
│   │   ├── __tests__/ # Testes
│   │   └── assets/    # Recursos estáticos
│   ├── public/        # Arquivos públicos
│   ├── vitest.config.js
│   └── package.json
├── backend/           # API Node.js
│   ├── src/          # Código fonte
│   │   ├── __tests__/ # Testes
│   │   └── index.js  # Entry point
│   ├── jest.config.js
│   └── package.json
├── README.md
└── .gitignore
```

## 🚀 Inicialização

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn

### Passo a passo

1. **Clonar o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd painel-do-clima
   ```

2. **Instalar dependências do Frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Instalar dependências do Backend**
   ```bash
   cd ../backend
   npm install
   ```

4. **Configurar variáveis de ambiente (opcional)**
   
   Crie arquivos `.env` nas pastas respectivas, se necessário:
   
   Frontend (`frontend/.env.local`):
   ```env
   VITE_API_URL=http://localhost:3000
   ```
   
   Backend (`backend/.env`):
   ```env
   PORT=3000
   ```

5. **Verificar instalação**
   
   Execute os testes para confirmar que tudo está funcionando:
   ```bash
   # Frontend
   cd frontend
   npm test -- run
   
   # Backend
   cd ../backend
   npm test
   ```

## ▶️ Execução

### Modo Desenvolvimento

**Frontend:**
```bash
cd frontend
npm run dev
```
A aplicação será acessível em `http://localhost:5173`

**Backend:**
```bash
cd backend
npm run dev
```
A API estará disponível em `http://localhost:3000`

### Modo Produção

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

**Backend:**
```bash
cd backend
npm start
```

## 🧪 Testes

### Frontend - React Testing Library + Vitest

**Dependências instaladas:**
- `vitest` - Framework de teste rápido
- `@testing-library/react` - Biblioteca de testes para React
- `@testing-library/jest-dom` - Matchers úteis
- `jsdom` - Ambiente DOM
- `@vitest/coverage-v8` - Cobertura de código

**Comandos:**
```bash
# Modo watch (reexecuta automaticamente)
npm test

# Executar uma vez
npm run test -- run

# Com relatório de cobertura
npm run test:coverage

# Interface gráfica
npm run test -- --ui
```

### Backend - Jest + Supertest

**Dependências instaladas:**
- `jest` - Framework de teste
- `supertest` - Testes para APIs HTTP

**Comandos:**
```bash
# Com cobertura de código
npm test

# Modo watch
npm run test:watch
```

### Cobertura de Código

- **Frontend:** Relatórios em `frontend/coverage/`
- **Backend:** Relatórios em `backend/coverage/`

## 📦 Scripts Disponíveis

### Frontend
| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Cria build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Executa ESLint |
| `npm test` | Roda testes (modo watch) |
| `npm run test -- run` | Roda testes uma vez |
| `npm run test:coverage` | Testes com cobertura |

### Backend
| Script | Descrição |
|--------|-----------|
| `npm start` | Inicia servidor de produção |
| `npm run dev` | Inicia servidor em desenvolvimento (nodemon) |
| `npm test` | Roda testes com cobertura |
| `npm run test:watch` | Testes em modo watch |

## 🔗 Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check do serviço |

## 📝 Notas

- Arquivos de teste seguem a convenção `*.test.{js,jsx}` ou `*.spec.{js,jsx}`
- Use `.env.local` para variáveis de ambiente locais (não versionado no Git)
- Execute os testes antes de fazer commits para garantir que nada quebrou
