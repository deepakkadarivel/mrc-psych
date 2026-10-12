#!/usr/bin/env python3
"""Crop one figure/table/flowchart region from a Paper A section PDF page into public/diagrams/paper-a/<topic>/<slug>.png.

Usage:
  crop-figure.py <topic-id> <page> <x0> <y0> <x1> <y1> <slug> [--dpi 130]   crop by page FRACTIONS (0-1, top-left origin)
  crop-figure.py <topic-id> <page> --candidate <n> <slug>                    crop auto-detected candidate n (see --render)
  crop-figure.py <topic-id> <page> --render <out.png>                        render the page for viewing, with the detected
                                                                             candidates drawn as numbered red boxes
Prints the `src` to use in an `image` block. The crop is written into public/diagrams/paper-a/<topic>/ (commit it).
"""
import os, re, subprocess, sys, tempfile
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
ROOT = os.getcwd()
SECTIONS = os.path.join(ROOT, "resources/paper-a/MRCPSYCH PAPER A SECTIONS")
import importlib.util
spec = importlib.util.spec_from_file_location("df", os.path.join(os.path.dirname(__file__), "detect-figures.py"))
src_text = open(spec.origin).read().replace("\nmain()\n", "\n")  # import the table without running main()
ns = {}
exec(compile(src_text, spec.origin, "exec"), ns)
TOPICS = ns["TOPICS"]

def render(topic, page, dpi):
    pdf = os.path.join(SECTIONS, TOPICS[topic])
    d = tempfile.mkdtemp(prefix="pa-crop-")
    subprocess.run(["pdftoppm", "-r", str(dpi), "-f", str(page), "-l", str(page), "-png", pdf, os.path.join(d, "p")], check=True)
    return Image.open(os.path.join(d, os.listdir(d)[0])).convert("RGB")

args = sys.argv[1:]
dpi = 130
if "--dpi" in args:
    i = args.index("--dpi"); dpi = int(args[i + 1]); del args[i:i + 2]
topic, page = args[0], int(args[1])
if topic not in TOPICS: sys.exit(f"unknown topic {topic}")
import json
from PIL import ImageDraw
cand_file = os.path.join(ROOT, "content/paper-a/figure-candidates", topic + ".json")
cands = [c for c in json.load(open(cand_file))["candidates"] if c["page"] == page] if os.path.exists(cand_file) else []
if args[2] == "--render":
    im = render(topic, page, 80); dr = ImageDraw.Draw(im)
    for c in cands:
        b = c["bbox"]; box = (b[0] * im.width, b[1] * im.height, b[2] * im.width, b[3] * im.height)
        dr.rectangle(box, outline=(220, 0, 0), width=2); dr.text((box[0] + 4, box[1] + 2), str(c["n"]), fill=(220, 0, 0))
    im.save(args[3]); print(args[3], f"({len(cands)} candidates)"); sys.exit()
if args[2] == "--candidate":
    c = next(c for c in cands if c["n"] == int(args[3])); x0, y0, x1, y1 = c["bbox"]; slug = re.sub(r"[^a-z0-9-]+", "-", args[4].lower()).strip("-")
    pad = 0.008; x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(1, x1 + pad), min(1, y1 + pad)
else:
    x0, y0, x1, y1 = map(float, args[2:6]); slug = re.sub(r"[^a-z0-9-]+", "-", args[6].lower()).strip("-")
img = render(topic, page, dpi)
box = (int(x0 * img.width), int(y0 * img.height), int(x1 * img.width), int(y1 * img.height))
out_dir = os.path.join(ROOT, "public/diagrams/paper-a", topic); os.makedirs(out_dir, exist_ok=True)
name = f"p{page}-{slug}.png"
img.crop(box).save(os.path.join(out_dir, name), optimize=True)
print(f"/diagrams/paper-a/{topic}/{name}")
