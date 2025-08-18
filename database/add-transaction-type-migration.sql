-- Migration to add type field to transactions table
-- This supports the enhanced CSV parser functionality

-- Add type field to transactions table
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'expense' CHECK (type IN ('income', 'expense', 'transfer'));

-- Update existing records to have a default type
UPDATE transactions 
SET type = 'expense' 
WHERE type IS NULL;

-- Make the type field NOT NULL after setting defaults
ALTER TABLE transactions 
ALTER COLUMN type SET NOT NULL;

-- Add index for type field for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type, user_id);

-- Update the financial_summary view to include type information
DROP VIEW IF EXISTS financial_summary;
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
    user_id,
    DATE_TRUNC('month', date) as month,
    type,
    category,
    COUNT(*) as transaction_count,
    SUM(ABS(amount)) as total_amount,
    AVG(ABS(amount)) as avg_amount
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', date), type, category
ORDER BY month DESC, total_amount DESC;

-- Create a new view for type-based analytics
CREATE OR REPLACE VIEW transaction_type_summary AS
SELECT 
    user_id,
    type,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount,
    MIN(date) as first_transaction,
    MAX(date) as last_transaction
FROM transactions
GROUP BY user_id, type
ORDER BY total_amount DESC;
