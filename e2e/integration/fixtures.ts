import { test as base } from '@playwright/test';
import { SignInPage } from '../pages/signin.page.js';
import { HomePage } from '../pages/home.page.js';
import { ChatPage } from '../pages/chat.page.js';
import { DatabaseFixture } from '../fixtures/database.fixture.js';

/**
 * Integration test fixtures that use the real database.
 * These tests require Docker test database to be running.
 */
interface IntegrationFixtures {
  signInPage: SignInPage;
  homePage: HomePage;
  chatPage: ChatPage;
  db: DatabaseFixture;
}

export const test = base.extend<IntegrationFixtures>({
  db: async ({}, use) => {
    const db = new DatabaseFixture();
    // Clean up before each test
    await db.cleanup();
    await use(db);
    // Clean up after each test
    await db.cleanup();
    await db.disconnect();
  },

  signInPage: async ({ page }, use) => {
    await use(new SignInPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  chatPage: async ({ page }, use) => {
    await use(new ChatPage(page));
  },
});

export { expect } from '@playwright/test';
