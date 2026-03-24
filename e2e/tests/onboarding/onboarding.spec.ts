import { test, expect } from '../../fixtures/index.js';
import { greetingResponse, frenchGreetingResponse } from '../../mocks/ai-responses.js';
import { mockChatHistoryApi } from '../../mocks/handlers.js';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ signInPage, mockChatResponse, mockHoney, page }) => {
    await mockChatResponse(greetingResponse);
    await mockHoney(3);
    await mockChatHistoryApi(page, { hasHistory: false });
    await signInPage.goto();
    await signInPage.devLogin();
  });

  test('displays onboarding form for new users', async ({ homePage }) => {
    await homePage.expectOnboardingVisible();
  });

  test('shows welcome message', async ({ homePage }) => {
    await expect(homePage.welcomeMessage).toBeVisible();
  });

  test('start button is disabled without name', async ({ homePage }) => {
    await homePage.fillOnboardingForm({ name: '', age: '25' });
    await homePage.expectStartButtonDisabled();
  });

  test('start button is disabled without age', async ({ homePage }) => {
    await homePage.fillOnboardingForm({ name: 'Test User', age: '' });
    await homePage.expectStartButtonDisabled();
  });

  test('start button is enabled with name and age', async ({ homePage }) => {
    await homePage.fillOnboardingForm({ name: 'Test User', age: '25' });
    await homePage.expectStartButtonEnabled();
  });

  test('age input only accepts numbers', async ({ homePage }) => {
    await homePage.ageInput.fill('abc');
    await expect(homePage.ageInput).toHaveValue('');

    await homePage.ageInput.fill('25');
    await expect(homePage.ageInput).toHaveValue('25');
  });

  test('age input is limited to 3 digits', async ({ homePage }) => {
    await homePage.ageInput.fill('12345');
    const value = await homePage.ageInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(3);
  });

  test('can select different target languages', async ({ homePage }) => {
    const languages = ['German', 'French', 'Spanish', 'Italian', 'Japanese'];

    for (const lang of languages) {
      await homePage.targetLanguageSelect.selectOption(lang);
      const selected = await homePage.getSelectedTargetLanguage();
      expect(selected).toBe(lang);
    }
  });

  test('default target language is German', async ({ homePage }) => {
    const selected = await homePage.getSelectedTargetLanguage();
    expect(selected).toBe('German');
  });

  test('default native language is English', async ({ homePage }) => {
    const selected = await homePage.getSelectedNativeLanguage();
    expect(selected).toBe('English');
  });

  test('starting chat hides onboarding and shows chat', async ({
    homePage,
    chatPage,
  }) => {
    await homePage.fillOnboardingForm({ name: 'Test', age: '25' });
    await homePage.startChat();
    await chatPage.waitForResponse();

    await homePage.expectOnboardingNotVisible();
    await chatPage.expectChatInterfaceVisible();
  });

  test('selected language is used for AI response', async ({
    homePage,
    chatPage,
    mockChatResponse,
    page,
  }) => {
    // Change mock to French response
    await mockChatResponse(frenchGreetingResponse);

    await homePage.fillOnboardingForm({
      name: 'Test',
      age: '25',
      targetLanguage: 'French',
    });
    await homePage.startChat();
    await chatPage.waitForResponse();

    // Wait for response to render
    await page.waitForTimeout(500);

    // Verify we got the French response - look for "Le chat" in the translation hints
    // or "Bienvenue" in the greeting
    const hasFrenchContent =
      (await page.getByText(/Le chat/i).isVisible().catch(() => false)) ||
      (await page.getByText(/Bienvenue/i).isVisible().catch(() => false));

    expect(hasFrenchContent).toBe(true);
  });
});

test.describe('Onboarding - Returning User', () => {
  test('skips onboarding if user has chat history', async ({
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

    // Should skip onboarding and go straight to chat
    await homePage.expectOnboardingNotVisible();
    await chatPage.expectChatInterfaceVisible();
  });
});
