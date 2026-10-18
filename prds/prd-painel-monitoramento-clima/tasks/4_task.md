# Tarefa 4.0: Fundação de design (HTML pt-BR, tokens, temas, skeletons)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Prepara a base visual do frontend: `index.html` em pt-BR e o sistema de design em CSS puro (`src/index.css`) — tokens como custom properties, os **3 temas dinâmicos por condição climática** (`data-theme`: `clear` azulado, `cloudy` acinzentado, `rain` escuro/frio, FR-19 do PRD), estilos base de skeleton (FR-17) e a fundação responsiva para mobile/tablet/web (FR-21). Tudo CSS puro com custom properties (decisão D7 da techspec) — sem CSS-in-JS nem frameworks de estilo.

<requirements>
- `frontend/index.html`: `lang="pt-BR"`, título da aplicação e meta description
- `frontend/src/index.css`: design tokens (cores, tipografia, espaçamentos, raios, sombras) como CSS custom properties
- Tema base aplicado na raiz do painel + temas alternativos via atributo `data-theme` com valores `clear`, `cloudy` e `rain`:
  - `clear` → tons azulados (céu limpo)
  - `cloudy` → tons acinzentados (nublado/nevoeiro)
  - `rain` → tons mais escuros e frios (chuva/neve/tempestade)
- **Contraste WCAG 2.1 AA** em texto e elementos interativos em TODOS os 3 temas (requisito de acessibilidade do PRD)
- Estilos base de skeleton com animação de pulso (usados pela Tarefa 8.0)
- Fundação responsiva (breakpoints mobile, tablet, web) com hierarquia de informação legível
- CSS puro (decisão D7) — nenhuma dependência nova de estilo
- Sem comentários em código novo (D13)
</requirements>

## Subtarefas

- [x] 4.1 Atualizar `frontend/index.html` (`lang="pt-BR"`, título, meta description)
- [x] 4.2 Definir design tokens como custom properties (tema base `clear`)
- [x] 4.3 Implementar os 3 temas via `data-theme` (`clear`, `cloudy`, `rain`)
- [x] 4.4 Garantir contraste WCAG 2.1 AA nos 3 temas (texto sobre fundo, elementos interativos, foco visível)
- [x] 4.5 Criar estilos base de skeleton (animação de pulso)
- [x] 4.6 Criar a fundação responsiva (breakpoints mobile/tablet/web)
- [x] 4.7 Verificar visualmente os 3 temas no dev server (`npm run dev` em `frontend/`)

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): "Resumo Executivo" (CSS puro com custom properties para identidade dinâmica), "Arquitetura do Sistema" (tabela frontend — `index.css`: tokens, temas, skeletons, responsivo; `index.html`: pt-BR), "Considerações Técnicas" (decisão D7: CSS custom properties + `data-theme`) e "Riscos Conhecidos" (temas dinâmicos violarem contraste WCAG AA → tokens fixos por tema). FR-17, FR-19 e FR-21 do PRD definem o comportamento exigido.

## Critérios de Sucesso

- `index.html` com `lang="pt-BR"`, título e meta description
- Tokens existem como custom properties no CSS (verificável em código)
- Os 3 temas (`data-theme="clear|cloudy|rain"`) existem e mudam a paleta da raiz
- Contraste AA em todos os temas
- Skeleton com animação de pulso visível
- Layout responsivo nos 3 contextos (mobile, tablet, web)
- `npm run lint` passa em `frontend/`
- Suíte de testes da tarefa verde (`cd frontend && npm run test -- run`)
- Sem comentários em código novo (D13)

## Testes da Tarefa

- [x] Testes de unidade: `frontend/src/__tests__/designTokens.test.js` — lê `src/index.css` e asser: tokens como custom properties presentes; seletores dos 3 temas `data-theme` presentes; estilos de skeleton presentes
- [x] Testes de integração: `frontend/src/__tests__/indexHtml.test.js` — `index.html` com `lang="pt-BR"`, título e meta description

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/index.html` (modificar)
- `frontend/src/index.css` (modificar — tokens, temas, skeletons, responsivo)
- `frontend/src/__tests__/designTokens.test.js` (novo)
- `frontend/src/__tests__/indexHtml.test.js` (novo)
