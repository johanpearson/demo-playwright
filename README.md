# Demo Playwright - POM Framework with Multi-User Support

A comprehensive Playwright testing framework built with TypeScript following the Page Object Model (POM) design pattern. This framework supports advanced multi-user scenarios with storage state management for optimal performance.

## Features

- ✅ **Page Object Model (POM)** - Clean, maintainable page object structure
- ✅ **Multi-User Support** - Test scenarios with multiple authenticated users
- ✅ **Storage State** - Fast authentication using saved storage states
- ✅ **Separate Contexts** - Execute tests in separate browser contexts/tabs
- ✅ **TypeScript** - Full type safety and IntelliSense support
- ✅ **Custom Fixtures** - Extended Playwright fixtures for multi-user scenarios

## Project Structure

```
demo-playwright/
├── pages/                      # Page Object Models
│   ├── BasePage.ts            # Base page class with common methods
│   ├── LoginPage.ts           # Login page object
│   ├── DashboardPage.ts       # Dashboard page object
│   └── index.ts               # Page exports
├── fixtures/                   # Custom Playwright fixtures
│   └── multiUserFixtures.ts   # Multi-user test fixtures
├── utils/                      # Utility functions
│   └── auth.ts                # Authentication helpers
├── tests/                      # Test files
│   ├── auth.setup.ts          # Setup authentication for users
│   ├── multiUser.spec.ts      # Multi-user test examples
│   └── login.spec.ts          # Single-user test examples
├── .auth/                      # Stored authentication states (gitignored)
├── playwright.config.ts        # Playwright configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Project dependencies

```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/johanpearson/demo-playwright.git
cd demo-playwright
```

2. Install dependencies:
```bash
npm install
```

3. Install Playwright browsers:
```bash
npx playwright install
```

## Usage

### Running Tests

```bash
# Run all tests
npm test

# Run tests in headed mode
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Show test report
npm run report

# Run only setup (authentication)
npm run setup:auth
```

### Multi-User Testing

The framework provides built-in support for testing scenarios with multiple users:

#### Using Custom Fixtures

```typescript
import { test, expect } from '../fixtures/multiUserFixtures';
import { DashboardPage } from '../pages/DashboardPage';

test('Multiple users perform actions', async ({ pageUserX, pageUserY }) => {
  // User X actions
  const dashboardUserX = new DashboardPage(pageUserX);
  await dashboardUserX.navigate();
  
  // User Y actions (separate context)
  const dashboardUserY = new DashboardPage(pageUserY);
  await dashboardUserY.navigate();
  
  // Both users are authenticated and can act independently
});
```

#### Using Separate Tabs/Windows

```typescript
test('Users in multiple tabs', async ({ contextUserX, contextUserY }) => {
  // User X opens multiple tabs
  const pageUserX1 = await contextUserX.newPage();
  const pageUserX2 = await contextUserX.newPage();
  
  // User Y opens a tab
  const pageUserY1 = await contextUserY.newPage();
  
  // Perform actions in different tabs...
});
```

### Page Object Model

#### Creating a New Page Object

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class NewPage extends BasePage {
  readonly elementLocator: Locator;

  constructor(page: Page) {
    super(page);
    this.elementLocator = page.locator('.element');
  }

  async performAction(): Promise<void> {
    await this.clickElement(this.elementLocator);
  }
}
```

### Authentication

#### Configure User Credentials

Update `utils/auth.ts` with your user credentials:

```typescript
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
};
```

#### Storage State Benefits

- **Performance**: Login once, reuse authentication across tests
- **Speed**: Skip repetitive login steps in each test
- **Reliability**: Reduce flakiness from repeated login operations

### Configuration

Update `playwright.config.ts` to customize:

- Base URL
- Test directory
- Browsers
- Reporters
- Timeouts
- And more...

```typescript
use: {
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
}
```

## Key Concepts

### Page Object Model (POM)

The Page Object Model is a design pattern that creates an object repository for web elements. Each page of the application has a corresponding page class that encapsulates the page's structure and behavior.

**Benefits:**
- Improved test maintenance
- Reduced code duplication
- Better readability
- Easy to update when UI changes

### Multi-User Support

This framework excels at scenarios requiring multiple authenticated users:

1. **Storage States**: Each user's authentication is saved and reused
2. **Separate Contexts**: Users operate in isolated browser contexts
3. **Parallel Execution**: Multiple users can act simultaneously
4. **Tab Support**: Each user can have multiple tabs/windows

**Use Cases:**
- Collaborative features testing
- Permission-based workflows
- Multi-role scenarios
- User interaction testing

## Example Test Scenarios

### Scenario 1: Sequential Actions

```typescript
test('User X then User Y', async ({ pageUserX, pageUserY }) => {
  // User X performs actions first
  const dashboardX = new DashboardPage(pageUserX);
  await dashboardX.navigate();
  await dashboardX.verifyDashboardLoaded();
  
  // Then User Y performs actions
  const dashboardY = new DashboardPage(pageUserY);
  await dashboardY.navigate();
  await dashboardY.verifyDashboardLoaded();
});
```

### Scenario 2: Parallel Actions

```typescript
test('Both users act simultaneously', async ({ pageUserX, pageUserY }) => {
  const dashboardX = new DashboardPage(pageUserX);
  const dashboardY = new DashboardPage(pageUserY);
  
  // Both users navigate at the same time
  await Promise.all([
    dashboardX.navigate(),
    dashboardY.navigate(),
  ]);
});
```

## Best Practices

1. **Keep Page Objects Focused**: Each page object should represent a single page or component
2. **Use Meaningful Names**: Method names should describe the action, not implementation
3. **Avoid Test Logic in Page Objects**: Keep assertions in tests, not page objects
4. **Reuse Storage States**: Authenticate once per test run, not per test
5. **Clean Up Resources**: Close pages and contexts when done
6. **Use TypeScript**: Leverage type safety for better maintainability

## Environment Variables

Create a `.env` file for configuration:

```env
BASE_URL=http://localhost:3000
USER_X_EMAIL=userx@example.com
USER_X_PASSWORD=passwordX123
USER_Y_EMAIL=usery@example.com
USER_Y_PASSWORD=passwordY123
```

## Troubleshooting

### Tests fail with "storageState file not found"

Run the setup tests first:
```bash
npm run setup:auth
```

### Authentication fails

1. Check credentials in `utils/auth.ts`
2. Verify base URL in `playwright.config.ts`
3. Ensure login page locators match your application

### Multi-user tests don't work as expected

1. Verify storage state files exist in `.auth/` directory
2. Check that setup tests passed successfully
3. Ensure contexts are properly isolated

## Contributing

Contributions are welcome! Please ensure:
- Tests pass
- Code follows TypeScript best practices
- Page objects follow POM pattern
- Documentation is updated

## License

ISC