import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Desktop interface
 */
export class DesktopPage {
  readonly page: Page;
  readonly desktopContainer: Locator;
  readonly menuBar: Locator;
  readonly desktopIcons: Locator;
  readonly windowManager: Locator;

  constructor(page: Page) {
    this.page = page;
    this.desktopContainer = page.locator('[data-testid="desktop-container"]');
    this.menuBar = page.locator('[data-testid="menu-bar"]');
    this.desktopIcons = page.locator('[data-testid="desktop-icons"]');
    this.windowManager = page.locator('[data-testid="window-manager"]');
  }

  /**
   * Navigate to the desktop
   */
  async goto() {
    await this.page.goto('/');
    await this.waitForLoad();
  }

  /**
   * Wait for the desktop to be fully loaded
   */
  async waitForLoad() {
    await this.desktopContainer.waitFor({ state: 'visible' });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get a desktop icon by name
   */
  getDesktopIcon(name: string): Locator {
    return this.page.locator(`[data-testid="desktop-icon-${name.toLowerCase().replace(/\s+/g, '-')}"]`);
  }

  /**
   * Click on a desktop icon
   */
  async clickDesktopIcon(name: string) {
    const icon = this.getDesktopIcon(name);
    await icon.click();
  }

  /**
   * Get a window by title
   */
  getWindow(title: string): Locator {
    return this.page.locator(`[data-testid="window-${title.toLowerCase().replace(/\s+/g, '-')}"]`);
  }

  /**
   * Check if a window is open
   */
  async isWindowOpen(title: string): Promise<boolean> {
    const window = this.getWindow(title);
    try {
      await window.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Close a window
   */
  async closeWindow(title: string) {
    const window = this.getWindow(title);
    const closeButton = window.locator('[data-testid="close-button"]');
    await closeButton.click();
    await window.waitFor({ state: 'hidden' });
  }

  /**
   * Get the menu bar
   */
  getMenuBar(): Locator {
    return this.menuBar;
  }

  /**
   * Click on a menu item
   */
  async clickMenuItem(menuText: string) {
    const menuItem = this.menuBar.locator(`text=${menuText}`);
    await menuItem.click();
  }

  /**
   * Get the clock display
   */
  getClock(): Locator {
    return this.menuBar.locator('[data-testid="clock"]');
  }

  /**
   * Get the volume control
   */
  getVolumeControl(): Locator {
    return this.menuBar.locator('[data-testid="volume-control"]');
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
}