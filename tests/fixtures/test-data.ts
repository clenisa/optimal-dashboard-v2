/**
 * Test data fixtures for Playwright tests
 */

export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'testpassword123',
    name: 'Test User'
  },
  adminUser: {
    email: 'admin@example.com',
    password: 'adminpassword123',
    name: 'Admin User'
  }
};

export const testTransactions = [
  {
    id: 'test-txn-1',
    amount: 100.50,
    description: 'Test Transaction 1',
    category: 'Food',
    date: '2024-01-15',
    type: 'expense'
  },
  {
    id: 'test-txn-2',
    amount: 2500.00,
    description: 'Test Transaction 2',
    category: 'Salary',
    date: '2024-01-01',
    type: 'income'
  }
];

export const testCategories = [
  'Food',
  'Transportation',
  'Entertainment',
  'Salary',
  'Freelance',
  'Investment'
];

export const testProviders = [
  'openai',
  'anthropic',
  'ollama'
];

export const testPrompts = [
  'What is my total spending this month?',
  'Show me my income vs expenses',
  'Categorize my recent transactions',
  'Generate a budget report'
];