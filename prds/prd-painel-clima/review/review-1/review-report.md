# Relatório de Code Review - Painel do Clima

## Resumo
- Data: 2026-11-02
- Branch: main (sem commits próprios; alterações ainda não commitadas no working tree)
- Status: APROVADO COM RESSALVAS
- Arquivos Modificados: 97 em `backend/`, `frontend/`, `README.md` e `.gitignore` (13 modificados, 84 novos)
- Linhas Adicionadas: cerca de 8.008 (794 em arquivos modificados, 7.214 em arquivos novos de texto)
- Linhas Removidas: 35

Escopo: as 16 tasks de `tasks/tasks.md`. Como nada foi commitado, a análise usou `git status`, `git diff` e a leitura integral dos arquivos novos. `.agents/`, `.claude/`, `.playwright-mcp/` e `skills-lock.json` são ferramental e não foram revisados.

## Conformidade com Rules
| Rule | Status | Observações |
|------|--------|-------------|
| Convenção de nomes | OK | Componentes em PascalCase, testes em `*.test.js` e `*.test.jsx`, identificadores em inglês e textos de UI em português. |
| Estrutura de pastas | OK | Segue a TechSpec. Testes em `src/__tests__/` nos dois pacotes. |
| Sem comentários no código (PRD) | OK | Nenhum comentário novo em `src/`. O de `vite.config.js` já existia no scaffold. |
| Sem dependências novas | OK | Nenhum `package.json` foi alterado. |
| Frontend não chama a Open-Meteo (RF-01) | OK | As URLs externas existem só em `backend/src/services/openMeteo.js`. |
| Sem cache HTTP | OK | `app.disable('etag')`, `noStore` antes de tudo e `cache: 'no-store'` no único `fetch`. |
| CORS explícito | OK | Origens, métodos e headers definidos, sem `*` em produção. |
| Privacidade de coordenadas | OK | Sem persistência nem log. Os logs de falha externa não incluem a URL. |
| Duplicação (checklist de qualidade) | NOK | Ver R-04. |
| Checagem estática | NOK | `npm run lint` dá 1 aviso depois de gerar cobertura. Ver R-05. |

## Aderência à TechSpec
| Decisão Técnica | Implementado | Observações |
|-----------------|--------------|-------------|
| Separação entre `app.js` e `index.js` | SIM | `dotenv` carrega antes de `app.js`, que lê o ambiente na importação. |
| Ordem dos middlewares | SIM | Igual à especificada. |
| Contrato de `GET /health` | SIM | Sem mudança em relação ao commit anterior. |
| Contrato de `GET /api/weather` | SIM | 200, 400, 404 e 502 conforme a tabela. Payload não remodelado, com `location`. |
| Concorrência em `useWeather` | SIM | `requestId` e `AbortController`, timeout de 20 s e descarte de geolocalização tardia. |
| `index.css` como cópia literal | SIM | `diff` contra as linhas 12 a 389 de `painel.html` sem diferenças. |
| Sprite copiado | SIM | Só `i-fog` e `i-snow` acrescentados. |
| `additions.css` em lista fechada | SIM | Keyframes, z-index e especificidade conferidos: `moonGlow` não anima opacidade, as camadas `.sky-layer` ficam atrás das decorações e `.bar-uv i` vence `.bar i` pela ordem. |
| Luminância das variantes (RF-33) | SIM | Paradas de `cloudy` recalculadas: todas menores ou iguais às da referência. |
| Geometria do gráfico | SIM | Igual a `painel.html`, usando o último índice real. |
| Interação do gráfico | PARCIAL | NÃO-ADERENTE ao limite por largura real do tooltip e ao comportamento de `painel.html` ao ocultar. Ver R-01. |
| Skeleton com markup real | PARCIAL | Com movimento reduzido, as barras não ficam vazias. Ver R-02. |
| Código de erro `NOT_FOUND` em rota inexistente | DESVIO JUSTIFICADO | A TechSpec exige JSON de erro e `no-store` no 404 de rota, mas não lista um código para esse caso. Recomenda-se incluir `NOT_FOUND` na TechSpec. |
| Classe `.sky-layer.is-active` | DESVIO JUSTIFICADO | Não consta da lista de adições, mas é o mecanismo do crossfade especificado. Recomenda-se registrá-la na TechSpec. |

## Tasks Verificadas
| Task | Status | Observações |
|------|--------|-------------|
| 1.0 Base do backend | COMPLETA | |
| 2.0 Endpoint `GET /api/weather` | COMPLETA | Ver R-03 sobre o formato da resposta externa. |
| 3.0 Port do design system e do CSS | COMPLETA | |
| 4.0 Fundo de referência e estrutura | COMPLETA | |
| 5.0 Cabeçalho, relógio, rodapé e revelação | COMPLETA | |
| 6.0 Barra de busca, estado vazio e avisos | COMPLETA | |
| 7.0 Cliente da API e estado da consulta | COMPLETA | |
| 8.0 Formatação e condições meteorológicas | COMPLETA | |
| 9.0 Card de condições atuais | COMPLETA | |
| 10.0 Cards de estatística | COMPLETA | |
| 11.0 Geometria do gráfico | COMPLETA | |
| 12.0 Gráfico de previsão por hora | COMPLETA | Com a ressalva de R-01. |
| 13.0 Previsão de sete dias | COMPLETA | |
| 14.0 Skeleton e erros sobre dados exibidos | COMPLETA | Com a ressalva de R-02. |
| 15.0 Variantes de fundo | COMPLETA | |
| 16.0 Documentação de comunicação e portas | COMPLETA | Conteúdo pedido entregue. Partes antigas do README ficaram defasadas (ver Recomendações). |

Todas as subtasks estão marcadas e as 16 tasks têm `_task_review.md`.

## Testes
- Total de Testes: 444 (backend 81, frontend 363)
- Passando: 444
- Falhando: 0
- Coverage: backend 100% de linhas e 95,71% de branches; frontend 98,93% de linhas e 97,25% de branches
- Build de produção: sem erros
- Lint: 0 erros e 1 aviso, em arquivo gerado (R-05)

Não houve teste ponta a ponta nesta rodada; isso cabe ao `do-execute-qa`.

## Problemas Encontrados
| Severidade | Arquivo | Linha | Descrição | Sugestão |
|------------|---------|-------|-----------|----------|
| MAIOR | `frontend/src/components/HourlyChart.jsx` | 106 | R-01: ao ocultar, o tooltip perde posição e conteúdo, e a largura usada no limite da borda vem do estado anterior. | Manter a última posição e o último conteúdo durante o fade e medir a largura depois de renderizar. |
| MENOR | `frontend/src/components/DashboardSkeleton.jsx` | 112 | R-02: com `prefers-reduced-motion`, as barras do skeleton aparecem cheias, com gradiente. | Definir `--w: 0%` nos `<i>` do skeleton. |
| MENOR | `backend/src/services/openMeteo.js` | 104 | R-03: resposta 200 da previsão sem `current`, `hourly` ou `daily` passa como sucesso e derruba o frontend, que fica em branco. | Validar o formato em `fetchForecast` e responder 502. |
| MENOR | `frontend/src/components/CurrentCard.jsx` | 15 | R-04: helpers duplicados entre componentes, hooks e `format.js`. | Reutilizar uma única definição. |
| MENOR | `frontend/eslint.config.js` | 8 | R-05: `coverage/` entra no lint e `dist/` entra na cobertura. | Ignorar os dois diretórios gerados. |

### R-01: detalhes
`buildTipStyle(null)` devolve só `opacity`, e `TooltipContent` só renderiza com `hover`. Por isso, ao sair do gráfico:

- O React remove `left` e `top`, e o tooltip salta para a posição estática, abaixo do gráfico. O texto some ao mesmo tempo, então uma caixa vazia aparece durante o fade de `.15s`. Em `painel.html`, `hide()` só altera a opacidade, e o tooltip some no lugar. Isso contraria o CA-03, e o PRD trata divergências visuais como bloqueantes da aceitação.
- `measureElementWidth` lê o elemento antes de renderizar o novo conteúdo. Como o tooltip fica vazio ao ocultar, todo novo toque mede cerca de 26 px e o limite cai para 56 px. Um tooltip com hora, temperatura e precipitação é bem mais largo, então ultrapassa a borda do gráfico até o próximo `touchmove`. Em um toque sem arrasto, a correção nunca acontece, e a mitigação da TechSpec para 375 px não funciona.

Os testes não pegam o defeito porque verificam só `opacity: 0` e, no jsdom, `offsetWidth` é 0.

**Status:** Corrigido — o tooltip mantém último índice, posição e conteúdo ao ocultar (só `opacity` muda) e mede a largura após o render em `useLayoutEffect`. Testes de regressão adicionados em `HourlyChart.test.jsx`.

### R-02: detalhes
No bloco de movimento reduzido, a regra `.bar i{width:var(--w)}` encontra um `--w` indefinido nos `<i>` do skeleton. A declaração fica inválida no valor computado, a largura volta a `auto` e a barra ocupa todo o trilho. Isso afeta os quatro `.stat` e os sete `.day` durante o carregamento. Conclusão obtida pela regra do CSS, sem execução em navegador.

**Status:** Corrigido — `DashboardSkeleton.jsx` define `EMPTY_BAR_STYLE = { '--w': '0%' }` nos `<i>` de `SkeletonStat` e `SkeletonDay`; `index.css` não foi alterado. Teste de regressão em `DashboardSkeleton.test.jsx` confirma `--w: 0%` em todas as barras do skeleton.

### R-03: detalhes
`fetchJsonBody` aceita qualquer objeto, inclusive array e `{}`. `selectSky` lê `data.current.weather_code` durante o render, e não há error boundary. Com um payload incompleto, toda a árvore React é desmontada: a tela fica em branco, sem mensagem nem nova tentativa, e os dados anteriores se perdem, ao contrário do RF-37 e do RF-39. A probabilidade é baixa, mas o efeito é total.

**Status:** Corrigido — `requestJson` valida o corpo da previsão com `validateForecastPayload` (objeto com `current`, `hourly` e `daily` objetos) e responde 502 `UPSTREAM_ERROR`; geocoding não foi afetado. Testes em `openMeteo.test.js` e `weather.test.js`.

### R-04: detalhes

**Status:** Corrigido — helpers duplicados centralizados: `formatDegrees` (já em `lib/format.js`) passa a ser a única cópia; `hasValue` e `getDatePart` exportados de `lib/format.js`; `isReducedMotion` movido para `lib/motion.js`. Sem mudança de asserções; 366 testes passando e lint sem erros novos.

### R-05: detalhes
**Status:** Corrigido — `frontend/eslint.config.js` passa a ignorar `dist` e `coverage` (`globalIgnores(['dist', 'coverage'])`), e `frontend/vitest.config.js` exclui `dist/**` da cobertura. Verificado: `npm run lint` sem avisos e `dist/assets` fora do relatório de cobertura.

## Pontos Positivos
- `useWeather` trata bem as corridas: última consulta vence, geolocalização tardia é descartada e o timeout cobre também a leitura do corpo.
- Cópia literal do CSS e do sprite, com adições isoladas e verificáveis.
- Hora, data e "agora" vêm do payload, sem `new Date()`, o que evita erros de fuso.
- `.temp` respeita a armadilha do peso 200 descrita na TechSpec.
- Falhas externas viram 502 sem repassar mensagens da Open-Meteo nem registrar coordenadas.
- Lógica pura separada e bem testada em `chartGeometry.js`, `format.js` e `parseWeatherQuery.js`.

## Pendências da Rodada Anterior
Nenhuma pendência da rodada anterior.

## Skills e MCPs do Projeto
- Skills do projeto: lidas: nodejs-backend-patterns, vercel-react-best-practices, react-testing, vitest, javascript-typescript-jest, vite
- MCPs do projeto: usados: context7 (documentation)

## Recomendações
- Rodar `do-execute-qa` depois de R-01 e R-02. Os critérios CA-01 a CA-05 ainda não foram verificados em navegador e não são cobertos por este review.
- Verificar no QA, com leitor de tela, se "Carregando dados do clima" é anunciado: a região `role="status"` fica dentro de `main` com `aria-busy="true"`, e tecnologias assistivas podem adiar anúncios nesse caso. Se não for anunciado, mover a região para fora de `main`.
- Atualizar `README.md`: a árvore de "Estrutura do Projeto" não mostra `routes/`, `services/`, `middleware/`, `lib/`, `components/` nem `hooks/`; o índice não lista "Comunicação e portas"; e a introdução ainda diz que o código é mínimo.
- Atualizar `CLAUDE.md` e rodar `/do-setup refresh`. Ambos ainda dizem que o app está vazio, que os pacotes não estão conectados e que importar `index.js` sobe um servidor, o que não vale mais para os testes.
- Considerar `strictPort: true` em `server` e `preview` no `vite.config.js`. Sem isso, o Vite muda de porta em silêncio se 4173 estiver ocupada, e essa origem não estará em `CORS_ORIGINS`.
- Adicionar teste para falha de geolocalização que chega depois de uma busca por nome (`useWeather.js:119`). Só o caso de sucesso tardio está coberto.
- Considerar `useMemo` para a geometria em `HourlyChart.jsx:242`, que é recalculada a cada `mousemove`.
- Incluir `.playwright-mcp/` no `.gitignore` antes do commit.
- Registrar na TechSpec os dois desvios justificados listados acima.

## Conclusão
A implementação cobre as 16 tasks, adere à TechSpec nas decisões de arquitetura, e todos os testes e o build passam. Não há problema de segurança nem violação grave de regras. O status é APROVADO COM RESSALVAS por causa de um problema maior (R-01), que deve ser corrigido antes do QA porque afeta o CA-03, e de quatro problemas menores. Cada um tem uma tarefa de correção em `fixes/`.
