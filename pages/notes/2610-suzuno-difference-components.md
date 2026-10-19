---
title: Suzuno difference components
place: Rio de Janeiro, Brasil
date: 2026-10-19T18:00:00-03:00
lang: en
type: note
draft: true
plum: false
---

Each face below is a recreation of the Suzuno project on its reference image, with the colour difference. The texts are not the texts of the print, so they show as bright areas. A note shows a face with one line:

```html
<SuzunoDifference item="almond-caramel" face="front" :texts="{ name: 'WALNUT' }" />
```

`src/lib/suzuno/README.md` lists the items, their faces and their texts.

<SuzunoDifference item="cover" :texts="{ title: 'bbo.do Financial Holdings', banner: 'ぼどフィナンシャルHD' }" />

<SuzunoDifference item="almond-caramel" face="front" :texts="{ name: 'WALNUT', spaced: 'TOFFEE', ribbon: 'ウォルナットトフィー', weight: '個包装紙込み 120 g' }" />

<SuzunoDifference item="hokkaido-milk" face="front" :texts="{ title: '東京都', subtitle: 'ミルクハードキャンデー', tagline: 'Tokyo Hard', stamp: { middle: '濃厚抹茶' } }" />

<SuzunoDifference item="salt-lemon" :texts="{ kanji: '梅', ruby: 'うめ', name: 'ライム', banner: '気軽にビタミン補給', acidBadge: { mg: 500 } }" />

<SuzunoDifference item="marukawa-melon" :texts="{ flavour: 'kiwi', bubble: 'CHEWING' }" />

<SuzunoDifference item="marukawa-strawberry" :texts="{ flavour: 'Raspberry', tagline: 'NATURALLY FLAVORED' }" />

<SuzunoDifference item="marukawa-orange" :texts="{ flavour: 'lemon', label: { badge: 'BRAZIL', lines: ['6pcs. (8.1 g)', 'MARBLE BUBBLE GUM'] } }" />

## Image credits

The recreations use these images. `src/assets/suzuno/SOURCES.md` gives the changes to each image.

- The almonds and the leaves of the Almond Caramel bag, CC BY-SA 4.0, from ["Almonds - in shell, shell cracked open, shelled, blanched"](https://commons.wikimedia.org/wiki/File:Almonds_-_in_shell,_shell_cracked_open,_shelled,_blanched.jpg) by Ivar Leidus, CC BY-SA 4.0, and ["Almond tree leaf"](https://commons.wikimedia.org/wiki/File:Almond_tree_leaf.JPG) by Osvaldo Gago, CC BY-SA 2.5.
- The cow of the Hokkaido milk candy bag: ["HOLSTEIN-FRESIAN COW"](<https://commons.wikimedia.org/wiki/File:HOLSTEIN-FRESIAN_COW_(22899914244).jpg>), plate IV, a lithograph by Gray Lith. Co., N.Y., public domain.
- The farm: ["Farm"](https://www.flickr.com/photos/7163280@N06/3616435204) by Hiroshi Miyazaki, CC BY 2.0.
- The milk can: ["Cow and milk churn, Newtownmanor"](https://commons.wikimedia.org/wiki/File:Cow_and_milk_churn,_Newtownmanor_-_geograph.org.uk_-_799328.jpg) by Oliver Dixon, CC BY-SA 2.0.
- The outline of Hokkaido: [Natural Earth](https://www.naturalearthdata.com/), public domain.
- The fruit of the MARUKAWA boxes, CC BY-SA 4.0, from ["Cantaloupe"](https://commons.wikimedia.org/wiki/File:Cantaloupe.jpg) by Renee Comet (National Cancer Institute), public domain, ["Musk melon for sale - Tokyo - Jan 21 2021"](https://commons.wikimedia.org/wiki/File:Musk_melon_for_sale_-_Tokyo_-_Jan_21_2021.jpeg) by Nesnad, CC BY 4.0, ["Garden strawberry (Fragaria × ananassa) single"](<https://commons.wikimedia.org/wiki/File:Garden_strawberry_(Fragaria_%C3%97_ananassa)_single.jpg>) by Ivar Leidus, CC BY-SA 4.0, ["Oranges - whole-halved-segment"](https://commons.wikimedia.org/wiki/File:Oranges_-_whole-halved-segment.jpg) by Ivar Leidus, CC BY-SA 4.0, and ["Clementine012"](https://commons.wikimedia.org/wiki/File:Clementine012.png) by asdfVic, CC BY-SA 3.0.
