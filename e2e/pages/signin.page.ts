import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for the sign-in page (/auth/signin)
 */
export class SignInPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly devLoginButton: Locator;
  readonly logo: Locator;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#email');
    this.submitButton = page.getByRole('button', {
      name: /send me a magic link/i,
    });
    this.devLoginButton = page.getByRole('button', { name: /dev login/i });
    this.logo = page.getByRole('img', { name: /buzz/i });
    this.heading = page.getByRole('heading', { name: /sign in/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/auth/signin');
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async submitEmail(): Promise<void> {
    await this.submitButton.click();
  }

  async devLogin(): Promise<void> {
    await this.devLoginButton.click();
    await this.page.waitForURL('/');
  }

  async expectToBeOnPage(): Promise<void> {
    await expect(this.page).toHaveURL('/auth/signin');
  }

  async expectPageDisplayedCorrectly(): Promise<void> {
    await expect(this.logo).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }
}
