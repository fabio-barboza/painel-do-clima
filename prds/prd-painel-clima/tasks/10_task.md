# Tarefa 10.0: Testes E2E com Playwright

<critical>Ler os arquivos de prd.md e techspec.md desta pasta, se você não ler esses arquivos sua tarefa será invalidada</critical>

## Visão Geral

Implementar testes end-to-end com Playwright que validam os fluxos principais da aplicação: busca por cidade, exibição de dados climáticos, fluxo de erro para cidade inexistente e fluxo de geolocalização. Estes testes garantem que a integração completa frontend + backend funciona corretamente.

<requirements>
- Validar fluxo principal: buscar cidade → dados climáticos exibidos
- Validar fluxo de erro: buscar cidade inexistente → mensagem de erro
- Validar gráfico Chart.js renderizado
- Validar fluxo de geolocalização (com mock de `navigator.geolocation`)
- Testes devem rodar contra backend e frontend reais (não mocks)
- Nenhum comentário no código
</requirements>

## Subtarefas

- [ ] 10.1 Configurar Playwright no frontend (se não configurado): `playwright.config.js` e dependência
- [ ] 10.2 Implementar teste E2E: buscar cidade válida → verificar dados exibidos (temperatura, umidade, etc.)
- [ ] 10.3 Implementar teste E2E: buscar cidade válida → verificar gráfico horário renderizado
- [ ] 10.4 Implementar teste E2E: buscar cidade inexistente → verificar mensagem de erro exibida
- [ ] 10.5 Implementar teste E2E: geolocalização (mock de `navigator.geolocation`) → dados carregados
- [ ] 10.6 Implementar teste E2E: retry após erro

## Detalhes de Implementação

### Configuração do Playwright
- `playwright.config.js`: baseURL `http://localhost:5173`, webServer para frontend e backend
- Garantir que o backend está rodando (webServer separado ou manual)
- Os testes devem mockar apenas `navigator.geolocation` — as chamadas ao backend são reais

### Teste de busca por cidade
- Navegar para `/`
- Preencher campo de busca com "São Paulo"
- Submeter busca
- Verificar que dados climáticos aparecem: temperatura, umidade, vento
- Verificar que cards de 7 dias aparecem

### Teste de gráfico horário
- Após busca, verificar que o canvas do Chart.js está presente
- Verificar que o container do gráfico tem conteúdo renderizado

### Teste de cidade inexistente
- Buscar "CidadeInexistenteXYZ123"
- Verificar que mensagem de erro aparece
- Verificar que botão de retry está visível

### Teste de geolocalização
- Usar `page.addInitScript` para mock de `navigator.geolocation.getCurrentPosition`
- Clicar no botão de geolocalização
- Verificar que dados climáticos carregam

### Teste de retry
- Buscar cidade inexistente → mensagem de erro
- Clicar em "Tentar novamente"
- Verificar que nova busca é disparada

## Critérios de Sucesso

- Todos os testes E2E passam
- Fluxo de busca coberto end-to-end
- Fluxo de erro coberto com verificação de mensagem
- Fluxo de geolocalização testado com mock
- Gráfico Chart.js verificado como renderizado
- Zero comentários no código

## Testes da Tarefa

- [ ] Teste E2E: busca por cidade válida
- [ ] Teste E2E: gráfico horário renderizado
- [ ] Teste E2E: cidade inexistente → erro
- [ ] Teste E2E: geolocalização com mock
- [ ] Teste E2E: retry após erro

<critical>SEMPRE CRIE E EXECUTE OS TESTES DA TAREFA ANTES DE CONSIDERÁ-LA FINALIZADA</critical>

## Arquivos relevantes

- `frontend/playwright.config.js` (criar se não existir)
- `frontend/e2e/weather.spec.js` (criar)
- `frontend/package.json` (adicionar dependência Playwright se necessário)
