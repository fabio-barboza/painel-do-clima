const { test, expect } = require('@playwright/test');

test('respostas de /api/weather levam Cache-Control no-store e não levam ETag', async ({ page }) => {
  const weatherResponses = [];
  page.on('response', (response) => {
    if (response.url().includes('/api/weather')) {
      weatherResponses.push(response);
    }
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeVisible();

  expect(weatherResponses.length).toBeGreaterThan(0);
  for (const response of weatherResponses) {
    const headers = response.headers();
    expect(headers['cache-control']).toBe('no-store');
    expect(headers).not.toHaveProperty('etag');
  }
});
