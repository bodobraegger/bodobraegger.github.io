// A square grid of thin lines on a paper, like the inner paper of the
// wrapped Almond Caramel, which shows through the clear parts of the
// wrapper. The defaults are those of the front of the wrapper.
import type { ParameterSchemas } from '~/lib/suzuno/patterns/pattern'
import { tilePattern } from '~/lib/suzuno/patterns/pattern'

export interface GridParameters {
  paper: string
  color: string
  /** The size of a cell and the width of its lines. */
  cell: number
  line: number
  /** The offset of the grid. */
  x: number
  y: number
}

const PARAMETERS: ParameterSchemas<GridParameters> = {
  paper: { type: 'color', label: 'Paper', default: '#b8915e' },
  color: { type: 'color', label: 'Lines', default: '#6e4824' },
  cell: { type: 'number', label: 'Cell size', min: 2, max: 80, step: 0.5, default: 7.5 },
  line: { type: 'number', label: 'Line width', min: 0, max: 10, step: 0.1, default: 1.2 },
  x: { type: 'number', label: 'Offset x', min: 0, max: 80, step: 0.5, default: 0 },
  y: { type: 'number', label: 'Offset y', min: 0, max: 80, step: 0.5, default: 0 },
}

export const GRID = tilePattern<GridParameters>({
  name: 'grid',
  title: 'Grid',
  description: 'The grid of the inner paper of the wrapped Almond Caramel.',
  seeded: false,
  parameters: PARAMETERS,
  tile(_seed, { paper, color, cell, line, x, y }) {
    return {
      x,
      y,
      width: cell,
      height: cell,
      markup: `<rect width="${cell}" height="${cell}" fill="${paper}" /><path d="M0 0H${cell}M0 0V${cell}" stroke="${color}" stroke-width="${line}" fill="none" />`,
    }
  },
})
