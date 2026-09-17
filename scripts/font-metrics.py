#!/usr/bin/env python3
"""
Print CSS @font-face fallback overrides for the project's custom fonts.

Usage:
    python scripts/font-metrics.py

Compares custom fonts against universal system fonts (Arial, Times New Roman,
Courier New) and outputs ready-to-paste @font-face fallback blocks with
size-adjust, ascent-override, descent-override, and line-gap-override values
computed from actual font file metrics.

A proportional face is matched on cap height. A monospace face is matched on
the advance width instead, because a code block reflows when the advance moves
and the reader sees that far sooner than a shorter capital.
"""

from pathlib import Path
from fontTools.ttLib import TTFont

FONTS_DIR = Path(__file__).parent.parent / 'src' / 'assets' / 'fonts'

# Known metrics for universal system fonts (measured from canonical versions).
# upem, typo_ascent, typo_descent (positive), typo_line_gap, cap_height
# upem, typo_ascent, typo_descent (positive), typo_line_gap, cap_height,
# advance of a lowercase n.
SYSTEM = {
    'Times New Roman': dict(upem=2048, cap=1356, asc=1420, desc=442, gap=0, advance=1139),
    'Arial':           dict(upem=2048, cap=1467, asc=1854, desc=434, gap=67, advance=1139),
    'Courier New':     dict(upem=2048, cap=1170, asc=1705, desc=615, gap=0, advance=1229),
}


def load(name: str) -> dict:
    path = FONTS_DIR / name
    tt = TTFont(path)
    os2 = tt['OS/2']
    upem = tt['head'].unitsPerEm
    glyphs = tt.getGlyphSet()
    return dict(
        upem=upem,
        cap=getattr(os2, 'sCapHeight', 0) or 0,
        asc=os2.sTypoAscender,
        desc=abs(os2.sTypoDescender),
        gap=os2.sTypoLineGap,
        advance=glyphs[tt.getBestCmap()[ord('n')]].width,
    )


def r(v): return round(v, 2)


def fallback_block(family: str, src_locals: list[str], target: dict, system: dict, match: str = 'cap') -> str:
    """Generate a @font-face block that makes `system` font look like `target`."""
    size_adj = r(target[match] / target['upem'] / (system[match] / system['upem']) * 100)
    ascent   = r(target['asc']  / target['upem'] * 100)
    descent  = r(target['desc'] / target['upem'] * 100)
    gap      = r(target['gap']  / target['upem'] * 100)
    srcs = ', '.join(f"local('{n}')" for n in src_locals)
    return (
        f"@font-face {{\n"
        f"  font-family: '{family}';\n"
        f"  src: {srcs};\n"
        f"  size-adjust: {size_adj}%;\n"
        f"  ascent-override: {ascent}%;\n"
        f"  descent-override: {descent}%;\n"
        f"  line-gap-override: {gap}%;\n"
        f"}}"
    )


def main():
    ogg      = load('Ogg-RegularItalic.woff2')
    areal    = load('ABCArealVariable.woff2')
    arealmono = load('ABCArealMonoVariable.woff2')
    bradmono = load('BradfordMonoLL-Regular.woff2')

    print('/* ── Raw metrics ───────────────────────────────────────── */')
    for label, m in [('Ogg-RegularItalic', ogg), ('ABCAreal', areal),
                     ('ABCArealMono', arealmono), ('BradfordMonoLL-Regular', bradmono)]:
        upem = m['upem']
        print(f'   {label}: cap={m["cap"]/upem*100:.2f}%  asc={m["asc"]/upem*100:.2f}%  '
              f'desc={m["desc"]/upem*100:.2f}%  gap={m["gap"]/upem*100:.2f}%')

    print('\n/* ── Fallback @font-face blocks ────────────────────────── */')
    print()
    print(fallback_block(
        'OggFallback',
        ['Times New Roman', 'TimesNewRomanPSMT'],
        ogg, SYSTEM['Times New Roman'],
    ))
    print()
    print(fallback_block(
        'ABCArealFallback',
        ['Arial', 'Helvetica', 'Liberation Sans', 'Arimo'],
        areal, SYSTEM['Arial'],
    ))
    print()
    print(fallback_block(
        'ABCArealMonoFallback',
        ['Courier New', 'CourierNewPSMT', 'Liberation Mono', 'Cousine'],
        arealmono, SYSTEM['Courier New'], match='advance',
    ))
    print()
    print(fallback_block(
        'BradfordMonoLLFallback',
        ['Courier New', 'CourierNewPSMT'],
        bradmono, SYSTEM['Courier New'],
    ))


if __name__ == '__main__':
    main()
