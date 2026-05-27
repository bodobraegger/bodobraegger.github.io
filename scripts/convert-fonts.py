#!/usr/bin/env python3
"""Convert all .otf and .ttf fonts in src/assets/fonts/ to woff2 using fonttools."""

import sys
from pathlib import Path
from fontTools.ttLib import TTFont

fonts_dir = Path(__file__).parent.parent / 'src' / 'assets' / 'fonts'

files = sorted(f for f in fonts_dir.iterdir() if f.suffix.lower() in ('.otf', '.ttf'))

if not files:
    print('No .otf or .ttf files found.')
    sys.exit(0)

for src in files:
    dest = src.with_suffix('.woff2')
    try:
        tt = TTFont(src)
        tt.flavor = 'woff2'
        tt.save(dest)
        print(f'✓  {src.name}  →  {dest.name}')
    except Exception as e:
        print(f'✗  {src.name}  failed: {e}', file=sys.stderr)
