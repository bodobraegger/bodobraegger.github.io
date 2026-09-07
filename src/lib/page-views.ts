// Talks to Supabase PostgREST directly over fetch so page views don't pull
// in the full @supabase/supabase-js client (auth, realtime, storage).
const USER_ID_STORAGE_KEY = 'drawable-pen-user-id'
const RPC_INCREMENT_PAGE_VIEW_PATH = '/rest/v1/rpc/increment_page_view'
const REST_PAGE_VIEWS_PATH = '/rest/v1/page_views'

// Generate or retrieve persistent user ID for RLS
export function getUserId(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // SSR/build time - return a placeholder
    return 'ssr-placeholder'
  }

  try {
    let userId = localStorage.getItem(USER_ID_STORAGE_KEY)
    if (!userId) {
      userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(USER_ID_STORAGE_KEY, userId)
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

interface SupabaseConfig {
  key: string
  url: string
}

// Add your Supabase credentials to .env file:
// VITE_SUPABASE_URL=your-project-url
// VITE_SUPABASE_ANON_KEY=your-anon-key
function getSupabaseConfig(): SupabaseConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL || ''
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  return url && key ? { key, url } : null
}

function buildHeaders(config: SupabaseConfig): HeadersInit {
  return {
    'Authorization': `Bearer ${config.key}`,
    'Content-Type': 'application/json',
    'apikey': config.key,
    'x-user-id': getUserId(), // Send user ID with every request for RLS
  }
}

export async function trackPageView(path: string): Promise<number | null> {
  if (typeof window === 'undefined')
    return null

  const config = getSupabaseConfig()
  if (!config)
    return null

  try {
    const response = await fetch(`${config.url}${RPC_INCREMENT_PAGE_VIEW_PATH}`, {
      body: JSON.stringify({ path }),
      headers: buildHeaders(config),
      keepalive: true,
      method: 'POST',
    })

    if (!response.ok)
      return null

    const data = await response.json()
    return typeof data === 'number' ? data : null
  }
  catch {
    // Silent fail - don't impact page load
    return null
  }
}

export async function getPageViewCounts(paths: string[]): Promise<Map<string, number>> {
  if (typeof window === 'undefined' || paths.length === 0)
    return new Map()

  const config = getSupabaseConfig()
  if (!config)
    return new Map()

  try {
    const pathList = paths.map(path => `"${encodeURIComponent(path)}"`).join(',')
    const url = `${config.url}${REST_PAGE_VIEWS_PATH}?select=page_path,view_count&page_path=in.(${pathList})`
    const response = await fetch(url, { headers: buildHeaders(config) })

    if (!response.ok)
      return new Map()

    const rows: { page_path: string, view_count: number }[] = await response.json()
    return new Map(rows.map(row => [row.page_path, row.view_count]))
  }
  catch {
    // Silent fail - don't impact page load
    return new Map()
  }
}
