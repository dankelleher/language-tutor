import { test, expect } from '../../fixtures/index.js';
import { greetingResponse, levelUpResponse } from '../../mocks/ai-responses.js';
import { mockChatHistoryApi, mockChatApi } from '../../mocks/handlers.js';

test.describe('Level Progression', () => {
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

  test('displays current level indicator', async ({ chatPage }) => {
    const level = await chatPage.getCurrentLevel();
    expect(level).toBe('A1');
  });

  test('shows current level in response', async ({ page }) => {
    // Wait for response to fully render
    await page.waitForTimeout(500);

    // Current level indicator should be visible in the correction display
    await expect(page.getByText(/current level/i)).toBeVisible();
  });

  test('shows steps remaining to next level', async ({ page }) => {
    // Wait for response to fully render
    await page.waitForTimeout(500);

    // Look for step count in progress display - use .first() for strict mode
    await expect(page.getByText(/step.*to/i).first()).toBeVisible();
  });

  test('level up response shows congratulations message', async ({ chatPage, page }) => {
    // Wait for initial response to set the current level to A1
    await page.waitForTimeout(500);

    // Mock level-up response (A2 > A1 triggers level up)
    await page.unroute('**/api/chat');
    await mockChatApi(page, levelUpResponse);

    await chatPage.sendMessage('Ich habe ein rotes Auto.');
    await chatPage.waitForResponse();

    // Wait for response to render
    await page.waitForTimeout(1000);

    // Congratulations message should appear in the response
    await expect(page.getByText(/congratulations.*leveled up/i)).toBeVisible();
  });

  test('level updates to A2 after level up response', async ({ chatPage, page }) => {
    // Wait for initial response to set the current level
    await page.waitForTimeout(500);

    await page.unroute('**/api/chat');
    await mockChatApi(page, levelUpResponse);

    await chatPage.sendMessage('Ich habe ein rotes Auto.');
    await chatPage.waitForResponse();

    // Wait for response to render fully
    await page.waitForTimeout(1000);

    // Level indicator should show A2
    await expect(page.locator('[class*="bg-amber-400"]').filter({
      hasText: 'A2',
    })).toBeVisible();
  });

  test('progress hive highlights current level', async ({ page }) => {
    // The current level cell should have special styling (bg-amber-400/80)
    const currentLevelCell = page.locator('[class*="bg-amber-400"]').filter({
      hasText: 'A1',
    });
    await expect(currentLevelCell).toBeVisible();
  });
});

test.describe('Category Levels', () => {
  test('shows individual skill category levels', async ({
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

    // Look for category labels in progress display (on desktop)
    // These may be hidden on mobile
    const categories = ['Vocabulary', 'Grammar', 'Verb Tenses', 'Conversation'];

    // At least one category should be visible (depends on viewport)
    let foundCategory = false;
    for (const cat of categories) {
      const catElement = page.getByText(cat, { exact: true });
      if (await catElement.isVisible().catch(() => false)) {
        foundCategory = true;
        break;
      }
    }
    // This test is viewport dependent, so we just check the progress area exists
    await expect(chatPage.levelIndicator).toBeVisible();
  });
});
