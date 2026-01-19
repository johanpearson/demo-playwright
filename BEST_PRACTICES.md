# Best Practices for This Framework

This document provides guidance on how to customize and use this Playwright POM framework effectively.

## Customizing for Your Application

### 1. Update Locators (IMPORTANT!)

The provided page objects use generic fallback locators for demonstration. **You must update these for your specific application.**

#### Recommended Approach: Use data-testid

Add `data-testid` attributes to your application's elements:

```html
<!-- In your application -->
<input data-testid="username-input" type="text" />
<input data-testid="password-input" type="password" />
<button data-testid="login-button">Login</button>
```

Then update your page objects:

```typescript
// pages/LoginPage.ts
constructor(page: Page) {
  super(page);
  this.usernameInput = page.locator('[data-testid="username-input"]');
  this.passwordInput = page.locator('[data-testid="password-input"]');
  this.loginButton = page.locator('[data-testid="login-button"]');
  this.errorMessage = page.locator('[data-testid="error-message"]');
}
```

#### Alternative: Use Specific Selectors

If you can't modify your application, use the most specific selectors possible:

```typescript
// Be specific - use IDs, unique classes, or ARIA roles
this.usernameInput = page.locator('#login-username-field');
this.passwordInput = page.locator('#login-password-field');
this.loginButton = page.getByRole('button', { name: 'Log in' });

// Avoid generic selectors that might match multiple elements
// ❌ Bad: page.locator('input').first()
// ✅ Good: page.locator('#specific-input-id')
```

### 2. Environment-Specific Configuration

#### Use Environment Variables for Credentials

Never hardcode credentials in your code. Use environment variables:

```typescript
// utils/auth.ts
export const TEST_USERS = {
  userX: {
    username: process.env.USER_X_EMAIL || '',
    password: process.env.USER_X_PASSWORD || '',
    role: 'user',
  },
  userY: {
    username: process.env.USER_Y_EMAIL || '',
    password: process.env.USER_Y_PASSWORD || '',
    role: 'admin',
  },
};
```

Create a `.env` file (add to .gitignore):

```bash
USER_X_EMAIL=userx@example.com
USER_X_PASSWORD=secure_password_123
USER_Y_EMAIL=usery@example.com
USER_Y_PASSWORD=secure_password_456
BASE_URL=https://your-app.com
```

Load environment variables in your config:

```typescript
// playwright.config.ts
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL,
  },
});
```

Install dotenv:
```bash
npm install dotenv --save-dev
```

### 3. Organize Page Objects by Feature

As your application grows, organize page objects by feature or module:

```
pages/
├── auth/
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   └── ForgotPasswordPage.ts
├── dashboard/
│   ├── DashboardPage.ts
│   ├── WidgetPage.ts
│   └── SettingsPage.ts
├── users/
│   ├── UserListPage.ts
│   ├── UserProfilePage.ts
│   └── UserEditPage.ts
└── BasePage.ts
```

### 4. Create Reusable Components

For repeated UI patterns (modals, dropdowns, etc.), create component classes:

```typescript
// components/Modal.ts
export class Modal extends BasePage {
  readonly modalContainer: Locator;
  readonly closeButton: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    super(page);
    this.modalContainer = page.locator('[data-testid="modal"]');
    this.closeButton = this.modalContainer.locator('[data-testid="close-button"]');
    this.confirmButton = this.modalContainer.locator('[data-testid="confirm-button"]');
  }

  async confirm(): Promise<void> {
    await this.clickElement(this.confirmButton);
    await this.modalContainer.waitFor({ state: 'hidden' });
  }

  async close(): Promise<void> {
    await this.clickElement(this.closeButton);
    await this.modalContainer.waitFor({ state: 'hidden' });
  }
}
```

Use it in your page objects:

```typescript
// pages/DashboardPage.ts
export class DashboardPage extends BasePage {
  readonly deleteModal: Modal;

  constructor(page: Page) {
    super(page);
    this.deleteModal = new Modal(page);
  }

  async deleteItem(): Promise<void> {
    await this.clickElement(this.deleteButton);
    await this.deleteModal.confirm();
  }
}
```

### 5. Page Object Design Principles

#### Keep Page Objects Simple

Page objects should only contain:
- Locators (elements on the page)
- Actions (what you can do on the page)
- Simple getters (retrieve information from the page)

```typescript
// ✅ Good: Simple action
async login(username: string, password: string): Promise<void> {
  await this.fillInput(this.usernameInput, username);
  await this.fillInput(this.passwordInput, password);
  await this.clickElement(this.loginButton);
}

// ❌ Bad: Contains assertions
async login(username: string, password: string): Promise<void> {
  await this.fillInput(this.usernameInput, username);
  await this.fillInput(this.passwordInput, password);
  await this.clickElement(this.loginButton);
  expect(await this.isLoggedIn()).toBeTruthy(); // Don't do this!
}
```

#### Keep Assertions in Tests

```typescript
// test.spec.ts
test('User can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('user@example.com', 'password');
  
  // Assertions belong in the test
  expect(await loginPage.isLoginSuccessful()).toBeTruthy();
});
```

#### Use Descriptive Method Names

```typescript
// ✅ Good: Describes what the method does
async submitLoginForm(): Promise<void>
async verifyUserIsLoggedIn(): Promise<boolean>
async getWelcomeMessage(): Promise<string>

// ❌ Bad: Implementation details or unclear names
async clickSubmit(): Promise<void>
async check(): Promise<boolean>
async getMessage(): Promise<string>
```

### 6. Authentication Best Practices

#### Separate Setup from Tests

Keep authentication setup separate from your actual tests:

```typescript
// tests/auth.setup.ts - Runs once before all tests
setup('authenticate users', async ({ page }) => {
  await AuthHelper.authenticate(page, TEST_USERS.userX);
  await AuthHelper.saveAuthState(page, '.auth/userX.json');
});

// tests/feature.spec.ts - Uses saved authentication
test.use({ storageState: '.auth/userX.json' });
test('Feature test', async ({ page }) => {
  // Already authenticated, no login needed
});
```

#### Handle Multiple Environments

```typescript
// utils/auth.ts
export const getAuthFilePath = (user: string, env: string = 'dev') => {
  return `.auth/${env}-${user}.json`;
};

// In your tests
const authFile = getAuthFilePath('userX', process.env.ENV || 'dev');
test.use({ storageState: authFile });
```

### 7. Multi-User Testing Patterns

#### Pattern: Sequential Actions

When users need to act in a specific order:

```typescript
test('User X creates, User Y approves', async ({ pageUserX, pageUserY }) => {
  // User X creates something
  const editorX = new EditorPage(pageUserX);
  await editorX.createDocument();
  const docId = await editorX.getDocumentId();
  
  // Then User Y approves it
  const editorY = new EditorPage(pageUserY);
  await editorY.openDocument(docId);
  await editorY.approve();
});
```

#### Pattern: Parallel Actions

When users can act simultaneously:

```typescript
test('Both users work in parallel', async ({ pageUserX, pageUserY }) => {
  const dashX = new DashboardPage(pageUserX);
  const dashY = new DashboardPage(pageUserY);
  
  // Execute in parallel
  await Promise.all([
    dashX.performAction(),
    dashY.performAction(),
  ]);
});
```

#### Pattern: Isolated Contexts

Ensure complete isolation between users:

```typescript
test('Users have separate sessions', async ({ contextUserX, contextUserY }) => {
  // Create fresh pages for each user
  const pageX = await contextUserX.newPage();
  const pageY = await contextUserY.newPage();
  
  // Each page has its own context/session
  // Actions on pageX don't affect pageY
});
```

### 8. Test Organization

#### Group Related Tests

```typescript
test.describe('Login Flow', () => {
  test('User can login with valid credentials', async ({ page }) => {
    // Test implementation
  });

  test('User sees error with invalid credentials', async ({ page }) => {
    // Test implementation
  });
});

test.describe('Multi-User Collaboration', () => {
  test('Users can collaborate on document', async ({ pageUserX, pageUserY }) => {
    // Test implementation
  });
});
```

#### Use Test Hooks

```typescript
test.describe('Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    const dashboard = new DashboardPage(page);
    await dashboard.navigate();
  });

  test.afterEach(async ({ page }) => {
    // Clean up after each test
  });

  test('Test 1', async ({ page }) => {
    // Dashboard is already loaded
  });

  test('Test 2', async ({ page }) => {
    // Dashboard is already loaded
  });
});
```

### 9. Error Handling

#### Add Proper Waits

```typescript
// ✅ Good: Explicit waits
async clickButton(): Promise<void> {
  await this.button.waitFor({ state: 'visible' });
  await this.button.waitFor({ state: 'enabled' });
  await this.button.click();
}

// ❌ Bad: No waits (flaky)
async clickButton(): Promise<void> {
  await this.button.click();
}
```

#### Handle Dynamic Content

```typescript
async waitForDataToLoad(): Promise<void> {
  // Wait for loading spinner to disappear
  await this.loadingSpinner.waitFor({ state: 'hidden' });
  
  // Wait for actual content to appear
  await this.dataTable.waitFor({ state: 'visible' });
}
```

### 10. Performance Optimization

#### Reuse Authenticated States

```typescript
// ✅ Good: Authenticate once, reuse for all tests
// In auth.setup.ts
setup('auth', async ({ page }) => {
  await login(page);
  await page.context().storageState({ path: '.auth/user.json' });
});

// In tests
test.use({ storageState: '.auth/user.json' });

// ❌ Bad: Login in every test
test('Test 1', async ({ page }) => {
  await loginPage.login(); // Slow!
  // Test logic
});
```

#### Use Parallel Execution

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true, // Run tests in parallel
  workers: process.env.CI ? 2 : undefined,
});
```

#### Skip Unnecessary Waits

```typescript
// Use networkidle only when necessary
await page.goto(url, { waitUntil: 'domcontentloaded' }); // Faster

// Instead of always waiting for networkidle
await page.goto(url, { waitUntil: 'networkidle' }); // Slower
```

## Common Pitfalls to Avoid

1. **Hardcoded Waits**: Don't use `page.waitForTimeout(5000)` - use dynamic waits
2. **Brittle Selectors**: Avoid XPath and CSS that's likely to change
3. **Test Dependencies**: Each test should be independent
4. **Assertions in Page Objects**: Keep them in tests
5. **Too Many Locators**: Only define locators you actually use
6. **Ignoring Failures**: Investigate and fix flaky tests immediately
7. **Not Using Version Control**: Commit `.gitignore` properly
8. **Sharing State**: Don't share state between tests

## Recommended Tools & Extensions

1. **VS Code Extensions**:
   - Playwright Test for VS Code
   - ESLint
   - Prettier

2. **Additional Libraries**:
   - `dotenv` - Environment variable management
   - `faker` - Generate test data
   - `lighthouse` - Performance testing

3. **CI/CD Integration**:
   - GitHub Actions
   - GitLab CI
   - Jenkins

## Summary Checklist

- [ ] Update all locators to match your application
- [ ] Use `data-testid` attributes where possible
- [ ] Store credentials in environment variables
- [ ] Configure base URL for your environment
- [ ] Organize page objects by feature
- [ ] Keep assertions out of page objects
- [ ] Use descriptive method names
- [ ] Set up proper test isolation
- [ ] Configure CI/CD pipeline
- [ ] Add proper error handling and waits

Following these best practices will help you build a robust, maintainable test suite! 🚀
