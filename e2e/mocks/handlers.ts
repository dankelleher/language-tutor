import type { Page, Route } from '@playwright/test';
import type { TutorResponse } from '../../lib/types.js';

/**
 * Sets up a mock for the chat API endpoint.
 * Returns the provided TutorResponse as JSON.
 */
export const mockChatApi = async (
  page: Page,
  response: TutorResponse,
  options?: {
    sessionId?: string;
    delay?: number;
  }
): Promise<void> => {
  await page.route('**/api/chat', async (route: Route) => {
    if (options?.delay) {
      await new Promise((resolve) => setTimeout(resolve, options.delay));
    }

    await route.fulfill({
      status: 200,
      contentType: 'text/plain; charset=utf-8',
      headers: {
        'X-Chat-Session-Id': options?.sessionId ?? 'mock-session-123',
      },
      body: JSON.stringify(response),
    });
  });
};

/**
 * Sets up a mock for the honey balance API endpoint.
 */
export const mockHoneyApi = async (
  page: Page,
  honey: number
): Promise<void> => {
  await page.route('**/api/user/honey', async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ honey }),
      });
    } else {
      await route.continue();
    }
  });
};

/**
 * Sets up a mock for the honey spend API endpoint.
 */
export const mockHoneySpendApi = async (
  page: Page,
  options?: {
    success?: boolean;
    newBalance?: number;
  }
): Promise<void> => {
  await page.route('**/api/user/honey/spend', async (route: Route) => {
    if (options?.success === false) {
      // Component expects 402 for insufficient honey
      await route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not enough honey' }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          honey: options?.newBalance ?? 2,
        }),
      });
    }
  });
};

/**
 * Sets up a mock for the chat history API endpoint.
 */
export const mockChatHistoryApi = async (
  page: Page,
  options?: {
    hasHistory?: boolean;
    language?: string;
    level?: string;
  }
): Promise<void> => {
  await page.route('**/api/chat/history*', async (route: Route) => {
    if (options?.hasHistory) {
      // Component expects data.session and data.messages
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session: {
            id: 'mock-session-123',
            language: options?.language ?? 'German',
            level: {
              overallLevel: options?.level ?? 'A1',
              categoryLevels: [],
              stepsToNextLevel: 3,
            },
          },
          messages: [
            {
              id: 'msg-1',
              role: 'user',
              content: 'Hello',
            },
            {
              id: 'msg-2',
              role: 'assistant',
              content: {
                chatMessage: 'Welcome back!',
                englishSentence: '',
                submittedSentence: '',
                correctedResponse: '',
                explanations: [],
                nextExercise: {
                  fullSentence: 'Continue learning.',
                  parts: [],
                },
                progress: {
                  overallLevel: options?.level ?? 'A1',
                  categoryLevels: [],
                  stepsToNextLevel: 3,
                },
              },
            },
          ],
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session: null,
          messages: [],
        }),
      });
    }
  });
};

/**
 * Clears all route mocks from a page.
 */
export const clearMocks = async (page: Page): Promise<void> => {
  await page.unroute('**/api/chat');
  await page.unroute('**/api/user/honey');
  await page.unroute('**/api/user/honey/spend');
  await page.unroute('**/api/chat/history*');
};
