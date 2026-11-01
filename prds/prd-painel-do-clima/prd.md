# PRD — Painel do Clima

| Campo | Valor |
|-------|-------|
| **Feature** | `painel-do-clima` |
| **Versão** | 1.0 |
| **Data** | 2026-10-27 |
| **Status** | Aprovado (requisitos e plano alinhados com o produto) |
| **Referência de comportamento/dados** | `exemplo_requisito.txt` (fonte de verdade para comportamento, regras e dados) |
| **Referência visual** | `painel.html` (fonte de verdade para aparência) |

---

## Visão Geral

O **Painel do Clima** é uma aplicação full stack (React no frontend, Node.js no backend) que permite a qualquer usuário consultar informações meteorológicas de qualquer cidade de forma simples, rápida e com uma interface visualmente agradável — uma experiência moderna e responsiva para mobile, tablet e web.

O problema que resolve: obter o clima atual, a previsão por hora e a previsão de 7 dias de uma cidade exige hoje consultar múltiplos sites e apps, sem uma superfície única, rápida e bonita. O painel centraliza tudo em uma única tela, com busca por nome de cidade ou por geolocalização do navegador.

Regra de arquitetura que fundamenta o produto: **o frontend nunca consome a API da Open-Meteo (ou qualquer outra API externa) diretamente.** Toda comunicação com serviços externos passa obrigatoriamente pelo backend, que intermediaria requisições, resolve a geolocalização e devolve os dados prontos para a interface.

**Regra de precedência (aplicável a todo o projeto):**

- **Comportamento, regras e dados** seguem o documento de requisito (`exemplo_requisito.txt`).
- **Aparencia** (design system, componentes, layout) segue o protótipo visual `painel.html`.
- Quando as duas fontes colidirem, a precedência acima decide.

**Contexto de entrega:** o repositório é o campo de provas do framework DO (SDD) — PRD → TechSpec → Tasks → Execução → Review → QA. A entrega esperada é um scaffold funcional, limpo e bem separado, pronto para servir de base para evoluções futuras, e a validação de cada fase será rastreada até os requisitos deste documento.

**Escopo desta versão:**

- Busca de clima por nome de cidade (campo de texto simples, sem autocomplete).
- Busca de clima por geolocalização do navegador (botão dedicado), com resolução do nome da cidade no backend.
- Painel único com: condições atuais, previsão por hora em gráfico interativo (temperatura + precipitação) e previsão dos próximos 7 dias (mínima, máxima e chuva).
- Estados visuais completos: estado vazio, skeleton loading, cidade não encontrada e falha de comunicação.
- Identidade visual idêntica ao protótipo `painel.html`, com tingimento sutil do fundo conforme a condição do tempo.

---

## Objetivos

**Como é o sucesso:** a aplicação funciona de ponta a ponta (busca, geolocalização, renderização dos três blocos de dados), responde corretamente a todos os casos de erro, é visualmente idêntica ao protótipo no estado carregado, é responsiva em mobile/tablet/web e respeita integralmente as restrições de arquitetura (sem cache, sem chamadas externas do frontend) — tudo validado por testes automatizados e QA E2E, com rastreabilidade até este PRD.

**Métricas principais:**

1. **100% dos requisitos funcionais (FR-01 a FR-38) implementados e validados** no QA, com evidência por requisito.
2. **Contrato da API respeitado:** `GET /api/weather` retorna `200` em sucesso, `400` em parâmetros inválidos/ausentes e `404` quando a cidade não é encontrada — validado por testes diretos no endpoint.
3. **Fidelidade visual: estado carregado indistinguível do `painel.html`** em comparação visual lado a lado nas larguras de referência 360px (mobile), 768px (tablet) e 1280px (web) — design system (cores, tipografia, espaçamentos), componentes, layout e o painel em si.
4. **Zero violações de cache:** 100% das respostas do backend com `Cache-Control: no-store` e sem ETag; 100% das chamadas `fetch` do frontend com `cache: 'no-store'` explícito.
5. **Zero chamadas de APIs externas a partir do frontend** (nenhuma requisição do frontend para a Open-Meteo ou qualquer domínio externo de dados).
6. **Responsividade sem quebra:** nenhum overflow horizontal e nenhum elemento cortado nos breakpoints de 360px, 768px e 1280px.
7. **Todos os fluxos de erro com feedback correto:** cidade não encontrada, falha de comunicação e geolocalização negada exibem mensagens amigáveis com ação de retry onde aplicável.

**Objetivos de negócio:**

- Entregar uma base full stack limpa e bem separada que sirva de **campo de provas do framework DO** (fluxo completo PRD → QA sem retrabalho por ambiguidade).
- Demonstrar o padrão de arquitetura "frontend → backend → serviço externo" como referência para evoluções futuras.

---

## Histórias de Usuário

**Persona primária — Usuário geral de clima**
Pessoa que quer saber rapidamente "como está o tempo na cidade X (ou aqui)" e planejar o dia ou a semana. Usa smartphone, tablet ou desktop, em qualquer horário. Não é usuária técnica.

**Persona secundária — Desenvolvedor da base**
Mantenedor do repositório, que usará o scaffold como base para evoluções futuras. Precisa de código limpo, bem separado (frontend/backend independentes) e com testes.

### Histórias

- Como **usuário geral**, eu quero **digitar o nome de uma cidade e ver o clima em poucos segundos** para que **eu possa me planejar sem sair da tela**.
- Como **usuário geral**, eu quero **usar a geolocalização do meu navegador com um toque** para que **eu não precise digitar a cidade quando já estou nela**.
- Como **usuário geral**, eu quero **ver a temperatura e a precipitação hora a hora em um gráfico interativo** para que **eu saiba o melhor horário para sair, correr ou viajar**.
- Como **usuário geral**, eu quero **ver os próximos 7 dias lado a lado (mínima, máxima e chuva)** para que **eu possa planejar a semana em uma única olhada**.
- Como **usuário geral**, eu quero **receber mensagens claras quando a cidade não existe ou algo falha, com opção de tentar de novo** para que **eu saiba exatamente o que fazer sem me perder**.
- Como **usuário com deficiência ou com preferências de acessibilidade**, eu quero **interface operável por teclado, com contraste adequado e movimento reduzido respeitado** para que **eu consiga usar o painel como qualquer outra pessoa**.
- Como **desenvolvedor da base**, eu quero **um scaffold com frontend e backend independentes, contratos de API explícitos e testes** para que **eu consiga evoluir o produto sem refazer a fundação**.

### Fluxos principais

1. **Busca por cidade (sucesso):** abrir "/" → estado vazio → digitar cidade → buscar (botão ou Enter) → skeleton loading → painel completo (atual + horário + 7 dias) com a cidade pesquisada identificada.
2. **Busca por geolocalização (sucesso):** abrir "/" → clicar em "Localização Atual" → navegador fornece coordenadas → backend resolve o nome da cidade e o clima → painel completo com o nome resolvido.
3. **Leitura e interação:** no painel carregado, o usuário passa o mouse/dedo sobre o gráfico por hora (tooltip com detalhes) e rola o card semanal para ver os 7 dias.

### Casos extremos e de erro

- **Estado inicial:** o painel abre vazio, sem dados, convidando a pesquisar ou usar a localização.
- **Cidade não encontrada (404):** mensagem amigável orientando nova tentativa; o painel permanece utilizável.
- **Parâmetros inválidos (400):** ex.: campo vazio — feedback indicando o que digitar.
- **Falha de comunicação (rede/5xx):** feedback claro + botão de "tentar novamente".
- **Geolocalização negada ou indisponível:** mensagem amigável; a busca por cidade continua funcionando.
- **Cidades com acentos, espaços e maiúsculas:** devem ser aceitas e resolvidas normalmente.
- **Cidades homônimas (mesmo nome em países diferentes):** uma delas é resolvida de forma determinística; o nome exibido é o da cidade resolvida.
- **Dados extremos:** temperaturas muito altas/baixas e valores de chuva zeros ou altos não podem quebrar o layout nem o gráfico.

---

## Funcionalidades Principais

> Numeração global `FR-XX` para rastreabilidade (TechSpec, Tasks, Review e QA referenciam estes números).

### 1. Endpoint de clima no backend

O backend é o único ponto de contato com o mundo externo. Ele expõe o endpoint principal que o frontend consome.

- O que faz: recebe o nome da cidade (ou coordenadas), resolve a localização, consulta o serviço de previsão e devolve os dados.
- Por que é importante: centraliza integrações, aplica a regra de arquitetura e isola o frontend de detalhes externos.
- Como funciona em alto nível: nome → geocoding (Open-Meteo) → coordenadas → previsão (Open-Meteo) → resposta ao frontend. Para geolocalização: coordenadas (navegador) → clima (Open-Meteo) + reverse geocoding (API pública gratuita) → nome exibido.

**Requisitos funcionais:**

- **FR-01** — O backend expõe o endpoint principal `GET /api/weather?city=<nome da cidade>`, que é o único endpoint de dados consumido pelo frontend.
- **FR-02** — Em uma busca por nome, o backend consulta a API de geocoding da Open-Meteo para transformar o nome em latitude/longitude e, em seguida, consulta a API de previsão do tempo com essas coordenadas, devolvendo os dados ao frontend.
- **FR-03** — O endpoint retorna:
  - `200` quando a consulta é bem sucedida;
  - `400` quando há parâmetros inválidos ou ausentes (ex.: `city` vazio);
  - `404` quando a cidade não é encontrada.
- **FR-04** — A resposta de sucesso contém, no mínimo: identificação da cidade resolvida (nome, região/estado quando existir, país e coordenadas); condições atuais (temperatura, sensação térmica, umidade, velocidade do vento, direção do vento, índice UV, precipitação e descrição da condição); previsão por hora para as próximas 24 horas (hora, temperatura, precipitação e condição); e previsão diária para os próximos 7 dias incluindo o dia atual (data, temperatura mínima, temperatura máxima, volume de chuva e condição).
- **FR-05** — O backend pode retornar os dados seguindo o formato da Open-Meteo, sem necessidade de remodelagem complexa do payload.
- **FR-06** — O backend suporta consulta por coordenadas (latitude/longitude) para atender ao fluxo de geolocalização do navegador, resolvendo também o **nome da cidade** via reverse geocoding com uma API pública gratuita (a escolha da API é decisão da TechSpec; a exigência é que seja gratuita, pública e sem chave obrigatória) e devolvendo o nome junto com os dados para exibição no painel.
- **FR-07** — Toda resposta do backend retorna o header `Cache-Control: no-store` e o uso de ETags é desabilitado (nenhum tipo de cache HTTP entre frontend e backend).
- **FR-08** — O backend possui configuração de CORS explícita definindo origens aceitas, métodos permitidos e headers autorizados. Em desenvolvimento pode aceitar qualquer origem, desde que isso esteja documentado.

### 2. Acesso inicial e estado vazio

- O que faz: o usuário cai direto no painel e vê um estado inicial que o convida a agir.
- Por que é importante: evita telas intermediárias e dá um primeiro contato útil e consistente com a identidade visual.
- Como funciona em alto nível: a rota principal renderiza o painel completo (busca + seções) já no carregamento; as seções de dados exibem um estado vazio composto com o mesmo design system do protótipo.

**Requisitos funcionais:**

- **FR-09** — Ao acessar a aplicação, o usuário já cai diretamente no painel principal pela rota `/`, sem telas intermediárias.
- **FR-10** — No primeiro acesso, o painel exibe um **estado vazio** (nenhuma cidade pré-carregada): as seções de dados exibem um convite claro para pesquisar uma cidade ou usar a localização, e a barra de busca é o elemento de destaque — tudo composto com os mesmos componentes, cores, tipografia e espaçamentos do design system do protótipo (o estado vazio não existe no HTML de referência e deve ser desenhado dentro dele).

### 3. Busca por cidade

- O que faz: permite buscar o clima de qualquer cidade pelo nome.
- Por que é importante: é o fluxo central do produto.
- Como funciona em alto nível: campo de texto → envio do nome ao backend → loading (skeleton) → painel carregado ou estado de erro.

**Requisitos funcionais:**

- **FR-11** — A busca é feita por um campo de texto simples, **sem autocomplete** nesta versão.
- **FR-12** — A busca é disparada pelo botão "Pesquisar" **e** pela tecla Enter no campo de texto.
- **FR-13** — Em sucesso, o painel exibe o nome (e a região, quando existir) da cidade pesquisada e todos os dados carregados (atual, por hora e 7 dias), com o indicador de atualização refletindo a nova consulta.
- **FR-14** — Quando a cidade não é encontrada (`404`), a aplicação exibe uma mensagem amigável orientando nova tentativa (ex.: verificar a grafia), mantendo o painel utilizável para uma nova busca.
- **FR-15** — Quando há falha de comunicação com o backend (rede indisponível, erro do servidor), o usuário recebe feedback claro e uma opção de **tentar novamente** (nova consulta com a mesma busca ou botão de retry).
- **FR-16** — Busca com parâmetros inválidos/vazios (`400`) exibe um feedback claro indicando que um nome de cidade válido precisa ser informado.

### 4. Geolocalização do navegador

- O que faz: consulta automaticamente o clima da localização atual do usuário.
- Por que é importante: remove a fricção de digitar a cidade quando o usuário está na cidade que quer consultar.
- Como funciona em alto nível: botão → Geolocation API do navegador → coordenadas enviadas ao backend → backend busca o clima e resolve o nome da cidade → painel carregado.

**Requisitos funcionais:**

- **FR-17** — Existe um botão dedicado para usar a geolocalização do navegador e consultar automaticamente o clima da localização atual do usuário.
- **FR-18** — Em sucesso, o painel exibe o **nome da cidade resolvida pelo backend** (via reverse geocoding, conforme FR-06) como localização da consulta, junto de todos os dados carregados.
- **FR-19** — Se o usuário negar a permissão, o navegador não suportar ou a localização não estiver disponível, a aplicação exibe uma mensagem amigável e continua utilizável (a busca por cidade permanece funcional).

### 5. Condições climáticas atuais

- O que faz: apresenta de forma imediata o clima atual da cidade consultada.
- Por que é importante: responde à pergunta principal do usuário ("como está agora?") em segundos, com destaque visual.
- Como funciona em alto nível: card principal com temperatura em grande porte, condição em texto, ícone animado, cidade, indicador de atualização, máxima/mínima/sensação do dia; uma fileira de cards de estatísticas complementares.

**Requisitos funcionais:**

- **FR-20** — O card de condições atuais exibe: temperatura atual (em destaque, grande), descrição da condição em texto, identificação da cidade/região consultada, indicador de "atualizado" com marcação de tempo, e os valores de máxima, mínima e sensação térmica do dia.
- **FR-21** — O card exibe um ícone animado que representa a condição climática atual, coerente com a condição recebida do backend (ex.: sol, nuvem, sol com nuvem, chuva, tempestade).
- **FR-22** — A seção de detalhes exibe quatro cards de estatística, cada um com ícone animado, rótulo, valor e barra de progresso proporcional ao valor: **sensação térmica**, **umidade (em %)**, **vento (velocidade em km/h + direção em pontos cardeais)** e **índice UV (valor + rótulo qualitativo, ex.: Baixo/Moderado/Alto/Very High)** — as faixas qualitativas do UV devem ser as convencionais da literatura meteorológica.

### 6. Previsão por hora (gráfico interativo)

- O que faz: mostra temperatura e precipitação hora a hora nas próximas 24 horas em um gráfico interativo.
- Por que é importante: permite planejar o dia com precisão ("a que hora chove?").
- Como funciona em alto nível: gráfico no mesmo card do protótipo, com linha de temperatura e barras de precipitação, marcador do horário atual e tooltip ao passar o mouse ou tocar.

**Requisitos funcionais:**

- **FR-23** — O card "Previsão por hora" exibe, para as próximas 24 horas, a **temperatura em linha** (no mesmo estilo visual do gráfico do protótipo) **e a precipitação em barras** na base do mesmo gráfico, com legenda identificando as duas séries (temperatura em °C e precipitação).
- **FR-24** — O gráfico destaca o horário atual (marcador "agora" com o estilo do protótipo), com o ponto/posição correspondente à hora corrente.
- **FR-25** — Ao passar o mouse (desktop) ou tocar/deslizar o dedo (mobile) sobre o gráfico, é exibido um tooltip com os detalhes da hora mais próxima: hora, temperatura e precipitação; ao afastar/soltar, o tooltip some.
- **FR-26** — O gráfico possui animação de entrada (traçado da linha, pontos surgindo em sequência) compatível com o estilo do protótipo, e essas animações devem ser desativadas quando o usuário tem `prefers-reduced-motion` ativo.

### 7. Previsão dos próximos 7 dias

- O que faz: mostra a previsão diária dos próximos 7 dias de forma comparativa.
- Por que é importante: planejamento de semana em uma única olhada.
- Como funciona em alto nível: fileira de sete cards (dias), cada um com dia, data, ícone da condição, mínima/máxima e chuva; em telas pequenas, rolagem horizontal com snap.

**Requisitos funcionais:**

- **FR-27** — O card "Próximos 7 dias" exibe sete dias (incluindo o dia atual), cada um com: nome do dia, data curta, ícone da condição predominante do dia, temperatura mínima e máxima, e volume de chuva do dia.
- **FR-28** — Cada card diário mostra visualmente a variação entre mínima e máxima por meio de um indicador gráfico simples (no mesmo padrão visual do protótipo), permitindo comparar os dias de relance.
- **FR-29** — O dia atual é visualmente distinguido dos demais; em telas estreitas, os sete dias ficam em rolagem horizontal com snap (sem cortar conteúdo), mantendo a aparência do protótipo.

### 8. Estados visuais, identidade dinâmica e responsividade

- O que faz: garante que o usuário saiba sempre o que está acontecendo (carregando, vazio, erro) e que a experiência seja agradável em qualquer tela.
- Por que é importante: feedback visual é parte central do projeto (o requisito o afirma explicitamente), e a identidade dinâmica reforça a leitura do clima.
- Como funciona em alto nível: skeleton loading durante buscas; estados de erro com retry; tingimento sutil do fundo conforme a condição; layout responsivo com os breakpoints do protótipo.

**Requisitos funcionais:**

- **FR-30** — Enquanto os dados estão carregando, o painel exibe **skeleton loading** nas seções de dados (atual, estatísticas, gráfico e 7 dias) com o mesmo formato dos componentes carregados, e feedback visual claro durante buscas (estado de busca perceptível no campo/botão).
- **FR-31** — A identidade visual muda dinamicamente conforme as condições climáticas por meio de um **tingimento sutil do fundo/gradientes**: céu limpo em tons azulados, nublado em tons acinzentados e chuva em tons mais escuros e frios. A mudança é um ajuste de matiz/atmosfera do fundo — **não altera componentes, tipografia, cores de texto ou espaçamentos** do design system.
- **FR-32** — A interface é responsiva e adaptada para mobile, tablet e web, seguindo os comportamentos de quebra do protótipo (colapsar a grade principal, estatísticas em 2 colunas, card semanal em rolagem horizontal, busca reorganizável e botão de localização compacto em telas pequenas), sem overflow horizontal.

### 9. Fidelidade visual e integridade de dados (critérios de aceite)

Estes requisitos são **critérios de aceite** desta feature e serão verificados no QA.

**Requisitos funcionais:**

- **FR-33 (ACEITE)** — A interface deve ficar **visualmente idêntica ao `painel.html`** no estado carregado: design system (cores, tipografia, espaçamentos), componentes, layout e o painel em si. A `TechSpec` e as `tasks` devem usar o `painel.html` como referência de construção. A implementação pode ser dividida em vários componentes, mas o resultado final deve ser igual ao protótipo.
- **FR-34 (ACEITE)** — Precedência: **comportamento, regras e dados seguem `exemplo_requisito.txt`; aparência segue `painel.html`**. Em caso de conflito entre as duas fontes, vale esta precedência.
- **FR-35 (ACEITE)** — Os valores exibidos no `painel.html` (temperaturas, umidade, vento, UV, datas, gráficos, cidade "Curitiba, PR") são **apenas exemplos**. Os dados reais exibidos pelo painel devem vir **sempre do backend** (via `GET /api/weather`); **nenhum valor de clima pode estar fixo no código** do frontend ou do backend (placeholders de layout, como "–" em estados vazios, são permitidos).
- **FR-36** — Toda chamada `fetch` do frontend deve usar explicitamente `cache: 'no-store'` (regra de ausência de cache do lado do cliente).
- **FR-37** — Estados que não existem no HTML de referência (vazio, skeleton, cidade não encontrada, falha de comunicação) devem ser compostos **exclusivamente com o design system do protótipo** — mesmos cards (glassmorphism), ícones, tipografia, cores, bordas, raios e espaçamentos — de modo que o painel carregado continue indistinguível do protótipo.
- **FR-38** — O conteúdo textual dinâmico (nome da cidade, descrição da condição, datas, horários, valores) deve ser real e localizado em pt-BR (datas e números formatados conforme o locale pt-BR); textos estáticos de rótulos seguem os do protótipo, exceto aqueles que descrevam dados simulados (o rodapé não pode afirmar que os dados são simulados, já que passam a ser reais, mantendo o mesmo estilo visual).

---

## Experiência do Usuário

### Personas e necessidades

- **Usuário geral (primária):** quer a resposta do clima em segundos, sem configuração, em qualquer dispositivo. Necessidades: velocidade, clareza visual, poucos toques, feedback honesto quando algo falha.
- **Desenvolvedor da base (secundária):** quer prever o comportamento da aplicação por meio dos contratos (endpoint, status codes, headers) e evoluir a partir de um código limpo e testado.

### Jornada principal

1. **Chegada:** o usuário abre `/` e vê o painel completo já montado — busca em destaque no topo, seções em estado vazio convidando à ação, fundo animado (céu, estrelas, nuvens) ativo desde o início.
2. **Ação:** digita o nome da cidade (ou toca em "Localização Atual") e busca.
3. **Espera:** skeleton loading substitui os dados; a busca fica perceptivelmente em andamento.
4. **Resultado:** o painel se popula com animações de entrada (seções reveladas, linha do gráfico traçada, barras preenchendo) e o fundo tingido de acordo com a condição.
5. **Exploração:** o usuário interage com o gráfico por hora (tooltip), rola os 7 dias e faz novas buscas sem sair da tela.
6. **Erros:** em qualquer falha, uma mensagem amigável aparece no lugar dos dados, com ação de retry — o usuário nunca fica preso.

### Interações principais

- Campo de busca: placeholder, ícone de busca, foco com destaque visual; Enter ou botão dispara.
- Botão de localização: ícone GPS; em telas muito pequenas o texto do botão some e fica só o ícone (comportamento do protótipo).
- Gráfico por hora: hover/touch → linha-guia vertical + ponto + tooltip (hora, temperatura, precipitação); "agora" sempre visível.
- Cards de estatística: barras que preenchem proporcionalmente ao valor.
- Cards de 7 dias: hover eleva o card; em mobile, rolagem com snap.
- Relógio no cabeçalho: hora e data locais atualizando em tempo real (formatação pt-BR).

### Considerações de UI/UX

- **Linguagem:** pt-BR em toda a interface (rótulos, mensagens de erro, formatação de datas/números via locale pt-BR).
- **Estados:** todo elemento que carrega tem estado de carregamento (skeleton); toda ação tem feedback (foco, hover, ativação); todo erro tem mensagem + ação.
- **Consistência:** os três blocos de dados (atual, horário, 7 dias) compartilham a mesma linguagem de card, tipografia e ritmo de animação do protótipo.
- **Atmosfera:** o fundo animado (gradiente do céu, estrelas, lua, nuvens à deriva) é parte da identidade e permanece ativo em todos os estados, incluindo vazio e erro.

### Requisitos de acessibilidade

- **Teclado:** toda a funcionalidade é utilizável por teclado — foco visível, busca por Enter, botões nativos focáveis.
- **Rótulos:** campo de busca com `aria-label`/rótulo associado; gráfico com rótulo descrevendo o conteúdo (ex.: "Gráfico de temperatura por hora"); seções de dados com rótulos de área (atual, por hora, 7 dias).
- **Contraste:** manter o contraste de texto do protótipo (texto claro sobre fundo escuro) também nos estados de erro e vazio.
- **Movimento:** todas as animações (fundo, ícones, gráfico, reveal, barras) devem ser desativadas ou simplificadas quando `prefers-reduced-motion: reduce` está ativo (comportamento já presente no protótipo, a ser mantido).
- **Conteúdo:** informações não podem ser transmitidas **apenas** por cor (ex.: condição do tempo também vem em texto/ícone).

---

## Restrições Técnicas de Alto Nível

> Apenas restrições e mandatos de alto nível. Soluções de design (estruturas de pastas, contratos detalhados, bibliotecas) pertencem à Tech Spec.

- **Integrações externas:** (1) Geocoding Open-Meteo — `https://geocoding-api.open-meteo.com/v1/search`; (2) Previsão Open-Meteo — `https://api.open-meteo.com/v1/forecast`; (3) uma API pública gratuita de reverse geocoding para resolver o nome da cidade a partir das coordenadas da geolocalização (escolha e detalhes na TechSpec; requisito: gratuita, pública, sem chave obrigatória).
- **Arquitetura inegociável:** o frontend **nunca** consome a API da Open-Meteo (ou qualquer serviço externo) diretamente. Toda comunicação externa passa pelo backend.
- **Ausência de cache (mandato):** nenhum tipo de cache HTTP entre frontend e backend — no backend, ETags desabilitadas e todas as respostas com `Cache-Control: no-store`; no frontend, todo `fetch` com `cache: 'no-store'` explícito.
- **CORS:** configuração explícita no backend (origens, métodos, headers); em desenvolvimento pode aceitar qualquer origem, documentado.
- **Comunicação frontend↔backend (estratégia fixada):** em **desenvolvimento**, proxy do dev server (Vite proxy); em **produção**, o frontend chama a **URL absoluta** do backend com CORS habilitado. A estratégia deve estar documentada e ser consistente em todo o projeto.
- **Portas (documentadas):** desenvolvimento — frontend `5173`, backend `3000`; produção — backend `3000` (`npm start`), frontend `4173` (`npm run preview`).
- **Estrutura do projeto:** dois diretórios independentes — `/frontend` (aplicação React) e `/backend` (servidor Node.js) — sem workspace npm na raiz; cada pacote com `package.json` próprio.
- **Tecnologias fixadas:** React 19 + Vite no frontend; Node.js (≥ 18) + Express no backend; stacks de testes já configuradas (Vitest + React Testing Library no frontend, Jest + Supertest no backend) — toda entrega deve incluir testes.
- **Dados:** a fonte de dados é a Open-Meteo (formato passável sem remodelagem complexa); unidades exibidas em °C e km/h; idioma pt-BR.
- **Dados pessoais:** a geolocalização é obtida do navegador e usada apenas para a consulta do clima; nenhum dado pessoal deve ser persistido pela aplicação.

---

## Fora de Escopo

> O que esta feature **não** inclui, para gerenciar o escopo.

**Excluídos explicitamente pelo requisito:**

- Tema claro/escuro (o painel usa a baseline noturna do protótipo com o tingimento sutil por condição — um sistema de temas não é parte desta versão).
- Autocomplete de cidades.
- Comentários no código.
- Remodelagem avançada do payload da Open-Meteo.
- Qualquer chamada direta da API externa pelo frontend (proibida por arquitetura).

**Fora de escopo nesta versão (além das exclusões acima):**

- Contas de usuário, autenticação e qualquer persistência de preferências do usuário (histórico de buscas, cidades favoritas).
- Múltiplas cidades simultâneas, comparação entre cidades e alertas/notificações de clima.
- Unidades alternativas (Fahrenheit, mph, mm vs. polegadas).
- PWA, funcionamento offline e instalação no dispositivo.
- Horários alternativos, zonas de fuso exibidas e conversões de unidade no gráfico.
- Integração com serviços externos além dos três listados (geocoding, previsão, reverse geocoding).
- Deploy em plataforma específica, balanceamento de carga e infraestrutura de produção (a "produção" aqui é o modo `npm start`/`npm run preview` local, com as portas documentadas).
- Otimizações de performance avançadas (code splitting agressivo, bundle analysis) — a performance é garantida pelo design (skeleton, estado vazio) e verificada qualitativamente no QA.

*(Riscos de implementação técnica — como limites de taxa das APIs externas e políticas de uso do serviço de reverse geocoding — serão detalhados na Tech Spec.)*
