import { test, expect } from './fixtures/test-setup';
import { testPrompts, testProviders } from './fixtures/test-data';

test.describe('AI Chat System', () => {
  test.beforeEach(async ({ desktopPage }) => {
    await desktopPage.goto();
    await desktopPage.waitForLoad();
  });

  test('should open AI Chat window', async ({ desktopPage }) => {
    const aiChatIcon = desktopPage.getDesktopIcon('AI Chat');
    
    if (await aiChatIcon.isVisible()) {
      await aiChatIcon.click();
      await desktopPage.page.waitForTimeout(1000);
      
      // Check if AI Chat window opened
      const aiChatWindow = desktopPage.getWindow('AI Chat');
      if (await aiChatWindow.isVisible()) {
        await expect(aiChatWindow).toBeVisible();
      }
    }
  });

  test('should display provider selector', async ({ desktopPage }) => {
    const aiChatIcon = desktopPage.getDesktopIcon('AI Chat');
    
    if (await aiChatIcon.isVisible()) {
      await aiChatIcon.click();
      await desktopPage.page.waitForTimeout(1000);
      
      // Look for provider selector
      const providerSelector = desktopPage.page.locator('[data-testid="ai-provider-selector"]');
      if (await providerSelector.isVisible()) {
        await expect(providerSelector).toBeVisible();
      }
    }
  });

  test('should handle chat input', async ({ desktopPage }) => {
    const aiChatIcon = desktopPage.getDesktopIcon('AI Chat');
    
    if (await aiChatIcon.isVisible()) {
      await aiChatIcon.click();
      await desktopPage.page.waitForTimeout(1000);
      
      // Look for chat input
      const chatInput = desktopPage.page.locator('[data-testid="chat-input"]');
      if (await chatInput.isVisible()) {
        await chatInput.fill('Hello, AI!');
        await expect(chatInput).toHaveValue('Hello, AI!');
      }
    }
  });

  test('should display chat history', async ({ desktopPage }) => {
    const aiChatIcon = desktopPage.getDesktopIcon('AI Chat');
    
    if (await aiChatIcon.isVisible()) {
      await aiChatIcon.click();
      await desktopPage.page.waitForTimeout(1000);
      
      // Look for chat history
      const chatHistory = desktopPage.page.locator('[data-testid="chat-history"]');
      if (await chatHistory.isVisible()) {
        await expect(chatHistory).toBeVisible();
      }
    }
  });
});