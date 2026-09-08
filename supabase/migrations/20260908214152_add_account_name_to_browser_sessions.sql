/*
# Add account_name column to browser_sessions

## Overview
Adds an `account_name` column to the `browser_sessions` table to support
labeling sessions with a human-readable account name (e.g. "ChatGPT Account #1").
This enables managing multiple accounts per provider and distinguishing
between them in the session pool.

## Changes
- Added `account_name` (text, nullable) to `browser_sessions`.

## Security
- No RLS policy changes needed — the table already has full CRUD policies.
*/

ALTER TABLE browser_sessions
  ADD COLUMN IF NOT EXISTS account_name text;