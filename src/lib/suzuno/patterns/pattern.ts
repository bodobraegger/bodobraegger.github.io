// The common interface of the background pattern generators. A generator is a
// pure function of a seed and named parameters: the same input always gives
// the same SVG markup. Seed 0 and the default parameters draw the pattern of
// the original print. A tile pattern repeats one tile (an SVG <pattern>) over
// the box; a free pattern draws into the box, for example a vine that grows to
// fill it. The schema of each parameter (its type, its range and its default)
// lets a page build the controls of a generator.
import type { AnimateOptions, Growth } from '~/lib/suzuno/ornament'

/** A box in the user units of the SVG that the pattern goes into. */
export interface Box {
  x: number
  y: number
  width: number
  height: number
}

/** A line across a band: its middle, measured from the top of the box, its width and its colour. */
export interface Stripe {
  offset: number
  width: number
  color: string
}

export type ParameterValue = number | string | boolean | Stripe[]

interface Field<Value> {
  label: string
  default: Value
}

export interface NumberParameter extends Field<number> {
  type: 'number'
  min: number
  max: number
  step: number
}

/** A colour as #rrggbb, so that an <input type="color"> can edit it. */
export interface ColorParameter extends Field<string> {
  type: 'color'
}

export interface BooleanParameter extends Field<boolean> {
  type: 'boolean'
}

export interface StripesParameter extends Field<Stripe[]> {
  type: 'stripes'
}

export type ParameterSchema = NumberParameter | ColorParameter | BooleanParameter | StripesParameter

type SchemaOf<Value> = Value extends number ? NumberParameter
  : Value extends boolean ? BooleanParameter
    : Value extends string ? ColorParameter
      : Value extends Stripe[] ? StripesParameter
        : never

export type ParameterSchemas<Parameters> = { [Name in keyof Parameters]: SchemaOf<Parameters[Name]> }

export type PatternParameters = Record<string, ParameterValue>

export interface PatternGenerator<Parameters extends object = PatternParameters> {
  name: string
  title: string
  description: string
  kind: 'tile' | 'free'
  /** False when the seed changes nothing. */
  seeded: boolean
  parameters: ParameterSchemas<Parameters>
  /**
   * The markup of the pattern in the box: definitions and shapes for an SVG
   * group. `id` starts the ids of its definitions, so it must be unique in
   * the document.
   */
  render: (seed: number, parameters: Parameters, box: Box, id: string) => string
  /**
   * Grows the pattern in `target`, an element with the markup of `render`,
   * and ends on the same drawing.
   */
  animate?: (target: Element, seed: number, parameters: Parameters, box: Box, options?: AnimateOptions) => Growth
}

/** One tile of a tile pattern, in the units of the tile. */
export interface Tile {
  /** The corner of the tile, before the transform. */
  x?: number
  y?: number
  width: number
  height: number
  /** The patternTransform: the offset and the scale of the tile. */
  transform?: string
  markup: string
}

export interface TileGenerator<Parameters extends object = PatternParameters> extends PatternGenerator<Parameters> {
  kind: 'tile'
  tile: (seed: number, parameters: Parameters) => Tile
}

/** The <pattern> element of a tile, which a shape fills with url(#id). */
export function patternElement(id: string, { x, y, width, height, transform, markup }: Tile) {
  const corner = x === undefined || y === undefined ? '' : ` x="${x}" y="${y}"`
  const transformAttribute = transform ? ` patternTransform="${transform}"` : ''
  return `<pattern id="${id}" patternUnits="userSpaceOnUse"${corner} width="${width}" height="${height}"${transformAttribute}>${markup}</pattern>`
}

export function rectangle({ x, y, width, height }: Box, attributes: string) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" ${attributes} />`
}

/** A tile generator, with a `render` that fills the box with its tile. */
export function tilePattern<Parameters extends object>(generator: Omit<TileGenerator<Parameters>, 'kind' | 'render'>): TileGenerator<Parameters> {
  return {
    ...generator,
    kind: 'tile',
    render: (seed, parameters, box, id) => `<defs>${patternElement(id, generator.tile(seed, parameters))}</defs>${rectangle(box, `fill="url(#${id})"`)}`,
  }
}

/**
 * Markup drawn in a frame, fitted into the box: scaled to fit with its
 * proportions, in the middle. Without a group when the frame is the box.
 */
export function fitInto(frame: Box, box: Box, markup: string) {
  const scale = Math.min(box.width / frame.width, box.height / frame.height)
  const x = box.x + (box.width - frame.width * scale) / 2 - frame.x * scale
  const y = box.y + (box.height - frame.height * scale) / 2 - frame.y * scale
  return scale === 1 && x === 0 && y === 0 ? markup : `<g transform="translate(${x} ${y}) scale(${scale})">${markup}</g>`
}

/** The default value of each parameter. */
export function defaults<Parameters extends object>(schemas: ParameterSchemas<Parameters>): Parameters {
  return Object.fromEntries(Object.entries(schemas).map(([name, schema]) => [name, (schema as ParameterSchema).default])) as Parameters
}
