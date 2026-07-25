import { test, expect } from '@playwright/test';

test.describe('Authentication & Protected Route Security E2E', () => {

  test('redirects unauthenticated user from /dashboard to /login', async ({ page }) => {
    // 1. Attempt to navigate to protected dashboard route without logging in
    await page.goto('/dashboard');

    // 2. Assert that Next.js middleware redirects to /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('renders login page with email and password fields', async ({ page }) => {
    await page.goto('/login');

    // Assert that login inputs and buttons exist on the rendered page
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });
});
