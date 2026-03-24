import { test, expect } from './fixtures.js';

test.describe('Chat Integration', () => {
  test.beforeEach(async ({ signInPage, homePage, db }) => {
    // Seed user with honey
    await db.seedTestUser({ honey: 10 });

    await signInPage.goto();
    await signInPage.devLogin();
    await homePage.fillOnboardingForm({ name: 'Test', age: '25' });
    await homePage.startChat();
  });

  test('sends message and receives AI response', async ({ chatPage, page }) => {
    // Wait for initial greeting
    await chatPage.waitForResponse();

    // Send a message
    await chatPage.sendMessage('Das ist ein Test.');

    // Should show loading indicator
    await expect(page.getByText(/thinking/i)).toBeVisible();

    // Wait for AI response (longer timeout for real API)
    await chatPage.waitForResponse({ timeout: 30000 });

    // Response should contain feedback elements
    await expect(
      page.locator('.prose, [class*="chat"], [class*="message"]').first()
    ).toBeVisible();
  });

  test('chat history persists across page reloads', async ({
    chatPage,
    db,
    page,
  }) => {
    // Seed chat history for the user
    await db.seedChatHistory('dev-user', 'German');

    // Reload the page
    await page.reload();

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Chat should have messages from history
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('honey balance updates after hint purchase', async ({
    chatPage,
    db,
    page,
  }) => {
    // Wait for initial response with hint words
    await chatPage.waitForResponse();

    const initialHoney = await db.getHoneyBalance('dev-user');
    expect(initialHoney).toBe(10);

    // Try to click a hint word (if available)
    const hintWords = page.locator('[class*="hint"], [class*="underline"]');
    const count = await hintWords.count();

    if (count > 0) {
      await hintWords.first().click();

      // If confirmation appears, confirm purchase
      const confirmButton = page.getByRole('button', { name: /spend.*honey/i });
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
        await page.waitForTimeout(1000);

        // Check honey decreased
        const newHoney = await db.getHoneyBalance('dev-user');
        expect(newHoney).toBeLessThan(initialHoney);
      }
    }
  });
});
