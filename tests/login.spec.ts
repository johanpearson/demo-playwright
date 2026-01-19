import { test, expect } from '@playwright/test';
import { LoginPage, DashboardPage } from '../pages';

/**
 * Example tests using standard single-user approach
 * These tests demonstrate basic POM usage
 */

test.describe('Single User Login Tests', () => {
  test('User can login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Navigate to login page
    await loginPage.navigate();

    // Perform login
    await loginPage.login('user@example.com', 'password123');

    // Verify login was successful
    const isLoggedIn = await dashboardPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
  });

  test('User can access dashboard after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Login
    await loginPage.navigate();
    await loginPage.login('user@example.com', 'password123');

    // Navigate to dashboard
    await dashboardPage.navigate();

    // Verify dashboard loaded
    const dashboardLoaded = await dashboardPage.verifyDashboardLoaded();
    expect(dashboardLoaded).toBeTruthy();
  });
});

test.describe('Authentication with StorageState', () => {
  test.use({ storageState: '.auth/userX.json' });

  test('Authenticated user can access dashboard directly', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);

    // Navigate directly to dashboard (already authenticated)
    await dashboardPage.navigate();

    // Verify user is logged in
    const isLoggedIn = await dashboardPage.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
  });
});
