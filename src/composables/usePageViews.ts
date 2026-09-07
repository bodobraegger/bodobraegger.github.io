import { ref } from 'vue'
import { getPageViewCounts, trackPageView } from '~/lib/page-views'
import { whenIdle } from '~/logics/idle'

// Batches fetchViewCount() calls made in the same tick into a single
// getPageViewCounts request, so a list page with many items sends one
// request instead of one per item.
const pendingCallbacksByPath = new Map<string, ((count: number) => void)[]>()
let batchScheduled = false

function flushBatch() {
  batchScheduled = false
  const callbacksByPath = pendingCallbacksByPath
  pendingCallbacksByPath.clear()

  void getPageViewCounts([...callbacksByPath.keys()]).then((counts) => {
    for (const [path, callbacks] of callbacksByPath) {
      const count = counts.get(path)
      if (count !== undefined)
        callbacks.forEach(callback => callback(count))
    }
  })
}

function requestViewCount(path: string, callback: (count: number) => void) {
  const callbacks = pendingCallbacksByPath.get(path) ?? []
  callbacks.push(callback)
  pendingCallbacksByPath.set(path, callbacks)

  if (!batchScheduled) {
    batchScheduled = true
    queueMicrotask(flushBatch)
  }
}

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

  // Read the current count without incrementing it
  function fetchViewCount() {
    if (!pagePath)
      return

    requestViewCount(pagePath, (count) => {
      viewCount.value = count
    })
  }

  return {
    fetchViewCount,
    trackView,
    viewCount,
  }
}
