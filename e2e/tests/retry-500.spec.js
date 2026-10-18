const { test, expect } = require('@playwright/test');

const DEFAULT_MOCK_URL = 'http://127.0.0.1:9100';
const MOCK_URL = process.env.E2E_MOCK_URL || DEFAULT_MOCK_URL;

async function setForecastStatus(status) {
  const response = await fetch(`${MOCK_URL}/__control/forecast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(status ? { status } : {})
  });
  if (!response.ok) {
    throw new Error(`Mock server não configurado (HTTP ${response.status}).`);
  }
}

test('backend 500: mensagem de erro e "Tentar novamente" reexecuta a busca', async ({ page }) => {
  const weatherRequests = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/weather')) {
      weatherRequests.push(request.url());
    }
  });

  try {
    await setForecastStatus(500);
    await page.goto('/');
    await page.getByLabel('Cidade').fill('São Paulo');
    await page.getByRole('button', { name: 'Buscar' }).click();

    const alert = page.getByRole('alert');
    await expect(alert).toBeVisible();
    await expect(alert.getByRole('heading', { name: 'Falha de comunicação' })).toBeVisible();
    await expect(alert.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();

    await setForecastStatus(200);
    await page.getByRole('button', { name: 'Tentar novamente' }).click();

    await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
    await expect(page.locator('.current-weather-temperature')).toHaveText('18,3 °C');
    await expect(page.locator('.uv-bar')).toBeVisible();
    await expect(page.locator('.hourly-chart .visually-hidden tbody tr')).toHaveCount(24);
    await expect(page.locator('.weekly-day')).toHaveCount(7);

    expect(weatherRequests).toHaveLength(2);
  } finally {
    await setForecastStatus(200);
  }
});
