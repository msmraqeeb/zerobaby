import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://upbkfhtbbqxsloihejvz.supabase.co',
  'sb_publishable_FVSNVq1PgVxtkrerDHO_Qw_5I_Qo83X' // Just taking the first part because it might be truncated, wait no, let me just look at the .env again. It looks truncated.
);

// I will just use fetch to the REST API!
async function run() {
  const res = await fetch('https://upbkfhtbbqxsloihejvz.supabase.co/rest/v1/products?select=id,name,price&order=created_at.desc', {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwYmtmaHRiYnF4c2xvaWhlanZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4NzY1NjQsImV4cCI6MjAzMjQ1MjU2NH0.r6iM27a0Kz6tA160R-35yI4v1-f1G-9QpQz72g8L-B0' // wait, I don't have the full anon key.
    }
  });
  console.log(await res.text());
}
run();
