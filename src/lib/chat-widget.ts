import { ref } from 'vue'
import { whenIdle } from '~/logics/idle'

const INTERACTION_EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const
const FALLBACK_DELAY_MS = 10_000

export const chatWanted = ref(false)

/**
 * Mounts the chat widget on the first user interaction, or after a fallback
 * delay once the browser is idle, so it never competes with the page's own
 * load and hydration.
 */
export function loadChatWidgetOnInteraction() {
  const controller = new AbortController()
  const start = () => {
    controller.abort()
    chatWanted.value = true
  }
  for (const eventName of INTERACTION_EVENTS)
    window.addEventListener(eventName, start, { once: true, passive: true, signal: controller.signal })

  setTimeout(() => whenIdle(start), FALLBACK_DELAY_MS)
}
