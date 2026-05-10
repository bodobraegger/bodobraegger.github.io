import type { Stroke } from '../types/strokes'

export function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke,
  options: {
    isSelected?: boolean
    showAsEraser?: boolean
    scrollX?: number
    scrollY?: number
  } = {},
) {
  const { isSelected, showAsEraser, scrollX = 0, scrollY = 0 } = options
  const isEraser = stroke.isEraser || stroke.eraser

  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  // Normal stroke
  ctx.strokeStyle = stroke.color
  ctx.fillStyle = stroke.color
  ctx.lineWidth = stroke.width

  // Setup styles
  if (showAsEraser && isEraser) {
    // Admin view: visualize erasers in red
    ctx.strokeStyle = isSelected ? '#ff8888' : 'rgba(255, 100, 100, 0.5)'
    ctx.fillStyle = ctx.strokeStyle
    ctx.lineWidth = isSelected ? stroke.width + 4 : stroke.width
    ctx.globalAlpha = isSelected ? 0.8 : 0.5
    ctx.setLineDash([5, 5])
  }
  else if (isSelected) {
    // Selection highlight
    ctx.lineWidth = stroke.width + 4
    ctx.globalAlpha = 0.5
  }
  else if (isEraser) {
    // Normal eraser: removes pixels
    ctx.globalCompositeOperation = 'destination-out'
    ctx.lineWidth = stroke.width
  }

  // Draw single point as dot, multi-point as line
  if (stroke.points.length === 1) {
    const pt = stroke.points[0]
    ctx.beginPath()
    ctx.arc(pt.x - scrollX, pt.y - scrollY, stroke.width / 2, 0, Math.PI * 2)
    ctx.fill()
  }
  else {
    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x - scrollX, stroke.points[0].y - scrollY)
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x - scrollX, stroke.points[i].y - scrollY)
    }
    ctx.stroke()
  }

  ctx.restore()
}
