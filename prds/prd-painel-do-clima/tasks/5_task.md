# Tarefa 5.0: IconSprite + Icon + Reveal/useReveal

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Porta para React as duas fundações visuais sem as quais nenhum outro componente funciona: o sprite de 16 símbolos SVG do protótipo (`IconSprite` renderizado 1× + `Icon` via `<use href="#i-*">`) e o mecanismo de revelação por seção (`Reveal` + `useReveal`, IntersectionObserver one-shot — base do reveal das seções e do disparo da animação do gráfico).

## Requisitos atendidos (FR)

- **FR-21** — fundação dos ícones animados da condição (sprite `i-sun`/`i-cloud-sun`/`i-cloud`/`i-rain`/`i-storm`).
- **FR-27** — fundação dos ícones semanais.
- **FR-26** — fundação da animação de entrada do gráfico (disparo por interseção).
- **FR-30** — reveal das seções (one-shot, com reduced-motion respeitado pelo CSS portado).

## Referência visual (painel.html)

- **Sprite, linhas 394–486** — `<svg width="0" height="0" style="position:absolute" aria-hidden="true">` com `<defs>` e os 16 `<symbol id="i-*">` (ids exatos: `i-sun`, `i-sun-rays`, `i-cloud`, `i-cloud-sun`, `i-rain`, `i-storm`, `i-drop`, `i-wind`, `i-thermo`, `i-uv`, `i-pin`, `i-up`, `i-down`, `i-brand`, `i-search`, `i-gps`) — mesma geometria (viewBox/paths).
- **Reveal JS, linhas 839–847** — `IntersectionObserver` com `threshold: 0.15`, one-shot (`unobserve` após adicionar `.in`); o CSS `.reveal`/`.reveal.in` já foi portado na task 4.

## Subtarefas

- [x] 5.1 Criar `frontend/src/components/IconSprite.jsx`: sprite oculto com os 16 símbolos verbatim (mesmos ids, viewBox e geometria das linhas 394–486).
- [x] 5.2 Criar `frontend/src/components/Icon.jsx`: `<svg class="ico" aria-hidden="true"><use href="#{name}"/></svg>` (prop `name` sem o prefixo `i-` ou com — definir uma convenção e usar consistentemente).
- [x] 5.3 Criar `frontend/src/hooks/useReveal.js`: IntersectionObserver `threshold: 0.15`, one-shot (`.in` + `unobserve`), cleanup no unmount (idempotente ao double-mount do StrictMode).
- [x] 5.4 Criar `frontend/src/components/Reveal.jsx`: wrapper `class="reveal"` com `--d` inline (delay), prop `instant` (aplica `.in` imediatamente, sem animação — usada pelo skeleton) e `className` passável.
- [x] 5.5 Testes (unidade + integração).

## Detalhes de Implementação

Ver `techspec.md`: "Arquitetura → Frontend" (linhas `IconSprite.jsx`/`Icon.jsx`/`Reveal.jsx`), "Componentização — mapa painel.html → React" (linhas do sprite e do JS reveal), "Animações e interações → De entrada (revelação)" (threshold 0.15, one-shot, delays por seção).

## Critérios de Sucesso

- Os 16 símbolos presentes com os ids do protótipo e geometria idêntica (teste verifica cada id no DOM após render e compara um subconjunto de geometria, ex.: `viewBox` e um path do `i-sun`).
- `Icon` renderiza `<use href="#i-*">` com `aria-hidden="true"` e classe `ico`.
- `useReveal`: one-shot (após `.in` não esconde de novo mesmo com nova interseção); cleanup desliga o observer; duplo mount (StrictMode) não duplica observers.
- `Reveal`: aplica `--d` correto, `instant` aplica `.in` sem depender do IO.

## Testes da Tarefa

- [x] Testes de unidade (`frontend/src/__tests__/icons.test.jsx` e `reveal.test.jsx`): `Icon` (href por `name`, `aria-hidden`); `Reveal` (delay `--d`, `instant`); `useReveal` (one-shot com stub de IO; `unobserve` chamado após `.in`; cleanup no unmount).
- [x] Testes de integração: renderizar `IconSprite` + os 16 `Icon`s — todo `<use>` resolve para um símbolo existente (nenhuma referência quebrada, nenhum id duplicado).
- [ ] Teste de fumaça: **omitido** — componentes não executáveis por si (sem página montada); o fluxo visível é coberto pela fumaça da task 6 (app com céu/cabeçalho no ar).

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- Criar: `frontend/src/components/IconSprite.jsx`, `frontend/src/components/Icon.jsx`, `frontend/src/components/Reveal.jsx`, `frontend/src/hooks/useReveal.js`, `frontend/src/__tests__/icons.test.jsx`, `frontend/src/__tests__/reveal.test.jsx`.
- Dependências já entregues: CSS portado (task 4 — seletores `.reveal`, `.reveal.in`, `.ico`).
- Referência: `painel.html` (linhas 394–486 e 839–847).
