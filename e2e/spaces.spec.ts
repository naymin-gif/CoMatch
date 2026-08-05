import { test, expect } from '@playwright/test';

test.describe('Spaces & Search E2E', () => {

  test('renders SearchBar and handles search input on home page', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Locate SearchBar input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Type search query
    await searchInput.fill('Orbital');
    await expect(searchInput).toHaveValue('Orbital');
  });

  test('redirects unauthenticated user from /spaces/new to /login', async ({ page }) => {
    // Navigate to protected create space page without logging in
    await page.goto('/spaces/new');

    // Assert that middleware redirects unauthenticated user to /login
    await expect(page).toHaveURL(/\/login/);
  });
});
