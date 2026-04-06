# Painel do Clima

Projeto full stack para monitoramento climático com separação clara entre frontend e backend.

## 📋 Índice

- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Inicialização](#-inicialização)
- [Execução](#-execução)
- [Testes](#-testes)
- [Scripts Disponíveis](#-scripts-disponíveis)

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
   ```bash
   # frontend/.env.local (não versionado)
   VITE_API_URL=http://localhost:3000
   
   # backend/.env
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
| GET | `/health` | Health check do serviço |
