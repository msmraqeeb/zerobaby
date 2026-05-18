
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://upbkfhtbbqxsloihejvz.supabase.co';
const supabaseAnonKey = 'sb_publishable_FVSNVq1PgVxtkrerDHO_Qw_5I_Qo83X';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
