import { Page, expect } from '@playwright/test';

/**
 * Common test utilities and helpers
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for the application to be fully loaded
   */
  async waitForAppReady() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('[data-testid="desktop-container"]', { timeout: 10000 });
  }

  /**
   * Wait for authentication to complete
   */
  async waitForAuth() {
    await this.page.waitForSelector('[data-testid="authenticated-state"]', { timeout: 15000 });
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="authenticated-state"]', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for a specific window to be open
   */
  async waitForWindow(title: string) {
    await this.page.waitForSelector(`[data-testid="window-${title.toLowerCase().replace(/\s+/g, '-')}"]`, { 
      timeout: 10000 
    });
  }

  /**
   * Close a specific window
   */
  async closeWindow(title: string) {
    const windowSelector = `[data-testid="window-${title.toLowerCase().replace(/\s+/g, '-')}"]`;
    const closeButton = this.page.locator(`${windowSelector} [data-testid="close-button"]`);
    await closeButton.click();
    await this.page.waitForSelector(windowSelector, { state: 'hidden' });
  }

  /**
   * Click on a desktop icon
   */
  async clickDesktopIcon(iconName: string) {
    const iconSelector = `[data-testid="desktop-icon-${iconName.toLowerCase().replace(/\s+/g, '-')}"]`;
    await this.page.click(iconSelector);
  }

  /**
   * Fill and submit a form
   */
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      const fieldSelector = `[data-testid="form-field-${field}"]`;
      await this.page.fill(fieldSelector, value);
    }
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(urlPattern: string | RegExp) {
    return this.page.waitForResponse(response => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    });
  }

  /**
   * Take a screenshot with timestamp
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true 
    });
  }

  /**
   * Check for console errors
   */
  async checkForConsoleErrors() {
    const errors: string[] = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    return errors;
  }

  /**
   * Wait for element to be visible and stable
   */
  async waitForStableElement(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { state: 'visible', timeout });
    
    // Wait for any animations to complete
    await this.page.waitForTimeout(100);
  }

  /**
   * Mock API responses
   */
  async mockApiResponse(url: string, response: any) {
    await this.page.route(url, route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  /**
   * Clear all mocks
   */
  async clearMocks() {
    await this.page.unrouteAll();
  }
}

/**
 * Common assertions
 */
export class TestAssertions {
  constructor(private page: Page) {}

  /**
   * Assert that a window is open
   */
  async windowIsOpen(title: string) {
    const windowSelector = `[data-testid="window-${title.toLowerCase().replace(/\s+/g, '-')}"]`;
    await expect(this.page.locator(windowSelector)).toBeVisible();
  }

  /**
   * Assert that a window is closed
   */
  async windowIsClosed(title: string) {
    const windowSelector = `[data-testid="window-${title.toLowerCase().replace(/\s+/g, '-')}"]`;
    await expect(this.page.locator(windowSelector)).toBeHidden();
  }

  /**
   * Assert that an element contains text
   */
  async elementContainsText(selector: string, text: string) {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  /**
   * Assert that a form field has a specific value
   */
  async formFieldHasValue(fieldName: string, expectedValue: string) {
    const fieldSelector = `[data-testid="form-field-${fieldName}"]`;
    await expect(this.page.locator(fieldSelector)).toHaveValue(expectedValue);
  }

  /**
   * Assert that no console errors occurred
   */
  async noConsoleErrors() {
    const errors = await this.page.evaluate(() => {
      return window.console.errors || [];
    });
    expect(errors).toHaveLength(0);
  }
}