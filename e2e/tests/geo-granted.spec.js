const { test, expect } = require('@playwright/test');

const LATITUDE = -25.4284;
const LONGITUDE = -49.2733;

test('geolocalização concedida: painel exibe os dados da localização', async ({ browser }) => {
  const context = await browser.newContext();
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: LATITUDE, longitude: LONGITUDE });
  const page = await context.newPage();

  const weatherRequests = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/weather')) {
      weatherRequests.push(request.url());
    }
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Usar minha localização' }).click();

  await expect(page.getByRole('heading', { name: 'Sua localização' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Condições atuais' })).toBeVisible();
  await expect(page.locator('.current-weather-temperature')).toHaveText('18,3 °C');
  await expect(page.locator('.uv-bar')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Próximas 24 horas' })).toBeVisible();
  await expect(page.locator('.hourly-chart .visually-hidden tbody tr')).toHaveCount(24);
  await expect(page.getByRole('heading', { name: 'Próximos 7 dias' })).toBeVisible();
  await expect(page.locator('.weekly-day')).toHaveCount(7);

  expect(weatherRequests[0]).toContain(`/api/weather?lat=${LATITUDE}&lon=${LONGITUDE}`);

  await context.close();
});
