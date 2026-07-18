// ============================================
// CU Events — Supabase Database Client
// Replaces SQLite with Supabase (PostgreSQL)
// ============================================
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🔗 Connected to Supabase:', SUPABASE_URL);

module.exports = supabase;
