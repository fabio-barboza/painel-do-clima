# Tarefa 5.0: Cabeçalho, relógio, rodapé e revelação

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Entrega as partes fixas do painel (marca, relógio e rodapé), o componente `Icon`, que usa o sprite, e o hook `useReveal`, responsável pela revelação escalonada dos blocos.

**Depende de:** tarefas 3.0 e 4.0.

<requirements>
- Requisitos do PRD atendidos: RF-08, RF-10 (cabeçalho e rodapé), RF-21, RF-41, RF-43, RF-45 (revelação) e RF-46, além da restrição de atribuição à Open-Meteo.
- O resultado deve ficar idêntico aos trechos citados de `painel.html`: estrutura, classes, ids, SVGs, textos, animações e responsividade.
- Nenhum valor novo de CSS: esta tarefa usa apenas `index.css` e `additions.css` da tarefa 3.0.
- O rodapé usa o texto autorizado da TechSpec.
- `Clock` isola o estado por segundo, para não renderizar o restante do painel.
- `new Date()` só aparece em inicializador preguiçoso ou em efeito (lint `purity`).
</requirements>

## Subtarefas

- [x] 5.1 Criar `src/components/Icon.jsx`, que gera `<svg class="ico"><use href="#i-..."/></svg>`.
- [x] 5.2 Criar `src/hooks/useReveal.js`, com um observador por elemento, `threshold: 0.15` e `disconnect` no cleanup.
- [x] 5.3 Criar `src/components/Header.jsx` e `src/components/Clock.jsx`.
- [x] 5.4 Criar `src/components/Footer.jsx`.
- [x] 5.5 Compor `Header` e `Footer` em `src/App.jsx`.
- [x] 5.6 Escrever os testes de unidade e de integração.

## Detalhes de Implementação

**Referência em `painel.html`**

| Seletor | Linhas | Componente |
|---|---|---|
| `header.top`, `.brand` | 498–505 (`--d:0s`) | `Header` |
| `.clock`, `#clockTime`, `#clockDate` | 506–509 (markup), 662–670 (JS) | `Clock`, filho de `Header` |
| `footer` | 618–620 (`--d:.4s`) | `Footer` |
| `.reveal` | 350–354 (CSS), 839–847 (JS) | `useReveal` |

Ver na `techspec.md`: "Componentização", textos fixos logo após a tabela (rodapé) e "Fidelidade visual: animações e interações". O relógio mostra hora e data locais do usuário, com `Intl.DateTimeFormat('pt-BR')` e as mesmas opções do arquivo.

## Critérios de Sucesso

- Cabeçalho idêntico às linhas 498–510: estrutura, classes, ids, SVG `#i-brand` e textos.
- Rodapé idêntico às linhas 618–620, salvo o texto de atribuição autorizado, com link para `https://open-meteo.com/`.
- O relógio atualiza a cada segundo e limpa o intervalo ao desmontar.
- Cabeçalho e rodapé revelam ao abrir a página, com `--d` iguais ao arquivo.
- Com `prefers-reduced-motion`, o conteúdo aparece sem animação.
- Nenhum valor de CSS novo foi criado nesta tarefa.

## Testes da Tarefa

- [x] Testes de unidade: `Icon` gera o `href` correto; `Clock` com timers simulados atualiza e limpa o intervalo; `useReveal` adiciona `in` ao interseccionar e desconecta no cleanup; `Header` e `Footer` têm classes, ids, `--d` e textos do arquivo.
- [x] Testes de integração: `App` renderiza cabeçalho, relógio e rodapé dentro de `main.dashboard`.
- [x] Teste de fumaça: com `npm run dev` no ar, via Playwright MCP, cabeçalho e rodapé aparecem com a revelação, o relógio avança e o link de atribuição está visível, sem erros no console.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `painel.html`
- `frontend/src/components/Icon.jsx`, `frontend/src/components/Header.jsx`, `frontend/src/components/Clock.jsx`, `frontend/src/components/Footer.jsx`
- `frontend/src/hooks/useReveal.js`
- `frontend/src/App.jsx`
- `frontend/src/__tests__/`
