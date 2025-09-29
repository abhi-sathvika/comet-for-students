-- Comet A/B Test Analysis Queries
-- Sample queries for analyzing A/B test performance

-- 1. Click-Through Rate (CTR) by Group
-- Shows total clicks and unique users per group with calculated CTR
SELECT
    g.group_name,
    COUNT(DISTINCT c.user_id) as unique_users,
    COUNT(c.id) as total_clicks,
    ROUND(
        (COUNT(c.id)::numeric / NULLIF(COUNT(DISTINCT c.user_id), 0)),
        2
    ) as avg_clicks_per_user,
    ROUND(
        (COUNT(DISTINCT c.user_id)::numeric / (SELECT COUNT(*) FROM users) * 100),
        2
    ) as user_participation_rate
FROM groups g
LEFT JOIN clicks c ON g.id = c.group_id
GROUP BY g.id, g.group_name
ORDER BY g.group_name;

-- 2. Total Clicks and Engagement per User
-- Shows individual user engagement across groups
SELECT
    u.name,
    u.email,
    g.group_name,
    COUNT(c.id) as total_clicks,
    MIN(c.timestamp) as first_click,
    MAX(c.timestamp) as last_click,
    EXTRACT(EPOCH FROM (MAX(c.timestamp) - MIN(c.timestamp)))/3600 as engagement_duration_hours
FROM users u
LEFT JOIN clicks c ON u.id = c.user_id
LEFT JOIN groups g ON c.group_id = g.id
GROUP BY u.id, u.name, u.email, g.group_name
ORDER BY total_clicks DESC, u.name;

-- 3. Conversion Rate (Users who clicked at least once)
-- Compares conversion between control and variant groups
WITH user_conversions AS (
    SELECT
        g.group_name,
        COUNT(DISTINCT c.user_id) as converted_users,
        COUNT(DISTINCT u.id) as total_users_exposed
    FROM groups g
    CROSS JOIN users u  -- Assumes all users were exposed to test
    LEFT JOIN clicks c ON g.id = c.group_id AND u.id = c.user_id
    GROUP BY g.id, g.group_name
)
SELECT
    group_name,
    converted_users,
    total_users_exposed,
    ROUND(
        (converted_users::numeric / NULLIF(total_users_exposed, 0) * 100),
        2
    ) as conversion_rate_percent
FROM user_conversions
ORDER BY group_name;

-- 4. Hourly Click Distribution
-- Shows when users are most active (useful for timing promotions)
SELECT
    g.group_name,
    EXTRACT(HOUR FROM c.timestamp) as hour_of_day,
    COUNT(c.id) as clicks
FROM clicks c
JOIN groups g ON c.group_id = g.id
GROUP BY g.group_name, EXTRACT(HOUR FROM c.timestamp)
ORDER BY g.group_name, hour_of_day;

-- 5. Daily Performance Comparison
-- Compares daily performance between groups
SELECT
    DATE(c.timestamp) as click_date,
    g.group_name,
    COUNT(c.id) as daily_clicks,
    COUNT(DISTINCT c.user_id) as daily_unique_users
FROM clicks c
JOIN groups g ON c.group_id = g.id
GROUP BY DATE(c.timestamp), g.group_name
ORDER BY click_date DESC, g.group_name;

-- 6. Statistical Significance Test Data
-- Provides data needed for statistical significance testing
SELECT
    g.group_name,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT CASE WHEN c.user_id IS NOT NULL THEN c.user_id END) as converted_users,
    COUNT(c.id) as total_clicks,
    ROUND(AVG(user_clicks.click_count), 2) as avg_clicks_per_converted_user
FROM groups g
CROSS JOIN users u
LEFT JOIN clicks c ON g.id = c.group_id AND u.id = c.user_id
LEFT JOIN (
    SELECT user_id, group_id, COUNT(*) as click_count
    FROM clicks
    GROUP BY user_id, group_id
) user_clicks ON u.id = user_clicks.user_id AND g.id = user_clicks.group_id
GROUP BY g.id, g.group_name
ORDER BY g.group_name;

-- 7. Session Analysis
-- Analyzes user sessions and repeat behavior
SELECT
    g.group_name,
    c.session_id,
    COUNT(c.id) as clicks_in_session,
    COUNT(DISTINCT c.user_id) as users_in_session,
    MIN(c.timestamp) as session_start,
    MAX(c.timestamp) as session_end,
    EXTRACT(EPOCH FROM (MAX(c.timestamp) - MIN(c.timestamp)))/60 as session_duration_minutes
FROM clicks c
JOIN groups g ON c.group_id = g.id
WHERE c.session_id IS NOT NULL
GROUP BY g.group_name, c.session_id
ORDER BY clicks_in_session DESC;

-- 8. Quick Summary View (Use the pre-created view)
-- Simple summary using the view created in schema.sql
SELECT * FROM abtest_summary;