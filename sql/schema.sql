-- Comet A/B Testing Database Schema
-- Compatible with Supabase/PostgreSQL

-- Enable UUID extension for better ID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A/B Test Groups table
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    group_name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clicks tracking table
CREATE TABLE clicks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id TEXT,
    page_url TEXT,
    CONSTRAINT fk_clicks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_clicks_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_clicks_user_id ON clicks(user_id);
CREATE INDEX idx_clicks_group_id ON clicks(group_id);
CREATE INDEX idx_clicks_timestamp ON clicks(timestamp);
CREATE INDEX idx_users_email ON users(email);

-- Sample data inserts

-- Insert sample users
INSERT INTO users (name, email) VALUES
    ('Alice Johnson', 'alice@example.com'),
    ('Bob Smith', 'bob@example.com'),
    ('Charlie Davis', 'charlie@example.com');

-- Insert A/B test groups
INSERT INTO groups (group_name, description) VALUES
    ('control', 'Control group - original Comet promotion design'),
    ('variant', 'Variant group - new Comet promotion design with enhanced CTA');

-- Insert sample clicks (10 clicks across users and groups)
INSERT INTO clicks (user_id, group_id, session_id, page_url) VALUES
    (1, 1, 'sess_001', '/comet-promo'),
    (2, 2, 'sess_002', '/comet-promo'),
    (1, 1, 'sess_001', '/comet-promo'),
    (3, 1, 'sess_003', '/comet-promo'),
    (2, 2, 'sess_002', '/comet-promo'),
    (1, 1, 'sess_001', '/comet-promo'),
    (3, 2, 'sess_004', '/comet-promo'),
    (2, 2, 'sess_002', '/comet-promo'),
    (3, 1, 'sess_003', '/comet-promo'),
    (1, 2, 'sess_005', '/comet-promo');

-- Create a view for easy A/B test analysis
CREATE VIEW abtest_summary AS
SELECT
    g.group_name,
    COUNT(DISTINCT c.user_id) as unique_users,
    COUNT(c.id) as total_clicks,
    ROUND(COUNT(c.id)::numeric / COUNT(DISTINCT c.user_id), 2) as avg_clicks_per_user
FROM groups g
LEFT JOIN clicks c ON g.id = c.group_id
GROUP BY g.id, g.group_name;