---
title: Film grain
place: Rio de Janeiro, Brasil
date: 2026-10-19T18:00:00-03:00
lang: en
type: note
draft: true
---

<FilmGrain fixed />

![The village of Alquézar on a rock above a river valley, Huesca, Spain (Antonio Moreno Nadal, Wikimedia Commons, CC0)](../../src/assets/images/notes/2610-film-grain/alquezar.webp)

The grain on this page comes from the `FilmGrain` component.

The grain is strongest in the midtones of the photo, like the grain of a colour negative. A weaker part of it also shows on the white and on the black of the page.

## Use

```vue
<!-- Over the window -->
<FilmGrain fixed />

<!-- Over a positioned box, with colour grain -->
<div class="relative">
  <img src="..." alt="...">
  <FilmGrain color :strength="0.5" :size="2" />
</div>
```

- `strength`: the opacity of the grain, from 0 to 1 (0.25).
- `size`: the CSS pixels for each texel of the grain (1). A size of 2 looks like 16 mm film.
- `color`: colour grain instead of monochrome grain.
- `fixed`: cover the window instead of the parent.

The grain itself is plain CSS and three small images in `src/assets/film-grain/`, so other projects can use it without Vue. `pnpm generate:grain` makes the images again.
