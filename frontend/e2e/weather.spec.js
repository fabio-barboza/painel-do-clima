import { test, expect } from '@playwright/test';

test.describe('Painel do Clima - Fluxo Principal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('exibe hero e campo de busca no estado inicial', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Painel do Clima' })).toBeVisible();
    await expect(page.getByPlaceholder('Buscar cidade...')).toBeVisible();
    await expect(page.getByText('Buscar')).toBeVisible();
  });

  test('buscar cidade valida exibe dados climaticos', async ({ page }) => {
    await page.getByPlaceholder('Buscar cidade...').fill('São Paulo');
    await page.getByText('Buscar').click();

    await expect(page.getByText('São Paulo')).toBeVisible({ timeout: 10000 });

    await expect(page.getByText('°C')).toBeVisible();
    await expect(page.getByText('Umidade')).toBeVisible();
    await expect(page.getByText('Vento')).toBeVisible();
    await expect(page.getByText('Precipitação')).toBeVisible();
    await expect(page.getByText('UV')).toBeVisible();
  });

  test('buscar cidade valida exibe cards de 7 dias', async ({ page }) => {
    await page.getByPlaceholder('Buscar cidade...').fill('São Paulo');
    await page.getByText('Buscar').click();

    await expect(page.getByText('Previsão de 7 dias')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Hoje')).toBeVisible();
  });

  test('buscar cidade valida renderiza grafico horario', async ({ page }) => {
    await page.getByPlaceholder('Buscar cidade...').fill('São Paulo');
    await page.getByText('Buscar').click();

    await expect(page.getByText('Previsão por hora')).toBeVisible({ timeout: 10000 });
    const canvas = page.locator('.hourly-forecast__chart canvas');
    await expect(canvas).toBeVisible();
  });

  test('buscar cidade inexistente exibe mensagem de erro', async ({ page }) => {
    await page.getByPlaceholder('Buscar cidade...').fill('CidadeInexistenteXYZ123');
    await page.getByText('Buscar').click();

    await expect(page.getByText('Cidade não encontrada')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Tentar novamente')).toBeVisible();
  });

  test('retry apos erro dispara nova busca', async ({ page }) => {
    await page.getByPlaceholder('Buscar cidade...').fill('CidadeInexistenteXYZ123');
    await page.getByText('Buscar').click();

    await expect(page.getByText('Cidade não encontrada')).toBeVisible({ timeout: 10000 });

    await page.getByPlaceholder('Buscar cidade...').fill('São Paulo');
    await page.getByText('Buscar').click();

    await expect(page.getByText('°C')).toBeVisible({ timeout: 10000 });
  });

  test('geolocalizacao carrega dados com permissoes', async ({ page }) => {
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: -23.5475, longitude: -46.63611 });

    await page.getByLabelText('Usar minha localização').click();

    await expect(page.getByText('Sua localização')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('°C')).toBeVisible();
  });
});
