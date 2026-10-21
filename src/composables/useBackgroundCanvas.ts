import { onMounted, onUnmounted, ref } from 'vue'
import { whenIdle } from '~/logics/idle'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

type Draw = (context: CanvasRenderingContext2D, width: number, height: number, animated: boolean) => (() => void) | undefined

/**
 * The canvas of a page background, for a `ref` in the template. When the
 * page is idle, the canvas keeps the size that CSS gives it at that time, at
 * the device pixel ratio but at most `pixelRatioLimit`. Then `draw` starts on
 * its context, scaled to CSS pixels, and returns a function that stops the
 * drawing when the component unmounts.
 */
export function useBackgroundCanvas(draw: Draw, pixelRatioLimit = Infinity) {
  const canvas = ref<HTMLCanvasElement | null>(null)
  let stop: (() => void) | undefined
  // The drawing starts after hydration and font swaps, so that it does not
  // compete with the first paint of the page
  onMounted(() => whenIdle(() => {
    const element = canvas.value
    if (!element)
      return
    const { width, height } = element.getBoundingClientRect()
    const ratio = Math.min(window.devicePixelRatio || 1, pixelRatioLimit)
    element.style.width = `${width}px`
    element.style.height = `${height}px`
    element.width = ratio * width
    element.height = ratio * height
    const context = element.getContext('2d')!
    context.scale(ratio, ratio)
    stop = draw(context, width, height, !window.matchMedia(REDUCED_MOTION_QUERY).matches)
  }))
  onUnmounted(() => stop?.())
  return canvas
}
