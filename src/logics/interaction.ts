const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const

/**
 * Runs the callback on the first user interaction with the page. Returns the
 * same callback, wrapped so that it also removes the listeners, for a caller
 * that wants to run the work earlier than the interaction.
 */
export function onFirstInteraction(callback: () => void) {
  const controller = new AbortController()
  const run = () => {
    controller.abort()
    callback()
  }

  for (const eventName of INTERACTION_EVENTS)
    window.addEventListener(eventName, run, { once: true, passive: true, signal: controller.signal })

  return run
}
