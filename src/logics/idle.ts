const IDLE_FALLBACK_DELAY_MS = 1000

/** Runs the callback when the main thread is idle, or after a short delay in browsers without requestIdleCallback. */
export function whenIdle(callback: () => void) {
  if ('requestIdleCallback' in window)
    requestIdleCallback(callback)
  else
    setTimeout(callback, IDLE_FALLBACK_DELAY_MS)
}
