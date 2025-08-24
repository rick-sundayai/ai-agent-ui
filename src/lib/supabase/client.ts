import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  console.log('🔧 Creating Supabase client:', {
    url: url ? `${url.substring(0, 30)}...` : 'MISSING',
    key: key ? `${key.substring(0, 20)}...` : 'MISSING'
  })
  
  return createBrowserClient(url, key)
}