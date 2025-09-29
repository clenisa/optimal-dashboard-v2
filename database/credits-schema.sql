-- Credits System Database Schema for Optimal Desktop
-- Add this to your existing Supabase database

-- User credits table (for AI chat system)
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    current_credits INTEGER DEFAULT 10, -- Starting credits
    total_earned INTEGER DEFAULT 10, -- Total credits earned
    total_spent INTEGER DEFAULT 0, -- Total credits spent
last_daily_credit DATE, -- Last date daily credits were awarded (EST timezone)
daily_credit_amount INTEGER DEFAULT 50, -- Daily free credits
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial transactions table (for charts and financial data)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL, -- Positive for income, negative for expenses
    category VARCHAR(100) NOT NULL DEFAULT 'Uncategorized',
    account VARCHAR(100) NOT NULL DEFAULT 'Unknown Account',
    source VARCHAR(100), -- Alternative to account field
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit transactions table (for tracking credit purchases/usage)
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'spent', 'purchased', 'daily_bonus')),
    amount INTEGER NOT NULL, -- Positive for earned/purchased, negative for spent
    description TEXT,
    conversation_id VARCHAR(255), -- If spent on AI chat
    stripe_payment_intent_id VARCHAR(255), -- If purchased via Stripe
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI conversations & messages tables
CREATE TABLE IF NOT EXISTS ai_conversations (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    title VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_messages (
    id VARCHAR(255) PRIMARY KEY,
    conversation_id VARCHAR(255) REFERENCES ai_conversations(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    provider VARCHAR(50),
    model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category, user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account, user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id, created_at ASC);

-- Row Level Security Policies
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- User credits policies
CREATE POLICY "Users can view their own credits" ON user_credits
    FOR ALL USING (auth.uid() = user_id);

-- Financial transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Credit transactions policies
CREATE POLICY "Users can view their own credit transactions" ON credit_transactions
    FOR ALL USING (auth.uid() = user_id);

-- AI conversations policies
CREATE POLICY "Users can view their conversations" ON ai_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their conversations" ON ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their conversations" ON ai_conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their conversations" ON ai_conversations
    FOR DELETE USING (auth.uid() = user_id);

-- AI messages policies
CREATE POLICY "Users can view their conversation messages" ON ai_messages
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM ai_conversations WHERE id = conversation_id));

CREATE POLICY "Users can insert their conversation messages" ON ai_messages
    FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM ai_conversations WHERE id = conversation_id));

CREATE POLICY "Users can update their conversation messages" ON ai_messages
    FOR UPDATE USING (auth.uid() = (SELECT user_id FROM ai_conversations WHERE id = conversation_id));

CREATE POLICY "Users can delete their conversation messages" ON ai_messages
    FOR DELETE USING (auth.uid() = (SELECT user_id FROM ai_conversations WHERE id = conversation_id));

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION touch_ai_conversation()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ai_conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ai_messages_touch_conversation AFTER INSERT ON ai_messages
    FOR EACH ROW EXECUTE FUNCTION touch_ai_conversation();

CREATE TRIGGER ai_messages_touch_conversation_update AFTER UPDATE ON ai_messages
    FOR EACH ROW EXECUTE FUNCTION touch_ai_conversation();

-- Function to award daily credits
CREATE OR REPLACE FUNCTION award_daily_credits()
RETURNS TRIGGER AS $$
BEGIN
    -- Award daily credits if user hasn't received them today
    INSERT INTO user_credits (user_id, current_credits, total_earned, last_daily_credit, daily_credit_amount)
    VALUES (NEW.id, 10, 10, CURRENT_DATE, 5)
    ON CONFLICT (user_id) DO UPDATE SET
        current_credits = CASE 
            WHEN user_credits.last_daily_credit < CURRENT_DATE 
            THEN user_credits.current_credits + user_credits.daily_credit_amount
            ELSE user_credits.current_credits
        END,
        total_earned = CASE 
            WHEN user_credits.last_daily_credit < CURRENT_DATE 
            THEN user_credits.total_earned + user_credits.daily_credit_amount
            ELSE user_credits.total_earned
        END,
        last_daily_credit = CASE 
            WHEN user_credits.last_daily_credit < CURRENT_DATE 
            THEN CURRENT_DATE
            ELSE user_credits.last_daily_credit
        END,
        updated_at = NOW();

    -- Log the daily credit award
    IF (SELECT last_daily_credit FROM user_credits WHERE user_id = NEW.id) = CURRENT_DATE THEN
        INSERT INTO credit_transactions (user_id, type, amount, description)
        VALUES (NEW.id, 'daily_bonus', 5, 'Daily login bonus');
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to award daily credits on user creation/login
CREATE TRIGGER award_daily_credits_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION award_daily_credits();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Views for analytics (optional)
CREATE OR REPLACE VIEW credit_usage_summary AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    type,
    COUNT(*) as transaction_count,
    SUM(amount) as total_amount
FROM credit_transactions
GROUP BY DATE_TRUNC('day', created_at), type
ORDER BY date DESC;

CREATE OR REPLACE VIEW user_credit_summary AS
SELECT 
    u.id as user_id,
    u.email,
    uc.current_credits,
    uc.total_earned,
    uc.total_spent,
    uc.last_daily_credit,
    uc.created_at as credits_created_at
FROM auth.users u
LEFT JOIN user_credits uc ON u.id = uc.user_id
ORDER BY uc.created_at DESC;

-- Financial analytics views
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
    user_id,
    DATE_TRUNC('month', date) as month,
    category,
    COUNT(*) as transaction_count,
    SUM(ABS(amount)) as total_amount,
    AVG(ABS(amount)) as avg_amount
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', date), category
ORDER BY month DESC, total_amount DESC;

CREATE OR REPLACE VIEW account_balance_summary AS
SELECT 
    user_id,
    account,
    COUNT(*) as transaction_count,
    SUM(amount) as current_balance
FROM transactions
GROUP BY user_id, account
ORDER BY current_balance DESC;


-- Financial sources table (for Account Balances module)
CREATE TABLE IF NOT EXISTS sources (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4 (),
    created_at timestamp with time zone NULL DEFAULT timezone('utc'::text, now()),
    name text NOT NULL,
    type text NOT NULL,
    interest_rate numeric(5, 2) NULL,
    user_id uuid NULL,
    current_balance numeric(10, 2) NULL DEFAULT 0,
    max_balance numeric(10, 2) NULL DEFAULT 0,
    CONSTRAINT sources_pkey PRIMARY KEY (id),
    CONSTRAINT sources_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id),
    CONSTRAINT sources_type_check CHECK (((type = ANY (ARRAY['credit'::text, 'debit'::text]))))
) TABLESPACE pg_default;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_sources_user_id ON sources(user_id);