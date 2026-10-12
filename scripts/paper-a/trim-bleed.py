#!/usr/bin/env python3
"""Trim neighbouring-prose bleed from Paper A figure crops.

A crop sometimes carries a sliver of the surrounding text (a cut-off line above, a few letters at the side). This
removes a thin ink fragment that touches an edge and is separated from the main figure by a clear white gap, but only
when the figure is large (so small stacked/label elements are never mistaken for bleed). Idempotent; prints what it trimmed.
Usage: python3 scripts/paper-a/trim-bleed.py [--dry] [files...]   (default: every PNG under public/diagrams/paper-a)
"""
import glob, sys
import numpy as np
from PIL import Image

def runs(mask):  # contiguous True runs as (start, end)
    out, start = [], None
    for i, v in enumerate(mask):
        if v and start is None: start = i
        if not v and start is not None: out.append((start, i)); start = None
    if start is not None: out.append((start, len(mask)))
    return out

def trim_axis(ink, axis, thin_px, gap_px, min_total):
    """Return (lo, hi) slice along `axis` after removing thin edge fragments."""
    prof = ink.any(axis=1 - axis)  # True where the row (axis 0) / column (axis 1) has ink
    rs = runs(prof)
    lo, hi = 0, len(prof)
    if len(rs) < 2 or len(prof) < min_total: return lo, hi
    first, second = rs[0], rs[1]
    if first[0] <= 2 and first[1] - first[0] <= thin_px and second[0] - first[1] >= gap_px and (rs[-1][1] - second[0]) > 4 * (first[1] - first[0]):
        lo = second[0] - 4
    last, prev = rs[-1], rs[-2]
    if last[1] >= len(prof) - 2 and last[1] - last[0] <= thin_px and last[0] - prev[1] >= gap_px and (prev[1] - rs[0][0]) > 4 * (last[1] - last[0]):
        hi = prev[1] + 4
    return max(0, lo), min(len(prof), hi)

dry = "--dry" in sys.argv
files = [a for a in sys.argv[1:] if not a.startswith("--")] or sorted(glob.glob("public/diagrams/paper-a/*/*.png"))
changed = 0
for f in files:
    im = Image.open(f).convert("RGB")
    ink = np.array(im.convert("L")) < 200
    h, w = ink.shape
    y0, y1 = trim_axis(ink, 0, thin_px=30, gap_px=8, min_total=200)
    x0, x1 = trim_axis(ink, 1, thin_px=40, gap_px=10, min_total=300)
    if (y0, y1, x0, x1) != (0, h, 0, w):
        changed += 1
        print(f"{f.replace('public/diagrams/paper-a/pa-', '')}: {w}x{h} -> rows {y0}:{y1} cols {x0}:{x1}")
        if not dry: im.crop((x0, y0, x1, y1)).save(f, optimize=True)
print(f"{changed} crops {'would be ' if dry else ''}trimmed")
