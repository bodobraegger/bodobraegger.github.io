import { ref } from 'vue'
import { getPageViewCounts, trackPageView } from '~/lib/page-views'
import { whenIdle } from '~/logics/idle'

/**
 * The gap between two counts appearing. A list fills in one entry at a time,
 * which is the look this keeps; the batch below only replaces the one request
 * per entry that used to produce it.
 */
const REVEAL_STEP_MS = 60

interface QueueEntry {
  path: string
  reveal: (count: number | undefined) => void
}

let queue: QueueEntry[] = []
let flushScheduled = false

/**
 * Every item of a list asks for its count while it mounts, so the asks all
 * land in the same tick and one request answers them together. The flush waits
 * on a timer rather than a microtask, because Vue runs the mounted hooks of a
 * list across several microtasks and an earlier flush would split the batch.
 */
function queueViewCount(path: string): Promise<number | undefined> {
  return new Promise((resolve) => {
    queue.push({ path, reveal: resolve })

    if (flushScheduled)
      return
    flushScheduled = true
    setTimeout(flushQueue, 0)
  })
}

async function flushQueue() {
  const batch = queue
  queue = []
  flushScheduled = false

  const counts = await getPageViewCounts(batch.map(entry => entry.path))

  batch.forEach((entry, position) => {
    setTimeout(() => entry.reveal(counts.get(entry.path)), position * REVEAL_STEP_MS)
  })
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

  // Read the current count without incrementing it. The count appears one
  // entry after another, in the order the list holds them.
  function fetchViewCount() {
    if (!pagePath)
      return

    void queueViewCount(pagePath).then((count) => {
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
