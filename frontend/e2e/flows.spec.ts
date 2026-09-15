import { test, expect } from '@playwright/test';
import path from 'node:path';
import { API, signIn, waitForView } from './helpers';

test('sign in flow returns to the requested page', async ({ page }) => {
  await page.goto('/missions');
  await expect(page).toHaveURL(/\/login/);
  await waitForView(page);
  await page.getByRole('button', { name: /authenticate/i }).click();
  await page.getByRole('button', { name: /enter command center/i }).click();
  await expect(page).toHaveURL(/\/missions$/);
});

test('contact request is validated and stored', async ({ request }) => {
  const bad = await request.post('/api/requests', { data: { type: 'contact', email: 'nope' } });
  expect(bad.status()).toBe(400);
  const ok = await request.post('/api/requests', { data: { type: 'contact', email: 'e2e@example.com', name: 'E2E' } });
  expect(ok.ok()).toBeTruthy();
});

test.describe('@backend real inference', () => {
  test.beforeEach(async ({ request }) => {
    const health = await request.get(API + '/api/v1/health').catch(() => null);
    test.skip(!health || !health.ok(), 'FastAPI backend not running on ' + API);
  });

  test('backend reports all three models available', async ({ request }) => {
    const body = await (await request.get(API + '/api/v1/health')).json();
    expect(body.models.map((m: any) => m.pillar).sort()).toEqual(['agri', 'energy', 'rescue']);
    expect(body.models.every((m: any) => m.available)).toBeTruthy();
  });

  test('status page shows the API as operational', async ({ page }) => {
    await page.goto('/status');
    await waitForView(page);
    await expect(page.getByText(/unreachable/i)).toHaveCount(0);
  });

  test('upload → YOLO inference → mission twin shows real detections', async ({ page, context, baseURL }) => {
    await signIn(context, baseURL!);
    await page.goto('/missions/new?pillar=rescue');
    await waitForView(page);
    const fixture = path.join(__dirname, 'fixtures', 'thermal_01.jpg');
    await page.locator('input[type=file]').setInputFiles(fixture);
    const inferReq = page.waitForResponse((r) => r.url().includes('/api/v1/infer/') && r.request().method() === 'POST');
    await page.getByRole('button', { name: /run inference/i }).click();
    const res = await inferReq;
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.pillar).toBe('rescue');
    expect(body.detections.length).toBeGreaterThan(0);
    await expect(page.getByText(/processed by the backend/i)).toBeVisible({ timeout: 60_000 });
  });
});
