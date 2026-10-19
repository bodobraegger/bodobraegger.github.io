# Suzuno difference faces

The folders `src/components/suzuno/`, `src/lib/suzuno/` and `src/assets/suzuno/` hold the recreations of the Suzuno project: the cover of the Suzuno brochure from the series "Tokyo Vice" and four Japanese candy packages. `src/components/suzuno/SuzunoDifference.vue` lays one face of a recreation over its reference image with the colour difference. A markdown page uses it without an import:

```html
<SuzunoDifference item="almond-caramel" face="front" :texts="{ name: 'WALNUT' }" />
```

## Props of SuzunoDifference

- `item`: `cover`, `almond-caramel`, `hokkaido-milk`, `salt-lemon`, `marukawa-melon`, `marukawa-strawberry` or `marukawa-orange`.
- `face`: `front` (the default), `back`, `wrapper-front` or `wrapper-back`, as the item has them. The list below gives the faces of each item.
- `texts`: the texts that replace the texts of the print. An object merges key by key with the default texts, so `{ stamp: { middle: '濃厚抹茶' } }` keeps the other lines of the stamp. A string, a number or a list replaces the default as a whole. A key that the face does not have causes an `UnknownTextError` in the browser console, and the face disappears from the page. An item or a face that does not exist stops the build with an `UnknownFaceError`.
- `overrides`: further props of the recreation component, such as colours or images. They replace the props that the face gives. For example, `:overrides="{ version: 'domestic' }"` shows the Japanese version of a MARUKAWA box. That version has no reference image, so use it with `recreation-only`.
- `recreation-only`: shows the recreation alone, without the reference image and without the difference.

The face is as wide as the prose column and at most as high as the window. The reference image loads lazily as WebP. The fonts and the images of a recreation are large, so the recreation mounts only when its face is less than one window height away from the visible part of the page. The fonts come from Google Fonts.

## Faces and texts

The values in parentheses are the default texts of the print. A list gives its lines. The constants in `src/lib/suzuno/` hold the full default texts.

### cover

The face `front` of `SuzunoCover.vue`.

- `title` ("Suzuno Financial Holdings"). The fitted offsets of the glyphs apply only to the default title.
- `banner` ("すずのフィナンシャルHD").

### almond-caramel

The faces `front` and `back` of `AlmondCaramelBag.vue`, with the texts `ALMOND_CARAMEL_TEXTS` of `packages/almond-caramel.ts`. Both sides show the oval label and the ribbon:

- `intro` (["WE PROUDLY PRESENT YOU", "CHIKUHO CARAMEL,"]).
- `name` ("ALMOND").
- `spaced` ("CARAMEL"), the letters with dots between them.
- `sentence` (["IN THE MOST REFINED FORM AFTER YEARS", "OF TECHNICAL DEVELOPMENT IN OUR", "RESEARCH KITCHENS,"]).
- `ribbon` ("アーモンドキャラメル").

The front also shows:

- `stamp` (["地釜", "炊き"]), the columns from right to left.
- `bestBefore` ("賞味期限 2027.04.30").
- `weight` ("個包装紙込み 80 g").

The back also shows:

- `greeting`, 11 lines from "毎度お買い上げいただきまして誠にありが".
- `ingredientsTitle` ("アーモンドキャラメル").
- `ingredients`, 6 rows `{ heading, lines }` from `{ heading: '名称', lines: ['キャラメル'] }`.
- `nutritionTitle` ("栄養成分表示(100gあたり)").
- `nutrition`, 5 rows from `{ heading: '熱量', lines: ['420 kcal'] }`.
- `nutritionNote` ("この表示値は目安です").
- `recycling` (["外袋：PP", "内袋：PP, PET"]).
- `sorting`, 3 lines from "包材の分別区分：袋 プラスチック".
- `barcode` ("4902013500477"). It must have 13 digits and a correct check digit. Another value causes an `Ean13Error` in the browser console.
- `footnote`, 3 lines from "※ごくまれに、小包装にキャラメルが入っ".
- `homepage` (["筑豊製菓ホームページ", "http://www.chikuho-seika.co.jp"]).

The faces `wrapper-front` and `wrapper-back` of `AlmondCaramelPiece.vue`, with the texts `ALMOND_CARAMEL_PIECE_TEXTS`:

- `name` ("ALMOND"), front.
- `spaced` ("CARAMEL"), front.
- `lines` ([]), small lines below the spaced word on the front.
- `columns` (["アーモンドキャラメル", "筑豊製菓株式会社", "福岡県飯塚市津島408-1"]), back, from right to left.

### hokkaido-milk

The faces `front` and `back` of `HokkaidoMilkBag.vue`, with the texts `HOKKAIDO_MILK_TEXTS` and `HOKKAIDO_MILK_BACK_TEXTS` of `packages/hokkaido-milk.ts`:

- `brand` ("RIBON"), front. A disc replaces the letter O.
- `title` ("北海道"). The default is the traced lettering of the print; another text is set in Noto Serif JP.
- `subtitle` ("ミルクソフトキャンデー").
- `tagline` ("Hokkaido Soft").
- `stamp`, front: `top` ("Rich Milk"), `middle` ("濃厚ミルク"), `middleSuffix` ("味"), `bottom` ("flavor").
- `badges`, three lists of lines `{ text, size?, font? }`: [{ text: "オリゴ糖配合!" }], [{ text: "北海道産" }, { text: "練 乳・バター" }, { text: "生クリーム使用" }], [{ text: "カルシウム強化!" }, { text: "1袋あたり", size: 0.6 }, { text: "120mg", size: 1.15, font: "times" }].
- `weight` ("49g"), back, in the row 内容量 of the label.
- `back`, the small print of the back: `opening`, `bestBefore` (`label` "賞味期限", `date` "2027年04月/SB3"), `calciumHeading` ("カルシウム強化"), `calciumText`, `nutrition` (`heading`, `serving`, `rows`, `note`), `afterOpening`, `label` (`heading`, `rows`, `weightRow`, `rowsAfterWeight`), `notice`, `address`, `illustration` ("イラストはイメージです"), `barcode` ("4903316443409"), `homepage` and `recycling` (`mark` "プラ", `parts`, `text`).

The faces `wrapper-front` and `wrapper-back` of `HokkaidoMilkCandy.vue`, with the texts `HOKKAIDO_MILK_CANDY_TEXTS`:

- `subtitle` ("ミルクソフトキャンディ").
- `title` ("北海道").
- `recycling` ("プラ"), back.

### salt-lemon

The face `front` of `SaltLemonFront.vue`, with the texts of `packages/salt-lemon.ts`:

- `kanji` ("塩"), `ruby` ("しお"), `name` ("レモン") and `kind` ("キャンディ"), the title panel.
- `banner` ("気軽に塩分補給").
- `tagline` ("ほんのりすっぱいレモン味").
- `notes` (["写真はイメージです。", "無果汁"]), the small print at the foot.
- `logo`: `name` (none: the drawn letters カトウ; a text replaces them) and `tagline` ("一粒の小さな友達").
- `saltBadge` (["鳴門の塩", "使用"]).
- `acidBadge`: `label` ("クエン酸"), `amount` ("(1袋あたり{mg}mg)", where {mg} stands for `mg`), `mg` (830) and `spheres` ([{ symbol: "Na", caption: "ナトリウム" }, { symbol: "C6H8O7", caption: "クエン酸" }]).

### marukawa-melon, marukawa-strawberry, marukawa-orange

The face `front` of `MarukawaBox.vue`, the export version of the photos. The front and the back of a box carry the same print, so one face stands for both.

- `brand` ("MARUKAWA").
- `flavour` ("melon", "Strawberry" or "orange").
- `tagline` ("ARTIFICIALLY FLAVORED").
- `bubble` ("BUBBLE") and `gum` ("GUM").
- `label`, orange only: `heading` ("Made in"), `badge` ("JAPAN") and `lines` (["4pcs. (5.4 g)", "MARBLE BUBBLE GUM"]).

## Source

The files are a copy from the Suzuno project at the commit `9a3602c33d0d4b2d80b066c81155443c1e163c94` (2026-10-19), and the build of bbo.do does not need that project. The copy has only the parts that the faces need:

- `src/components/suzuno/` holds `SuzunoCover.vue`, `SuzunoLogo.vue` and `PatternFill.vue` from `src/components/`, and in `packages/` the parts of the packages from `src/components/packages/`.
- `src/lib/suzuno/` holds `cover-typography.ts`, `ornament.ts` and `reference-images.ts` from `src/lib/`, the folder `packages/` from `src/lib/packages/` and the folder `patterns/` from `src/lib/patterns/`.
- `src/assets/suzuno/` holds the images, `ornament-cover.json` and `SOURCES.md` from `assets/`, and in `reference/` the reference images of the faces from `reference/`.

The comments of the copied files name the folders `assets/`, `reference/` and `tools/` of the Suzuno project. `faces.ts`, `SuzunoDifference.vue` and this file are not in the Suzuno project.

### Changes to the copy

- The imports and the paths in the comments point to the suzuno folders of bbo.do.
- `reference-images.ts` reads the images in `src/assets/suzuno/reference/`, makes copies at the widths of the markdown images (660, 990 and 1320 pixels) and gives no link to the originals.
- `SuzunoCover.vue` has the prop `texts`. Its Google Fonts stylesheets load the glyphs of the texts that their families set. The fonts of the print apply only when they are installed, because bbo.do has no `fonts/` folder. The class `sheet` is gone, because bbo.do has no style for it.
- `cover-typography.ts` has `CoverTexts` and `COVER_TEXTS`.
- `hokkaido-milk.ts` keeps the layout as a plain object, without the hook for the fit tools of the Suzuno project.
- `ornament-cover.json` has the indentation of the lint rules of bbo.do. Its data does not change.
- `salt-lemon.ts` has `FRONT_PART_TEXTS`, `AcidBadgeTexts`, `ACID_BADGE_TEXTS` and `ACID_BADGE_SPHERES`, which `CitricAcidBadge.vue` and `SaltLemonFront.vue` take as defaults. `SaltLemonFront.vue` has the props `logoName` and `acidBadge`, which it gives to the logo and to the citric acid badge.

The site config `unocss.config.ts` keeps the SVG attribute `font-size` out of the attributify utilities, because the faces set the size of their text with it.

### Update the copy

1. In the Suzuno project, write the changes since the commit above into a patch, for the source files of the copy:

   ```sh
   git diff --binary 9a3602c HEAD -- src/components/SuzunoCover.vue src/components/SuzunoLogo.vue src/components/PatternFill.vue src/components/packages src/lib/cover-typography.ts src/lib/ornament.ts src/lib/reference-images.ts src/lib/packages src/lib/patterns assets reference/cover-lit.png reference/packages > /tmp/suzuno.patch
   ```

2. Apply the patch to the copy in bbo.do. Change the paths of the patch to the suzuno folders first:

   ```sh
   sed -E -e 's#( [ab])/src/components/packages/#\1/src/components/suzuno/packages/#g' \
     -e 's#( [ab])/src/components/(SuzunoCover|SuzunoLogo|PatternFill)\.vue#\1/src/components/suzuno/\2.vue#g' \
     -e 's#( [ab])/src/lib/(packages|patterns)/#\1/src/lib/suzuno/\2/#g' \
     -e 's#( [ab])/src/lib/([a-z-]+\.ts)#\1/src/lib/suzuno/\2#g' \
     -e 's#( [ab])/assets/#\1/src/assets/suzuno/#g' \
     -e 's#( [ab])/reference/#\1/src/assets/suzuno/reference/#g' \
     /tmp/suzuno.patch | git apply --reject --binary
   ```

   The patch also has the files that the faces do not need. Remove their new copies, and solve the rejected parts by hand.

3. Change the imports of the changed files to the suzuno folders, as in the list above, and run `pnpm lint --fix`.
4. When a face gets a new text, add it to `faces.ts` and to the list in this file.
5. Write the new commit into the section "Source".
6. Check every face with the draft note `pages/notes/2610-suzuno-difference-components.md` in `pnpm dev`, and run `pnpm build`.

## Licences

`src/assets/suzuno/SOURCES.md` gives the sources, the authors and the licences of the images that do not come from the photos of the Suzuno project. Some have the licence CC BY-SA, so the CC BY-NC-SA licence of the content of the site does not apply to them. A page that shows such a face credits the images, as the draft note does. The reference images are the photos of the packages of the Suzuno project, and a screenshot of the series "Tokyo Vice" (season 1, episode 5) for the cover.
