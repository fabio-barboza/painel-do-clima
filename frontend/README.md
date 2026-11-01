# Painel do Clima — Frontend

SPA React 19 (Vite 8, ESM) que consome **apenas** a API Express em `backend/`. O frontend nunca
fala com APIs externas — toda comunicação passa pelo backend (ver `backend/README.md`).

## Estratégia de comunicação frontend ↔ backend

O frontend resolve a URL da API por `import.meta.env.VITE_API_URL` (em
`src/services/weather.js`, base `VITE_API_URL ?? ''`) e toda chamada usa `cache: 'no-store'`.

- **Desenvimento** (`npm run dev`, `:5173`): deixe `VITE_API_URL` **vazio**. O proxy do Vite
  (`vite.config.js`) roteia `/api` → `http://localhost:3000`, então a busca vai para
  `http://localhost:5173/api/weather` e é redirecionada ao backend, **sem CORS** envolvido.

  ```
  # frontend/.env.local (ou use .env.example)
  VITE_API_URL=
  ```

- **Produção local** (`npm run preview`, `:4173`): aponte `VITE_API_URL` para a URL absoluta do
  backend, com CORS habilitado (ver `backend/README.md`).

  ```
  VITE_API_URL=http://localhost:3000
  ```

  Nesta configuração o frontend em `:4173` chama `http://localhost:3000/api/weather` diretamente e
  o backend valida a origem via `CORS_ORIGINS` (ex.: `http://localhost:4173`).

## Portas

| Modo | Frontend | Backend |
|------|----------|---------|
| Desenvolvimento | `5173` (`npm run dev`) | `3000` (`npm run dev`) |
| Produção local | `4173` (`npm run preview`) | `3000` (`npm start`) |

Em desenvolvimento o frontend usa o proxy do Vite (sem CORS); em produção local usa URL absoluta
com CORS. A estratégia é a mesma em todo o código (único ponto: `src/services/weather.js` + o proxy
em `vite.config.js`).

## Comandos

| Comando | Finalidade |
|---------|-----------|
| `npm run dev` | dev server em `:5173` (com proxy para a API) |
| `npm run preview` | servem a build de produção local em `:4173` (para testar comunicação com CORS) |
| `npm run build` | gera a build de produção em `dist/` |
| `npm test -- run` | roda a suíte Vitest **uma vez** (o `npm test` nativo é watch). Testes em
  `src/__tests__/` como `*.test.{js,jsx}`. |
| `npm run test:coverage` | suíte com cobertura. |
| `npm run lint` | ESLint 9 (flat config) — deve reportar 0 erros. |

## Testes

Vitest + React Testing Library em jsdom. `fetch` global e APIs de ambiente (`IntersectionObserver`,
`matchMedia`, `getTotalLength`, `navigator.geolocation`) são stubados por teste em
`src/__tests__/setup.js` — nunca há rede real nem chamadas a serviços externos.
