import { test as base, Browser, BrowserContext, Page } from '@playwright/test';
import { AuthHelper } from '../utils/auth';

/**
 * Extended test fixtures with multi-user support
 */
type MultiUserFixtures = {
  contextUserX: BrowserContext;
  contextUserY: BrowserContext;
  pageUserX: Page;
  pageUserY: Page;
};

/**
 * Custom fixtures for multi-user scenarios
 * Allows running actions as different users in the same test
 */
export const test = base.extend<MultiUserFixtures>({
  /**
   * Browser context for User X with authenticated state
   */
  contextUserX: async ({ browser }, use) => {
    const storageStatePath = AuthHelper.getStorageStatePath('userX');
    const context = await browser.newContext({
      storageState: storageStatePath,
    });
    await use(context);
    await context.close();
  },

  /**
   * Browser context for User Y with authenticated state
   */
  contextUserY: async ({ browser }, use) => {
    const storageStatePath = AuthHelper.getStorageStatePath('userY');
    const context = await browser.newContext({
      storageState: storageStatePath,
    });
    await use(context);
    await context.close();
  },

  /**
   * Page instance for User X
   */
  pageUserX: async ({ contextUserX }, use) => {
    const page = await contextUserX.newPage();
    await use(page);
    await page.close();
  },

  /**
   * Page instance for User Y
   */
  pageUserY: async ({ contextUserY }, use) => {
    const page = await contextUserY.newPage();
    await use(page);
    await page.close();
  },
});

export { expect } from '@playwright/test';
