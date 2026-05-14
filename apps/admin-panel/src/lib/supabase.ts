import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isValidSupabaseKey = (key: string) =>
  key.startsWith('eyJ') || key.startsWith('sb_publishable_');

export const supabaseConfigError = (() => {
  if (!SUPABASE_URL) return 'Missing VITE_SUPABASE_URL in apps/admin-panel/.env';
  if (!SUPABASE_ANON_KEY) return 'Missing VITE_SUPABASE_ANON_KEY in apps/admin-panel/.env';
  if (!isValidSupabaseKey(SUPABASE_ANON_KEY)) {
    return 'Invalid VITE_SUPABASE_ANON_KEY format. Expected a key starting with "eyJ" or "sb_publishable_".';
  }
  return null;
})();

if (supabaseConfigError) {
  console.error(
    `[Supabase] ❌ ${supabaseConfigError}\n` +
    'Set these variables in apps/admin-panel/.env:\n' +
    '  VITE_SUPABASE_URL=https://<your-project>.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=<eyJ... or sb_publishable_...>'
  );
}

declare global {
  interface Window {
    __adminPanelSupabase?: any;
  }
}

const createSupabaseClient = () =>
  createClient(SUPABASE_URL || 'https://invalid.supabase.co', SUPABASE_ANON_KEY || 'invalid-key', {
    auth: {
      persistSession: true,
      storageKey: 'admin-panel-auth-token',
    },
  });

export const supabase =
  typeof window !== 'undefined'
    ? (window.__adminPanelSupabase ??= createSupabaseClient())
    : createSupabaseClient();
