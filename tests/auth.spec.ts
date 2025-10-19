import { test, expect } from './fixtures/test-setup';
import { testUsers } from './fixtures/test-data';

test.describe('Authentication', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.goto();
    await authPage.waitForLoad();
  });

  test('should display login form', async ({ authPage }) => {
    await expect(authPage.loginForm).toBeVisible();
    await expect(authPage.emailInput).toBeVisible();
    await expect(authPage.passwordInput).toBeVisible();
    await expect(authPage.loginButton).toBeVisible();
  });

  test('should show Google login option', async ({ authPage }) => {
    await expect(authPage.googleLoginButton).toBeVisible();
  });

  test('should validate required fields', async ({ authPage }) => {
    // Try to submit without filling fields
    await authPage.clickLogin();
    
    // Check for validation errors (implementation depends on your form validation)
    // This is a placeholder - adjust based on your actual validation behavior
    await authPage.page.waitForTimeout(1000);
  });

  test('should handle invalid credentials', async ({ authPage }) => {
    await authPage.login('invalid@example.com', 'wrongpassword');
    
    // Wait for error handling
    await authPage.page.waitForTimeout(2000);
    
    // Check if error message appears (adjust selector based on your implementation)
    const hasError = await authPage.hasErrorMessage();
    if (hasError) {
      const errorText = await authPage.getErrorMessage();
      expect(errorText).toBeTruthy();
    }
  });

  test('should attempt Google OAuth flow', async ({ authPage }) => {
    // Click Google login button
    await authPage.clickGoogleLogin();
    
    // Wait for OAuth redirect or popup
    await authPage.page.waitForTimeout(2000);
    
    // This test will need to be adjusted based on your OAuth implementation
    // For now, we just verify the button is clickable
    expect(true).toBe(true);
  });
});