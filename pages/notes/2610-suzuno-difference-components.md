---
title: Suzuno difference components
place: Rio de Janeiro, Brasil
date: 2026-10-19T18:00:00-03:00
lang: en
type: note
draft: true
plum: false
---

Each face below is a recreation of the Suzuno project on its reference image. Where the recreation matches the photo, the colour difference is black, so texts that are not the texts of the print show as bright areas. A note shows a face with one tag:

```html
<SuzunoBag item="hokkaido-milk" :texts="{ title: '東京都' }" />
```

`src/lib/suzuno/README.md` lists the components, their items and faces, their texts and their options.

<SuzunoFinancial :texts="{ title: 'bbo.do Financial Holdings', banner: 'now in HD!' }" />

<SuzunoBag item="hokkaido-milk" :texts="{ title: 'bbodo', subtitle: 'rio de janeiro hard and software', tagline: 'Tokyo Hard', stamp: { middle: 'secret' } }" />

<SuzunoBag item="almond-caramel" :texts="{ name: 'YOURS', spaced: 'TRULY', ribbon: 'no more kanji man', weight: '個包装紙込み 120 g' }" />

<SuzunoWrapper item="almond-caramel" :texts="{ name: 'WALNUT', spaced: 'TOFFEE' }" />

<SuzunoMarukawa item="orange" :texts="{ flavour: 'lemon', label: { badge: 'BRAZIL', lines: ['6pcs. (8.1 g)', 'MARBLE BUBBLE GUM'] } }" />

With `difference="false"`, the recreation lies on the photo at half opacity. With the texts of the print, the face then looks like the photo, for context:

<SuzunoBag item="almond-caramel" difference="false" />

With `texts=""`, the recreation has no texts. The texts of the photo then show in the difference:

<SuzunoBag item="hokkaido-milk" texts="" />

A face with a width class can stand in a line of text, such as a wrapped milk candy <SuzunoWrapper item="hokkaido-milk" class="w-16" :difference="false" :opacity="100" />, an almond caramel <SuzunoWrapper item="almond-caramel" class="w-14" :difference="false" :opacity="100" :texts="{ name: 'BODO' }" />, a melon box <SuzunoMarukawa item="melon" class="w-10" :difference="false" :opacity="100" /> and a strawberry box in the difference <SuzunoMarukawa item="strawberry" class="w-10" />.

## Image credits

The recreations use these images. `src/assets/suzuno/SOURCES.md` gives the changes to each image.

- The almonds and the leaves of the Almond Caramel bag, CC BY-SA 4.0, from ["Almonds - in shell, shell cracked open, shelled, blanched"](https://commons.wikimedia.org/wiki/File:Almonds_-_in_shell,_shell_cracked_open,_shelled,_blanched.jpg) by Ivar Leidus, CC BY-SA 4.0, and ["Almond tree leaf"](https://commons.wikimedia.org/wiki/File:Almond_tree_leaf.JPG) by Osvaldo Gago, CC BY-SA 2.5.
- The cow of the Hokkaido milk candy bag: ["HOLSTEIN-FRESIAN COW"](<https://commons.wikimedia.org/wiki/File:HOLSTEIN-FRESIAN_COW_(22899914244).jpg>), plate IV, a lithograph by Gray Lith. Co., N.Y., public domain.
- The farm: ["Farm"](https://www.flickr.com/photos/7163280@N06/3616435204) by Hiroshi Miyazaki, CC BY 2.0.
- The milk can: ["Cow and milk churn, Newtownmanor"](https://commons.wikimedia.org/wiki/File:Cow_and_milk_churn,_Newtownmanor_-_geograph.org.uk_-_799328.jpg) by Oliver Dixon, CC BY-SA 2.0.
- The outline of Hokkaido: [Natural Earth](https://www.naturalearthdata.com/), public domain.
- The fruit of the MARUKAWA boxes, CC BY-SA 4.0, from ["Cantaloupe"](https://commons.wikimedia.org/wiki/File:Cantaloupe.jpg) by Renee Comet (National Cancer Institute), public domain, ["Musk melon for sale - Tokyo - Jan 21 2021"](https://commons.wikimedia.org/wiki/File:Musk_melon_for_sale_-_Tokyo_-_Jan_21_2021.jpeg) by Nesnad, CC BY 4.0, ["Garden strawberry (Fragaria × ananassa) single"](<https://commons.wikimedia.org/wiki/File:Garden_strawberry_(Fragaria_%C3%97_ananassa)_single.jpg>) by Ivar Leidus, CC BY-SA 4.0, ["Oranges - whole-halved-segment"](https://commons.wikimedia.org/wiki/File:Oranges_-_whole-halved-segment.jpg) by Ivar Leidus, CC BY-SA 4.0, and ["Clementine012"](https://commons.wikimedia.org/wiki/File:Clementine012.png) by asdfVic, CC BY-SA 3.0.
