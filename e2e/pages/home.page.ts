import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for the home page (/) with onboarding form
 */
export class HomePage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly ageInput: Locator;
  readonly targetLanguageSelect: Locator;
  readonly nativeLanguageSelect: Locator;
  readonly startButton: Locator;
  readonly welcomeMessage: Locator;
  readonly onboardingForm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByPlaceholder(/what should we call you/i);
    this.ageInput = page.getByPlaceholder(/how old are you/i);
    // The dropdowns - target language is the first select, native is the second
    this.targetLanguageSelect = page.locator('select').first();
    this.nativeLanguageSelect = page.locator('select').nth(1);
    this.startButton = page.getByRole('button', { name: /let's buzz/i });
    this.welcomeMessage = page.getByText(/welcome to the hive/i);
    this.onboardingForm = page.locator('form').filter({ has: this.nameInput });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async fillOnboardingForm(options: {
    name: string;
    age: string;
    targetLanguage?: string;
    nativeLanguage?: string;
  }): Promise<void> {
    await this.nameInput.fill(options.name);
    await this.ageInput.fill(options.age);

    if (options.targetLanguage) {
      await this.targetLanguageSelect.selectOption(options.targetLanguage);
    }
    if (options.nativeLanguage) {
      await this.nativeLanguageSelect.selectOption(options.nativeLanguage);
    }
  }

  async startChat(): Promise<void> {
    await this.startButton.click();
  }

  async expectOnboardingVisible(): Promise<void> {
    await expect(this.welcomeMessage).toBeVisible();
    await expect(this.nameInput).toBeVisible();
    await expect(this.ageInput).toBeVisible();
    await expect(this.startButton).toBeVisible();
  }

  async expectOnboardingNotVisible(): Promise<void> {
    await expect(this.welcomeMessage).not.toBeVisible();
  }

  async expectStartButtonDisabled(): Promise<void> {
    await expect(this.startButton).toBeDisabled();
  }

  async expectStartButtonEnabled(): Promise<void> {
    await expect(this.startButton).toBeEnabled();
  }

  async getSelectedTargetLanguage(): Promise<string> {
    return this.targetLanguageSelect.inputValue();
  }

  async getSelectedNativeLanguage(): Promise<string> {
    return this.nativeLanguageSelect.inputValue();
  }
}
