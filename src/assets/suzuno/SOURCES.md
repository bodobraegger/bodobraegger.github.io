# Image sources

The images in this folder that do not come from the photos of the user. Each entry gives the file, the source pages, the authors, the licences and the changes. The `tools/` and `reference/` folders are those of the Suzuno project.

## almond-caramel-almonds.webp

The two almonds with two leaves of the Almond Caramel bag. `tools/packages/almond-caramel-almonds.py` makes it from two photos. It cuts them out, matches their colours to the almonds and the leaves of the bag front (`reference/packages/almond-caramel-front.png`), makes the almond slimmer and the leaf broader, and lays out two copies of each like the print. The image has the licence CC BY-SA 4.0.

- "Almonds - in shell, shell cracked open, shelled, blanched" by Ivar Leidus, CC BY-SA 4.0. The script uses the shelled almond of the 1920 px rendition.
  https://commons.wikimedia.org/wiki/File:Almonds_-_in_shell,_shell_cracked_open,_shelled,_blanched.jpg
- "Almond tree leaf" by Osvaldo Gago, CC BY-SA 2.5. The script uses the upper leaf, without its stem.
  https://commons.wikimedia.org/wiki/File:Almond_tree_leaf.JPG

## almond-caramel-window-front.webp, almond-caramel-window-back.webp

The windows of the Almond Caramel bag, with the wrapped caramels behind the film. They are crops of the faces `reference/packages/almond-caramel-front.png` and `almond-caramel-back.png` (face rows 398 to 720), from the photos of the user.

## RIBON 北海道 milk soft candy (`packages/hokkaido-milk-*.webp`)

`tools/packages/hokkaido_milk_images.py` downloads the sources and makes the files.

- `packages/hokkaido-milk-cow.webp`: "HOLSTEIN-FRESIAN COW", plate IV, a lithograph by Gray Lith. Co., N.Y., from an old book on cattle. Public domain.
  https://commons.wikimedia.org/wiki/File:HOLSTEIN-FRESIAN_COW_(22899914244).jpg
  Changes: the cow is cut out from its sky and grass, and its colours are matched to the cow of the photographed bag.
- `packages/hokkaido-milk-farm.webp`: "Farm" by Hiroshi Miyazaki, CC BY 2.0 (https://creativecommons.org/licenses/by/2.0/).
  https://www.flickr.com/photos/7163280@N06/3616435204
  Changes: the strip with the buildings and the field is cut out, the sky is removed, the edges fade out, a smoothing filter gives it a painted look, and its colours are matched to the farm of the photographed bag.
- `packages/hokkaido-milk-can.webp`: "Cow and milk churn, Newtownmanor" by Oliver Dixon, CC BY-SA 2.0 (https://creativecommons.org/licenses/by-sa/2.0/).
  https://commons.wikimedia.org/wiki/File:Cow_and_milk_churn,_Newtownmanor_-_geograph.org.uk_-_799328.jpg
  Changes: the milk churn is cut out, made grey and matched to the cans of the photographed bag. The changed image has the same licence, CC BY-SA 2.0.
- `packages/hokkaido-milk-mascot.webp`: cut from the photo of the back of the bag (`reference/packages/hokkaido-milk-back.png`).

The outline of Hokkaido in `src/lib/suzuno/packages/hokkaido-milk-paths.ts` comes from Natural Earth (public domain), https://www.naturalearthdata.com/.

## salt-lemon-photo.webp

The lemon photograph of the front of the salt lemon candy bag, from the photo of the user (`reference/packages/photo-fronts.jpg`, through the face `reference/packages/salt-lemon-front.png`). `tools/packages/salt-lemon-flat.py` flattens the face onto the flat artwork of the maker, so that the photograph is upright and not bulged. `tools/packages/salt-lemon-photo.py` maps its colours onto those of a sharp shop photo of the same bag, takes out the print (the title panel, the logo, the badges and the lettering) and fills the holes from the rest of the photograph. The artwork and the shop photo are local references only; no part of them is in the image.

## MARUKAWA bubble gum (`packages/marukawa-*.webp`)

The fruit of the MARUKAWA bubble gum boxes, one image of the whole face (576 x 544, 4 times the face) with transparent paper for each flavour. `tools/fits/packages/marukawa_fruit.py` makes them from five photos. It cuts out a strawberry, a whole melon and a melon slice, a melon stem, a halved and a whole orange and a leaf, lays them out like the print (the melon pieces and the slices mirrored, the slices repeated), fits their places to the reference faces and matches their colours in Lab. It downloads the photos itself. The places are in `tools/fits/packages/marukawa-fruit.json`. The images that use CC BY-SA photos have the licence CC BY-SA 4.0.

- "Cantaloupe" by Renee Comet (National Cancer Institute), public domain. The script uses the whole melon, completed at the bottom from its mirrored upper half, and the slice.
  https://commons.wikimedia.org/wiki/File:Cantaloupe.jpg
- "Musk melon for sale - Tokyo - Jan 21 2021" by Nesnad, CC BY 4.0. The script uses the T-shaped stem of the middle melon.
  https://commons.wikimedia.org/wiki/File:Musk_melon_for_sale_-_Tokyo_-_Jan_21_2021.jpeg
- "Garden strawberry (Fragaria × ananassa) single" by Ivar Leidus, CC BY-SA 4.0.
  https://commons.wikimedia.org/wiki/File:Garden_strawberry_(Fragaria_%C3%97_ananassa)_single.jpg
- "Oranges - whole-halved-segment" by Ivar Leidus, CC BY-SA 4.0. The script uses the halved orange for each cut orange and the whole orange.
  https://commons.wikimedia.org/wiki/File:Oranges_-_whole-halved-segment.jpg
- "Clementine012" by asdfVic (Vicasdf9), CC BY-SA 3.0. The script uses the leaf.
  https://commons.wikimedia.org/wiki/File:Clementine012.png
