import { test, expect } from '@playwright/test';

test.describe('Dashboard & Applications E2E', () => {

  test('redirects unauthenticated access from /dashboard to /login', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Assert that middleware redirects unauthenticated user to /login
    await expect(page).toHaveURL(/\/login/);
  });
});
