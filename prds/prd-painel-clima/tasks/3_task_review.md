# Review: Task 3.0 - Port do design system e do CSS

**Revisor**: AI Code Reviewer
**Data**: 2026-11-02
**Arquivo da task**: 3_task.md
**Status**: APROVADO COM OBSERVAÇÕES

## Resumo

Porte do design system de `painel.html` para o frontend. `frontend/src/index.css` é a cópia literal das linhas 12 a 389; `frontend/index.html` recebe `lang="pt-BR"`, a metadata e a fonte iguais às linhas 2 a 10, o sprite das linhas 394 a 484 e os símbolos `i-fog` e `i-snow` (18 no total). `frontend/src/additions.css` contém somente a lista fechada da TechSpec. `main.jsx` importa `index.css` e depois `additions.css`. `vite.config.js` fixa as portas 5173 e 4173. A suíte tem 13 testes passando (7 unidade, 5 integração, 1 de App). A avaliação geral é boa: a cópia é byte a byte e as adições seguem a lista fechada.

## Arquivos Revisados

| Arquivo | Status | Problemas |
|---------|--------|-----------|
| frontend/src/index.css | ✅ OK | 0 (cópia literal, verificada por teste) |
| frontend/index.html | ✅ OK | 1 menor (link de favicon mantido) |
| frontend/src/additions.css | ⚠️ Problemas | 1 menor (nome da classe de ativação das camadas de fundo) |
| frontend/src/main.jsx | ✅ OK | 0 |
| frontend/vite.config.js | ✅ OK | 0 |
| frontend/src/__tests__/setup.js | ✅ OK | 0 |
| frontend/src/__tests__/designSystem.test.js | ✅ OK | 0 |
| frontend/src/__tests__/styleIntegration.test.js | ✅ OK | 0 |
| frontend/eslint.config.js | ⚠️ Problemas | 1 menor (ajuste de globals para testes) |

## Problemas Encontrados

### 🔴 Problemas Críticos

Nenhum problema crítico encontrado.

### 🟡 Problemas Maiores

Nenhum problema maior encontrado.

### 🟢 Problemas Menores

- `frontend/index.html`: o `<head>` mantém `<link rel="icon" href="/favicon.svg">` do scaffold, que não existe em `painel.html`. Decisão: mantido, pois aponta para o asset de `frontend/public/` do Vite e o TechSpec aceita o que o Vite exige. Correção sugerida: remover, se o favicon padrão for preferido.
- `frontend/src/additions.css`: a TechSpec lista as variantes de fundo sem nomear o modificador que ativa a camada. Escolhido `.sky-layer.is-active { opacity:1 }`, a ser confirmado nas tasks 4.0 e 15.0.
- `frontend/eslint.config.js`: adicionado bloco restrito a `src/__tests__/**` com `globals.vitest` e `globals.node`, para que `describe`, `test`, `expect` e `__dirname` não gerem `no-undef`. Não há regra desligada nem arquivo excluído.

## Defeitos de Outras Tasks

Nenhum.

## ✅ Destaques Positivos

- Cópia do CSS verificada byte a byte contra `painel.html` por teste de unidade, sem edição de regras.
- O sprite ficou com 18 símbolos, com `i-fog` e `i-snow` derivados de `i-rain`.
- `additions.css` tem somente seletores da lista fechada; a única cor nova é `#ef4444` (mais as cores das variantes, autorizadas).
- Teste de fumaça com Playwright MCP sem erros no console, `body` em `rgb(7, 11, 29)` (`#070b1d`), `document.fonts.check('16px Inter')` verdadeiro, `body::before` com `position: fixed` e 18 `symbol` no DOM.

## Conformidade com Padrões

| Padrão | Status |
|--------|--------|
| Padrões de Código | ✅ Testes com nomes descritivos; sem comentários no código novo |
| Convenções da linguagem do projeto | ✅ ESM no frontend; `*.test.js` e `*.test.jsx` em `src/__tests__/` |
| Contratos de interface (APIs, mensagens) | ✅ (não aplicável; sem API nesta task) |
| Logging | ✅ (não aplicável) |
| Interface de usuário | ✅ Smoke test sem erros; App segue vazio, conforme a task |
| Testes | ✅ 13 passando |

## Checagens Estáticas

Comando: `cd frontend && npm run lint`
Linha de base (antes da task): 4 erros em 1 arquivo (`src/__tests__/App.test.jsx`: 3 `no-undef` para `describe`/`test`/`expect` e 1 `no-unused-vars` para `React`)
Resultado final: 1 erro em 1 arquivo (`src/__tests__/App.test.jsx`: `no-unused-vars` para `React`)
Erros pré-existentes (somente os da linha de base, em arquivos que a task não tocou): `src/__tests__/App.test.jsx` — `no-unused-vars` (`React`). Os 3 `no-undef` da linha de base foram resolvidos pelo ajuste de globals em `eslint.config.js`, com escopo restrito a `src/__tests__/**`.

## Skills e MCPs do Projeto

Skills do projeto: lidas antes da implementação: nenhuma | lidas depois: nenhuma | nenhuma aplicável ao escopo (CSS e HTML copiados, configuração do Vite e testes simples). Registro honesto: as skills `vite` e `vitest` estavam listadas em `.do/context.md` e não foram lidas antes da implementação; a configuração de Vite e Vitest foi feita pelos padrões já presentes no projeto.
MCPs do projeto: usados: playwright (ui-testing) no smoke test; context7 (documentation) não usado; mcp-api-test (api-testing) não necessário, pois a task não expõe API; lacuna: nenhuma.

## Recomendações

1. Confirmar na task 15.0 o nome do modificador de ativação das camadas de fundo (`.is-active`).
2. Decidir sobre o link de favicon do scaffold ao fechar a fundação visual.
3. Corrigir o `React` não usado em `src/__tests__/App.test.jsx` quando esse arquivo for tocado (erro de linha de base).

## Veredito

APROVADO COM OBSERVAÇÕES. A task 3.0 está completa: testes passando, lint sem erro novo, smoke test sem erros no console. Próximo passo: task 4.0. As observações menores acima não bloqueiam a fila.
