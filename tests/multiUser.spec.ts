import { test, expect } from '../fixtures/multiUserFixtures';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * Example test demonstrating multi-user scenarios
 * This test performs actions as User X, then as User Y in the same test
 */

test.describe('Multi-User Scenarios', () => {
  test('User X and User Y can perform actions independently', async ({ pageUserX, pageUserY }) => {
    // Create page objects for both users
    const dashboardUserX = new DashboardPage(pageUserX);
    const dashboardUserY = new DashboardPage(pageUserY);

    // User X navigates to dashboard
    await dashboardUserX.navigate();
    const isUserXLoggedIn = await dashboardUserX.isLoggedIn();
    expect(isUserXLoggedIn).toBeTruthy();

    // User Y navigates to dashboard (in parallel/separate context)
    await dashboardUserY.navigate();
    const isUserYLoggedIn = await dashboardUserY.isLoggedIn();
    expect(isUserYLoggedIn).toBeTruthy();

    // Both users can perform actions simultaneously
    // User X actions
    const userXDashboardLoaded = await dashboardUserX.verifyDashboardLoaded();
    expect(userXDashboardLoaded).toBeTruthy();

    // User Y actions
    const userYDashboardLoaded = await dashboardUserY.verifyDashboardLoaded();
    expect(userYDashboardLoaded).toBeTruthy();
  });

  test('Sequential actions: User X performs action, then User Y', async ({ pageUserX, pageUserY }) => {
    const dashboardUserX = new DashboardPage(pageUserX);
    const dashboardUserY = new DashboardPage(pageUserY);

    // Step 1: User X performs some actions
    await dashboardUserX.navigate();
    const isUserXLoggedIn = await dashboardUserX.isLoggedIn();
    expect(isUserXLoggedIn).toBeTruthy();
    
    // User X completes their task
    const userXDashboardLoaded = await dashboardUserX.verifyDashboardLoaded();
    expect(userXDashboardLoaded).toBeTruthy();

    // Step 2: Later, User Y performs different actions
    await dashboardUserY.navigate();
    const isUserYLoggedIn = await dashboardUserY.isLoggedIn();
    expect(isUserYLoggedIn).toBeTruthy();
    
    // User Y completes their task
    const userYDashboardLoaded = await dashboardUserY.verifyDashboardLoaded();
    expect(userYDashboardLoaded).toBeTruthy();
  });

  test('User X and User Y in separate browser tabs/windows', async ({ contextUserX, contextUserY }) => {
    // Open separate pages (tabs/windows) for each user
    const pageUserX1 = await contextUserX.newPage();
    const pageUserX2 = await contextUserX.newPage();
    const pageUserY1 = await contextUserY.newPage();

    const dashboardUserX1 = new DashboardPage(pageUserX1);
    const dashboardUserX2 = new DashboardPage(pageUserX2);
    const dashboardUserY1 = new DashboardPage(pageUserY1);

    // User X can work in multiple tabs
    await dashboardUserX1.navigate();
    await dashboardUserX2.navigate();

    // User Y works in their own tab
    await dashboardUserY1.navigate();

    // Verify all pages are authenticated correctly
    expect(await dashboardUserX1.isLoggedIn()).toBeTruthy();
    expect(await dashboardUserX2.isLoggedIn()).toBeTruthy();
    expect(await dashboardUserY1.isLoggedIn()).toBeTruthy();

    // Clean up
    await pageUserX1.close();
    await pageUserX2.close();
    await pageUserY1.close();
  });
});
