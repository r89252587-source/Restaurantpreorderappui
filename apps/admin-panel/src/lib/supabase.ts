import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yczzrgowkbaolkcmudvx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UiFLTQw38cUsMU6tchu04w_zEHxf6uG';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
