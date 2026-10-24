// Candy snakes: strips of あべっ子ラムネ that grow along winding paths, one
// piece after another, like the vines of Orchid. Each piece is an image of
// its recreation, drawn once, and the canvas draws these images along the
// paths, so that many long snakes cost no more than a few SVGs. The candy
// snake of SuzunoCandySnake and the background Honeydew share this code.
import { ref } from 'vue'
import type { Area } from '~/lib/orchid'
import { EDGE_MARGIN, FRAME_INTERVAL, FRAME_SLACK, LARGEST_SCALE, LONGEST_FRAME, PACE_HIGH, PACE_LOW, RESUME_CHANCE, easeOutBack, takeBackAreas } from '~/lib/orchid'
import type { RamuneFlavour } from '~/lib/suzuno/packages/ramune'
import { RAMUNE_POSES } from '~/lib/suzuno/packages/ramune'

type Point = [number, number]

/** A piece of the snake on the path: its middle, its angle, and the image of its face. */
export interface SnakePiece {
  x: number
  y: number
  angle: number
  image: CanvasImageSource
}

// The rows of the path are ROW_GAP times the width of a piece apart, and
// the path waves on its straight runs by WAVE times that width, with one
// wave per WAVELENGTH widths
const ROW_GAP = 1.6
const WAVE = 0.18
const WAVELENGTH = 7
const TURN_STEPS = 24
const RUN_STEP = 4

/**
 * A path that winds through a box in rows, from the top left, with half
 * circles at the ends of the rows and a gentle wave along each row: the path
 * of the snake game. `across` is the width of a piece; the path keeps half
 * of it inside the box.
 */
export function windingPath(width: number, height: number, across: number, phase = 0): Point[] {
  const gap = ROW_GAP * across
  const radius = gap / 2
  const left = across / 2 + radius
  const right = width - across / 2 - radius
  const rows = Math.max(1, Math.floor((height - across) / gap) + 1)
  const wave = (x: number) => WAVE * across * Math.sin(2 * Math.PI * x / (WAVELENGTH * across) + phase)
  const points: Point[] = []
  for (let row = 0; row < rows; row++) {
    const y = across / 2 + row * gap
    const forward = row % 2 === 0
    const [start, end] = forward ? [left, right] : [right, left]
    const count = Math.max(1, Math.ceil(Math.abs(end - start) / RUN_STEP))
    for (let step = 0; step <= count; step++) {
      const x = start + (end - start) * step / count
      points.push([x, y + wave(x)])
    }
    if (row === rows - 1)
      break
    // A half circle down to the next row, on the side where the row ends
    const centreY = y + radius + wave(end)
    for (let step = 1; step < TURN_STEPS; step++) {
      const angle = -Math.PI / 2 + Math.PI * step / TURN_STEPS
      points.push([end + (forward ? 1 : -1) * radius * Math.cos(angle), centreY + radius * Math.sin(angle)])
    }
  }
  return points
}

/** The places of pieces of a given length along a path, from its start, as many as fit. */
export function placesAlong(path: Point[], length: number) {
  const distances = [0]
  for (let index = 1; index < path.length; index++)
    distances.push(distances[index - 1] + Math.hypot(path[index][0] - path[index - 1][0], path[index][1] - path[index - 1][1]))
  const pointAt = (along: number): Point => {
    let index = distances.findIndex(distance => distance >= along)
    index = Math.max(1, index)
    const share = (along - distances[index - 1]) / (distances[index] - distances[index - 1] || 1)
    const [before, after] = [path[index - 1], path[index]]
    return [before[0] + (after[0] - before[0]) * share, before[1] + (after[1] - before[1]) * share]
  }
  const places: { x: number, y: number, angle: number }[] = []
  for (let start = 0; start + length <= distances.at(-1)!; start += length) {
    const [x, y] = pointAt(start + length / 2)
    const [fromX, fromY] = pointAt(start)
    const [toX, toY] = pointAt(start + length)
    places.push({ x, y, angle: Math.atan2(toY - fromY, toX - fromX) })
  }
  return places
}

/** Reads a resource as a data URL, so that an SVG drawn as an image can show it. */
async function dataUrl(url: string) {
  const blob = await (await fetch(url)).blob()
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/**
 * The @font-face rules of a Google Fonts stylesheet with the font files in
 * them, because an SVG drawn as an image loads nothing from outside.
 */
export async function embeddedFonts(stylesheet: string) {
  const css = await (await fetch(stylesheet)).text()
  const urls = [...new Set(css.match(/https:[^)'"]+/g) ?? [])]
  const files = await Promise.all(urls.map(dataUrl))
  return urls.reduce((rules, url, index) => rules.replaceAll(url, files[index]), css)
}

/** Draws an SVG of the page into a canvas of a given size, with its images and the given fonts in it. */
export async function rasterize(svg: SVGSVGElement, width: number, height: number, fonts: string) {
  const copy = svg.cloneNode(true) as SVGSVGElement
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  copy.setAttribute('width', String(width))
  copy.setAttribute('height', String(height))
  copy.removeAttribute('class')
  for (const image of copy.querySelectorAll('image'))
    image.setAttribute('href', await dataUrl(image.getAttribute('href')!))
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  style.textContent = fonts
  copy.prepend(style)
  const image = new Image()
  image.src = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' }))
  try {
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d')!.drawImage(image, 0, 0)
    return canvas
  }
  finally {
    URL.revokeObjectURL(image.src)
  }
}

/** A snake: its pieces from the tail to the head, the size and the alpha of a piece, and when it starts. */
export interface Snake {
  pieces: SnakePiece[]
  /** The width and the length of a piece in CSS pixels. */
  across: number
  length: number
  alpha: number
  /** The time in milliseconds from the start of the growth to the first piece. */
  delay: number
}

/** The key of the image of a piece of a strip: the header card first, then the packets in `order`, with a pose for each round of the order. */
export function pieceKey(index: number, order: readonly RamuneFlavour[]) {
  if (!index)
    return 'header'
  const packet = index - 1
  return `${order[packet % order.length]}-${RAMUNE_POSES[Math.floor(packet / order.length) % RAMUNE_POSES.length]}`
}

/**
 * Asks RamunePieces for the images of the pieces: `request` sets the size of
 * the images in device pixels, for a `v-if` and a `v-bind` on RamunePieces,
 * and resolves with the images when RamunePieces calls `ready`.
 */
export function usePieceImages() {
  const size = ref<{ width: number, height: number }>()
  let resolve: (images: Map<string, HTMLCanvasElement>) => void = () => {}
  return {
    size,
    request: (width: number, height: number) => new Promise<Map<string, HTMLCanvasElement>>((done) => {
      resolve = done
      size.value = { width, height }
    }),
    ready: (images: Map<string, HTMLCanvasElement>) => {
      size.value = undefined
      resolve(images)
    },
  }
}

/** The growth of a snake: the piece at its head, the share of its opening, and whether the snake rests before it. */
interface GrowingSnake extends Snake {
  head: number
  progress: number
  pace: number
  resting: boolean
}

/**
 * Grows the snakes on `view`, whose transform maps CSS pixels to device
 * pixels, each one piece after another from its tail, as Orchid grows its
 * vines. A piece opens in `pieceMs` at the middle pace from its centre to its
 * size, with the overshoot of the opening blossoms of Orchid. Each piece
 * takes a pace between PACE_LOW and PACE_HIGH, and after each piece the
 * snake rests until it goes on, with RESUME_CHANCE in each frame, so the
 * snakes grow in fits and starts. A frame takes back the committed drawing
 * in the areas of the growing heads and draws the heads again, so that a
 * frame costs only the heads. The snakes draw in their order, the far ones
 * first. Without `animated`, all pieces appear at once. Returns a function
 * that stops the growth.
 */
export function growSnakes(view: CanvasRenderingContext2D, snakes: Snake[], pieceMs: number, animated: boolean) {
  const ratio = view.getTransform().a
  const draw = (context: CanvasRenderingContext2D, snake: Snake, piece: SnakePiece, scale: number) => {
    context.save()
    context.globalAlpha = snake.alpha
    context.translate(piece.x, piece.y)
    // The top of a piece points back along the path, towards the header card
    context.rotate(piece.angle - Math.PI / 2)
    context.scale(scale, scale)
    context.drawImage(piece.image, -snake.across / 2, -snake.length / 2, snake.across, snake.length)
    context.restore()
  }
  if (!animated) {
    for (const snake of snakes)
      snake.pieces.forEach(piece => draw(view, snake, piece, 1))
    return () => {}
  }
  // The pieces that are done, on a canvas outside the page, as in Orchid
  const storeCanvas = document.createElement('canvas')
  storeCanvas.width = view.canvas.width
  storeCanvas.height = view.canvas.height
  const store = storeCanvas.getContext('2d')!
  store.setTransform(view.getTransform())
  const areaOf = (snake: Snake, piece: SnakePiece): Area => {
    const reach = Math.hypot(snake.length, snake.across) / 2 * LARGEST_SCALE + EDGE_MARGIN
    return [piece.x - reach, piece.y - reach, 2 * reach, 2 * reach]
  }
  const pace = () => PACE_LOW + Math.random() * (PACE_HIGH - PACE_LOW)
  let growing: GrowingSnake[] = snakes.filter(snake => snake.pieces.length).map(snake => ({ ...snake, head: 0, progress: 0, pace: pace(), resting: false }))
  const start = performance.now()
  let last = start
  let frame = requestAnimationFrame(function step(now) {
    frame = requestAnimationFrame(step)
    if (now - last < FRAME_INTERVAL - FRAME_SLACK)
      return
    const elapsed = Math.min(now - last, LONGEST_FRAME)
    last = now
    const heads: GrowingSnake[] = []
    for (const snake of growing) {
      if (now - start < snake.delay)
        continue
      if (snake.resting) {
        snake.resting = Math.random() >= RESUME_CHANCE
        continue
      }
      snake.progress = Math.min(1, snake.progress + elapsed / pieceMs * snake.pace)
      heads.push(snake)
    }
    takeBackAreas(view, storeCanvas, ratio, heads.map(snake => areaOf(snake, snake.pieces[snake.head])))
    for (const snake of heads) {
      const piece = snake.pieces[snake.head]
      draw(view, snake, piece, easeOutBack(snake.progress))
      if (snake.progress < 1)
        continue
      draw(store, snake, piece, 1)
      snake.head++
      snake.progress = 0
      snake.pace = pace()
      snake.resting = true
    }
    growing = growing.filter(snake => snake.head < snake.pieces.length)
    if (!growing.length)
      cancelAnimationFrame(frame)
  })
  return () => cancelAnimationFrame(frame)
}
