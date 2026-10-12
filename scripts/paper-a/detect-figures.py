#!/usr/bin/env python3
"""Find figure / diagram / flowchart / grid-table regions on every page of the Paper A section PDFs.

Method (no text-layer guesses): render the page, paint every extracted text word box white, and what ink is
left is graphics — shapes, arrows, lines, raster images. Nearby ink is merged into regions; a region is kept
when it has enough graphics ink and isn't just a page rule/underline. The crop is taken from the UNMASKED
render (so labels inside the figure are kept). Output: a JSON index of candidate regions per topic (page + bbox as page fractions). Candidates are only
suggestions: scripts/paper-a/crop-figure.py makes the actual PNG (the crop itself is the source, cited as {file, page}).

Usage: python3 scripts/paper-a/detect-figures.py [topic-id ...]   (needs numpy, scipy, Pillow, poppler)
"""
import json, os, re, subprocess, sys, tempfile
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.getcwd()
SECTIONS = os.path.join(ROOT, "resources/paper-a/MRCPSYCH PAPER A SECTIONS")
OUT = os.path.join(ROOT, "public/diagrams/paper-a")
INDEX = os.path.join(ROOT, "content/paper-a/figure-candidates")
DPI = 110
TMP = tempfile.mkdtemp(prefix="pa-fig-")  # honours $TMPDIR
TOPICS = {  # same ids/files as scripts/paper-a/config.ts
    "pa-classification": "CLASSIFICATION.pdf", "pa-clinical-examination": "CLINICAL EXAMINATION.pdf",
    "pa-descriptive-psychopathology": "DESCRIPTIVE PSYCHOPATHOLOGY.pdf", "pa-dynamic-psychopathology": "DYNAMIC PSYCHOPATHOLOGY.pdf",
    "pa-rating-scales": "RATING SCALES.pdf", "pa-syndromes": "SYNDROMES.pdf", "pa-applied-neurosciences": "APPLIED NEUROSCIENCES.pdf",
    "pa-neuroanatomy": "NEUROANATOMY.pdf", "pa-neurochemistry": "NEUROCHEMISTRY.pdf", "pa-neuropathology": "NEUROPATHOLOGY.pdf",
    "pa-neurophysiology": "NEUROPHYSIOLOGY.pdf", "pa-basic-pharmacology": "BASIC PHARMACOLOGY.pdf",
    "pa-pharmacokinetics": "PHARMACOKINETICS.pdf", "pa-pharmacodynamics": "PHARMACODYNAMICS.pdf",
    "pa-adverse-drug-effects": "ADVERSE DRUG EFFECTS.pdf", "pa-basic-psychology": "BASIC PSYCHOLOGY.pdf",
    "pa-social-psychology": "SOCIAL PSYCHOLOGY.pdf", "pa-sociocultural-psychiatry": "SOCIOCULTURAL PSYCHIATRY.pdf",
    "pa-human-development": "HUMAN DEVELOPMENT.pdf", "pa-molecular-genetics": "MOLECULAR GENETICS.pdf",
}

def words(pdf, page):
    xml = subprocess.run(["pdftotext", "-bbox", "-f", str(page), "-l", str(page), pdf, "-"], capture_output=True, text=True).stdout
    m = re.search(r'<page width="([\d.]+)" height="([\d.]+)"', xml)
    w, h = float(m.group(1)), float(m.group(2))
    boxes = [tuple(map(float, b)) for b in re.findall(r'xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)"', xml)]
    return w, h, boxes

def npages(pdf):
    return int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout).group(1))

def regions(pdf, page, tmp):
    w, h, boxes = words(pdf, page)
    subprocess.run(["pdftoppm", "-r", str(DPI), "-f", str(page), "-l", str(page), "-png", pdf, tmp], check=True)
    png = [f for f in os.listdir(os.path.dirname(tmp)) if f.startswith(os.path.basename(tmp))][0]
    path = os.path.join(os.path.dirname(tmp), png)
    full = Image.open(path).convert("RGB")
    os.remove(path)
    sx, sy = full.width / w, full.height / h
    gray = np.array(full.convert("L"))
    ink = gray < 235            # anything not near-white (coloured fills count as ink)
    masked = ink.copy()
    for x0, y0, x1, y1 in boxes:  # erase text (a little padding: antialiasing)
        masked[max(0, int(y0 * sy) - 2):int(y1 * sy) + 3, max(0, int(x0 * sx) - 2):int(x1 * sx) + 3] = False
    # drop page header/footer bands
    masked[: int(0.045 * full.height)] = False
    masked[int(0.955 * full.height):] = False
    # merge nearby ink into regions
    merged = ndimage.binary_dilation(masked, structure=np.ones((3, 3)), iterations=int(0.2 * DPI))
    lab, n = ndimage.label(merged)
    out = []
    for i, sl in enumerate(ndimage.find_objects(lab), start=1):
        ys, xs = sl
        region_ink = int(masked[sl][lab[sl] == i].sum())
        hh, ww = ys.stop - ys.start, xs.stop - xs.start
        area = hh * ww
        # tiny marks, bullets, underlines and page rules are not figures
        if region_ink < 0.0012 * full.width * full.height or hh < 0.05 * DPI * 11 / 11 * 3 or ww < 0.9 * DPI:
            continue
        if hh < 0.12 * DPI * 3 and ww > 0.5 * full.width and region_ink < 0.004 * full.width * full.height:
            continue  # a thin horizontal rule
        out.append({"bbox_px": [xs.start, ys.start, xs.stop, ys.stop], "ink": region_ink, "fill": round(region_ink / area, 4)})
    return full, out

def main():
    only = set(sys.argv[1:])
    os.makedirs(INDEX, exist_ok=True)
    for tid, fn in TOPICS.items():
        if only and tid not in only: continue
        pdf = os.path.join(SECTIONS, fn)
        found = []
        for pg in range(1, npages(pdf) + 1):
            full, regs = regions(pdf, pg, os.path.join(TMP, f"pa_fig_{tid}"))
            for k, r in enumerate(regs, start=1):
                x0, y0, x1, y1 = r["bbox_px"]
                found.append({"page": pg, "n": k, "bbox": [round(x0 / full.width, 4), round(y0 / full.height, 4), round(x1 / full.width, 4), round(y1 / full.height, 4)],
                              "fill": r["fill"]})
        json.dump({"topic": tid, "file": "paper-a/MRCPSYCH PAPER A SECTIONS/" + fn, "candidates": found}, open(os.path.join(INDEX, f"{tid}.json"), "w"), indent=1)
        print(f"{tid}: {len(found)} candidate regions on {len({f['page'] for f in found})} pages")

main()
