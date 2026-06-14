import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qmegympyoqwfckktdgta.supabase.co'
const supabaseAnonKey = 'sb_publishable_VQ3BHVDZB2r3iccIwSvzGA_OR0KIFTB'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
