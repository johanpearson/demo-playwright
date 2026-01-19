# Quick Start Guide - Multi-User Testing

This guide demonstrates how to quickly get started with multi-user testing scenarios.

## Overview

This framework allows you to:
1. Authenticate multiple users once and reuse their sessions
2. Run tests with different users in separate browser contexts
3. Execute actions in parallel or sequentially
4. Open multiple tabs/windows for each user

## Quick Start

### 1. Setup

```bash
# Install dependencies
npm install

# Install browsers
npx playwright install

# Configure your users in utils/auth.ts
# Update TEST_USERS with your actual credentials
```

### 2. Authenticate Users (One-Time Setup)

```bash
# This creates storage state files in .auth/ directory
npm run setup:auth
```

This runs the `auth.setup.ts` file which:
- Logs in as each configured user
- Saves their authentication state to `.auth/userX.json` and `.auth/userY.json`
- These files are reused across all tests for performance

### 3. Write Your First Multi-User Test

Create a new file `tests/myFirstMultiUserTest.spec.ts`:

```typescript
import { test, expect } from '../fixtures/multiUserFixtures';
import { DashboardPage } from '../pages/DashboardPage';

test('User X and User Y collaborate', async ({ pageUserX, pageUserY }) => {
  // User X performs some action
  const dashboardX = new DashboardPage(pageUserX);
  await dashboardX.navigate();
  expect(await dashboardX.isLoggedIn()).toBeTruthy();
  
  // User Y performs a different action
  const dashboardY = new DashboardPage(pageUserY);
  await dashboardY.navigate();
  expect(await dashboardY.isLoggedIn()).toBeTruthy();
  
  // Both users are now on the dashboard, authenticated as different users
  // You can continue with your test scenario...
});
```

### 4. Run Your Tests

```bash
# Run all tests
npm test

# Run in headed mode (see browser)
npm run test:headed

# Run with UI mode (interactive)
npm run test:ui
```

## Common Patterns

### Pattern 1: Sequential User Actions

```typescript
test('User X does something, then User Y reacts', async ({ pageUserX, pageUserY }) => {
  // Step 1: User X creates something
  const pageX = new DashboardPage(pageUserX);
  await pageX.navigate();
  // ... User X actions ...
  
  // Step 2: User Y sees and interacts with what User X created
  const pageY = new DashboardPage(pageUserY);
  await pageY.navigate();
  // ... User Y actions ...
});
```

### Pattern 2: Parallel User Actions

```typescript
test('Both users act at the same time', async ({ pageUserX, pageUserY }) => {
  const dashX = new DashboardPage(pageUserX);
  const dashY = new DashboardPage(pageUserY);
  
  // Both navigate simultaneously
  await Promise.all([
    dashX.navigate(),
    dashY.navigate(),
  ]);
  
  // Both perform actions in parallel
  await Promise.all([
    dashX.verifyDashboardLoaded(),
    dashY.verifyDashboardLoaded(),
  ]);
});
```

### Pattern 3: Multiple Tabs for One User

```typescript
test('User X opens multiple tabs', async ({ contextUserX }) => {
  // Open 3 tabs as User X
  const tab1 = await contextUserX.newPage();
  const tab2 = await contextUserX.newPage();
  const tab3 = await contextUserX.newPage();
  
  // Create page objects for each tab
  const page1 = new DashboardPage(tab1);
  const page2 = new DashboardPage(tab2);
  const page3 = new DashboardPage(tab3);
  
  // Work in different tabs
  await page1.navigate();
  await page2.navigate();
  await page3.navigate();
  
  // Clean up
  await tab1.close();
  await tab2.close();
  await tab3.close();
});
```

### Pattern 4: Using Standard Single User

If you only need one user, use standard Playwright:

```typescript
import { test, expect } from '@playwright/test';

test.use({ storageState: '.auth/userX.json' });

test('Single user test', async ({ page }) => {
  // This test runs as User X
  const dashboard = new DashboardPage(page);
  await dashboard.navigate();
  expect(await dashboard.isLoggedIn()).toBeTruthy();
});
```

## Understanding the Fixtures

The multi-user fixtures provide:

- `contextUserX`: Browser context for User X (with auth)
- `contextUserY`: Browser context for User Y (with auth)
- `pageUserX`: A page instance for User X
- `pageUserY`: A page instance for User Y

Each context is isolated, so users don't interfere with each other.

## Adapting to Your Application

### Step 1: Update Login Page Locators

Edit `pages/LoginPage.ts` to match your app's login form:

```typescript
this.usernameInput = page.locator('#your-username-field');
this.passwordInput = page.locator('#your-password-field');
this.loginButton = page.locator('#your-login-button');
```

### Step 2: Update Dashboard Page Locators

Edit `pages/DashboardPage.ts` to match your app's dashboard:

```typescript
this.welcomeMessage = page.locator('.your-welcome-selector');
this.userProfile = page.locator('.your-profile-selector');
```

### Step 3: Update Base URL

Edit `playwright.config.ts`:

```typescript
use: {
  baseURL: 'https://your-app.com',
}
```

### Step 4: Configure Real Users

Edit `utils/auth.ts`:

```typescript
export const TEST_USERS = {
  userX: {
    username: 'real-userx@yourdomain.com',
    password: process.env.USER_X_PASSWORD || 'default-password',
    role: 'user',
  },
  userY: {
    username: 'real-usery@yourdomain.com',
    password: process.env.USER_Y_PASSWORD || 'default-password',
    role: 'admin',
  },
};
```

## Tips for Success

1. **Run setup once**: Authentication states are saved, no need to login every time
2. **Use descriptive page objects**: Create page objects for each page/component
3. **Keep tests focused**: Each test should verify one scenario
4. **Leverage contexts**: Use separate contexts for complete isolation
5. **Clean up resources**: Close pages/contexts when done with them

## Next Steps

1. Create page objects for your application's pages
2. Update the authentication setup for your real login flow
3. Write tests that match your use cases
4. Run tests and iterate

Happy testing! 🚀
