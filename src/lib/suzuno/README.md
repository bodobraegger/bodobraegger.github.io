# Suzuno faces

The folders `src/components/suzuno/`, `src/lib/suzuno/` and `src/assets/suzuno/` hold the recreations of the Suzuno project: the cover of the Suzuno brochure from the series "Tokyo Vice" and four Japanese candy packages. They also hold two packages that bbo.do adds: a bag of preserved kumquats and the strip of あべっ子ラムネ. Six components show a face of a recreation on its reference image, and a seventh grows a snake of candy. A markdown page uses them without an import:

```html
<SuzunoBag item="almond-caramel" :texts="{ name: 'WALNUT' }" />
```

- `SuzunoBag`: the big bags.
- `SuzunoWrapper`: the wrapped candies.
- `SuzunoMarukawa`: the MARUKAWA bubble gum boxes.
- `SuzunoFinancial`: the cover of the Suzuno Financial Holdings brochure.
- `SuzunoRamune`: the header card and the packets of the strip of あべっ子ラムネ.
- `SuzunoRamuneStrip`: the whole strip of あべっ子ラムネ.
- `SuzunoCandySnake`: a strip of あべっ子ラムネ that grows along a winding path.

`SuzunoFace.vue` is the common part of the six components. It puts the recreation into the slot of a `DifferenceFrame` (`src/components/DifferenceFrame.vue`) on the reference image. `faces.ts` lists the faces: their reference images, their recreations and the texts of the print.

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

The reference image loads lazily, as a WebP copy at the width of the face (160, 320, 660, 990 or 1320 pixels, or the width of the original when it is narrower). The recreation mounts when the face is less than half a window height away from the visible part of the page and its reference image has loaded. A face narrower than 160 pixels takes copies of the photos in its recreation that are 320 pixels wide.

The fonts come from Google Fonts. The stylesheets of a face ask only for the glyphs of its texts, so a font file holds only these glyphs. Faces with the same texts share their stylesheets.

## SuzunoBag

`item`: `almond-caramel`, `hokkaido-milk`, `salt-lemon` or `kumquat`. `face`: `front` (the default) or `back`; the salt lemon bag and the kumquat bag have only `front`.

The values in parentheses are the texts of the print. A list gives its lines. The constants in `src/lib/suzuno/packages/` hold the full texts.

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

`HokkaidoMilkBag.vue`, with the texts `HOKKAIDO_MILK_BAG_TEXTS` of `packages/hokkaido-milk.ts`:

- `brand` ("RIBON"), front. A disc replaces the letter O.
- `title` ("北海道"). The default is the traced lettering of the print; another text is set in Noto Serif JP.
- `subtitle` ("ミルクソフトキャンデー").
- `tagline` ("Hokkaido Soft").
- `stamp`, front: `top` ("Rich Milk"), `middle` ("濃厚ミルク"), `middleSuffix` ("味"), `bottom` ("flavor").
- `badges`, three lists of lines `{ text, size?, font? }`: [{ text: "オリゴ糖配合!" }], [{ text: "北海道産" }, { text: "練 乳・バター" }, { text: "生クリーム使用" }], [{ text: "カルシウム強化!" }, { text: "1袋あたり", size: 0.6 }, { text: "120mg", size: 1.15, font: "times" }].
- `weight` ("49g"), back, in the row 内容量 of the label.
- `back`, the small print of the back: `opening`, `bestBefore` (`label` "賞味期限", `date` "2027年04月/SB3"), `calciumHeading` ("カルシウム強化"), `calciumText`, `nutrition` (`heading`, `serving`, `rows`, `note`), `afterOpening`, `label` (`heading`, `rows`, `weightRow`, `rowsAfterWeight`), `notice`, `address`, `illustration` ("イラストはイメージです"), `barcode` ("4903316443409"), `homepage` and `recycling` (`mark` "プラ", `parts`, `text`).

### salt-lemon

`SaltLemonFront.vue`, with the texts `SALT_LEMON_TEXTS` of `packages/salt-lemon.ts`:

- `kanji` ("塩"), `ruby` ("しお"), `name` ("レモン") and `kind` ("キャンディ"), the title panel.
- `banner` ("気軽に塩分補給").
- `tagline` ("ほんのりすっぱいレモン味").
- `notes` (["写真はイメージです。", "無果汁"]), the small print at the foot.
- `logo`: `name` (none: the drawn letters カトウ; a text replaces them) and `tagline` ("一粒の小さな友達").
- `saltBadge` (["鳴門の塩", "使用"]).
- `acidBadge`: `label` ("クエン酸"), `amount` ("(1袋あたり{mg}mg)", where {mg} stands for `mg`), `mg` (830) and `spheres` ([{ symbol: "Na", caption: "ナトリウム" }, { symbol: "C6H8O7", caption: "クエン酸" }]).

### kumquat

`KumquatBag.vue`, with the texts `KUMQUAT_TEXTS` of `packages/kumquat.ts`. The bag is clear, so a photo of the kumquats behind the film fills the face, and the print lies on it. The zip is at the right edge.

- `title` ("旬の味"). The default is the traced brush lettering of the print; another text is set in Potta One.
- `lines` (["真心込めてつくりました", "おやだい味おわす"]), the two orange lines below the title. The second line is pseudo-Japanese, as on the print.
- `badge`, the round badge: `name` ("甘草金桔"), `english` (["PRESERVED KUMQUAT", "KUMQUAT CONSERVÉ"]), `weightLabel` ("Net Weight / Poids Net") and `weight` ("170g (6 oz)").
- `opening` ("請在此處開口(Please Open Here)"), along the left edge beside the arrow.
- `sticker`, the price sticker of the shop: `shop` ("MEI-JO") and `price` ("R$ 12,90"). The price is hand-written and hard to read on the photo.

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

`item`: `melon`, `strawberry` or `orange`. The front and the back of a box carry the same print, so a box has one face. `MarukawaBox.vue` shows the boxes of the photos, with the texts `MARUKAWA_TEXTS` of `packages/marukawa.ts`:

- `brand` ("MARUKAWA").
- `flavour` ("melon", "Strawberry" or "orange").
- `tagline` ("ARTIFICIALLY FLAVORED").
- `bubble` ("BUBBLE") and `gum` ("GUM").
- `label`, orange only: `heading` ("Made in"), `badge` ("JAPAN") and `lines` (["4pcs. (5.4 g)", "MARBLE BUBBLE GUM"]).

## SuzunoFinancial

The cover of the brochure, `SuzunoCover.vue`, with the texts `COVER_TEXTS` of `cover-typography.ts`. It has no `item` and no `face`.

- `title` ("Suzuno Financial Holdings"). The fitted offsets of the glyphs apply only to the default title.
- `banner` ("すずのフィナンシャルHD").

## SuzunoRamune

The strip of あべっ子ラムネ (安部製菓, 10連あべっ子ラムネ, 4 g × 10, JAN 4901262810108) has a yellow header card and ten heat-sealed packets of ramune tablets. The flavours strawberry, muscat, peach, grape and orange repeat in this order. The first five packets show their character in one pose, the last five in another. Each piece is a face of 300 × 370 pixels, from the middle of a seal to the middle of the next.

`item`: `header`, `strawberry`, `muscat`, `peach`, `grape` or `orange`. `face`: `front` (the default) or `back`. `pose`: `1` (the default) or `2`, the pose of the character on the front of a packet. A pose 2 on the header or on a back causes an `UnknownFaceError`.

The fronts of the header card and of the packets in pose 1 lie on the render of the strip on the web shop of the maker, warped onto the photo of the user. The backs and the fronts in pose 2 lie on the photos of the user, with their colours matched to the render. `ramune.ts` in `src/lib/suzuno/packages/` holds the texts, the art and the fonts, and `ramune-fit.json` the fitted places and colours. The flavour sets the colours of the band, the label and the tablets; the flavour and the pose set the art.

### header

`RamuneHeader.vue`, with the texts `RAMUNE_HEADER_TEXTS`:

- `logo` (["あべっ子", "ラムネ"]), the two lines of the brand lettering, one colour for each letter.
- `slogan` (["主原料は", "ぶどう糖", "だヨ!!"]), the speech bubble, with a larger middle.
- `allergens`, the 8 names under the drawings, from "たまご".
- `warning` (["アレルゲン", "28品目不使用"]).

The back has `back`: `caution` (3 lines from "http://www.abeseika.co.jp"), `recycling` (["PP", ...]), `details` (8 lines, the columns of the label from right to left), `barcode` ("4901262810108"), `notice` (4 lines) and `date` ("2027.08.10"). The barcode must have 13 digits and a correct check digit, as on the Almond Caramel bag.

### strawberry, muscat, peach, grape, orange

`RamunePacket.vue`, with the texts `RAMUNE_PACKET_TEXTS`:

- `logo` ("あべっ子ラムネ"), one colour for each letter.
- `flavour` ("イチゴ", "マスカット", "ピーチ", "グレープ" or "オレンジ") and `suffix` ("味"), the label. The label grows with its text.
- `juice` ("無果汁").
- `note` (["写真は", "イメージです"]).

The back shows the logo in two lines, the label and `back`: `logo` (["あべっ子", "ラムネ"]), `kind` ("ラムネ菓子"), `nutritionTitle`, `nutrition` (5 rows `{ heading, value }` from `{ heading: 'エネルギー', value: '15kcal' }`), `details` (8 columns from right to left) and `notice` (4 lines). The photo of the back is too blurred to read every line. These texts follow an older strip of the maker and the ingredients of the shop data; the nutrition values are plausible values.

## SuzunoRamuneStrip

The whole strip, lying across: the header card at the left, then the packets, with the top of each piece towards the header, as on the photo of the user.

- `face`: `front` (the default) or `back`.
- `order`: the flavours of the packets, which repeat, such as `:order="['grape', 'peach']"`. Each round of the order changes the pose. The default is the order of the strip.
- `count`: the number of packets, such as `count="6"`. The default is 10.
- `texts`: `header` with the texts of the header card, and `packets` with the texts of each flavour: `:texts="{ packets: { grape: { flavour: 'ぶどう' } } }"`.

The default strip lies on the photos of the user. A strip of another order or another count has no reference, so it shows its recreation alone, and `difference` and `opacity` do nothing.

## SuzunoCandySnake

A strip of あべっ子ラムネ grows along a winding path in the box of the component, as the vines of Orchid grow: first the header card, then one packet after another, each at the head of the snake. The path runs in rows, with a half circle at the end of each row and a gentle wave along it. With reduced motion, the whole snake shows at once.

- `order`: the flavours of the packets, as for `SuzunoRamuneStrip`.
- `class` and `style`: the size. Without them, the snake is as wide as the prose column, at a ratio of 3 to 2. A piece is a sixth of the shorter side, from 24 to 56 CSS pixels wide.

The snake starts when the page is idle. It mounts each piece of the strip once as an SVG, draws it into an image with its pictures and its fonts, and removes the SVG. The canvas then draws these images along the path, so a long snake costs no more than one strip.

## Source

The recreations come from the Suzuno project at the commit `9a3602c33d0d4b2d80b066c81155443c1e163c94` (2026-10-19), and the build of bbo.do does not need that project. The comments name its tools in `tools/`, which fitted the layouts, the colours and the images.

The kumquat bag does not come from the Suzuno project. Its face `reference/packages/kumquat-front.png` is flattened from a photo of the user. Its outlines in `packages/kumquat-paths.ts` are traced from that photo, and its places and colours in `packages/kumquat-fit.json` are fitted to the face by difference. The tools of this fit are not in bbo.do.

The strip of あべっ子ラムネ is not part of the Suzuno project. Its fit scripts are not part of bbo.do.

The copy has only what the four components show. It has no pattern generators and no ornament generator, no fit tools and no Japanese MARUKAWA boxes, and each recreation takes only the props that `faces.ts` sets. A change in the Suzuno project therefore goes into bbo.do by hand. These files differ most from their origin:

- The plum vine of the cover is the line art `src/assets/suzuno/ornament-cover.svg`, which the ornament generator draws from the fitted plant `assets/ornament-cover.json` of the Suzuno project. To draw it again, run this command in that project:

  ```sh
  node --input-type=module -e "import { toSvg } from './ornament.js'; import { readFileSync } from 'node:fs'; console.log(toSvg(JSON.parse(readFileSync('assets/ornament-cover.json', 'utf-8'))))"
  ```

  Put its output into the `<svg>` element of `ornament-cover.svg`.

- The paper grain and the texture of the vine are the tiles `paper-grain.webp` and `ink-texture.webp` in place of feTurbulence filters. `scripts/film-grain.ts` computes them with the noise of the browser.
- `SuzunoCover.vue` and the Google Fonts stylesheets of the packages load only the glyphs of the texts (`FACE_GLYPHS` in `packages/lettering.ts`). The fonts of the print of the cover apply only when they are installed, because bbo.do has no `fonts/` folder.

The site config `unocss.config.ts` keeps the SVG attribute `font-size` out of the attributify utilities, because the faces set the size of their text with it.

## Licences

`src/assets/suzuno/SOURCES.md` gives the sources, the authors and the licences of the images that do not come from the photos of the Suzuno project. Some have the licence CC BY-SA, so the CC BY-NC-SA licence of the content of the site does not apply to them. A page that shows such a face credits its images. The reference images are the photos of the packages of the Suzuno project, a photo of the user for the kumquat bag, and a screenshot of the series "Tokyo Vice" (season 1, episode 5) for the cover.

`src/assets/suzuno/SOURCES.md` gives the sources, the authors and the licences of the images that do not come from the photos of the Suzuno project. Some have the licence CC BY-SA, so the CC BY-NC-SA licence of the content of the site does not apply to them. A page that shows such a face credits its images. The reference images are the photos of the packages of the Suzuno project, and a screenshot of the series "Tokyo Vice" (season 1, episode 5) for the cover. The art of あべっ子ラムネ and its reference images come from the print and the web shop of 安部製菓, © 安部製菓株式会社, without a free licence.
