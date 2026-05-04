import { ref } from 'vue'
import { supabase } from '~/lib/supabase'

export function usePageViews(pagePath: string) {
  const viewCount = ref<number>(0)

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

  return {
    viewCount,
    trackView,
  }
}
