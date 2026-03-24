import { test, expect } from '@playwright/test';
import { greetingResponse } from '../../mocks/ai-responses.js';
import { mockChatApi, mockHoneyApi, mockChatHistoryApi, mockHoneySpendApi } from '../../mocks/handlers.js';

// Mobile tests - use mobile viewport size
test.use({ viewport: { width: 390, height: 844 } }); // iPhone 12 size

test.describe('Mobile Layout', () => {
  test.beforeEach(async ({ page }) => {
    await mockChatApi(page, greetingResponse);
    await mockHoneyApi(page, 5);
    await mockChatHistoryApi(page, { hasHistory: false });
  });

  test('chat input is accessible on mobile', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.getByRole('button', { name: /dev login/i }).click();
    await page.getByPlaceholder(/what should we call you/i).fill('Test');
    await page.getByPlaceholder(/how old are you/i).fill('25');
    await page.getByRole('button', { name: /let's buzz/i }).click();

    await page.waitForSelector('textarea');

    const input = page.locator('textarea');
    await expect(input).toBeVisible();
  });

  test('can type in chat input on mobile', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.getByRole('button', { name: /dev login/i }).click();
    await page.getByPlaceholder(/what should we call you/i).fill('Test');
    await page.getByPlaceholder(/how old are you/i).fill('25');
    await page.getByRole('button', { name: /let's buzz/i }).click();

    await page.waitForSelector('textarea');

    const input = page.locator('textarea');
    await input.fill('Die Katze ist klein.');
    await expect(input).toHaveValue('Die Katze ist klein.');
  });

  test('onboarding form works on mobile', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.getByRole('button', { name: /dev login/i }).click();

    // Verify all form elements are visible
    await expect(page.getByPlaceholder(/what should we call you/i)).toBeVisible();
    await expect(page.getByPlaceholder(/how old are you/i)).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /let's buzz/i })).toBeVisible();
  });
});
