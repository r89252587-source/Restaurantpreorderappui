import { createClient } from '@supabase/supabase-js';

// ⚠️  IMPORTANT: Replace these with your real Supabase credentials.
// Go to: Supabase Dashboard → Project Settings → API
// The anon key MUST start with 'eyJ...' (it is a JWT token).
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yczzrgowkbaolkcmudvx.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_ANON_KEY) {
  console.error(
    '[Supabase] ❌ Missing anon key!\n' +
    'Create a .env file at apps/admin-panel/.env with:\n' +
    '  VITE_SUPABASE_URL=https://<your-project>.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=eyJ...'
  );
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.ZopqoUt20nEV8rw6HtnRmaiXw',
  { auth: { persistSession: true } }
);
