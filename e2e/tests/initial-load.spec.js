const { test, expect } = require('@playwright/test');

test('carga inicial de / renderiza o estado inicial com busca visível e sem dados', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Painel do Clima' })).toBeVisible();

  await expect(page.getByRole('search')).toBeVisible();
  await expect(page.getByLabel('Cidade')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Usar minha localização' })).toBeVisible();

  await expect(
    page.getByText('Digite o nome de uma cidade no campo acima para ver o clima agora, nas próximas horas e nos próximos 7 dias.')
  ).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Condições atuais' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Próximas 24 horas' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Próximos 7 dias' })).toHaveCount(0);
});
