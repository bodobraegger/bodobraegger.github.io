// Plum-blossom vine ornaments, drawn as line art: a copy of ornament.ts, the
// vine generator of the Suzuno Financial recreation, with its rule that
// blossoms keep apart. This copy adds the direction of a vine, keeps the
// blossoms of several vines apart, grows all vines of a page on a canvas in
// one loop, and lays the vines out along the edges of a window (`vines`).
//
// A plant is a genome: a root branch that grows from an origin step by step
// (each step a length and a turn), with side branches at its nodes and a tip
// at the end of every branch (a flower, a bud, or nothing). `grow(seed,
// parameters)` grows a new plant. In the source project, a fitter adjusts the
// values of a plant (and per-node shifts) to match a print. `develop(plant)`
// turns a plant into a flat spec: stems (smooth curves through points),
// flowers (petals as brush arcs around a stamen dot) and buds (small,
// optionally open, ellipses). `parts(spec)` turns a spec or a plant into the
// lines of its stems and the SVG path data of its tips, in the order of its
// growth, and `animate` grows them on a canvas.

export type Point = [number, number]

export interface Shape {
  d: string
  filled: boolean
}

export interface FlowerShape {
  radiusX: number
  radiusY: number
  rotation?: number
  petals?: number
  phase?: number
  depth?: number
  stretch?: number
  sizes?: number[]
  reach?: number
  reaches?: number[]
  weight?: number
  centre?: number
}

export interface BudShape {
  radiusX: number
  radiusY: number
  rotation?: number
  gap?: number
  weight?: number
}

/** A placed tip: its centre, and the growth length at which it opens. */
interface Placed {
  x: number
  y: number
  start?: number
}

export type Flower = FlowerShape & Placed
export type Bud = BudShape & Placed

export interface Stem {
  points: Point[]
  tension?: number
  start?: number
  length?: number
}

export interface Spec {
  strokeWidth: number
  stems: Stem[]
  flowers: Flower[]
  buds: Bud[]
}

export interface Step {
  length: number
  turn: number
  shift?: Point
}

export interface Tip {
  flower?: FlowerShape & { offset?: Point }
  bud?: BudShape & { offset?: Point }
}

interface BranchBody {
  steps: Step[]
  tip?: Tip | null
  branches?: SideBranch[]
}

export interface SideBranch extends BranchBody {
  at: number
  angle: number
}

export interface RootBranch extends BranchBody {
  origin: Point
  heading: number
}

export interface Plant {
  strokeWidth: number
  root: RootBranch
}

export type Ornament = Plant | Spec

const TAU = Math.PI * 2

function round(value: number) {
  return Math.round(value * 100) / 100
}

// Math.hypot is several times slower than the square root in V8, and the rule
// of `grow` measures many distances
const distance = ([ax, ay]: Point, [bx, by]: Point) => Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)

// Points per Bezier segment of the line of a stem, for the rule of `grow` and
// for the canvas
const STEM_SAMPLES = 8

/** The cubic Bezier segments of a Catmull-Rom spline through the points: start, two controls, end. */
function stemSegments(points: Point[], tension: number): Point[][] {
  const factor = tension / 3
  return points.slice(0, -1).map((start, i) => {
    const before = points[Math.max(0, i - 1)]
    const end = points[i + 1]
    const after = points[Math.min(points.length - 1, i + 2)]
    const control1: Point = [start[0] + (end[0] - before[0]) * factor, start[1] + (end[1] - before[1]) * factor]
    const control2: Point = [end[0] - (after[0] - start[0]) * factor, end[1] - (after[1] - start[1]) * factor]
    return [start, control1, control2, end]
  })
}

/** Points along the line of a stem: a Catmull-Rom spline through its nodes, STEM_SAMPLES points per segment. */
function stemPoints({ points, tension = 0.5 }: Stem): Point[] {
  const line: Point[] = [points[0]]
  for (const [start, control1, control2, end] of stemSegments(points, tension)) {
    for (let sample = 1; sample <= STEM_SAMPLES; sample++) {
      const t = sample / STEM_SAMPLES
      const weight0 = (1 - t) ** 3
      const weight1 = 3 * (1 - t) ** 2 * t
      const weight2 = 3 * (1 - t) * t ** 2
      const weight3 = t ** 3
      line.push([
        weight0 * start[0] + weight1 * control1[0] + weight2 * control2[0] + weight3 * end[0],
        weight0 * start[1] + weight1 * control1[1] + weight2 * control2[1] + weight3 * end[1],
      ])
    }
  }
  return line
}

/**
 * A line of varying weight: the points as a closed ribbon, `extra` wider than
 * the stroke in its middle and as wide as the stroke at its ends. The ribbon
 * is filled and stroked, so the stroke width still sets the thinnest line.
 */
export function ribbonPath(points: Point[], extra: number) {
  if (!extra)
    return `M${points.map(([px, py]) => `${round(px)} ${round(py)}`).join('L')}`
  const last = points.length - 1
  const left: Point[] = []
  const right: Point[] = []
  points.forEach(([px, py], index) => {
    const [beforeX, beforeY] = points[Math.max(0, index - 1)]
    const [afterX, afterY] = points[Math.min(last, index + 1)]
    const length = Math.hypot(afterX - beforeX, afterY - beforeY) || 1
    const half = extra * Math.sin(Math.PI * index / last) / 2
    const normal = [-(afterY - beforeY) / length * half, (afterX - beforeX) / length * half]
    left.push([px + normal[0], py + normal[1]])
    right.unshift([px - normal[0], py - normal[1]])
  })
  return `M${[...left, ...right].map(([px, py]) => `${round(px)} ${round(py)}`).join('L')}Z`
}

interface PetalEllipse {
  middle: number
  centre: Point
  width: number
  length: number
}

/** The petal ellipses of a flower, in the unit circle of its outline. */
function petalEllipses({ petals = 5, phase = 0, depth = 0.8, stretch = 1, sizes = [] }: FlowerShape): PetalEllipse[] {
  const half = Math.PI / petals
  return Array.from({ length: petals }, (_, petal) => {
    const middle = (phase * Math.PI / 180) - Math.PI / 2 + petal * 2 * half
    const size = sizes[petal] ?? 1
    const distance = size / (1 + depth * stretch)
    return { middle, centre: [distance * Math.cos(middle), distance * Math.sin(middle)], width: distance * depth, length: distance * depth * stretch }
  })
}

/** Maps the unit circle of a flower onto its slanted outline in the plane. */
function blossomTransform({ x, y, radiusX, radiusY, rotation = 0 }: Flower) {
  const angle = rotation * Math.PI / 180
  return ([u, v]: Point): Point => {
    const px = u * radiusX
    const py = v * radiusY
    return [x + px * Math.cos(angle) - py * Math.sin(angle), y + px * Math.sin(angle) + py * Math.cos(angle)]
  }
}

/**
 * A blossom in line art, as printed: each petal is an open arc of its own
 * ellipse, a brush line that is heaviest at the petal tip. The petal ellipses
 * sit around the centre; `depth` is their half width over the distance of
 * their centres, so smaller values cut deeper notches, and `stretch` is their
 * length over their width. `sizes` scales single petals, for a blossom seen at
 * a slant, and `phase` (degrees) turns the petals within the slanted outline.
 * `reach` (radians) carries each arc past the notch into the blossom, or with
 * negative values stops it short, and `reaches` adds to it for single petals,
 * so that small petals beside large ones can close their outline. `weight` is
 * the extra line width at the tip, relative to the stroke, and `centre` the
 * radius of the dot of the stamens.
 */
export function flowerPath(flower: Flower, strokeWidth: number): Shape[] {
  const { x, y, petals = 5, reach = 0, reaches = [], weight = 0, centre = 0 } = flower
  const half = Math.PI / petals
  const transform = blossomTransform(flower)
  const ellipses = petalEllipses(flower)
  const pointOn = ({ middle, centre: [cx, cy], width, length }: PetalEllipse, t: number): Point => {
    const along = length * Math.cos(t)
    const across = width * Math.sin(t)
    return [cx + along * Math.cos(middle) - across * Math.sin(middle), cy + along * Math.sin(middle) + across * Math.cos(middle)]
  }
  const inside = ({ middle, centre: [cx, cy], width, length }: PetalEllipse, [u, v]: Point) => {
    const along = (u - cx) * Math.cos(middle) + (v - cy) * Math.sin(middle)
    const across = -(u - cx) * Math.sin(middle) + (v - cy) * Math.cos(middle)
    return (along / length) ** 2 + (across / width) ** 2 < 1
  }
  // From the tip, the arc runs both ways until it enters a neighbour petal or
  // crosses the line between two petals
  const step = Math.PI / 90
  const shapes = ellipses.map((ellipse, petal) => {
    const neighbours = [ellipses[(petal + petals - 1) % petals], ellipses[(petal + 1) % petals]]
    const open = (direction: number) => {
      let turn = 0
      while (turn < Math.PI) {
        const point = pointOn(ellipse, direction * (turn + step))
        const offset = Math.atan2(point[1], point[0]) - ellipse.middle
        if (neighbours.some(neighbour => inside(neighbour, point)) || Math.abs(Math.atan2(Math.sin(offset), Math.cos(offset))) > half)
          break
        turn += step
      }
      return direction * Math.max(0, turn + reach + (reaches[petal] ?? 0))
    }
    const from = open(-1)
    const to = open(1)
    const steps = Math.max(2, Math.ceil((to - from) / step / 2))
    const points = Array.from({ length: steps + 1 }, (_, index) => transform(pointOn(ellipse, from + (to - from) * index / steps)))
    return { d: ribbonPath(points, weight * strokeWidth), filled: weight > 0 }
  })
  if (centre > 0)
    shapes.push({ d: budPath({ x, y, radiusX: centre, radiusY: centre }).d, filled: true })
  return shapes
}

/**
 * A small ellipse; `gap` in degrees leaves it open, like a curled bud, and
 * `weight` thickens its middle like `flowerPath`.
 */
export function budPath({ x, y, radiusX, radiusY, rotation = 0, gap = 0, weight = 0 }: Bud, strokeWidth = 0): Shape {
  const steps = 24
  const angle = rotation * Math.PI / 180
  const span = TAU - gap * Math.PI / 180
  const points: Point[] = []
  for (let step = 0; step <= steps; step++) {
    const t = angle + gap * Math.PI / 360 + span * step / steps
    points.push([x + radiusX * Math.cos(t), y + radiusY * Math.sin(t)])
  }
  const extra = weight * strokeWidth
  return { d: `${ribbonPath(points, extra)}${gap || extra ? '' : 'Z'}`, filled: extra > 0 }
}

/** The line of a stem, and its place in the growth order. */
interface StemPart {
  points: Point[]
  start: number
  length: number
}

/** The shapes of a tip, its centre, its place in the growth order, and the farthest distance of its ink from its centre. */
interface TipPart {
  shapes: Shape[]
  x: number
  y: number
  start: number
  radius: number
}

export interface Parts {
  strokeWidth: number
  stems: StemPart[]
  tips: TipPart[]
}

const isPlant = (ornament: Ornament): ornament is Plant => 'root' in ornament

/**
 * The drawing of an ornament (a spec or a plant): the line of each stem, and
 * per tip (flowers, then buds) the SVG path data of its shapes around its
 * centre. Stems and tips keep their `start` of the growth order (0 for a spec
 * without one).
 */
export function parts(ornament: Ornament): Parts {
  const spec = isPlant(ornament) ? develop(ornament) : ornament
  // The ink of a tip ends within its outline and the width of its widest line
  const tip = (shapes: Shape[], shape: Flower | Bud, flower: boolean): TipPart => {
    const { x, y, start = 0, weight = 0 } = shape
    const radius = Math.max(...outline(shape, flower).map(point => distance(point, [x, y]))) + spec.strokeWidth * (1 + weight)
    return { shapes, x, y, start, radius }
  }
  const stems: StemPart[] = spec.stems.map(stem => ({ points: stemPoints(stem), start: stem.start ?? 0, length: stem.length ?? 0 }))
  const tips = [
    ...spec.flowers.map(flower => tip(flowerPath(flower, spec.strokeWidth), flower, true)),
    ...spec.buds.map(bud => tip([budPath(bud, spec.strokeWidth)], bud, false)),
  ]
  return { strokeWidth: spec.strokeWidth, stems, tips }
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
// The growth length over which a tip opens, in radii of the tip. The shapes
// of a tip open together: on the page a tip is only a few pixels wide, and
// one path per tip costs a sixth of the raster of one path per shape.
const OPENING_RADII = 4
// The overshoot of the opening, as in the common "ease out back" curve
const OVERSHOOT = 1.6
const easeOutBack = (progress: number) => 1 + (OVERSHOOT + 1) * (progress - 1) ** 3 + OVERSHOOT * (progress - 1) ** 2
// The largest scale of an opening tip, at the top of the overshoot, and the
// margin of antialiased pixels around the ink of a line or a tip
const LARGEST_SCALE = easeOutBack(1 - 2 * OVERSHOOT / (3 * (OVERSHOOT + 1)))
const EDGE_MARGIN = 2
const clamp = (value: number) => Math.min(1, Math.max(0, value))

/** The growth of the stems, in canvas units per second. */
const GROWTH_SPEED = 18
// The time between two drawn frames, 30 frames per second as Plum draws on a
// 60 Hz screen, less a slack for the jitter of the animation frames. At this
// rate a stem grows 0.6 pixels per frame. A hidden tab gets no animation
// frames, so the growth waits there, and one frame grows at most
// LONGEST_FRAME, so it goes on from the same place when the tab comes back.
const FRAME_INTERVAL = 1000 / 30
const FRAME_SLACK = 4
const LONGEST_FRAME = 100
// A frame adds the new ends of the stems to the canvas. Every TIP_FRAMES
// frames, the tips that are open join the committed drawing, and the canvas
// takes it back in the areas of the opening tips and draws these tips again.
// Every COMMIT_FRAMES frames, the stems join the committed drawing, and the
// canvas takes it back in the areas of the ends of the stems, which so lose
// the seams between their small pieces. An opening tip grows by much less
// than a pixel between two of its frames.
const TIP_FRAMES = 3
const COMMIT_FRAMES = 12

type Area = [number, number, number, number]

const overlaps = ([ax, ay, aw, ah]: Area, [bx, by, bw, bh]: Area) => ax < bx + bw && bx < ax + aw && ay < by + bh && by < ay + ah

/**
 * A stem in the growth: the distances of its points from its start, its
 * length, the distance of its growth so far, the distance in the committed
 * drawing and the distance drawn on the canvas, each with the point that
 * ends the segment of that distance.
 */
interface GrowingStem extends StemPart {
  distances: number[]
  total: number
  front: number
  committed: number
  committedCursor: number
  shown: number
  shownCursor: number
}

/**
 * A tip in the growth: its filled shapes and all its shapes as one canvas
 * path each, the growth length of its opening, the area of its ink at the
 * top of the overshoot, and whether it is in the committed drawing.
 */
interface GrowingTip extends TipPart {
  fillPath: Path2D
  strokePath: Path2D
  opening: number
  area: Area
  open: boolean
}

export interface Growth {
  /** Grows a drawing (from `parts`), which starts after a delay in milliseconds from the start of the growth, but not before the current growth. */
  add: (drawing: Parts, delay: number) => void
  /** Draws the growth so far again, in another paint. */
  repaint: (paint: string) => void
  stop: () => void
}

/** The distances of the points of a line from its start. */
function distancesAlong(points: Point[]) {
  const distances = [0]
  for (let index = 1; index < points.length; index++)
    distances.push(distances[index - 1] + distance(points[index - 1], points[index]))
  return distances
}

/** The point of the line of a stem at a distance from its start, on the segment that ends at point `index`. */
function pointOn({ points, distances }: GrowingStem, along: number, index: number): Point {
  const [before, after] = [points[index - 1], points[index]]
  const share = (along - distances[index - 1]) / (distances[index] - distances[index - 1] || 1)
  return [before[0] + (after[0] - before[0]) * share, before[1] + (after[1] - before[1]) * share]
}

/**
 * The line of a stem between two distances, which starts on the segment
 * that ends at point `first`, and the point that ends its last segment.
 */
function piece(stem: GrowingStem, from: number, to: number, first: number) {
  const line = [pointOn(stem, from, first)]
  let index = first
  for (; index < stem.points.length - 1 && stem.distances[index] < to; index++)
    line.push(stem.points[index])
  line.push(pointOn(stem, to, index))
  return { line, last: index }
}

function addLine(context: CanvasRenderingContext2D, [start, ...rest]: Point[]) {
  context.moveTo(...start)
  for (const point of rest)
    context.lineTo(...point)
}

/** The area of a line, with a margin. */
function area(line: Point[], margin: number): Area {
  let [left, top, right, bottom] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const [x, y] of line) {
    left = Math.min(left, x)
    top = Math.min(top, y)
    right = Math.max(right, x)
    bottom = Math.max(bottom, y)
  }
  return [left - margin, top - margin, right - left + 2 * margin, bottom - top + 2 * margin]
}

/** Draws a tip, scaled from its centre. */
function drawTip(context: CanvasRenderingContext2D, tip: GrowingTip, scale: number) {
  context.save()
  context.translate(tip.x, tip.y)
  context.scale(scale, scale)
  context.translate(-tip.x, -tip.y)
  context.fill(tip.fillPath)
  context.stroke(tip.strokePath)
  context.restore()
}

const byStart = (a: { start: number }, b: { start: number }) => a.start - b.start

/**
 * Grows drawings of ornaments (from `parts`, given with `add`) in one
 * animation loop on a canvas. The stems of an ornament grow in the order of
 * its genome at one speed, each side branch sprouts when its parent reaches
 * its node, and each tip opens when its branch arrives, scaled up from its
 * centre. The loop rests when all stems and tips are
 * complete, and `add` wakes it. With reduced motion, `add` draws the end
 * state at once. Lines are at least one device pixel wide, and the context
 * takes the scale of its canvas before the call.
 */
export function animate(view: CanvasRenderingContext2D, paint: string): Growth {
  const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches
  const ratio = view.getTransform().a
  let lineWidth = 1 / ratio
  // The committed drawing, on a canvas outside the page: the browser copies
  // each changed canvas of the page in each frame, but never this one
  const storeCanvas = document.createElement('canvas')
  storeCanvas.width = view.canvas.width
  storeCanvas.height = view.canvas.height
  const store = storeCanvas.getContext('2d')!
  store.setTransform(view.getTransform())
  const stems: GrowingStem[] = []
  const tips: GrowingTip[] = []
  let nextStem = 0
  let nextTip = 0
  let growingStems: GrowingStem[] = []
  let openingTips: GrowingTip[] = []
  let reached = 0
  let last = 0
  let frame = 0
  let frameCount = 0

  const style = (context: CanvasRenderingContext2D) => {
    context.strokeStyle = paint
    context.fillStyle = paint
    context.lineWidth = lineWidth
    context.lineJoin = 'round'
  }
  // Draws the stems up to their committed distance, and the open tips
  const drawCommitted = (context: CanvasRenderingContext2D, someStems: GrowingStem[], someTips: GrowingTip[]) => {
    context.lineCap = 'butt'
    context.beginPath()
    for (const stem of someStems) {
      if (stem.committed > 0)
        addLine(context, piece(stem, 0, stem.committed, 1).line)
    }
    context.stroke()
    context.lineCap = 'round'
    for (const tip of someTips) {
      if (tip.open)
        drawTip(context, tip, 1)
    }
  }
  // Takes back the committed drawing in areas, in whole device pixels, so that the copy is exact
  const restore = (areas: Area[]) => {
    view.save()
    view.setTransform(1, 0, 0, 1, 0, 0)
    for (const [x, y, width, height] of areas) {
      const left = Math.max(0, Math.floor(x * ratio))
      const top = Math.max(0, Math.floor(y * ratio))
      const right = Math.min(storeCanvas.width, Math.ceil((x + width) * ratio))
      const bottom = Math.min(storeCanvas.height, Math.ceil((y + height) * ratio))
      if (right <= left || bottom <= top)
        continue
      view.clearRect(left, top, right - left, bottom - top)
      view.drawImage(storeCanvas, left, top, right - left, bottom - top, left, top, right - left, bottom - top)
    }
    view.restore()
  }

  const endArea = (stem: GrowingStem, to: number) => area(piece(stem, stem.committed, to, stem.committedCursor).line, lineWidth / 2 + EDGE_MARGIN)
  // Draws the stems on a context from the distance drawn there to their fronts
  const drawStems = (context: CanvasRenderingContext2D, someStems: GrowingStem[], from: (stem: GrowingStem) => [number, number]) => {
    context.lineCap = 'butt'
    context.beginPath()
    let drawn = false
    for (const stem of someStems) {
      const [distance, cursor] = from(stem)
      if (stem.front > distance) {
        const { line, last: next } = piece(stem, distance, stem.front, cursor)
        addLine(context, line)
        drawn = true
        stem.shown = stem.front
        stem.shownCursor = next
      }
    }
    if (drawn)
      context.stroke()
  }

  const step = (now: number) => {
    frame = requestAnimationFrame(step)
    if (now - last < FRAME_INTERVAL - FRAME_SLACK)
      return
    reached += GROWTH_SPEED * Math.min(now - last, LONGEST_FRAME) / 1000
    last = now
    frameCount++
    const tipFrame = frameCount % TIP_FRAMES === 0
    const commit = frameCount % COMMIT_FRAMES === 0
    for (; nextStem < stems.length && stems[nextStem].start <= reached; nextStem++)
      growingStems.push(stems[nextStem])
    for (const stem of growingStems)
      stem.front = stem.total * (stem.length ? clamp((reached - stem.start) / stem.length) : 1)
    if (!tipFrame) {
      drawStems(view, growingStems, stem => [stem.shown, stem.shownCursor])
      return
    }

    for (; nextTip < tips.length && tips[nextTip].start <= reached; nextTip++)
      openingTips.push(tips[nextTip])
    const progress = new Map(openingTips.map(tip => [tip, clamp((reached - tip.start) / tip.opening)]))
    store.lineCap = 'round'
    for (const tip of openingTips) {
      tip.open = progress.get(tip) === 1
      if (tip.open)
        drawTip(store, tip, 1)
    }
    const tipAreas = openingTips.map(tip => tip.area)
    if (commit) {
      // The committed drawing takes the stems up to their fronts, and the
      // canvas takes it back where it differs
      const ends = growingStems.filter(stem => stem.front > stem.committed)
      const endAreas = ends.map(stem => endArea(stem, stem.front))
      drawStems(store, ends, stem => [stem.committed, stem.committedCursor])
      for (const stem of ends) {
        stem.committed = stem.front
        stem.committedCursor = stem.shownCursor
      }
      restore([...endAreas, ...tipAreas])
      growingStems = growingStems.filter(stem => stem.committed < stem.total)
    }
    else {
      // Taking back an area cuts the ends of the stems in it, so these ends
      // are taken back and drawn again in one piece, and so on
      const ends = growingStems.filter(stem => stem.shown > stem.committed).map(stem => ({ stem, end: endArea(stem, stem.shown) }))
      const restored = [...tipAreas]
      const cut: GrowingStem[] = []
      for (let found = true; found;) {
        found = false
        for (const { stem, end } of ends) {
          if (!cut.includes(stem) && restored.some(other => overlaps(other, end))) {
            cut.push(stem)
            restored.push(end)
            found = true
          }
        }
      }
      restore(restored)
      for (const stem of cut) {
        stem.shown = stem.committed
        stem.shownCursor = stem.committedCursor
      }
      drawStems(view, growingStems, stem => [stem.shown, stem.shownCursor])
    }

    openingTips = openingTips.filter(tip => !tip.open)
    view.lineCap = 'round'
    for (const tip of openingTips) {
      if (progress.get(tip)! > 0)
        drawTip(view, tip, easeOutBack(progress.get(tip)!))
    }
    if (nextStem === stems.length && nextTip === tips.length && !growingStems.length && !openingTips.length) {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }

  const add = (drawing: Parts, delay: number) => {
    lineWidth = Math.max(drawing.strokeWidth, 1 / ratio)
    style(view)
    style(store)
    const offset = Math.max(reached, delay * GROWTH_SPEED / 1000)
    const newStems: GrowingStem[] = drawing.stems.map((stem) => {
      const distances = distancesAlong(stem.points)
      return { ...stem, start: offset + stem.start, distances, total: distances.at(-1)!, front: 0, committed: 0, committedCursor: 1, shown: 0, shownCursor: 1 }
    })
    const newTips: GrowingTip[] = drawing.tips.map((tip) => {
      const reach = tip.radius * LARGEST_SCALE + EDGE_MARGIN
      const area: Area = [tip.x - reach, tip.y - reach, 2 * reach, 2 * reach]
      const [fillPath, strokePath] = [new Path2D(), new Path2D()]
      for (const shape of tip.shapes) {
        const path = new Path2D(shape.d)
        if (shape.filled)
          fillPath.addPath(path)
        strokePath.addPath(path)
      }
      return { ...tip, start: offset + tip.start, fillPath, strokePath, opening: tip.radius * OPENING_RADII, area, open: false }
    })
    if (reduced) {
      for (const stem of newStems)
        stem.committed = stem.total
      for (const tip of newTips)
        tip.open = true
      for (const context of [view, store])
        drawCommitted(context, newStems, newTips)
    }
    // A new stem or tip starts no earlier than the growth so far, so the
    // ones that have started keep their places in the order
    stems.push(...newStems)
    stems.sort(byStart)
    tips.push(...newTips)
    tips.sort(byStart)
    if (reduced || frame)
      return
    last = performance.now()
    frame = requestAnimationFrame(step)
  }

  // The ends of the stems since the last commit and the opening tips come
  // back with the next frame of the tips
  const repaint = (newPaint: string) => {
    paint = newPaint
    style(view)
    style(store)
    store.clearRect(0, 0, storeCanvas.width, storeCanvas.height)
    drawCommitted(store, stems, tips)
    restore([[0, 0, storeCanvas.width / ratio, storeCanvas.height / ratio]])
    for (const stem of growingStems) {
      stem.shown = stem.committed
      stem.shownCursor = stem.committedCursor
    }
  }

  return { add, repaint, stop: () => cancelAnimationFrame(frame) }
}

/** A small, fast, seeded random generator (mulberry32). */
export function random(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6D2B79F5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const radians = (degrees: number) => degrees * Math.PI / 180

/**
 * The flat spec of a plant. A step turns the heading by `turn` degrees and
 * then goes `length` forward; `shift` moves its node only, not the nodes after
 * it. A branch starts at node `at` of its parent, turned by `angle` degrees.
 * A tip sits ahead of the last node, by its radiusX along the heading, and
 * then by its `offset`. Each stem and tip records the growth order for
 * `animate`: `start` is the length of stem grown from the origin to where it
 * sprouts, and a stem's `length` is the length of its own line.
 */
export function develop(plant: Plant): Spec {
  return unfold(plant).spec
}

/** A blossom of a plant, with the branch that carries it. */
interface Blossom {
  branch: BranchBody
  shape: Flower | Bud
  flower: boolean
}

/** The spec of a plant, its blossoms, and the stem of each branch that has one. */
function unfold(plant: Plant) {
  const spec: Spec = { strokeWidth: plant.strokeWidth, stems: [], flowers: [], buds: [] }
  const blossoms: Blossom[] = []
  const stems = new Map<BranchBody, Stem>()
  const walk = (branch: BranchBody, origin: Point, heading: number, start: number) => {
    const nodes: Point[] = [origin]
    const headings = [heading]
    const distances = [start]
    let [x, y] = origin
    for (const { length, turn, shift = [0, 0] } of branch.steps) {
      heading += turn
      x += length * Math.cos(radians(heading))
      y += length * Math.sin(radians(heading))
      const node: Point = [x + shift[0], y + shift[1]]
      const [lastX, lastY] = nodes.at(-1)!
      distances.push(distances.at(-1)! + Math.sqrt((node[0] - lastX) ** 2 + (node[1] - lastY) ** 2))
      nodes.push(node)
      headings.push(heading)
    }
    if (nodes.length > 1) {
      const stem = { points: nodes, start, length: distances.at(-1)! - start }
      spec.stems.push(stem)
      stems.set(branch, stem)
    }
    for (const child of branch.branches ?? [])
      walk(child, nodes[child.at], headings[child.at] + child.angle, distances[child.at])
    const { flower, bud } = branch.tip ?? {}
    const tip = flower ?? bud
    if (!tip)
      return
    const { offset = [0, 0], ...shape } = tip
    const [endX, endY] = nodes.at(-1)!
    const end = radians(headings.at(-1)!)
    const placed = { ...shape, x: endX + tip.radiusX * Math.cos(end) + offset[0], y: endY + tip.radiusX * Math.sin(end) + offset[1], start: distances.at(-1) }
    if (flower)
      spec.flowers.push(placed)
    else
      spec.buds.push(placed)
    blossoms.push({ branch, shape: placed, flower: Boolean(flower) })
  }
  walk(plant.root, plant.root.origin, plant.root.heading, 0)
  return { spec, blossoms, stems }
}

type Range = [number, number]

export interface GrowthParameters {
  box: [number, number, number, number]
  strokeWidth: number
  segment: number
  spread: number
  sway: number
  waves: Range
  branching: number
  angle: Range
  reach: Range
  decay: number
  levels: number
  curl: number
  flowers: number
  buds: number
  flowerSize: Range
  budSize: Range
  stretch: Range
  depth: Range
  petalSize: Range
  petalReach: Range
  weight: Range
  blossomGap: number
  stemCrossing: boolean
  direction: number
}

/**
 * The default growth: a vine about the size of the cover ornament. Ranges are
 * [low, high]; the flower shape ranges are those of the fitted cover flowers.
 */
export const GROWTH: GrowthParameters = {
  box: [0, 0, 240, 560],
  strokeWidth: 2.4,
  // Mean step length, and the random turn of a step, in degrees
  segment: 16,
  spread: 9,
  // The sway of the main stem: its amplitude in degrees and its waves over the height
  sway: 28,
  waves: [0.8, 1.4],
  // The chance of a side branch at a node, the branch angle, the length of
  // a branch over the height, its shrinking per level, and the deepest level
  branching: 0.14,
  angle: [25, 60],
  reach: [0.08, 0.22],
  decay: 0.5,
  levels: 2,
  // The chance that a branch end, or the foot of the vine, curls up
  curl: 0.5,
  flowers: 5,
  buds: 3,
  flowerSize: [0.1, 0.13],
  budSize: [0.04, 0.055],
  stretch: [1, 1.3],
  depth: [0.65, 0.95],
  petalSize: [0.7, 1.15],
  petalReach: [-0.1, 0.2],
  weight: [0.8, 1.5],
  // The least gap between the lines of two blossoms and the tips of their
  // stalks, and whether stems may run through blossoms
  blossomGap: 2,
  stemCrossing: false,
  // The direction of the rise in degrees, a multiple of 90: -90 rises from
  // the foot of the box, 0 grows from its left side to the right
  direction: -90,
}

// The points of the outline of a blossom, for the rule of `grow`
const OUTLINE_POINTS = 72

/** The distance from the centre of a flower to the far edge of a petal ellipse, along a direction (radians), or 0. */
function petalExtent({ middle, centre: [cx, cy], width, length }: PetalEllipse, direction: number) {
  const [dx, dy] = [Math.cos(direction), Math.sin(direction)]
  const [ux, uy] = [Math.cos(middle), Math.sin(middle)]
  // The ray and the centre of the ellipse, in the axes of the ellipse scaled to a unit circle
  const ray = [(dx * ux + dy * uy) / length, (dy * ux - dx * uy) / width]
  const offset = [(cx * ux + cy * uy) / length, (cy * ux - cx * uy) / width]
  const a = ray[0] ** 2 + ray[1] ** 2
  const b = ray[0] * offset[0] + ray[1] * offset[1]
  const discriminant = b * b - a * (offset[0] ** 2 + offset[1] ** 2 - 1)
  return discriminant < 0 ? 0 : Math.max(0, (b + Math.sqrt(discriminant)) / a)
}

/** The drawn outline of a blossom as a polygon: the outer edge of the petals of a flower, or the ellipse of a bud. */
function outline(shape: Flower | Bud, flower: boolean): Point[] {
  const directions = Array.from({ length: OUTLINE_POINTS }, (_, index) => TAU * index / OUTLINE_POINTS)
  if (!flower)
    return directions.map(t => [shape.x + shape.radiusX * Math.cos(t), shape.y + shape.radiusY * Math.sin(t)])
  const ellipses = petalEllipses(shape)
  const transform = blossomTransform(shape)
  return directions.map((direction) => {
    const extent = Math.max(...ellipses.map(ellipse => petalExtent(ellipse, direction)))
    return transform([extent * Math.cos(direction), extent * Math.sin(direction)])
  })
}

function segmentDistance(point: Point, start: Point, end: Point) {
  const [dx, dy] = [end[0] - start[0], end[1] - start[1]]
  const share = clamp(((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy || 1))
  return distance(point, [start[0] + dx * share, start[1] + dy * share])
}

/** The distance from a point to the edge of a polygon, negative inside the polygon. */
function signedDistance(polygon: Point[], point: Point) {
  let nearest = Infinity
  let inside = false
  polygon.forEach((start, index) => {
    const end = polygon[(index + 1) % polygon.length]
    nearest = Math.min(nearest, segmentDistance(point, start, end))
    if ((start[1] > point[1]) !== (end[1] > point[1]) && point[0] < start[0] + (point[1] - start[1]) * (end[0] - start[0]) / (end[1] - start[1]))
      inside = !inside
  })
  return inside ? -nearest : nearest
}

/**
 * A blossom with its outline, the farthest distance of the outline from the
 * centre, half its widest line, the last step of its stalk, and the farthest
 * distance of the outline and that step from the centre.
 */
interface Measured extends Blossom {
  centre: Point
  outline: Point[]
  radius: number
  ink: number
  stalkTip: Point[]
  extent: number
}

/** A blossom measured, with the line of its stalk if it has one. */
function measure(blossom: Blossom, strokeWidth: number, stalk?: Point[]): Measured {
  const centre: Point = [blossom.shape.x, blossom.shape.y]
  const points = outline(blossom.shape, blossom.flower)
  const radius = Math.max(...points.map(point => distance(point, centre)))
  const stalkTip = stalk?.slice(-STEM_SAMPLES - 1) ?? []
  return {
    ...blossom,
    centre,
    outline: points,
    radius,
    ink: strokeWidth * (1 + (blossom.shape.weight ?? 0)) / 2,
    stalkTip,
    extent: Math.max(radius, ...stalkTip.map(point => distance(point, centre))),
  }
}

/** Whether the ink of a line of the given half width through the points keeps the gap from the ink of a blossom. */
function clear(blossom: Measured, points: Point[], half: number, gap: number) {
  const margin = blossom.ink + half + gap
  // Far from the blossom, the distance from its centre is enough
  return points.every(point => distance(point, blossom.centre) >= blossom.radius + margin || signedDistance(blossom.outline, point) >= margin)
}

/** Whether two blossoms, and the tips of their stalks, keep the gap between their lines. */
function apart(a: Measured, b: Measured, strokeWidth: number, gap: number) {
  // Out of the extent of each other, the lines keep the gap, as the ink of a blossom is at least half the stroke
  if (distance(a.centre, b.centre) >= a.extent + b.extent + a.ink + b.ink + gap)
    return true
  return clear(a, b.outline, b.ink, gap) && clear(b, a.outline, a.ink, gap) && clear(a, b.stalkTip, strokeWidth / 2, gap) && clear(b, a.stalkTip, strokeWidth / 2, gap)
}

/** The first point of a line that runs through a blossom: inside its outline, past the ink of the outline. */
function crossing(blossom: Measured, points: Point[]) {
  return points.find(point => distance(point, blossom.centre) < blossom.radius && signedDistance(blossom.outline, point) < -blossom.ink)
}

type Rules = Pick<GrowthParameters, 'strokeWidth' | 'blossomGap' | 'stemCrossing'>

/**
 * The first conflict of a blossom with the blossoms placed before it, and
 * with the lines of the stems of all branches: the centre of a blossom too
 * close, or a point of a stem that runs through it or through which its own
 * stalk runs.
 */
function conflict(blossom: Measured, placed: Measured[], lines: Map<BranchBody, Point[]>, { strokeWidth, blossomGap, stemCrossing }: Rules): Point | undefined {
  const close = placed.find(other => !apart(blossom, other, strokeWidth, blossomGap))
  if (close || stemCrossing)
    return close?.centre
  for (const [branch, points] of lines) {
    const point = branch === blossom.branch ? undefined : crossing(blossom, points)
    if (point)
      return point
  }
  const stalk = lines.get(blossom.branch)
  return stalk && placed.find(other => crossing(other, stalk))?.centre
}

/** The measured blossoms of a plant, and the line of the stem of each branch. */
function survey(plant: Plant, included = (_blossom: Blossom) => true) {
  const { blossoms, stems } = unfold(plant)
  const lines = new Map([...stems].map(([branch, stem]) => [branch, stemPoints(stem)]))
  return { lines, blossoms: blossoms.filter(included).map(blossom => measure(blossom, plant.strokeWidth, lines.get(blossom.branch))) }
}

export interface Collision {
  /** The centre of the blossom that breaks the rule. */
  blossom: Point
  /** The centre of the other blossom, or the point of the stem that crosses. */
  other: Point
}

// A plant does not change after `grow`, so its blossoms are measured once
const measuredBlossoms = new WeakMap<Plant, Measured[]>()

/** The measured blossoms of the plants, for the rule of `grow` across vines. */
function blossomsOf(plants: Plant[]) {
  return plants.flatMap((plant) => {
    if (!measuredBlossoms.has(plant))
      measuredBlossoms.set(plant, survey(plant).blossoms)
    return measuredBlossoms.get(plant)!
  })
}

/**
 * The blossoms of a plant that break the rule of `grow`: each with its first
 * conflict, against the blossoms of the neighbour plants and the blossoms
 * before it in the order of `develop`.
 */
export function collisions(plant: Plant, { blossomGap = GROWTH.blossomGap, stemCrossing = GROWTH.stemCrossing }: Partial<Omit<Rules, 'strokeWidth'>> = {}, neighbours: Plant[] = []): Collision[] {
  const { lines, blossoms } = survey(plant)
  const rules = { strokeWidth: plant.strokeWidth, blossomGap, stemCrossing }
  const others = blossomsOf(neighbours)
  return blossoms.flatMap((blossom, index) => {
    const other = conflict(blossom, [...others, ...blossoms.slice(0, index)], lines, rules)
    return other ? [{ blossom: blossom.centre, other }] : []
  })
}

interface Node {
  x: number
  y: number
  heading: number
}

interface GrowingState extends Node {
  nodes: Node[]
}

type Draw = (low: number, high: number) => number

/** A bud in the ranges of the growth, with values from `between`. */
function budTip({ box, budSize, weight }: GrowthParameters, between: Draw): Tip {
  const size = box[2] * between(...budSize)
  return { bud: { radiusX: size, radiusY: size * between(1, 1.3), rotation: between(0, 360), gap: between(0, 1) < 0.4 ? between(40, 90) : 0, weight: between(...weight) } }
}

/** The angle of a blossom on a node of the main stem, to either side. */
const nodeAngle = (between: Draw) => (between(0, 1) < 0.5 ? -1 : 1) * between(60, 100)

// The placement draws from its own stream of the seed, so that a plant whose
// blossoms keep apart grows as it did before the rule
const PLACEMENT_STREAM = 0x5BD1E995
// The places tried per size of a blossom, the sizes tried from the drawn
// size down to the low end of its range, and the largest extra turn (degrees)
// of the last step of a branch
const PLACEMENT_ATTEMPTS = 12
const PLACEMENT_SIZES = 3
const PLACEMENT_SWING = 45

/**
 * The rule of `grow`: blossoms keep `blossomGap` between their lines and the
 * tips of their stalks, and stems do not run through them unless
 * `stemCrossing` allows it. Each blossom in turn, against those placed before
 * it, tries other places along its branch (other ends of the branch and turns
 * of its last step, or other nodes and angles on the main stem), then smaller
 * sizes, then a bud for a flower, and else drops off. The blossoms of the
 * neighbour plants count as placed.
 */
function separate(plant: Plant, blossoming: BranchBody[], growth: GrowthParameters, next: () => number, neighbours: Measured[]) {
  const between = (low: number, high: number) => low + (high - low) * next()
  const { root } = plant
  const width = growth.box[2]
  const placed = new Set<BranchBody>()
  // The drawn tip, then smaller ones down to the low end of its size range
  const sizes = (tip: Tip): Tip[] => {
    const shape = (tip.flower ?? tip.bud)!
    const smallest = Math.min(shape.radiusX, width * (tip.flower ? growth.flowerSize : growth.budSize)[0])
    return Array.from({ length: PLACEMENT_SIZES }, (_, index) => {
      const scale = 1 + (smallest / shape.radiusX - 1) * index / (PLACEMENT_SIZES - 1)
      const scaled = { ...shape, radiusX: shape.radiusX * scale, radiusY: shape.radiusY * scale }
      return tip.flower ? { flower: scaled } : { bud: scaled }
    })
  }
  for (const branch of blossoming) {
    // Only this branch changes while its blossom tries places, so the rest of the plant is measured once
    const { lines, blossoms } = survey(plant, blossom => placed.has(blossom.branch))
    const others = [...neighbours, ...blossoms]
    const fits = () => {
      const { blossoms, stems } = unfold(plant)
      const stem = stems.get(branch)
      if (stem)
        lines.set(branch, stemPoints(stem))
      else
        lines.delete(branch)
      const blossom = measure(blossoms.find(blossom => blossom.branch === branch)!, plant.strokeWidth, lines.get(branch))
      return !conflict(blossom, others, lines, growth)
    }
    const node = branch as SideBranch
    const { steps, tip } = branch
    const { at, angle } = node
    const lowest = Math.max(1, ...branch.branches!.map(child => child.at + 1))
    const move = (attempt: number) => {
      if (!attempt) {
        Object.assign(branch, steps.length ? { steps } : { at, angle })
      }
      else if (!steps.length) {
        node.at = Math.floor(between(1, root.steps.length))
        node.angle = nodeAngle(between)
      }
      else {
        const end = Math.floor(between(lowest, steps.length + 1))
        const last = steps[end - 1]
        branch.steps = [...steps.slice(0, end - 1), { ...last, turn: last.turn + between(-PLACEMENT_SWING, PLACEMENT_SWING) }]
      }
    }
    const settle = () => {
      for (const form of tip!.flower ? [tip!, budTip(growth, between)] : [tip!]) {
        for (const sized of sizes(form)) {
          branch.tip = sized
          for (let attempt = 0; attempt < PLACEMENT_ATTEMPTS; attempt++) {
            move(attempt)
            if (fits())
              return true
          }
        }
      }
      return false
    }
    if (settle()) {
      placed.add(branch)
      continue
    }
    move(0)
    branch.tip = null
    if (!steps.length)
      root.branches!.splice(root.branches!.indexOf(node), 1)
  }
}

/**
 * Grows a plant like a vine: the main stem rises from a curl at the foot of
 * the box and sways from side to side; at each node a side branch may sprout,
 * and branches sprout branches of their own, shorter each level. Flowers and
 * buds take the branch ends; when there are fewer ends than blossoms, the rest
 * sit on the stems. Free branch ends may curl up. `parameters` override GROWTH.
 * A vine with another `direction` grows upwards in the box turned to it, and
 * then turns with its box. Its blossoms keep apart from the blossoms of the
 * `neighbours`.
 */
export function grow(seed: number, parameters: Partial<GrowthParameters> = {}, neighbours: Plant[] = []): Plant {
  const settings = { ...GROWTH, ...parameters }
  const next = random(seed)
  const between = (low: number, high: number) => low + (high - low) * next()
  const pick = ([low, high]: Range) => between(low, high)
  // The vine grows upwards in its box turned back from the direction
  const turn = settings.direction - GROWTH.direction
  const sideways = Math.abs(Math.sin(radians(turn))) > 0.5
  const [boxLeft, boxTop, boxWidth, boxHeight] = settings.box
  const middle: Point = [boxLeft + boxWidth / 2, boxTop + boxHeight / 2]
  const [width, height] = sideways ? [boxHeight, boxWidth] : [boxWidth, boxHeight]
  const left = middle[0] - width / 2
  const top = middle[1] - height / 2
  const growth: GrowthParameters = { ...settings, box: [left, top, width, height] }
  const right = left + width
  const bottom = top + height

  // Curl steps: a constant turn with growing (or shrinking) steps is a spiral
  const curlSteps = (direction: number, outwards: boolean): Step[] => {
    const count = 8
    const turns = between(0.7, 1.1)
    return Array.from({ length: count }, (_, index) => {
      const share = (outwards ? index : count - 1 - index) / count
      return { length: width * 0.035 * (0.4 + share), turn: direction * turns * 360 / count }
    })
  }

  // Grows the steps of one branch, steered back into the box near its edges
  const steer = (x: number, y: number, heading: number) => {
    const margin = width * 0.12
    const towards = Math.atan2(top + height / 2 - y, left + width / 2 - x) * 180 / Math.PI
    const outside = x < left + margin || x > right - margin || y < top + margin || y > bottom - margin
    return outside ? Math.atan2(Math.sin(radians(towards - heading)), Math.cos(radians(towards - heading))) * 180 / Math.PI * 0.3 : 0
  }
  const advance = (state: GrowingState, step: Step) => {
    state.heading += step.turn
    state.x += step.length * Math.cos(radians(state.heading))
    state.y += step.length * Math.sin(radians(state.heading))
    state.nodes.push({ x: state.x, y: state.y, heading: state.heading })
  }

  const ends: { branch: BranchBody, side: number }[] = []
  // `firstNode` skips the foot curl at the start of the root
  const branchOut = (parent: BranchBody, state: GrowingState, level: number, firstNode = 1) => {
    if (level > growth.levels)
      return
    let side = next() < 0.5 ? -1 : 1
    for (let at = firstNode; at < state.nodes.length - 1; at++) {
      if (next() >= growth.branching * growth.decay ** (level - 1))
        continue
      side = next() < 0.7 ? -side : side
      const node = state.nodes[at]
      const angle = side * pick(growth.angle)
      const branch: SideBranch = { at, angle, steps: [], tip: null, branches: [] }
      const child: GrowingState = { x: node.x, y: node.y, heading: node.heading + angle, nodes: [{ ...node, heading: node.heading + angle }] }
      const count = Math.max(1, Math.round(pick(growth.reach) * height * growth.decay ** (level - 1) / growth.segment))
      const arch = side * between(0, growth.spread)
      for (let index = 0; index < count; index++) {
        const step = { length: growth.segment * between(0.7, 1.3), turn: arch + between(-growth.spread, growth.spread) + steer(child.x, child.y, child.heading) }
        branch.steps.push(step)
        advance(child, step)
      }
      parent.branches!.push(branch)
      ends.push({ branch, side })
      branchOut(branch, child, level + 1)
    }
  }

  const root: RootBranch = { origin: [left + width * between(0.4, 0.6), top + height * 0.9], heading: between(-180, 180), steps: [], tip: null, branches: [] }
  const state: GrowingState = { x: root.origin[0], y: root.origin[1], heading: root.heading, nodes: [{ x: root.origin[0], y: root.origin[1], heading: root.heading }] }
  if (next() < growth.curl) {
    for (const step of curlSteps(next() < 0.5 ? -1 : 1, true)) {
      root.steps.push(step)
      advance(state, step)
    }
  }
  const firstNode = state.nodes.length
  // The rise: towards straight up, plus the sway, the random turn and the steering
  const waves = pick(growth.waves)
  const phase = between(0, 360)
  while (state.y > top + height * 0.1 && root.steps.length < 80) {
    const share = (root.origin[1] - state.y) / height
    const target = -90 + growth.sway * Math.sin(radians(phase + share * 360 * waves))
    const towards = Math.atan2(Math.sin(radians(target - state.heading)), Math.cos(radians(target - state.heading))) * 180 / Math.PI
    const step = { length: growth.segment * between(0.7, 1.3), turn: towards * 0.4 + between(-growth.spread, growth.spread) + steer(state.x, state.y, state.heading) }
    root.steps.push(step)
    advance(state, step)
  }
  ends.push({ branch: root, side: next() < 0.5 ? -1 : 1 })
  branchOut(root, state, 1, firstNode)

  const flowerTip = (): Tip => {
    const size = width * pick(growth.flowerSize)
    return {
      flower: {
        radiusX: size,
        radiusY: size * pick(growth.stretch) * between(1, 1.3),
        rotation: between(-25, 25),
        phase: between(-36, 36),
        depth: pick(growth.depth),
        stretch: pick(growth.stretch),
        sizes: Array.from({ length: 5 }, () => pick(growth.petalSize)),
        reach: pick(growth.petalReach),
        weight: pick(growth.weight),
        centre: between(0.5, 1.5),
      },
    }
  }
  const tips = [...Array.from({ length: growth.flowers }, flowerTip), ...Array.from({ length: growth.buds }, () => budTip(growth, between))]
  // The branches with a blossom, flowers first
  const blossoming: BranchBody[] = []
  ends.sort(() => next() - 0.5)
  for (const { branch, side } of ends) {
    if (tips.length) {
      branch.tip = tips.shift()
      blossoming.push(branch)
    }
    else if (next() < growth.curl) {
      branch.steps.push(...curlSteps(side, false))
    }
  }
  // Blossoms without a branch end sit on the main stem, without a stalk
  for (const tip of tips) {
    const branch = { at: Math.floor(between(1, root.steps.length)), angle: nodeAngle(between), steps: [], tip, branches: [] }
    root.branches!.push(branch)
    blossoming.push(branch)
  }
  if (turn) {
    const [cos, sin] = [Math.cos(radians(turn)), Math.sin(radians(turn))]
    const [dx, dy] = [root.origin[0] - middle[0], root.origin[1] - middle[1]]
    root.origin = [middle[0] + dx * cos - dy * sin, middle[1] + dx * sin + dy * cos]
    root.heading += turn
    for (const { tip } of blossoming) {
      const shape = (tip!.flower ?? tip!.bud)!
      shape.rotation = (shape.rotation ?? 0) + turn
    }
  }
  const plant = { strokeWidth: growth.strokeWidth, root }
  separate(plant, blossoming, growth, random(seed ^ PLACEMENT_STREAM), blossomsOf(neighbours))
  return plant
}

// The vines of a page background. The blossoms of a vine are VINE_SCALE
// times the size of the default growth, its steps are STEP_SCALE times as
// long, and its line is STROKE_SCALE times as wide. A vine branches with
// BRANCHING. The vines from the bottom stand BOTTOM_SPACING apart, and each
// rises through a share of the window height in the range BOTTOM_RISE. The
// vines from a side stand SIDE_SPACING apart and reach SIDE_REACH of the
// window width into it, but at least SIDE_REACH_MINIMUM. A vine sets one
// flower per FLOWER_AREA of its box and one bud per BUD_AREA.
const VINE_SCALE = 0.4
const STEP_SCALE = 0.55
const STROKE_SCALE = 0.35
const BRANCHING = 0.2
const BOTTOM_SPACING = 150
const BOTTOM_RISE = [0.35, 0.8]
const SIDE_SPACING = 220
const SIDE_REACH = 0.4
const SIDE_REACH_MINIMUM = 200
const FLOWER_AREA = 18000
const BUD_AREA = 27000
// The share of its box that a vine reaches beyond its foot, as `grow` sets
// its foot at a tenth of the box from the edge
const FOOT_SHARE = 0.9

interface VineBox {
  box: GrowthParameters['box']
  direction: number
}

/**
 * Vines that grow into a window of the given size from its bottom and its
 * sides, one after the other in the order of a seeded shuffle. All of their
 * blossoms keep apart.
 */
export function* vines(width: number, height: number, seed: number): Generator<Plant> {
  const next = random(seed)
  const boxes: VineBox[] = []
  const bottomCount = Math.max(1, Math.round(width / BOTTOM_SPACING))
  for (let index = 0; index < bottomCount; index++) {
    const rise = height * (BOTTOM_RISE[0] + (BOTTOM_RISE[1] - BOTTOM_RISE[0]) * next())
    boxes.push({ box: [index * width / bottomCount, height - rise, width / bottomCount, rise / FOOT_SHARE], direction: -90 })
  }
  const sideCount = Math.max(1, Math.round(height / SIDE_SPACING))
  const reach = Math.max(width * SIDE_REACH, SIDE_REACH_MINIMUM) / FOOT_SHARE
  for (let index = 0; index < sideCount; index++) {
    const band: [number, number] = [index * height / sideCount, height / sideCount]
    boxes.push({ box: [reach * (FOOT_SHARE - 1), band[0], reach, band[1]], direction: 0 })
    boxes.push({ box: [width - reach * FOOT_SHARE, band[0], reach, band[1]], direction: 180 })
  }
  boxes.sort(() => next() - 0.5)
  const plants: Plant[] = []
  for (const [index, { box, direction }] of boxes.entries()) {
    const [, , boxWidth, boxHeight] = box
    // `grow` sizes the blossoms by the width of the box before it turns
    const growingWidth = direction === -90 ? boxWidth : boxHeight
    const sizeScale = VINE_SCALE * GROWTH.box[2] / growingWidth
    const area = boxWidth * boxHeight
    const plant = grow(seed + index + 1, {
      box,
      direction,
      strokeWidth: GROWTH.strokeWidth * STROKE_SCALE,
      segment: GROWTH.segment * STEP_SCALE,
      branching: BRANCHING,
      flowerSize: [GROWTH.flowerSize[0] * sizeScale, GROWTH.flowerSize[1] * sizeScale],
      budSize: [GROWTH.budSize[0] * sizeScale, GROWTH.budSize[1] * sizeScale],
      flowers: Math.round(area / FLOWER_AREA),
      buds: Math.round(area / BUD_AREA),
    }, plants)
    plants.push(plant)
    yield plant
  }
}
