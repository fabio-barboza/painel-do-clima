# Relatório de QA - Painel do Clima

## Resumo
- Data: 2026-11-02
- Status: REPROVADO
- Total de Requisitos: 46
- Requisitos Atendidos (PASSOU): 44
- Requisitos Não Atendidos (FALHOU): 2 (RF-35, RF-40)
- Requisitos Verificados Só no Código: 0
- Requisitos Não Testados: 0
- Bugs Encontrados: 4 (1 Média, 3 Baixa)

O status vem de um único bug Média, BUG-04, ligado ao critério bloqueante CA-04. Os fluxos principais, as APIs e a fidelidade visual funcionam. Os 16 itens de `tasks.md` estão concluídos e as 5 correções do `review-1` estão como `resolvido`.

## Método e limites
- Comparação CA-01/CA-02: `painel.html` e a aplicação abertos em páginas separadas, com relógio fixado em 2026-08-16 14:00, fontes carregadas e foco e hover neutralizados. A fixture de testes foi servida à aplicação com dois ajustes para igualar a referência: `apparent_temperature = 27` e `region = 'PR'`.
- Capturas foram avaliadas visualmente e por valores computados, não por diff de pixels. Estrelas e animações impedem igualdade exata.
- Estados de erro, atraso, nulos e variantes usaram resposta interceptada no navegador. Busca, 404 e fusos usaram a Open-Meteo real.
- O 502 real foi obtido em uma instância separada do backend, com `fetch` simulado em falha por um arquivo temporário, sem alteração de código.
- Geolocalização negada e indisponível foram simuladas com stub da API do navegador. A concedida usou a permissão e a posição emuladas do Playwright.
- O toque foi testado com `TouchEvent` sintético em 375 px, sem aparelho real e não combinado com `prefers-reduced-motion`.
- Navegador usado: somente Chromium, via Playwright MCP.

## Requisitos Verificados
| ID | Requisito | Status | Evidência |
|----|-----------|--------|-----------|
| RF-01 | Frontend nunca chama a Open-Meteo | PASSOU | 0 requisições a `open-meteo` no navegador em dev e na build de produção; 0 URLs da API no bundle |
| RF-02 | `GET /api/weather?city=` | PASSOU | mcp-api-test: 200 com `current`, `hourly`, `daily`, `location`, `timezone` |
| RF-03 | Consulta por `lat` e `lon` | PASSOU | mcp-api-test: 200; fluxo de geolocalização |
| RF-04 | Formato preservado com `location` | PASSOU | Corpo igual à estrutura da Open-Meteo consultada por curl, com `location` acrescido |
| RF-05 | 200, 400, 404, 502 | PASSOU | 400 em 8 casos (ausente, `lat` só, fora da faixa, não decimal, espaços, repetido, `city` com coordenadas, 101 caracteres); 404 para `zzzxqwv` e `a`; 502 por cidade e por coordenadas |
| RF-06 | Fuso da localização | PASSOU | Tóquio `Asia/Tokyo`, Honolulu `Pacific/Honolulu`, Auckland `Pacific/Auckland` |
| RF-07 | Primeiro resultado em homônimos | PASSOU | Springfield, Santa Cruz e San Jose iguais ao primeiro resultado do geocoding |
| RF-08 | `/` abre o painel | PASSOU | `screenshots/visual-vazio-1280.png` |
| RF-09 | Sem dados nem consulta automática | PASSOU | 0 chamadas após carregar nos 3 breakpoints |
| RF-10 | Estado vazio em `.card` | PASSOU | `screenshots/visual-vazio-{1280,768,375}.png` |
| RF-11 | Campo sem autocomplete, placeholder | PASSOU | Texto igual ao de `painel.html` |
| RF-12 | Botão e Enter | PASSOU | Os dois fluxos exercitados com backend real |
| RF-13 | Busca vazia | PASSOU | Vazio e só espaços: 0 chamadas e orientação; `screenshots/estado-busca-vazia-*.png` |
| RF-14 | Localização Atual | PASSOU | Consulta `lat=-23.55&lon=-46.63`, rótulo "Sua localização"; `screenshots/req-14-geolocalizacao-concedida.png` |
| RF-15 | Processamento e concorrência | PASSOU | `is-busy` e `aria-disabled`, repetição não gera chamada; geolocalização tardia não sobrescreve a busca; `screenshots/estado-skeleton-*.png` |
| RF-16 | Card principal | PASSOU | `screenshots/req-busca-real-curitiba.png` |
| RF-17 | Chips, inclusive precipitação | PASSOU | `Máx`, `Mín`, `Sensação`, `Precipitação 0,1 mm` |
| RF-18 | Cards de estatística | PASSOU | `25 °C`, `74 %`, `12 km/h · ONO`, `5 · Moderado` |
| RF-19 | Barras em escala | PASSOU | Dados reais e limites: 0% e 100% com valores fora da escala |
| RF-20 | Barra do UV em gradiente | PASSOU | Gradiente verde a vermelho nas dimensões de `.bar`; `screenshots/ca01-app-1280.png` |
| RF-21 | Relógio | PASSOU | Avançou com relógio real: `15:06:13` para `15:06:15` |
| RF-22 | 24 horas do dia | PASSOU | 24 pontos partindo de `00:00` do dia local |
| RF-23 | Temperatura e precipitação | PASSOU | Aparência igual à referência; barras e legenda `.chip`; `screenshots/req-27-grafico-precip-alta.png` |
| RF-24 | "agora" no fuso consultado | PASSOU | Posição igual à esperada em Tóquio (3h), Honolulu (8h) e Auckland (7h) |
| RF-25 | Guia, ponto e tooltip | PASSOU | Mouse nos 3 breakpoints e toque sintético; dentro de `#chartWrap` nas bordas; `screenshots/req-25-tooltip-{1280,375}.png` |
| RF-26 | Interação com movimento reduzido | PASSOU | Mesmo resultado do modo normal com `reducedMotion: reduce` (mouse) |
| RF-27 | Negativas, constante, zero | PASSOU | Sem `NaN`; `screenshots/req-27-grafico-*.png` |
| RF-28 | Sete dias | PASSOU | `Hoje 2 nov` a `Dom 8 nov`; `Hoje 3 nov` em Tóquio |
| RF-29 | Conteúdo dos cards `.day` | PASSOU | `80% · 9,5 mm` e demais |
| RF-30 | Faixa em escala comum | PASSOU | `--l` e `--w` conferidos na fixture (ex.: Hoje 12% e 82%) |
| RF-31 | Estrutura igual em todas as condições | PASSOU | Geometria idêntica nos 9 códigos testados |
| RF-32 | Três variantes | PASSOU | `screenshots/req-32-variante-*.png`; decoração conforme a TechSpec |
| RF-33 | Transição e legibilidade | PASSOU | Crossfade de 0 a 1 em 1,2 s; luminância das paradas de `cloudy` e `rain` abaixo da referência |
| RF-34 | Ícones por grupo | PASSOU | 29 códigos mapeados no módulo em execução; sol, nuvem, neblina, chuva, neve e trovoada renderizados; `screenshots/req-34-icone-sol.png` |
| RF-35 | Skeleton com as mesmas dimensões | FALHOU | BUG-02: salto de 26px em 375, 400 e 430 px |
| RF-36 | Cidade não encontrada | PASSOU | `screenshots/req-36-39-cidade-nao-encontrada-com-dados.png` |
| RF-37 | Falha com nova tentativa | PASSOU | Repete a última consulta: `Londrina`, não `Curitiba`; `screenshots/estado-falha-502-*.png` |
| RF-38 | Geolocalização negada ou indisponível | PASSOU | Nos dois casos; `screenshots/estado-geolocalizacao-negada-*.png` |
| RF-39 | Erro preserva dados | PASSOU | 404 e falha de rede mantêm 7 dias e o local; `screenshots/req-37-39-falha-rede-com-dados.png` |
| RF-40 | Somente tokens e padrões | FALHOU | BUG-04: `rx=2` em `rect.precip-bar` |
| RF-41 | Visualmente idêntico | PASSOU | CA-01; `screenshots/ca01-{painel,app}-{1280,768,375}.png` |
| RF-42 | Design system | PASSOU | CA-02; `index.css` idêntico às linhas 12 a 389 de `painel.html` |
| RF-43 | Componentes, hover e foco | PASSOU | CA-02 e CA-03 |
| RF-44 | Breakpoints | PASSOU | Colunas, rolagem da semana e texto do botão conferidos em 921, 919, 641, 639, 481, 479 e 320 px, sem rolagem da página |
| RF-45 | Animações | PASSOU | `animationName`, duração e atraso iguais à referência; contagem, barras e linha observadas; desativadas com movimento reduzido |
| RF-46 | Textos fixos | PASSOU | Diferenças só em chips, `.d-rain` e rodapé, todas autorizadas |

## Critérios de Aceite
| Critério | Resultado | Observações |
|----------|-----------|-------------|
| CA-01 | PASSOU | Sem diferença fora dos desvios autorizados. Alturas mudam só pelas adições: chip de precipitação, legenda, faixa e volume nos `.day` |
| CA-02 | PASSOU | 34 propriedades em 58 seletores nos 3 breakpoints. Únicas diferenças: gradiente do UV (autorizado), fase da animação da lua e `transition` de `.moon` e `#stars` exigida pelas variantes |
| CA-03 | PASSOU | Hover de `.btn-primary`, `.btn-ghost`, `.card`, `.stat` e `.day`, foco da busca e estilo do tooltip iguais; tooltip some em opacidade sem mudar de posição |
| CA-04 | FALHOU | Cores novas restritas a `#ef4444` (UV) e às variantes; sem fontes novas; `border-radius` só 5px. Falha pelo `rx=2`, BUG-04 |
| CA-05 | PASSOU | Vazio, skeleton e erros nos 3 breakpoints sem rolagem horizontal |

## Testes E2E Executados
| Fluxo | Resultado | Observações |
|-------|-----------|-------------|
| Open-Meteo direta (geocoding e previsão) por curl | PASSOU | Estrutura confere com a TechSpec; sem resultado responde 200 sem `results` |
| Endpoint interno via mcp-api-test | PASSOU | `Cache-Control: no-store`, sem `ETag`, inclusive em erros, 404 de rota e preflight |
| CORS | PASSOU | Dev com `*`; produção libera `http://localhost:4173`, não libera outra origem, e sem `CORS_ORIGINS` não libera nenhuma |
| Sem cache no cliente | PASSOU | Requisição real com `cache-control: no-cache`, efeito de `cache: 'no-store'` no fetch |
| Busca real com Enter e botão | PASSOU | Curitiba, São Paulo, Goiânia, `Curitiba, PR`, espaços nas pontas |
| Busca vazia, cidade inexistente, falha 502 e de rede | PASSOU | Com e sem dados na tela |
| Nova tentativa | PASSOU | Mouse e teclado |
| Timeout de 20 s no cliente | PASSOU | Observado com resposta retida: consulta abortada e tela liberada |
| Geolocalização concedida, negada, indisponível, tardia | PASSOU | |
| Variantes e transição | PASSOU | Códigos 0, 2, 3, 45, 51, 63, 73, 95 e desconhecido |
| Fusos remotos | PASSOU | Corretos mesmo com relógio do navegador em outra data |
| Valores nulos | FALHOU | Cards e chips corretos com `–`; gráfico incorreto, BUG-01 |
| Build de produção na porta 4173 | PASSOU | Busca real concluída; build gerada em pasta temporária |
| Suítes automatizadas | PASSOU | Frontend 366/366; backend 91/91; ESLint sem problemas |

Console: sem erros de aplicação. Só apareceram os registros do navegador para os 404 e 502 provocados.

## Acessibilidade
- [x] Elementos interativos acessíveis por teclado; ordem: busca, Pesquisar, Localização, link do rodapé
- [x] Enter aciona busca e nova tentativa; sem armadilha de foco
- [x] Busca, geolocalização e nova tentativa possíveis só pelo teclado
- [ ] Foco preservado após nova tentativa (BUG-03)
- [x] Indicador de foco igual ao de `painel.html`; `.search` com realce em `:focus-within`
- [x] `lang="pt-BR"`, `role="search"`, `aria-label` de seções e gráfico e `aria-hidden` iguais à referência
- [x] Hierarquia `h1`, `h2`, `h2`, igual à referência
- [x] `aria-busy` e `role="status"` no carregamento; `role="alert"` nos erros
- [x] `prefers-reduced-motion` respeitado
- [ ] Contraste dos tokens não medido nesta rodada; os valores computados são iguais aos de `painel.html`, e `--faint` abaixo de 4.5:1 é exceção aceita pelo PRD
- [x] Sem persistência no navegador: `localStorage`, `sessionStorage` e cookies vazios

## Bugs Encontrados
| ID | Descrição | Severidade | Screenshot |
|----|-----------|------------|------------|
| BUG-04 | Barras de precipitação usam `rx=2`, raio inexistente em `painel.html` (CA-04, RF-40) | Média | [req-27-grafico-precip-alta.png](screenshots/req-27-grafico-precip-alta.png) |
| BUG-01 | `null` em temperatura horária é plotado como 0° e distorce a escala | Baixa | [bug-01-null-horario-grafico.png](screenshots/bug-01-null-horario-grafico.png) |
| BUG-02 | Skeleton das estatísticas 26px mais alto em telas estreitas (RF-35) | Baixa | [bug-02-skeleton-stats-375.png](screenshots/bug-02-skeleton-stats-375.png) |
| BUG-03 | Foco vai para `body` após "Tentar novamente" | Baixa | [a11y-foco-retry.png](screenshots/a11y-foco-retry.png) |

## Pendências da Rodada Anterior
Nenhuma pendência da rodada anterior.

## Ferramentas MCP Utilizadas
- `playwright` (ui-testing): fluxos, capturas, valores computados, teclado, emulação de mídia e interceptação de rede.
- `mcp-api-test` (api-testing): status, headers e corpo do endpoint interno.
- `context7` (documentation): não necessário.
- Capacidades ausentes: nenhuma necessária (`messaging` e `data-store` não se aplicam).
- `claude_ai_Claude_Docs`: capacidade não reconhecida, não usado.

## Skills do Projeto
Skills do projeto: nenhuma lida. `webapp-testing` era aplicável e não foi consultada; a validação usou diretamente o Playwright MCP.
MCPs do projeto: usados: playwright (ui-testing), mcp-api-test (api-testing)

## Conclusão
Entrega REPROVADA por um motivo de conformidade, não funcional: o BUG-04 descumpre o CA-04, e o PRD define a F9 como bloqueante. Há dois caminhos: remover `rx` das barras ou registrar a exceção no PRD. Como a TechSpec prescreve `rx=2`, esse ponto precisa de decisão de quem responde pelo produto.

Os bugs Baixa não bloqueiam a aprovação com ressalvas, mas o BUG-02 mantém o RF-35 como não atendido. Depois da decisão sobre o BUG-04, recomenda-se nova rodada de QA.
