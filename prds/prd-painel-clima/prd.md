# Painel do Clima — Product Requirements Document (PRD)

## Visão Geral

O Painel do Clima é uma aplicação web full stack para consultar as condições meteorológicas de qualquer cidade, com frontend em React e backend em Node.js. O usuário informa uma cidade ou usa a geolocalização do navegador e recebe, em um único painel, as condições atuais, a previsão por hora e a previsão dos próximos sete dias.

Resolve a necessidade de obter informação climática de forma simples e rápida, em uma interface agradável e adaptada a mobile, tablet e web. É destinado ao público geral e serve de base limpa para evoluções futuras.

A experiência visual é parte central do produto. **O arquivo `painel.html`, na raiz do repositório, é a referência obrigatória de design system, componentes, layout e do próprio painel: o resultado deve ser visualmente idêntico a ele**, conforme os critérios da funcionalidade F9.

## Objetivos

- Entregar um painel funcional na rota `/`, sem telas intermediárias, com dados reais da Open-Meteo obtidos exclusivamente via backend.
- Atingir fidelidade visual a `painel.html` nos três breakpoints de verificação (1280, 768 e 375 px), sem nenhuma divergência fora da lista fechada de desvios autorizados (F9).
- Cobrir 100% dos dados exigidos: temperatura, umidade, vento, índice UV e precipitação atuais; temperatura e precipitação por hora; mínima, máxima e volume de chuva por dia.
- Garantir feedback visual em todos os estados: vazio, carregando, sucesso, cidade não encontrada, falha de comunicação e geolocalização indisponível.
- Garantir ausência total de cache HTTP entre frontend e backend, verificável nos headers de todas as respostas e em todas as chamadas `fetch`.
- Entregar um scaffold limpo, com `/frontend` e `/backend` independentes, e estratégia de comunicação e portas documentadas.

## Histórias de Usuário

**Persona primária — pessoa que consulta o clima no dia a dia**, em qualquer dispositivo, buscando resposta rápida.

- Como usuário, eu quero digitar o nome de uma cidade para ver o clima atual dela.
- Como usuário, eu quero usar minha localização com um botão para consultar o clima sem digitar.
- Como usuário, eu quero ver a evolução de temperatura e precipitação ao longo do dia para planejar minhas atividades.
- Como usuário, eu quero comparar os próximos sete dias para escolher o melhor dia para um compromisso ao ar livre.
- Como usuário, eu quero que o painel reflita visualmente o clima da cidade para entender a condição em um relance.

**Persona secundária — pessoa desenvolvedora que evolui o scaffold.**

- Como desenvolvedor, eu quero frontend e backend separados, com comunicação e portas documentadas, para evoluir o projeto com segurança.

**Casos extremos**

- Como usuário, ao buscar uma cidade inexistente, eu quero uma mensagem amigável orientando nova tentativa.
- Como usuário, diante de uma falha de comunicação, eu quero feedback claro e uma opção de tentar novamente.
- Como usuário, ao negar a permissão de localização, eu quero saber o que aconteceu e poder buscar por nome.

## Funcionalidades Principais

### F1. Consulta climática via backend

Centraliza no backend toda comunicação externa, de modo que o frontend apenas renderize os dados. É a regra arquitetural central do produto.

1. **RF-01** O frontend nunca deve chamar a API da Open-Meteo diretamente; toda comunicação externa passa pelo backend.
2. **RF-02** O backend deve expor `GET /api/weather?city=`, que resolve a cidade na API de geocoding e consulta a API de previsão com as coordenadas obtidas.
3. **RF-03** O mesmo endpoint deve aceitar consulta por coordenadas (`lat` e `lon`), usada pelo fluxo de geolocalização, dispensando o geocoding.
4. **RF-04** A resposta deve preservar o formato da Open-Meteo, sem remodelagem complexa, acrescida dos dados da localização resolvida (nome e região), necessários para exibir o local.
5. **RF-05** O endpoint deve retornar 200 em caso de sucesso, 400 para parâmetros inválidos ou ausentes, 404 para cidade não encontrada e 502 para falha nos serviços externos.
6. **RF-06** A consulta deve obter os dados no fuso horário da localização consultada.
7. **RF-07** Em cidades homônimas, deve ser usado o primeiro resultado retornado pelo geocoding.

### F2. Entrada no painel e estado vazio

O usuário chega diretamente ao painel, que aguarda a primeira consulta.

8. **RF-08** A rota `/` deve abrir diretamente o painel, sem telas intermediárias.
9. **RF-09** Antes da primeira consulta, nenhum dado climático deve ser exibido e nenhuma consulta deve ser disparada automaticamente.
10. **RF-10** O estado vazio deve mostrar cabeçalho, barra de busca, fundo de referência e rodapé idênticos a `painel.html`, além de um card orientando o usuário a pesquisar uma cidade ou usar a localização atual. Esse card deve seguir o estilo `.card`.

### F3. Busca e geolocalização

Oferece as duas formas de iniciar uma consulta.

11. **RF-11** A busca deve usar um campo de texto simples, sem autocomplete, com o placeholder "Pesquisar cidade ou região…".
12. **RF-12** A busca deve ser disparada pelo botão "Pesquisar" ou pela tecla Enter.
13. **RF-13** Busca com texto vazio ou só com espaços não deve chamar o backend e deve exibir orientação ao usuário.
14. **RF-14** O botão "Localização Atual" deve usar a geolocalização do navegador e consultar o clima das coordenadas obtidas, exibindo "Sua localização" como nome do local.
15. **RF-15** Durante uma consulta, os botões devem indicar visualmente o processamento e consultas repetidas devem ser impedidas; caso consultas se sobreponham, somente a mais recente pode atualizar a tela.

### F4. Condições atuais

Apresenta o estado do tempo agora, como foco principal do painel.

16. **RF-16** O card principal deve exibir local, indicador de atualização, ícone animado da condição, temperatura atual e descrição da condição em português.
17. **RF-17** O card deve exibir máxima e mínima do dia, sensação térmica e precipitação atual em chips. A precipitação usa o padrão `.chip`, preservando a grade de quatro colunas de estatísticas.
18. **RF-18** Os cards de estatística devem exibir sensação térmica, umidade (%), vento (km/h e direção cardeal abreviada em português) e índice UV (valor e classificação: Baixo, Moderado, Alto, Muito alto, Extremo).
19. **RF-19** As barras das estatísticas devem refletir os valores reais, em escala definida.
20. **RF-20** O índice UV deve ser apresentado como barra com gradiente de verde a vermelho, mantendo as dimensões de `.bar`.
21. **RF-21** O relógio do cabeçalho deve exibir hora e data locais do usuário em pt-BR, atualizando a cada segundo.

### F5. Previsão por hora

Mostra a evolução do dia em um gráfico interativo.

22. **RF-22** O gráfico deve exibir as 24 horas do dia atual da localização consultada, com temperatura e precipitação.
23. **RF-23** A série de temperatura deve manter a aparência de `painel.html`: linha suave em gradiente, área, pontos, grade e eixos. A precipitação deve ser adicionada na mesma área do gráfico, sem remover ou deslocar esses elementos, e identificada por uma legenda em `.chip`.
24. **RF-24** O marcador "agora" deve indicar a hora atual no fuso da localização consultada, não no do usuário.
25. **RF-25** Ao passar o mouse ou tocar no gráfico, devem aparecer guia, ponto de destaque e tooltip com hora, temperatura e precipitação.
26. **RF-26** A interação do gráfico deve funcionar também com `prefers-reduced-motion`. Em `painel.html` ela é desativada nesse modo; esse comportamento não deve ser reproduzido.
27. **RF-27** O gráfico deve renderizar corretamente com temperaturas negativas, com temperatura constante ao longo do dia e com precipitação zero.

### F6. Previsão de sete dias

Permite comparar os próximos dias de relance.

28. **RF-28** Devem ser exibidos sete cards `.day`, começando em "Hoje" (destacado), com dia da semana e data no formato de `painel.html`, no fuso da localização consultada.
29. **RF-29** Cada card deve exibir ícone da condição, máxima, mínima, probabilidade e volume de chuva (mm).
30. **RF-30** Cada card deve conter um indicador gráfico simples da faixa entre mínima e máxima, em escala comum aos sete dias, permitindo a comparação entre eles.

### F7. Identidade visual dinâmica

O painel reflete a condição do tempo sem alterar sua estrutura.

31. **RF-31** Layout, componentes, tipografia e espaçamentos devem permanecer iguais em todas as condições; apenas o fundo e seus elementos decorativos variam.
32. **RF-32** Devem existir três variantes, derivadas do fundo de `painel.html`:
    - **Referência (tons azulados):** céu limpo, parcialmente nublado e estado vazio. Deve ser exatamente o fundo de `painel.html`, incluindo estrelas, lua, nuvens e estrelas cadentes.
    - **Nublado (tons acinzentados):** encoberto e neblina.
    - **Chuva (tons mais escuros e frios):** garoa, chuva, neve e tempestade.
33. **RF-33** A transição entre variantes deve ser suave e a legibilidade do conteúdo não pode ser inferior à obtida na variante de referência.
34. **RF-34** Ícones animados devem existir para cada grupo de condição, derivados dos símbolos e animações de `painel.html`, cobrindo todos os códigos meteorológicos da Open-Meteo.

### F8. Estados de carregamento e erro

Mantém o usuário informado durante toda a interação.

35. **RF-35** Durante o carregamento, deve ser exibido skeleton com a mesma estrutura e dimensões do painel, evitando saltos de layout.
36. **RF-36** Em cidade não encontrada, deve ser exibida mensagem amigável orientando nova tentativa.
37. **RF-37** Em falha de comunicação, deve ser exibido feedback claro com opção de tentar novamente, que repete a última consulta.
38. **RF-38** Em geolocalização negada ou indisponível, deve ser exibida mensagem explicativa orientando a busca por nome.
39. **RF-39** Quando houver dados na tela, um erro não deve apagá-los: a mensagem é exibida e o painel mantém a última consulta bem-sucedida.
40. **RF-40** Skeleton, mensagens e demais adições devem usar exclusivamente os tokens e padrões de `painel.html`.

### F9. Fidelidade visual a `painel.html` (requisito obrigatório)

`painel.html` é a fonte de verdade visual do produto. Este requisito é obrigatório e bloqueia a aceitação da entrega.

41. **RF-41** O resultado deve ser visualmente idêntico a `painel.html`, usando-o como design system (cores, tipografia, espaçamentos), biblioteca de componentes, layout e referência do painel em si.
42. **RF-42** Design system a preservar, sem valores novos para os mesmos papéis:
    - **Cores:** `--text`, `--muted`, `--faint`, `--cyan`, `--violet`, `--amber`, `--border`, além do fundo `#070b1d` e seus gradientes.
    - **Tipografia:** família Inter e a escala de tamanhos, pesos e `letter-spacing` definida por componente. Atenção a `.temp`: declara peso 200, mas o arquivo carrega apenas os pesos 300 a 700; o resultado renderizado deve ser igual ao do arquivo.
    - **Espaçamentos e formas:** `--radius` de 24px, largura máxima de 1180px, gaps de 22px, 18px e 14px, paddings com `clamp()`, sombras e `backdrop-filter`.
43. **RF-43** Componentes a reproduzir: cabeçalho (marca e relógio), barra de busca, botões `.btn-primary` e `.btn-ghost`, `.card`, `.chip`, cards `.stat`, barras, gráfico com tooltip, cards `.day` e rodapé. Os estados de hover e foco devem ser iguais aos do arquivo.
44. **RF-44** Layout e responsividade devem seguir os breakpoints de 920, 640 e 480 px do arquivo, incluindo a rolagem horizontal da semana abaixo de 920px e a ocultação do texto do botão de localização até 480px.
45. **RF-45** Animações a reproduzir: `skyShift`, `twinkle`, `moonGlow`, `drift`, `shoot`, `ping`, `spin`, `floaty`, `bob`, revelação escalonada dos blocos, contagem da temperatura, desenho da linha do gráfico e preenchimento das barras. Todas devem respeitar `prefers-reduced-motion`.
46. **RF-46** Textos fixos devem ser iguais aos do arquivo, exceto quando listados nos desvios autorizados.

**Desvios autorizados (lista fechada)**

Qualquer diferença em relação a `painel.html` fora desta lista é um defeito:

- Valores dinâmicos: dados climáticos, nome do local, data, hora e rótulos dos dias.
- Posições aleatórias de estrelas e a posição do marcador "agora".
- Chip de precipitação atual (RF-17) e legenda e série de precipitação no gráfico (RF-23).
- Precipitação no tooltip (RF-25).
- Barra de gradiente do UV (RF-20).
- Volume de chuva e indicador de mínima/máxima nos cards `.day` (RF-29, RF-30).
- Variantes de fundo (RF-32) e ícones por condição (RF-34).
- Estado vazio, skeleton, mensagens e indicação de processamento (RF-10, RF-15, RF-35 a RF-38).
- Texto do rodapé, em que "dados simulados para demonstração · feito com HTML, CSS e JS puros" dá lugar à atribuição dos dados à Open-Meteo.

**Critérios de aceite**

- **CA-01 — Comparação lado a lado:** capturas da aplicação e de `painel.html` em 1280, 768 e 375 px de largura, com os dados de `painel.html` servidos à aplicação e a variante de referência ativa, não apresentam diferença visual fora dos desvios autorizados.
- **CA-02 — Valores computados:** nos mesmos breakpoints, os valores CSS computados de cores, fontes, tamanhos, pesos, espaçamentos, raios, bordas e sombras dos componentes do RF-43 são iguais aos de `painel.html`.
- **CA-03 — Interação:** hover, foco, tooltip do gráfico e animações se comportam como em `painel.html`, salvo o RF-26.
- **CA-04 — Adições coerentes:** todo elemento adicionado usa somente tokens e padrões de `painel.html`, sem novas fontes nem raios, e sem novas cores além das exigidas pelo gradiente do UV e pelas variantes de fundo.
- **CA-05 — Estados:** estado vazio, skeleton e mensagens de erro foram verificados nos três breakpoints, sem rolagem horizontal da página.

## Experiência do Usuário

**Fluxo principal:** o usuário acessa `/`, vê o painel em estado vazio, pesquisa uma cidade ou usa a localização, acompanha o skeleton e o feedback da busca e, ao final, vê os dados com a revelação animada dos blocos e o fundo correspondente à condição.

**Fluxo de consulta adicional:** uma nova busca substitui os dados exibidos, com o mesmo feedback de carregamento.

**Fluxo de erro:** a mensagem aparece sem perda dos dados anteriores e, em falha de comunicação, o usuário pode tentar novamente.

**Responsividade:** o painel deve funcionar em mobile, tablet e web, seguindo os breakpoints de RF-44.

**Acessibilidade**

- Manter a semântica de `painel.html`: `lang="pt-BR"`, `role="search"`, `aria-label` nas seções e no gráfico e `aria-hidden` nos elementos decorativos.
- Anunciar carregamento e mensagens de erro a tecnologias assistivas.
- Permitir busca, geolocalização e nova tentativa somente pelo teclado, com foco visível.
- Respeitar `prefers-reduced-motion`.
- Os tokens de `painel.html` prevalecem por exigência de fidelidade visual. O texto em `--faint` tem contraste estimado abaixo de 4.5:1 sobre o fundo, o que é uma exceção conhecida e aceita ao WCAG AA nesta versão.

## Restrições Técnicas de Alto Nível

- **Stack e estrutura:** React no frontend e Node.js no backend, em diretórios independentes `/frontend` e `/backend`.
- **Integrações externas, acessadas somente pelo backend:**
  - Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
  - Clima: `https://api.open-meteo.com/v1/forecast`
- **Sem cache HTTP entre frontend e backend:** ETags desabilitadas e `Cache-Control: no-store` em todas as respostas do backend; toda chamada `fetch` do frontend usa `cache: 'no-store'`.
- **CORS explícito:** origens, métodos e headers definidos no backend. Aceitar qualquer origem durante o desenvolvimento é permitido, desde que documentado.
- **Comunicação:** a estratégia entre frontend e backend (proxy do dev server ou URL absoluta com CORS) deve ser definida, documentada e consistente em todo o projeto.
- **Portas:** as portas de frontend e backend devem estar documentadas para desenvolvimento e produção.
- **Privacidade:** coordenadas do usuário são usadas somente na consulta solicitada, sem persistência.
- **Atribuição:** os dados da Open-Meteo devem ser creditados na interface, conforme sua licença.
- **Validação da entrega:** primeiro as APIs da Open-Meteo são testadas diretamente via curl, para conferir estrutura e retorno; depois é testado o endpoint interno do backend, para garantir o repasse correto ao frontend.

## Fora de Escopo

- Tema claro/escuro.
- Alternância de fundo por dia/noite; as variantes dependem apenas da condição do tempo.
- Autocomplete de cidades ou seleção entre cidades homônimas.
- Comentários no código.
- Remodelagem avançada do payload da Open-Meteo.
- Qualquer chamada direta à API externa pelo frontend.
- Carregamento automático de uma cidade padrão ou da geolocalização ao abrir a aplicação.
- Atualização automática dos dados, histórico ou persistência da última cidade, favoritos e múltiplas cidades.
- Troca de unidades de medida e outros idiomas além do pt-BR.
