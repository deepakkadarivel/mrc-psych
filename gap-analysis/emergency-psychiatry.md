# Gap Analysis: mrc-psych-lake (web) vs SPMM Source PDF
## Emergency Psychiatry — What's Missing, From an Exam Standpoint

**Purpose of this document:** This compares every fact, table, and figure in
`resources/paper-b/books/7-4-emergency-psychiatry.pdf` (21 pages, extracted verbatim into
`content/notes/emergency-psychiatry.json`) against what currently renders on the live Emergency
Psychiatry study-guide page (`content/study-guides/emergency-psychiatry.json`). Unlike the Adult
Psychiatry audit that triggered this exercise, this topic's source book is short (21 pages, 5
numbered sections) and the existing guide is unusually thorough — it already carries 39
question-bank citations as `trap`/`gap` blocks on top of the book content. The findings below are
therefore narrower: no whole missing subsections, but several concrete missing differential-
diagnosis rows, one mis-sorted fact, one table that got flattened into prose (losing its
EMI-matching shape), and one juxtaposition of two book statements that reads as contradictory if
not explained.

---

## Section-by-Section Gap Findings

### 1. Common Emergencies — Syndrome Classification (book p.2)
**Status: reasonably covered but miscategorised —**
- The book's page-2 bullet list places **Intoxication/Withdrawal syndromes** under the
  **"General syndromes"** heading, alongside Suicidality, Agitation, Confusion, Starvation,
  Catatonia and Disinhibition — it is a sibling of those six, not of the "Iatrogenic issues" list
  (Acute dystonia, NMS, Serotonin syndrome, Lithium toxicity, Clozapine-related agranulocytosis).
  The live page's "Framework & Common Emergency Syndromes" section (both the `paragraph` block and
  its `concise` bullet) instead groups "intoxication/withdrawal syndromes" together with the
  iatrogenic list — e.g. "...iatrogenic issues (acute dystonia, **NMS**, serotonin syndrome,
  **lithium** toxicity, **clozapine**-related agranulocytosis, intoxication/withdrawal)." This is a
  genuine mis-sort of a book fact into the wrong group, not just an omission — per this project's
  own category-assignment rule, which grouping does someone will get asked about (e.g. an EMI
  "which of these is/isn't iatrogenic" style item).

### 2. Differential Diagnosis — Agitated Patient (book p.3)
**Status: table present but incomplete — 3 of the book's ~13 clue→diagnosis pairings are missing entirely, and one pairing is conflated:**
- Missing row: **"Self-harming and/or suicidal patient" with low mood, past history of depression,
  hopelessness → Mood disorders (esp. depression)**. This is one of the book's explicit
  differential entries and doesn't appear anywhere in the live table.
- Missing row: **Memory disturbance, disorientation, disinhibition, other cognitive difficulties →
  Dementia**. Also absent from the table.
- Missing row: **Impaired intelligence, other stereotypic behaviour patterns → Autistic self-injury
  or injury related to learning/communication difficulties**. Also absent.
- Conflated row: the book actually gives **two separate** diagnoses for two **separate** clue-sets
  that the live table has merged into one row ("Disorientation, ataxia, autonomic dysfunction,
  hallucinations → Medical/neurological cause, metabolic/electrolyte disturbance or infection").
  In the source, "acute confusion, known physical frailty, associated signs of
  metabolic/electrolyte disturbances or infections" maps to **Medical/Neurological syndromes**,
  while "disorientation, impaired consciousness, ataxia, autonomic dysfunction, hallucinations"
  is a **separate** clue-set mapping to **Intoxication/Withdrawal of alcohol and/or other
  substances** — two distinct EMI-style options collapsed into one, losing the
  intoxication/withdrawal differential from this table altogether.
- Dropped alternate diagnosis: the book pairs "Intense fear, shortness of breath, palpitations,
  autonomic manifestations" with **both** "Panic attack" **and** "Generalized anxiety" as
  co-equal answers; the live table keeps only "Panic attack."

### 3. Differential Diagnosis — Catatonic Patient (book p.4)
**Status: table present but missing one row:**
- Missing row: **"Impaired intelligence, other stereotypic behavior patterns" → Autism /
  Neurodevelopmental disorders.** The live "Catatonic patient — differential diagnosis" table has
  5 rows; the book has 6, and this is the one dropped.

### 4. Differential Diagnosis — Starving Patient (book p.4)
**Status: fully covered.** All 6 book rows (anorexia nervosa, psychotic depression,
schizophrenia, manic neglect, NMS, OCD with food-related obsessions) are present and correctly
matched. No gap here.

### 5. Suicide Epidemiology (book pp.5–8)
**Status: reasonably covered, one juxtaposition risks a genuine misread —**
- The book states in two places, without reconciling them, that (a) "the highest rate of suicide
  is among people aged over 75 years" (p.5) and (b), in the National Confidential Enquiry table,
  that the age-band trend is ">65 declining, 15–24 increasing" (p.7). These are two different
  concepts — (a) is the absolute rate level, (b) is the direction of change over time — but a
  reader could easily conclude "suicide risk in the elderly is falling, so young people are now
  the higher-risk group," which is not what the source supports (over-75s still have the single
  highest absolute rate; it is that rate's *trend* that is declining). The live guide reproduces
  both facts in adjacent paragraphs of the same section but never flags the "declining rate ≠
  lower absolute risk" distinction as a trap, even though this is exactly the kind of
  counter-intuitive juxtaposition the book itself creates. This would be a natural
  `trap`/`trap-list` addition, not a paragraph rewrite.
- All other epidemiology figures spot-checked against the book match exactly: global mortality
  share (1–2%, 1 in 6000/year), England & Wales rate (1%, 8/100,000/yr), method-by-sex splits
  (men: hanging ~40%/overdose ~20%/car-exhaust ~10%; women: overdose 46%/hanging ~27%/drowning
  7%), M:F ratio 2–4:1, peak ages 15–24 (F) / 25–34 (M), and all named citations (Brock &
  Griffiths 2003; Conwell 2002; Harwood 2000a/2001b; McClure 2000; Hawton 1999a; Shaffer 1974;
  Hawton 2000; Malmberg 1999) are preserved. No numerical discrepancies found.

### 6. National Confidential Enquiry Data (book p.7)
**Status: every individual fact is present, but the table itself is gone —**
- The book presents this as a clean, 21-row, two-column "Description / Rates" table — exactly the
  shape MRCPsych favours for EMI matching questions (e.g. "match the description to its rate").
  The live guide has flattened every one of these 21 facts correctly into a sequence of
  `paragraph` blocks (verified figure-by-figure: 1-in-6000 global rate, 2–4:1 M:F, age peaks,
  hanging/overdose as commonest methods, 30–31%/17–24% diagnosis split, 40–60% prior DSH, 30%
  DSH-repeat, 25% MH-service contact, 25% outpatient register, 25%/50% alcohol involvement,
  12.5%/33%/66%/40% health-contact timing figures, hanging/belt/curtain-rail inpatient method,
  25%/80%/20% inpatient-suicide figures, 25%/40%/"1 in 500–1000" post-discharge figures, 22%
  preventability). No individual number is missing or wrong. But none of it is rendered as an
  actual `table` block — it's prose. Given this project's own stated view that "the book is dense
  with comparison/evidence tables; these are natural EMI-matching material," this specific table
  is the single best EMI candidate in the whole topic and it currently has no table-block
  equivalent on the page.

### 7. Suicide Risk Assessment (book pp.10–12)
**Status: fully covered.** Clinical indicators of high intent, the four risk-factor groupings
(demographic/background/psychological/current-context), the SAD PERSONS table and mnemonic, Beck
Hopelessness Scale (0–3/4–8/9–14/15–20 bands) and Beck Scale for Suicidal Ideation (0–48, no
defined cut-offs), the four-question risk-management framework, and the adolescent
suicide/self-harm "FACT FIGURE" table (all age-banded prevalence figures: 0.8%/6.2%/7.5% for
5–10s, 1.2%/9.4%/8–13%/18.8% for 11–15s, <13% hospital-attention rate, 6.9% for 15–16s, 5% of
under-16 A&E self-harm attendees) are all present and numerically match the source, including
correctly flagging the source's own internal duplicate-label artifact ("proportion that self-harm
at least once a week," listed twice with two different values on p.12) as unreliable rather than
picking one number to quote. No gap.

### 8. Managing Agitation & Rapid Tranquilisation (book p.13)
**Status: fully covered.** Dangerousness/violence risk factors, the two-step
management approach (safety/de-escalation first, pharmacology second-line), the drug/dose table
(lorazepam 1–2mg, haloperidol 5mg, olanzapine IM 5–10mg, promethazine 25–50mg PO max 100mg) and
the side-effect/immediate-action table (bradycardia, acute dystonia → procyclidine/benztropine,
respiratory depression → flumazenil/ITU, hypotension → lie flat/raise legs) all match the source
exactly. No gap.

### 9. Managing Catatonia & NMS (book p.14)
**Status: fully covered.** Subtypes (withdrawn vs agitated/excited), organic/neurological
differentials, lorazepam 1–2mg IM/IV dosing, and the NMS emergency protocol (stop the drug,
supportive care, dantrolene 2–3mg/kg or bromocriptine 2.5–10mg TDS after ITU transfer) all match.
No gap.

### 10. Managing Confusion (book p.14)
**Status: fully covered.** Environmental-optimisation-first approach and the exact haloperidol
dosing (0.5mg elderly, repeat after ≥2 hours; 2mg oral in adults) both match the source precisely.
No gap.

### 11. Managing Self-Neglect/Starvation (book p.15)
**Status: fully covered.** The self-neglect risk-factor list (advanced age, social isolation,
medical morbidity, dementia/depression/alcoholism, poverty/illiteracy, paranoid personality, loss
of caregiver, bereavement, sensory impairment), the four-part assessment (ADLs, environment,
cognition, physical exam plus formal capacity assessment), and the anorexia management pathway
(metabolic/endocrine/acid-base work-up, nutrition/hydration first-line, ECT for psychotic
depression with severe self-neglect/catatonia, NG feeding in anorexia) all match. No gap.

### 12. Legislative Aspects (book pp.16–18)
**Status: fully covered.** Capacity-to-refuse-treatment principles, the Section 2/3/4/5(2)/5(4)
table (durations: 28 days / 6+6+12-monthly / not stated in source / 72 hours / up to 6 hours — the
guide correctly flags Section 4's duration as genuinely unstated in the book rather than
back-filling it from general knowledge), the five MCA 2005 principles, and the two-stage capacity
assessment (impairment test → decision-specific test; four abilities: understand/retain/weigh/
communicate) all match the source exactly. No gap.

### 13. Crisis Resolution & Home Treatment (CRHT) Teams (book pp.19–20)
**Status: reasonably covered, one minor sentence dropped —**
- The book's final sentence on this topic ("Interventions follow standard psychiatric practice
  with a comprehensive initial assessment followed by standard medication and psychosocial
  interventions," p.20) doesn't appear anywhere in the live guide's CRHT section. It's a
  low-yield, generic sentence rather than an exam fact, so this is a minor omission, not a
  meaningful gap — flagged for completeness only.
- Everything else — the four-point rationale for home treatment, the full list of key
  characteristics (multidisciplinary, community-based, same-day response, gate-keeping role,
  24-hour availability, response within 1 hour, up to 4x-daily medication administration, daily
  review), and the <2-month typical duration of care — is present and matches.

---

## Overall Coverage-Quality Verdict

Emergency Psychiatry is **thin in a handful of specific, fixable spots, not broadly thin**. This is
a short 21-page book and the existing guide has clearly already been built carefully — it tracks
every named citation, correctly declines to state figures the source doesn't support (Section 4
duration, the OCR-duplicated adolescent self-harm figure), and layers in 39 question-bank
citations as `trap`/`gap` blocks with real added value (Palmer 2005's revised 5.6% schizophrenia
suicide figure, the BAP 2020 NMS escalation ladder, Tiihonen 2006's antidepressant-age risk data,
etc.). There are **no entirely missing subsections and no missing named trials** from the book
itself. The concrete, fixable gaps are: **4 missing differential-diagnosis table rows** across two
tables (3 in the agitated-patient table, 1 in the catatonic-patient table) plus one conflated row
and one dropped co-diagnosis in the agitated-patient table; **1 mis-sorted fact** (intoxication/
withdrawal filed under the wrong syndrome group); **1 structurally-lost table** (the 21-row National
Confidential Enquiry table, individually accurate but flattened into prose, losing its natural
EMI-matching shape); **1 unflagged trap** (the >75-highest-rate vs >65-declining-trend
juxtaposition); and one trivial dropped sentence in the CRHT section. Recommend: add the 4 missing
table rows, fix the syndrome-group mis-sort, convert the National Confidential Enquiry facts into
an actual `table` block, and add one `trap` block on the age-rate-vs-trend distinction — roughly
half a dozen small edits, not a rewrite.
