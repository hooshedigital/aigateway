/*
# Add users, audit_logs, and notifications tables

## Overview
Adds three new tables to support the enhanced admin panel:
- gateway_users: managed API users with role-based access (admin/viewer)
- audit_logs: records all administrative actions for compliance
- notifications: system alerts and informational messages

## New Tables

### gateway_users
Stores API users who can access the gateway. Each user has a role (admin/viewer),
an API key for authentication, and status (active/disabled). This is separate from
Supabase auth — it's a lightweight user management system for the gateway panel.

### audit_logs
Records every administrative action: who did what, when, and what was affected.
Used for the activity timeline and compliance auditing.

### notifications
System notifications displayed in the admin panel: provider down alerts,
rate limit warnings, configuration changes, etc.

## Security
- RLS enabled on all new tables.
- All tables allow anon + authenticated CRUD (single-tenant admin panel, no sign-in).
- API keys in gateway_users are stored as plain text (the panel is single-tenant;
  encryption would be added in a multi-tenant production deployment).
*/

-- gateway_users table
CREATE TABLE IF NOT EXISTS gateway_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  api_key text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gateway_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_gateway_users" ON gateway_users;
CREATE POLICY "anon_select_gateway_users" ON gateway_users FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_gateway_users" ON gateway_users;
CREATE POLICY "anon_insert_gateway_users" ON gateway_users FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_gateway_users" ON gateway_users;
CREATE POLICY "anon_update_gateway_users" ON gateway_users FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_gateway_users" ON gateway_users;
CREATE POLICY "anon_delete_gateway_users" ON gateway_users FOR DELETE
  TO anon, authenticated USING (true);

-- audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  details text,
  performed_by text NOT NULL DEFAULT 'system',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_audit_logs" ON audit_logs;
CREATE POLICY "anon_select_audit_logs" ON audit_logs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_audit_logs" ON audit_logs;
CREATE POLICY "anon_insert_audit_logs" ON audit_logs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_audit_logs" ON audit_logs;
CREATE POLICY "anon_delete_audit_logs" ON audit_logs FOR DELETE
  TO anon, authenticated USING (true);

-- notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  title text NOT NULL,
  message text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gateway_users_status ON gateway_users(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Seed a default admin user
INSERT INTO gateway_users (name, email, role, status, api_key)
VALUES ('Admin', 'admin@hooshedigital.ir', 'admin', 'active', 'gw-admin-key-2024')
ON CONFLICT (email) DO NOTHING;

-- Seed a welcome notification
INSERT INTO notifications (type, title, message)
VALUES ('success', 'Gateway Initialized', 'The AI Gateway has been set up successfully. Configure your providers to get started.')
ON CONFLICT DO NOTHING;
