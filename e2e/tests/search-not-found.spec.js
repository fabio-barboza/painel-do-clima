const { test, expect } = require('@playwright/test');

test('buscar cidade inexistente (mock results: []) exibe mensagem amigável e busca continua disponível', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Cidade').fill('Xyzabc12345');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert.getByRole('heading', { name: 'Cidade não encontrada' })).toBeVisible();
  await expect(
    alert.getByText('Não encontramos a cidade pesquisada. Verifique se o nome está correto e tente novamente.')
  ).toBeVisible();

  const cityInput = page.getByLabel('Cidade');
  await expect(cityInput).toBeVisible();
  await expect(cityInput).toBeEnabled();
});
