// Grows the vines of Orchid.vue and their path data away from the main
// thread. The rule that keeps all blossoms apart tries many places for each
// blossom, which takes too long for one task on a phone.
import { parts, vines } from '~/lib/orchid'

export interface VineRequest {
  width: number
  height: number
  seed: number
}

globalThis.onmessage = ({ data: { width, height, seed } }: MessageEvent<VineRequest>) => {
  globalThis.postMessage(vines(width, height, seed).map(parts))
}
