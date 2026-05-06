# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: weather.spec.js >> Painel do Clima - Fluxo Principal >> geolocalizacao carrega dados com permissoes
- Location: e2e/weather.spec.js:64:3

# Error details

```
TypeError: page.getByLabelText is not a function
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - heading "Painel do Clima" [level=1] [ref=e5]
  - paragraph [ref=e6]: Consulte a previsão do tempo de qualquer cidade do mundo
  - generic [ref=e7]:
    - textbox "Nome da cidade" [ref=e8]:
      - /placeholder: Buscar cidade...
    - button "Buscar" [ref=e9] [cursor=pointer]
    - button "Usar minha localização" [ref=e10] [cursor=pointer]:
      - img [ref=e11]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Painel do Clima - Fluxo Principal', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |   });
  7  | 
  8  |   test('exibe hero e campo de busca no estado inicial', async ({ page }) => {
  9  |     await expect(page.getByRole('heading', { name: 'Painel do Clima' })).toBeVisible();
  10 |     await expect(page.getByPlaceholder('Buscar cidade...')).toBeVisible();
  11 |     await expect(page.getByText('Buscar')).toBeVisible();
  12 |   });
  13 | 
  14 |   test('buscar cidade valida exibe dados climaticos', async ({ page }) => {
  15 |     await page.getByPlaceholder('Buscar cidade...').fill('São Paulo');
  16 |     await page.getByText('Buscar').click();
  17 | 
  18 |     await expect(page.getByText('São Paulo')).toBeVisible({ timeout: 10000 });
  19 | 
  20 |     await expect(page.getByText('°C')).toBeVisible();
  21 |     await expect(page.getByText('Umidade')).toBeVisible();
  22 |     await expect(page.getByText('Vento')).toBeVisible();
  23 |     await expect(page.getByText('Precipitação')).toBeVisible();
  24 |     await expect(page.getByText('UV')).toBeVisible();
  25 |   });
  26 | 
  27 |   test('buscar cidade valida exibe cards de 7 dias', async ({ page }) => {
  28 |     await page.getByPlaceholder('Buscar cidade...').fill('São Paulo');
  29 |     await page.getByText('Buscar').click();
  30 | 
  31 |     await expect(page.getByText('Previsão de 7 dias')).toBeVisible({ timeout: 10000 });
  32 |     await expect(page.getByText('Hoje')).toBeVisible();
  33 |   });
  34 | 
  35 |   test('buscar cidade valida renderiza grafico horario', async ({ page }) => {
  36 |     await page.getByPlaceholder('Buscar cidade...').fill('São Paulo');
  37 |     await page.getByText('Buscar').click();
  38 | 
  39 |     await expect(page.getByText('Previsão por hora')).toBeVisible({ timeout: 10000 });
  40 |     const canvas = page.locator('.hourly-forecast__chart canvas');
  41 |     await expect(canvas).toBeVisible();
  42 |   });
  43 | 
  44 |   test('buscar cidade inexistente exibe mensagem de erro', async ({ page }) => {
  45 |     await page.getByPlaceholder('Buscar cidade...').fill('CidadeInexistenteXYZ123');
  46 |     await page.getByText('Buscar').click();
  47 | 
  48 |     await expect(page.getByText('Cidade não encontrada')).toBeVisible({ timeout: 10000 });
  49 |     await expect(page.getByText('Tentar novamente')).toBeVisible();
  50 |   });
  51 | 
  52 |   test('retry apos erro dispara nova busca', async ({ page }) => {
  53 |     await page.getByPlaceholder('Buscar cidade...').fill('CidadeInexistenteXYZ123');
  54 |     await page.getByText('Buscar').click();
  55 | 
  56 |     await expect(page.getByText('Cidade não encontrada')).toBeVisible({ timeout: 10000 });
  57 | 
  58 |     await page.getByPlaceholder('Buscar cidade...').fill('São Paulo');
  59 |     await page.getByText('Buscar').click();
  60 | 
  61 |     await expect(page.getByText('°C')).toBeVisible({ timeout: 10000 });
  62 |   });
  63 | 
  64 |   test('geolocalizacao carrega dados com permissoes', async ({ page }) => {
  65 |     await page.context().grantPermissions(['geolocation']);
  66 |     await page.context().setGeolocation({ latitude: -23.5475, longitude: -46.63611 });
  67 | 
> 68 |     await page.getByLabelText('Usar minha localização').click();
     |                ^ TypeError: page.getByLabelText is not a function
  69 | 
  70 |     await expect(page.getByText('Sua localização')).toBeVisible({ timeout: 10000 });
  71 |     await expect(page.getByText('°C')).toBeVisible();
  72 |   });
  73 | });
  74 | 
```