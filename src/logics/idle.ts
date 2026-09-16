const IDLE_FALLBACK_DELAY_MS = 1000

/**
 * Runs the callback when the main thread is idle, or after a short delay in
 * browsers without requestIdleCallback. A page that animates without pause,
 * such as one running a sketch, may never go idle, so the timeout makes the
 * callback run anyway.
 */
export function whenIdle(callback: () => void) {
  if ('requestIdleCallback' in window)
    requestIdleCallback(callback, { timeout: IDLE_FALLBACK_DELAY_MS })
  else
    setTimeout(callback, IDLE_FALLBACK_DELAY_MS)
}
