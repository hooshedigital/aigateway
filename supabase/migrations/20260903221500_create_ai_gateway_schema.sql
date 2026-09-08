/*
# AI Gateway Schema

## Overview
Creates the complete database schema for an AI Gateway system that routes requests
across multiple AI providers (token-free and API-key based) with automatic fallback.

## New Tables

### providers
Stores AI provider configurations. Each provider has a type (token_free or api_key),
priority (lower = higher priority), status (active/inactive), and encrypted API key.
The `config` JSONB column stores provider-specific settings (model mappings, base URL, etc.).

### settings
Key-value store for global gateway settings (access code, rate limits, CORS origins, etc.).

### request_logs
Records every request processed by the gateway: which provider was used, which model,
response status, response time, token count, and timestamp. Used for the dashboard
analytics and the logs viewer.

### usage_stats
Daily aggregated usage statistics per provider: total requests, successful requests,
total tokens used, total errors. Used for dashboard charts and provider health monitoring.

## Security
- RLS enabled on all tables.
- All tables allow anon + authenticated CRUD (single-tenant admin panel, no sign-in).
- API keys stored encrypted at rest via application-level encryption.
*/

-- Providers table
CREATE TABLE IF NOT EXISTS providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'api_key' CHECK (type IN ('token_free', 'api_key')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  api_key text,
  base_url text,
  models text[] DEFAULT '{}',
  priority integer NOT NULL DEFAULT 100,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_providers" ON providers;
CREATE POLICY "anon_select_providers" ON providers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_providers" ON providers;
CREATE POLICY "anon_insert_providers" ON providers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_providers" ON providers;
CREATE POLICY "anon_update_providers" ON providers FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_providers" ON providers;
CREATE POLICY "anon_delete_providers" ON providers FOR DELETE
  TO anon, authenticated USING (true);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings" ON settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_settings" ON settings;
CREATE POLICY "anon_insert_settings" ON settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_settings" ON settings;
CREATE POLICY "anon_update_settings" ON settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_settings" ON settings;
CREATE POLICY "anon_delete_settings" ON settings FOR DELETE
  TO anon, authenticated USING (true);

-- Request logs table
CREATE TABLE IF NOT EXISTS request_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  model text,
  status text NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'error')),
  response_time float,
  tokens_used integer DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE request_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_logs" ON request_logs;
CREATE POLICY "anon_select_logs" ON request_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_logs" ON request_logs;
CREATE POLICY "anon_insert_logs" ON request_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_logs" ON request_logs;
CREATE POLICY "anon_update_logs" ON request_logs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_logs" ON request_logs;
CREATE POLICY "anon_delete_logs" ON request_logs FOR DELETE
  TO anon, authenticated USING (true);

-- Usage stats table
CREATE TABLE IF NOT EXISTS usage_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  requests_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  tokens_used integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider, date)
);

ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_usage" ON usage_stats;
CREATE POLICY "anon_select_usage" ON usage_stats FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_usage" ON usage_stats;
CREATE POLICY "anon_insert_usage" ON usage_stats FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_usage" ON usage_stats;
CREATE POLICY "anon_update_usage" ON usage_stats FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_usage" ON usage_stats;
CREATE POLICY "anon_delete_usage" ON usage_stats FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);
CREATE INDEX IF NOT EXISTS idx_providers_priority ON providers(priority);
CREATE INDEX IF NOT EXISTS idx_request_logs_created_at ON request_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_request_logs_provider ON request_logs(provider);
CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON usage_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_usage_stats_provider ON usage_stats(provider);

-- Seed default settings
INSERT INTO settings (key, value) VALUES
  ('access_code', 'hooshedigital-gateway-2024'),
  ('rate_limit_per_minute', '60'),
  ('cors_origins', '*'),
  ('gateway_name', 'AI Gateway'),
  ('default_model', 'gpt-4o'),
  ('fallback_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

-- Seed default providers
INSERT INTO providers (name, type, status, priority, base_url, models, config) VALUES
  ('OpenRouter', 'api_key', 'inactive', 10, 'https://openrouter.ai/api/v1',
   ARRAY['gpt-4o', 'gpt-4o-mini', 'claude-3.5-sonnet', 'gemini-pro'],
   '{"description": "Access 100+ models through OpenRouter"}'::jsonb),
  ('Groq', 'api_key', 'inactive', 20, 'https://api.groq.com/openai/v1',
   ARRAY['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
   '{"description": "Ultra-fast inference for open-source models"}'::jsonb),
  ('Google Gemini', 'api_key', 'inactive', 30, 'https://generativelanguage.googleapis.com/v1beta',
   ARRAY['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'],
   '{"description": "Google AI models with generous free tier"}'::jsonb),
  ('Cohere', 'api_key', 'inactive', 40, 'https://api.cohere.ai/v1',
   ARRAY['command-r-plus', 'command-r', 'command'],
   '{"description": "Cohere Command models for enterprise"}'::jsonb),
  ('OpenAI', 'api_key', 'inactive', 50, 'https://api.openai.com/v1',
   ARRAY['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
   '{"description": "OpenAI GPT models - premium tier"}'::jsonb),
  ('Anthropic', 'api_key', 'inactive', 60, 'https://api.anthropic.com/v1',
   ARRAY['claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
   '{"description": "Claude models - premium tier"}'::jsonb),
  ('ChatGPT Browser', 'token_free', 'inactive', 70, '',
   ARRAY['gpt-4o', 'gpt-4o-mini'],
   '{"description": "Token-free access via browser session (experimental)"}'::jsonb),
  ('Gemini Browser', 'token_free', 'inactive', 80, '',
   ARRAY['gemini-1.5-pro', 'gemini-1.5-flash'],
   '{"description": "Token-free access via browser session (experimental)"}'::jsonb)
ON CONFLICT DO NOTHING;
