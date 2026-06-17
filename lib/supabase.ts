import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ygqqwmjhhdgnhvjtnfjk.supabase.co'
const supabaseAnonKey = 'sb_publishable_qkoegnjQO-rGlFNbU6xchw_noLWt-uy'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
