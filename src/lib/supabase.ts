import type { SupabaseClient } from '@supabase/supabase-js'
import { getUserId } from './page-views'

export { getUserId }

// Add your Supabase credentials to .env file:
// VITE_SUPABASE_URL=your-project-url
// VITE_SUPABASE_ANON_KEY=your-anon-key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let supabaseClientPromise: Promise<SupabaseClient | null> | null = null

// Lazily loads @supabase/supabase-js so the drawing components (the only
// consumers that need auth/realtime/storage) don't pull it into the entry
// chunk. The client is created once and memoized across calls.
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!supabaseClientPromise) {
    supabaseClientPromise = !supabaseUrl || !supabaseKey
      ? Promise.resolve(null)
      : import('@supabase/supabase-js').then(({ createClient }) =>
          createClient(supabaseUrl, supabaseKey, {
            global: {
              headers: {
                'x-user-id': getUserId(), // Send user ID with every request for RLS
              },
            },
          }),
        )
  }
  return supabaseClientPromise
}
