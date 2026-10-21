// The growing roses of Hammerfight (Konstantin Koshutin, 2009), used here
// with his permission. The growth repeats the game step by step, as
// Hammerfight.exe v1.005 plants (FUN_0041c350) and grows (FUN_0041c5d0)
// them on the black screens between the levels of the story. The sprites
// are from Media/Sprites/menue.png of the game.
import type { Area } from '~/lib/orchid'
import { random as seededRandom, takeBackAreas } from '~/lib/orchid'
import flowerUrl from '~/assets/mistyrose/flower.webp'
import leafUrl from '~/assets/mistyrose/leaf.webp'
import stemUrl from '~/assets/mistyrose/stem.webp'

/** A point in CSS pixels, which are the units of the game: a full stem segment is STEM_LENGTH long. */
export interface Seed {
  x: number
  y: number
  angle: number
}

export interface Garden {
  seeds: Seed[]
  /** The most tips that grow at the same time; a tip forks only below this count. */
  maxTips: number
  /** A tip stops when its next segment would start outside this area. */
  bounds: Area
  /** The range of the first radius of the curl of a tip. */
  curl?: Range
  /** The chance that a curl changes its direction at a new segment. */
  flipChance?: number
  /** The canvas point of the point 0, 0 of the garden, the size of a unit there, and a mirror from left to right. */
  place?: Place
  /**
   * Seeds of a seeded random generator, of which the garden takes the one
   * whose full growth has the most items. Without them it grows at random.
   */
  candidates?: number[]
}

interface Place {
  x: number
  y: number
  scale: number
  mirror: boolean
}

// The fixed step of the game, and the growth per second of a stem segment
// to the length of its tip, and of a leaf or a rose to its size
const STEP_SECONDS = 0.02
const STEM_GROW_RATE = 10
const DECORATION_GROW_RATE = 0.3
const STEM_LENGTH = 29
const MIN_TIP_LENGTH = 0.1
const TIP_LIMIT = 30
// Each new segment of a tip shrinks the radius of its curl and its length.
// The curl changes its direction with the chance GAME_FLIP_CHANCE.
const CURL_SHRINK = 0.96
const LENGTH_SHRINK: Range = [0.95, 0.98]
const FORK_CHANCE = 0.25
const FORK_CURL: Range = [0.92, 0.98]
const FORK_FLIP_CHANCE = 0.4
// After a segment, a single leaf follows with LEAF_CHANCE, but in CLUSTER_CHANCE
// of the segments a cluster of CLUSTER_SIZE leaves and roses follows instead
const CLUSTER_CHANCE = 0.1
const LEAF_CHANCE = 0.25
const CLUSTER_SIZE = 5
const CLUSTER_LEAF_CHANCE = 0.2
const LEAF_AMBIENT = 0.8
const LEAF_TURN: Range = [-0.4, 0.4]
const CLUSTER_LEAF_ANGLE: Range = [-1.75, 1.75]
const ROSE_ANGLE: Range = [-0.75, 0.75]
const ROSE_JITTER: Range = [-10, 10]
const DECORATION_SIZE: Range = [0.2, 1]
const GAME_CURL: Range = [50, 200]
const GAME_FLIP_CHANCE = 0.05
const NO_PLACE: Place = { x: 0, y: 0, scale: 1, mirror: false }

// Frames as Orchid draws them: 30 per second less a slack for the jitter of
// the animation frames, and at most LONGEST_FRAME of growth after a hidden tab
const FRAME_INTERVAL = 1000 / 30
const FRAME_SLACK = 4
const LONGEST_FRAME = 100
const EDGE_MARGIN = 2
// Hundreds of leaves and roses grow at the same time, and those of a cluster
// lie on each other. A frame takes back the committed drawing in tiles of
// TILE CSS pixels, each tile once, instead of in the area of each item.
const TILE = 64

export type Range = [number, number]
type SpriteName = 'stem' | 'leaf' | 'flower'

// The hotspot of a sprite is the point that sits on the position of the item
const SPRITES: Record<SpriteName, { url: string, hotspot: [number, number] }> = {
  stem: { url: stemUrl, hotspot: [0, 5] },
  leaf: { url: leafUrl, hotspot: [0, 7] },
  flower: { url: flowerUrl, hotspot: [11, 11] },
}

/**
 * A stem segment, a leaf or a rose. A leaf or a rose grows to `size`; a
 * segment grows to the length of its tip and is done when the tip moves on.
 */
interface Item {
  sprite: SpriteName
  x: number
  y: number
  angle: number
  /** The share of the colour of the sprite that shows; the rest is black. */
  ambient: number
  growth: number
  size?: number
  done: boolean
}

/** The growth of the roses of a garden, one game step at a time. */
function grower(garden: Garden, random: () => number) {
  const { seeds, maxTips, bounds: [left, top, width, height], curl = GAME_CURL, flipChance = GAME_FLIP_CHANCE } = garden
  const between = ([low, high]: Range) => low + random() * (high - low)
  const items: Item[] = []
  // The items that grow, in the order of their creation
  let growing: Item[] = []
  // The game keeps the radius and the length of each tip in fixed arrays
  // beside the list of tips. It takes the stopped tips out of the list, but
  // not out of the arrays, so the tips after a stopped tip take the radius
  // and the length of the one before. The roses keep this, as it shapes them.
  let tips: (Item | null)[] = []
  const radii: number[] = []
  const lengths: number[] = []

  const add = (sprite: SpriteName, x: number, y: number, angle: number, ambient: number, size?: number) => {
    const item: Item = { sprite, x, y, angle, ambient, growth: 0, size, done: false }
    items.push(item)
    growing.push(item)
    return item
  }
  const stop = (index: number) => {
    tips[index]!.done = true
    tips[index] = null
  }
  // A point with NaN coordinates is inside, as in the game
  const outside = (x: number, y: number) => x < left || y < top || x > left + width || y > top + height

  // A tip above TIP_LIMIT would never grow, so the growth would never end
  const tipLimit = Math.min(maxTips, TIP_LIMIT)
  for (const [index, { x, y, angle }] of seeds.slice(0, TIP_LIMIT).entries()) {
    tips.push(add('stem', x, y, angle, 1))
    radii[index] = between(curl)
    lengths[index] = 1
  }

  const growTip = (index: number) => {
    const segment = tips[index]!
    const tipLength = lengths[index]
    if (tipLength < MIN_TIP_LENGTH)
      return stop(index)
    if (segment.growth < tipLength) {
      segment.growth = Math.min(segment.growth + STEP_SECONDS * STEM_GROW_RATE, tipLength)
      return
    }
    const length = tipLength * STEM_LENGTH
    const x = segment.x + Math.cos(segment.angle) * length
    const y = segment.y + Math.sin(segment.angle) * length
    if (outside(x, y))
      return stop(index)
    // The game lays a circle of the radius of the tip through both ends of
    // the segment, and the next segment turns by the angle of this chord
    const radius = radii[index]
    const angle = segment.angle + 2 * Math.asin(length / 2 / radius)
    segment.done = true
    tips[index] = add('stem', x, y, angle, 1)
    radii[index] = radius * CURL_SHRINK * (random() < flipChance ? -1 : 1)
    lengths[index] = tipLength * between(LENGTH_SHRINK)

    if (tips.length < tipLimit && random() < FORK_CHANCE) {
      tips.push(add('stem', x, y, angle, 1))
      radii[tips.length - 1] = radius * between(FORK_CURL) * (random() < FORK_FLIP_CHANCE ? -1 : 1)
      lengths[tips.length - 1] = tipLength
    }

    if (random() >= CLUSTER_CHANCE) {
      if (random() < LEAF_CHANCE)
        add('leaf', x, y, segment.angle + between(LEAF_TURN), LEAF_AMBIENT, between(DECORATION_SIZE))
      return
    }
    for (let place = 0; place < CLUSTER_SIZE; place++) {
      const ambient = 0.5 + 0.1 * place
      if (random() < CLUSTER_LEAF_CHANCE)
        add('leaf', x, y, between(CLUSTER_LEAF_ANGLE), ambient, between(DECORATION_SIZE))
      else
        add('flower', x + between(ROSE_JITTER), y + between(ROSE_JITTER), between(ROSE_ANGLE), ambient, between(DECORATION_SIZE))
    }
  }

  const step = () => {
    tips = tips.filter(Boolean)
    for (let index = 0; index < tips.length && index < TIP_LIMIT; index++) {
      if (tips[index])
        growTip(index)
    }
    for (const item of growing) {
      if (item.size === undefined)
        continue
      item.growth += STEP_SECONDS * DECORATION_GROW_RATE
      item.done = item.growth >= item.size
    }
  }

  /** Takes the items that are done out of the growing items, and returns them. */
  const harvest = () => {
    const done = growing.filter(item => item.done)
    growing = growing.filter(item => !item.done)
    return done
  }

  /** Grows to the end at once. */
  const finish = () => {
    while (growing.length) {
      step()
      harvest()
    }
  }

  return { items, step, harvest, finish, growing: () => growing }
}

/** The random generator of a garden: the best of its candidates, or Math.random. */
function randomOf(garden: Garden) {
  if (!garden.candidates)
    return Math.random
  const yields = garden.candidates.map((seed) => {
    const growth = grower(garden, seededRandom(seed))
    growth.finish()
    return growth.items.length
  })
  return seededRandom(garden.candidates[yields.indexOf(Math.max(...yields))])
}

type Sprites = Record<SpriteName, HTMLImageElement>

let loading: Promise<Sprites> | undefined
function loadSprites() {
  loading ??= Promise.all(Object.entries(SPRITES).map(async ([name, { url }]) => {
    const image = new Image()
    image.src = url
    await image.decode()
    return [name, image] as const
  })).then(entries => Object.fromEntries(entries) as Sprites)
  return loading
}

// The game multiplies the colour of a sprite with its ambient light
const shaded = new Map<string, HTMLCanvasElement>()
function shadedSprite(sprites: Sprites, name: SpriteName, ambient: number) {
  const key = `${name} ${ambient}`
  let canvas = shaded.get(key)
  if (!canvas) {
    const image = sprites[name]
    canvas = document.createElement('canvas')
    canvas.width = image.width
    canvas.height = image.height
    const context = canvas.getContext('2d')!
    context.drawImage(image, 0, 0)
    context.globalCompositeOperation = 'source-atop'
    context.fillStyle = `rgba(0, 0, 0, ${1 - ambient})`
    context.fillRect(0, 0, image.width, image.height)
    shaded.set(key, canvas)
  }
  return canvas
}

// The farthest point of each sprite from its hotspot, at full size
function reach(name: SpriteName, sprites: Sprites) {
  const { width, height } = sprites[name]
  const [x, y] = SPRITES[name].hotspot
  return Math.hypot(Math.max(x, width - x), Math.max(y, height - y))
}

/**
 * Grows the roses of `gardens` on `view`, whose transform maps CSS pixels to
 * device pixels. Without `animated`, the full growth appears at once.
 * Returns a function that stops the growth.
 */
export function growMistyRose(view: CanvasRenderingContext2D, gardens: Garden[], animated: boolean) {
  const ratio = view.getTransform().a
  let frame = 0
  let stopped = false

  loadSprites().then((sprites) => {
    if (stopped)
      return
    const beds = gardens.map(garden => ({ growth: grower(garden, randomOf(garden)), place: garden.place ?? NO_PLACE }))
    const draw = (context: CanvasRenderingContext2D, item: Item, { x, y, scale, mirror }: Place) => {
      if (item.growth <= 0)
        return
      const [hotspotX, hotspotY] = SPRITES[item.sprite].hotspot
      const flip = mirror ? -1 : 1
      const cos = Math.cos(item.angle) * item.growth * scale * ratio
      const sin = Math.sin(item.angle) * item.growth * scale * ratio
      context.setTransform(flip * cos, sin, -flip * sin, cos, (x + flip * scale * item.x) * ratio, (y + scale * item.y) * ratio)
      context.drawImage(shadedSprite(sprites, item.sprite, item.ambient), -hotspotX, -hotspotY)
    }

    if (!animated) {
      for (const { growth, place } of beds) {
        growth.finish()
        growth.items.forEach(item => draw(view, item, place))
      }
      return
    }

    // The items that are done go to a canvas outside the page, as in Orchid,
    // and a frame draws only the areas of the items that grow
    const storeCanvas = document.createElement('canvas')
    storeCanvas.width = view.canvas.width
    storeCanvas.height = view.canvas.height
    const store = storeCanvas.getContext('2d')!
    const reaches = Object.fromEntries((Object.keys(SPRITES) as SpriteName[]).map(name => [name, reach(name, sprites)]))
    const addTiles = (areas: Map<string, Area>, items: Item[], { x: placeX, y: placeY, scale, mirror }: Place) => {
      for (const { sprite, x, y } of items) {
        const [middleX, middleY] = [placeX + (mirror ? -1 : 1) * scale * x, placeY + scale * y]
        const extent = reaches[sprite] * scale + EDGE_MARGIN
        const [left, top] = [Math.floor((middleX - extent) / TILE), Math.floor((middleY - extent) / TILE)]
        const [right, bottom] = [Math.floor((middleX + extent) / TILE), Math.floor((middleY + extent) / TILE)]
        for (let column = left; column <= right; column++) {
          for (let row = top; row <= bottom; row++)
            areas.set(`${column} ${row}`, [column * TILE, row * TILE, TILE, TILE])
        }
      }
    }

    let last = performance.now()
    let pending = 0
    const step = (now: number) => {
      frame = requestAnimationFrame(step)
      if (now - last < FRAME_INTERVAL - FRAME_SLACK)
        return
      pending += Math.min(now - last, LONGEST_FRAME) / 1000
      last = now
      for (; pending >= STEP_SECONDS; pending -= STEP_SECONDS)
        beds.forEach(({ growth }) => growth.step())
      const areas = new Map<string, Area>()
      let growingCount = 0
      for (const { growth, place } of beds) {
        const done = growth.harvest()
        done.forEach(item => draw(store, item, place))
        addTiles(areas, [...done, ...growth.growing()], place)
        growingCount += growth.growing().length
      }
      takeBackAreas(view, storeCanvas, ratio, [...areas.values()])
      for (const { growth, place } of beds)
        growth.growing().forEach(item => draw(view, item, place))
      if (!growingCount)
        cancelAnimationFrame(frame)
    }
    frame = requestAnimationFrame(step)
  })

  return () => {
    stopped = true
    cancelAnimationFrame(frame)
  }
}
