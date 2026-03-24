import { Page, Locator, expect } from '@playwright/test';

/**
 * Page object for the chat interface
 */
export class ChatPage {
  readonly page: Page;
  readonly chatInput: Locator;
  readonly honeyBalance: Locator;
  readonly userButton: Locator;
  readonly userMenu: Locator;
  readonly newChatButton: Locator;
  readonly signOutButton: Locator;
  readonly correctionDisplay: Locator;
  readonly nextExercise: Locator;
  readonly loadingIndicator: Locator;
  readonly levelIndicator: Locator;
  readonly celebrationOverlay: Locator;
  readonly progressHive: Locator;
  readonly explanationTips: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chatInput = page.locator('textarea').first();
    this.honeyBalance = page.locator('[data-testid="honey-balance"]');
    // User button shows initials (2 capital letters)
    this.userButton = page.locator('button').filter({ hasText: /^[A-Z]{1,2}$/ });
    this.userMenu = page.locator('.absolute.right-0');
    this.newChatButton = page.getByRole('button', {
      name: /new chat session/i,
    });
    this.signOutButton = page.getByRole('button', { name: /sign out/i });
    // The correction display area
    this.correctionDisplay = page.locator('.space-y-6').first();
    // Next exercise card with gradient
    this.nextExercise = page.locator('.bg-gradient-to-r').filter({
      hasText: /translate/i,
    });
    this.loadingIndicator = page.getByText(/buzzing away/i);
    // Level badge (bg-amber-400/80 in actual component)
    this.levelIndicator = page.locator('[class*="bg-amber-400"]').filter({
      hasText: /^[ABC][12]$/,
    });
    this.celebrationOverlay = page.getByText(/level up/i);
    this.progressHive = page.locator('[data-testid="progress-hive"]');
    this.explanationTips = page.locator('button').filter({ hasText: /tip/i });
  }

  async sendMessage(message: string): Promise<void> {
    await this.chatInput.fill(message);
    await this.chatInput.press('Enter');
  }

  async waitForResponse(timeout: number = 30000): Promise<void> {
    // Wait for loading to appear and disappear
    await this.loadingIndicator
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {
        // Loading might be too fast to catch
      });
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout });
  }

  async expectChatInterfaceVisible(): Promise<void> {
    await expect(this.chatInput).toBeVisible();
  }

  async expectCorrectionVisible(): Promise<void> {
    await expect(this.correctionDisplay).toBeVisible();
  }

  async expectNextExerciseVisible(): Promise<void> {
    await expect(this.nextExercise).toBeVisible();
  }

  async getCurrentLevel(): Promise<string> {
    const levelText = await this.levelIndicator.textContent();
    return levelText ?? '';
  }

  async getHoneyCount(): Promise<number> {
    const honeyElement = this.page.locator('img[alt*="honey"], img[src*="coin"]')
      .locator('..')
      .locator('span');
    const text = await honeyElement.first().textContent();
    return parseInt(text ?? '0', 10);
  }

  async clickHintWord(wordIndex: number = 0): Promise<void> {
    const hintButtons = this.page.locator('button.underline');
    await hintButtons.nth(wordIndex).click();
  }

  async confirmHintPurchase(): Promise<void> {
    await this.page.getByRole('button', { name: /spend 1 honey/i }).click();
  }

  async cancelHintPurchase(): Promise<void> {
    await this.page.getByRole('button', { name: /cancel|no/i }).click();
  }

  async openUserMenu(): Promise<void> {
    await this.userButton.click();
  }

  async startNewChat(): Promise<void> {
    await this.openUserMenu();
    await this.newChatButton.click();
  }

  async signOut(): Promise<void> {
    await this.openUserMenu();
    await this.signOutButton.click();
    await this.page.waitForURL('/auth/signin');
  }

  async expectCelebrationVisible(): Promise<void> {
    await expect(this.celebrationOverlay).toBeVisible();
  }

  async waitForCelebrationToEnd(timeout: number = 5000): Promise<void> {
    await this.celebrationOverlay.waitFor({ state: 'hidden', timeout });
  }

  async expandExplanation(tipIndex: number = 0): Promise<void> {
    await this.explanationTips.nth(tipIndex).click();
  }

  async expectExplanationExpanded(): Promise<void> {
    // Look for expanded content (explanation text visible)
    await expect(
      this.page.locator('.overflow-hidden').filter({ hasText: /.{20,}/ })
    ).toBeVisible();
  }
}
