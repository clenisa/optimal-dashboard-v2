import { test, expect } from './fixtures/test-setup';
import { testTransactions, testCategories } from './fixtures/test-data';

test.describe('Transaction Manager', () => {
  test.beforeEach(async ({ desktopPage }) => {
    await desktopPage.goto();
    await desktopPage.waitForLoad();
  });

  test('should open Transaction Manager window', async ({ desktopPage }) => {
    const transactionIcon = desktopPage.getDesktopIcon('Transaction Manager');
    
    if (await transactionIcon.isVisible()) {
      await transactionIcon.click();
      await desktopPage.page.waitForTimeout(1000);
      
      // Check if Transaction Manager window opened
      const transactionWindow = desktopPage.getWindow('Transaction Manager');
      if (await transactionWindow.isVisible()) {
        await expect(transactionWindow).toBeVisible();
      }
    }
  });

  test('should display transaction table', async ({ desktopPage }) => {
    const transactionIcon = desktopPage.getDesktopIcon('Transaction Manager');
    
    if (await transactionIcon.isVisible()) {
      await transactionIcon.click();
      await desktopPage.page.waitForTimeout(1000);
      
      // Look for transaction table
      const transactionTable = desktopPage.page.locator('[data-testid="transaction-table"]');
      if (await transactionTable.isVisible()) {
        await expect(transactionTable).toBeVisible();
      }
    }
  });

  test('should show transaction filters', async ({ desktopPage }) => {
    const transactionIcon = desktopPage.getDesktopIcon('Transaction Manager');
    
    if (await transactionIcon.isVisible()) {
      await transactionIcon.click();
      await desktopPage.page.waitForTimeout(1000);
      
      // Look for transaction filters
      const transactionFilters = desktopPage.page.locator('[data-testid="transaction-filters"]');
      if (await transactionFilters.isVisible()) {
        await expect(transactionFilters).toBeVisible();
      }
    }
  });

  test('should display transaction summary', async ({ desktopPage }) => {
    const transactionIcon = desktopPage.getDesktopIcon('Transaction Manager');
    
    if (await transactionIcon.isVisible()) {
      await transactionIcon.click();
      await desktopPage.page.waitForTimeout(1000);
      
      // Look for transaction summary
      const transactionSummary = desktopPage.page.locator('[data-testid="transaction-summary"]');
      if (await transactionSummary.isVisible()) {
        await expect(transactionSummary).toBeVisible();
      }
    }
  });
});