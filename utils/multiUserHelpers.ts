import { Page, BrowserContext } from '@playwright/test';

/**
 * Multi-user testing utilities
 * Helper functions for common multi-user testing scenarios
 */
export class MultiUserHelper {
  /**
   * Create multiple pages for a single user context
   * Useful for testing multi-tab scenarios
   */
  static async createMultipleTabs(
    context: BrowserContext,
    count: number
  ): Promise<Page[]> {
    const pages: Page[] = [];
    for (let i = 0; i < count; i++) {
      pages.push(await context.newPage());
    }
    return pages;
  }

  /**
   * Close all pages in an array
   */
  static async closeAllPages(pages: Page[]): Promise<void> {
    await Promise.all(pages.map(page => page.close()));
  }

  /**
   * Execute actions in parallel for multiple pages
   */
  static async executeInParallel<T>(
    actions: Array<() => Promise<T>>
  ): Promise<T[]> {
    return await Promise.all(actions.map(action => action()));
  }

  /**
   * Execute actions sequentially
   */
  static async executeSequentially<T>(
    actions: Array<() => Promise<T>>
  ): Promise<T[]> {
    const results: T[] = [];
    for (const action of actions) {
      results.push(await action());
    }
    return results;
  }

  /**
   * Wait for a condition to be true on multiple pages
   */
  static async waitForConditionOnAllPages(
    pages: Page[],
    condition: (page: Page) => Promise<boolean>,
    timeout: number = 5000
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const results = await Promise.all(
        pages.map(page => condition(page))
      );
      
      if (results.every(result => result === true)) {
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false;
  }

  /**
   * Get screenshots from all pages
   */
  static async screenshotAllPages(
    pages: Page[],
    baseName: string
  ): Promise<void> {
    await Promise.all(
      pages.map((page, index) =>
        page.screenshot({ path: `${baseName}-page-${index + 1}.png` })
      )
    );
  }

  /**
   * Navigate all pages to the same URL
   */
  static async navigateAllPages(pages: Page[], url: string): Promise<void> {
    await Promise.all(pages.map(page => page.goto(url)));
  }

  /**
   * Wait for network idle on all pages
   */
  static async waitForNetworkIdleOnAllPages(pages: Page[]): Promise<void> {
    await Promise.all(
      pages.map(page => page.waitForLoadState('networkidle'))
    );
  }

  /**
   * Check if all pages have a specific element visible
   */
  static async allPagesHaveElement(
    pages: Page[],
    selector: string
  ): Promise<boolean> {
    try {
      await Promise.all(
        pages.map(page =>
          page.waitForSelector(selector, { state: 'visible', timeout: 5000 })
        )
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Execute a function on all pages and collect results
   */
  static async mapPages<T>(
    pages: Page[],
    fn: (page: Page, index: number) => Promise<T>
  ): Promise<T[]> {
    return await Promise.all(pages.map((page, index) => fn(page, index)));
  }

  /**
   * Get console messages from all pages
   */
  static setupConsoleLogging(pages: Page[], prefix: string = ''): void {
    pages.forEach((page, index) => {
      page.on('console', msg => {
        console.log(`${prefix}[Page ${index + 1}] ${msg.type()}: ${msg.text()}`);
      });
    });
  }

  /**
   * Create a synchronized action across multiple pages
   * Waits for all pages to be ready before executing
   */
  static async synchronizedAction(
    pages: Page[],
    prepareAction: (page: Page) => Promise<void>,
    executeAction: (page: Page) => Promise<void>
  ): Promise<void> {
    // Prepare all pages
    await Promise.all(pages.map(page => prepareAction(page)));
    
    // Execute action on all pages simultaneously
    await Promise.all(pages.map(page => executeAction(page)));
  }
}

/**
 * Session comparison utilities
 */
export class SessionHelper {
  /**
   * Verify that two pages have different sessions
   */
  static async verifyDifferentSessions(
    page1: Page,
    page2: Page
  ): Promise<boolean> {
    const cookies1 = await page1.context().cookies();
    const cookies2 = await page2.context().cookies();
    
    const sessionCookie1 = cookies1.find(c => 
      c.name.toLowerCase().includes('session') || 
      c.name.toLowerCase().includes('auth')
    );
    const sessionCookie2 = cookies2.find(c => 
      c.name.toLowerCase().includes('session') || 
      c.name.toLowerCase().includes('auth')
    );
    
    if (!sessionCookie1 || !sessionCookie2) {
      return true; // If no session cookies found, consider them different
    }
    
    return sessionCookie1.value !== sessionCookie2.value;
  }

  /**
   * Get storage state summary for a page
   */
  static async getStorageStateSummary(page: Page): Promise<{
    cookieCount: number;
    localStorageKeys: number;
    sessionStorageKeys: number;
  }> {
    const cookies = await page.context().cookies();
    
    const localStorage = await page.evaluate(() => {
      return Object.keys(window.localStorage).length;
    });
    
    const sessionStorage = await page.evaluate(() => {
      return Object.keys(window.sessionStorage).length;
    });
    
    return {
      cookieCount: cookies.length,
      localStorageKeys: localStorage,
      sessionStorageKeys: sessionStorage,
    };
  }
}

/**
 * Timing utilities for multi-user coordination
 */
export class TimingHelper {
  /**
   * Execute action after a delay
   */
  static async delayedAction<T>(
    action: () => Promise<T>,
    delayMs: number
  ): Promise<T> {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    return await action();
  }

  /**
   * Execute multiple actions with staggered timing
   */
  static async staggeredActions<T>(
    actions: Array<() => Promise<T>>,
    staggerMs: number
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < actions.length; i++) {
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, staggerMs));
      }
      results.push(await actions[i]());
    }
    
    return results;
  }

  /**
   * Race condition testing: execute actions at the exact same time
   */
  static async simultaneousActions<T>(
    actions: Array<() => Promise<T>>
  ): Promise<T[]> {
    return await Promise.all(actions.map(action => action()));
  }
}
