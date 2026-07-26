import { test, expect } from '@playwright/test';

test.describe('Real-Time Chat Workspace E2E', () => {

  test('redirects unauthenticated access from /chat to /login', async ({ page }) => {
    // Navigate to chat
    await page.goto('/chat');

    // Assert that middleware redirects unauthenticated user to /login
    await expect(page).toHaveURL(/\/login/);
  });
});
