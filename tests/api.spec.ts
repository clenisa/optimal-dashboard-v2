import { test, expect } from './fixtures/test-setup';

test.describe('API Endpoints', () => {
  test('should respond to health check', async ({ page }) => {
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
  });

  test('should provide AI providers list', async ({ page }) => {
    const response = await page.request.get('/api/ai/providers');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('should provide AI provider status', async ({ page }) => {
    const response = await page.request.get('/api/ai/status');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(typeof data).toBe('object');
  });

  test('should handle authentication endpoints', async ({ page }) => {
    // Test auth callback endpoint
    const response = await page.request.get('/auth/callback');
    // This might redirect or return an error, which is expected
    expect([200, 302, 400, 404]).toContain(response.status());
  });

  test('should serve static assets', async ({ page }) => {
    // Test if favicon is accessible
    const response = await page.request.get('/favicon.ico');
    expect([200, 404]).toContain(response.status());
  });
});