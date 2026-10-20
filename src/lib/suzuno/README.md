# Suzuno faces

The folders `src/components/suzuno/`, `src/lib/suzuno/` and `src/assets/suzuno/` hold the recreations of the Suzuno project: the cover of the Suzuno brochure from the series "Tokyo Vice" and four Japanese candy packages. Four components show a face of a recreation on its reference image. A markdown page uses them without an import:

```html
<SuzunoBag item="almond-caramel" :texts="{ name: 'WALNUT' }" />
```

- `SuzunoBag`: the big bags.
- `SuzunoWrapper`: the wrapped candies.
- `SuzunoMarukawa`: the MARUKAWA bubble gum boxes.
- `SuzunoFinancial`: the cover of the Suzuno Financial Holdings brochure.

`SuzunoFace.vue` is the common part of the four components. A page does not use it directly.

## Options

Each component takes these options. Its own section gives `item` and `face`.

- `texts`: the texts of the print. Without `texts`, the face shows the texts of the print.
  - An object replaces some texts: `:texts="{ name: 'WALNUT' }"`. It merges key by key with the texts of the print, so `{ stamp: { middle: '濃厚抹茶' } }` keeps the other lines of the stamp. A string, a number or a list replaces the default as a whole.
  - `texts=""` removes all texts. The shapes, the patterns and the images of the recreation stay; the lettering goes, also the lettering that the print draws as shapes, such as the traced 北海道 and the drawn カトウ. The barcodes keep their bars and lose their digits.
  - A key that the face does not have causes an `UnknownTextError`, and a string with text, such as `texts="WALNUT"`, causes an `InvalidOptionError`. `pnpm build` prints the error and still writes the page, without its content. In the browser, the console shows the error, and the face does not show.
- `difference`: the colour difference of the recreation and the reference, on black, where the recreation matches the reference. `true` is the default. With `false`, `off` or `0`, the face is an overlay: the recreation lies on the reference with its opacity.
- `opacity`: the opacity of the recreation, in percent from 0 to 100. The default is 50 in the overlay and 100 in the difference. An opacity in the difference mixes the difference with the reference. Another value causes an `InvalidOptionError`, as for the texts. An item or a face that does not exist causes an `UnknownFaceError` in the same way.
- `class` and `style`: the size and the place of the face, such as `class="w-16"` or `class="float-right w-24 ml-4"`. Set the width; the height follows from the face.

The overlay with the texts of the print and the default opacity shows the face as on the photo: `<SuzunoBag item="almond-caramel" difference="false" />`. The salt lemon bag is the exception. Its recreation has the size of the flat artwork of the maker (677 × 891), and its photo (590 × 750) stretches to that box, so the lower half of its overlay shows the lettering twice.

### Forms of the attributes

A markdown tag gives an attribute without a colon as a string, and an attribute with a colon as a JavaScript value. These forms work:

- `difference="false"`, `difference="off"` and `:difference="false"`.
- `opacity="30"`, `opacity="30%"` and `:opacity="30"`.
- `texts=""` and `:texts="''"` for no texts.

`:texts=""` does not work: the Vue compiler stops with "v-bind is missing expression", and the page does not build. Use `texts=""`.

### Size

Without a class or a style, a face on a line of its own is as wide as the prose column and at most as high as the window. In a paragraph, in a list item or in a table cell, a face is an inline block in the line of text, so a small candy can stand among the words:

```html
Some text <SuzunoWrapper item="hokkaido-milk" class="w-16" /> more text.
```

The rules of the default size have no specificity, so any class or style on the tag wins over them. The lightbox of the site does not open a face.

### Loading

A face mounts its recreation and its reference image only when it is less than one window height away from the visible part of the page. The reference image is a WebP copy at the width of the face (160, 320, 660, 990 or 1320 pixels, or the width of the original when it is narrower). A face narrower than 160 pixels takes copies of the photos in its recreation that are 320 pixels wide.

The fonts come from Google Fonts. The stylesheets of a face ask only for the glyphs of its texts, so a font file holds only these glyphs. Faces with the same texts share their stylesheets.

## SuzunoBag

`item`: `almond-caramel`, `hokkaido-milk` or `salt-lemon`. `face`: `front` (the default) or `back`; the salt lemon bag has only `front`.

The values in parentheses are the texts of the print. A list gives its lines. The constants in `src/lib/suzuno/` hold the full texts.

### almond-caramel

`AlmondCaramelBag.vue`, with the texts `ALMOND_CARAMEL_TEXTS` of `packages/almond-caramel.ts`. Both faces show the oval label and the ribbon:

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
- `barcode` ("4902013500477"). It must have 13 digits and a correct check digit. Another value causes an `Ean13Error` in the browser console, and the barcode does not show.
- `footnote`, 3 lines from "※ごくまれに、小包装にキャラメルが入っ".
- `homepage` (["筑豊製菓ホームページ", "http://www.chikuho-seika.co.jp"]).

### hokkaido-milk

`HokkaidoMilkBag.vue`, with the texts `HOKKAIDO_MILK_TEXTS` and `HOKKAIDO_MILK_BACK_TEXTS` of `packages/hokkaido-milk.ts`:

- `brand` ("RIBON"), front. A disc replaces the letter O.
- `title` ("北海道"). The default is the traced lettering of the print; another text is set in Noto Serif JP.
- `subtitle` ("ミルクソフトキャンデー").
- `tagline` ("Hokkaido Soft").
- `stamp`, front: `top` ("Rich Milk"), `middle` ("濃厚ミルク"), `middleSuffix` ("味"), `bottom` ("flavor").
- `badges`, three lists of lines `{ text, size?, font? }`: [{ text: "オリゴ糖配合!" }], [{ text: "北海道産" }, { text: "練 乳・バター" }, { text: "生クリーム使用" }], [{ text: "カルシウム強化!" }, { text: "1袋あたり", size: 0.6 }, { text: "120mg", size: 1.15, font: "times" }].
- `weight` ("49g"), back, in the row 内容量 of the label.
- `back`, the small print of the back: `opening`, `bestBefore` (`label` "賞味期限", `date` "2027年04月/SB3"), `calciumHeading` ("カルシウム強化"), `calciumText`, `nutrition` (`heading`, `serving`, `rows`, `note`), `afterOpening`, `label` (`heading`, `rows`, `weightRow`, `rowsAfterWeight`), `notice`, `address`, `illustration` ("イラストはイメージです"), `barcode` ("4903316443409"), `homepage` and `recycling` (`mark` "プラ", `parts`, `text`).

### salt-lemon

`SaltLemonFront.vue`, with the texts of `packages/salt-lemon.ts`:

- `kanji` ("塩"), `ruby` ("しお"), `name` ("レモン") and `kind` ("キャンディ"), the title panel.
- `banner` ("気軽に塩分補給").
- `tagline` ("ほんのりすっぱいレモン味").
- `notes` (["写真はイメージです。", "無果汁"]), the small print at the foot.
- `logo`: `name` (none: the drawn letters カトウ; a text replaces them) and `tagline` ("一粒の小さな友達").
- `saltBadge` (["鳴門の塩", "使用"]).
- `acidBadge`: `label` ("クエン酸"), `amount` ("(1袋あたり{mg}mg)", where {mg} stands for `mg`), `mg` (830) and `spheres` ([{ symbol: "Na", caption: "ナトリウム" }, { symbol: "C6H8O7", caption: "クエン酸" }]).

## SuzunoWrapper

`item`: `almond-caramel` or `hokkaido-milk`. `face`: `front` (the default) or `back`. The reference photos show the whole wrapper on a transparent ground.

### almond-caramel

`AlmondCaramelPiece.vue`, with the texts `ALMOND_CARAMEL_PIECE_TEXTS`:

- `name` ("ALMOND"), front.
- `spaced` ("CARAMEL"), front.
- `lines` ([]), small lines below the spaced word on the front.
- `columns` (["アーモンドキャラメル", "筑豊製菓株式会社", "福岡県飯塚市津島408-1"]), back, from right to left.

### hokkaido-milk

`HokkaidoMilkCandy.vue`, with the texts `HOKKAIDO_MILK_CANDY_TEXTS`:

- `subtitle` ("ミルクソフトキャンディ").
- `title` ("北海道").
- `recycling` ("プラ"), back.

## SuzunoMarukawa

`item`: `melon`, `strawberry` or `orange`. The front and the back of a box carry the same print, so a box has one face. `MarukawaBox.vue` shows the export version of the photos:

- `brand` ("MARUKAWA").
- `flavour` ("melon", "Strawberry" or "orange").
- `tagline` ("ARTIFICIALLY FLAVORED").
- `bubble` ("BUBBLE") and `gum` ("GUM").
- `label`, orange only: `heading` ("Made in"), `badge` ("JAPAN") and `lines` (["4pcs. (5.4 g)", "MARBLE BUBBLE GUM"]).

## SuzunoFinancial

The cover of the brochure, `SuzunoCover.vue`. It has no `item` and no `face`.

- `title` ("Suzuno Financial Holdings"). The fitted offsets of the glyphs apply only to the default title.
- `banner` ("すずのフィナンシャルHD").

## Source

The files are a copy from the Suzuno project at the commit `9a3602c33d0d4b2d80b066c81155443c1e163c94` (2026-10-19), and the build of bbo.do does not need that project. The copy has only the parts that the faces need:

- `src/components/suzuno/` holds `SuzunoCover.vue`, `SuzunoLogo.vue` and `PatternFill.vue` from `src/components/`, and in `packages/` the parts of the packages from `src/components/packages/`.
- `src/lib/suzuno/` holds `cover-typography.ts`, `ornament.ts` and `reference-images.ts` from `src/lib/`, the folder `packages/` from `src/lib/packages/` and the folder `patterns/` from `src/lib/patterns/`.
- `src/assets/suzuno/` holds the images, `ornament-cover.json` and `SOURCES.md` from `assets/`, and in `reference/` the reference images of the faces from `reference/`.

The comments of the copied files name the folders `assets/`, `reference/` and `tools/` of the Suzuno project. `faces.ts`, `SuzunoFace.vue`, `SuzunoBag.vue`, `SuzunoWrapper.vue`, `SuzunoMarukawa.vue`, `SuzunoFinancial.vue` and this file are not in the Suzuno project.

### Changes to the copy

- The imports and the paths in the comments point to the suzuno folders of bbo.do.
- `reference-images.ts` reads the images in `src/assets/suzuno/reference/`, makes small copies (160 and 320 pixels) and copies at the widths of the markdown images (660, 990 and 1320 pixels) and gives no link to the originals.
- `SuzunoCover.vue` has the prop `texts`. Its Google Fonts stylesheets load the glyphs of the texts that their families set. The fonts of the print apply only when they are installed, because bbo.do has no `fonts/` folder. The class `sheet` is gone, because bbo.do has no style for it.
- `cover-typography.ts` has `CoverTexts` and `COVER_TEXTS`.
- `hokkaido-milk.ts` keeps the layout as a plain object, without the hook for the fit tools of the Suzuno project.
- `ornament-cover.json` has the indentation of the lint rules of bbo.do. Its data does not change.
- `salt-lemon.ts` has `FRONT_PART_TEXTS`, `AcidBadgeTexts`, `ACID_BADGE_TEXTS` and `ACID_BADGE_SPHERES`, which `CitricAcidBadge.vue` and `SaltLemonFront.vue` take as defaults. `SaltLemonFront.vue` has the props `logoName` and `acidBadge`, which it gives to the logo and to the citric acid badge.
- `paper-grain.ts` and `plum-vine.ts` draw their noise from tiles in `src/assets/suzuno/` (`paper-grain.webp` and `ink-texture.webp`) instead of feTurbulence filters. `scripts/film-grain.ts` computes the tiles with the noise of the browser. The paper grain has no `color`, `frequency` and `octaves` any more, and a seed moves its tile. The `texture` of the vine is now the strength of the texture of the print, from 0 to 1.
- `pattern.ts` has no `colorChannels`, which only the paper grain used.
- `lettering.ts` has `FACE_GLYPHS` and `useStylesheets`. The font loaders of `lettering.ts`, `hokkaido-milk.ts` and `salt-lemon.ts` use `useStylesheets`, which adds the glyphs that a face provides to each stylesheet.

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
6. Check the faces with the draft note `pages/notes/2610-suzuno-difference-components.md` in `pnpm dev`, and run `pnpm build`.

## Licences

`src/assets/suzuno/SOURCES.md` gives the sources, the authors and the licences of the images that do not come from the photos of the Suzuno project. Some have the licence CC BY-SA, so the CC BY-NC-SA licence of the content of the site does not apply to them. A page that shows such a face credits the images, as the draft note does. The reference images are the photos of the packages of the Suzuno project, and a screenshot of the series "Tokyo Vice" (season 1, episode 5) for the cover.
