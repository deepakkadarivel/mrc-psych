# Gap Analysis: mrc-psych-lake (web) vs SPMM Source PDF
## Statistics — What's Missing, From an Exam Standpoint

**Purpose of this document:** Compare `content/study-guides/statistics.json` (what is actually
rendered on the deployed Statistics "Full Guide" page) against the full extracted text of the
source book in `content/notes/statistics.json` (`resources/paper-b/books/15-2-statistics.pdf`,
pages 1–52), the same way the earlier Adult Psychiatry gap analysis compared that topic. Unlike
Adult Psychiatry, this guide is already unusually thorough — most named formulas, tables, and
conventions from the book are present and numerically correct. The gaps found are narrower but
still concrete: a handful of fully missing subsections, several missing worked
numeric/named-study examples that are exactly the kind of thing MRCPsych EMIs test, and — more
seriously — three places where the guide states a fact that does **not** appear anywhere in the
cited source page, which breaks this app's own zero-hallucination citation rule.

---

## Section-by-Section Gap Findings

### 1. Variables & Data — Levels of Measurement
**Status: reasonably covered but missing:**
- The book gives **two** separate classification tables on page 1. The guide's "Levels of
  Measurement — What Each Permits" table reproduces only the first (frequency/median/mean/ratio
  by data type). The second table — "Independent values / Can be ranked / Has meaningful average
  and units (mean/SD) / Has true zero value" (Nominal: independent-values only; Ordinal: +
  ranked; Interval: + meaningful average/units; Ratio: + true zero) — is not reproduced as a
  table anywhere, only paraphrased loosely in prose. This second table is natural EMI-matching
  material (row = data type, column = permitted operation) and is currently only "MRCPsych" the
  first table.

### 2. Describing Data — Central Tendency, Dispersion & Graphs
**Status: reasonably covered but missing three named worked examples with real citations:**
- The book illustrates each graph type with a specific published study, none of which appear in
  the guide's "Choosing a Graph Type" table:
  - **Scatter diagram**: a study correlating "observed length of stay" vs. "predicted length of
    stay" in psychiatric hospitals (*BMC Health Serv Res.* 2004; 4:4).
  - **Box-whisker plot**: a study of the enzyme carnosinase in Alzheimer's disease, mixed
    dementia and controls (Balion CM et al., *BMC Neurology* 2007, 7:38).
  - **Stem-and-leaf plot**: a seasonality-of-mood-changes study comparing two scales — the
    Seasonal Pattern Assessment Questionnaire (SPAQ) and the Inventory for Seasonal Variation
    (ISV) — with the specific detail that ISV stems are whole numbers/leaves are tenths (range
    0.0–6.1) while SPAQ stems are tens/leaves are ones (range 00–19) (Young MA et al.,
    *Psychiatry Research* 2003; 117(1): 75–83).
- The book's explicit definitions of **percentile** (the value below which N% of observations
  lie, worked with 5th/95th/50th-percentile examples using a 1000- and 100-observation sample)
  and **quartile** (25% below Q1, 50% below Q2/median, 75% below Q3) are not stated anywhere in
  the guide as their own fact — only the *formula* for interquartile range (75th − 25th
  percentile) survives, with the percentile concept itself assumed rather than defined.

### 3. Normal Distribution, SEM & Central Limit Theorem
**Status: well covered.** No material gaps found — bell shape, kurtosis, z-score formula, the
68/95/99% rule, CLT (n≥30 rule of thumb), and the SEM/SD relationship all match the source
numbers exactly.

### 4. Odds & Probabilities
**Status: well covered.** Probability/odds definitions, interconversion formulas, and the
addition/multiplication rules all match the source. No gaps found.

### 5. Population & Sample / Sampling Methods
**Status: reasonably covered but missing:**
- The book's worked example of the population→sample chain is entirely omitted: a study of
  depression prevalence in hospitalised congestive heart failure (CHF) patients (Freedland, KE,
  et al., *Psychosomatic Medicine* 65:119-128, 2003) at Barnes-Jewish Hospital, Washington
  University Medical Center, St Louis — **~3,900 eligible patients approached, ~1,900 excluded**
  (dementia, delirium, other exclusions, or refusal), leaving a **sample of ~2,000 patients**.
  This is exactly the kind of concrete numeric example (target population → sampling frame →
  eligible population → sample, with real numbers) that MRCPsych favours for "identify the term"
  EMI questions.

**Status: contains a fabricated fact not present in the source (see Section 14 below):**
- "Sampling with replacement" / "sampling without replacement" is stated as a fact in the guide's
  Sampling Methods section, cited to book page 10 — this concept and terminology do **not** appear
  anywhere in `resources/paper-b/books/15-2-statistics.pdf` (confirmed via `pdftotext` search of
  the entire book text). See Section 14.
- The "Stratified random" table row adds "proportionate uses the same sampling fraction per
  stratum, disproportionate deliberately over-samples a small stratum" — this proportionate/
  disproportionate distinction is likewise absent from the cited source text. See Section 14.

### 6. Inferential Statistics — Hypothesis Testing, Type I/II Errors, Power
**Status: reasonably covered but missing one table:**
- The book's classic 2×2 "truth table" for hypothesis-testing outcomes is not reproduced as its
  own table. The source lays it out explicitly: rows = study conclusion ("Difference found" /
  "No difference found"), columns = ground truth ("No true difference" / "True difference
  exists"), cells = False-positive result/Type I error (α), True-positive result/power (1−β),
  True-negative result, False-negative result/Type II error (β). The guide's "Type 1 vs Type 2
  Error & Power" table gives the definitions and symbols in a single-row-per-term format, but
  never reproduces this specific 2×2 decision-matrix layout — a very common EMI/table-completion
  format in the actual exam ("fill in the missing cell").
- All numeric conventions (α ≤ 0.05, β = 0.2, power = 80%) match the source exactly, and the
  three MCQ traps in the guide's trap-list are consistent with the question-bank explanations.

### 7. Confidence Intervals & Effect Size
**Status: missing two concrete worked examples and one full table:**
- The book's CI-interpretation worked example is entirely omitted: general-population mean
  paternal age = **28 years**; in a sample of **50 schizophrenia patients**, mean paternal age =
  **29.50 years**, 95% CI **25.10–32.50**. The book walks through interpreting this exact
  example against all four things a CI conveys (degree of confidence, width/precision, upper/
  lower limits, and — because the interval includes 28 — the conclusion that this study shows
  **no evidence** paternal age is raised in schizophrenia). None of this specific example
  survives into the guide, which states the four CI-interpretation dimensions only in the
  abstract.
- **Missing table — Effect Size vs. Percentage of Controls Exceeded vs. CLES.** The guide's
  concise section states only the single data point "ES=1 → ~84%". The book gives a full 6-row
  table that is dropped almost entirely:
  | Effect size (d) | % of controls below avg. interventional-group person | CLES |
  |---|---|---|
  | 0 | 50% | 0.50 |
  | 0.1 | 54% | 0.53 |
  | 0.5 | 69% | 0.64 |
  | 1 | 84% | 0.76 |
  | 2 | 98% | 0.92 |
  | 3 | 99.9% | 0.98 |

  The book's own worked illustration of this table — "the height difference between young men
  and women, effect size ≈2, CLES 0.92, i.e. in 92 of 100 random blind dates the male will be
  taller" — is also absent.

### 8. Reliability & Validity, Kappa Statistics
**Status: well covered on formulas/bands, but missing the book's full worked kappa calculation:**
- The book works a complete numeric kappa example (Dr A vs Dr B independently diagnosing
  hypomania in 100 patients): observed 2×2 table (Hypomania/Hypomania = 9, Hypomania/No = 3,
  No/Hypomania = 16, No/No = 72; **observed agreement = 81%**); expected-by-chance table derived
  from Dr B's 25%/75% marginal split (**expected agreement = 69%**); final
  **kappa = (81−69)/(100−69) = 12/31 ≈ 0.39 ("Fair")**. The guide states the kappa formula and
  the interpretation bands, and includes a *different*, shorter question-bank kappa trap
  (70% agreement / kappa 0.4), but the book's own fully-worked Dr A/Dr B example with its
  specific numbers (81%, 69%, 0.39) does not appear anywhere in the guide.
- The "VALIDITY — QUESTION IT ANSWERS" framing table from the book (Face/Content/Criterion/
  Convergent/Discriminant, each phrased as the literal question it answers, e.g. "Does this new
  scale associate with a different scale that measures a similar construct?" for Convergent) is
  covered in substance by the guide's "Validity Types" table but with different, non-question
  phrasing — a minor cosmetic gap, not a factual one.

### 9. Choosing a Statistical Test
**Status: well covered.** Category 1/Category 2 test-selection tables, parametric assumptions,
chi-square variants (Fisher's exact, Yates' correction, McNemar, Mantel-Haenszel, log-linear),
and data-transformation methods all match the source's specific thresholds (>20% of cells <5 for
Fisher's exact; N<100 or any cell <10 for Yates' correction).

**Status: contains one fabricated attribution (see Section 14):**
- The Fisher's exact test row labels the >20%-of-cells-<5 rule as "Cochran's criteria" — this
  name does not appear anywhere in the cited source page.

### 10. Degrees of Freedom
**Status: well covered.** All df formulas (one-sample t = n−1; two-sample t = (n1+n2)−2;
chi-square = (rows−1)×(columns−1); one-way ANOVA total/between/within) match the source exactly.

### 11. Regression & Correlation
**Status: well covered.** Pearson's/Spearman's/Kendall's tau, the regression equation, R²,
logistic regression, the "1 in 10" rule, and stepwise/forward/backward model-building are all
present and numerically consistent with the source. No material gaps found.

### 12. Multivariate Analyses, Factor Analysis, Stratification & Standardisation
**Status: reasonably covered but missing one fully worked numeric example:**
- The book's stratification/confounding worked example is entirely omitted: a hypothetical
  cohort study following two groups (exposed to antidepressants vs. unexposed) for deliberate
  self-harm, with a crude **relative risk of 2.52**, which a critique then challenges by pointing
  out age as a confounder — stratifying by age band shows different age-specific relative risks
  per stratum, and the Mantel-Haenszel procedure is used to pool these into a single adjusted RR
  (and separately, to test whether a variable is an effect modifier vs. a true confounder). The
  guide describes the Mantel-Haenszel/stratification *method* correctly but drops this specific
  worked RR=2.52 antidepressant/self-harm example entirely.
- Path analysis, cluster analysis, canonical correlation, discriminant function analysis, factor
  analysis (exploratory/confirmatory, Kaiser rule, scree plot, 0.40 loading cutoff), and direct/
  indirect standardisation (SMR = observed/expected) are all otherwise present and accurate.

### 13. EBM Framework (from the Advanced Statistics book's closing chapter, pages 48–52)
**Status: the largest gap in this topic — two entirely missing subsections plus one missing table:**
- **Entirely missing: the evidence hierarchy itself.** The book states EBM rests on two
  principles, the first of which is "it posits a **hierarchy of evidence** to guide clinical
  decision-making" — the guide's opening EBM paragraph states this principle exists but never
  describes the hierarchy. Specifically missing: that the **Oxford Centre for EBM** provides a
  system for categorising clinical evidence; that **n-of-1 trials** conducted on the specific
  patient needing a treatment decision occupy the **highest grade** of evidence when available;
  and the explicit caveat that "this hierarchy is not absolute" — if treatment effects are
  sufficiently large and consistent, a carefully conducted **observational study** may provide
  more compelling evidence than a poorly conducted RCT. This is classic, frequently tested
  MRCPsych EBM material and none of it appears in the guide.
- **Entirely missing: the impact factor definition and formula.** The book gives a full worked
  definition: "the impact factor for a journal is calculated based on a three-year period... the
  average number of times published papers are cited up to two years after publication," with
  the worked formula **Impact Factor(2010) = A/B**, where A = citations in 2010 of articles
  published 2008–2009, and B = the number of articles/reviews/proceedings published in
  2008–2009. This entire fact — name, formula, and worked year example — does not appear
  anywhere in the guide.
- **Missing table — MEDLINE/PubMed search operators.** The book gives a full operator-reference
  table useful for EMI-style "match the operator to its function" questions:
  | Operator | Function |
  |---|---|
  | AND | Retrieves results including all search terms (PubMed's default between two terms) |
  | NOT | Excludes a term from results |
  | OR | Retrieves results including at least one of the search terms |
  | Double quotes | Forces phrase search for a term not in MeSH |
  | Asterisk (*) | Wildcard — searches all terms beginning with the stem, e.g. `schizo*` |
  | `"term"[mh]` or `[sh]` | Searches MeSH controlled-vocabulary terms/subheadings (MeSH has 23,000+ terms) |
  | `"name"[au]` | Searches the author field only |

  None of this table, nor the surrounding facts (MeSH has 10,000,000+ MEDLINE citations from
  4,000 journals from 1966 onward; PsycINFO covers from 1887; only ~60–70% of the literature is
  covered by a typical search — this last figure *is* present in the guide) survives except the
  database-name/coverage table, which the guide does reproduce correctly.
- **Missing: general definitions of internal vs. external validity, and the pragmatic-trial
  trade-off.** The book defines internal validity (extent a study supports cause-and-effect
  conclusions; threatened by bias/confounding/measurement error; improved by random assignment)
  and external validity (extent results generalise; improved by random sampling; too-stringent
  inclusion criteria can reduce it) as general EBM concepts, then explicitly notes that a
  **pragmatic trial** (run in real-world conditions, unable to fully control blinding/dropouts)
  trades reduced internal validity for increased external validity. The guide currently only
  touches "internal validity" once, buried inside a single unrelated question-bank trap about a
  reserpine/breast-cancer case-control study — the general definitions and the pragmatic-trial
  trade-off never appear as their own fact.
- The 5 Guyatt question types, the reporting-bias table (publication/time-lag/language/database/
  citation/duplicate-publication/outcome-reporting bias), and the reporting-checklist table
  (CONSORT/QUOROM/PRISMA/STROBE/MOOSE/ASSERT/STARD, including the STARD-vs-STAR*D
  disambiguation) are all otherwise present and accurate.

### 14. Citation-Accuracy Flags — Facts Not Traceable to the Cited Source Page
This category is separate from "missing content" and is arguably more serious given this app's
own stated rule that every fact must trace to a real source page. Three facts in the current
guide were checked against the full text of `resources/paper-b/books/15-2-statistics.pdf`
(via `pdftotext`, whole-document search) and do **not** appear anywhere in the book, despite
being presented as sourced facts:
1. **"Sampling with replacement returns each selected unit to the pool before the next draw...
   sampling without replacement removes it"** (Sampling Methods section, cited to page 10) — the
   words "replacement" does not occur anywhere in the 15-2-statistics.pdf source text. This
   appears to be trained statistical knowledge that has bled into a cited paragraph.
2. **"proportionate uses the same sampling fraction per stratum, disproportionate deliberately
   over-samples a small stratum"** (Stratified random sampling table row, cited to page 10) — the
   book's stratified-sampling description stops at "a random sample is picked up from each
   stratum separately"; it never mentions proportionate/disproportionate stratification.
3. **"Cochran's criteria"** as the name for the Fisher's exact test threshold rule (Chi-Square
   table, cited to page 32) — the book states the >20%-of-cells-<5 rule without ever naming it;
   this attribution appears to be added from outside knowledge.

None of these three are factually *wrong* as general statistics knowledge, but per this project's
core rule they should not be presented as if drawn from the cited SPMM page — they should either
be removed, or re-labelled as "not in source" the way invented mnemonics already are.

---

## Overall Coverage Assessment

The Statistics study guide is, on the whole, **the strongest-covered topic seen in this kind of
review** — every formula, threshold, and interpretive band checked (Type I/II error conventions,
kappa bands, ICC bands, Cronbach's alpha cutoff, CI value-of-no-difference table, degrees-of-
freedom formulas, the "1 in 10" regression rule, Fisher's-exact/Yates'-correction thresholds,
Cohen's d bands) matches the source numbers exactly, and the trap/mnemonic layer is genuinely
useful and well-cited to the question bank. The real gaps are concentrated in two places: (1) the
book's worked numeric/named-study examples (paternal age CI, Dr A/Dr B kappa calculation,
antidepressant/self-harm RR=2.52 stratification example, the three graph-type case studies, the
CHF/Freedland sampling example) are almost entirely dropped in favour of the underlying
method/formula alone — these are exactly the flavour of concrete "apply the number" question
MRCPsych EMIs ask, and (2) the EBM closing chapter (pages 48–52) is the thinnest section
proportionally, missing the evidence hierarchy/n-of-1-trial material, the impact factor formula,
and the MEDLINE operator table entirely. Recommended fix: roughly 6–8 new blocks (2 worked
examples, 2–3 tables, 1 evidence-hierarchy paragraph, the impact factor fact) plus removing or
re-labelling the three unsourced facts identified in Section 14. This is a "polish and patch a
few real holes" job, not a rewrite — a smaller lift than a topic with whole missing sections.
