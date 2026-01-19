import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage - Handles login functionality
 */
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    
    // Define locators for login page elements
    // NOTE: These are generic fallback locators for demonstration purposes.
    // In a real project, replace these with application-specific selectors,
    // preferably using data-testid attributes for stability:
    // Example: this.usernameInput = page.locator('[data-testid="username-input"]');
    this.usernameInput = page.locator('input[name="username"], input[id="username"], input[type="email"]').first();
    this.passwordInput = page.locator('input[name="password"], input[id="password"], input[type="password"]').first();
    this.loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
    this.errorMessage = page.locator('.error, .error-message, [role="alert"]').first();
  }

  /**
   * Navigate to login page
   */
  async navigate(): Promise<void> {
    await this.goto('/login');
  }

  /**
   * Perform login action
   */
  async login(username: string, password: string): Promise<void> {
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await this.clickElement(this.loginButton);
  }

  /**
   * Check if login was successful (no error message)
   */
  async isLoginSuccessful(): Promise<boolean> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 2000 });
      return false;
    } catch {
      return true;
    }
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.getElementText(this.errorMessage);
  }
}
