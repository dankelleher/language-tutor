import { test, expect } from './fixtures.js';

test.describe('Authentication Integration', () => {
  test('dev login creates user in database and redirects to home', async ({
    signInPage,
    db,
    page,
  }) => {
    // Seed a test user with initial honey
    await db.seedTestUser({ honey: 5 });

    await signInPage.goto();
    await signInPage.devLogin();

    // Should redirect to home page
    await expect(page).toHaveURL('/');

    // User should have honey from database
    const honey = await db.getHoneyBalance('dev-user');
    expect(honey).toBe(5);
  });

  test('sign out redirects to signin page', async ({
    signInPage,
    homePage,
    chatPage,
    db,
    page,
  }) => {
    await db.seedTestUser({ honey: 5 });

    await signInPage.goto();
    await signInPage.devLogin();

    // Complete onboarding
    await homePage.fillOnboardingForm({ name: 'Test', age: '25' });
    await homePage.startChat();
    await chatPage.waitForResponse();

    // Sign out
    await chatPage.openUserMenu();
    await chatPage.signOut();

    // Should redirect to signin
    await expect(page).toHaveURL(/signin/);
  });
});
