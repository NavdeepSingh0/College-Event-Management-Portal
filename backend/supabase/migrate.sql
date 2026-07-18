-- ============================================================
-- CU Events — Supabase Schema Migration
-- Run this in Supabase SQL Editor to add missing columns/tables
-- ============================================================

-- Fix users table: add missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'attendee';
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_type TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS college TEXT DEFAULT 'Chandigarh University';
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Fix events table: add missing columns
ALTER TABLE events ADD COLUMN IF NOT EXISTS poster_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
ALTER TABLE events ADD COLUMN IF NOT EXISTS allow_external INTEGER DEFAULT 1;

-- Fix registrations table: add missing columns
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS participant_name TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS participant_college TEXT;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS participant_phone TEXT;

-- Create event_analytics table
CREATE TABLE IF NOT EXISTS event_analytics (
  id BIGSERIAL PRIMARY KEY,
  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id)
);

-- Create club_memberships table
CREATE TABLE IF NOT EXISTS club_memberships (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  club_id INTEGER NOT NULL,
  club_name TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, club_id)
);

-- Disable RLS for dev (server is trusted)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE otps DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE club_memberships DISABLE ROW LEVEL SECURITY;

-- Ensure demo users have correct roles
UPDATE users SET role = 'attendee', college = 'Chandigarh University' WHERE email = 'priya@cuchd.in';
UPDATE users SET role = 'organiser', organization_name = 'CU Coding Club', organization_type = 'university_club', college = 'Chandigarh University' WHERE email = 'rahul.organiser@gmail.com';

-- RPC functions
CREATE OR REPLACE FUNCTION increment_registered_count(p_event_id BIGINT)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE events SET registered_count = registered_count + 1 WHERE id = p_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_registered_count(p_event_id BIGINT)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE events SET registered_count = GREATEST(0, registered_count - 1) WHERE id = p_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_event_views(p_event_id BIGINT)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO event_analytics (event_id, views) VALUES (p_event_id, 1)
  ON CONFLICT (event_id) DO UPDATE SET views = event_analytics.views + 1, updated_at = NOW();
END;
$$;
