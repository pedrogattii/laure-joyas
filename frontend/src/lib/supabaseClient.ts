import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rnjzdwqrjtmhevuywyny.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuanpkd3FyanRtaGV2dXl3eW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2MDc2NDAsImV4cCI6MjEwMTE4MzY0MH0.MBp01AzqvHG2Ykq-nGT0Q9ntCc1WPqPWgwqzEnIgK0o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
