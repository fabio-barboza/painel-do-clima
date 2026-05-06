# PRD — Painel de Monitoramento de Clima

## Visão Geral

O Painel do Clima é uma aplicação full-stack que permite a qualquer usuário consultar informações climáticas de qualquer cidade do mundo de forma rápida e visual. O problema: sites de previsão do tempo são frequentemente poluídos visualmente e lentos. A solução é um painel limpo, responsivo e com design premium inspirado no Superhuman, onde o usuário digita uma cidade e imediatamente visualiza clima atual, previsão horária e previsão de 7 dias.

Toda comunicação com APIs externas passa exclusivamente pelo backend — o frontend nunca acessa APIs diretamente.

## Objetivos

- **Tempo de resposta da API backend < 2 segundos** (do request do frontend até o retorno dos dados)
- **Carregamento inicial do frontend < 3 segundos** (Time to Interactive)
- Interface responsiva com abordagem mobile-first
- Integração completa com Open-Meteo Geocoding API e Forecast API
- Experiência visual premium seguindo o design system documentado em `frontend/DESIGN.md`

## Histórias de Usuário

**Persona primária:** Usuário geral que deseja uma consulta rápida e visual do clima.

1. **Consulta por cidade:** Como usuário, quero digitar o nome de uma cidade e ver imediatamente o clima atual, para planejar meu dia sem navegar em sites poluídos.

2. **Usar minha localização:** Como usuário, quero clicar em um botão para usar minha localização atual e ver o clima sem precisar digitar nada.

3. **Previsão por hora:** Como usuário, quero visualizar um gráfico interativo com a previsão de temperatura e precipitação das próximas horas, para entender a evolução do clima ao longo do dia.

4. **Previsão de 7 dias:** Como usuário, quero ver cards com temperatura mínima e máxima dos próximos 7 dias, para planejar a semana.

5. **Feedback de carregamento:** Como usuário, quero ver skeletons animados enquanto os dados carregam, para saber que o sistema está trabalhando.

6. **Cidade não encontrada:** Como usuário, quero ver uma mensagem amigável quando a cidade não for encontrada, com opção de tentar novamente.

7. **Erro na API:** Como usuário, quero ver uma mensagem clara com opção de retry quando algo der errado na consulta.

## Funcionalidades Principais

### 1. Busca de cidade por nome

Campo de texto onde o usuário digita o nome da cidade. O backend converte o nome em coordenadas via Open-Meteo Geocoding API e retorna os dados climáticos.

- **RF-01:** O campo de busca deve aceitar nomes de cidades em qualquer idioma suportado pelo Open-Meteo Geocoding.
- **RF-02:** Ao submeter a busca, o frontend deve chamar `GET /api/weather?city=<nome>`.
- **RF-03:** Não há funcionalidade de autocomplete nesta versão.

### 2. Geolocalização do usuário

Botão que utiliza a API de geolocalização do navegador para obter as coordenadas do usuário e buscar o clima automaticamente.

- **RF-04:** O botão de geolocalização deve solicitar permissão ao usuário via `navigator.geolocation`.
- **RF-05:** Ao obter a localização, o frontend deve chamar o backend com as coordenadas para buscar o clima.
- **RF-06:** Se o usuário negar a permissão, exibir mensagem amigável sem bloquear o uso manual.

### 3. Clima atual da cidade

Exibição dos dados climáticos atuais em cards visuais.

- **RF-07:** Exibir temperatura atual (°C).
- **RF-08:** Exibir umidade relativa (%).
- **RF-09:** Exibir velocidade do vento (km/h).
- **RF-10:** Exibir índice UV com barra visual em gradiente (verde a vermelho).
- **RF-11:** Exibir precipitação atual (mm).
- **RF-12:** Os cards devem conter ícones animados representando a condição climática.

### 4. Previsão por hora (gráfico interativo)

Gráfico interativo mostrando a evolução da temperatura e precipitação nas próximas 24 horas.

- **RF-13:** Utilizar Chart.js para renderizar o gráfico de linha/área.
- **RF-14:** O gráfico deve exibir temperatura e precipitação por hora.
- **RF-15:** O gráfico deve ser interativo (hover para detalhes).

### 5. Previsão dos próximos 7 dias

Cards horizontais com informação de cada dia.

- **RF-16:** Exibir temperatura mínima e máxima de cada dia.
- **RF-17:** Exibir precipitação diária.
- **RF-18:** Cada card deve conter barras visuais de mínima/máxima.

### 6. Experiência visual e feedback

- **RF-19:** Skeleton loading deve aparecer durante o carregamento dos dados.
- **RF-20:** Cores dinâmicas conforme a condição climática (azul para céu limpo, cinza para nublado, etc.).
- **RF-21:** Layout responsivo com abordagem mobile-first.
- **RF-22:** Seguir rigorosamente o design system documentado em `frontend/DESIGN.md`.

### 7. Tratamento de erros

- **RF-23:** Exibir mensagem amigável quando a cidade não for encontrada (HTTP 404).
- **RF-24:** Exibir mensagem de erro com opção de retry para falhas na API (HTTP 400 ou erros de rede).
- **RF-25:** O payload de erro do backend deve seguir formato consistente.

## Experiência do Usuário

### Fluxo principal
1. Usuário abre a aplicação em `/` — cai direto no painel, sem tela intermediária.
2. Digita o nome da cidade no campo de busca e submete.
3. Skeleton loading aparece imediatamente.
4. Dados climáticos são exibidos: clima atual, gráfico horário, cards de 7 dias.

### Fluxo alternativo — Geolocalização
1. Usuário clica no botão de geolocalização.
2. Navegador solicita permissão.
3. Se permitido, dados climáticos são carregados automaticamente.
4. Se negado, mensagem amigável é exibida e o campo manual permanece disponível.

### Diretrizes de UI/UX
- Design premium inspirado no Superhuman, documentado em `frontend/DESIGN.md`.
- Hero em Mysteria Purple (`#1b1938`), cards com Parchment Border (`#dcd7d3`), botões Warm Cream (`#e9e5dd`).
- Tipografia com pesos não-convencionais (460, 540), line-height comprimido (0.96) em títulos.
- Border-radius limitado a 8px e 16px exclusivamente.
- Nenhum comentário no código.

### Acessibilidade
- Contraste adequado entre texto e fundo em todas as seções.
- Componentes interativos acessíveis por teclado.
- Imagens e ícones com texto alternativo apropriado.

## Restrições Técnicas de Alto Nível

- **O frontend nunca deve chamar APIs externas diretamente** — todo tráfego externo passa pelo backend.
- Integração com Open-Meteo Geocoding API (`https://geocoding-api.open-meteo.com/v1/search`) e Forecast API (`https://api.open-meteo.com/v1/forecast`).
- O payload retornado pelo backend pode seguir o formato da API Open-Meteo sem remodelação pesada.
- Biblioteca de gráficos: Chart.js.
- Stack: React 19 + Vite (frontend), Express 4 (backend), CommonJS no backend, ESM no frontend.
- Meta de performance: resposta da API < 2s, carregamento inicial < 3s.

## Fora de Escopo

- Toggle de tema claro/escuro — não haverá.
- Comentários no código — não são desejados.
- Frontend consumindo API externa diretamente — jamais.
- Autocomplete de cidade na busca.
- Progressive Web App (PWA) ou funcionalidade offline.
- Notificações push ou alertas climáticos.
- Armazenamento local de histórico de buscas.
- Internacionalização (i18n) — interface em português apenas.
- Testes de carga ou benchmarks de escalabilidade.
