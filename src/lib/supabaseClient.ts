import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(url && anon);

export const supabase = createClient(url || 'https://placeholder.supabase.co', anon || 'placeholder-anon-key');
