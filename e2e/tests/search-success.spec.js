const { test, expect } = require('@playwright/test');

test('buscar "São Paulo" (mock) exibe condições atuais, gráfico 24h, 7 cards e tema clear', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.locator('.app-shell')).toHaveAttribute('data-theme', 'clear');

  await expect(page.getByRole('heading', { name: 'Condições atuais' })).toBeVisible();
  await expect(page.locator('.current-weather-temperature')).toHaveText('18,3 °C');
  await expect(page.locator('.uv-bar')).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Próximas 24 horas' })).toBeVisible();
  await expect(page.locator('.hourly-chart-canvas')).toBeVisible();
  await expect(page.locator('.hourly-chart .visually-hidden tbody tr')).toHaveCount(24);

  await expect(page.getByRole('heading', { name: 'Próximos 7 dias' })).toBeVisible();
  await expect(page.locator('.weekly-day')).toHaveCount(7);
});
