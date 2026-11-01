---
id: R-07
severidade: MENOR
status: resolvido
---

# Tarefa de Correção: ESLint analisa o diretório gerado coverage/ (warning em relatório)

## Problema
Em `frontend/eslint.config.js` (linha 8), `globalIgnores(['dist'])` ignora o build mas não o diretório de relatórios de cobertura. Como resultado, `npm run lint` analisa os arquivos HTML/JS gerados sob `frontend/coverage/` e produz 1 warning (`Unused eslint-disable directive` em `coverage/block-navigation.js`) — ruído em arquivo que não é código-fonte.

## Arquivo
`frontend/eslint.config.js` — linha 8

## Impacto
`npm run lint` (checagem estática declarada do projeto) não sai limpa por causa de artefato gerado; qualquer `--max-warnings 0` em CI falharia por motivo alheio ao código.

## Sugestão de Correção
1. Em `frontend/eslint.config.js`, estender o ignore: `globalIgnores(['dist', 'coverage'])`.
2. Rodar `cd frontend && npm run lint` e confirmar saída sem warnings.

## Resolução

Correção aplicada: em `frontend/eslint.config.js` (linha 8), o `globalIgnores` passou a cobrir o diretório de cobertura, passando de `['dist']` para `['dist', 'coverage']`. O `eslint .` agora sai sem warnings (`exit 0`), mesmo com o diretório `coverage/` presente na raiz do pacote frontend — o warning `Unused eslint-disable directive` em `coverage/block-navigation.js` não ocorre mais. Nenhum outro arquivo foi alterado. Suíte do frontend intacta (a correção é só de config de lint, sem impacto em código ou testes).

