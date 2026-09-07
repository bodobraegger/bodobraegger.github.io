#!/usr/bin/env python3
"""
Subset the self-hosted woff2 fonts down to the code points the site uses.

Reads full-quality fonts from src/assets/fonts/full/ and writes trimmed woff2
files with the same names into src/assets/fonts/. The code point set is the
union of a fixed Latin/punctuation baseline and every character that appears
in pages/**/*.md, src/**/*.vue and src/**/*.ts.

Usage:
    python scripts/subset-fonts.py
"""

import sys
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

ROOT = Path(__file__).parent.parent
FONTS_DIR = ROOT / 'src' / 'assets' / 'fonts'
FULL_DIR = FONTS_DIR / 'full'

# woff2 files referenced by src/styles/fonts.css, grouped by family.
FAMILIES = {
    'BradfordLL': [
        'BradfordLL-Regular.woff2',
        'BradfordLL-RegularItalic.woff2',
        'BradfordLL-Medium.woff2',
        'BradfordLL-MediumItalic.woff2',
        'BradfordLL-Light.woff2',
        'BradfordLL-LightItalic.woff2',
        'BradfordLL-Bold.woff2',
        'BradfordLL-BoldItalic.woff2',
    ],
    'BradfordMonoLL': [
        'BradfordMonoLL-Regular.woff2',
    ],
    'Ogg': [
        'Ogg-RegularItalic.woff2',
        'Ogg-LightItalic.woff2',
    ],
}

# Fixed baseline: Basic Latin, Latin-1 Supplement, Latin Extended-A,
# General Punctuation, and the euro sign.
BASE_RANGES = [
    (0x0020, 0x007E),
    (0x00A0, 0x00FF),
    (0x0100, 0x017F),
    (0x2000, 0x206F),
    (0x20AC, 0x20AC),
]

# (base dir relative to ROOT, glob pattern) pairs to scan for extra code points.
TEXT_GLOBS = [
    (ROOT / 'pages', '**/*.md'),
    (ROOT / 'src', '**/*.vue'),
    (ROOT / 'src', '**/*.ts'),
]

LAYOUT_FEATURES = [
    'kern', 'liga', 'calt', 'dlig',
    *[f'ss{i:02d}' for i in range(1, 21)],
    'onum', 'tnum', 'pnum', 'lnum', 'frac', 'case', 'cpsp', 'locl', 'mark', 'mkmk', 'ccmp',
]

# name IDs needed to identify the family: Font Family, Font Subfamily,
# Full Font Name, PostScript Name.
NAME_IDS = [1, 2, 4, 6]


def collect_codepoints() -> set[int]:
    codepoints = set()
    for start, end in BASE_RANGES:
        codepoints.update(range(start, end + 1))
    for base, pattern in TEXT_GLOBS:
        for path in sorted(base.glob(pattern)):
            text = path.read_text(encoding='utf-8')
            codepoints.update(ord(ch) for ch in text)
    return codepoints


def make_options() -> Options:
    options = Options()
    options.flavor = 'woff2'
    options.layout_features = LAYOUT_FEATURES
    options.hinting = False
    options.name_IDs = NAME_IDS
    options.notdef_outline = True
    options.glyph_names = False
    return options


def subset_font(src: Path, dest: Path, codepoints: set[int]) -> tuple[int, int, set[int]]:
    """Write the subset font to dest, return (bytes_before, bytes_after, missing)."""
    before = src.stat().st_size
    font = TTFont(src, recalcTimestamp=False)
    cmap = font.getBestCmap()
    missing = {cp for cp in codepoints if cp not in cmap}

    subsetter = Subsetter(options=make_options())
    subsetter.populate(unicodes=sorted(codepoints - missing))
    subsetter.subset(font)
    font.save(dest)

    after = dest.stat().st_size
    return before, after, missing


def format_missing(missing: set[int]) -> str:
    return ', '.join(f'U+{cp:04X} ({chr(cp)!r})' for cp in sorted(missing))


def main():
    codepoints = collect_codepoints()
    print(f'Code points requested: {len(codepoints)}')

    FONTS_DIR.mkdir(parents=True, exist_ok=True)

    for family, names in FAMILIES.items():
        print(f'\n{family}:')
        rows = []
        missing_by_file = {}
        for name in names:
            src = FULL_DIR / name
            dest = FONTS_DIR / name
            if not src.exists():
                print(f'  ✗ {name}: source not found in full/', file=sys.stderr)
                continue
            before, after, missing = subset_font(src, dest, codepoints)
            pct = (1 - after / before) * 100 if before else 0.0
            rows.append((name, before, after, pct))
            missing_by_file[name] = missing

        for name, before, after, pct in rows:
            print(f'  {name}: {before} -> {after} bytes ({pct:.1f}% saved)')

        distinct_missing = {frozenset(m) for m in missing_by_file.values()}
        distinct_missing.discard(frozenset())
        if not distinct_missing:
            continue
        if len(distinct_missing) == 1:
            missing = next(iter(distinct_missing))
            print(f'  Missing from cmap (all {len(names)} files): {format_missing(missing)}')
        else:
            for name, missing in missing_by_file.items():
                if missing:
                    print(f'  Missing from cmap ({name}): {format_missing(missing)}')


if __name__ == '__main__':
    main()
