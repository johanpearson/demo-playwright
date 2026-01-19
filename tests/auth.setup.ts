import { test as setup, expect } from '@playwright/test';
import { AuthHelper, TEST_USERS } from '../utils/auth';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * Setup tests to authenticate users and save their storage states
 * These run before the main test suite
 */

const userXAuthFile = AuthHelper.getStorageStatePath('userX');
const userYAuthFile = AuthHelper.getStorageStatePath('userY');

setup('authenticate as User X', async ({ page }) => {
  // Perform authentication for User X
  await AuthHelper.authenticate(page, TEST_USERS.userX);
  
  // Verify authentication was successful
  const dashboardPage = new DashboardPage(page);
  const isLoggedIn = await dashboardPage.isLoggedIn();
  expect(isLoggedIn).toBeTruthy();
  
  // Save the authenticated state
  await AuthHelper.saveAuthState(page, userXAuthFile);
});

setup('authenticate as User Y', async ({ page }) => {
  // Perform authentication for User Y
  await AuthHelper.authenticate(page, TEST_USERS.userY);
  
  // Verify authentication was successful
  const dashboardPage = new DashboardPage(page);
  const isLoggedIn = await dashboardPage.isLoggedIn();
  expect(isLoggedIn).toBeTruthy();
  
  // Save the authenticated state
  await AuthHelper.saveAuthState(page, userYAuthFile);
});
