
import { createClient } from '@supabase/supabase-js';

// Public keys are safe to expose in the client
const supabaseUrl = 'https://REPLACE_WITH_YOUR_SUPABASE_URL.supabase.co';
const supabaseAnonKey = 'REPLACE_WITH_YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
