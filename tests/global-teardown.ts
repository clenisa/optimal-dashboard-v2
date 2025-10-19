import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global test teardown...');
  
  // Add any global cleanup here
  // For example: cleaning up test data, closing connections, etc.
  
  console.log('✅ Global teardown completed');
}

export default globalTeardown;