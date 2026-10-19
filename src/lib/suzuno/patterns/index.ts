// All background pattern generators, and the layers that PatternFill.vue
// draws: a layer names a generator and gives its seed, the parameters that
// differ from the defaults, an opacity and optionally its own box.
import { BRUSH_STROKES } from '~/lib/suzuno/patterns/brush-strokes'
import { DAMASK } from '~/lib/suzuno/patterns/damask'
import { GRID } from '~/lib/suzuno/patterns/grid'
import { PAPER_GRAIN } from '~/lib/suzuno/patterns/paper-grain'
import type { Box, ParameterSchema, ParameterValue, PatternGenerator } from '~/lib/suzuno/patterns/pattern'
import { PLUM_VINE } from '~/lib/suzuno/patterns/plum-vine'
import { SKY_GLOW } from '~/lib/suzuno/patterns/sky-glow'
import { STRIPES } from '~/lib/suzuno/patterns/stripes'

export type { Box, ParameterSchema, ParameterValue, PatternGenerator, Stripe } from '~/lib/suzuno/patterns/pattern'

// Each generator has its own parameter type, so the list takes any of them
export const PATTERNS: PatternGenerator<any>[] = [PLUM_VINE, DAMASK, STRIPES, GRID, BRUSH_STROKES, SKY_GLOW, PAPER_GRAIN]

export interface PatternLayer {
  /** The name of a generator in PATTERNS. */
  name: string
  seed?: number
  /** The parameters that differ from the defaults of the generator. */
  parameters?: Record<string, ParameterValue>
  opacity?: number
  /** The place of the layer; by default the box of the fill. */
  box?: Box
}

/** One layer or several, the first at the bottom. */
export type PatternFillValue = PatternLayer | PatternLayer[]

export class UnknownPatternError extends Error {
  constructor(name: string) {
    super(`The pattern ${name} is not in PATTERNS of src/lib/suzuno/patterns/index.ts`)
    this.name = 'UnknownPatternError'
  }
}

export function patternGenerator(name: string) {
  const generator = PATTERNS.find(entry => entry.name === name)
  if (!generator)
    throw new UnknownPatternError(name)
  return generator
}

// The generators write the values into markup, so a layer from an address
// must not carry anything else than numbers and colours
const COLOR = /^#[\da-f]{6}$/i
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)
const isColor = (value: unknown): value is string => typeof value === 'string' && COLOR.test(value)

function fits(schema: ParameterSchema, value: unknown) {
  switch (schema.type) {
    case 'number':
      return isNumber(value)
    case 'color':
      return isColor(value)
    case 'boolean':
      return typeof value === 'boolean'
    case 'stripes':
      return Array.isArray(value) && value.every(stripe => isNumber(stripe?.offset) && isNumber(stripe?.width) && isColor(stripe?.color))
  }
}

/** All parameters of a layer: its own where they fit their schema, and the defaults for the rest. */
export function layerParameters(layer: PatternLayer): Record<string, ParameterValue> {
  const schemas: Record<string, ParameterSchema> = patternGenerator(layer.name).parameters
  return Object.fromEntries(Object.entries(schemas).map(([name, schema]) => {
    const value = layer.parameters?.[name]
    return [name, fits(schema, value) ? value! : schema.default]
  }))
}

/** A layer ready to draw: its generator, and its values, or the defaults where they are missing or wrong. */
export function resolveLayer(layer: PatternLayer, box: Box) {
  const ownBox = layer.box && [layer.box.x, layer.box.y, layer.box.width, layer.box.height].every(isNumber) ? layer.box : undefined
  return {
    generator: patternGenerator(layer.name),
    seed: isNumber(layer.seed) ? layer.seed : 0,
    parameters: layerParameters(layer),
    opacity: isNumber(layer.opacity) ? layer.opacity : undefined,
    box: ownBox ?? box,
  }
}

export function patternLayers(value: PatternFillValue) {
  return Array.isArray(value) ? value : [value]
}
