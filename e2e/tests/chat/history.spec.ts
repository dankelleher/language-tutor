import { test, expect } from '../../fixtures/index.js';
import { greetingResponse } from '../../mocks/ai-responses.js';
import { mockChatHistoryApi } from '../../mocks/handlers.js';

test.describe('Chat History', () => {
  test('loads existing chat history on page load', async ({
    signInPage,
    homePage,
    chatPage,
    mockHoney,
    page,
  }) => {
    await mockHoney(3);
    await mockChatHistoryApi(page, {
      hasHistory: true,
      language: 'German',
      level: 'A1',
    });

    await signInPage.goto();
    await signInPage.devLogin();

    // Should show chat interface, not onboarding
    await homePage.expectOnboardingNotVisible();
    await chatPage.expectChatInterfaceVisible();
  });

  test('restores language from previous session', async ({
    signInPage,
    homePage,
    mockHoney,
    page,
  }) => {
    await mockHoney(3);
    await mockChatHistoryApi(page, {
      hasHistory: true,
      language: 'French',
      level: 'A2',
    });

    await signInPage.goto();
    await signInPage.devLogin();

    // Should skip onboarding
    await homePage.expectOnboardingNotVisible();
  });

  test('starting new chat shows onboarding form', async ({
    signInPage,
    homePage,
    chatPage,
    mockChatResponse,
    mockHoney,
    page,
  }) => {
    await mockChatResponse(greetingResponse);
    await mockHoney(3);
    await mockChatHistoryApi(page, {
      hasHistory: true,
      language: 'German',
      level: 'A1',
    });

    await signInPage.goto();
    await signInPage.devLogin();

    // Should be in chat mode
    await homePage.expectOnboardingNotVisible();

    // Start new chat
    await chatPage.startNewChat();

    // Should show onboarding form again
    await homePage.expectOnboardingVisible();
  });

  test('new chat clears previous messages', async ({
    signInPage,
    homePage,
    chatPage,
    mockChatResponse,
    mockHoney,
    page,
  }) => {
    await mockChatResponse(greetingResponse);
    await mockHoney(3);
    await mockChatHistoryApi(page, {
      hasHistory: true,
      language: 'German',
      level: 'B1',
    });

    await signInPage.goto();
    await signInPage.devLogin();

    // Start new chat
    await chatPage.startNewChat();

    // Mock no history for the fresh state
    await page.unroute('**/api/chat/history*');
    await mockChatHistoryApi(page, { hasHistory: false });

    // Fill onboarding
    await homePage.fillOnboardingForm({ name: 'New User', age: '30' });
    await homePage.startChat();
    await chatPage.waitForResponse();

    // Should start fresh at A1
    const level = await chatPage.getCurrentLevel();
    expect(level).toBe('A1');
  });
});
