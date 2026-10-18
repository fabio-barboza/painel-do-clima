const { test, expect } = require('@playwright/test');

test('geolocalização negada: mensagem amigável e busca manual continua funcional', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Usar minha localização' }).click();

  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert.getByRole('heading', { name: 'Localização indisponível' })).toBeVisible();
  await expect(
    alert.getByText('Não foi possível acessar sua localização. Você pode pesquisar a cidade pelo nome no campo acima.')
  ).toBeVisible();
  await expect(alert.getByRole('button', { name: 'Tentar novamente' })).toHaveCount(0);

  await page.getByLabel('Cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(page.locator('.current-weather-temperature')).toHaveText('18,3 °C');
  await expect(page.locator('.uv-bar')).toBeVisible();
  await expect(page.locator('.hourly-chart .visually-hidden tbody tr')).toHaveCount(24);
  await expect(page.locator('.weekly-day')).toHaveCount(7);
});
