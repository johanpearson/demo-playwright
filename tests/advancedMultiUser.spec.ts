import { test, expect } from '../fixtures/multiUserFixtures';
import { DashboardPage } from '../pages/DashboardPage';
import { MultiUserHelper, SessionHelper, TimingHelper } from '../utils/multiUserHelpers';

/**
 * Advanced multi-user test examples using helper utilities
 */

test.describe('Advanced Multi-User Scenarios', () => {
  test('Multiple tabs for User X with helper utilities', async ({ contextUserX }) => {
    // Create 3 tabs for User X
    const tabs = await MultiUserHelper.createMultipleTabs(contextUserX, 3);
    
    // Setup console logging for all tabs
    MultiUserHelper.setupConsoleLogging(tabs, 'UserX');
    
    // Navigate all tabs to dashboard in parallel
    await MultiUserHelper.navigateAllPages(tabs, '/dashboard');
    
    // Wait for all pages to be ready
    await MultiUserHelper.waitForNetworkIdleOnAllPages(tabs);
    
    // Verify all tabs are on the dashboard
    const allOnDashboard = await MultiUserHelper.allPagesHaveElement(
      tabs,
      'main, .main-content, [role="main"]'
    );
    expect(allOnDashboard).toBeTruthy();
    
    // Execute different actions on each tab
    const dashboards = tabs.map(tab => new DashboardPage(tab));
    const results = await MultiUserHelper.executeInParallel([
      () => dashboards[0].verifyDashboardLoaded(),
      () => dashboards[1].verifyDashboardLoaded(),
      () => dashboards[2].verifyDashboardLoaded(),
    ]);
    
    expect(results.every(r => r === true)).toBeTruthy();
    
    // Take screenshots of all tabs
    await MultiUserHelper.screenshotAllPages(tabs, 'userx-tabs');
    
    // Clean up
    await MultiUserHelper.closeAllPages(tabs);
  });

  test('Verify users have different sessions', async ({ pageUserX, pageUserY }) => {
    // Navigate both users to dashboard
    const dashX = new DashboardPage(pageUserX);
    const dashY = new DashboardPage(pageUserY);
    
    await dashX.navigate();
    await dashY.navigate();
    
    // Verify they have different sessions
    const haveDifferentSessions = await SessionHelper.verifyDifferentSessions(
      pageUserX,
      pageUserY
    );
    expect(haveDifferentSessions).toBeTruthy();
    
    // Get storage state summaries
    const storageX = await SessionHelper.getStorageStateSummary(pageUserX);
    const storageY = await SessionHelper.getStorageStateSummary(pageUserY);
    
    console.log('User X storage:', storageX);
    console.log('User Y storage:', storageY);
  });

  test('Staggered actions between users', async ({ pageUserX, pageUserY }) => {
    const dashX = new DashboardPage(pageUserX);
    const dashY = new DashboardPage(pageUserY);
    
    // Execute actions with a stagger (User X first, then User Y after 1 second)
    const results = await TimingHelper.staggeredActions([
      async () => {
        await dashX.navigate();
        return await dashX.isLoggedIn();
      },
      async () => {
        await dashY.navigate();
        return await dashY.isLoggedIn();
      },
    ], 1000);
    
    expect(results).toEqual([true, true]);
  });

  test('Simultaneous actions (race condition)', async ({ pageUserX, pageUserY }) => {
    const dashX = new DashboardPage(pageUserX);
    const dashY = new DashboardPage(pageUserY);
    
    // Both users navigate at exactly the same time
    const results = await TimingHelper.simultaneousActions([
      () => dashX.navigate(),
      () => dashY.navigate(),
    ]);
    
    // Both should succeed
    expect(results).toHaveLength(2);
    
    // Verify both are logged in
    const [isXLoggedIn, isYLoggedIn] = await TimingHelper.simultaneousActions([
      () => dashX.isLoggedIn(),
      () => dashY.isLoggedIn(),
    ]);
    
    expect(isXLoggedIn).toBeTruthy();
    expect(isYLoggedIn).toBeTruthy();
  });

  test('Complex multi-tab workflow with User X and User Y', async ({ contextUserX, contextUserY }) => {
    // User X opens 2 tabs
    const tabsX = await MultiUserHelper.createMultipleTabs(contextUserX, 2);
    // User Y opens 1 tab
    const tabsY = await MultiUserHelper.createMultipleTabs(contextUserY, 1);
    
    const allTabs = [...tabsX, ...tabsY];
    
    // Setup logging for all tabs
    MultiUserHelper.setupConsoleLogging(tabsX, 'UserX');
    MultiUserHelper.setupConsoleLogging(tabsY, 'UserY');
    
    // Navigate all tabs to dashboard
    await MultiUserHelper.navigateAllPages(allTabs, '/dashboard');
    
    // Create page objects
    const dashX1 = new DashboardPage(tabsX[0]);
    const dashX2 = new DashboardPage(tabsX[1]);
    const dashY1 = new DashboardPage(tabsY[0]);
    
    // Execute synchronized action across all tabs
    await MultiUserHelper.synchronizedAction(
      allTabs,
      // Prepare: wait for page load
      async (page) => {
        await page.waitForLoadState('networkidle');
      },
      // Execute: verify dashboard
      async (page) => {
        const dashboard = new DashboardPage(page);
        await dashboard.verifyDashboardLoaded();
      }
    );
    
    // Verify all are logged in
    const loginStatuses = await MultiUserHelper.mapPages(
      allTabs,
      async (page) => {
        const dashboard = new DashboardPage(page);
        return await dashboard.isLoggedIn();
      }
    );
    
    expect(loginStatuses.every(status => status === true)).toBeTruthy();
    
    // Take screenshot of all tabs
    await MultiUserHelper.screenshotAllPages(allTabs, 'complex-workflow');
    
    // Clean up
    await MultiUserHelper.closeAllPages(allTabs);
  });

  test('Delayed action pattern', async ({ pageUserX, pageUserY }) => {
    const dashX = new DashboardPage(pageUserX);
    const dashY = new DashboardPage(pageUserY);
    
    // User X navigates immediately
    await dashX.navigate();
    expect(await dashX.isLoggedIn()).toBeTruthy();
    
    // User Y navigates after a 2-second delay
    const isYLoggedIn = await TimingHelper.delayedAction(
      async () => {
        await dashY.navigate();
        return await dashY.isLoggedIn();
      },
      2000
    );
    
    expect(isYLoggedIn).toBeTruthy();
  });

  test('Wait for condition on all pages', async ({ contextUserX }) => {
    const tabs = await MultiUserHelper.createMultipleTabs(contextUserX, 3);
    
    // Navigate all tabs
    await MultiUserHelper.navigateAllPages(tabs, '/dashboard');
    
    // Wait for all pages to have logged-in state
    const allLoggedIn = await MultiUserHelper.waitForConditionOnAllPages(
      tabs,
      async (page) => {
        const dashboard = new DashboardPage(page);
        return await dashboard.isLoggedIn();
      },
      10000 // 10 second timeout
    );
    
    expect(allLoggedIn).toBeTruthy();
    
    await MultiUserHelper.closeAllPages(tabs);
  });
});
