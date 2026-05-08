import { createClient } from '@supabase/supabase-js'

// Generate or retrieve persistent user ID for RLS
function getUserId(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // SSR/build time - return a placeholder
    return 'ssr-placeholder'
  }

  const storageKey = 'drawable-pen-user-id'
  try {
    let userId = localStorage.getItem(storageKey)
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(storageKey, userId)
    }
    return userId
  }
  catch {
    // Fallback to session-based ID if localStorage unavailable
    if (!(window as any).__drawablePenUserId__) {
      (window as any).__drawablePenUserId__ = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    return (window as any).__drawablePenUserId__
  }
}

// Add your Supabase credentials to .env file:
// VITE_SUPABASE_URL=your-project-url
// VITE_SUPABASE_ANON_KEY=your-anon-key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          'x-user-id': getUserId(), // Send user ID with every request for RLS
        },
      },
    })
  : null
