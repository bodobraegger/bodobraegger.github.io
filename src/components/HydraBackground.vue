<script setup lang='ts'>
import { useScriptTag } from '@vueuse/core'
import { whenIdle } from '~/logics/idle'
import { onFirstInteraction } from '~/logics/interaction'
import { HYDRA_BACKGROUND_ATTRIBUTE } from '~/logics/hydra-background'
import { followSharedScreen } from '~/logics/screen-share'

const HYDRA_SYNTH_URL = 'https://unpkg.com/hydra-synth'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
// The picture is a soft wash behind the text, so half the window pixels are
// enough and cost a quarter of the work.
const RENDER_SCALE = 0.5
const SOURCE_NAMES = ['s0', 's1', 's2', 's3']
// The sketch of the set asks for five bands, so the clock below fills five.
const AUDIO_BIN_COUNT = 5

const el = ref<HTMLCanvasElement | null>(null)
const size = reactive(useWindowSize())

/**
 * Stands in for hydra's audio object `a`. A sketch of the set reads the room
 * through a.fft, and asking a reader for the microphone to draw a background is
 * too much, so each band follows a slow sine instead. The camera example of the
 * page stands its own sound analysis down the same way.
 */
const audioClock = {
  fft: Array.from({ length: AUDIO_BIN_COUNT }, () => 0.5),
  show: () => {},
  hide: () => {},
  setBins: () => {},
  setSmooth: () => {},
  setCutoff: () => {},
  setScale: () => {},
  onBeat: () => {},
}

function updateAudioClock(time: number) {
  for (let bin = 0; bin < AUDIO_BIN_COUNT; bin++)
    audioClock.fft[bin] = 0.5 + 0.45 * Math.sin(time * (1.3 + bin * 0.37) + bin)
}

/**
 * Runs the sketch with the synth of this instance in scope. A sketch opens with
 * bare assignments such as `bpm = 150`, which reach the window in normal code
 * and would there meet the same names from the code blocks of the page. Every
 * name the sketch writes stays in the scope object instead, and every name it
 * reads comes from the synth first and from the window after. A sketch that
 * calls a method of the window by its bare name, fetch for one, has to write
 * window.fetch here.
 */
function runSketch(synth: Record<string, any>, source: string) {
  const scope = new Proxy({} as Record<PropertyKey, any>, {
    has: () => true,
    get: (own, name) => name in own ? own[name] : name in synth ? synth[name] : (window as any)[name],
    set: (own, name, value) => {
      if (name in synth)
        synth[name] = value
      else
        own[name] = value
      return true
    },
  })

  // The body of a Function is not strict, which both the with statement and the
  // bare assignments of a sketch need.
  // eslint-disable-next-line no-new-func
  new Function('scope', `with (scope) { ${source} }`)(scope)
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
let stopFollowingScreen: (() => void) | null = null

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

// The frame loop and the listeners start long after the setup scope has closed,
// so they are stopped by hand.
onUnmounted(() => {
  cancelAnimationFrame(frameHandle)
  document.removeEventListener('visibilitychange', handleVisibility)
  stopFollowingScreen?.()
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
  const sketch = document.querySelector(`pre[${HYDRA_BACKGROUND_ATTRIBUTE}] code`)?.textContent
  // tick is set once the sketch runs, so a second call never stacks instances
  if (!canvas || !Hydra || !sketch || tick)
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

  const synth = hydra.synth as Record<string, any>
  synth.a = audioClock

  // A sketch takes its picture from a camera or a screen, and both open a
  // permission prompt. The background starts on its own, without the reader
  // asking for it, so those calls only note the source down, and it is fed
  // below from the screen the reader chose for a code block, or from a still of
  // the page while there is none.
  const waitingSources = new Set<any>()
  for (const name of SOURCE_NAMES)
    synth[name].initCam = synth[name].initScreen = () => waitingSources.add(synth[name])

  runSketch(synth, sketch)

  stopFollowingScreen = followSharedScreen((stream) => {
    const video = document.createElement('video')
    video.srcObject = stream
    video.muted = true
    video.playsInline = true
    void video.play()
    // A texture cannot be built from a video that holds no frame yet.
    video.addEventListener(
      'loadeddata',
      () => waitingSources.forEach(source => source.init({ src: video, dynamic: true })),
      { once: true },
    )
  })

  tick = (deltaMs: number) => {
    updateAudioClock(synth.time)
    hydra.tick(deltaMs)
  }
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
