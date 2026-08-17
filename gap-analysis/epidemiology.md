# Gap Analysis: mrc-psych-lake (web) vs SPMM Source PDFs
## Epidemiology — What's Missing, From an Exam Standpoint

**Purpose of this document:** This compares every fact, table, and figure in the two source books
for this topic — `resources/paper-b/books/14-epidemiology.pdf` (8 pages) and
`resources/paper-b/books/7-0-epidemiological-data.pdf` (5 pages), both extracted verbatim into
`content/notes/epidemiology.json` — against what currently renders on the live Epidemiology
study-guide page (`content/study-guides/epidemiology.json`). This is an unusually small source
corpus (13 pages total across both books) and, unlike the Adult Psychiatry audit that triggered
this exercise, the guide already covers essentially every heading, definition, and table in both
books: 11 sections including a dedicated "Coverage Gaps & Flags" section that correctly and
explicitly discloses which two whole sections (Levels of Prevention; Pathways to Care/Ecological
Fallacy/Deprivation Indices) are tested via the question bank only and have **no** book coverage
at all — that disclosure is accurate, not a gap to fix. Every number in the three sex-ratio tables
and the point-estimates table was individually re-checked against the literal book text below
(all 22 female-preponderance ratios, all 12 male-preponderance ratios, all 6 equal-distribution
ratios, and all 15 point-estimate rows across prevalence/lifetime prevalence/incidence/lifetime
morbid risk/mortality) — **no numerical discrepancies were found**. The one substantive gap is a
single missing trap, but it is a high-yield one: the book states an explicit, easily-confused
counterpoint to a rule the guide already gets right for prevalence, and that counterpoint for
incidence is absent. The rest of the findings below are minor annotation/footnote drops.
**Scope note:** per the brief for this audit, the comparison below is strictly book PDFs vs. study
guide. `content/questions/epidemiology.json` (32 items) was checked only for context — 17 of its
32 questions are already cited as traps/gaps in the guide, and the 15 unused items were scanned and
found to be reinforcement of facts already on the page (crude mortality, cumulative incidence,
LMR, bar chart, population pyramid, infant mortality rate, endemic, tertiary prevention), not a
new named trial or fact. The question bank was not treated as an independent source of "missing"
findings, so a fact absent from both the books and this document should not be read as confirmed
absent from the question bank too.

---

## Section-by-Section Gap Findings

### 1. Introduction (book p.2) — Scope, the "Triad" and Genetic Epidemiology
**Status: fully covered —** no gaps found. The triad (Time/Place/Person), the
descriptive-vs-analytical distinction, genetic epidemiology's scope (gene-gene/gene-environment
interactions), and Morton's exact definition quote are all present and match the book verbatim.

### 2. Key Terms — Incidence (book pp.2–3)
**Status: reasonably covered but missing one high-yield trap —**
- **The book's "essential criterion" for incidence is missing.** Book text (p.2): "The essential
  criterion is that the measure should indicate all new occurrences of a disease within the period
  of observation in an area, **irrespective of whether the newly diagnosed patients are cured or
  dead well within the period of observation itself.**" This is the mirror-image of a rule the
  guide *does* already state correctly for prevalence (section 2, "Cases must be found at the time
  of observation... someone dead or cured before the observation period cannot be counted") — but
  the incidence side of that same asymmetry (a case that is diagnosed and then dies or recovers
  *during* the observation window still counts as an incident case, because incidence measures new
  *occurrence*, not current status) is nowhere in the current guide. Searched the full study-guide
  JSON for "irrespective of whether", "cured or dead", and "essential criterion" — none present.
  This is a classic MRCPsych trap pairing (incidence counts the dead/cured; prevalence excludes
  them) and currently only half of the pair is on the page.
- Everything else in this subsection (incidence formula, mid-interval population, cumulative
  incidence vs. incidence density/rate, the "rather bizarre" time⁻¹ unit, incidence rate ratios,
  the cohort-attrition problem) is present and correctly worded, including the question-bank trap
  about the cohort-incidence denominator (1200−200=1000).

### 3. Key Terms — Prevalence & the Incidence-Duration Relationship (book p.3)
**Status: fully covered —** point vs. period prevalence, the "existing cases" definition and its
exclusion of the dead/cured, and P = Incidence × Duration (with all three worked examples —
vaccine lowers both, cure for schizophrenia lowers only prevalence, reduced mortality in chronic
schizophrenia can paradoxically raise prevalence) are all present, plus a P=I×D mnemonic and three
extra question-bank traps (migrant schizophrenia incidence/prevalence divergence, the mortality
red-herring in P=I×D calculations, and the "chronicity, not stigma" explanation for two disorders
with equal incidence but different prevalence). No gaps found.

### 4. Lifetime Prevalence vs Lifetime Morbid Risk (book pp.3–4)
**Status: fully covered —** the recall-bias caveat on lifetime prevalence, the LMR definition
(including "past and future," "includes those deceased at the time of the survey"), and the
Saha et al. (2004) age-specific-incidence-summation method for low-incidence disorders are all
present and accurate. No gaps found.

### 5. Epidemic, Endemic and Pandemic Terminology (book p.4)
**Status: fully covered —** baseline prevalence, endemic, hyperendemic, sporadic, epidemic (both
the slow-rising-chronic-disease and acute-outbreak variants), and pandemic (with the HIV example)
are all present, plus a ladder mnemonic and the question-bank trap on why "pandemic" specifically
means geographic spread (not case volume). No gaps found.

### 6. Mortality Rates & Burden-of-Disease Measures (book pp.4–6)
**Status: reasonably covered but missing one general footnote —**
- **The book's general denominator note for the neonatal/perinatal/infant death table is not
  reproduced.** Book text (p.6), directly under the definitions table: "Note that for most of the
  above rates, total number of live births is the denominator." The guide's equivalent table
  (`mortality-burden-measures` section, "Perinatal, neonatal and infant death definitions") lists
  all seven definitions correctly (neonatal/early neonatal/late neonatal/stillbirth/perinatal/
  postneonatal/infant death, with the correct 7-day and 28-day cut-offs) but never states what the
  shared denominator for these rates actually is — a plausible EMI/SBA stem ("what is the
  denominator of the neonatal mortality rate?") has no direct answer on the page. (The guide does
  separately carry a question-bank-sourced WHO perinatal-mortality trap that mentions "per 1,000
  live births" for that one specific rate, but the book's general rule covering the whole table is
  not stated anywhere.)
- Everything else here is fully covered and numerically correct: crude/specific/standardized rate
  definitions (with the London-vs-Yorkshire suicide-rate worked example), cause-specific mortality,
  case-fatality rate (with the exact "15 out of 100 anorexia patients" example), proportionate
  mortality rate, YPLL (with both age-65 and life-expectancy endpoints, and the "earlier deaths
  weighted more" point), and the full DALY formula (DALY = YLL + YLD, YLL = N×LE, YLD = I×DW×LD,
  plus the 3% time-discounting and non-uniform age-weighting detail) — all rendered as both prose
  and a dedicated definitions table, matching the book exactly.

### 7. Graphical Expressions in Epidemiology (book pp.6–7)
**Status: fully covered —** bar charts, frequency polygons, and the three population-pyramid
shapes (constrictive/expansive/stationary) with their named example populations (US, developing
countries, Sweden) are all present and match the book's wording and examples. No gaps found.

### 8. History of Psychiatric Epidemiology (book pp.7–8)
**Status: fully covered —** all four generations are present with their defining features: 1st
generation (~16 pre-WWII studies, Midtown Manhattan study, health-care-agency-registered
prevalence), 2nd generation (post-WWII, ~60 studies, unstructured interviews, low reliability),
3rd generation (from ~1970, diagnostic-reliability focus, specific-disorder estimates), and the
claimed 4th generation (biologic markers, brain imaging, CSF, the H70 study/Skoog 2004). No gaps
found.

### 9. Disorder Burden & Sex Ratios — ESEMED Data (book p.2 of 7-0-epidemiological-data.pdf)
**Status: fully covered —** the ESEMED figures (1 in 4 lifetime any disorder, 1 in 10 past-year,
14.7% lifetime mood disorder / 13% major depression alone, 14% lifetime anxiety / 8% specific
phobia alone, 5.2% lifetime alcohol use disorder) all match the book exactly, digit for digit. No
gaps found.

### 10. Sex-Ratio Tables (book pp.2–3 of 7-0-epidemiological-data.pdf)
**Status: reasonably covered but missing one genetics annotation —**
- **Huntington's disease's "(AD inheritance)" annotation is dropped.** Book text (p.3, Equal Sex
  Distribution table): "Huntington's disease (AD inheritance) 1:1 Neither." The guide's Equal Sex
  Distribution table lists "Huntington's disease" / "1:1" with no mention of the autosomal-dominant
  inheritance note the book attaches directly to this row — a small but genuinely testable fact
  (Huntington's inheritance pattern is a recurrent MRCPsych genetics question) that the book pairs
  directly with this table row and the guide silently drops.
- All 22 female-preponderance ratios, all 12 male-preponderance ratios, and the remaining 5
  equal-distribution ratios are transcribed correctly (re-verified digit-for-digit against the book
  above), including the less-common ones that are easy to mistype: Conversion disorder 2–10:1,
  Nightmares 2–4:1, Panic disorder 2–2.5:1, Asperger's syndrome 4:1 (with the Wing 1981 alternate
  figure of 10:1 correctly preserved), and Wilson's disease's 1:1 overall ratio against its 3:1
  female-specific exception for acute liver failure.

### 11. Point Estimates Table — Prevalence/Incidence/Lifetime Risk/Mortality (book p.4 of
7-0-epidemiological-data.pdf)
**Status: reasonably covered but missing two sourcing footnotes —**
- **The book's per-disorder citation split is flattened.** Book footnote (p.5): "Tables prepared
  using data from Eaton WW, et al. The Burden of Mental Disorders Epidemiol Rev 2008;30:1–14;
  European data only; **(1) Scz data from McGrath et al. 2005**." The superscript "(1)" is attached
  specifically to the Schizophrenia row in the book table, meaning schizophrenia's figures come
  from a different source (McGrath et al. 2005) than the rest of the table (Eaton et al. 2008). The
  guide's table title credits only "Eaton et al. 2008 / Saha 2004" and the schizophrenia row itself
  carries no footnote marker — the McGrath et al. 2005 attribution for that specific row is lost.
- **The book's explicit cross-reference for childhood-disorder prevalence is missing.** Book
  footnote (p.5): "Also see table 24.2 page 651 of Gelder et al., Shorter Oxford textbook of
  psychiatry — for childhood disorders." This is the book's own disclosure that its point-estimates
  table is adult-disorder-only and childhood psychiatric epidemiology figures must be sourced
  elsewhere — a genuinely useful caveat for a reader who might otherwise assume this table is
  exhaustive. It does not appear anywhere in the guide (not in the table itself, nor in the
  "Coverage Gaps & Flags" section, which discusses the table's currency/sourcing generally but
  doesn't mention this specific childhood-disorder exclusion).
- All 15 point-estimate rows (panic disorder, social phobia, simple phobia, MDD, agoraphobia,
  PTSD, OCD, personality disorders, schizophrenia, bipolar disorder, dementia >65, anorexia,
  bulimia, somatoform disorders, delusional disorders) were individually re-checked against the
  book across all five columns (point/1-yr prevalence, lifetime prevalence, incidence, lifetime
  morbid risk, all-cause mortality SMR) — every figure matches exactly, including the two-part
  schizophrenia prevalence figure (0.33% 1-yr / 0.46% point) and the ranged figures (simple phobia
  7–11% lifetime, anorexia 4.7–8.3 per 100,000 incidence). The table's own footnote — "all values
  are medians; mortality expressed as SMR; empty cells reflect inconclusive data, not zero" — *is*
  correctly captured elsewhere, in the guide's "Coverage Gaps & Flags" section. No numerical
  discrepancies found.

### 12. Levels of Prevention / Pathways to Care, Ecological Fallacy & Deprivation Indices
**Status: correctly and explicitly flagged as not covered by either book —** both section titles
in the live guide are honestly labelled "(question-bank only — not covered in the book notes for
this topic)," and a direct check of both `books/14-epidemiology.pdf` and
`books/7-0-epidemiological-data.pdf` confirms neither term (nor Goldberg's filter model, ecological
fallacy, the Jarman index, or attack rate) appears anywhere in either book's extracted text — the
books only cite Compton's "Clinical Manual of Prevention in Mental Health" (2010) as further
reading without expanding on it. This is not a gap in the web page relative to the book; it is an
accurate disclosure of a genuine book-coverage hole, already handled correctly by the existing
"Coverage Gaps & Flags" section.

---

## Overall Coverage Verdict

This is the strongest-covered topic seen in this audit series so far. Every heading, definition,
formula, and table across both source books is represented on the live page, and every number
independently re-checked (58 individual figures across the three sex-ratio tables and the
point-estimates table) matched the book exactly with zero discrepancies. The findings above amount
to one genuinely high-yield missing trap (the incidence "counts the dead/cured" counterpoint to the
prevalence rule the guide already states correctly) and three minor, low-effort fixes (a general
denominator footnote for the mortality-definitions table, Huntington's "(AD inheritance)"
annotation, and two sourcing/cross-reference footnotes on the point-estimates table). This guide
needs roughly one new trap block and a few one-line annotation additions, not a rewrite or any new
sections.
