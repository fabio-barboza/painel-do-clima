# Product Requirements Document (PRD) — Painel de Monitoramento de Clima

**Feature:** `painel-monitoramento-clima`
**Status:** Aprovado para especificação técnica
**Data:** 2026-10-17

## Visão Geral

O Painel de Monitoramento de Clima é uma aplicação full stack que permite ao usuário consultar informações meteorológicas de qualquer cidade de forma simples, rápida e visualmente agradável.

**Problema que resolve:** hoje o usuário precisa acessar sites externos, lidar com múltiplas telas e dados mal organizados para responder perguntas do dia a dia — "que clima está fazendo agora?", "vai chover nas próximas horas?", "como será a semana?". Este painel centraliza condições atuais, previsão por hora (24h) e previsão de 7 dias em uma única interface.

**Para quem:** qualquer pessoa que consulte clima, em dispositivos mobile, tablet ou web.

**Por que é valioso:** entrega uma experiência moderna, responsiva e com identidade visual dinâmica (que muda conforme o clima), em que o usuário digita o nome de uma cidade — ou usa um clique de geolocalização — e recebe tudo em um único painel, direto pela rota principal, sem telas intermediárias.

**Regra de arquitetura central:** o frontend (React) **nunca** consome a API da Open-Meteo diretamente. Todo contato com serviços externos passa obrigatoriamente pelo backend (Node.js), que resolve a geolocalização (geocoding) e busca a previsão, devolvendo os dados prontos para renderização. O repositório também serve de campo de provas para o framework Development Orchestrator (SDD: PRD → TechSpec → Tasks → Execução → Review → QA).

## Objetivos

**Sucesso (meta mensurável principal):** o painel é validado visualmente como responsivo e utilizável em três contextos — mobile, tablet e desktop — com todos os fluxos principais funcionando de ponta a ponta (busca por cidade, geolocalização e tratamento de erros).

**Objetivos de apoio:**

- **Busca ponta a ponta:** o usuário digita uma cidade, o frontend envia ao backend, o backend consulta geocoding + previsão e o painel exibe os dados, com feedback visual claro em todas as etapas.
- **Robustez de erros:** 100% dos cenários de falha (cidade não encontrada, parâmetro inválido, falha de comunicação, geolocalização negada) apresentam mensagem amigável e/ou opção de nova tentativa.
- **Validação contra a fonte real:** o endpoint interno do backend é validado com os dados reais da Open-Meteo (estrutura e retorno conferidos via curl nas APIs externas e, em seguida, no endpoint interno), garantindo que a resposta seja repassada corretamente ao frontend.
- **Documentação de infraestrutura:** portas de desenvolvimento e produção e a estratégia de comunicação frontend↔backend ficam explicitamente documentadas e consistentes em todo o projeto.
- **Zero cache HTTP:** nenhuma resposta entre frontend e backend pode ser cacheada.

**Métricas principais para acompanhar:**

| Métrica | Alvo |
|---|---|
| Fluxos principais funcionando ponta a ponta (busca, geolocalização, erros) | 100% |
| Layout responsivo validado em mobile, tablet e desktop | 100% dos breakpoints-alvo |
| Cenários de erro com feedback claro e recuperável | 100% |
| Chamadas diretas do frontend às APIs externas | 0 (verificável por inspeção do código) |
| Respostas do backend com ETag / cache HTTP | 0 |

**Objetivo de negócio:** entregar um scaffold funcional, limpo e bem separado (frontend e backend independentes), pronto para servir de base para evoluções futuras.

**Objetivo de performance:** não há meta dura de latência nesta versão (entrega é um scaffold); o painel deve se sentir fluido no uso, sem travamentos perceptíveis durante busca e renderização.

## Histórias de Usuário

### Personas

**Ana (persona primária):** consulta o clima antes de sair de casa ou para planejar compromissos. Usa o navegador no desktop ou no celular, não é especialista em tecnologia e espera uma resposta imediata e legível. Sua necessidade: digitar a cidade e ver agora tudo o que importa — hoje, as próximas horas e a semana.

**Bruno (persona secundária):** está em trânsito (viagem, trabalho, exercício ao ar livre). Não quer digitar o nome da cidade: quer um botão que descubra onde ele está e mostre o clima local na hora. Sua necessidade: geolocalização em um clique e informação de precipitação em destaque para decidir se leva guarda-chuva.

### Histórias

1. Como **usuário**, eu quero digitar o nome de uma cidade em um campo de texto simples e buscar, para que eu veja o clima sem precisar de ajuda (autocomplete) para completar o nome.
2. Como **usuário**, eu quero ver as condições climáticas atuais (temperatura, umidade, velocidade do vento, índice UV e precipitação), para que eu saiba o que está acontecendo agora.
3. Como **usuário**, eu quero ver a previsão por hora das próximas 24 horas com temperatura e precipitação em um gráfico interativo, para que eu possa planejar as próximas horas (ex.: quando sair, quando chove).
4. Como **usuário**, eu quero ver a previsão dos próximos 7 dias com mínima, máxima e volume de chuva de forma comparativa, para que eu planeje a semana (roupas, viagens, eventos).
5. Como **usuário em trânsito**, eu quero um botão que use a geolocalização do meu navegador, para que eu consulte automaticamente o clima da minha localização atual sem digitar nada.
6. Como **usuário**, eu quero receber uma mensagem amigável quando a cidade não for encontrada, para que eu saiba que posso tentar novamente com outro nome.
7. Como **usuário**, eu quero um feedback claro com opção de tentar novamente quando houver falha de comunicação, para que eu não ache que a aplicação quebrou.
8. Como **usuário**, eu quero que a identidade visual do painel mude conforme as condições do tempo, para que a experiência seja agradável e a leitura do estado atual seja imediata.
9. Como **usuário em mobile ou tablet**, eu quero que o layout se adapte ao meu dispositivo, para que eu use o painel com o mesmo conforto em qualquer tela.
10. Como **usuário**, eu quero ver o índice UV em uma barra de gradiente do verde ao vermelho, para que eu entenda de um relance o nível de proteção que preciso.

### Casos extremos

| Caso | Comportamento esperado |
|---|---|
| Cidade não encontrada | Mensagem amigável orientando nova tentativa |
| Parâmetro de busca inválido/ausente | Resposta de erro clara do backend e feedback na interface |
| Falha de comunicação (rede/backend) | Feedback claro + botão de tentar novamente |
| Permissão de geolocalização negada ou indisponível | Mensagem amigável; a busca por cidade continua disponível |
| Cidade ambígua (múltiplos resultados no geocoding) | Adota-se o primeiro resultado em português; o usuário pode refazer a busca com outro nome |
| Nova busca durante carregamento da anterior | A interface não confunde resultados: apenas o resultado da busca mais recente é exibido |

## Funcionalidades Principais

### F1 — Busca por cidade

- **FR-1:** O painel deve disponibilizar um campo de texto simples para digitação do nome da cidade e disparo da busca. Não existe autocomplete nesta versão.
- **FR-2:** Ao buscar, o frontend deve enviar o nome da cidade ao backend; o backend deve resolver o geocoding (nome → latitude/longitude) e consultar a API de previsão com as coordenadas, devolvendo os dados ao frontend, que apenas renderiza as informações.
- **FR-3:** O backend deve expor o endpoint principal `GET /api/weather?city=` com os seguintes retornos: **200** quando a consulta for bem-sucedida; **400** quando houver parâmetros inválidos (ex.: parâmetro ausente); **404** quando a cidade não for encontrada.
- **FR-4:** Ao acessar a aplicação, o usuário deve cair diretamente no painel principal pela rota `/`, sem telas intermediárias.

### F2 — Condições climáticas atuais

- **FR-5:** O painel deve exibir as condições climáticas atuais da cidade pesquisada: temperatura, umidade, velocidade do vento, índice UV e precipitação.
- **FR-6:** As unidades exibidas devem ser métricas: °C, km/h e mm (o índice UV é adimensional).
- **FR-7:** O índice UV deve ser apresentado como uma barra de gradiente variando entre verde e vermelho, indicando visualmente a posição do valor atual.

### F3 — Previsão por hora (24h)

- **FR-8:** O painel deve exibir a previsão por hora das próximas 24 horas, contendo temperatura e precipitação.
- **FR-9:** Essa previsão deve ser apresentada em formato gráfico interativo, permitindo ao usuário inspecionar o detalhe de cada ponto (tooltip ao passar ou tocar o dedo).

### F4 — Previsão para 7 dias

- **FR-10:** O painel deve exibir a previsão para os próximos 7 dias, mostrando para cada dia a temperatura mínima, a temperatura máxima e o volume de chuva.
- **FR-11:** Os cards da previsão semanal devem mostrar visualmente a variação entre mínima e máxima através de indicadores gráficos simples.
- **FR-12:** O volume de chuva deve ser apresentável de forma comparativa ao longo dos 7 dias.

### F5 — Geolocalização

- **FR-13:** O painel deve disponibilizar um botão para usar a geolocalização do navegador e consultar automaticamente o clima da localização atual do usuário.
- **FR-14:** Caso a permissão de geolocalização seja negada ou indisponível, o painel deve exibir uma mensagem amigável e continuar permitindo a busca por nome de cidade.

### F6 — Erros e feedback

- **FR-15:** Caso a cidade não seja encontrada, a aplicação deve exibir uma mensagem amigável orientando nova tentativa.
- **FR-16:** Caso haja falha de comunicação, o usuário deve receber feedback claro e uma opção de tentar novamente.
- **FR-17:** Enquanto os dados estão carregando, o painel deve exibir skeleton loading em substituição aos cards e gráficos.
- **FR-18:** A interface deve dar feedback visual claro durante as buscas (estado de carregamento perceptível no disparo da busca).

### F7 — Identidade visual dinâmica

- **FR-19:** A identidade visual do painel deve mudar dinamicamente conforme as condições climáticas: céu limpo em tons azulados, tempo nublado em tons acinzentados e chuva em tons mais escuros e frios.
- **FR-20:** O painel deve usar cards visuais com ícones animados representando o clima.
- **FR-21:** O layout deve ser responsivo e adaptado para mobile, tablet e web.

## Experiência do Usuário

### Personas e necessidades

- **Ana (primária):** busca velocidade de resposta e legibilidade. Necessita ver os três níveis de informação (agora / 24h / 7 dias) sem rolagem excessiva e sem termos técnicos.
- **Bruno (secundário):** busca o mínimo de passos. Necessita de geolocalização em um clique e de precipitação em destaque para decisões imediatas.

### Fluxo principal

1. O usuário abre a aplicação e cai diretamente no painel principal (rota `/`).
2. Digita o nome da cidade no campo de busca (ou clica no botão de geolocalização).
3. A interface mostra feedback de busca em andamento (skeleton loading).
4. O painel exibe: condições atuais (incluindo barra UV), gráfico interativo das próximas 24h e cards comparativos dos próximos 7 dias.
5. A identidade visual se ajusta à condição predominante do clima retornado.

### Fluxos alternativos e de erro

- **Cidade não encontrada:** mensagem amigável orientando nova tentativa; o campo de busca continua disponível.
- **Falha de comunicação:** mensagem clara de erro + botão "Tentar novamente".
- **Geolocalização negada:** mensagem amigável sugerindo a busca manual por cidade.

### Considerações e requisitos de UI/UX

- Busca por campo de texto simples, **sem autocomplete** nesta versão.
- Skeleton loading enquanto os dados carregam; feedback visual claro durante buscas.
- Gráfico interativo com tooltip em pontos de temperatura e precipitação.
- Cards da semana com indicador gráfico de variação mín/máx e indicação de chuva.
- Barra de gradiente verde→vermelho para o índice UV.
- Identidade visual dinâmica por condição climática (azulado / acinzentado / escuro frio).
- Ícones animados representando o clima nos cards.
- Layout responsivo em mobile, tablet e web, com hierarquia de informação legível em todas as larguras.

### Requisitos de acessibilidade (WCAG 2.1 AA)

- Contraste de texto e elementos suficientes em todas as variações de identidade visual (incluindo os temas por condição climática).
- Navegação completa por teclado: busca, botão de geolocalização, gráfico e todos os interativos acessíveis.
- Estrutura semântica de página e labels compatíveis com leitores de tela, incluindo descrições para a barra UV e para os indicadores gráficos de mín/máx.
- Foco visível e inequívoco em todos os elementos interativos.

## Restrições Técnicas de Alto Nível

- **Integrações externas:** Open-Meteo Geocoding (`https://geocoding-api.open-meteo.com/v1/search`) e Open-Meteo Forecast (`https://api.open-meteo.com/v1/forecast`) — APIs públicas, sem chave de API.
- **Não negociável:** o frontend **nunca** consome a Open-Meteo diretamente. Toda comunicação com serviços externos passa obrigatoriamente pelo backend, que é o único responsável por intermediar requisições e resolver a geolocalização.
- **Formato de dados:** o backend pode devolver os dados seguindo o mesmo formato da Open-Meteo, sem necessidade de remodelagem complexa nesta versão.
- **Cache HTTP:** não deve existir **nenhum** tipo de cache HTTP entre frontend e backend. No backend, ETags devem ser desabilitadas e todas as respostas devem retornar `Cache-Control: no-store`. No frontend, toda chamada `fetch` deve usar explicitamente `cache: 'no-store'`.
- **CORS:** o backend deve possuir configuração explícita de CORS definindo origens aceitas, métodos permitidos e headers autorizados. Durante desenvolvimento pode aceitar qualquer origem, mas isso precisa estar documentado.
- **Estratégia de comunicação frontend↔backend:** deve ser definida de forma explícita (proxy do dev server, como Vite proxy, ou comunicação via URL absoluta com CORS habilitado), documentada e consistente em todo o projeto.
- **Portas:** as portas usadas pelo frontend e pelo backend devem estar claramente documentadas para desenvolvimento e produção — frontend `5173` e backend `3000` em ambos os ambientes.
- **Estrutura do projeto:** separação em dois diretórios independentes — `/frontend` (aplicação React) e `/backend` (servidor Node.js).
- **Performance:** sem meta dura de latência nesta versão (scaffold); o backend deve responder de forma fluida e o frontend não deve bloquear a interface durante buscas.
- **Privacidade de dados:** nenhum dado pessoal sensível é armazenado; a geolocalização do navegador é utilizada apenas no momento da consulta, a pedido explícito do usuário.

## Fora de Escopo

**Excluídos explicitamente nesta entrega:**

- Tema claro/escuro (alternância de tema).
- Autocomplete de cidades.
- Comentários no código.
- Remodelagem avançada do payload da Open-Meteo.
- Qualquer chamada direta da API externa pelo frontend.

**Considerações futuras (fora do escopo agora):**

- Seletor de unidades (métrico/imperial) — as unidades desta versão são fixas em métrico.
- Comparação entre múltiplas cidades.
- Histórico climático (clima passado).
- Cidades favoritas/salvas.
- PWA e funcionamento offline.
- Persistência da última cidade consultada.
