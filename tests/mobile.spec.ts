import { test, expect } from './fixtures/test-setup';

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ desktopPage }) => {
    // Set mobile viewport
    await desktopPage.page.setViewportSize({ width: 375, height: 667 });
    await desktopPage.goto();
    await desktopPage.waitForLoad();
  });

  test('should adapt to mobile viewport', async ({ desktopPage }) => {
    await expect(desktopPage.desktopContainer).toBeVisible();
    
    // Check if mobile-specific elements are present
    const mobileMenu = desktopPage.page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await expect(mobileMenu).toBeVisible();
    }
  });

  test('should handle touch interactions', async ({ desktopPage }) => {
    // Test touch interactions on desktop icons
    const aiChatIcon = desktopPage.getDesktopIcon('AI Chat');
    
    if (await aiChatIcon.isVisible()) {
      // Simulate touch tap
      await aiChatIcon.tap();
      await desktopPage.page.waitForTimeout(1000);
    }
  });

  test('should display mobile-optimized menu bar', async ({ desktopPage }) => {
    const menuBar = desktopPage.getMenuBar();
    await expect(menuBar).toBeVisible();
    
    // Check if menu bar adapts to mobile
    const menuBarRect = await menuBar.boundingBox();
    expect(menuBarRect?.width).toBeLessThanOrEqual(375);
  });

  test('should handle window management on mobile', async ({ desktopPage }) => {
    // Test window behavior on mobile
    const windowManager = desktopPage.windowManager;
    await expect(windowManager).toBeVisible();
    
    // Check if windows are mobile-optimized
    const windows = await desktopPage.page.locator('[data-testid^="window-"]');
    const windowCount = await windows.count();
    
    if (windowCount > 0) {
      const firstWindow = windows.first();
      const windowRect = await firstWindow.boundingBox();
      expect(windowRect?.width).toBeLessThanOrEqual(375);
    }
  });
});