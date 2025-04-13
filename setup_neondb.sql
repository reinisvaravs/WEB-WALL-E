-- Enable the vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create tables for the WALL-E web chatbot

-- Table for storing knowledge base vectors
CREATE TABLE IF NOT EXISTS vectors (
    id SERIAL PRIMARY KEY,
    file_name TEXT NOT NULL,
    chunk TEXT NOT NULL,
    embedding vector(1536) NOT NULL
);

-- Table for tracking file changes
CREATE TABLE IF NOT EXISTS file_hashes (
    file_name TEXT PRIMARY KEY,
    hash TEXT NOT NULL
);

-- Table for bot configuration
CREATE TABLE IF NOT EXISTS bot_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Table for user logs (token usage)
CREATE TABLE IF NOT EXISTS user_logs (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    model TEXT NOT NULL,
    tokens INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for bot statistics
CREATE TABLE IF NOT EXISTS bot_stats (
    stat_key TEXT PRIMARY KEY,
    value INTEGER NOT NULL DEFAULT 0
);

-- Table for user conversation memory
CREATE TABLE IF NOT EXISTS user_memory (
    user_id TEXT PRIMARY KEY,
    memory JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Insert default configuration
INSERT INTO bot_config (key, value) 
VALUES ('gpt_model', 'gpt-3.5-turbo')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vectors_file_name ON vectors(file_name);
CREATE INDEX IF NOT EXISTS idx_user_logs_user_id ON user_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_logs_created_at ON user_logs(created_at); 