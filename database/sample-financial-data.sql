-- Sample financial data for testing charts
-- Run this after creating the tables to populate with test data

-- Insert sample categories
INSERT INTO public.categories (user_id, name, color) VALUES
('00000000-0000-0000-0000-000000000001', 'Food & Dining', '#FF6B6B'),
('00000000-0000-0000-0000-000000000001', 'Transportation', '#4ECDC4'),
('00000000-0000-0000-0000-000000000001', 'Entertainment', '#45B7D1'),
('00000000-0000-0000-0000-000000000001', 'Shopping', '#96CEB4'),
('00000000-0000-0000-0000-000000000001', 'Utilities', '#FFEAA7'),
('00000000-0000-0000-0000-000000000001', 'Healthcare', '#DDA0DD')
ON CONFLICT (user_id, name) DO NOTHING;

-- Insert sample sources with proper max_balance for credit cards
INSERT INTO sources (user_id, name, type, current_balance, max_balance, interest_rate) VALUES
  ('00000000-0000-0000-0000-000000000000', 'Main Checking', 'debit', 2500.00, NULL, 0.01),
  ('00000000-0000-0000-0000-000000000000', 'Savings Account', 'debit', 15000.00, NULL, 2.50),
  ('00000000-0000-0000-0000-000000000000', 'Chase 7245', 'credit', 1250.75, 5000.00, 18.99),
  ('00000000-0000-0000-0000-000000000000', 'Discover', 'credit', 1200.00, 3000.00, 16.49),
  ('00000000-0000-0000-0000-000000000000', 'BestBuy', 'credit', 800.00, 1500.00, 24.99),
  ('00000000-0000-0000-0000-000000000000', 'Synchrony', 'credit', 1800.00, 2000.00, 26.99),
  ('00000000-0000-0000-0000-000000000000', 'CreditOne', 'credit', 450.00, 1000.00, 29.99)
ON CONFLICT (id) DO NOTHING;

-- Insert sample transactions
INSERT INTO public.transactions (user_id, amount, category_id, date, description, type, mode) VALUES
-- Food & Dining transactions
('00000000-0000-0000-0000-000000000001', -45.50, (SELECT id FROM categories WHERE name = 'Food & Dining' AND user_id = '00000000-0000-0000-0000-000000000001'), '2024-01-15', 'Grocery shopping', 'expense', 'actual'),
('00000000-0000-0000-0000-000000000001', -32.75, (SELECT id FROM categories WHERE name = 'Food & Dining' AND user_id = '00000000-0000-0000-0000-000000000001'), '2024-01-16', 'Restaurant dinner', 'expense', 'actual'),
('00000000-0000-0000-0000-000000000001', -28.90, (SELECT id FROM categories WHERE name = 'Food & Dining' AND user_id = '00000000-0000-0000-0000-000000000001'), '2024-01-17', 'Coffee shop', 'expense', 'actual'),

-- Transportation transactions
('00000000-0000-0000-0000-000000000001', -65.00, (SELECT id FROM categories WHERE name = 'Transportation' AND user_id = '00000000-0000-0000-0000-000000000001'), '2024-01-15', 'Gas station', 'expense', 'actual'),
('00000000-0000-0000-0000-000000000001', -25.50, (SELECT id FROM categories WHERE name = 'Transportation' AND user_id = '00000000-0000-0000-0000-000000000001'), '2024-01-16', 'Parking fee', 'expense', 'actual'),

-- Entertainment transactions
('00000000-0000-0000-0000-000000000001', -120.00, (SELECT id FROM categories WHERE name = 'Entertainment' AND user_id = '00000000-0000-0000-0000-000000000001'), '2024-01-15', 'Movie tickets', 'expense', 'actual'),
('00000000-0000-0000-0000-000000000001', -85.00, (SELECT id FROM categories WHERE name = 'Entertainment' AND user_id = '00000000-0000-0000-0000-000000000001'), '2024-01-18', 'Concert tickets', 'expense', 'actual'),

-- Shopping transactions
('00000000-0000-0000-0000-000000000001', -150.00, (SELECT id FROM categories WHERE name = 'Shopping' AND user_id = '00000000-0000-0000-0000-000000000001'), '2024-01-16', 'Clothing store', 'expense', 'actual'),
('00000000-0000-0000-0000-000000000001', -75.25, (SELECT id FROM categories WHERE name = 'Shopping' AND user_id = '00000000-0000-0000-0000-000000000001'), '2024-01-17', 'Electronics', 'expense', 'actual'),

-- Utilities transactions
('00000000-0000-0000-0000-000000000001', -125.00, (SELECT id FROM categories WHERE name = 'Utilities' AND user_id = '00000000-0000-0000-0000-000000000001'), '2024-01-15', 'Electric bill', 'expense', 'actual'),
('00000000-0000-0000-0000-000000000001', -85.50, (SELECT id FROM categories WHERE name = 'Utilities' AND user_id = '00000000-0000-0000-0000-000000000001'), '2024-01-16', 'Internet bill', 'expense', 'actual'),

-- Healthcare transactions
('00000000-0000-0000-0000-000000000001', -95.00, (SELECT id FROM categories WHERE name = 'Healthcare' AND user_id = '00000000-0000-0000-0000-000000000001'), '2024-01-17', 'Pharmacy', 'expense', 'actual'),

-- Income transactions
('00000000-0000-0000-0000-000000000001', 5000.00, NULL, '2024-01-15', 'Salary payment', 'income', 'actual'),
('00000000-0000-0000-0000-000000000001', 250.00, NULL, '2024-01-16', 'Freelance work', 'income', 'actual')
ON CONFLICT (id) DO NOTHING;

-- Note: Replace '00000000-0000-0000-0000-000000000001' with actual user IDs from your auth.users table
-- You can get your user ID by running: SELECT id FROM auth.users LIMIT 1;
