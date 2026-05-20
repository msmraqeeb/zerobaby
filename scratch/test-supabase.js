import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://upbkfhtbbqxsloihejvz.supabase.co';
const supabaseAnonKey = 'sb_publishable_FVSNVq1PgVxtkrerDHO_Qw_5I_Qo83X';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (error) {
      console.error('Supabase query failed:', error.message);
    } else {
      console.log('Supabase connection successful! Fetched data:', data);
    }
  } catch (err) {
    console.error('Unexpected error during testing:', err.message);
  }
}

testConnection();
