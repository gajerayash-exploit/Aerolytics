import { test, expect } from '@playwright/test';
import { PUBLIC_ROUTES, APP_ROUTES, signIn, trackErrors, waitForView, findCoveredControls } from './helpers';

test.describe('public routes', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} renders without errors and no covered controls`, async ({ page }) => {
      const errors = trackErrors(page);
      const res = await page.goto(route);
      expect(res?.status()).toBeLessThan(400);
      await waitForView(page);
      await expect(page.locator('body')).not.toBeEmpty();
      const covered = await findCoveredControls(page);
      expect(covered, JSON.stringify(covered, null, 2)).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
});

test.describe('command-center routes', () => {
  test('redirect to login when signed out', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard/);
  });

  for (const route of APP_ROUTES) {
    test(`${route} renders without errors and no covered controls`, async ({ page, context, baseURL }) => {
      await signIn(context, baseURL!);
      const errors = trackErrors(page);
      const res = await page.goto(route);
      expect(res?.status()).toBeLessThan(400);
      expect(new URL(page.url()).pathname).toBe(route);
      await waitForView(page);
      const covered = await findCoveredControls(page);
      expect(covered, JSON.stringify(covered, null, 2)).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
});

test('unknown route shows the 404 screen', async ({ page }) => {
  const res = await page.goto('/this-route-does-not-exist');
  expect(res?.status()).toBe(404);
  await waitForView(page);
  await expect(page.getByText(/404/).first()).toBeVisible();
});
