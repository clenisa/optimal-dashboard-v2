import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global test setup...');
  
  // Check if the application is running
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Wait for the application to be ready
    const response = await page.goto(baseURL, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    if (!response || !response.ok()) {
      throw new Error(`Application not ready at ${baseURL}. Status: ${response?.status()}`);
    }
    
    console.log('✅ Application is ready for testing');
    await browser.close();
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
  
  console.log('🎯 Global setup completed successfully');
}

export default globalSetup;