# Gap Analysis: mrc-psych-lake (web) vs SPMM Source PDF
## Research Methods — What's Missing, From an Exam Standpoint

**Purpose of this document:** compare the live web page for Research Methods
(`content/study-guides/research-methods.json`, the "Full Guide" tab) against the actual
extracted text of the SPMM source book (`content/notes/research-methods.json`, sourced entirely
from `resources/paper-b/books/15-1-statistics.pdf`, pages 1–46), to find exam-relevant material
that is present in the book but absent — or subtly mismatched — on the web page. `content/questions/research-methods.json`
(the question-bank derived facts) was also reviewed for context but is not the primary
comparison target.

**Top-line finding, stated up front:** this guide is materially different in character from the
Adult Psychiatry guide that triggered this review. It is not thin. All 18 book NoteBlocks were
read in full and cross-checked line-by-line against all 11 sections / 231 blocks of the study
guide. Coverage of the book is close to exhaustive — every named study design, every named bias
subtype (all 18 from the book's taxonomy), the full ITT/PP/missing-data apparatus, the full
qualitative-research typology, the full meta-analysis/heterogeneity/publication-bias apparatus,
and the full economic-evaluation typology all appear, generally with accurate figures. The guide
also already carries ~50 explicit `gap`-type blocks that correctly disclose exactly which facts
come from the question bank rather than the book, and one dedicated "Coverage Gaps & Flags"
section that honestly states what the underlying question bank itself doesn't touch (core
inferential statistics, diagnostic-test-accuracy metrics, research ethics/governance — all
deliberately deferred to the `statistics`/`evidence-based-medicine` topics). That said, a careful
line-by-line pass against the book text did surface a real, if short, list of concrete omissions
and one attribution risk worth fixing. They are listed below.

---

## Section-by-Section Gap Findings

### 1. Study Designs — Clinical-Enquiry → Best-Study-Design Table
**Status: reasonably covered but missing two rows of the book's own table.**

The book (p.1) prints a table mapping a clinical question to the best design to answer it. The
web page's "Best Study Design by Clinical Question" table (`study-designs` section, table block)
reproduces 8 of the book's rows correctly, but is missing:
- **"What are the causes of this outcome?" → Case-control study** — a distinct row from the
  page's existing merged "Causation / aetiology → Cohort or case-control study" row. The book
  gives this as its own, more specific mapping (case-control specifically answers "what caused
  this outcome", cohort specifically answers "what does this exposure cause") — collapsing them
  into one "cohort or case-control" answer loses a distinction MRCPsych EMIs are built to test.
- **"What are the effects of this risk factor/exposure?" → Cohort study"** — same issue, the
  cohort-specific half of the pairing above.
- **"What is the effect of an intervention?" → Interventional study"** — a general row (distinct
  from the more specific "Treatment effectiveness → Pragmatic RCT" / "Treatment efficacy →
  Explanatory RCT" rows already on the page) that doesn't appear at all.

### 2. Study Designs — Cohort Terminology
**Status: entirely absent — named definitions from p.1 of the book.**

The book defines several named cohort sub-types that never appear anywhere in the guide (checked
by full-text search of the whole JSON file, not just the `study-designs` section):
- **Birth cohort** — "all those who were born on [a given date]".
- **Exposure cohort** — "all those who were exposed to a risk factor".
- **Inception cohort** — "a group of patients assembled at a single (or narrow) point of time
  based on a common factor".
- **Internal vs. external control cohorts** — internal controls are subgroups within the exposure
  cohort itself, differing by dose/degree of exposure (the book's own worked example: "½ pack a
  day smokers vs. 1 pack a day smokers"); external controls come from outside the exposure
  cohort entirely.

These are classic EMI-matching fodder (four short, easily-confused named terms) and are a clean,
low-effort addition.

### 3. Causality & Confounding — Koch / Bradford Hill / Susser Attribution
**Status: present, but likely mis-attributed — worth a fix, not just an addition.**

This is the one place where the web page states something that may not match what the book
actually says, so it was checked directly against the PDF (`pdftotext -layout -f 22 -l 22`) rather
than trusted from the pre-existing extracted JSON text, which is badly interleaved here because
the book prints this material in two side-by-side columns.

The book's actual page-22 layout is:
- **"Koch's postulates of causality" (1890, Robert Koch)** — a numbered list of *seven* items
  printed under this one heading, split across the two columns with no second heading in between:
  (1) present in every case — *Consistency*; (2) absent in other diseases — *Specificity*; (3)
  reproduces the disease experimentally — *Biological coherence*; (4) recoverable from the
  experimental disease — *Predictive or experimental performance*; (5) plausible biological
  association; (6) high strength of association; (7) absence of reverse causality.
- **"Susser's criteria of causality"** — Melvyn Susser's 5 categories (strength, specificity,
  consistency, predictive performance, coherence/plausibility), 3 of which he called essential.
- **"Bradford Hill's criteria of causality"** — a *separate*, 4-item numbered list: (1) temporal
  association, (2) dose-response association, (3) specificity, (4) consistency — with what
  appears to be Susser's own restated "3 essential" criteria (Association / Direction of
  prediction / Time Order) printed alongside it in the second column.

The web page's `confounding-effect-modification-causality` section, block 7, states "Bradford
Hill's criteria for causality" as a **7-item** list — folding items 5–7 (plausible biological
association, strength, absence of reverse causality) into Hill's criteria, when the book's own
heading placement puts those three items under **Koch's postulates**, not Hill's. Separately,
block 14's "Koch's postulates" paragraph only states items 1–4, dropping 5–7 from the page's own
Koch heading. Net effect: the same three facts (plausible biological association / strength /
no reverse causality) are present on the page, but attributed to the wrong named framework
relative to how the book itself groups them — a real risk if a question asks "which of the
following is one of Koch's postulates" vs "one of Bradford Hill's criteria" the way this book
presents them. Separately, **Susser's named "3 essential" criteria (Association, Direction of
prediction, Time Order) are not captured anywhere under that name** — the "Direction" and "Time
Order" labels don't appear on the page at all, only the underlying ideas paraphrased elsewhere.

### 4. Qualitative Studies — Validity-Assessment Methods
**Status: reasonably covered but missing 2 of the book's 5 named methods.**

The book (p.30) lists four/five explicitly named "methods of assessing validity of qualitative
research": Triangulation, Respondent validation, Reflexivity, and Deviant case analysis. The web
page's `qualitative-research-methods` section covers **Triangulation** and **Reflexivity** in
full (including the investigator-triangulation detail), but:
- **Respondent validation ("member checking")** — comparing the investigator's account against
  the research subjects' own account to establish correspondence between the two — does not
  appear anywhere on the page.
- **Deviant case analysis** — paying attention to, searching for, and discussing data that
  contradict or seem to contradict the emerging explanation — also does not appear anywhere.

These are two clean, short, easily-confused named terms in the same family as the two that are
already covered, and are a natural fit for the existing "commonly confused with triangulation"
trap block (which currently only contrasts triangulation against reflexivity).

### 5. Secondary Research — Heterogeneity/Bias Visualisation Methods
**Status: entirely absent — two named alternative plots from the book.**

The `secondary-research` section covers the forest plot and funnel plot thoroughly (construction,
axes, interpretation), but two further named plots the book explicitly describes (p.35) are
missing entirely (confirmed via full-text search — neither term appears anywhere in the file):
- **Galbraith plot** — an alternative to the forest plot for exploring heterogeneity: x-axis =
  1/standard error (precision), y-axis = the study effect estimate divided by its own standard
  error (the "standard normal deviate").
- **L'Abbé plot** — a modified scatter plot for a meta-analysis, plotting each trial's control
  event rate (CER) against its experimental event rate (EER); points above the diagonal line of
  equality favour the experimental arm, points below favour control, points on the line show no
  difference.

### 6. Secondary Research — Named Reporting/Analysis Standards
**Status: entirely absent — three named terms from the book's "More about meta-analyses" list (p.35).**

None of the following three terms appear anywhere in the study guide JSON (confirmed by full-text
search):
- **QUORUM statement** — the book's named consensus standard for reporting a meta-analysis.
- **CONSORT statement** — the book's named consensus standard for reporting an RCT.
- **Meta-regression analysis** — defined in the book as a regression technique applied to a
  meta-analysis's own study-level data, to work out which study characteristics actually
  contributed to the overall effect size (the guide does cover meta-regression's *purpose* in one
  sentence about investigating heterogeneity, but never names or defines "meta-regression" as its
  own technique).

### 7. Economic Studies — Second Cost-Effectiveness-Plane Diagram (Named Zones)
**Status: entirely absent — a second, differently-labelled diagram from the same page range.**

The web page's `economic-studies` section has a "Cost-effectiveness plane quadrants" table
correctly reproducing the book's NW/NE/SE/SW accept-or-reject framing (p.45–46). However, the book
prints a **second diagram on the following page** (PDF page 47, still cited under the book's own
page 46 in this app's page numbering) that maps the *same four quadrants* onto a different, named
"zone" vocabulary that never appears on the web page at all:

| Quadrant (cost / effect) | Book's zone name | Book's own description |
|---|---|---|
| High cost, negative effect (NW) | **Cost Wastage Zone** | "Intervention is dominated by control" |
| High cost, positive effect (NE) | **Trade-off Zone** | — |
| Low cost, negative effect (SW) | **Trade-off Zone** | — |
| Low cost, positive effect (SE) | **Cost-Effective Zone** | "Intervention dominates control" |

This is exactly the kind of second-pass diagram/table that gets silently dropped when a source is
condensed into prose — the underlying quadrant logic is on the page, but the specific vocabulary
("Cost Wastage Zone", "Trade-off Zone", "Cost-Effective Zone", "dominated by control" /
"dominates control") that an exam question could ask you to name is not.

### 8. Economic Studies — Sensitivity-Analysis Worked Figures
**Status: reasonably covered but missing the book's own specific numbers.**

The `economic-studies` section's sensitivity-analysis paragraph correctly lists all five subtypes
(one-way, extreme-scenario, two-way, Monte-Carlo, bootstrapping) with accurate descriptions. But
the book's own lead-in sentence to this list gives two concrete, quotable assumptions that are
missing from the page entirely:
- Economic analyses conventionally assume **a standard rate of inflation** and discount changes
  in foreign-exchange values when calculating costs.
- **A conventional 6% discount rate** is assumed for year-on-year calculations.

Neither "discount rate" nor "6%" nor "inflation" appears anywhere in the guide (confirmed by
full-text search). This is a short, concrete, easily-added fact with a specific number attached —
exactly the sort of thing MRCPsych favours for exact-recall distractors.

---

## What Was Checked and Found Genuinely Fine (no gap)

For completeness, and to justify the overall verdict below: the following areas were
spot-checked in detail against the book and found to be accurately and completely reproduced,
so they are *not* listed as findings above — case-control/cohort advantages-disadvantages tables;
the 4-row observational-design comparison table; the full 18-row bias taxonomy (Berkson, Neyman,
response, unmasking, lead-time, referral, diagnostic purity, membership, recall, reporting,
observer, surveillance, work-up/verification, misclassification, desirability, Hawthorne,
contamination, attrition); randomisation sub-types (simple/block/stratified/cluster/minimisation/
quasi-randomisation); all named special RCT designs (crossover, parallel, factorial with the
Heinala et al. 2001 worked example, N-of-1, patient-preference, Zelen's, non-inferiority);
blinding levels and allocation-concealment (including the SNOSE mnemonic); the full ITT/PP/TR
apparatus and all 9 listed methods of handling missing data; fixed- vs. random-effects models and
their associated statistical methods (Mantel-Haenszel/Peto vs. DerSimonian-Laird); funnel plots,
failsafe N, trim-and-fill, and cumulative meta-analysis; effect-size measures (OR/RR/SMD/Cohen's
d/Hedges' g) including the >20% event-rate OR-overestimation-of-RR rule; and all five types of
economic evaluation with the book's own worked Clozaril-vs-Zaponex figures. Numeric cross-checks
(4:1 case:control ratio, <5% rare-disease OR≈RR approximation, the CBT/GET incremental-cost
worked example, the ICER formula) all matched the book's literal wording exactly.

---

## Overall Verdict

This guide does **not** need the kind of large-scale rewrite Adult Psychiatry needed. Coverage of
the actual book is close to complete and generally accurate, with the gaps found here being
narrow and enumerable: roughly **6 short named-term/definition gaps** (birth/exposure/inception
cohort + internal/external control; respondent validation; deviant case analysis; Galbraith plot;
L'Abbé plot; QUORUM/CONSORT/meta-regression), **2 missing table rows** (the clinical-enquiry
table), **1 missing named diagram** (the Cost Wastage/Trade-off/Cost-Effective zone table), **1
missing worked figure** (the 6% discount-rate / inflation assumption), and **1 attribution
discrepancy worth fixing** rather than adding to (the Koch's-postulates-vs-Bradford-Hill's-
criteria item split on p.22). None of these individually require new sections — they are all
additions/corrections to existing sections (`study-designs`, `confounding-effect-modification-
causality`, `qualitative-research-methods`, `secondary-research`, `economic-studies`). A
reasonable estimate is 8-10 new/edited blocks total to close every finding above.
