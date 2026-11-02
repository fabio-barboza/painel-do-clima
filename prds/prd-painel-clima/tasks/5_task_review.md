# Review: Task 5.0 - Cabeçalho, relógio, rodapé e revelação

**Revisor**: AI Code Reviewer
**Data**: 2026-11-02
**Arquivo da task**: 5_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Implementados o componente `Icon` (usa o sprite com `<use href="#i-...">`), o hook `useReveal` (um `IntersectionObserver` por elemento, `threshold: 0.15`, `disconnect` no cleanup), `Clock` (estado isolado por segundo, intervalo limpo ao desmontar), `Header` (marca e relógio, `--d: 0s`) e `Footer` (`--d: .4s`, com a atribuição à Open-Meteo no lugar do texto de demonstração). `App` compõe `Header` e `Footer` dentro de `main.dashboard`. Nenhum CSS novo foi criado: a task usa apenas as classes já existentes em `index.css` e `additions.css`. A estrutura, as classes, os ids, o SVG `#i-brand` e os textos seguem as linhas 498–510 e 618–620 de `painel.html`. A qualidade geral é boa, sem problemas críticos nem maiores.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| frontend/src/components/Icon.jsx | ✅ OK | 0 |
| frontend/src/hooks/useReveal.js | ✅ OK | 0 |
| frontend/src/components/Clock.jsx | ✅ OK | 0 |
| frontend/src/components/Header.jsx | ✅ OK | 0 |
| frontend/src/components/Footer.jsx | ✅ OK | 0 |
| frontend/src/App.jsx | ✅ OK | 0 |
| frontend/src/__tests__/Icon.test.jsx | ✅ OK | 0 |
| frontend/src/__tests__/useReveal.test.jsx | ✅ OK | 0 |
| frontend/src/__tests__/Clock.test.jsx | ✅ OK | 0 |
| frontend/src/__tests__/Header.test.jsx | ⚠️ Problemas | 1 (menor) |
| frontend/src/__tests__/Footer.test.jsx | ⚠️ Problemas | 1 (menor) |
| frontend/src/__tests__/App.test.jsx | ✅ OK | 0 |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

- `frontend/src/__tests__/Header.test.jsx` e `frontend/src/__tests__/Footer.test.jsx`: o mock de `IntersectionObserver` está duplicado em três arquivos de teste (também em `useReveal.test.jsx`). Correção sugerida: mover o mock para um helper em `frontend/src/__tests__/` quando houver mais consumidores. Não bloqueante.

## Defeitos de Outras Tasks

Nenhum. A smoke test no navegador e a suíte não revelaram defeitos nas tasks 1.0 a 4.0.

## ✅ Destaques Positivos

- `useReveal` retorna `[ref, revealed]` conforme a TechSpec. O observador é criado por elemento e desconectado no cleanup, e o elemento deixa de ser observado após a revelação.
- `Clock` isola o estado por segundo. O `Intl.DateTimeFormat` fica em nível de módulo, e `new Date()` aparece só no inicializador preguiçoso e no intervalo, o que respeita a regra de pureza do lint.
- Os testes de `Clock` usam timers simulados e verificam a limpeza do intervalo ao desmontar.
- O teste de `Footer` confirma que o texto de demonstração não aparece mais, e o link de atribuição aponta para `https://open-meteo.com/`.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ |
| Convenções da linguagem do projeto | ✅ |
| Contratos de interface (APIs, mensagens) | ✅ (não aplicável nesta task) |
| Logging | ✅ (não aplicável nesta task) |
| Interface de usuário | ✅ |
| Testes | ✅ |

## Checagens Estáticas

Comando: `cd frontend && npm run lint`
Linha de base (antes da task): limpa
Resultado final: limpa
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): nenhum

Testes: `cd frontend && npm test -- run`. Linha de base: 26 testes passando em 5 arquivos. Resultado final: 44 testes passando em 10 arquivos.

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: react-testing, vitest (trechos iniciais de `.claude/skills/react-testing/SKILL.md` e `.claude/skills/vitest/SKILL.md`)
MCPs do projeto: usados: playwright (ui-testing) para a smoke test com o dev server no ar; context7 (documentation) não usado, pois a task não exigiu consulta de biblioteca externa; mcp-api-test não aplicável (sem serviço HTTP nesta task)

## Recomendações

1. Consolidar o mock de `IntersectionObserver` em um helper compartilhado de testes (menor, não bloqueante).
2. Nas próximas tasks que usarem `Header` ou `Footer` em fluxos de revelação, manter a verificação de `--d` nos testes.

## Veredito

Task aprovada com observações. Os testes passam (44/44), o lint está limpo, a smoke test confirmou cabeçalho e rodapé revelados, relógio avançando a cada segundo e zero erros no console, com evidência em `prds/prd-painel-clima/task-screenshots/task-5-cabecalho-rodape.png`. Próximo passo: seguir para a task 6.0.
