-- Categories table for financial data visualization
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    amount DECIMAL(10,2) DEFAULT 0,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO categories (name, amount, count) VALUES
    ('Food & Dining', 1250.75, 23),
    ('Transportation', 890.50, 15),
    ('Shopping', 2100.25, 31),
    ('Entertainment', 650.00, 12),
    ('Bills & Utilities', 1800.00, 8),
    ('Healthcare', 450.25, 5)
ON CONFLICT (name) DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to read categories (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access to categories" ON categories
    FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert/update categories (adjust as needed)
CREATE POLICY "Allow authenticated users to manage categories" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_categories_updated_at();