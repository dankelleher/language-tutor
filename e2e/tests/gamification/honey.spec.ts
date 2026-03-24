import { test, expect } from '../../fixtures/index.js';
import { greetingResponse } from '../../mocks/ai-responses.js';
import { mockChatHistoryApi } from '../../mocks/handlers.js';

test.describe('Honey Balance', () => {
  test.beforeEach(async ({
    signInPage,
    homePage,
    mockChatResponse,
    page,
  }) => {
    await mockChatResponse(greetingResponse);
    await mockChatHistoryApi(page, { hasHistory: false });
    await signInPage.goto();
  });

  test('displays honey balance in header', async ({
    signInPage,
    homePage,
    chatPage,
    mockHoney,
  }) => {
    await mockHoney(5);
    await signInPage.devLogin();
    await homePage.fillOnboardingForm({ name: 'Test', age: '25' });
    await homePage.startChat();
    await chatPage.waitForResponse();

    // Find the honey display
    const honeyDisplay = chatPage.page.locator('img[src*="coin"]').locator('..');
    await expect(honeyDisplay).toBeVisible();
  });

  test('shows correct initial honey balance', async ({
    signInPage,
    homePage,
    chatPage,
    page,
  }) => {
    // Mock honey API with specific balance
    await page.route('**/api/user/honey', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ honey: 7 }),
      });
    });

    await signInPage.devLogin();
    await homePage.fillOnboardingForm({ name: 'Test', age: '25' });
    await homePage.startChat();
    await chatPage.waitForResponse();

    // Check balance displays correctly
    await expect(chatPage.page.getByText('7')).toBeVisible();
  });

  test('honey balance is visible on mobile', async ({
    signInPage,
    homePage,
    chatPage,
    mockHoney,
    page,
  }) => {
    await mockHoney(3);

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await signInPage.devLogin();
    await homePage.fillOnboardingForm({ name: 'Test', age: '25' });
    await homePage.startChat();
    await chatPage.waitForResponse();

    const honeyDisplay = chatPage.page.locator('img[src*="coin"]').locator('..');
    await expect(honeyDisplay).toBeVisible();
  });
});
