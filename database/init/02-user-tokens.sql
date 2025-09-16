-- User Tokens Table for AimStocks
-- This table stores user authentication tokens

CREATE TABLE IF NOT EXISTS user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    token_type VARCHAR(50),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, token_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_type ON user_tokens (token_type);
