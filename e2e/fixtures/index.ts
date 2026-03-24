import { test as base, expect } from '@playwright/test';
import { SignInPage } from '../pages/signin.page.js';
import { HomePage } from '../pages/home.page.js';
import { ChatPage } from '../pages/chat.page.js';
import { mockChatApi, mockHoneyApi, mockChatHistoryApi } from '../mocks/handlers.js';
import type { TutorResponse } from '../../lib/types.js';

type TestFixtures = {
  signInPage: SignInPage;
  homePage: HomePage;
  chatPage: ChatPage;
  mockChatResponse: (response: TutorResponse) => Promise<void>;
  mockHoney: (balance: number) => Promise<void>;
  mockNoHistory: () => Promise<void>;
};

/**
 * Extended test fixture with page objects and mock helpers
 */
export const test = base.extend<TestFixtures>({
  signInPage: async ({ page }, use) => {
    await use(new SignInPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  chatPage: async ({ page }, use) => {
    await use(new ChatPage(page));
  },

  mockChatResponse: async ({ page }, use) => {
    const mock = async (response: TutorResponse) => {
      await mockChatApi(page, response);
    };
    await use(mock);
  },

  mockHoney: async ({ page }, use) => {
    const mock = async (balance: number) => {
      await mockHoneyApi(page, balance);
    };
    await use(mock);
  },

  mockNoHistory: async ({ page }, use) => {
    const mock = async () => {
      await mockChatHistoryApi(page, { hasHistory: false });
    };
    await use(mock);
  },
});

export { expect };
