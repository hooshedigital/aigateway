/*
# Add browser session management, risk scoring, alert config, and usage pattern tables

## Overview
Adds four new tables to support the Browser API Management System:
- browser_sessions: Pool of browser sessions for token-free providers with health monitoring
- risk_scores: Per-provider risk scoring with automatic quarantine support
- alert_config: Configurable alert thresholds and webhook URLs
- usage_patterns: Aggregated usage pattern data for anomaly detection

## New Tables

### browser_sessions
Stores browser sessions used for token-free provider access. Each session has a token/cookie,
an associated provider, health status, rotation tracking, and expiration prediction. Sessions
are rotated automatically to avoid detection.

### risk_scores
Stores per-provider risk scores calculated from success rate, response time, error patterns,
and detection signals. Providers with risk scores above a threshold are automatically quarantined.

### alert_config
Key-value configuration for the alert system: webhook URLs, email recipients, alert thresholds,
and notification preferences. Used by the edge function to determine when to fire alerts.

### usage_patterns
Stores hourly usage pattern data per provider for anomaly detection and behavioral analytics.
Tracks request count, success rate, avg response time, and uniqueness score per hour.

## Security
- RLS enabled on all new tables.
- All tables allow anon + authenticated CRUD (single-tenant admin panel, no sign-in).
- Session tokens are stored as plain text (single-tenant; encryption would be added in production).
*/

-- browser_sessions table
CREATE TABLE IF NOT EXISTS browser_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  token text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'rotating', 'quarantined', 'failed')),
  health_score float NOT NULL DEFAULT 100,
  requests_count integer NOT NULL DEFAULT 0,
  last_used timestamptz,
  last_checked timestamptz DEFAULT now(),
  expires_at timestamptz,
  user_agent text,
  ip_address text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE browser_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_browser_sessions" ON browser_sessions;
CREATE POLICY "anon_select_browser_sessions" ON browser_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_browser_sessions" ON browser_sessions;
CREATE POLICY "anon_insert_browser_sessions" ON browser_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_browser_sessions" ON browser_sessions;
CREATE POLICY "anon_update_browser_sessions" ON browser_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_browser_sessions" ON browser_sessions;
CREATE POLICY "anon_delete_browser_sessions" ON browser_sessions FOR DELETE
  TO anon, authenticated USING (true);

-- risk_scores table
CREATE TABLE IF NOT EXISTS risk_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  risk_level text NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_score float NOT NULL DEFAULT 0,
  success_rate float NOT NULL DEFAULT 100,
  avg_response_time float NOT NULL DEFAULT 0,
  error_pattern_score float NOT NULL DEFAULT 0,
  detection_signals integer NOT NULL DEFAULT 0,
  quarantined boolean NOT NULL DEFAULT false,
  calculated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider, calculated_at)
);

ALTER TABLE risk_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_risk_scores" ON risk_scores;
CREATE POLICY "anon_select_risk_scores" ON risk_scores FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_risk_scores" ON risk_scores;
CREATE POLICY "anon_insert_risk_scores" ON risk_scores FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_risk_scores" ON risk_scores;
CREATE POLICY "anon_delete_risk_scores" ON risk_scores FOR DELETE
  TO anon, authenticated USING (true);

-- alert_config table
CREATE TABLE IF NOT EXISTS alert_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE alert_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_alert_config" ON alert_config;
CREATE POLICY "anon_select_alert_config" ON alert_config FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_alert_config" ON alert_config;
CREATE POLICY "anon_insert_alert_config" ON alert_config FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_alert_config" ON alert_config;
CREATE POLICY "anon_update_alert_config" ON alert_config FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_alert_config" ON alert_config;
CREATE POLICY "anon_delete_alert_config" ON alert_config FOR DELETE
  TO anon, authenticated USING (true);

-- usage_patterns table
CREATE TABLE IF NOT EXISTS usage_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  hour_bucket timestamptz NOT NULL DEFAULT date_trunc('hour', now()),
  request_count integer NOT NULL DEFAULT 0,
  success_count integer NOT NULL DEFAULT 0,
  avg_response_time float NOT NULL DEFAULT 0,
  unique_models integer NOT NULL DEFAULT 0,
  uniqueness_score float NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider, hour_bucket)
);

ALTER TABLE usage_patterns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_usage_patterns" ON usage_patterns;
CREATE POLICY "anon_select_usage_patterns" ON usage_patterns FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_usage_patterns" ON usage_patterns;
CREATE POLICY "anon_insert_usage_patterns" ON usage_patterns FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_usage_patterns" ON usage_patterns;
CREATE POLICY "anon_update_usage_patterns" ON usage_patterns FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_usage_patterns" ON usage_patterns;
CREATE POLICY "anon_delete_usage_patterns" ON usage_patterns FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_browser_sessions_status ON browser_sessions(status);
CREATE INDEX IF NOT EXISTS idx_browser_sessions_provider ON browser_sessions(provider);
CREATE INDEX IF NOT EXISTS idx_risk_scores_provider ON risk_scores(provider);
CREATE INDEX IF NOT EXISTS idx_risk_scores_calculated ON risk_scores(calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_patterns_provider ON usage_patterns(provider);
CREATE INDEX IF NOT EXISTS idx_usage_patterns_hour ON usage_patterns(hour_bucket DESC);

-- Seed default alert config
INSERT INTO alert_config (key, value, enabled) VALUES
  ('webhook_url', '', true),
  ('alert_email', '', true),
  ('risk_threshold_high', '70', true),
  ('risk_threshold_critical', '90', true),
  ('auto_quarantine', 'true', true),
  ('session_rotation_interval', '3600', true),
  ('max_requests_per_session', '100', true),
  ('alert_on_detection', 'true', true),
  ('alert_on_session_expiry', 'true', true),
  ('alert_on_provider_down', 'true', true)
ON CONFLICT (key) DO NOTHING;
