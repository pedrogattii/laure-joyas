import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rnjzdwqrjtmhevuywyny.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && typeof window !== 'undefined') {
  console.warn('[Security Notice] NEXT_PUBLIC_SUPABASE_ANON_KEY missing from environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

