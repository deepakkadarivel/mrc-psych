# Gap Analysis: mrc-psych-lake (web) vs SPMM Source PDF
## Perinatal Psychiatry — What's Missing, From an Exam Standpoint

**Purpose of this document:** compare the live study guide page
(`content/study-guides/perinatal-psychiatry.json`, 13 sections) against the actual text of the
source book (`resources/paper-b/books/7-2-perinatal-psychiatry.pdf`, extracted verbatim in
`content/notes/perinatal-psychiatry.json`), fact-by-fact, to find anything the web page omits,
understates, or mis-states relative to the source.

**Context that shapes this report**: this source book is short — only 11 printed pages, with
exactly three headed sections ("1. Mental illness and pregnancy", "2. Pharmacological treatment
in pregnancy", "3. Pharmacological treatment and breastfeeding"). The current study guide
subdivides these three book sections into 13 finer-grained guide sections and substantially
enriches them with question-bank material (42 SBA questions), each clearly flagged as a `gap`
block when it isn't sourced to the book. Because of this, the finding pattern here is different
from Adult Psychiatry's: there are **no entirely-missing named subsections** — every book heading
has corresponding guide content — but there is a consistent pattern of **individual sentences and
one data table dropped during condensation**, most of them concrete, nameable, single-fact losses
rather than large content blocks. Every "missing" item below was verified against the literal
`pdftotext -layout` output of the cited page, not just the corrupted note-block text.

---

## Section-by-Section Gap Findings

### 1. Mental illness and pregnancy (book p.2) — maps to Guide Sections 1–2
**Status: reasonably covered but missing several concrete facts:**

- **Missing figure: "80% are mood disorder (mainly depression)".** The book states: *"A
  significant increase in new psychiatric episodes in first 3 months of the postpartum period. 80%
  are mood disorder (mainly depression)."* The guide's "headline figures" table (Section 1) keeps
  only the vague half of this sentence — "New psychiatric episodes — Significant increase in the
  first 3 months postpartum" — and drops the 80%-mood-disorder figure entirely. This is a
  clean, quotable statistic that is easy to test as a standalone fact ("what proportion of new
  postpartum psychiatric presentations are mood disorders?") and isn't in the guide anywhere.
- **Missing aetiological explanation for antenatal depression risk.** The book explains *why*
  pregnancy-related depression is common: *"This may be due to hormonal, social, personal changes
  and emotional stress"* and separately notes prevalence *"may be higher in developing nations"*
  (with the antenatal-depression paragraph citing O'Keane & Marsh 2007 by name). None of this
  appears in Guide Section 1 — only the bare prevalence percentages are kept, not the aetiology
  framing or the named reference.
- **Missing: susceptibility of schizoaffective disorder to postpartum psychosis risk.** The book's
  sentence on the 20-fold postpartum psychosis risk continues: *"Women with the schizoaffective
  disorder are also susceptible."* This clause is dropped in Guide Section 2's corresponding
  paragraph — the guide keeps the 20-fold figure but not which additional diagnostic group beyond
  bipolar disorder is named as susceptible.
- **Missing item from the maternal-risks list: "poor judgement".** The book's untreated-illness
  risk list for the mother is: *"Increased risk of suicide, alcohol & substance misuse, poor
  compliance with perinatal appointments, unhealthy lifestyle (poor diet, lack of exercise,
  increased smoking), poor judgement, impulsive acts & impaired self-care."* The guide's "Maternal
  Risks of Untreated Psychiatric Illness" table lists only: Suicide, Substance misuse, Poor
  compliance, Unhealthy lifestyle, Impulsivity, Impaired self-care — "poor judgement" is dropped as
  its own row, and "unhealthy lifestyle" is left unexpanded (the book's own parenthetical detail —
  poor diet, lack of exercise, increased smoking — never appears anywhere in the guide).
- **Missing sentence, entirely: substance misuse in pregnancy.** The book states: *"Substance
  misuse in pregnancy leads to increased intrauterine deaths, congenital, cardiovascular &
  musculoskeletal anomalies, & foetal alcohol syndrome."* This entire sentence — a distinct,
  specific, highly testable list of substance-misuse consequences (intrauterine death, three named
  anomaly categories, foetal alcohol syndrome) — does not appear anywhere in the guide. It isn't
  folded into the "Foetal Risks of Untreated Psychiatric Illness" table (which only has Low birth
  weight / Small head circumference / Preterm birth, i.e. the *mental-illness*-related foetal risks,
  not the *substance-misuse*-related ones) or anywhere else.

### 2. Postpartum (Puerperal) Psychosis & Bipolar Relapse — Guide Section 2
**Status: well covered.** Cross-checked every figure (0.1–0.25% general population; 50% bipolar
disorder; 50–90% recurrence after prior episode; ~1 per 1000 births incidence; 1-in-4 pregnancy
recurrence rate; 20-fold lifetime RR in first postpartum month; 8-fold bipolar relapse RR in first
postpartum month; 10–25% mother–infant relationship disorder rate) against the book text — all
match exactly. Only gap is the schizoaffective-disorder clause noted under Section 1 above (the
sentence it belongs to is split across the guide's Sections 1/2 boundary).

### 3. Pharmacological Treatment in Pregnancy — General Principles (book p.3) — Guide Section 3
**Status: reasonably covered but missing one general-principles bullet:**

- **Missing: "Refer to specialist perinatal services if necessary."** The book's general
  principles list reads: *"Involve midwives, obstetricians and health visitors. Refer to specialist
  perinatal services if necessary."* The guide's corresponding paragraph keeps "involve midwives,
  obstetricians and health visitors" but drops the referral-to-specialist-perinatal-services
  instruction entirely — a genuine, distinct clinical-governance point (as opposed to routine
  multidisciplinary involvement) that could be tested as "what should happen if general
  multidisciplinary involvement isn't sufficient?"
- The verbatim Kohen (2004) / Maudsley (2007) quotes on bipolar maintenance ("maintenance
  strategies should involve dosage reduction...", "discontinuation of mood stabilisers... only
  when absolutely necessary...", "for women who have had a long period without relapse...") are
  paraphrased rather than quoted, but the substantive content is preserved — flagged here only
  because SPMM sometimes tests these as verbatim EMI/quote-matching items; worth keeping in mind
  if quote-matching questions for this topic ever surface.

### 4. Antidepressants in Pregnancy (book p.3–4) — Guide Section 4
**Status: reasonably covered but missing one whole drug-class sentence:**

- **Missing: "Other antidepressants" teratogenicity statement.** The book states: *"Other
  antidepressants: Limited data on moclobemide, venlafaxine, reboxetine, Bupropion and mirtazapine
  suggests the absence of teratogenicity."* None of these five named drugs (moclobemide,
  venlafaxine, reboxetine, bupropion, mirtazapine) appear anywhere in Guide Section 4's
  pregnancy-teratogenicity coverage — the guide covers TCAs, SSRIs, paroxetine/fluoxetine/
  sertraline specifically, and MAOIs, but skips this "other antidepressants" catch-all sentence
  entirely. This is a plausible EMI-style "which of these antidepressants has NOT been linked to
  teratogenicity" distractor set that currently has zero coverage.
- All cross-checked figures matched exactly: 13.3% spontaneous abortion increase with SSRIs
  (also mirtazapine/bupropion), ~1 week reduced gestational age, ~175g lower birth weight,
  paroxetine/VSD/ASD link, fluoxetine's evidence base, sertraline's low placental exposure.

### 5. Lithium in Pregnancy (book p.3, p.5, p.7) — Guide Section 5
**Status: thoroughly covered, no gaps found.** Every figure cross-checked matches exactly: 1-in-10
malformation risk with 1st-trimester continuation; ~3-fold overall malformation RR / ~8-fold
cardiac malformation RR (Williams & Oke, 2000); Ebstein's anomaly 10–20x RR, 1:1000 absolute risk,
1:20,000 general-population baseline (Cohen et al., JAMA 1994); 2–6 week post-conception peak risk
window; up to 70% relapse risk within 6 months of stopping; screening at 6 and 18 weeks' gestation
(Maudsley 2007); the full lithium-management table (Kohen 2004/Maudsley 2007). This is the
best-covered section of the guide — the mnemonic ("3-8-10/20-1:1000-1:20,000") accurately
compresses the book's own figures with no invented numbers.

### 6. Anticonvulsant Mood Stabilisers — Valproate, Carbamazepine, Lamotrigine (book p.3–6) — Guide Section 6
**Status: thoroughly covered, no numerical discrepancies found.** Valproate's 7.2% overall
malformation risk (Maudsley/NICE), the North American registry's ~10% figure, the 1–2% neural
tube defect risk, the 42%/22% verbal-IQ figures (Adab et al., 2004), the 30% vs 3–6% special
educational support figures (Breen & Davenport, 2006), carbamazepine's 0.5–1% spina bifida risk
and 11%/26%/20% craniofacial/nail/developmental-delay cohort figures, and lamotrigine's 3.2%
malformation frequency all match the book exactly. The guide's own added question-bank layer
(Maudsley 14th ed./BAP 2017 figures alongside the book's 9th-ed. figures) is well-flagged as a
version discrepancy rather than silently overwritten — this is good practice, not a gap.

### 7. Antipsychotics, Anticholinergics & Benzodiazepines in Pregnancy (book p.3, p.6) — Guide Section 7
**Status: reasonably covered but missing one named drug:**

- **Missing: promethazine.** The book's final sentence on this page reads: *"Note: Promethazine is
  widely used as sedative in pregnancy but data is limited."* This named drug and its
  data-limitation caveat do not appear anywhere in Guide Section 7 (or anywhere else in the guide)
  — a plausible distractor/option in a "which sedative has the most/least pregnancy safety data"
  EMI-style question.
- All other figures checked match: 2–2.4% low-potency antipsychotic 1st-trimester malformation
  risk, California Child Health Development Project (~19,000 births), 0.6% benzodiazepine oral
  cleft/CNS/urinary risk.

### 8. ECT in Pregnancy (book p.3, p.7) — Guide Section 8
**Status: thoroughly covered, no gaps found.** All anaesthetic-consideration points (barbiturates/
atropine and foetal heart rate, uterine muscle non-contraction during seizure, oestrogen/
progesterone effects on seizure threshold, delayed gastric emptying/aspiration risk) are present
and accurately attributed.

### 9. Breastfeeding — General Principles & Pharmacokinetics (book p.8) — Guide Section 9
**Status: reasonably covered but missing two substantial factual passages:**

- **Missing entirely: the colostrum/hindmilk/foremilk distinction.** The book states: *"Colostrum
  will have greater concentration of protein-bound drugs and hind milk will have greater
  concentration of lipid soluble drugs compared to foremilk."* This specific pharmacokinetic
  distinction — which milk stage concentrates which drug type — does not appear anywhere in the
  guide. It is exactly the kind of two-column comparison fact ("protein-bound → colostrum" /
  "lipid-soluble → hind milk") that MRCPsych EMI questions favour, and it's currently absent, not
  even as a paraphrase.
- **Missing entirely: the risk/benefit-analysis factor list for the breastfeeding decision.** The
  book gives an explicit list: *"Severity and frequency of mental illness, benefits of
  breastfeeding, impact of untreated maternal illness on infant and mother, level of family
  support, compliance with treatment, patient's and family's ability [to] recognise early warning
  signs, physical health and maturity of the infant, support from statutory and voluntary
  organis[ations]."* None of these eight factors are reproduced in the guide — the guide keeps the
  10%-threshold rule and the milk/plasma-ratio rule from the same page, but drops this list
  entirely.
- The 10% infant-plasma "safe" threshold and the milk/plasma ratio >1 rule are both correctly
  captured and cited.

### 10. Breastfeeding — Antidepressants & Antipsychotics (book p.8–9) — Guide Section 10
**Status: reasonably covered but missing one data table:**

- **Missing table: median time-to-maximum breast-milk concentration.** Book page 9 contains a
  genuine (if OCR-garbled) side-table: *"Median Time to maximum concentration in the milk after
  maternal ingestion: Moclobemide — 3 hours; Olanzapine — 5 hours; Sertraline — 7–10 hours; peak
  level have not been reported for paroxetine or fluoxetine."* Confirmed present in the actual PDF
  via a direct `pdftotext -layout` re-extraction of page 9 (not just the note-block text) — this is
  a genuine table, not an extraction artefact. It does not appear anywhere in the guide, despite
  being exactly the kind of "drug → number" fact this guide's own `ConciseFact`/table format is
  built to hold. This is the single clearest "missing table" finding for this topic.
- **Missing: "No studies of MAOIs or bupropion use in breastfeeding are available."** The book
  states this explicitly, immediately beside the Tmax table above. The guide's only bupropion
  mention (in a `gap` block sourced to the question bank) instead reads *"bupropion is avoided
  where possible (case reports of infant seizure)"* — the book's own, more basic claim ("no studies
  available" — i.e., an absence-of-evidence statement, not a specific case-report claim) is never
  stated, and the two framings sit in some tension without the guide flagging it as a discrepancy
  the way it does elsewhere (e.g. the sertraline-vs-paroxetine milk/plasma-ratio conflict is
  explicitly flagged; this one is not).
- All other figures (preferred TCAs, doxepin/N-desmethyldoxepin accumulation, sertraline as US
  first-line, paroxetine's lower milk/plasma ratio, haloperidol/chlorpromazine/perphenazine safety,
  clozapine contraindication) match the book exactly.

### 11. Breastfeeding — Mood Stabilisers & Sedatives (book p.8, p.10) — Guide Section 11
**Status: thoroughly covered, no gaps found.** Lithium (40–50% excretion, up to 200% infant
serum), valproate (undetectable–40%), carbamazepine (5–65%), lamotrigine (~30%), and the
benzodiazepine-by-half-life distinctions (diazepam/alprazolam avoided, temazepam/oxazepam mostly
safe, clonazepam apnoea risk, zolpidem safe, buspirone/zaleplon/zopiclone avoided) all match the
book's figures exactly.

### 12. Premenstrual Syndrome (PMS) & PMDD — Guide Section 12
**Status: correctly and explicitly flagged by the guide itself as entirely absent from the book.**
This entire section is sourced only to question-bank explanations (di Scalea & Pearlstein 2019,
Carlini & Deligiannidis 2020, Oxford Handbook of Psychiatry) — the book
(`7-2-perinatal-psychiatry.pdf`) contains no PMS/PMDD content whatsoever, and the guide says so in
its own closing `gap` block. This is not a hidden gap; it's a disclosed one, and no further action
is needed beyond what the guide already recommends (verify against current Maudsley 15th ed./NICE
guidance).

### 13. Coverage Gaps & Flags — Guide Section 13
**Status: accurate self-assessment.** The guide's own closing section correctly identifies (a) the
9th-ed. vs 14th-ed. Maudsley/BAP version discrepancies for valproate/carbamazepine risk figures,
and (b) the absence of a dedicated EMI question-bank file for this topic. Both are genuine,
correctly described limitations, not gaps introduced by condensation.

---

## Numerical cross-check summary

Every headline figure that appears in both the book and the guide was checked against the literal
`pdftotext -layout` text of its source page (not the corrupted note-block text or the guide's own
paraphrase of it). **No numerical discrepancies were found** between what the book states and what
the guide reports as coming from the book — all percentages, fold-increases, ratios, and named
citations (Williams & Oke 2000, Cohen et al. 1994, Adab et al. 2004, Breen & Davenport 2006, Kohen
2004/2005, Maudsley 2007) match exactly. Where the guide juxtaposes a book figure against a
question-bank figure from a newer edition (valproate 7.2% vs ~10%; carbamazepine spina bifida
0.5–1% vs 0.3–0.5%), this is done transparently with both sources cited — a deliberate,
well-flagged design choice, not an error.

---

## Overall coverage-quality verdict

This is a **strong, near-complete guide** relative to an unusually short 11-page source book — very
different from the Adult Psychiatry situation that triggered this review. There are no entirely
missing named subsections and no numerical errors in already-covered facts. The gaps found are
consistently small, individual-sentence losses from condensation (roughly a dozen concrete missing
facts: the 80%-mood-disorder figure, the antenatal-depression aetiology/O'Keane & Marsh citation,
the schizoaffective-disorder susceptibility clause, "poor judgement" and the unhealthy-lifestyle
detail, the substance-misuse-in-pregnancy consequences sentence, the "refer to specialist perinatal
services" instruction, the "other antidepressants" teratogenicity sentence, promethazine, the
colostrum/hindmilk/foremilk distinction, the breastfeeding risk/benefit factor list, and the
bupropion "no studies available" statement) plus **one genuine missing data table** (median
time-to-maximum breast-milk concentration for moclobemide/olanzapine/sertraline/paroxetine/
fluoxetine on book page 9). Fixing this topic is a matter of adding roughly 10–12 small facts and
one small table to the existing sections — not a rewrite.
