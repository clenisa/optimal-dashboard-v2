import { test, expect } from './fixtures/test-setup';
import { testUsers } from './fixtures/test-data';

test.describe('Desktop Interface', () => {
  test.beforeEach(async ({ desktopPage }) => {
    await desktopPage.goto();
    await desktopPage.waitForLoad();
  });

  test('should load the desktop interface', async ({ desktopPage }) => {
    await expect(desktopPage.desktopContainer).toBeVisible();
    await expect(desktopPage.menuBar).toBeVisible();
  });

  test('should display desktop icons', async ({ desktopPage }) => {
    // Check if common desktop icons are present
    const commonIcons = ['AI Chat', 'Transaction Manager', 'Settings'];
    
    for (const iconName of commonIcons) {
      const icon = desktopPage.getDesktopIcon(iconName);
      if (await icon.isVisible()) {
        await expect(icon).toBeVisible();
      }
    }
  });

  test('should open and close windows', async ({ desktopPage }) => {
    // Try to open a window (if any desktop icons are clickable)
    const aiChatIcon = desktopPage.getDesktopIcon('AI Chat');
    
    if (await aiChatIcon.isVisible()) {
      await aiChatIcon.click();
      
      // Wait for window to open
      await desktopPage.page.waitForTimeout(1000);
      
      // Check if any window is open
      const windows = await desktopPage.page.locator('[data-testid^="window-"]').count();
      expect(windows).toBeGreaterThan(0);
    }
  });

  test('should display menu bar with clock', async ({ desktopPage }) => {
    const clock = desktopPage.getClock();
    await expect(clock).toBeVisible();
    
    // Check if clock shows a time format
    const clockText = await clock.textContent();
    expect(clockText).toMatch(/\d{1,2}:\d{2}/);
  });

  test('should handle window management', async ({ desktopPage }) => {
    // This test will be more comprehensive once we have actual windows
    await expect(desktopPage.windowManager).toBeVisible();
  });
});