import { test, expect } from '@playwright/test';
import { greetingResponse } from '../../mocks/ai-responses.js';
import { mockChatApi, mockHoneyApi, mockChatHistoryApi } from '../../mocks/handlers.js';

// Desktop tests - large viewport
test.use({ viewport: { width: 1280, height: 720 } });

test.describe('Desktop Layout', () => {
  test('displays progress hive with current level on desktop', async ({ page }) => {
    await mockChatApi(page, greetingResponse);
    await mockHoneyApi(page, 5);
    await mockChatHistoryApi(page, { hasHistory: false });

    await page.goto('/auth/signin');
    await page.getByRole('button', { name: /dev login/i }).click();
    await page.getByPlaceholder(/what should we call you/i).fill('Test');
    await page.getByPlaceholder(/how old are you/i).fill('25');
    await page.getByRole('button', { name: /let's buzz/i }).click();

    await page.waitForSelector('textarea');

    // Wait for response to load and progress hive to render
    await page.waitForTimeout(1000);

    // Look for the chat interface and progress elements
    await expect(page.locator('textarea')).toBeVisible();

    // Look for current level indicator in the correction display
    await expect(page.getByText(/current level/i)).toBeVisible();
  });

  test('shows progress steps on desktop', async ({ page }) => {
    await mockChatApi(page, greetingResponse);
    await mockHoneyApi(page, 5);
    await mockChatHistoryApi(page, { hasHistory: false });

    await page.goto('/auth/signin');
    await page.getByRole('button', { name: /dev login/i }).click();
    await page.getByPlaceholder(/what should we call you/i).fill('Test');
    await page.getByPlaceholder(/how old are you/i).fill('25');
    await page.getByRole('button', { name: /let's buzz/i }).click();

    await page.waitForSelector('textarea');

    // Wait for response to load fully
    await page.waitForTimeout(1000);

    // Steps to next level text should be visible on desktop - use .first() for strict mode
    await expect(page.getByText(/step.*to/i).first()).toBeVisible();
  });
});
