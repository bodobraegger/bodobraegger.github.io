// Shared canvas drawing utilities
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

  // Admin view: show erasers as semi-transparent red with dashed line
  if (showAsEraser && isEraser) {
    ctx.strokeStyle = isSelected ? '#ff8888' : 'rgba(255, 100, 100, 0.5)'
    ctx.lineWidth = isSelected ? stroke.width + 4 : stroke.width
    ctx.globalAlpha = isSelected ? 0.8 : 0.5
    ctx.setLineDash([5, 5])
  }
  else if (isSelected) {
    ctx.strokeStyle = '#ff4444'
    ctx.lineWidth = stroke.width + 4
    ctx.globalAlpha = 0.5
  }
  else {
    // Normal drawing: erasers use destination-out, regular strokes use color
    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    }
    else {
      ctx.strokeStyle = stroke.color
    }
    ctx.lineWidth = stroke.width
    ctx.globalAlpha = 1
  }

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Single point: draw a dot
  if (stroke.points.length === 1) {
    const pt = stroke.points[0]
    ctx.beginPath()
    ctx.arc(pt.x - scrollX, pt.y - scrollY, stroke.width / 2, 0, Math.PI * 2)
    ctx.fill()
  }
  else {
    // Multiple points: draw line
    ctx.beginPath()
    ctx.moveTo(stroke.points[0].x - scrollX, stroke.points[0].y - scrollY)

    // Handle single-point strokes by adding tiny offset
    if (stroke.points.length === 1) {
      ctx.lineTo(stroke.points[0].x - scrollX + 0.1, stroke.points[0].y - scrollY + 0.1)
    }
    else {
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x - scrollX, stroke.points[i].y - scrollY)
      }
    }
    ctx.stroke()
  }

  ctx.restore()
}
