// Plum-blossom vine ornaments, drawn as line art: the typed port of
// ornament.js, with the same functions and the same output. The tools in
// tools/ keep using ornament.js; `pnpm test` checks that both write the same
// markup.
//
// A plant is a genome: a root branch that grows from an origin step by step
// (each step a length and a turn), with side branches at its nodes and a tip
// at the end of every branch (a flower, a bud, or nothing). `grow(seed,
// parameters)` grows a new plant, and the fitter adjusts the values of a plant
// (and per-node shifts) to match the print. `develop(plant)` turns a plant into
// a flat spec: stems (smooth curves through points), flowers (petals as brush
// arcs around a stamen dot) and buds (small, optionally open, ellipses).
// `paths(spec)` turns a spec or a plant into SVG path data, the same strings
// for the page and for the fitter, so a fitted plant draws exactly what was
// fitted. `animate(target, plant)` grows a plant in the order of its genome
// and ends on the same drawing.

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

// Points per Bezier segment, where the rule of `grow` follows the line of a stem
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

/** A Catmull-Rom spline through the points, as cubic Bezier segments. */
export function stemPath(points: Point[], tension = 0.5) {
  if (points.length < 2)
    return ''
  const curves = stemSegments(points, tension).map(([, control1, control2, end]) => `C${round(control1[0])} ${round(control1[1])} ${round(control2[0])} ${round(control2[1])} ${round(end[0])} ${round(end[1])}`)
  return `M${round(points[0][0])} ${round(points[0][1])}${curves.join('')}`
}

/** Points along the line of a stem, as `stemPath` draws it. */
function stemPoints({ points, tension = 0.5 }: Stem): Point[] {
  const line: Point[] = [points[0]]
  for (const [start, control1, control2, end] of stemSegments(points, tension)) {
    for (let sample = 1; sample <= STEM_SAMPLES; sample++) {
      const t = sample / STEM_SAMPLES
      const weights = [(1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t ** 2, t ** 3]
      const along = (axis: number) => weights[0] * start[axis] + weights[1] * control1[axis] + weights[2] * control2[axis] + weights[3] * end[axis]
      line.push([along(0), along(1)])
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

interface StemPart extends Shape {
  start: number
  length: number
}

interface TipPart {
  shapes: Shape[]
  x: number
  y: number
  start: number
}

const isPlant = (ornament: Ornament): ornament is Plant => 'root' in ornament

/**
 * The path data of an ornament (a spec or a plant), in the order of `paths`:
 * one line per stem, and per tip (flowers, then buds) its shapes around its
 * centre. Stems and tips keep their `start` of the growth order (0 for a spec
 * without one).
 */
function parts(ornament: Ornament) {
  const spec = isPlant(ornament) ? develop(ornament) : ornament
  const tip = (shapes: Shape[], { x, y, start = 0 }: Placed): TipPart => ({ shapes, x, y, start })
  const stems: StemPart[] = spec.stems.map(stem => ({ d: stemPath(stem.points, stem.tension ?? 0.5), filled: false, start: stem.start ?? 0, length: stem.length ?? 0 }))
  const tips = [
    ...spec.flowers.map(flower => tip(flowerPath(flower, spec.strokeWidth), flower)),
    ...spec.buds.map(bud => tip([budPath(bud, spec.strokeWidth)], bud)),
  ]
  return { strokeWidth: spec.strokeWidth, stems, tips }
}

/** All path data of an ornament (a spec or a plant); every path is stroked, and the filled ones are filled too. */
export function paths(ornament: Ornament): Shape[] {
  const { stems, tips } = parts(ornament)
  return [...stems.map(({ d, filled }) => ({ d, filled })), ...tips.flatMap(tip => tip.shapes)]
}

const group = (strokeWidth: number, paint: string, content: string) => `<g fill="none" stroke="${paint}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${content}</g>`
const pathMarkup = ({ d, filled }: Shape, paint: string, attributes = '') => `<path d="${d}"${filled ? ` fill="${paint}"` : ''}${attributes} />`

/** The default paint: white strokes, for a mask. */
export const MASK_PAINT = '#fff'

/** The ornament as SVG markup: strokes in white for a mask, or in a given paint. */
export function toSvg(ornament: Ornament, paint = MASK_PAINT) {
  return group(ornament.strokeWidth, paint, paths(ornament).map(shape => pathMarkup(shape, paint)).join(''))
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
// The share of the growth length that a tip takes to open, and the delay of
// each further shape of a tip (petal or stamens), as a share of its opening
const OPENING_SHARE = 0.18
const SHAPE_DELAY = 0.12
// The overshoot of the opening, as in the common "ease out back" curve
const OVERSHOOT = 1.6
const easeInOut = (progress: number) => 0.5 - Math.cos(Math.PI * progress) / 2
const easeOutBack = (progress: number) => 1 + (OVERSHOOT + 1) * (progress - 1) ** 3 + OVERSHOOT * (progress - 1) ** 2
const clamp = (value: number) => Math.min(1, Math.max(0, value))

export const GROWTH_DURATION = 4000

export interface AnimateOptions {
  duration?: number
  delay?: number
  easing?: (share: number) => number
  paint?: string
  onDone?: () => void
}

export interface Growth {
  stop: () => void
  restart: () => void
}

/**
 * Grows an ornament (a plant, or a spec from `develop`) in `target`, an SVG
 * element whose content it replaces: the stems grow in the order of the
 * genome at one speed, each side branch sprouts when its parent reaches its
 * node, and each tip opens when its branch arrives, shape by shape, scaled up
 * from its centre. The last frame is the markup of `toSvg`, so the end state
 * is the static drawing. With reduced motion, it draws the end state at once.
 * `easing` maps the share of the time to the share of the growth. Returns
 * `stop()`, which draws the end state at once, and `restart()`.
 */
export function animate(target: Element, ornament: Ornament, { duration = GROWTH_DURATION, delay = 0, easing = easeInOut, paint = MASK_PAINT, onDone }: AnimateOptions = {}): Growth {
  const { strokeWidth, stems, tips } = parts(ornament)
  const opening = Math.max(...stems.map(stem => stem.start + stem.length), ...tips.map(tip => tip.start), 1) * OPENING_SHARE
  const opened = (tip: TipPart) => tip.start + opening * (1 + SHAPE_DELAY * (tip.shapes.length - 1))
  const total = Math.max(...stems.map(stem => stem.start + stem.length), ...tips.map(opened))
  let frame = 0
  let running = false
  let elements: { stems: Element[], tips: Element[][] } = { stems: [], tips: [] }

  const draw = (reached: number) => {
    stems.forEach((stem, index) => {
      const share = stem.length ? clamp((reached - stem.start) / stem.length) : 1
      elements.stems[index].setAttribute('visibility', share > 0 ? 'visible' : 'hidden')
      elements.stems[index].setAttribute('stroke-dashoffset', String(1 - share))
    })
    tips.forEach((tip, index) => {
      tip.shapes.forEach((_, shape) => {
        const scale = easeOutBack(clamp((reached - tip.start - shape * SHAPE_DELAY * opening) / opening))
        const element = elements.tips[index][shape]
        element.setAttribute('visibility', scale > 0 ? 'visible' : 'hidden')
        element.setAttribute('transform', `translate(${tip.x} ${tip.y}) scale(${Math.max(0, scale)}) translate(${-tip.x} ${-tip.y})`)
      })
    })
  }
  const finish = () => {
    cancelAnimationFrame(frame)
    target.innerHTML = toSvg(ornament, paint)
    if (running)
      onDone?.()
    running = false
  }
  const restart = () => {
    cancelAnimationFrame(frame)
    running = true
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches)
      return finish()
    // pathLength 1 lets the dash offset be the share of the stem still to grow
    const hidden = ' visibility="hidden"'
    target.innerHTML = group(strokeWidth, paint, [
      ...stems.map(stem => pathMarkup(stem, paint, `${hidden} pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1"`)),
      ...tips.flatMap(tip => tip.shapes.map(shape => pathMarkup(shape, paint, hidden))),
    ].join(''))
    const shapes = [...target.querySelectorAll('path')]
    elements = { stems: shapes.slice(0, stems.length), tips: [] }
    let next = stems.length
    for (const tip of tips) {
      elements.tips.push(shapes.slice(next, next + tip.shapes.length))
      next += tip.shapes.length
    }
    const begin = performance.now() + delay
    const step = (now: number) => {
      const share = clamp((now - begin) / duration)
      if (share >= 1)
        return finish()
      draw(easing(share) * total)
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
  }
  restart()
  return { stop: finish, restart }
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
      distances.push(distances.at(-1)! + Math.hypot(node[0] - lastX, node[1] - lastY))
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

const distance = ([ax, ay]: Point, [bx, by]: Point) => Math.hypot(ax - bx, ay - by)

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

/** A blossom with its outline, the farthest distance of the outline from the centre, half its widest line, and the last step of its stalk. */
interface Measured extends Blossom {
  centre: Point
  outline: Point[]
  radius: number
  ink: number
  stalkTip: Point[]
}

/** A blossom measured, with the line of its stalk if it has one. */
function measure(blossom: Blossom, strokeWidth: number, stalk?: Point[]): Measured {
  const centre: Point = [blossom.shape.x, blossom.shape.y]
  const points = outline(blossom.shape, blossom.flower)
  return {
    ...blossom,
    centre,
    outline: points,
    radius: Math.max(...points.map(point => distance(point, centre))),
    ink: strokeWidth * (1 + (blossom.shape.weight ?? 0)) / 2,
    stalkTip: stalk?.slice(-STEM_SAMPLES - 1) ?? [],
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
function survey(plant: Plant) {
  const { blossoms, stems } = unfold(plant)
  const lines = new Map([...stems].map(([branch, stem]) => [branch, stemPoints(stem)]))
  return { lines, blossoms: blossoms.map(blossom => measure(blossom, plant.strokeWidth, lines.get(blossom.branch))) }
}

export interface Collision {
  /** The centre of the blossom that breaks the rule. */
  blossom: Point
  /** The centre of the other blossom, or the point of the stem that crosses. */
  other: Point
}

/**
 * The blossoms of a plant that break the rule of `grow`: each with its first
 * conflict, against the blossoms before it in the order of `develop`.
 */
export function collisions(plant: Plant, { blossomGap = GROWTH.blossomGap, stemCrossing = GROWTH.stemCrossing }: Partial<Omit<Rules, 'strokeWidth'>> = {}): Collision[] {
  const { lines, blossoms } = survey(plant)
  const rules = { strokeWidth: plant.strokeWidth, blossomGap, stemCrossing }
  return blossoms.flatMap((blossom, index) => {
    const other = conflict(blossom, blossoms.slice(0, index), lines, rules)
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
 * sizes, then a bud for a flower, and else drops off.
 */
function separate(plant: Plant, blossoming: BranchBody[], growth: GrowthParameters, next: () => number) {
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
    const { lines, blossoms } = survey(plant)
    const others = blossoms.filter(blossom => placed.has(blossom.branch))
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
 */
export function grow(seed: number, parameters: Partial<GrowthParameters> = {}): Plant {
  const growth = { ...GROWTH, ...parameters }
  const next = random(seed)
  const between = (low: number, high: number) => low + (high - low) * next()
  const pick = ([low, high]: Range) => between(low, high)
  const [left, top, width, height] = growth.box
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
  const plant = { strokeWidth: growth.strokeWidth, root }
  separate(plant, blossoming, growth, random(seed ^ PLACEMENT_STREAM))
  return plant
}
