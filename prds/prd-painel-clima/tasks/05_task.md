# Tarefa 5.0: Frontend — Design System CSS + SearchBar + SkeletonLoader + ErrorMessage

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses artigos sua tarefa será invalidada</critical>

## Visão Geral

Implementar a camada de estilos globais do design system e os três componentes de entrada/feedback: SearchBar (busca por cidade + botão de geolocalização), SkeletonLoader (skeletons animados para cada seção) e ErrorMessage (mensagem de erro com retry). Esta tarefa estabelece a fundação visual do painel.

<requirements>
- RF-01: Campo de busca aceita nomes de cidades
- RF-04: Botão de geolocalização solicita permissão via `navigator.geolocation`
- RF-06: Se usuário negar permissão, exibir mensagem amigável sem bloquear uso manual
- RF-19: Skeleton loading durante carregamento
- RF-22: Seguir rigorosamente o design system em `frontend/DESIGN.md`
- RF-23: Mensagem amigável quando cidade não encontrada
- RF-24: Mensagem de erro com opção de retry
- Design: Mysteria Purple (`#1b1938`) hero, Warm Cream (`#e9e5dd`) botões, Charcoal Ink (`#292827`) texto, Lavender Glow (`#cbb7fb`) accent
- Border-radius apenas 8px e 16px
- Tipografia: Super Sans VF com pesos 460/540, line-height 0.96 (títulos) / 1.50 (corpo)
- Layout responsivo mobile-first
- Nenhum comentário no código
</requirements>

## Subtarefas

- [x] 5.1 Implementar `frontend/src/index.css` — reset CSS, variáveis CSS (design tokens), tipografia base
- [x] 5.2 Implementar `frontend/src/App.css` — layout global, hero gradient, container
- [x] 5.3 Implementar `frontend/src/components/SearchBar.jsx` — campo de busca + botão de geolocalização
- [x] 5.4 Implementar `frontend/src/components/SkeletonLoader.jsx` — skeletons animados para cada seção (current, hourly, daily)
- [x] 5.5 Implementar `frontend/src/components/ErrorMessage.jsx` — mensagem de erro com botão de retry
- [x] 5.6 Testes dos componentes: renderização, interações de busca, geolocalização, retry

## Detalhes de Implementação

### index.css (Design Tokens)
- Reset CSS básico (box-sizing, margin, padding)
- Variáveis CSS customizadas (`:root`): cores, tipografia, espaçamento conforme `frontend/DESIGN.md`
- Font-family: `Super Sans VF, system-ui, -apple-system, ...`
- Estilos base para body: background `#ffffff`, cor `#292827`, fonte 16px/460

### App.css
- Hero section com gradiente Mysteria Purple (`#1b1938`)
- Container com max-width ~1200px, centrado
- Spacing system baseado em 8px (conforme DESIGN.md seção 5)

### SearchBar.jsx
- Input de texto com placeholder "Buscar cidade..."
- Botão de geolocalização (ícone de localização)
- Ao submeter (Enter ou botão de busca): chama `onSearch(city)` do props
- Ao clicar geolocalização: chama `navigator.geolocation.getCurrentPosition` → `onGeoSearch(lat, lon)`
- Se permissão negada: chama `onGeoError(message)` do props
- Estilização: Warm Cream (`#e9e5dd`) no botão, Parchment Border (`#dcd7d3`) no input, 8px border-radius

### SkeletonLoader.jsx
- Props: `type` ("current" | "hourly" | "daily")
- Renderiza skeletons com animação CSS (`@keyframes shimmer`)
- Layout corresponde à seção que representa (cards para current, área para gráfico, cards para daily)

### ErrorMessage.jsx
- Props: `message`, `onRetry`
- Exibe ícone + texto de erro + botão "Tentar novamente"
- Estilização condizente com design system (fundo branco, borda Parchment, texto Charcoal)

## Critérios de Sucesso

- CSS carrega corretamente com design tokens aplicados
- SearchBar renderiza campo de busca e botão de geolocalização
- Submeter busca dispara callback com nome da cidade
- Botão de geolocalização dispara callback com coordenadas
- Geolocalização negada dispara callback de erro sem travar a UI
- SkeletonLoader renderiza animação de shimmer
- ErrorMessage exibe mensagem e botão de retry funcional
- Layout responsivo em mobile (<768px), tablet e desktop
- Todos os testes passam
- Zero comentários no código

## Testes da Tarefa

- [x] Testes do SearchBar: renderização, submit de busca, clique em geolocalização, permissão negada
- [x] Teste do SkeletonLoader: renderização dos 3 tipos
- [x] Teste do ErrorMessage: exibição da mensagem e clique em retry

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/src/index.css` (reescrever)
- `frontend/src/App.css` (reescrever)
- `frontend/src/components/SearchBar.jsx` (criar)
- `frontend/src/components/SkeletonLoader.jsx` (criar)
- `frontend/src/components/ErrorMessage.jsx` (criar)
- `frontend/src/__tests__/SearchBar.test.jsx` (criar)
- `frontend/src/__tests__/SkeletonLoader.test.jsx` (criar)
- `frontend/src/__tests__/ErrorMessage.test.jsx` (criar)
- `frontend/DESIGN.md` (referência — leitura obrigatória)
