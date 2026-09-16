<script setup lang='ts'>
import { useScriptTag } from '@vueuse/core'
import { whenIdle } from '~/logics/idle'
import { onFirstInteraction } from '~/logics/interaction'

const HYDRA_SYNTH_URL = 'https://unpkg.com/hydra-synth'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
// The picture is a soft wash behind the text, so half the window pixels are
// enough and cost a quarter of the work.
const RENDER_SCALE = 0.5
const COLOR_CHANGE_SPEED = 1

const el = ref<HTMLCanvasElement | null>(null)
const size = reactive(useWindowSize())

/**
 * The colour engine of the life visuals set: an oscillator goes through a hard
 * threshold, takes a colour from a list, and folds back into its own last frame
 * four times over. It reads no camera and no microphone, so it can run here.
 * hydra-synth adds fast() and smooth() to every array when it starts.
 */
function drawSketch({ osc, noise, shape, o0 }: Record<string, any>) {
  osc(44, 0.1, 1.4)
    .rotate(0, 0.1)
    .thresh([0.5, 0.9].smooth(1).fast(0.125))
    .color(
      [...Array(8).fill(1), 1, 0].fast(COLOR_CHANGE_SPEED).smooth(0.4),
      [...Array(8).fill(0), 0.5, 0.2].fast(COLOR_CHANGE_SPEED).smooth(0.4),
      [...Array(8).fill(0), 1, 0].fast(COLOR_CHANGE_SPEED).smooth(0.4),
    )
    .modulate(noise(3.5))
    .modulate(o0)
    .blend(o0, [0.6, 0.9].smooth().fast(0.34))
    .scale([0.99, 1.01].smooth(1).fast(0.125))
    .modulateScrollY(o0)
    .blend(o0)
    .mask(shape(4, 0.8))
    .out(o0)
}

// A page whose code blocks run Hydra loads the same script, and useScriptTag
// skips its callback when the tag is already there. So the sketch starts from
// the resolved promise instead, which settles either way.
const { load: loadHydra } = useScriptTag(HYDRA_SYNTH_URL, () => {}, {
  manual: true,
  async: true,
  defer: true,
})

let tick: ((deltaMs: number) => void) | null = null
let frameHandle = 0
let lastTime = 0

onMounted(() => {
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches)
    return

  // Wait for a real gesture: a sketch may ask for the camera or the screen, and
  // a browser grants those only on a user interaction. It also keeps the sketch
  // away from the page's own first paint.
  onFirstInteraction(async () => {
    // The script tag is async, so the download blocks nothing. Building the
    // synth compiles shaders, which does hold the main thread, so it waits for
    // a gap instead of running inside the gesture that started it.
    await loadHydra()
    whenIdle(start)
  })
})

// The frame loop and the listener start long after the setup scope has closed,
// so they are stopped by hand.
onUnmounted(() => {
  cancelAnimationFrame(frameHandle)
  document.removeEventListener('visibilitychange', handleVisibility)
})

function handleVisibility() {
  if (document.hidden) {
    cancelAnimationFrame(frameHandle)
    frameHandle = 0
  }
  else if (!frameHandle) {
    lastTime = performance.now()
    frameHandle = requestAnimationFrame(frame)
  }
}

function frame() {
  const now = performance.now()
  tick?.(now - lastTime)
  lastTime = now
  frameHandle = requestAnimationFrame(frame)
}

function start() {
  const canvas = el.value
  const Hydra = (window as any).Hydra
  // tick is set once the sketch runs, so a second call never stacks instances
  if (!canvas || !Hydra || tick)
    return

  const width = Math.round(size.width * RENDER_SCALE)
  const height = Math.round(size.height * RENDER_SCALE)
  canvas.width = width
  canvas.height = height

  // makeGlobal would overwrite the window globals that the runnable code blocks
  // of a page use, so the background keeps its synth to itself. autoLoop would
  // run a second frame loop that this component cannot pause.
  const hydra = new Hydra({
    canvas,
    detectAudio: false,
    enableStreamCapture: false,
    makeGlobal: false,
    autoLoop: false,
    width,
    height,
  })

  drawSketch(hydra.synth)

  tick = (deltaMs: number) => hydra.tick(deltaMs)
  lastTime = performance.now()
  frameHandle = requestAnimationFrame(frame)
  document.addEventListener('visibilitychange', handleVisibility)
}
</script>

<template>
  <div
    class="fixed top-0 bottom-0 left-0 right-0 pointer-events-none print:hidden"
    style="z-index: -1; mask-image: radial-gradient(circle, transparent, black); -webkit-mask-image: radial-gradient(circle, transparent, black)"
  >
    <canvas ref="el" class="w-full h-full" />
  </div>
</template>
