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

  // A reader can scroll or click while the page is still hydrating, and that
  // gesture is over before any listener exists. Someone who scrolled once and
  // then settled down to read would wait for ever. A browser remembers a click
  // or a key press as an activation, and a page that sits away from the top has
  // been scrolled, so both stand in for the gesture that was missed.
  if (navigator.userActivation?.hasBeenActive || window.scrollY > 0) {
    callback()
    return run
  }

  for (const eventName of INTERACTION_EVENTS)
    window.addEventListener(eventName, run, { once: true, passive: true, signal: controller.signal })

  return run
}
