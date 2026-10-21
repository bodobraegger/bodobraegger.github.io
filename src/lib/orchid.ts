// Plum-blossom vines in line art for the background of a page. The generator
// comes from the vine ornament of the Suzuno Financial recreation, with its
// rule that blossoms keep apart.
//
// A plant is a genome: a root branch that grows from an origin step by step
// (each step a length and a turn), with side branches at its nodes and a tip
// at the end of every branch (a flower, a bud, or nothing). `vines` lays out
// plants along the edges of a window and grows each with `grow`. `parts`
// turns a plant into the lines of its stems and the SVG path data of its
// flowers (petals as brush arcs around a stamen dot) and buds (small,
// optionally open, ellipses), in the order of its growth, and `animate` grows
// them on a canvas.

type Point = [number, number]

interface Shape {
  d: string
  filled: boolean
}

interface FlowerShape {
  radiusX: number
  radiusY: number
  rotation: number
  petals: number
  phase: number
  depth: number
  stretch: number
  sizes: number[]
  reach: number
  weight: number
  centre: number
}

interface BudShape {
  radiusX: number
  radiusY: number
  rotation: number
  gap: number
  weight: number
}

/** A placed tip: its centre, the growth length at which it opens, and the index of the stem that carries it. */
interface Placed {
  x: number
  y: number
  start: number
  stem: number
}

type Flower = FlowerShape & Placed
type Bud = BudShape & Placed

/** A stem: its nodes, or the points of its line, and its growth order with the index of the stem that it sprouts from. */
interface Stem {
  points: Point[]
  start: number
  length: number
  parent?: number
}

interface Step {
  length: number
  turn: number
}

interface Tip {
  flower?: FlowerShape
  bud?: BudShape
}

interface BranchBody {
  steps: Step[]
  tip?: Tip | null
  branches?: SideBranch[]
}

interface SideBranch extends BranchBody {
  at: number
  angle: number
}

interface RootBranch extends BranchBody {
  origin: Point
  heading: number
}

interface Plant {
  strokeWidth: number
  root: RootBranch
  /** From 0, near, to 1, far. */
  depth: number
}

const TAU = Math.PI * 2
const radians = (degrees: number) => degrees * Math.PI / 180
/** The turn in degrees, between -180 and 180, from a heading to a target heading. */
const turnTowards = (target: number, heading: number) => Math.atan2(Math.sin(radians(target - heading)), Math.cos(radians(target - heading))) * 180 / Math.PI

function round(value: number) {
  return Math.round(value * 100) / 100
}

// Math.hypot is several times slower than the square root in V8, and the rule
// of `grow` measures many distances
const distance = ([ax, ay]: Point, [bx, by]: Point) => Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)

// Points per Bezier segment of the line of a stem, for the rule of `grow` and
// for the canvas, and the tension of the curve through the nodes of a stem: 0
// draws straight lines between them, and the low tension of the vines draws
// nearly straight lines, like those of Plum
const STEM_SAMPLES = 8
const TENSION = 0.2

/** Points along the line of a stem: a Catmull-Rom spline through its nodes, in cubic Bezier segments of STEM_SAMPLES points. */
function stemPoints(nodes: Point[]): Point[] {
  const factor = TENSION / 3
  const line: Point[] = [nodes[0]]
  for (let index = 0; index < nodes.length - 1; index++) {
    const before = nodes[Math.max(0, index - 1)]
    const start = nodes[index]
    const end = nodes[index + 1]
    const after = nodes[Math.min(nodes.length - 1, index + 2)]
    const control1: Point = [start[0] + (end[0] - before[0]) * factor, start[1] + (end[1] - before[1]) * factor]
    const control2: Point = [end[0] - (after[0] - start[0]) * factor, end[1] - (after[1] - start[1]) * factor]
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
function ribbonPath(points: Point[], extra: number) {
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
function petalEllipses({ petals, phase, depth, stretch, sizes }: FlowerShape): PetalEllipse[] {
  const half = Math.PI / petals
  return Array.from({ length: petals }, (_, petal) => {
    const middle = radians(phase) - Math.PI / 2 + petal * 2 * half
    const distance = sizes[petal] / (1 + depth * stretch)
    return { middle, centre: [distance * Math.cos(middle), distance * Math.sin(middle)], width: distance * depth, length: distance * depth * stretch }
  })
}

/** Maps the unit circle of a flower onto its slanted outline in the plane. */
function blossomTransform({ x, y, radiusX, radiusY, rotation }: Flower) {
  const angle = radians(rotation)
  return ([u, v]: Point): Point => {
    const px = u * radiusX
    const py = v * radiusY
    return [x + px * Math.cos(angle) - py * Math.sin(angle), y + px * Math.sin(angle) + py * Math.cos(angle)]
  }
}

/**
 * A blossom in line art: each petal is an open arc of its own ellipse, a
 * brush line that is heaviest at the petal tip. The petal ellipses sit around
 * the centre; `depth` is their half width over the distance of their centres,
 * so smaller values cut deeper notches, and `stretch` is their length over
 * their width. `sizes` scales single petals, for a blossom seen at a slant,
 * and `phase` (degrees) turns the petals within the slanted outline. `reach`
 * (radians) carries each arc past the notch into the blossom, or with
 * negative values stops it short. `weight` is the extra line width at the
 * tip, relative to the stroke, and `centre` the radius of the dot of the
 * stamens.
 */
function flowerPath(flower: Flower, strokeWidth: number): Shape[] {
  const { x, y, petals, reach, weight, centre } = flower
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
      return direction * Math.max(0, turn + reach)
    }
    const from = open(-1)
    const to = open(1)
    const steps = Math.max(2, Math.ceil((to - from) / step / 2))
    const points = Array.from({ length: steps + 1 }, (_, index) => transform(pointOn(ellipse, from + (to - from) * index / steps)))
    return { d: ribbonPath(points, weight * strokeWidth), filled: weight > 0 }
  })
  shapes.push({ d: `${ribbonPath(ellipsePoints(x, y, centre, centre, 0, TAU), 0)}Z`, filled: true })
  return shapes
}

const ELLIPSE_STEPS = 24

/** Points on an ellipse, from an angle over a span, both in radians. */
function ellipsePoints(x: number, y: number, radiusX: number, radiusY: number, from: number, span: number) {
  return Array.from({ length: ELLIPSE_STEPS + 1 }, (_, step): Point => {
    const t = from + span * step / ELLIPSE_STEPS
    return [x + radiusX * Math.cos(t), y + radiusY * Math.sin(t)]
  })
}

/**
 * A small ellipse; `gap` in degrees leaves it open, like a curled bud, and
 * `weight` thickens its middle like `flowerPath`.
 */
function budPath({ x, y, radiusX, radiusY, rotation, gap, weight }: Bud, strokeWidth: number): Shape {
  const extra = weight * strokeWidth
  return { d: ribbonPath(ellipsePoints(x, y, radiusX, radiusY, radians(rotation) + gap * Math.PI / 360, TAU - radians(gap)), extra), filled: extra > 0 }
}

/** The shapes of a tip, its centre, its place in the growth order, the farthest distance of its ink from its centre, and the index of the stem that carries it. */
interface TipPart {
  shapes: Shape[]
  x: number
  y: number
  start: number
  radius: number
  stem: number
}

export interface Parts {
  strokeWidth: number
  stems: Stem[]
  tips: TipPart[]
  depth: number
}

/**
 * The drawing of a plant: the line of each stem, and per tip (flowers, then
 * buds) the SVG path data of its shapes around its centre.
 */
export function parts(plant: Plant): Parts {
  const { strokeWidth, depth } = plant
  const { stems, blossoms } = unfold(plant)
  // The ink of a tip ends within its outline and the width of its widest line
  const tip = (blossom: Blossom): TipPart => {
    const { x, y, start, weight, stem } = blossom.shape
    const shapes = blossom.flower ? flowerPath(blossom.shape, strokeWidth) : [budPath(blossom.shape, strokeWidth)]
    const radius = Math.max(...outline(blossom).map(point => distance(point, [x, y]))) + strokeWidth * (1 + weight)
    return { shapes, x, y, start, radius, stem }
  }
  return {
    strokeWidth,
    stems: stems.map(stem => ({ ...stem, points: stemPoints(stem.points) })),
    tips: [...blossoms.filter(blossom => blossom.flower), ...blossoms.filter(blossom => !blossom.flower)].map(tip),
    depth,
  }
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

/** The growth of the stems at their middle pace, in canvas units per second. */
const GROWTH_SPEED = 20
// A growing stem rests with PAUSE_CHANCE per frame, and a resting stem goes
// on with RESUME_CHANCE, so that the tips grow in fits and starts, as those
// of Plum do. While it grows, a stem takes a pace between PACE_LOW and
// PACE_HIGH times the middle pace in each frame.
const PAUSE_CHANCE = 0.04
const RESUME_CHANCE = 0.12
const PACE_LOW = 0.5
const PACE_HIGH = 1.5
// The time between two drawn frames, 30 frames per second as Plum draws on a
// 60 Hz screen, less a slack for the jitter of the animation frames. At this
// rate a stem grows at most a pixel per frame. A hidden tab gets no animation
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

// The ink of a stem changes with the share of the growth of its vine: at
// the foot a line is FOOT_WIDTH times the stroke width at FOOT_ALPHA, at the
// tips TIP_WIDTH times at TIP_ALPHA, but at least a device pixel wide. The
// ink takes INK_LEVELS steps, so that a frame draws the new ends of the stems
// with one stroke per level. A blossom takes an alpha between BLOSSOM_ALPHA
// and 1. Strokes of less than full alpha darken where they cross.
const FOOT_WIDTH = 2
const TIP_WIDTH = 0.8
const FOOT_ALPHA = 0.95
const TIP_ALPHA = 0.45
const INK_LEVELS = 8
const BLOSSOM_ALPHA = 0.75
// The ink of a vine at depth 1, far, has FAR_ALPHA times the alpha of the
// ink of a vine at depth 0, near
const FAR_ALPHA = 0.4

interface Ink {
  width: number
  alpha: number
  depth: number
}

type Area = [number, number, number, number]

const overlaps = ([ax, ay, aw, ah]: Area, [bx, by, bw, bh]: Area) => ax < bx + bw && bx < ax + aw && ay < by + bh && by < ay + ah

/**
 * A stem in the growth: the distances of its points from its start, its
 * length, the distance of its growth so far, the distance in the committed
 * drawing and the distance drawn on the canvas, each with the point that
 * ends the segment of that distance. Its lag is the growth length that it
 * fell behind by its pauses and its pace, those of its parent included.
 */
interface GrowingStem extends Stem {
  distances: number[]
  total: number
  front: number
  committed: number
  committedCursor: number
  shown: number
  shownCursor: number
  parentStem?: GrowingStem
  started: boolean
  resting: boolean
  lag: number
  /** The ink of each level along the stem. */
  inks: Ink[]
  /** The share of the growth of its vine at the start of the stem, and per unit of its length. */
  inkStart: number
  inkScale: number
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
  carrier?: GrowingStem
  alpha: number
  lineWidth: number
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
  context.globalAlpha = tip.alpha
  context.lineWidth = tip.lineWidth
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
 * its genome, each at an uneven pace, each side branch sprouts when its
 * parent reaches its node, and each tip opens when its branch arrives, scaled
 * up from its centre. The loop rests when all stems and tips are
 * complete, and `add` wakes it. With reduced motion, `add` draws the end
 * state at once. Lines are at least one device pixel wide, and the context
 * takes the scale of its canvas before the call.
 */
export function animate(view: CanvasRenderingContext2D, paint: string): Growth {
  const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches
  const ratio = view.getTransform().a
  let lineWidth = 1 / ratio
  // The inks of the levels for each stroke width and depth
  const inkTables = new Map<string, Ink[]>()
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
  // The stems and tips whose time has come, but whose stem has not yet reached them
  let waitingStems: GrowingStem[] = []
  let waitingTips: GrowingTip[] = []
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
  // The pieces of the line of a stem between two distances, split where the
  // ink changes, each with its ink level, and the point that ends the last
  const inkPieces = (stem: GrowingStem, from: number, to: number, first: number) => {
    const pieces: { line: Point[], level: number }[] = []
    let cursor = first
    while (from < to) {
      const level = Math.min(INK_LEVELS - 1, Math.max(0, Math.floor((stem.inkStart + from * stem.inkScale) * INK_LEVELS)))
      const boundary = ((level + 1) / INK_LEVELS - stem.inkStart) / stem.inkScale
      const end = boundary > from ? Math.min(to, boundary) : to
      const { line, last: next } = piece(stem, from, end, cursor)
      pieces.push({ line, level })
      cursor = next
      from = end
    }
    return { pieces, last: cursor }
  }
  const strokeLines = (context: CanvasRenderingContext2D, lines: Point[][], { width, alpha }: Ink) => {
    context.lineWidth = width
    context.globalAlpha = alpha
    context.beginPath()
    for (const line of lines)
      addLine(context, line)
    context.stroke()
  }
  // Draws the stems up to their committed distance, and the open tips, each
  // piece of a stem in a stroke of its own, so that crossings darken
  const drawCommitted = (context: CanvasRenderingContext2D, someStems: GrowingStem[], someTips: GrowingTip[]) => {
    context.lineCap = 'butt'
    for (const stem of someStems) {
      for (const { line, level } of inkPieces(stem, 0, stem.committed, 1).pieces)
        strokeLines(context, [line], stem.inks[level])
    }
    context.globalAlpha = 1
    context.lineWidth = lineWidth
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
    view.globalAlpha = 1
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

  // Whether the stem that carries a stem or a tip has reached its place
  const arrived = ({ start }: { start: number }, carrier?: GrowingStem) => !carrier || (carrier.started && reached - carrier.lag >= start)
  const endArea = (stem: GrowingStem, to: number) => area(piece(stem, stem.committed, to, stem.committedCursor).line, stem.inks[0].width / 2 + EDGE_MARGIN)
  // Draws the stems on a context from the distance drawn there to their
  // fronts, in one stroke per ink, the far inks first. A new piece darkens
  // where it crosses the ink before it, and the new pieces of one frame
  // seldom cross.
  const drawStems = (context: CanvasRenderingContext2D, someStems: GrowingStem[], from: (stem: GrowingStem) => [number, number]) => {
    context.lineCap = 'butt'
    const batches = new Map<Ink, Point[][]>()
    for (const stem of someStems) {
      const [distance, cursor] = from(stem)
      if (stem.front > distance) {
        const { pieces, last: next } = inkPieces(stem, distance, stem.front, cursor)
        for (const { line, level } of pieces) {
          const ink = stem.inks[level]
          if (batches.has(ink))
            batches.get(ink)!.push(line)
          else
            batches.set(ink, [line])
        }
        stem.shown = stem.front
        stem.shownCursor = next
      }
    }
    for (const [ink, lines] of [...batches].sort(([a], [b]) => b.depth - a.depth))
      strokeLines(context, lines, ink)
    context.globalAlpha = 1
    context.lineWidth = lineWidth
  }

  const step = (now: number) => {
    frame = requestAnimationFrame(step)
    if (now - last < FRAME_INTERVAL - FRAME_SLACK)
      return
    const growth = GROWTH_SPEED * Math.min(now - last, LONGEST_FRAME) / 1000
    reached += growth
    last = now
    frameCount++
    const tipFrame = frameCount % TIP_FRAMES === 0
    const commit = frameCount % COMMIT_FRAMES === 0
    for (; nextStem < stems.length && stems[nextStem].start <= reached; nextStem++)
      waitingStems.push(stems[nextStem])
    waitingStems = waitingStems.filter((stem) => {
      if (!arrived(stem, stem.parentStem))
        return true
      stem.started = true
      stem.lag = stem.parentStem?.lag ?? 0
      growingStems.push(stem)
      return false
    })
    for (const stem of growingStems) {
      if (Math.random() < (stem.resting ? RESUME_CHANCE : PAUSE_CHANCE))
        stem.resting = !stem.resting
      const pace = stem.resting ? 0 : PACE_LOW + Math.random() * (PACE_HIGH - PACE_LOW)
      stem.lag += growth * (1 - pace)
      stem.front = stem.total * (stem.length ? clamp((reached - stem.start - stem.lag) / stem.length) : 1)
    }
    if (!tipFrame) {
      drawStems(view, growingStems, stem => [stem.shown, stem.shownCursor])
      return
    }

    for (; nextTip < tips.length && tips[nextTip].start <= reached; nextTip++)
      waitingTips.push(tips[nextTip])
    waitingTips = waitingTips.filter((tip) => {
      if (!arrived(tip, tip.carrier))
        return true
      tip.start = reached
      openingTips.push(tip)
      return false
    })
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
    if (nextStem === stems.length && nextTip === tips.length && !waitingStems.length && !waitingTips.length && !growingStems.length && !openingTips.length) {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }

  const add = (drawing: Parts, delay: number) => {
    const { strokeWidth, depth } = drawing
    lineWidth = Math.max(strokeWidth, 1 / ratio)
    const depthAlpha = 1 + (FAR_ALPHA - 1) * depth
    const inkKey = `${strokeWidth} ${depth}`
    if (!inkTables.has(inkKey)) {
      inkTables.set(inkKey, Array.from({ length: INK_LEVELS }, (_, level) => {
        const share = (level + 0.5) / INK_LEVELS
        return {
          width: Math.max(strokeWidth * (FOOT_WIDTH + (TIP_WIDTH - FOOT_WIDTH) * share), 1 / ratio),
          alpha: (FOOT_ALPHA + (TIP_ALPHA - FOOT_ALPHA) * share) * depthAlpha,
          depth,
        }
      }))
    }
    const inks = inkTables.get(inkKey)!
    style(view)
    style(store)
    const offset = Math.max(reached, delay * GROWTH_SPEED / 1000)
    // The growth length of the vine from its foot to its farthest tip
    const extent = Math.max(...drawing.stems.map(stem => stem.start + stem.length), 1)
    const newStems: GrowingStem[] = drawing.stems.map((stem) => {
      const distances = distancesAlong(stem.points)
      const total = distances.at(-1)!
      // The ink follows the growth length, and the drawn line of a stem is a little longer than its growth length
      const inkScale = stem.length / (total || 1) / extent
      return { ...stem, start: offset + stem.start, distances, total, front: 0, committed: 0, committedCursor: 1, shown: 0, shownCursor: 1, started: false, resting: false, lag: 0, inkStart: stem.start / extent, inkScale, inks }
    })
    newStems.forEach((stem, index) => stem.parentStem = newStems[drawing.stems[index].parent ?? -1])
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
      return { ...tip, start: offset + tip.start, fillPath, strokePath, opening: tip.radius * OPENING_RADII, area, open: false, carrier: newStems[tip.stem ?? -1], alpha: (BLOSSOM_ALPHA + (1 - BLOSSOM_ALPHA) * Math.random()) * depthAlpha, lineWidth }
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

/** A blossom of a plant, with the branch that carries it. */
type Blossom = { branch: BranchBody } & ({ flower: true, shape: Flower } | { flower: false, shape: Bud })

/**
 * The stems of a plant, with their nodes as points, its blossoms, and the
 * stem of each branch that has steps. A step turns the heading by `turn`
 * degrees and then goes `length` forward. A branch starts at node `at` of its
 * parent, turned by `angle` degrees. A tip sits ahead of the last node, by
 * its radiusX along the heading. Each stem and tip records the growth order
 * for `animate`: `start` is the length of stem grown from the origin to where
 * it sprouts, and a stem's `length` is the length of its own line.
 */
function unfold(plant: Plant) {
  const stems: Stem[] = []
  const blossoms: Blossom[] = []
  const branchStems = new Map<BranchBody, Stem>()
  const walk = (branch: BranchBody, origin: Point, heading: number, start: number, parent?: number) => {
    const nodes: Point[] = [origin]
    const headings = [heading]
    const distances = [start]
    let [x, y] = origin
    for (const { length, turn } of branch.steps) {
      heading += turn
      x += length * Math.cos(radians(heading))
      y += length * Math.sin(radians(heading))
      distances.push(distances.at(-1)! + distance([x, y], nodes.at(-1)!))
      nodes.push([x, y])
      headings.push(heading)
    }
    // The stem of this branch, or the stem that carries a branch without steps
    let own = parent
    if (nodes.length > 1) {
      const stem = { points: nodes, start, length: distances.at(-1)! - start, parent }
      stems.push(stem)
      branchStems.set(branch, stem)
      own = stems.length - 1
    }
    for (const child of branch.branches ?? [])
      walk(child, nodes[child.at], headings[child.at] + child.angle, distances[child.at], own)
    const { flower, bud } = branch.tip ?? {}
    const shape = flower ?? bud
    if (!shape)
      return
    const [endX, endY] = nodes.at(-1)!
    const end = radians(headings.at(-1)!)
    // The root always has steps, so each tip has a stem
    const placed = { x: endX + shape.radiusX * Math.cos(end), y: endY + shape.radiusX * Math.sin(end), start: distances.at(-1)!, stem: own! }
    blossoms.push(flower ? { branch, flower: true, shape: { ...flower, ...placed } } : { branch, flower: false, shape: { ...bud!, ...placed } })
  }
  walk(plant.root, plant.root.origin, plant.root.heading, 0)
  return { stems, blossoms, branchStems }
}

type Range = [number, number]

// The growth of a vine, in pixels and degrees. A step of a stem is SEGMENT
// long on average, varies in length by STEP_VARIATION of that, and turns by
// up to SPREAD at random. The main stem sways by SWAY in WAVES waves over the
// height of its box, and takes at most one step per ROOT_STEP_HEIGHT of that
// height. At a node, a side branch sprouts with the chance BRANCHING, at an
// angle in ANGLE, and reaches a share of the height of the box in REACH. Each
// level of branches has DECAY times the chance and the reach of the level
// before it, down to LEVELS levels. A branch end without a blossom, and the
// foot of the vine, curl up with the chance CURL, in CURL_STEPS steps from
// 0.4 to 1.4 times CURL_STEP long.
const SEGMENT = 4.4
const STEP_VARIATION = 0.6
const SPREAD = 16
const SWAY = 28
const WAVES: Range = [0.8, 1.4]
const ROOT_STEP_HEIGHT = 1.925
const BRANCHING = 0.2
const ANGLE: Range = [25, 60]
const REACH: Range = [0.04, 0.11]
const DECAY = 0.5
const LEVELS = 2
const CURL = 0.5
const CURL_STEPS = 8
const CURL_STEP = 2.31
// The ink and the blossoms of a vine, before the scale of its depth. Its
// line is STROKE_WIDTH wide. A flower has a radius in FLOWER_RADIUS, a stretch
// in STRETCH, petals of a size in PETAL_SIZE, with notches of PETAL_DEPTH and
// arcs that reach PETAL_REACH past them, and it turns by up to TWIST.
// PETAL_CHANGE of the flowers have a missing or an extra petal. A bud has a
// radius in BUD_RADIUS. The lines of both are WEIGHT times the stroke wider
// at the tip of a petal or the middle of a bud. Blossoms keep BLOSSOM_GAP
// between their lines and the tips of their stalks.
const STROKE_WIDTH = 0.6
const FLOWER_RADIUS: Range = [3.36, 7.68]
const STRETCH: Range = [1, 1.3]
const PETAL_SIZE: Range = [0.6, 1.2]
const PETAL_DEPTH: Range = [0.65, 0.95]
const PETAL_REACH: Range = [-0.1, 0.2]
const TWIST = 180
const PETAL_CHANGE = 0.25
const BUD_RADIUS: Range = [1.44, 3.12]
const WEIGHT: Range = [0.8, 1.5]
const BLOSSOM_GAP = 2

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
function outline({ flower, shape }: Blossom): Point[] {
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
type Measured = Blossom & {
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
  const points = outline(blossom)
  const radius = Math.max(...points.map(point => distance(point, centre)))
  const stalkTip = stalk?.slice(-STEM_SAMPLES - 1) ?? []
  return {
    ...blossom,
    centre,
    outline: points,
    radius,
    ink: strokeWidth * (1 + blossom.shape.weight) / 2,
    stalkTip,
    extent: Math.max(radius, ...stalkTip.map(point => distance(point, centre))),
  }
}

/** Whether the ink of a line of the given half width through the points keeps the gap from the ink of a blossom. */
function clear(blossom: Measured, points: Point[], half: number) {
  const margin = blossom.ink + half + BLOSSOM_GAP
  // Far from the blossom, the distance from its centre is enough
  return points.every(point => distance(point, blossom.centre) >= blossom.radius + margin || signedDistance(blossom.outline, point) >= margin)
}

/** Whether two blossoms, and the tips of their stalks, keep the gap between their lines. */
function apart(a: Measured, b: Measured, strokeWidth: number) {
  // Out of the extent of each other, the lines keep the gap, as the ink of a blossom is at least half the stroke
  if (distance(a.centre, b.centre) >= a.extent + b.extent + a.ink + b.ink + BLOSSOM_GAP)
    return true
  return clear(a, b.outline, b.ink) && clear(b, a.outline, a.ink) && clear(a, b.stalkTip, strokeWidth / 2) && clear(b, a.stalkTip, strokeWidth / 2)
}

/** The first point of a line that runs through a blossom: inside its outline, past the ink of the outline. */
function crossing(blossom: Measured, points: Point[]) {
  return points.find(point => distance(point, blossom.centre) < blossom.radius && signedDistance(blossom.outline, point) < -blossom.ink)
}

/**
 * The first conflict of a blossom with the blossoms placed before it, and
 * with the lines of the stems of all branches: the centre of a blossom too
 * close, or a point of a stem that runs through it or through which its own
 * stalk runs.
 */
function conflict(blossom: Measured, placed: Measured[], lines: Map<BranchBody, Point[]>, strokeWidth: number): Point | undefined {
  const close = placed.find(other => !apart(blossom, other, strokeWidth))
  if (close)
    return close.centre
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
  const { blossoms, branchStems } = unfold(plant)
  const lines = new Map([...branchStems].map(([branch, stem]) => [branch, stemPoints(stem.points)]))
  return { lines, blossoms: blossoms.filter(included).map(blossom => measure(blossom, plant.strokeWidth, lines.get(blossom.branch))) }
}

interface Collision {
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
 * before it in the order of `unfold`.
 */
export function collisions(plant: Plant, neighbours: Plant[]): Collision[] {
  const { lines, blossoms } = survey(plant)
  const others = blossomsOf(neighbours)
  return blossoms.flatMap((blossom, index) => {
    const other = conflict(blossom, [...others, ...blossoms.slice(0, index)], lines, plant.strokeWidth)
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

/** A bud, with values from `between`, at the scale of the depth of its vine. */
function budTip(scale: number, between: Draw): Tip {
  const size = scale * between(...BUD_RADIUS)
  return { bud: { radiusX: size, radiusY: size * between(1, 1.3), rotation: between(0, 360), gap: between(0, 1) < 0.4 ? between(40, 90) : 0, weight: between(...WEIGHT) } }
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
 * The rule of `grow`: blossoms keep BLOSSOM_GAP between their lines and the
 * tips of their stalks, and stems do not run through them. Each blossom in
 * turn, against those placed before it, tries other places along its branch
 * (other ends of the branch and turns of its last step, or other nodes and
 * angles on the main stem), then smaller sizes, then a bud for a flower, and
 * else drops off. The blossoms of the neighbour plants count as placed.
 */
function separate(plant: Plant, blossoming: BranchBody[], scale: number, next: () => number, neighbours: Measured[]) {
  const between = (low: number, high: number) => low + (high - low) * next()
  const { root } = plant
  const placed = new Set<BranchBody>()
  // The drawn tip, then smaller ones down to the low end of its size range
  const sizes = (tip: Tip): Tip[] => {
    const shape = (tip.flower ?? tip.bud)!
    const smallest = Math.min(shape.radiusX, scale * (tip.flower ? FLOWER_RADIUS : BUD_RADIUS)[0])
    return Array.from({ length: PLACEMENT_SIZES }, (_, index) => {
      const factor = 1 + (smallest / shape.radiusX - 1) * index / (PLACEMENT_SIZES - 1)
      const scaled = { ...shape, radiusX: shape.radiusX * factor, radiusY: shape.radiusY * factor }
      return (tip.flower ? { flower: scaled } : { bud: scaled }) as Tip
    })
  }
  for (const branch of blossoming) {
    // Only this branch changes while its blossom tries places, so the rest of the plant is measured once
    const { lines, blossoms } = survey(plant, blossom => placed.has(blossom.branch))
    const others = [...neighbours, ...blossoms]
    const fits = () => {
      const { blossoms, branchStems } = unfold(plant)
      const stem = branchStems.get(branch)
      if (stem)
        lines.set(branch, stemPoints(stem.points))
      else
        lines.delete(branch)
      const blossom = measure(blossoms.find(blossom => blossom.branch === branch)!, plant.strokeWidth, lines.get(branch))
      return !conflict(blossom, others, lines, plant.strokeWidth)
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
      for (const form of tip!.flower ? [tip!, budTip(scale, between)] : [tip!]) {
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

// The layout of the vines in a window. The feet of the vines from the bottom
// stand BOTTOM_SPACING apart, and each of these vines rises through a share
// of the window height in the range BOTTOM_RISE. The feet of the vines from a
// side stand SIDE_SPACING apart, and these vines reach SIDE_REACH of the
// window width into it, but at least SIDE_REACH_MINIMUM, times a share in the
// range REACH_VARIATION. Each foot moves along its edge by up to FOOT_JITTER
// of the spacing, so that the vines do not stand in a row. The box of a vine
// is BOX_PROPORTION as wide as it is high, so the boxes of neighbours
// overlap: `grow` steers a vine back towards the middle of its box, and a
// narrower box holds a vine at its middle height. A vine sets one flower per
// FLOWER_AREA and one bud per BUD_AREA of the area between its neighbours.
const BOTTOM_SPACING = 75
const BOTTOM_RISE = [0.3, 0.72]
const SIDE_SPACING = 110
const SIDE_REACH = 0.36
const SIDE_REACH_MINIMUM = 260
const REACH_VARIATION = [0.85, 1.15]
const FOOT_JITTER = 0.45
const BOX_PROPORTION = 3 / 7
const FLOWER_AREA = 12000
const BUD_AREA = 18000
// The share of its box that a vine reaches beyond its foot: its foot stands
// a tenth of the box from the edge
const FOOT_SHARE = 0.9
// Each vine stands at one of DEPTH_LEVELS depths, from near (0) to far (1).
// A far vine has FAR_SIZE times the line width and the blossom size, a near
// vine NEAR_SIZE times, and the far vines grow first.
const DEPTH_LEVELS = 4
const NEAR_SIZE = 1.15
const FAR_SIZE = 0.75

interface Vine {
  /** Left, top, width and height. */
  box: [number, number, number, number]
  /** The direction of the rise in degrees: -90 rises from the foot of the box, 0 grows from its left side to the right. */
  direction: number
  /** The area between the neighbours of the vine. */
  area: number
  depth: number
}

/**
 * Grows a vine: the main stem rises from a curl at the foot of its box and
 * sways from side to side; at each node a side branch may sprout, and
 * branches sprout branches of their own, shorter each level. Flowers and buds
 * take the branch ends; when there are fewer ends than blossoms, the rest sit
 * on the main stem. Free branch ends may curl up. A vine with another
 * direction grows upwards in its box turned back from that direction, and
 * then turns with its box. Its blossoms keep apart from the blossoms of the
 * `neighbours`.
 */
function grow(seed: number, { box, direction, area, depth }: Vine, neighbours: Plant[]): Plant {
  const next = random(seed)
  const between = (low: number, high: number) => low + (high - low) * next()
  const pick = ([low, high]: Range) => between(low, high)
  const scale = NEAR_SIZE + (FAR_SIZE - NEAR_SIZE) * depth
  const turn = direction + 90
  const sideways = Math.abs(Math.sin(radians(turn))) > 0.5
  const [boxLeft, boxTop, boxWidth, boxHeight] = box
  const middle: Point = [boxLeft + boxWidth / 2, boxTop + boxHeight / 2]
  const [width, height] = sideways ? [boxHeight, boxWidth] : [boxWidth, boxHeight]
  const left = middle[0] - width / 2
  const top = middle[1] - height / 2
  const right = left + width
  const bottom = top + height

  // Curl steps: a constant turn with growing (or shrinking) steps is a spiral
  const curlSteps = (direction: number, outwards: boolean): Step[] => {
    const turns = between(0.7, 1.1)
    return Array.from({ length: CURL_STEPS }, (_, index) => {
      const share = (outwards ? index : CURL_STEPS - 1 - index) / CURL_STEPS
      return { length: CURL_STEP * (0.4 + share), turn: direction * turns * 360 / CURL_STEPS }
    })
  }

  // The turn that steers a stem back into the box near its edges
  const steer = (x: number, y: number, heading: number) => {
    const margin = width * 0.12
    const outside = x < left + margin || x > right - margin || y < top + margin || y > bottom - margin
    return outside ? turnTowards(Math.atan2(top + height / 2 - y, left + width / 2 - x) * 180 / Math.PI, heading) * 0.3 : 0
  }
  const advance = (state: GrowingState, step: Step) => {
    state.heading += step.turn
    state.x += step.length * Math.cos(radians(state.heading))
    state.y += step.length * Math.sin(radians(state.heading))
    state.nodes.push({ x: state.x, y: state.y, heading: state.heading })
  }
  // Adds a random step to a branch, which turns by `bias` and the steering besides
  const extend = (branch: BranchBody, state: GrowingState, bias: number) => {
    const step = { length: SEGMENT * between(1 - STEP_VARIATION, 1 + STEP_VARIATION), turn: bias + between(-SPREAD, SPREAD) + steer(state.x, state.y, state.heading) }
    branch.steps.push(step)
    advance(state, step)
  }

  const ends: { branch: BranchBody, side: number }[] = []
  // `firstNode` skips the foot curl at the start of the root
  const branchOut = (parent: BranchBody, state: GrowingState, level: number, firstNode = 1) => {
    if (level > LEVELS)
      return
    let side = next() < 0.5 ? -1 : 1
    for (let at = firstNode; at < state.nodes.length - 1; at++) {
      if (next() >= BRANCHING * DECAY ** (level - 1))
        continue
      side = next() < 0.7 ? -side : side
      const node = state.nodes[at]
      const angle = side * pick(ANGLE)
      const branch: SideBranch = { at, angle, steps: [], tip: null, branches: [] }
      const child: GrowingState = { x: node.x, y: node.y, heading: node.heading + angle, nodes: [{ ...node, heading: node.heading + angle }] }
      const count = Math.max(1, Math.round(pick(REACH) * height * DECAY ** (level - 1) / SEGMENT))
      const arch = side * between(0, SPREAD)
      for (let index = 0; index < count; index++)
        extend(branch, child, arch)
      parent.branches!.push(branch)
      ends.push({ branch, side })
      branchOut(branch, child, level + 1)
    }
  }

  const root: RootBranch = { origin: [left + width * between(0.4, 0.6), top + height * FOOT_SHARE], heading: between(-180, 180), steps: [], tip: null, branches: [] }
  const state: GrowingState = { x: root.origin[0], y: root.origin[1], heading: root.heading, nodes: [{ x: root.origin[0], y: root.origin[1], heading: root.heading }] }
  if (next() < CURL) {
    for (const step of curlSteps(next() < 0.5 ? -1 : 1, true)) {
      root.steps.push(step)
      advance(state, step)
    }
  }
  const firstNode = state.nodes.length
  // The rise: towards straight up, plus the sway, the random turn and the steering
  const waves = pick(WAVES)
  const phase = between(0, 360)
  const rootSteps = Math.round(height / ROOT_STEP_HEIGHT)
  while (state.y > top + height * 0.1 && root.steps.length < rootSteps) {
    const share = (root.origin[1] - state.y) / height
    const target = -90 + SWAY * Math.sin(radians(phase + share * 360 * waves))
    extend(root, state, turnTowards(target, state.heading) * 0.4)
  }
  ends.push({ branch: root, side: next() < 0.5 ? -1 : 1 })
  branchOut(root, state, 1, firstNode)

  const flowerTip = (): Tip => {
    const size = scale * pick(FLOWER_RADIUS)
    const petals = next() < PETAL_CHANGE ? (next() < 0.5 ? 4 : 6) : 5
    return {
      flower: {
        radiusX: size,
        radiusY: size * pick(STRETCH) * between(1, 1.3),
        rotation: between(-TWIST, TWIST),
        phase: between(-36, 36),
        depth: pick(PETAL_DEPTH),
        stretch: pick(STRETCH),
        petals,
        sizes: Array.from({ length: petals }, () => pick(PETAL_SIZE)),
        reach: pick(PETAL_REACH),
        weight: pick(WEIGHT),
        centre: between(0.5, 1.5),
      },
    }
  }
  const tips = [...Array.from({ length: Math.round(area / FLOWER_AREA) }, flowerTip), ...Array.from({ length: Math.round(area / BUD_AREA) }, () => budTip(scale, between))]
  // The branches with a blossom, flowers first
  const blossoming: BranchBody[] = []
  ends.sort(() => next() - 0.5)
  for (const { branch, side } of ends) {
    if (tips.length) {
      branch.tip = tips.shift()
      blossoming.push(branch)
    }
    else if (next() < CURL) {
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
      shape.rotation += turn
    }
  }
  const plant = { strokeWidth: STROKE_WIDTH * scale, root, depth }
  separate(plant, blossoming, scale, random(seed ^ PLACEMENT_STREAM), blossomsOf(neighbours))
  return plant
}

/**
 * Vines that grow into a window of the given size from its bottom and its
 * sides, one after the other in the order of a seeded shuffle. All of their
 * blossoms keep apart.
 */
export function* vines(width: number, height: number, seed: number): Generator<Plant> {
  const next = random(seed)
  const between = ([low, high]: number[]) => low + (high - low) * next()
  const jitter = () => between([-FOOT_JITTER, FOOT_JITTER])
  const boxes: Vine[] = []
  const bottomCount = Math.max(1, Math.round(width / BOTTOM_SPACING))
  for (let index = 0; index < bottomCount; index++) {
    const foot = (index + 0.5 + jitter()) * width / bottomCount
    const rise = height * between(BOTTOM_RISE)
    const across = rise / FOOT_SHARE * BOX_PROPORTION
    boxes.push({ box: [foot - across / 2, height - rise, across, rise / FOOT_SHARE], direction: -90, area: BOTTOM_SPACING * rise, depth: 0 })
  }
  const sideCount = Math.max(1, Math.round(height / SIDE_SPACING))
  const sideReach = Math.max(width * SIDE_REACH, SIDE_REACH_MINIMUM) / FOOT_SHARE
  for (let index = 0; index < sideCount; index++) {
    for (const direction of [0, 180]) {
      const foot = (index + 0.5 + jitter()) * height / sideCount
      const reach = sideReach * between(REACH_VARIATION)
      const across = reach * BOX_PROPORTION
      const left = direction ? width - reach * FOOT_SHARE : reach * (FOOT_SHARE - 1)
      boxes.push({ box: [left, foot - across / 2, reach, across], direction, area: SIDE_SPACING * reach * FOOT_SHARE, depth: 0 })
    }
  }
  for (const vine of boxes)
    vine.depth = Math.floor(next() * DEPTH_LEVELS) / (DEPTH_LEVELS - 1)
  boxes.sort((a, b) => b.depth - a.depth)
  const plants: Plant[] = []
  for (const [index, vine] of boxes.entries()) {
    const plant = grow(seed + index + 1, vine, plants)
    plants.push(plant)
    yield plant
  }
}
