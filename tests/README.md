# Playwright Test Suite

This directory contains the end-to-end test suite for the Optimal Dashboard application using Playwright.

## Test Structure

```
tests/
├── fixtures/           # Test data and setup utilities
│   ├── test-data.ts    # Test data constants
│   ├── test-setup.ts   # Extended test fixtures
│   └── .env.test       # Test environment variables
├── page-objects/       # Page Object Model classes
│   ├── desktop-page.ts # Desktop interface page object
│   └── auth-page.ts    # Authentication page object
├── utils/              # Test utilities and helpers
│   └── test-helpers.ts # Common test utilities
├── *.spec.ts          # Test files
└── README.md          # This file
```

## Running Tests

### Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npm run test:install
   ```

3. **Set up test environment:**
   - Copy `tests/.env.test` to `tests/.env.test.local`
   - Fill in your test environment variables

### Test Commands

```bash
# Run all tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug tests
npm run test:debug

# Show test report
npm run test:report
```

### Running Specific Tests

```bash
# Run specific test file
npx playwright test desktop.spec.ts

# Run tests matching a pattern
npx playwright test --grep "authentication"

# Run tests in specific browser
npx playwright test --project=chromium
```

## Test Categories

### 1. Desktop Interface (`desktop.spec.ts`)
- Desktop loading and initialization
- Desktop icon interactions
- Window management
- Menu bar functionality

### 2. Authentication (`auth.spec.ts`)
- Login form validation
- Google OAuth flow
- Error handling
- Success states

### 3. AI Chat System (`ai-chat.spec.ts`)
- AI Chat window opening
- Provider selection
- Chat input handling
- Chat history display

### 4. Transaction Manager (`transaction-manager.spec.ts`)
- Transaction window opening
- Transaction table display
- Filter functionality
- Summary display

### 5. API Endpoints (`api.spec.ts`)
- Health check endpoints
- AI provider APIs
- Authentication endpoints
- Static asset serving

### 6. Mobile Responsiveness (`mobile.spec.ts`)
- Mobile viewport adaptation
- Touch interactions
- Mobile-optimized UI elements
- Responsive window management

## Test Data

Test data is centralized in `fixtures/test-data.ts`:
- User credentials
- Sample transactions
- Test categories
- AI providers
- Test prompts

## Page Objects

Page Object Model is used for maintainable tests:
- `DesktopPage`: Desktop interface interactions
- `AuthPage`: Authentication flow interactions

## Utilities

Common test utilities in `utils/test-helpers.ts`:
- `TestHelpers`: Common helper methods
- `TestAssertions`: Reusable assertions

## Environment Variables

Required test environment variables:
- `PLAYWRIGHT_BASE_URL`: Base URL for the application
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `TEST_USER_EMAIL`: Test user email
- `TEST_USER_PASSWORD`: Test user password

## Debugging

### Debug Mode
```bash
npm run test:debug
```

### Screenshots and Videos
- Screenshots are taken on test failures
- Videos are recorded for failed tests
- All artifacts are saved in `test-results/`

### Trace Viewer
```bash
npx playwright show-trace test-results/trace.zip
```

## Best Practices

1. **Use Page Objects**: Keep test logic in page objects
2. **Data-Driven Tests**: Use test data from fixtures
3. **Wait Strategies**: Use proper wait conditions
4. **Error Handling**: Handle expected errors gracefully
5. **Cleanup**: Clean up after tests when necessary
6. **Parallel Execution**: Tests run in parallel by default
7. **Retry Logic**: Failed tests are retried automatically

## Continuous Integration

Tests are configured to run in CI environments:
- Retry failed tests twice
- Generate multiple report formats (HTML, JSON, JUnit)
- Run in headless mode
- Timeout handling for slow operations

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout in `playwright.config.ts`
2. **Element not found**: Add proper wait conditions
3. **Authentication issues**: Check test environment variables
4. **Browser not found**: Run `npm run test:install`

### Debug Steps

1. Run tests in headed mode: `npm run test:headed`
2. Use debug mode: `npm run test:debug`
3. Check test reports: `npm run test:report`
4. Review screenshots and videos in `test-results/`