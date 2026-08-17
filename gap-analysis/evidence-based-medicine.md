# Gap Analysis: mrc-psych-lake (web) vs SPMM Source PDF
## Evidence-Based Medicine / Critical Appraisal — What's Missing, From an Exam Standpoint

**Purpose of this document:** This compares the live web page for Evidence-Based Medicine /
Critical Appraisal (`content/study-guides/evidence-based-medicine.json`) against the full
extracted text of its source book (`content/notes/evidence-based-medicine.json`, drawn from
`resources/paper-b/books/15-3-statistics.pdf`, 40 pages), plus a check of the underlying question
bank (`content/questions/evidence-based-medicine.json`, 239 questions across 9 sub-banks). Unlike
Adult Psychiatry, this topic's book source is short and formula-dense rather than long
prose — so the method here is less "which whole subsections are missing" (none are — every
book heading has at least some corresponding guide content) and more "which specific named
tools, tables, threshold numbers and worked examples printed in the book never made it onto
the page." Every finding below was checked directly against the book's extracted page text and,
where relevant, against the question-bank JSON's `source.page`/`questionNumber` fields — not
inferred from a summary.

**Headline finding**: this guide is unusually well-built already — it draws on all 239
question-bank items across 9 EBM sub-banks (Principles, Key Questions, Diagnosis, Causation,
Prognosis, Therapy, Meta-analysis, Recommendations & Guidelines, Interpreting Graphs) and
self-discloses several of its own gaps (GRADE, CASP/AGREE II/Jadad/PEDro, the alternative
evidence-hierarchy schemes). The genuine gaps found below are a specific, countable list of
book-stated facts/tables/named tools that never made it into a block, plus one real
citation error found while cross-checking numbers — not entire missing subsections.

---

## Section-by-Section Gap Findings

### 1. 2x2 table construction convention (the "T column" / "E column" rule)
**Status: entirely absent from the web page.**
- The book states, three separate times (p.1 for diagnostic-accuracy tables; p.8 and p.9 for
  causation/cohort tables), an explicit column-labelling convention for drawing the 2x2 table
  correctly: *"Letter T below the 2X2 table reminds us to use Test measures in the first
  column"* (diagnostic-accuracy studies) and *"Letter E below the 2X2 table reminds us to use
  Exposure measures in the first column"* (case-control/cohort/therapy studies).
- The book flags getting this wrong as a primary source of exam errors — it repeats, near-verbatim,
  four separate times across the diagnosis/causation/therapy sections: *"A vital step in solving
  critical appraisal exercises related to the exam is mastering the technique of drawing a 2X2
  table... Please note that a wrongly drawn table will produce incorrect results."*
- The guide's "Diagnostic accuracy — core formulas" and "What each observational design can and
  cannot calculate" tables both assume the reader already knows how to orient a 2x2 table
  correctly (TP/TN/FP/FN, A/B/C/D) but never states the T-column/E-column mnemonic that the book
  uses to teach this. This is a quick, concrete, high-yield addition (it is literally a memory aid
  the source already provides) that is currently nowhere on the page.

### 2. OR / RR / Attributable Risk — "Range of Values" reference table
**Status: entirely missing table (EMI-matching material).**
- Book p.11 gives a compact reference table (titled "Measures / Range of values") that the guide
  has no equivalent of:
  - Probabilities (exposure rates): 0–1
  - Absolute risks: 0–1
  - **Attributable Risk: −1 to +1** (the only one of these six measures that can be negative;
    −1 means the risk is greater in the *non-exposed* group)
  - Relative risk: 0 to infinity (<1 = risk in exposed is less than non-exposed; =1 = no causal
    association)
  - Odds: 0 to infinity
  - Odds ratio: 0 to infinity
- This is classic EMI-matching fodder ("which of the following statistics can take a negative
  value?") and is currently absent — the guide's causation tables give formulas but never state
  the permissible range for any of these measures.

### 3. Named nomograms — only 1 of 3 covered
**Status: partially covered — Fagan and NNT nomograms both missing by name.**
- The book names three distinct nomograms as recognisable diagrams:
  1. **Fagan / Bayesian nomogram** (p.7) — "Method 2: Using Bayesian nomogram (Fagan) to
     calculate post-test probability" — a graphical alternative to the arithmetic
     pre-test-odds → post-test-odds → post-test-probability method. The guide's "Evaluating
     Diagnosis" section thoroughly covers the arithmetic (Method 1) but never names or describes
     the Fagan nomogram itself, even though it is explicitly named in the source and is a natural
     "identify this diagram" EMI item.
  2. **NNT Nomogram** (p.20) — named directly under the RCT appraisal checklist ("NNT can also be
     calculated from tables and nomogram... NNT Nomogram"). Not mentioned anywhere in the guide.
  3. **Altman's nomogram** (p.26–27, for sample size/power) — this one *is* captured, in the
     "Recommendations & Guidelines" section.
- As it stands, a candidate reading only the web page would recognise Altman's nomogram but not
  the other two named diagrams the same book presents alongside it.

### 4. Likelihood-ratio conclusive-use threshold (LR >10 / <0.1)
**Status: missing fact.**
- Book p.6: *"LR >10 or <0.1 can be used conclusively to use or avoid a diagnostic tool
  respectively."* This specific numeric rule of thumb is absent from the guide's "Diagnostic
  accuracy — core formulas" table, which gives the LR+/LR− formulas but no interpretive cut-off
  for when an LR is strong enough to be clinically decisive.

### 5. "Rare disease assumption" (OR≈RR when prevalence <5%) never given its own citation
**Status: reasonably covered but the core rule is buried, not stated directly.**
- Book p.9 and p.11 state directly: *"if a disease is very rare (prevalence <5% arbitrarily),
  then odds ratio approximates RR."* This is one of the single most frequently tested
  OR-vs-RR distinctions in Paper B statistics questions.
- On the web page, this fact is only ever mentioned obliquely, inside one question-bank-derived
  `gap` note about case-control study efficiency ("books/15-3-statistics.pdf states the related
  'rare disease assumption'... but not this specific efficiency rationale") — it is referenced in
  passing, not stated as its own directly-cited fact anywhere in "Evaluating Causation." A reader
  skimming that section for "when does OR approximate RR" would not find a clear answer.

### 6. Missing worked example — CBT vs IPT RCT (p.19–20)
**Status: entirely missing worked example, distinct skill from the one that is covered.**
- The book's "Evaluating Therapy" chapter has *two* full worked numeric examples. Only one made
  it onto the page:
  - **Covered**: risperidone vs placebo, new-onset hyperlipidaemia (p.18) — CER=5%, EER=20%,
    ARR=15%, NNH=7, RR=4, RRR=−3 (i.e. 3-fold relative increase in harm). This is captured
    correctly in the guide's "Worked ARR/NNT/NNH/RR/RRR examples" gap note.
  - **Missing**: a second worked example (p.19–20), an RCT comparing CBT vs IPT (*Br J Psychiatry*
    2007;190:496-502), which builds its own 2x2 table from raw responder counts rather than being
    handed CER/EER directly — Responders 41 (control/IPT) / 51 (CBT) = 92; Non-responders 50/35 =
    85; totals 91/86/177. From this: EER=51/86=0.59, CER=41/91=0.45, RR=0.59/0.45=**1.31**; odds
    of responding on CBT = 51/35=**1.45**; ABI(old)=0.14, NNT(old)=1/0.14≈**7**; with F=0.5
    (local response rate is half the trial's), NNT(new)=NNT(old)/F=**14**.
- This second example exercises a genuinely different exam skill (constructing the 2x2 table from
  raw counts, then applying the F-fraction NNT adjustment) and is not reproduced anywhere on the
  page — the "gap" note that flags the missing question-bank worked examples cites only the first
  (risperidone) example from the book as already covered, and omits this second one entirely.

### 7. Forest plot — "line of no difference" placement rule (1 vs 0)
**Status: missing distinction.**
- Book p.22: *"As this is a ratio measure (similar to OR), the line of no difference is placed on
  the value 1. (Note that if the final estimate is standardised mean or Cohen's d effect size,
  then the line of no difference will be placed on 0.)"*
- The guide's forest-plot paragraphs (in "Evaluating Meta-analysis") describe squares, weights,
  arrowheads, and the pooled diamond in detail, but never state this rule — a natural SBA/EMI
  distractor (a candidate might assume the "line of no difference" is always at 1, or always at 0,
  regardless of what statistic is being plotted).

### 8. Kaplan-Meier curve precision and "median survival can mislead" traps
**Status: two related, book-stated traps missing.**
- Book p.2/p.14: *"In most survival curves, the earlier stages of follow-up usually include
  results from more patients than the later periods... which means that the survival curves are
  more precise in the earlier periods, indicated by narrower confidence bands around the
  left-hand parts of the curve."* Not present anywhere in "Evaluating Prognosis" — a genuinely
  counterintuitive fact (most candidates would assume longer follow-up = more reliable estimate,
  when in fact the *later* part of a KM curve is the *less* precise part, owing to fewer
  patients still at risk/more censoring).
- Book p.2 (figure caption): *"Three different curves with variable median survival times but
  comparable survival at the end period."* This explicitly illustrates that two survival curves
  can report very different median survival times while ending up with similar overall/long-term
  survival — a direct trap against over-relying on median survival time as a single summary
  statistic. Not present in the guide.
- Related structural point: the book frames prognostic-study appraisal as a named 3-question
  framework — *"1. Are the results valid?"* (sample representativeness, similarity of prognostic
  factors, completeness of follow-up, objectivity of outcome criteria) / *"2. What are the
  results?"* (the KM curve itself, plus the precision point above) / *"3. How can I apply the
  results to patient care?"* (similarity of patients/context, adequate follow-up length). The
  guide's single condensed paragraph ("Appraising a prognostic study: was the sample
  representative...") captures the content of question 1 and part of question 3, but flattens
  away the framework's own 3-part structure and drops question 2 (the precision point above)
  entirely.

### 9. Grimshaw & Russell (1993) guideline-effectiveness table
**Status: entirely missing table.**
- Book p.25 gives a named, referenced 4×3 table (*"Modified from Grimshaw & Russell 1993... The
  Lancet 342, 1317-1322"*) mapping four levels of guideline effectiveness against how the
  guideline was developed / disseminated / implemented:
  - **Highly effective**: developed by those who will use them; specific educational intervention
    (e.g. focused meeting); patient-specific reminder during consultation (e.g. filed in the
    notes, learning package with credits)
  - **Above average**: intermediate — modified national or external guidelines; continuing
    medical education (e.g. lecture, lunchtime meeting); patient-specific feedback
  - **Below average**: external, not by those who use them but still local; mailing target
    groups; general feedback (e.g. gross audit)
  - **Very low effectiveness**: external, national guidelines; publishing in a journal; general
    reminder
- The guide keeps only the "highly effective" row, flattened into a single sentence
  ("Guidelines are most effectively implemented when developed by those who will use them,
  disseminated through a specific educational intervention, and reinforced by patient-specific
  reminders...") — the other three rows, the table structure itself, and the Grimshaw & Russell
  citation are all dropped. This is exactly the kind of comparison table that shows up as an EMI
  ("match the implementation strategy to its likely effectiveness level").

### 10. The 4-question guideline-validity checklist
**Status: missing named checklist (its individual pieces are scattered, not assembled).**
- Book p.24–25 states directly: *"In order to check if guidelines are valid we can ask 4
  questions: 1. Did all relevant patient groups, management options and outcomes get considered?
  2. Is there a proper systematic review? 3. Is there an appropriate specification of values and
  preferences associated with outcomes? 4. Do the authors indicate the strength of
  recommendations?"*
- This exact 4-item checklist never appears as a single block on the web page. Only fragments of
  it surface as unrelated paragraphs elsewhere ("a systematically reviewed evidence base is the
  most important component," "guidance is also value-based") — the checklist's own structure
  (4 numbered questions, of the kind the exam tends to ask "which of the following is NOT one of
  the 4 questions...") is absent.

### 11. Decision-analysis utility/probability scale anchors and QALY link
**Status: reasonably covered but missing the specific scale values.**
- Book p.24: probabilities in a decision tree range *"0 – impossible to 1 – absolutely certain"*;
  utility values assigned to each final outcome range *"0 – death to 1 – full health (can be
  calculated using QALYs etc.)"*; the total value of each decision branch is the *"cross product
  of utility and probability with summing of individual outcomes."*
- The guide's decision-analysis paragraph correctly describes decision nodes (squares), chance
  nodes (circles), and "a utility value... to calculate the option with the best expected value,"
  but drops the specific 0/1 scale anchors and the QALY link entirely — a candidate reading only
  the web page would not know that a decision-tree utility of 0 specifically means death, or that
  QALYs are the named tool used to derive these values.

### 12. Meta-analysis "advantages" and the GIGO principle
**Status: entirely missing.**
- Book p.21 has its own explicit "Advantages of Meta-Analysis" heading, listing: (1) **increased
  statistical power** over individual RCTs; (2) the ability to **clarify the direction of
  literature** when individual RCTs give contradictory results (either revealing an underlying
  unifying conclusion or exploring the reasons for the contradiction).
- The same page states, under "Critically important aspects": *"No amount of statistical technique
  can improve the fundamental quality of the data being combined for the meta-analysis. This is
  sometimes referred to as garbage in-garbage out (GIGO) principle."*
- None of this — including the named **GIGO** acronym, which is exactly the kind of memorable,
  quotable term the exam favours — appears anywhere in the guide's "Evaluating Meta-analysis"
  section, even though that section is otherwise the most thoroughly developed one on the page
  (26 blocks, drawing on the full Evaluating Meta-Analysis and Interpreting Graphs sub-banks).

### 13. Citation/attribution issues found while cross-checking numbers
**Status: verified discrepancies, not omissions — flagged per the "cross-check numbers" instruction.**
- The "Cohort Studies — Attributable Risk Formulas" table (Evaluating Causation section) cites
  both of its worked-example rows solely to `books/15-3-statistics.pdf, page 10`. Page 10 of the
  book contains only the bare formulas (AR = AR-exposed − AR-non-exposed; PAR = ARR × proportion
  exposed) — **neither worked example is actually on that page**. Both numbers are reconstructed
  from the question bank instead: the "25/200 vs 10/200 over 8 years → AR = 0.075" example is
  `question_bank/EBM/Evaluating Causation_ Attempt review.pdf`, page 14, question 12 (elderly
  depressed patients followed for dementia); the "AR=20/100, 25% exposed → PAR = 1/20" example is
  the same file, page 22, question 19 (smokers/cognitive impairment). The arithmetic in both rows
  is correct — only the source attribution is incomplete/misleading, since it implies both
  numbers are printed on the cited book page when they are not.
- Separately, the "Population attributable fraction (PAF, Levin's formula)" `gap` block (also in
  Evaluating Causation) cites `question_bank/EBM/Evaluating Causation_ Attempt review.pdf, page
  22, questionNumber 19` — but that question (verified directly against
  `content/questions/evidence-based-medicine.json`) is the smokers/cognitive-impairment **PAR**
  question above (answer `1/20`), not a PAF question at all. The actual PAF/Levin's-formula
  worked example (relative risk of suicide in depression = 10, prevalence of depression = 5% →
  PAF ≈ 0.31, explicitly citing Levin ML, *Acta Unio Internationalis Contra Cancrum* 1953) is a
  **different** question: page 19, question 16. This is a genuine wrong citation, not a
  formatting nitpick — a reader clicking through to check this specific fact would land on the
  wrong question and see a different number (1/20 instead of 0.31) with no obvious connection to
  Levin's formula.
- Minor, lower-stakes note: the "SnNout, SpPin" mnemonic block is marked `"sourced": false` (i.e.
  presented as an invented memory aid, per this app's mnemonic-labelling rule), but the terms
  themselves — including the exact "S'N'Out... S'P'In" phrasing and the "will pick up cases only
  if definitive evidence is noted" / "makes more false positive inclusions" explanations — are
  printed verbatim in a box on book p.4. This isn't a fabrication risk (the underlying fact is
  correct either way), but it is under-citing something that could carry a real page reference.

---

## Overall Coverage-Quality Verdict

This is a well-built guide, not a thin one — the underlying book is short (40 pages, largely
formula tables and worked examples rather than prose) and the guide already tracks nearly every
formula, checklist, and worked example the book contains, on top of pulling in all 239
question-bank items across all 9 EBM sub-banks with extensive, well-targeted trap callouts. No
book subsection is entirely unaddressed. The gaps found are a specific, countable list — roughly
a dozen missing items: two reference tables (2x2-table-orientation mnemonic is a table-adjacent
memory aid, and the OR/RR/AR "range of values" table), one comparison table (Grimshaw & Russell
guideline-effectiveness), two named diagrams (Fagan/Bayesian nomogram, NNT nomogram), one
numeric threshold (LR >10/<0.1), one core rule that's referenced but never directly stated (OR≈RR
rare-disease assumption), one missing worked example (CBT vs IPT), a handful of specific traps
(forest-plot line-of-no-difference at 1 vs 0, KM-curve early-period precision, median-survival
can-mislead), one named checklist (4 guideline-validity questions), the GIGO/meta-analysis
advantages framing, and one genuine wrong citation (PAF gap block pointing at the wrong question
number). This calls for roughly 10–12 new/corrected blocks, concentrated in "Evaluating
Meta-analysis," "Evaluating Causation," "Evaluating Prognosis," and "Recommendations &
Guidelines" — not a rebuild, and nowhere near the scale of missing content found in the Adult
Psychiatry review.
