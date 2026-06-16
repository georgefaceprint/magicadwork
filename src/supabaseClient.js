import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qmegympyoqwfckktdgta.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_VQ3BHVDZB2r3iccIwSvzGA_OR0KIFTB'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
