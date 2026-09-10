import { ref } from 'vue'
import { getPageViewCounts, trackPageView } from '~/lib/page-views'
import { whenIdle } from '~/logics/idle'

export function usePageViews(pagePath: string) {
  const viewCount = ref<number | null>(null)

  function trackView() {
    if (!pagePath)
      return

    // Deferred so the request doesn't compete with hydration
    whenIdle(() => {
      void trackPageView(pagePath).then((count) => {
        if (count !== null)
          viewCount.value = count
      })
    })
  }

  // Read the current count without incrementing it.
  // Non-blocking async - each item fetches independently so the list
  // fills in as counts arrive instead of waiting on a single request.
  function fetchViewCount() {
    if (!pagePath)
      return

    void getPageViewCounts([pagePath]).then((counts) => {
      const count = counts.get(pagePath)
      if (count !== undefined)
        viewCount.value = count
    })
  }

  return {
    fetchViewCount,
    trackView,
    viewCount,
  }
}
