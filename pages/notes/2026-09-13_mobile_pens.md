---
title: Mobile Pens (draft)
place: Zürich, Switzerland
date: 2026-09-13T12:00:00+02:00
lang: en
type: note
plum: false
draft: true
showViews: false
---

<script setup>
import DrawablePen from '../../src/components/DrawablePen.vue'
</script>

<div>
<DrawablePen :cloudStorage="true" :mobile="true" penEmoji="🖉" />
<DrawablePen :cloudStorage="true" :mobile="true" penEmoji="🖉" strokeColor="green" />
<DrawablePen :cloudStorage="true" :mobile="true" penEmoji="🖍️" strokeColor="red" :tipOffsetX="5" :tipOffsetY="43" />
<DrawablePen :cloudStorage="true" :mobile="true" penEmoji="🖌️" strokeColor="rgba(0, 255, 255, 0.5)" :strokeWidth="25" :tipOffsetX="5" :tipOffsetY="43" />
<DrawablePen :cloudStorage="true" :mobile="true" penEmoji="🧹" :eraserMode="true" :strokeWidth="80" />
</div>

This page tests the pens on a phone or a tablet. On a computer nothing changes:
the pens stay in the left margin, you pick one up with a click and put it down
with a right-click.

## How it works on a touch screen

A finger has no cursor, so a pen cannot follow it around the page. The pens
therefore move into one small toolbar instead:

1. A single button sits in the bottom left corner. It shows the first pen of the
   page and stays out of the way of the text.
2. Tapping it opens the toolbar with every pen of the page: pencils, brush and
   broom.
3. Tapping a pen takes it in hand. **One finger draws. Two fingers scroll.**
4. The dot button opens the width slider and the color picker of the pen in
   hand. `↶` removes your last stroke. `✕` puts the pen down, and the page
   scrolls with one finger again.

The drawing is the same drawing as on a computer: same canvas, same page
address, shared live with everybody else who has the page open.

## What to test

- Does the toolbar stay clear of the text and of the chat bar?
- Do the strokes land under the finger, in the right size and color?
- Is two-finger scrolling smooth enough while a pen is in hand?
- Does the broom erase, and does `↶` remove only your own strokes?
- Do the strokes stay in place after scrolling away and back, and after a reload?

Scroll down for empty space to draw on.

<div style="height: 4000px;">
</div>

The end of the page.
