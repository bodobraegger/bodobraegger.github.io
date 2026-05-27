#!/usr/bin/env python3
"""
Print CSS @font-face fallback overrides for the project's custom fonts.

Usage:
    python scripts/font-metrics.py

Compares custom fonts against universal system fonts (Times New Roman, Georgia,
Courier New) and outputs ready-to-paste @font-face fallback blocks with
size-adjust, ascent-override, descent-override, and line-gap-override values
computed from actual font file metrics.
"""

from pathlib import Path
from fontTools.ttLib import TTFont

FONTS_DIR = Path(__file__).parent.parent / 'src' / 'assets' / 'fonts'

# Known metrics for universal system fonts (measured from canonical versions).
# upem, typo_ascent, typo_descent (positive), typo_line_gap, cap_height
SYSTEM = {
    'Times New Roman': dict(upem=2048, cap=1356, asc=1420, desc=442, gap=0),
    'Georgia':         dict(upem=2048, cap=1419, asc=1878, desc=449, gap=0),
    'Courier New':     dict(upem=2048, cap=1170, asc=1705, desc=615, gap=0),
}


def load(name: str) -> dict:
    path = FONTS_DIR / name
    tt = TTFont(path)
    os2 = tt['OS/2']
    upem = tt['head'].unitsPerEm
    return dict(
        upem=upem,
        cap=getattr(os2, 'sCapHeight', 0) or 0,
        asc=os2.sTypoAscender,
        desc=abs(os2.sTypoDescender),
        gap=os2.sTypoLineGap,
    )


def r(v): return round(v, 2)


def fallback_block(family: str, src_locals: list[str], target: dict, system: dict) -> str:
    """Generate a @font-face block that makes `system` font look like `target`."""
    size_adj = r(target['cap'] / target['upem'] / (system['cap'] / system['upem']) * 100)
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
    ogg      = load('Ogg-Regular.woff2')
    bradford = load('BradfordLL-Regular.woff2')
    bradmono = load('BradfordMonoLL-Regular.woff2')

    print('/* ── Raw metrics ───────────────────────────────────────── */')
    for label, m in [('Ogg-Regular', ogg), ('BradfordLL-Regular', bradford), ('BradfordMonoLL-Regular', bradmono)]:
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
        'BradfordLLFallback',
        ['Georgia', 'GeorgiaMT'],
        bradford, SYSTEM['Georgia'],
    ))
    print()
    print(fallback_block(
        'BradfordMonoLLFallback',
        ['Courier New', 'CourierNewPSMT'],
        bradmono, SYSTEM['Courier New'],
    ))


if __name__ == '__main__':
    main()
