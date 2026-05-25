---
title: Drawing Board
description: A collaborative drawing tool for the web, embedded as a Vue component
plum: true
showViews: true
date: '2026-04-08'
place: Rio de Janeiro, BR
---

A draggable pen component built in Vue that lets visitors draw directly on any page. Strokes are stored in [Supabase](https://supabase.com/) and synced across all visitors in real time via a broadcast channel, so drawings are shared and persistent.

Try it on the dedicated [canvas](/notes/2026-05-03_canvas), or the [home page](/) for a non persistent, local variant.

## Features

- Drag and pick up the pen, then draw freely on the page
- Multiple pen types: pencil, crayon, brush, eraser
- Configurable stroke color, width, and tip offsets per instance
- Undo / redo with `Ctrl+Z` / `Ctrl+Y`
- Local storage mode for single-device persistence
- Cloud storage mode via Supabase realtime broadcast — strokes are shared across all open sessions on the same canvas ID
- Scales to page height, with a configurable `maxCanvasHeight`
- `dragAndDraw` mode for a fixed pen that draws while scrolling

## Usage

```vue
<DrawablePen
  :cloudStorage="true"
  penEmoji="🖉"
  strokeColor="#111111"
  :strokeWidth="3"
/>
```

Multiple pens can be placed on the same page and will share the same canvas:

```vue
<DrawablePen :cloudStorage="true" penEmoji="🖉" />

<DrawablePen :cloudStorage="true" penEmoji="🖉" strokeColor="green" />

<DrawablePen :cloudStorage="true" penEmoji="🖍️" strokeColor="red" :tipOffsetX="5" :tipOffsetY="43" />

<DrawablePen :cloudStorage="true" penEmoji="🖌️" strokeColor="rgba(0,255,255,0.5)" :strokeWidth="25" />

<DrawablePen :cloudStorage="true" penEmoji="🧹" :eraserMode="true" :strokeWidth="80" />
```

The canvas ID defaults to the current page path, so each page gets its own shared drawing by default. Pass `canvasId` to override.

## Pages using it

- [bbo.do/](/): the home page has a drag-and-draw pen embedded in the background
- [/notes/canvas](/notes/canvas): a dedicated multi-pen canvas session
- [/notes/arte-digital-canvas](/notes/arte-digital-canvas): used during an Arte Digital session at EBA / UFRJ

## How it works

Each completed stroke is saved to a shared `allStrokes` array and broadcast to other sessions via a Supabase realtime channel. Incoming strokes from other users are applied immediately and the canvas is redrawn:

```ts
function setupSupabaseSync() {
  broadcastChannel = supabase
    .channel(`drawing:${effectiveCloudStorageId}:strokes`, {
      config: { broadcast: { self: false } },
    })
    .on('broadcast', { event: 'stroke_added' }, ({ payload }) => {
      if (payload.stroke) {
        allStrokes.push(payload.stroke)
        redrawAll()
      }
    })
    .on('broadcast', { event: 'stroke_removed' }, ({ payload }) => {
      const index = allStrokes.findIndex(s =>
        s.userId === payload.stroke.userId
        && s.timestamp === payload.stroke.timestamp
        && JSON.stringify(s.points) === JSON.stringify(payload.stroke.points),
      )
      if (index !== -1) {
        allStrokes.splice(index, 1)
        redrawAll()
      }
    })
    .on('broadcast', { event: 'clear' }, () => {
      allStrokes.length = 0
      redrawAll()
    })
    .subscribe()
}
```

When the mouse is released, the collected path points are packaged into a stroke object and broadcast to all connected clients:

```ts
function endDrawing() {
  if (isDrawing.value && currentPath.length > 0) {
    saveStroke({
      points: [...currentPath],
      color: currentStrokeColor.value,
      width: currentStrokeWidth.value,
      isEraser: props.eraserMode,
      userId: currentUserId,
      timestamp: Date.now(),
    })
  }
  isDrawing.value = false
  currentPath = []
}
```

## Source

The full source is part of this site's repository: [`DrawablePen.vue`](https://github.com/bodobraegger/bodobraegger.github.io/blob/main/src/components/DrawablePen.vue).
