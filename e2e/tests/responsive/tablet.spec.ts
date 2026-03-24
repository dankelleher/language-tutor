import { test, expect } from '@playwright/test';
import { greetingResponse } from '../../mocks/ai-responses.js';
import { mockChatApi, mockHoneyApi, mockChatHistoryApi } from '../../mocks/handlers.js';

// Tablet tests - use tablet viewport size
test.use({ viewport: { width: 768, height: 1024 } }); // iPad Mini size

test.describe('Tablet Layout', () => {
  test('displays properly on tablet', async ({ page }) => {
    await mockChatApi(page, greetingResponse);
    await mockHoneyApi(page, 5);
    await mockChatHistoryApi(page, { hasHistory: false });

    await page.goto('/auth/signin');
    await page.getByRole('button', { name: /dev login/i }).click();
    await page.getByPlaceholder(/what should we call you/i).fill('Test');
    await page.getByPlaceholder(/how old are you/i).fill('25');
    await page.getByRole('button', { name: /let's buzz/i }).click();

    await page.waitForSelector('textarea');

    // Chat interface should be visible
    await expect(page.locator('textarea')).toBeVisible();
  });
});
