import { ref } from 'vue'
import { whenIdle } from '~/logics/idle'
import { onFirstInteraction } from '~/logics/interaction'

const FALLBACK_DELAY_MS = 10_000

export const chatWanted = ref(false)

/**
 * Mounts the chat widget on the first user interaction, or after a fallback
 * delay once the browser is idle, so it never competes with the page's own
 * load and hydration.
 */
export function loadChatWidgetOnInteraction() {
  const start = onFirstInteraction(() => chatWanted.value = true)

  setTimeout(() => whenIdle(start), FALLBACK_DELAY_MS)
}
