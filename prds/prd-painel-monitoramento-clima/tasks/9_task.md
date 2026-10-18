# Tarefa 9.0: WeatherIcon (SVGs animados por categoria)

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Cria `frontend/src/components/WeatherIcon.jsx` — ícones de clima em **SVGs próprios com animações CSS** (decisão D6 da techspec) para as 7 categorias de código WMO, com paleta que segue o tema ativo via custom properties. FR-20 do PRD: cards visuais com ícones animados representando o clima.

<requirements>
- Um SVG por categoria (7 no total): `clear`, `partly`, `cloudy`, `fog`, `rain`, `snow`, `thunder`
- Animações CSS sutis (ex.: sol girando, nuvens flutuando, gotas de chuva caindo) — performáticas (preferir `transform`/`opacity`)
- Cores herdadas do tema ativo via CSS custom properties (sem cor hardcoded por tema)
- Prop `category` (a categoria de `categorizeWeatherCode`) e prop de tamanho opcional
- Acessibilidade: SVG decorativo com `aria-hidden="true"` (o texto do clima fica por conta do componente pai)
- Sem biblioteca de ícones externa (D6); sem comentários em código novo (D13)
</requirements>

## Subtarefas

- [x] 9.1 Criar os 7 SVGs (um por categoria)
- [x] 9.2 Criar as animações CSS (sutil, performática) em `src/index.css`
- [x] 9.3 Ligar a paleta dos ícones aos tokens/temas ativos
- [x] 9.4 Criar testes de unidade do componente (ver "Testes da Tarefa")

## Detalhes de Implementação

Seguir a techspec (`../techspec.md`): "Arquitetura do Sistema" (tabela frontend — `WeatherIcon.jsx`: SVGs próprios animados por categoria de código WMO) e "Considerações Técnicas" (decisão D6: SVGs próprios + animações CSS — controle total da paleta por tema, bundle leve). A categoria de entrada vem de `categorizeWeatherCode` (Tarefa 5.0). FR-20 do PRD.

## Critérios de Sucesso

- As 7 categorias renderizam SVGs distintos com animação visível
- Paleta segue o tema ativo (muda ao trocar `data-theme`)
- `aria-hidden="true"` presente nos SVGs
- Nenhuma dependência de ícones adicionada
- Suíte de testes verde (`cd frontend && npm run test -- run`)
- Sem comentários em código novo (D13)

## Testes da Tarefa

- [x] Testes de unidade: `frontend/src/__tests__/WeatherIcon.test.jsx` — renderiza o SVG correto por categoria (7 categorias) e `aria-hidden`

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/components/WeatherIcon.jsx` (novo)
- `frontend/src/index.css` (modificar — animações dos ícones)
- `frontend/src/__tests__/WeatherIcon.test.jsx` (novo)
