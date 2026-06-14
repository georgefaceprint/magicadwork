import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qmegympyoqwfckktdgta.supabase.co';
const supabaseKey = 'sb_publishable_VQ3BHVDZB2r3iccIwSvzGA_OR0KIFTB';

const supabase = createClient(supabaseUrl, supabaseKey);

supabase.auth.signInWithPassword({ email: 'tnklf@icloud.com', password: 'Lucas&Kaleb@12' })
  .then(({data, error}) => {
    if (error) console.error("Login attempt error:", error.message);
    else console.log("Success?", data.user?.email);
  })
  .catch(console.error);
