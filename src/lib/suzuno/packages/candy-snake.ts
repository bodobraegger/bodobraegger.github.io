// The candy snake: a strip of あべっ子ラムネ that grows along a winding path,
// one piece after another, like the vines of Orchid. Each piece is an image
// of its recreation, drawn once, and the canvas draws these images along the
// path, so that a long snake costs no more than a few SVGs.
import type { Area } from '~/lib/orchid'
import { easeOutBack, takeBackAreas } from '~/lib/orchid'

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

// A new piece grows in GROWTH_MS from nothing to its size, with the overshoot
// of the opening blossoms of Orchid, and the next piece starts when it is
// done. Frames as Orchid draws them: 30 per second, less a slack.
const GROWTH_MS = 220
const FRAME_INTERVAL = 1000 / 30
const FRAME_SLACK = 4
// The largest scale of a growing piece, for the area that a frame takes back
const LARGEST_SCALE = 1.2
const EDGE_MARGIN = 2

/**
 * Grows the pieces on `view`, whose transform maps CSS pixels to device
 * pixels, one after another from the first. `length` and `across` are the
 * size of a piece in CSS pixels. Without `animated`, all pieces appear at
 * once. Returns a function that stops the growth.
 */
export function growSnake(view: CanvasRenderingContext2D, pieces: SnakePiece[], length: number, across: number, animated: boolean) {
  const ratio = view.getTransform().a
  const draw = (context: CanvasRenderingContext2D, piece: SnakePiece, scale: number) => {
    context.save()
    context.translate(piece.x, piece.y)
    // The top of a piece points back along the path, towards the header card
    context.rotate(piece.angle - Math.PI / 2)
    context.scale(scale, scale)
    context.drawImage(piece.image, -across / 2, -length / 2, across, length)
    context.restore()
  }
  if (!animated) {
    pieces.forEach(piece => draw(view, piece, 1))
    return () => {}
  }
  // The pieces that are done, on a canvas outside the page, as in Orchid
  const storeCanvas = document.createElement('canvas')
  storeCanvas.width = view.canvas.width
  storeCanvas.height = view.canvas.height
  const store = storeCanvas.getContext('2d')!
  store.setTransform(view.getTransform())
  const reach = Math.hypot(length, across) / 2 * LARGEST_SCALE + EDGE_MARGIN
  const areaOf = (piece: SnakePiece): Area => [piece.x - reach, piece.y - reach, 2 * reach, 2 * reach]
  let grown = 0
  let start = performance.now()
  let last = 0
  let frame = requestAnimationFrame(function step(now) {
    frame = requestAnimationFrame(step)
    if (now - last < FRAME_INTERVAL - FRAME_SLACK)
      return
    last = now
    const piece = pieces[grown]
    const progress = Math.min(1, (now - start) / GROWTH_MS)
    takeBackAreas(view, storeCanvas, ratio, [areaOf(piece)])
    draw(view, piece, easeOutBack(progress))
    if (progress < 1)
      return
    draw(store, piece, 1)
    grown++
    start = now
    if (grown === pieces.length)
      cancelAnimationFrame(frame)
  })
  return () => cancelAnimationFrame(frame)
}
