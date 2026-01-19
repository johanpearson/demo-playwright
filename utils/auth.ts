import { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

/**
 * User credentials interface
 */
export interface UserCredentials {
  username: string;
  password: string;
  role?: string;
}

/**
 * Authentication utilities for managing user sessions
 */
export class AuthHelper {
  /**
   * Authenticate a user and return the storage state
   */
  static async authenticate(page: Page, credentials: UserCredentials): Promise<void> {
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(credentials.username, credentials.password);
    
    // Wait for navigation after login
    await page.waitForLoadState('networkidle');
  }

  /**
   * Save authentication state to file
   */
  static async saveAuthState(page: Page, filePath: string): Promise<void> {
    await page.context().storageState({ path: filePath });
  }

  /**
   * Get storage state path for a user
   */
  static getStorageStatePath(userIdentifier: string): string {
    return `.auth/${userIdentifier}.json`;
  }
}

/**
 * Predefined user credentials for testing
 * In real scenarios, these should come from environment variables or secure storage
 */
export const TEST_USERS = {
  userX: {
    username: 'userx@example.com',
    password: 'passwordX123',
    role: 'user',
  },
  userY: {
    username: 'usery@example.com',
    password: 'passwordY123',
    role: 'admin',
  },
  admin: {
    username: 'admin@example.com',
    password: 'adminPass123',
    role: 'admin',
  },
} as const;
