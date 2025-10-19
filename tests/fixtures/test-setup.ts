import { test as base, Page } from '@playwright/test';
import { DesktopPage } from '../page-objects/desktop-page';
import { AuthPage } from '../page-objects/auth-page';
import { TestHelpers, TestAssertions } from '../utils/test-helpers';

/**
 * Extended test fixtures with page objects and utilities
 */
export const test = base.extend<{
  desktopPage: DesktopPage;
  authPage: AuthPage;
  testHelpers: TestHelpers;
  testAssertions: TestAssertions;
}>({
  desktopPage: async ({ page }, use) => {
    const desktopPage = new DesktopPage(page);
    await use(desktopPage);
  },

  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  testHelpers: async ({ page }, use) => {
    const testHelpers = new TestHelpers(page);
    await use(testHelpers);
  },

  testAssertions: async ({ page }, use) => {
    const testAssertions = new TestAssertions(page);
    await use(testAssertions);
  },
});

export { expect } from '@playwright/test';