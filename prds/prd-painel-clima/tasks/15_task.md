# Tarefa 15.0: Variantes de fundo por condição

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Liga o fundo à condição do tempo: acrescenta as camadas `.sky-layer` ao `SkyBackground` e deriva a variante de `data.current.weather_code`. Os estilos já foram entregues na tarefa 3.0.

**Depende de:** tarefas 4.0, 8.0 e 14.0.

<requirements>
- Requisitos do PRD atendidos: RF-31, RF-32 e RF-33.
- Layout, componentes, tipografia e espaçamentos não mudam entre variantes: variam só o fundo e seus elementos decorativos.
- A variante `reference` continua exatamente igual às linhas 488–494 de `painel.html`, inclusive no estado vazio.
- `body::before` não é alterado.
- As variantes não existem no protótipo: usam apenas os valores da TechSpec já presentes em `additions.css`. Nenhum valor novo de CSS é criado nesta tarefa.
- A variante é derivada durante o render, sem estado próprio nem efeito.
</requirements>

## Subtarefas

- [x] 15.1 Acrescentar `.sky-layer.sky-cloudy` e `.sky-layer.sky-rain` antes de `#stars` em `SkyBackground`.
- [x] 15.2 Receber a prop `sky` e aplicá-la em `data-sky`.
- [x] 15.3 Derivar `sky` em `src/App.jsx` por `getWeatherInfo(data.current.weather_code).sky`, com `reference` sem dados.
- [x] 15.4 Escrever os testes de unidade e de integração.

## Detalhes de Implementação

**Referência em `painel.html`:** a base das variantes são `#stars` (488), `.moon` (489), `.bg-cloud` (490–492) e `.shoot`, `.shoot2` (493–494). As camadas `.sky-layer` são novas na tabela "Componentização".

Ver na `techspec.md`: "Variantes de fundo (RF-31 a RF-33)", "Condições" e "Fluxo de dados".

## Critérios de Sucesso

- `data-sky` corresponde à tabela de condições para todos os grupos.
- Sem dados, ou com código desconhecido, a variante é `reference`, com as camadas em opacidade 0.
- A troca entre variantes é um crossfade suave de `1.2s`, sem corte seco.
- O conteúdo do painel não muda de posição nem de estilo entre as variantes.
- `cloudy` e `rain` seguem a tabela de decoração da TechSpec, e `.shoot` fica oculto nelas.
- Nenhum valor de CSS novo foi criado nesta tarefa.

## Testes da Tarefa

- [x] Testes de unidade: `SkyBackground` com `data-sky` por prop, camadas antes de `#stars` e decoração preservada.
- [x] Testes de integração: `App` com a fixture e códigos diferentes aplica `reference`, `cloudy` e `rain`; estado vazio fica em `reference`; em erro, a variante da última consulta permanece.
- [x] Teste de fumaça: com frontend e backend no ar e sem mocks, via Playwright MCP, pesquisar "Curitiba" aplica o `data-sky` correspondente ao `current.weather_code` da resposta real, conforme a tabela de condições, sem erros no console. A condição real não é controlável, e as três variantes são exercitadas nos testes de integração.

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `painel.html`
- `frontend/src/components/SkyBackground.jsx`
- `frontend/src/App.jsx`
- `frontend/src/additions.css` (somente leitura)
- `frontend/src/lib/weatherCodes.js`
- `frontend/src/__tests__/`
