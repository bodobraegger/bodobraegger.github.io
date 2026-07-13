import { ref } from 'vue'
import { supabase } from '~/lib/supabase'

export function usePageViews(pagePath: string) {
  const viewCount = ref<number | null>(null)

  function trackView() {
    if (!supabase || !pagePath)
      return

    // Non-blocking async - don't await
    void (async () => {
      try {
        const { data } = await supabase
          .rpc('increment_page_view', { path: pagePath })

        if (data)
          viewCount.value = data
      }
      catch {
        // Silent fail - don't impact page load
      }
    })()
  }

  // Read the current count without incrementing it
  function fetchViewCount() {
    if (!supabase || !pagePath)
      return

    // Non-blocking async - don't await
    void (async () => {
      try {
        const { data } = await supabase
          .from('page_views')
          .select('view_count')
          .eq('page_path', pagePath)
          .maybeSingle()

        if (data)
          viewCount.value = data.view_count
      }
      catch {
        // Silent fail - don't impact page load
      }
    })()
  }

  return {
    viewCount,
    trackView,
    fetchViewCount,
  }
}
