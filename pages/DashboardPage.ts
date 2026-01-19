import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * DashboardPage - Handles dashboard functionality
 */
export class DashboardPage extends BasePage {
  readonly welcomeMessage: Locator;
  readonly userProfile: Locator;
  readonly logoutButton: Locator;
  readonly mainContent: Locator;

  constructor(page: Page) {
    super(page);
    
    // Define locators for dashboard elements
    this.welcomeMessage = page.locator('.welcome-message, h1, [data-testid="welcome"]').first();
    this.userProfile = page.locator('.user-profile, [data-testid="user-profile"], .profile').first();
    this.logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")').first();
    this.mainContent = page.locator('main, .main-content, [role="main"]').first();
  }

  /**
   * Navigate to dashboard
   */
  async navigate(): Promise<void> {
    await this.goto('/dashboard');
  }

  /**
   * Get welcome message text
   */
  async getWelcomeMessage(): Promise<string> {
    return await this.getElementText(this.welcomeMessage);
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      await this.userProfile.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Perform logout
   */
  async logout(): Promise<void> {
    await this.clickElement(this.logoutButton);
  }

  /**
   * Verify dashboard is loaded
   */
  async verifyDashboardLoaded(): Promise<boolean> {
    try {
      await this.mainContent.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
