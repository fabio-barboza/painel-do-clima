const { test, expect } = require('@playwright/test');

const REAL_TIMEOUT_MS = 30000;

test('smoke real: busca "Curitiba" nas APIs Open-Meteo exibe condições atuais, gráfico e 7 cards', async ({ page }) => {
  test.skip(!process.env.RUN_REAL_E2E, 'smoke real requer RUN_REAL_E2E=1');
  test.setTimeout(60000);

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Curitiba');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Curitiba' })).toBeVisible({ timeout: REAL_TIMEOUT_MS });
  await expect(page.getByRole('heading', { name: 'Condições atuais' })).toBeVisible();
  await expect(page.locator('.current-weather-temperature')).toBeVisible();
  await expect(page.locator('.uv-bar')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Próximas 24 horas' })).toBeVisible();
  await expect(page.locator('.hourly-chart .visually-hidden tbody tr')).toHaveCount(24);
  await expect(page.getByRole('heading', { name: 'Próximos 7 dias' })).toBeVisible();
  await expect(page.locator('.weekly-day')).toHaveCount(7);
});
