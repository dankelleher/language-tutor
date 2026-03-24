import { test, expect } from '../../fixtures/index.js';
import { greetingResponse } from '../../mocks/ai-responses.js';
import { mockChatHistoryApi } from '../../mocks/handlers.js';

test.describe('Sign Out Flow', () => {
  test.beforeEach(async ({
    signInPage,
    homePage,
    chatPage,
    mockChatResponse,
    mockHoney,
    page,
  }) => {
    // Set up mocks
    await mockChatResponse(greetingResponse);
    await mockHoney(5);
    await mockChatHistoryApi(page, { hasHistory: false });

    // Sign in and complete onboarding
    await signInPage.goto();
    await signInPage.devLogin();
    await homePage.fillOnboardingForm({ name: 'Test', age: '25' });
    await homePage.startChat();
    await chatPage.waitForResponse();
  });

  test('user menu is accessible', async ({ chatPage }) => {
    await chatPage.openUserMenu();
    await expect(chatPage.signOutButton).toBeVisible();
  });

  test('user can sign out from chat', async ({ chatPage, page }) => {
    await chatPage.signOut();
    await expect(page).toHaveURL('/auth/signin');
  });

  test('home page is not accessible after sign out', async ({
    chatPage,
    page,
  }) => {
    await chatPage.signOut();

    // Try to go back to home
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Should either redirect to sign-in or show sign-in page content
    const isOnSignIn = page.url().includes('/auth/signin');
    const hasSignInContent = await page.getByText(/join the hive|send me a magic link/i).isVisible().catch(() => false);

    expect(isOnSignIn || hasSignInContent).toBe(true);
  });

  test('new chat session option is available', async ({ chatPage }) => {
    await chatPage.openUserMenu();
    await expect(chatPage.newChatButton).toBeVisible();
  });
});
