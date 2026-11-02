# Tarefa 3.0: Port do design system e do CSS

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Porta para o frontend todo o design system de `painel.html`: tokens, fonte Inter, estilos globais, keyframes, media queries e sprite SVG. Cria também todo o `additions.css`, com a lista fechada de adições autorizadas. **Esta tarefa vem antes de qualquer componente visual.** As tarefas de interface seguintes apenas reutilizam esses estilos e não criam valores novos.

Esta tarefa passa do tamanho usual (cerca de 470 linhas), mas quase tudo é cópia literal.

<requirements>
- Requisitos do PRD atendidos: RF-34 (`i-fog`, `i-snow`), RF-40, RF-41, RF-42, RF-43 (hover e foco no CSS), RF-44, RF-45 e RF-46 (textos do `<head>`).
- `index.css` é cópia literal das linhas 12 a 389 de `painel.html`. Nenhuma regra é editada, reordenada ou removida.
- O sprite é copiado sem alterações. Só `i-fog` e `i-snow` são acrescentados ao final.
- Sem CSS Modules, Tailwind ou CSS-in-JS, e sem nenhuma dependência npm nova.
- `additions.css` contém somente a lista fechada da TechSpec, com nada além dela.
- O peso 200 não é acrescentado à URL da fonte (armadilha de `.temp`).
</requirements>

## Subtarefas

- [x] 3.1 Rodar `npm install` em `frontend/`, pois `node_modules` não existe.
- [x] 3.2 Atualizar `frontend/index.html`: `lang="pt-BR"`, título, descrição, `preconnect` e link da fonte iguais a `painel.html`.
- [x] 3.3 Colar o sprite em `frontend/index.html`, logo após `<body>` e antes de `#root`, e acrescentar `i-fog` e `i-snow`.
- [x] 3.4 Copiar as linhas 12 a 389 para `frontend/src/index.css`.
- [x] 3.5 Criar `frontend/src/additions.css` com todas as adições da lista fechada, inclusive as variantes de fundo.
- [x] 3.6 Importar `additions.css` depois de `index.css` em `frontend/src/main.jsx`.
- [x] 3.7 Fixar `server.port: 5173` e `preview.port: 4173` em `frontend/vite.config.js`.
- [x] 3.8 Simular `IntersectionObserver`, `matchMedia` e `SVGElement.prototype.getTotalLength` em `src/__tests__/setup.js`.
- [x] 3.9 Escrever os testes de unidade e de integração.

## Detalhes de Implementação

**Referência em `painel.html`**

| Trecho | Seletor ou elemento | Linhas | Destino |
|---|---|---|---|
| Metadados e fonte | `<html lang>`, `<title>`, `meta[name=description]`, `link` | 2–10 | `frontend/index.html` |
| Estilos | `:root` até `@media (prefers-reduced-motion:reduce)` | 12–389 | `frontend/src/index.css` |
| Sprite | `<svg><defs>` | 394–486 | `frontend/index.html` |

Ver na `techspec.md`: "Fidelidade visual: design system" (registro de consulta; em divergência, vale o arquivo), "Fidelidade visual: estilos" (lista fechada de adições e variantes de fundo), "Fidelidade visual: ícones e gráfico" (sprite) e "Comunicação e portas".

`additions.css` é entregue inteiro aqui: UV, faixa semanal, precipitação no gráfico, legendas, `.notice`, `.is-busy`, skeleton, `.big-icon.solo`, `footer a`, `.sr-only`, `.sky-layer` e as regras das variantes. Ele só pode redefinir seletores existentes nos casos listados na TechSpec.

## Critérios de Sucesso

- `index.css` é byte a byte igual às linhas 12 a 389 de `painel.html`.
- O sprite é igual às linhas 394 a 486, mais `i-fog` e `i-snow` no final (18 símbolos).
- `<head>` igual às linhas 2 a 10, salvo o que o Vite exige para carregar a aplicação.
- Cada regra de `additions.css` corresponde a um item da lista fechada da TechSpec, com os mesmos valores.
- A fonte Inter carrega com os pesos 300 a 700, pela mesma URL do arquivo.
- `npm test -- run` e `npm run lint` passam, com o `App` ainda vazio.

## Testes da Tarefa

- [x] Testes de unidade: leitura dos arquivos comparando `index.css` com as linhas 12–389 de `painel.html` e o sprite com as linhas 394–486; presença dos 18 símbolos.
- [x] Testes de integração: `main.jsx` importa `index.css` antes de `additions.css`; os mocks de `setup.js` estão disponíveis e `App.test.jsx` continua passando.
- [x] Teste de fumaça: com `npm run dev` no ar, via Playwright MCP, a página abre sem erros no console, com `body` em `#070b1d`, família Inter carregada, fundo de `body::before` visível e os 18 símbolos no DOM.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `painel.html`
- `frontend/index.html`, `frontend/vite.config.js`
- `frontend/src/main.jsx`, `frontend/src/index.css`, `frontend/src/additions.css`
- `frontend/src/__tests__/setup.js`
