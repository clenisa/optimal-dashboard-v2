-- Credits System Database Schema for Optimal Desktop
-- Add this to your existing Supabase database

-- User credits table (for AI chat system)
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    current_credits INTEGER DEFAULT 10, -- Starting credits
    total_earned INTEGER DEFAULT 10, -- Total credits earned
    total_spent INTEGER DEFAULT 0, -- Total credits spent
    last_daily_credit DATE, -- Last date daily credits were awarded
    daily_credit_amount INTEGER DEFAULT 5, -- Daily free credits
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

-- AI conversations table (for ElectronConsole integration)
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id VARCHAR(255) NOT NULL, -- External conversation ID
    title VARCHAR(255),
    messages JSONB NOT NULL DEFAULT '[]', -- Array of message objects
    metadata JSONB DEFAULT '{}', -- Additional metadata
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, conversation_id)
);

-- AI logs table (for debugging and monitoring)
CREATE TABLE IF NOT EXISTS ai_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    level VARCHAR(20) DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warn', 'error')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON ai_logs(user_id, created_at DESC);

-- Row Level Security Policies
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- User credits policies
CREATE POLICY "Users can view their own credits" ON user_credits
    FOR ALL USING (auth.uid() = user_id);

-- Credit transactions policies
CREATE POLICY "Users can view their own credit transactions" ON credit_transactions
    FOR ALL USING (auth.uid() = user_id);

-- AI conversations policies
CREATE POLICY "Users can manage their own conversations" ON ai_conversations
    FOR ALL USING (auth.uid() = user_id);

-- AI logs policies
CREATE POLICY "Users can view their own logs" ON ai_logs
    FOR ALL USING (auth.uid() = user_id);

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

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

