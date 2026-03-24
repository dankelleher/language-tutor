import { test, expect } from '../../fixtures/index.js';
import {
  greetingResponse,
  correctAnswerResponse,
  incorrectAnswerResponse,
} from '../../mocks/ai-responses.js';
import { mockChatHistoryApi, mockChatApi } from '../../mocks/handlers.js';

test.describe('Chat Flow', () => {
  test.beforeEach(async ({
    signInPage,
    homePage,
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
  });

  test('displays greeting and first exercise after onboarding', async ({
    chatPage,
    page,
  }) => {
    await chatPage.waitForResponse();

    // Wait a bit for response to fully render
    await page.waitForTimeout(500);

    // Look for the exercise card - should have "Translate this" text
    await expect(page.getByText(/translate this/i)).toBeVisible();
  });

  test('shows the exercise sentence to translate', async ({ chatPage, page }) => {
    await chatPage.waitForResponse();
    await expect(page.getByText(/The cat is small/i)).toBeVisible();
  });

  test('shows translation hints for each word part', async ({
    chatPage,
    page,
  }) => {
    await chatPage.waitForResponse();
    // Check for underlined hint words
    const hintWords = page.locator('button.underline');
    await expect(hintWords).toHaveCount(3); // "The cat", "is", "small"
  });

  test('chat input is visible and editable', async ({ chatPage }) => {
    await chatPage.waitForResponse();
    await expect(chatPage.chatInput).toBeVisible();
    await expect(chatPage.chatInput).toBeEditable();
  });

  test('can submit messages via Enter key', async ({ chatPage, page }) => {
    await chatPage.waitForResponse();

    // Set up mock for the next response
    await mockChatApi(page, correctAnswerResponse);

    await chatPage.sendMessage('Die Katze ist klein.');

    // Should trigger loading and eventually show response
    await chatPage.waitForResponse();
  });

  test('displays correct answer feedback', async ({ chatPage, page }) => {
    await chatPage.waitForResponse();

    // Mock correct response
    await page.unroute('**/api/chat');
    await mockChatApi(page, correctAnswerResponse);

    await chatPage.sendMessage('Die Katze ist klein.');
    await chatPage.waitForResponse();

    await expect(page.getByText(/excellent work/i)).toBeVisible();
  });

  test('displays incorrect answer with corrections', async ({
    chatPage,
    page,
  }) => {
    await chatPage.waitForResponse();

    // Mock incorrect response
    await page.unroute('**/api/chat');
    await mockChatApi(page, incorrectAnswerResponse);

    await chatPage.sendMessage('Die Katze ist gross.');
    await chatPage.waitForResponse();

    // Should show correction elements
    await expect(page.getByText(/your attempt/i)).toBeVisible();
    await expect(page.getByText(/correct version/i)).toBeVisible();
  });

  test('shows tips/explanations for incorrect answers', async ({
    chatPage,
    page,
  }) => {
    await chatPage.waitForResponse();

    await page.unroute('**/api/chat');
    await mockChatApi(page, incorrectAnswerResponse);

    await chatPage.sendMessage('Die Katze ist gross.');
    await chatPage.waitForResponse();

    // Should show tips section
    await expect(page.getByText(/tips & explanations/i)).toBeVisible();
  });

  test('explanation tips can be expanded', async ({ chatPage, page }) => {
    await chatPage.waitForResponse();

    await page.unroute('**/api/chat');
    await mockChatApi(page, incorrectAnswerResponse);

    await chatPage.sendMessage('Die Katze ist gross.');
    await chatPage.waitForResponse();

    // Find and click first tip
    const tipButton = page.locator('button').filter({ hasText: /tip 1/i });
    await tipButton.click();

    // Explanation content should be visible
    await expect(page.getByText(/klein.*means small/i)).toBeVisible();
  });

  test('shows next exercise after submitting answer', async ({
    chatPage,
    page,
  }) => {
    await chatPage.waitForResponse();

    await page.unroute('**/api/chat');
    await mockChatApi(page, correctAnswerResponse);

    await chatPage.sendMessage('Die Katze ist klein.');
    await chatPage.waitForResponse();

    // New exercise should appear
    await expect(page.getByText(/I drink water/i)).toBeVisible();
  });
});

test.describe('Chat Loading States', () => {
  test('shows loading indicator while waiting for response', async ({
    signInPage,
    homePage,
    mockHoney,
    chatPage,
    page,
  }) => {
    await mockHoney(5);
    await mockChatHistoryApi(page, { hasHistory: false });

    // Set up slow mock
    await page.route('**/api/chat', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify(greetingResponse),
      });
    });

    await signInPage.goto();
    await signInPage.devLogin();
    await homePage.fillOnboardingForm({ name: 'Test', age: '25' });
    await homePage.startChat();

    // Loading should be visible during the delay
    await expect(chatPage.loadingIndicator).toBeVisible();
  });
});
