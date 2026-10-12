#!/usr/bin/env python3
"""Re-crop an existing Paper A figure with extra margin (or less) by locating it on its source page render.

Usage: python3 scripts/paper-a/extend-crop.py <topic-id> <png-name> <top> <bottom> <left> <right>   (pixels at 130 dpi; negative trims)
Finds the crop's position on the page by normalised cross-correlation at 130 dpi (the dpi crop-figure.py writes),
then rewrites the PNG from the page render with the requested margin change.
"""
import os, re, subprocess, sys, tempfile
import numpy as np
from PIL import Image
from scipy.signal import fftconvolve
sys.path.insert(0, os.path.dirname(__file__))
ns = {}
exec(compile(open(os.path.join(os.path.dirname(__file__), "detect-figures.py")).read().replace("\nmain()\n", "\n"), "df", "exec"), ns)
topic, name = sys.argv[1], sys.argv[2]
top, bottom, left, right = map(int, sys.argv[3:7])
page = int(re.match(r"p(\d+)-", name).group(1))
path = os.path.join("public/diagrams/paper-a", topic, name)
crop = Image.open(path).convert("RGB")
d = tempfile.mkdtemp(prefix="pa-ext-")
subprocess.run(["pdftoppm", "-r", "130", "-f", str(page), "-l", str(page), "-png", os.path.join(ns["SECTIONS"], ns["TOPICS"][topic]), os.path.join(d, "p")], check=True)
full = Image.open(os.path.join(d, os.listdir(d)[0])).convert("RGB")
pg = np.array(full.convert("L"), dtype=np.float32); c = np.array(crop.convert("L"), dtype=np.float32)
s = 3
pgs, cs = pg[::s, ::s], c[::s, ::s]
cn = (cs - cs.mean()) / (cs.std() + 1e-6)
num = fftconvolve(pgs, cn[::-1, ::-1], mode="valid")
ones = np.ones_like(cn)
ws = fftconvolve(pgs, ones, mode="valid"); wq = fftconvolve(pgs ** 2, ones, mode="valid")
var = np.maximum(wq - ws ** 2 / cn.size, 1e-3)
ncc = num / np.sqrt(var * (cn ** 2).sum())
yi, xi = np.unravel_index(np.argmax(ncc), ncc.shape)
print("match score", round(float(ncc[yi, xi]), 3))
# refine at full resolution around the coarse hit
best = (-1, 0, 0)
cc = (c - c.mean()) / (c.std() + 1e-6)
for dy in range(-s - 1, s + 2):
    for dx in range(-s - 1, s + 2):
        y0, x0 = yi * s + dy, xi * s + dx
        if y0 < 0 or x0 < 0 or y0 + c.shape[0] > pg.shape[0] or x0 + c.shape[1] > pg.shape[1]: continue
        w = pg[y0:y0 + c.shape[0], x0:x0 + c.shape[1]]
        sc = float(((w - w.mean()) / (w.std() + 1e-6) * cc).mean())
        if sc > best[0]: best = (sc, y0, x0)
print("refined", round(best[0], 3))
if best[0] < 0.9: sys.exit("could not locate this crop exactly on the page render; not modified")
_, y0, x0 = best
box = (max(0, x0 - left), max(0, y0 - top), min(full.width, x0 + c.shape[1] + right), min(full.height, y0 + c.shape[0] + bottom))
full.crop(box).save(path, optimize=True)
print("rewrote", path, box)
