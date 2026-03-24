import { test, expect } from '../../fixtures/index.js';
import { mockChatHistoryApi } from '../../mocks/handlers.js';

test.describe('Sign In Page', () => {
  test.beforeEach(async ({ signInPage }) => {
    await signInPage.goto();
  });

  test('displays sign-in page correctly', async ({ signInPage }) => {
    await signInPage.expectPageDisplayedCorrectly();
  });

  test('shows email input field', async ({ signInPage }) => {
    await expect(signInPage.emailInput).toBeVisible();
    await expect(signInPage.emailInput).toBeEditable();
  });

  test('submit button is disabled without email', async ({ signInPage }) => {
    await expect(signInPage.submitButton).toBeDisabled();
  });

  test('submit button is enabled with valid email', async ({ signInPage }) => {
    await signInPage.fillEmail('test@example.com');
    await expect(signInPage.submitButton).toBeEnabled();
  });

  test('dev login button is visible in dev mode', async ({ signInPage }) => {
    await expect(signInPage.devLoginButton).toBeVisible();
  });

  test('dev login redirects to home page', async ({ signInPage, page }) => {
    // Mock no history so we see onboarding
    await mockChatHistoryApi(page, { hasHistory: false });

    await signInPage.devLogin();
    await expect(page).toHaveURL('/');
  });

  test('email submission triggers signin process', async ({
    signInPage,
    page,
  }) => {
    await signInPage.fillEmail('test@example.com');
    await signInPage.submitEmail();

    // The button should show loading state or redirect (depending on email provider config)
    // Just verify the form was submitted - either shows loading or navigates away
    await page.waitForTimeout(1000);

    // Either button shows "Sending..." or we've navigated away
    const isLoading = await page.getByText('Sending...').isVisible().catch(() => false);
    const hasNavigated = !page.url().endsWith('/auth/signin');

    expect(isLoading || hasNavigated).toBe(true);
  });
});

test.describe('Sign In Validation', () => {
  test('rejects invalid email format', async ({ signInPage }) => {
    await signInPage.goto();
    await signInPage.fillEmail('notanemail');

    // HTML5 validation should keep button disabled or show error
    await signInPage.submitEmail();

    // Should still be on sign-in page
    await signInPage.expectToBeOnPage();
  });
});
