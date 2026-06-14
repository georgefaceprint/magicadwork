import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envVars = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key) acc[key.trim()] = value.join('=').trim();
  return acc;
}, {});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log("Attempting login...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'tnklf@icloud.com',
    password: 'Lucas&Kaleb@12',
  });

  if (error) {
    console.error("LOGIN ERROR:", error.message);
  } else {
    console.log("LOGIN SUCCESS! User:", data.user.email);
  }
}

testLogin();
