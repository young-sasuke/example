
// src/utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

// Your Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ccnccdarxrahrpukepmu.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjbmNjZGFyeHJhaHJwdWtlcG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDIzNzIsImV4cCI6MjA2ODIxODM3Mn0.0mfuWLL89f9HtL80tVmn5DrwT6Rh9XWLww3aslEFIYc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)