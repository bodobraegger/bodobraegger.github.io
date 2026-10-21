import type { Garden } from '~/lib/mistyrose'
import { useBackgroundCanvas } from '~/composables/useBackgroundCanvas'

/** The titles that MistyRoseTitle marks, for the canvas of MistyRoseTitles. */
export const roseTitles = new Set<HTMLElement>()

/**
 * A canvas for a `ref` in the template, on which the roses of the garden from
 * `plant` grow; `plant` gets the size of the canvas in CSS pixels and returns
 * nothing to leave the canvas empty. The growth code and its sprites load only
 * when a canvas starts, so a page without roses does not load them.
 */
export function useMistyRose(plant: (width: number, height: number) => Garden | undefined, pixelRatioLimit: number) {
  return useBackgroundCanvas((context, width, height, animated) => {
    const garden = plant(width, height)
    if (!garden)
      return
    let stop: (() => void) | undefined
    let stopped = false
    import('~/lib/mistyrose').then(({ growMistyRose }) => {
      if (!stopped)
        stop = growMistyRose(context, garden, animated)
    })
    return () => {
      stopped = true
      stop?.()
    }
  }, pixelRatioLimit)
}
