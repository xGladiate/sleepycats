/*
Initialize and Connect to Supabase Client
*/

import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oevremefpdtgmnxapquc.supabase.co'; 
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ldnJlbWVmcGR0Z21ueGFwcXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk4MDQ2NTYsImV4cCI6MjAzNTM4MDY1Nn0.O5_BNF6C7jyGls91dEigLtqqSH4wLJRd35E9or8WB7w"; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})