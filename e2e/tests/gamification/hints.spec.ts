import { test, expect } from '../../fixtures/index.js';
import { greetingResponse } from '../../mocks/ai-responses.js';
import { mockChatHistoryApi, mockHoneySpendApi } from '../../mocks/handlers.js';

test.describe('Hint System', () => {
  test.beforeEach(async ({
    signInPage,
    homePage,
    chatPage,
    mockChatResponse,
    mockHoney,
    page,
  }) => {
    await mockChatResponse(greetingResponse);
    await mockHoney(5);
    await mockChatHistoryApi(page, { hasHistory: false });

    await signInPage.goto();
    await signInPage.devLogin();
    await homePage.fillOnboardingForm({ name: 'Test', age: '25' });
    await homePage.startChat();
    await chatPage.waitForResponse();
  });

  test('clicking hint word shows confirmation popup', async ({ chatPage }) => {
    await chatPage.clickHintWord(0);

    // Confirmation dialog should appear
    await expect(
      chatPage.page.getByRole('button', { name: /spend 1 honey/i })
    ).toBeVisible();
  });

  test('confirmation popup shows current honey cost', async ({ chatPage }) => {
    await chatPage.clickHintWord(0);

    await expect(chatPage.page.getByText(/1 honey/i)).toBeVisible();
  });

  test('confirming hint purchase shows hint content', async ({
    chatPage,
    page,
  }) => {
    await mockHoneySpendApi(page, { success: true, newBalance: 4 });

    await chatPage.clickHintWord(0);
    await chatPage.confirmHintPurchase();

    // Wait for hint to appear
    await page.waitForTimeout(500);

    // Hint content (translation) should be visible
    await expect(page.getByText(/Die Katze/i)).toBeVisible();
  });

  test('shows error when insufficient honey', async ({ chatPage, page }) => {
    // Mock insufficient honey error
    await mockHoneySpendApi(page, { success: false });

    await chatPage.clickHintWord(0);
    await chatPage.confirmHintPurchase();

    // Error message should appear
    await expect(page.getByText(/not enough honey/i)).toBeVisible();
  });

  test('can click different hint word', async ({ chatPage, page }) => {
    await chatPage.clickHintWord(0);

    // Verify first confirmation is shown
    await expect(
      chatPage.page.getByRole('button', { name: /spend 1 honey/i })
    ).toBeVisible();

    // Clicking a different hint word should show confirmation for that word
    await chatPage.clickHintWord(1);

    // Confirmation should still be visible (for the new word)
    await expect(
      chatPage.page.getByRole('button', { name: /spend 1 honey/i })
    ).toBeVisible();
  });

  test('clicking same hint again shows cached result', async ({
    chatPage,
    page,
  }) => {
    await mockHoneySpendApi(page, { success: true, newBalance: 4 });

    // Purchase first hint
    await chatPage.clickHintWord(0);
    await chatPage.confirmHintPurchase();
    await page.waitForTimeout(500);

    // Click same hint again - should show without confirmation
    await chatPage.clickHintWord(0);

    // Should NOT show purchase confirmation (already purchased)
    await expect(
      chatPage.page.getByRole('button', { name: /spend 1 honey/i })
    ).not.toBeVisible({ timeout: 1000 });
  });

  test('different hints require separate purchases', async ({
    chatPage,
    page,
  }) => {
    await mockHoneySpendApi(page, { success: true, newBalance: 4 });

    // Purchase first hint
    await chatPage.clickHintWord(0);
    await chatPage.confirmHintPurchase();
    await page.waitForTimeout(500);

    // Click second hint - should show confirmation
    await chatPage.clickHintWord(1);
    await expect(
      chatPage.page.getByRole('button', { name: /spend 1 honey/i })
    ).toBeVisible();
  });
});
