/*
# Add cost tracking, model pricing, and budget management tables

## Overview
Adds three new tables to support the Advanced Cost Analysis System:
- model_pricing: Per-model cost rates (input/output per 1K tokens) for accurate cost calculation
- cost_logs: Per-request cost records with provider, model, tokens, and computed cost
- budgets: Monthly budget limits with alert thresholds and current spend tracking

## New Tables

### model_pricing
Stores pricing information for each provider/model combination. Each entry has
input_cost_per_1k and output_cost_per_1k (cost in USD per 1,000 tokens). This
replaces the hardcoded COST_PER_1K maps in the frontend with configurable rates.

### cost_logs
Records the computed cost for every request: provider, model, input/output token
counts, total cost, and whether the provider is free (token-free). Used for the
cost analysis dashboard charts and CSV export.

### budgets
Monthly budget configuration: total budget amount, alert threshold percentage,
current month spend, and whether alerts are enabled. The cost dashboard uses
this to show budget progress and trigger alerts.

## Security
- RLS enabled on all new tables.
- All tables allow anon + authenticated CRUD (single-tenant admin panel, no sign-in).
*/

-- model_pricing table
CREATE TABLE IF NOT EXISTS model_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  model text NOT NULL,
  input_cost_per_1k float NOT NULL DEFAULT 0,
  output_cost_per_1k float NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider, model)
);

ALTER TABLE model_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_model_pricing" ON model_pricing;
CREATE POLICY "anon_select_model_pricing" ON model_pricing FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_model_pricing" ON model_pricing;
CREATE POLICY "anon_insert_model_pricing" ON model_pricing FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_model_pricing" ON model_pricing;
CREATE POLICY "anon_update_model_pricing" ON model_pricing FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_model_pricing" ON model_pricing;
CREATE POLICY "anon_delete_model_pricing" ON model_pricing FOR DELETE
  TO anon, authenticated USING (true);

-- cost_logs table
CREATE TABLE IF NOT EXISTS cost_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  model text,
  input_tokens integer NOT NULL DEFAULT 0,
  output_tokens integer NOT NULL DEFAULT 0,
  total_tokens integer NOT NULL DEFAULT 0,
  cost float NOT NULL DEFAULT 0,
  is_free boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cost_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cost_logs" ON cost_logs;
CREATE POLICY "anon_select_cost_logs" ON cost_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cost_logs" ON cost_logs;
CREATE POLICY "anon_insert_cost_logs" ON cost_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cost_logs" ON cost_logs;
CREATE POLICY "anon_delete_cost_logs" ON cost_logs FOR DELETE
  TO anon, authenticated USING (true);

-- budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month text NOT NULL,
  budget_amount float NOT NULL DEFAULT 100,
  alert_threshold float NOT NULL DEFAULT 80,
  current_spend float NOT NULL DEFAULT 0,
  alerts_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(month)
);

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_budgets" ON budgets;
CREATE POLICY "anon_select_budgets" ON budgets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_budgets" ON budgets;
CREATE POLICY "anon_insert_budgets" ON budgets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_budgets" ON budgets;
CREATE POLICY "anon_update_budgets" ON budgets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_budgets" ON budgets;
CREATE POLICY "anon_delete_budgets" ON budgets FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cost_logs_created_at ON cost_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cost_logs_provider ON cost_logs(provider);
CREATE INDEX IF NOT EXISTS idx_model_pricing_provider ON model_pricing(provider);

-- Seed default model pricing
INSERT INTO model_pricing (provider, model, input_cost_per_1k, output_cost_per_1k, is_free) VALUES
  ('OpenAI', 'gpt-4o', 0.005, 0.015, false),
  ('OpenAI', 'gpt-4o-mini', 0.00015, 0.0006, false),
  ('OpenAI', 'gpt-4-turbo', 0.01, 0.03, false),
  ('OpenAI', 'gpt-3.5-turbo', 0.0005, 0.0015, false),
  ('Anthropic', 'claude-3.5-sonnet', 0.003, 0.015, false),
  ('Anthropic', 'claude-3-opus', 0.015, 0.075, false),
  ('Anthropic', 'claude-3-haiku', 0.00025, 0.00125, false),
  ('Google Gemini', 'gemini-1.5-pro', 0.00125, 0.005, false),
  ('Google Gemini', 'gemini-1.5-flash', 0.000075, 0.0003, false),
  ('Google Gemini', 'gemini-2.0-flash', 0.0001, 0.0004, false),
  ('Groq', 'llama-3.3-70b-versatile', 0.00059, 0.00079, false),
  ('Groq', 'llama-3.1-8b-instant', 0.00005, 0.00008, false),
  ('Groq', 'mixtral-8x7b-32768', 0.00024, 0.00024, false),
  ('Cohere', 'command-r-plus', 0.0025, 0.01, false),
  ('Cohere', 'command-r', 0.00015, 0.0006, false),
  ('OpenRouter', 'gpt-4o', 0.005, 0.015, false),
  ('OpenRouter', 'claude-3.5-sonnet', 0.003, 0.015, false),
  ('OpenRouter', 'gemini-pro', 0.0007, 0.001, false),
  ('ChatGPT Browser', 'gpt-4o', 0, 0, true),
  ('ChatGPT Browser', 'gpt-4o-mini', 0, 0, true),
  ('Gemini Browser', 'gemini-1.5-pro', 0, 0, true),
  ('Gemini Browser', 'gemini-1.5-flash', 0, 0, true)
ON CONFLICT (provider, model) DO NOTHING;

-- Seed current month budget
INSERT INTO budgets (month, budget_amount, alert_threshold, current_spend, alerts_enabled)
VALUES (to_char(now(), 'YYYY-MM'), 100, 80, 0, true)
ON CONFLICT (month) DO NOTHING;