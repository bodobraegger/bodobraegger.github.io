// Candy snakes of あべっ子ラムネ for the background of a page, the layout of
// Honeydew.vue. Each snake starts with its header card at an edge of the
// window and winds inwards, one packet after another: the bend of the strip
// drifts at random, as a vine of Orchid sways, and the snake turns back into
// the window near its edges. No packet covers a packet of another snake or
// a packet of its own snake other than its neighbours. A snake ends at its
// length, when it leaves the window, or when no bend gives its next packet
// room. As in Orchid, each snake stands at one of DEPTH_LEVELS depths: a far
// snake is smaller and lighter, and the far snakes grow and draw first.
import { DEPTH_LEVELS, FAR_ALPHA, FAR_SIZE, NEAR_SIZE, random } from '~/lib/orchid'
import { RAMUNE_FACE } from '~/lib/suzuno/packages/ramune'

type Point = [number, number]

/** A piece on its place: its middle, the direction of the strip there, and its size. */
export interface PlacedPiece {
  x: number
  y: number
  angle: number
  across: number
  length: number
}

/** A snake of the layout, for growSnakes (src/lib/suzuno/packages/candy-snake.ts) once its pieces have images. */
export interface SnakeLayout {
  pieces: PlacedPiece[]
  across: number
  length: number
  alpha: number
  delay: number
  depth: number
}

// One snake starts for each SNAKE_SPACING CSS pixels of the edges of the
// window, at least MIN_SNAKES and at most MAX_SNAKES, each at a random place
// in its part of the edge, and turned from the inward direction by up to
// START_SPREAD radians. The snakes start STAGGER_MS apart, the far ones first.
const SNAKE_SPACING = 210
const MIN_SNAKES = 4
const MAX_SNAKES = 28
const START_SPREAD = 0.7
const STAGGER_MS = 300
// A piece is PIECE_ACROSS CSS pixels wide at the middle depth, and as long
// as the proportions of the print
const PIECE_ACROSS = 19
const PIECE_LENGTH = RAMUNE_FACE.height / RAMUNE_FACE.width
// A snake has between SHORTEST and LONGEST pieces. Its bend changes by up to
// WANDER radians per piece and stays below MAX_BEND. Only BEND_DECAY of the
// bend stays from one piece to the next, so that a snake winds in S-curves
// and seldom coils up. Within STEER_MARGIN lengths of a piece from an edge,
// the bend turns STEER of the way back towards the middle of the window. A
// blocked snake tries the bends of DETOURS around its own, the smallest
// change first. GAP CSS pixels stay free between the pieces of different
// snakes.
const SHORTEST = 18
const LONGEST = 70
const WANDER = 0.09
const MAX_BEND = 0.32
const BEND_DECAY = 0.92
const STEER_MARGIN = 2.5
const STEER = 0.25
const DETOURS = [0.12, -0.12, 0.25, -0.25, 0.4, -0.4, 0.55, -0.55]
const GAP = 3

/** The corners of a piece, grown by half the gap on each side. */
function corners({ x, y, angle, across, length }: PlacedPiece): Point[] {
  const [alongX, alongY] = [Math.cos(angle), Math.sin(angle)]
  const halfLength = length / 2 + GAP / 2
  const halfAcross = across / 2 + GAP / 2
  return [[1, 1], [1, -1], [-1, -1], [-1, 1]].map(([along, side]) => [
    x + along * halfLength * alongX - side * halfAcross * alongY,
    y + along * halfLength * alongY + side * halfAcross * alongX,
  ])
}

/** Whether two convex polygons overlap: no edge of either separates them. */
function overlaps(a: Point[], b: Point[]) {
  for (const polygon of [a, b]) {
    for (let index = 0; index < polygon.length; index++) {
      const [x1, y1] = polygon[index]
      const [x2, y2] = polygon[(index + 1) % polygon.length]
      const [normalX, normalY] = [y2 - y1, x1 - x2]
      const project = (points: Point[]) => points.map(([x, y]) => x * normalX + y * normalY)
      const [first, second] = [project(a), project(b)]
      if (Math.max(...first) < Math.min(...second) || Math.max(...second) < Math.min(...first))
        return false
    }
  }
  return true
}

/** The pieces in a grid of square cells, for the pieces near a place. */
function pieceGrid(cell: number) {
  const cells = new Map<string, { piece: PlacedPiece, outline: Point[] }[]>()
  const key = (x: number, y: number) => `${Math.floor(x / cell)} ${Math.floor(y / cell)}`
  return {
    add(piece: PlacedPiece) {
      const entry = { piece, outline: corners(piece) }
      const found = cells.get(key(piece.x, piece.y))
      if (found)
        found.push(entry)
      else
        cells.set(key(piece.x, piece.y), [entry])
    },
    /** Whether a piece overlaps a piece of the grid other than `except`. */
    blocked(piece: PlacedPiece, except?: PlacedPiece) {
      const outline = corners(piece)
      for (let column = -1; column <= 1; column++) {
        for (let row = -1; row <= 1; row++) {
          for (const other of cells.get(key(piece.x + column * cell, piece.y + row * cell)) ?? []) {
            if (other.piece !== except && overlaps(outline, other.outline))
              return true
          }
        }
      }
      return false
    },
  }
}

/** The angle from `from` to `to` in radians, between -π and π. */
const turnBetween = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

/**
 * The candy snakes of a window of the given size, the far ones first. A
 * seeded random generator makes the layout, so a seed gives the same snakes
 * again.
 */
export function candySnakes(width: number, height: number, seed: number): SnakeLayout[] {
  const next = random(seed)
  const between = (low: number, high: number) => low + (high - low) * next()
  const perimeter = 2 * (width + height)
  const count = Math.min(MAX_SNAKES, Math.max(MIN_SNAKES, Math.round(perimeter / SNAKE_SPACING)))
  const sides = [
    { length: width, at: (along: number): Point => [along, 0], inward: Math.PI / 2 },
    { length: width, at: (along: number): Point => [along, height], inward: -Math.PI / 2 },
    { length: height, at: (along: number): Point => [0, along], inward: 0 },
    { length: height, at: (along: number): Point => [width, along], inward: Math.PI },
  ]
  const starts = sides.flatMap(({ length, at, inward }) => {
    const parts = Math.max(1, Math.round(count * length / perimeter))
    return Array.from({ length: parts }, (_, part) => ({
      point: at((part + between(0.15, 0.85)) * length / parts),
      heading: inward + between(-START_SPREAD, START_SPREAD),
      depth: Math.floor(next() * DEPTH_LEVELS) / (DEPTH_LEVELS - 1),
    }))
  }).sort((a, b) => b.depth - a.depth)

  const largest = PIECE_ACROSS * Math.max(NEAR_SIZE, FAR_SIZE) * PIECE_LENGTH
  const grid = pieceGrid(2 * largest)
  const middle: Point = [width / 2, height / 2]
  const snakes: SnakeLayout[] = []
  for (const { point: [startX, startY], heading: startHeading, depth } of starts) {
    const scale = NEAR_SIZE + (FAR_SIZE - NEAR_SIZE) * depth
    const across = PIECE_ACROSS * scale
    const length = across * PIECE_LENGTH
    // The header card lies with its outer end on the edge
    let heading = startHeading
    const first = { x: startX + Math.cos(heading) * length / 2, y: startY + Math.sin(heading) * length / 2, angle: heading, across, length }
    if (grid.blocked(first))
      continue
    const pieces = [first]
    grid.add(first)
    let bend = 0
    const wander = WANDER * between(0.5, 1.5)
    const target = Math.round(between(SHORTEST, LONGEST))
    while (pieces.length < target) {
      const last = pieces.at(-1)!
      // The joint of the last piece and the next one
      const jointX = last.x + Math.cos(heading) * length / 2
      const jointY = last.y + Math.sin(heading) * length / 2
      bend = Math.max(-MAX_BEND, Math.min(MAX_BEND, bend * BEND_DECAY + between(-wander, wander)))
      const margin = STEER_MARGIN * length
      if (jointX < margin || jointX > width - margin || jointY < margin || jointY > height - margin)
        bend = Math.max(-MAX_BEND, Math.min(MAX_BEND, bend + STEER * turnBetween(heading, Math.atan2(middle[1] - jointY, middle[0] - jointX))))
      let placed: PlacedPiece | undefined
      for (const detour of [0, ...DETOURS]) {
        const angle = heading + bend + detour
        const piece = { x: jointX + Math.cos(angle) * length / 2, y: jointY + Math.sin(angle) * length / 2, angle, across, length }
        if (piece.x < 0 || piece.x > width || piece.y < 0 || piece.y > height)
          continue
        if (!grid.blocked(piece, last)) {
          placed = piece
          bend += detour
          break
        }
      }
      if (!placed)
        break
      heading = placed.angle
      pieces.push(placed)
      grid.add(placed)
    }
    snakes.push({ pieces, across, length, alpha: 1 + (FAR_ALPHA - 1) * depth, delay: snakes.length * STAGGER_MS, depth })
  }
  return snakes
}

/** The pieces of the snakes that overlap a piece of another snake, or a piece of their own snake that is not their neighbour. */
export function overlappingPieces(snakes: SnakeLayout[]) {
  const all = snakes.flatMap((snake, snakeIndex) => snake.pieces.map((piece, index) => ({ piece, snakeIndex, index, outline: corners({ ...piece, across: piece.across - GAP, length: piece.length - GAP }) })))
  const found: [PlacedPiece, PlacedPiece][] = []
  for (const [position, a] of all.entries()) {
    for (const b of all.slice(position + 1)) {
      const neighbours = a.snakeIndex === b.snakeIndex && Math.abs(a.index - b.index) === 1
      if (!neighbours && overlaps(a.outline, b.outline))
        found.push([a.piece, b.piece])
    }
  }
  return found
}
