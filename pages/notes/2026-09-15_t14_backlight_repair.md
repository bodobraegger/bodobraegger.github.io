---
title: T14 Gen 2 backlight repair guide
place: Rio de Janeiro, Brasil
date: 2026-09-15T14:45:28-03:00
lang: en
type: note+blog
plum: false
---

A step-by-step guide for finding why the internal panel of my ThinkPad T14 Gen 2a
(20XLS0CK00, AMD) went dark after I reopened the case. The page exists so I can
read it on my phone while the laptop is in pieces. The figures are from the
Lenovo Hardware Maintenance Manual (HMM) for the T14 Gen 2 and P14s Gen 2;
page numbers are the printed ones.

## What is already known

- The panel shows a faint desktop under a torch. The panel logic and the eDP
  data lanes work.
- The eDP link trained at 4 lanes, HBR2. `psr_state` is 0.
- The GPU commands the backlight at 99 % (`amdgpu_current_backlight_pwm`
  0xfb18, target equal).
- The lid switch reads open and the camera works, so the camera/Hall sensor/LED
  cable is fine.
- Reseating and cleaning the LCD cable at the system board did not help.

So the break is in the backlight supply path. Three candidates remain, in order
of likelihood: the LCD cable, the backlight fuse on the system board, the LED
driver on the panel. A multimeter separates them.

Panel from the EDID: CSOT `MNE001EA1-5`, 14" **UHD 3840x2160**, 40-pin eDP,
the 500-nit DisplayHDR option in the PSREF. The desktop runs at 1920x1080 only
because GNOME mirrors it with the HDMI monitor. This is not the common 30-pin
FHD panel, so the cable and the panel part numbers below are the UHD ones.

## The two connectors at the hinges

![HMM p103, LCD unit removal, AMD models](../../src/assets/images/notes/t14/hmm-p103-lcd-unit-amd.png)

![HMM p103 step 1, the two connectors](../../src/assets/images/notes/t14/hmm-p103-connectors-crop.png)

The figure is a bottom view, so left and right are mirrored against normal use.

| Connector in the figure                             | Cable                        | Hinge in normal use | Matters here |
| --------------------------------------------------- | ---------------------------- | ------------------- | ------------ |
| Wide, beside the WLAN card and the USB-C/HDMI ports | LCD cable (eDP + backlight)  | Left, port side     | Yes          |
| Narrow, beside the fan                              | Camera/Hall sensor/LED cable | Right, exhaust side | No           |

Both have a fold-up metal bar latch: lift the bar, pull the cable straight out,
push it back flat, fold the bar down.

## 40-pin panel connector: finding the backlight pins

The panel uses the 40-pin eDP connector. I do not have a verified pinout for
MNE001EA1-5, so find the pins on the panel PCB instead of counting:

- Pin 1 is marked with a "1" or a triangle. The backlight pins are the group at
  the opposite end of the connector.
- BL_VCC is a block of 3 to 5 adjacent pins joined by one wide copper trace,
  the widest trace on the connector. Expected with the machine on: a steady DC
  voltage, typically 7 to 21 V.
- BL_GND is the neighbouring block of pins joined by a wide trace to the ground
  plane. 0 V, meter ground.
- BL_EN and BL_PWM are two single thin-trace pins between those blocks and the
  data pins. Expected: about 3.3 V on BL_EN, 0 to 3.3 V on BL_PWM, changing
  with brightness.
- LCD_VCC is a pair of joined pins near the middle, next to the AUX pair.
  About 3.3 V. Use it as the sanity check: it must be present, because the
  panel shows an image.

If you want pin numbers, search "MNE001EA1-5 datasheet" or the panelook entry
for it and read the pin table there before probing.

## Battery rule

The battery must be disabled for every unplug, plug, or continuity check. It
must be enabled, with the machine running, for every voltage check. Disabling is
done in the BIOS, and plugging in the AC adapter re-enables it. The phases below
alternate between the two.

To disable: power on, press F1 at the logo (on the HDMI monitor), Config, Power,
Disable Built-in Battery, Yes. The machine turns off. Then unplug the AC adapter.

## Phase 0, prepare

1. Meter on DC volts, 20 V range, for voltage. Beep or diode symbol for
   continuity.
2. Tape a sewing needle to each probe tip. The pins are 0.5 mm apart.
3. Shut the machine down.

## Phase 1, open, battery disabled

4. Disable the battery (see above). Unplug the AC adapter.
5. Remove the base cover (HMM 1020, 5 captive screws, pry from the rear edge).
6. Remove the bezel. Lift at the four arrows. The bezel sheet is single use.

![HMM p105, bezel sheet and bezel](../../src/assets/images/notes/t14/hmm-p105.png)

7. Pull the three stretch tapes slowly (step 1). Lift the panel out (step 2) and
   turn it face down onto a cloth on the keyboard (step 3). Leave the LCD cable
   connected at both ends.

![HMM p106, stretch tape locations, aluminum cover](../../src/assets/images/notes/t14/hmm-p106.png)

![HMM p108, tapes out, lift the panel, turn it over](../../src/assets/images/notes/t14/hmm-p108.png)

8. On the back of the panel, find the 30-pin connector on the panel PCB and its
   pin 1 mark.

## Phase 2, voltage, machine on

9. Plug in the AC adapter. This re-enables the battery. Power on and boot to the
   desktop on the HDMI monitor. Press Fn+F6 until the brightness is at maximum.
10. Black needle on a BL_GND solder tail. Hold it there for every reading.
11. Sanity check: red needle on an LCD_VCC pin. Expect about 3.3 V. No reading
    means wrong pins or wrong end. Fix that before going on.
12. Red needle on each BL_VCC pin in turn. Write down each.
13. Red needle on BL_EN, then BL_PWM. Write down each.
14. Read the result:
    - BL_VCC shows 7 to 21 V and BL_EN about 3.3 V: the panel's LED driver is
      dead. Replace the panel. Stop.
    - BL_VCC shows 0 V: the power line does not reach the panel. Phase 3.
    - BL_VCC shows voltage, BL_EN 0 V: the enable line does not reach the
      panel. Phase 3, test BL_EN in particular.
15. Shut down. Do not let the probes touch anything else while the machine is
    on. A slip across two pins can damage the panel.

## Phase 3, cable continuity, battery disabled

16. Disable the battery. Unplug the AC adapter.
17. Unplug the cable at the panel: peel the tape, lift the latch, pull straight
    out (steps 4 to 6). Unplug it at the board: lift the bar latch, pull
    straight out.

![HMM p109, detach the cable at the panel, and reinstall](../../src/assets/images/notes/t14/hmm-p109.png)

18. Meter on continuity. One needle on a BL_VCC pin at the panel-end plug.
    Sweep the other needle across every pin of the board-end plug until it
    beeps. Note which pin. Repeat for the other BL_VCC pins and for BL_EN. The board end is Lenovo's own pinout,
    so finding the mate by sweeping is the method.
19. Short check: needle on a BL_VCC pin at the panel-end plug, other needle on
    a BL_GND pin at the same plug. It must not beep.
20. Read the result:
    - A pin from step 18 beeps nowhere: the cable is open. Replace the cable.
      Stop.
    - Step 19 beeps: the cable is shorted. That also explains a blown fuse.
      Replace the cable and do phase 4.
    - All beep correctly, no short: the cable is good. Phase 4.

Cable route inside the lid, for the visual check along the left hinge:

![HMM p122, LCD cable](../../src/assets/images/notes/t14/hmm-p122.png)

## Phase 4, fuse and board

21. Still off, battery disabled. On the board next to the LCD connector, find
    the small rectangular part marked F and a number on the silkscreen.
    Continuity across its two ends.
    - No beep: the fuse is blown. Solder replacement on the board. Stop.
    - Beeps: the fuse is fine. Step 22.
22. Plug the cable back in at both ends. Plug in the AC adapter, power on to the
    desktop, brightness to maximum.
23. On the board-side connector, measure the solder tail of the pin that mated
    with BL_VCC in step 18, against any ground.
    - 0 V: the board does not switch the backlight power on. Board-level fault.
    - Voltage present: the reseat in step 22 fixed the cable contact, or the
      panel fails intermittently. Check whether the panel is lit.

Caveat: some boards only switch the backlight rail on when a panel is detected.
A 0 V reading at the board end with the cable unplugged means nothing. Always
measure voltage with the cable connected at both ends.

## Phase 5, close

24. Shut down. Disable the battery before you plug and route the cable.
25. Fit the panel with thin double-sided tissue tape (0.1 to 0.25 mm, 2 to 3 mm
    wide, the phone repair kind, not foam) at the same places as the original
    stretch tapes: both short sides and the short strip at the top. Short
    strips at the corners are enough while the panel may still come out again.
26. Clip the bezel on. Fit the base cover. Plug in the AC adapter.

## Parts, by fault

Part numbers and prices from a web search on 2026-09-15. Open each link to see
the live price and shipping to Brazil. Cheapest first.

### Cable (UHD, 40-pin)

| Item                                                      | Number                                   | Where                                                               | Price     |
| --------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------- | --------- |
| LCD cable, UHD 40-pin, T14 Gen 2 20XK/20XL and P14s Gen 2 | Lenovo FRU 5C10Z23933                    | [AliExpress](https://www.aliexpress.com/item/4000776558824.html)    | about $26 |
| Same family, FHD 30-pin, only with an FHD panel           | Lenovo FRU 5C10Z23930, cable DC02C00DY50 | [AliExpress](https://www.aliexpress.com/item/1005003425017477.html) | about $35 |

Source for the family: [myfixguide](https://www.myfixguide.com/store/lcd-cable-for-t14-gen2/),
"5C10Z23930 is specifically the 30-pin FHD (non-touch) cable, 5C10Z23931 is the
40-pin FHD Touch version, 5C10Z23932 is 40-pin FHD Touch Privacy, and
5C10Z23933 is the 40-pin UHD cable."

### Fuse

System board: Lenovo NM-D451, silkscreen HT4B5, FRU 5B21C82223 for the
Ryzen 7 PRO 5850U with 16 GB soldered
([Newegg listing](https://www.newegg.com/p/2RC-003M-00ZW7)). The backlight fuse
designator on this board is not confirmed anywhere public. On the T14 Gen 3 AMD
board (NM-E441) it is FV1 next to the display connector
([badcaps thread](https://www.badcaps.net/forum/troubleshooting-hardware-devices-and-electronics-theory/troubleshooting-laptops-tablets-and-mobile-devices/3619520-which-fuse-is-responsible-for-backlight-on-lenovo-thinkpad-t14-gen-3)),
and on the contemporary NM-D472 it is "FV1 ... rated 3a 32v"
([badcaps thread](https://www.badcaps.net/forum/troubleshooting-hardware-devices-and-electronics-theory/troubleshooting-laptops-tablets-and-mobile-devices/schematic-requests-only/98659-lenovo-ideapad-3-15itl6-nm-d472)).
Working assumption: FV1, 0603 package, 3 A 32 V, next to the LCD connector.
The NM-D451 schematic is behind registration at
[dr-bios](https://dr-bios.com/threads/lenovo-thinkpad-t14-gen-2-nm-d451-schematic.68438/).

| Item                                                              | Where                                                                         | Price            |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------- |
| SMD fuse kit, 0603 and 1206, 1 to 5 A, pick an assortment listing | [AliExpress search](https://www.aliexpress.com/w/wholesale-fuse-kit-smd.html) | $2 to $8 per 100 |

### Panel

| Item                                                               | Number                                                                                                | Where                                                                                                                                                 | Price             |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Same panel, UHD 40-pin                                             | CSOT MNE001EA1-5 (also -1, -4)                                                                        | [eBay](https://www.ebay.com/itm/365104274747)                                                                                                         | about $150        |
| FHD 1080p downgrade, 30-pin, needs the 30-pin cable 5C10Z23930 too | Innolux N140HCG-GQ2, AUO B140HAN04.E, BOE NE140FHM-N61; Lenovo FRU 5D10W87245, 5D11C67446, 5D10W69523 | [AliExpress N140HCG-GQ2](https://www.aliexpress.us/item/3256805826418836.html), [combo listing](https://www.aliexpress.us/item/3256808509507570.html) | about $85 to $120 |

Both are tape mounted, no side brackets. Caveat on the downgrade: one iFixit
report of a UHD to FHD swap on this chassis ended in "It would not start at
all, even with the charger plugged in"
([iFixit](https://www.ifixit.com/Answers/View/951545)). Cable and panel must be
the same family, 30-pin with 30-pin, 40-pin with 40-pin.

## Tools

| Tool                                                   | Needed for               | Where                                                                                               | Price           |
| ------------------------------------------------------ | ------------------------ | --------------------------------------------------------------------------------------------------- | --------------- |
| Digital multimeter with continuity beep, DT-830 type   | all phases               | [AliExpress search](https://www.aliexpress.com/w/wholesale-dt830-digital-multimeter.html), or Saara | about $5 to $10 |
| Two sewing needles, taped to the probes                | all phases               | any haberdashery                                                                                    | cents           |
| PH0/PH00 precision screwdriver                         | base cover, hinges       | [AliExpress](https://www.aliexpress.com/item/32848169892.html)                                      | $6.88           |
| Plastic pry tool / spudger                             | base cover, bezel        | [AliExpress](https://www.aliexpress.com/item/32823627487.html)                                      | $1.99           |
| Thin double-sided tissue tape, 3M 9448 type, 2 to 4 mm | panel remount            | [AliExpress 4 mm x 50 m](https://www.aliexpress.com/item/1969970315.html), or Saara                 | $5.37           |
| Isopropyl alcohol, lint-free cloth                     | connectors, tape residue | pharmacy                                                                                            | cheap           |
| Temperature-controlled soldering iron, fine tip, flux  | fuse only                | [AliExpress search](https://www.aliexpress.com/w/wholesale-soldering-iron-kit.html)                 | $15 to $30      |

## Shopping list, Saara

- Thin double-sided tissue tape: "fita dupla face fina de tecido para tela de
  celular", 2 to 3 mm wide. Reference: 3M 9448 or 300LSE. Not "espuma", not VHB.
- Digital multimeter, DT-830 type.
- Two sewing needles for the probe tips.

## If it is not worth fixing: replacements

Current models with soldered low-power memory and long battery claims, base
prices from a web search on 2026-09-15, US store unless noted. The T14 Gen 2's
fault is a SODIMM slot, so a machine with all memory soldered, LPDDR5X, removes
that class of fault entirely.

| Model                                              | Base price                                                                       | Memory                                              | Battery claim                            | Source                                                                                                                                                                                                                                                                  |
| -------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Apple MacBook Pro 14" M5                           | $1,999 (M5 Pro from $2,499); about R$ 13,799 at a Brazilian reseller             | unified LPDDR5, soldered                            | up to 24 h                               | [apple.com](https://www.apple.com/shop/buy-mac/macbook-pro/14-inch-m5)                                                                                                                                                                                                  |
| Apple MacBook Air 13" M5                           | $1,299 (raised from $1,099 at launch); R$ 13,999 at the March 2026 Brazil launch | unified LPDDR5, soldered                            | up to 18 h                               | [Engadget](https://www.engadget.com/computing/laptops/the-macbook-air-m5-starts-at-1099-up-100-from-the-m4-141612909.html), [TechTudo](https://www.techtudo.com.br/noticias/2026/03/apple-anuncia-novo-macbook-air-com-chip-m5-veja-preco-no-brasil-edinfoeletro.ghtml) |
| Lenovo ThinkPad T14s Gen 6, AMD Ryzen AI 7 PRO 360 | about $1,500 with Lenovo's standing discount                                     | LPDDR5X-7500, soldered, 32 or 64 GB                 | 58 Wh, "most of the day"                 | [Thurrott review](https://www.thurrott.com/hardware/315343/lenovo-thinkpad-t14s-gen-6-amd-review)                                                                                                                                                                       |
| Lenovo ThinkPad T14s Gen 6, Snapdragon X Elite     | $1,969 lowest listed, promo seen at $1,279                                       | LPDDR5X, soldered                                   | 21 h measured                            | [Tom's Hardware](https://www.tomshardware.com/laptops/ultrabooks-ultraportables/lenovo-thinkpad-t14s-gen-6-snapdragon-review)                                                                                                                                           |
| Lenovo ThinkPad X1 Carbon Gen 14                   | not confirmed; Gen 13 was from about $1,870                                      | LPDDR5X, soldered, 16 to 64 GB                      | almost 24 h measured                     | [Notebookcheck](https://www.notebookcheck.net/Flagship-business-laptop-with-almost-24-hours-of-battery-life-Lenovo-ThinkPad-X1-Carbon-Gen-14-Review.1332558.0.html)                                                                                                     |
| Dell XPS 13 (2026, DX13260)                        | $699.99 base with 8 GB; $899.99 with 16 GB/512 GB                                | LPDDR5X-7467, soldered, base is single channel 8 GB | up to 17 h claimed, 18 h 26 min measured | [Windows Central](https://www.windowscentral.com/hardware/dell/dell-xps-13-2026-returns-599-computex), [RTINGS](https://www.rtings.com/laptop/reviews/dell/xps-13-2026)                                                                                                 |
| Framework Laptop 13 Pro, Intel, 2026               | $1,199 DIY, $1,499 prebuilt                                                      | LPCAMM2 LPDDR5X, replaceable module                 | 74 Wh, up to 20 h claimed                | [frame.work](https://frame.work/laptop13pro)                                                                                                                                                                                                                            |

Brazil store prices for Lenovo, Dell and Framework were not found in the search.
Check lenovo.com/br and dell.com/br directly.

## Video: the same fault on a Lenovo E14

South London Repair, "Lenovo E14 Display Repair No Backlight Engineer mistake,
sparks". A no-backlight case on a related Lenovo, with the board-side probing
shown on camera.

<iframe class="aspect-video" title="Lenovo E14 Display Repair No Backlight Engineer mistake, sparks | South London Repair" width="945" height="531" src="https://www.youtube.com/embed/I5T9uOPX6kQ?rel=0" allowfullscreen></iframe>

Link: [youtube.com/watch?v=I5T9uOPX6kQ](https://www.youtube.com/watch?v=I5T9uOPX6kQ)

## Sources

- Lenovo, T14 Gen 2 and P14s Gen 2 Hardware Maintenance Manual, printed pages
  39 (error 0288), 41 (LCD symptoms), 103, 105 to 109, 122.
- Panel and cable part numbers, board name, fuse threads and laptop prices:
  web search on 2026-09-15, links inline above.
- The full investigation log lives in my private `t14` repository,
  `debugging.md`, appendix A15.
