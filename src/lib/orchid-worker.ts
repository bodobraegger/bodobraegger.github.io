// Grows the vines of Orchid.vue and their path data away from the main
// thread, and sends each vine when it is ready. The rule that keeps all
// blossoms apart tries many places for each blossom, which takes too long
// for one task on a phone.
import { parts, vines } from '~/lib/orchid'

export interface VineRequest {
  width: number
  height: number
  seed: number
}

globalThis.onmessage = ({ data: { width, height, seed } }: MessageEvent<VineRequest>) => {
  for (const plant of vines(width, height, seed))
    globalThis.postMessage(parts(plant))
  globalThis.close()
}
