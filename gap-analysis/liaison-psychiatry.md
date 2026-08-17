# Gap Analysis: mrc-psych-lake (web) vs SPMM Source PDF
## Liaison Psychiatry — What's Missing, From an Exam Standpoint

**Purpose of this document:** compare the live study guide page
(`content/study-guides/liaison-psychiatry.json`, 24 sections) against the actual text of the
source book (`resources/paper-b/books/7-3-liaison-psychiatry.pdf`, extracted verbatim in
`content/notes/liaison-psychiatry.json`, 30 printed pages), fact-by-fact, to find anything the web
page omits, understates, or mis-states relative to the source.

**Context that shapes this report**: this is one of the densest, best-covered guides in the corpus.
The book has three major numbered sections — "1. Specialist advice to medical specialities" (A–E:
PMS/PMDD, MI & depression, endocrine/metabolic, palliative care, renal medicine, plus a second
unlettered "other medical disorders" block: Lyme disease, SLE, insulinoma, neurosarcoidosis,
metachromatic leucodystrophy, neuroacanthocytosis), "2. Psychiatric aspects of brain diseases"
(A–K: MS, stroke, epilepsy, Parkinson's, Huntington's, Wilson's, TGA, Fahr's, HSE, Meige, TBI), and
"3. Pain, Fatigue and Sleep" (A: sleep disorders, B: CFS, C: chronic pain, D: HIV/AIDS psychiatry,
1–10). The guide maps every one of these named subsections to its own guide section (1–19), then
adds five further guide sections (20–24) built entirely from question-bank material with no
book-page equivalent (somatoform/factitious/dissociative disorders, DSH/suicide risk, perinatal
psychopharmacology, cross-cutting neuropsychiatry pitfalls, and a self-declared coverage-gaps
list) — all correctly flagged as `gap` blocks rather than presented as book fact.

Because of this, the finding pattern here is closer to Perinatal Psychiatry's than to Adult
Psychiatry's: **there are no entirely-missing named subsections at the book's own heading level** —
every lettered subsection has corresponding guide content, most of it thorough (CFS alone runs 15
blocks with two comparison tables). What's missing instead is one genuinely absent named
disease entity within an otherwise-covered subsection (Acromegaly), one named drug/treatment fact,
one named evidence-base list, one nosology/classification detail, and a scatter of individual
sentences dropped during condensation. Every "missing" item below was verified against the literal
`pdftotext -layout` output of the cited page, not just the corrupted note-block text, and every
retained figure was cross-checked between the two sources for exact-number agreement.

---

## Section-by-Section Gap Findings

### 1. A. Premenstrual Syndrome & PMDD (book p.2–3) — Guide Section 1
**Status: well covered but missing several concrete, testable facts:**
- **Missing: the ICD/DSM classification history of PMDD.** The book states: *"ICD includes
  'premenstrual tension syndrome' under the heading 'Diseases of the Genitourinary Tract'. Severe
  PMS was classified as premenstrual dysphoric disorder (PMDD) in DSM-IV under 'depressive disorder
  not otherwise specified' along with a description attached to appendix B. With mounting evidence
  for its construct validity, it has been moved to the main text as a diagnosis in DSM-5."* None of
  this classification/nosology history — which ICD chapter PMS sits under, or that PMDD only
  reached DSM-5's main text after a DSM-IV appendix-B "NOS" placement — appears anywhere in the
  guide's PMDD section; it jumps straight to the DSM-5 criteria themselves.
- **Missing: Alprazolam use in premenstrual insomnia/anxiety.** The book's treatment paragraph
  includes the standalone line *"Alprazolam can [be] used with caution in premenstrual insomnia and
  overwhelming anxiety"* — a distinct, specific drug-and-indication fact that doesn't appear
  anywhere in Guide Section 1 (the guide covers SSRIs, intermittent dosing, and hormonal suppression,
  but not this benzodiazepine option).
- **Missing: the symptom-timing pattern within a cycle.** The book states: *"During each cycle, PMS
  symptoms generally last for few days to 2 weeks. The peak is 2 days before the start of menses.
  Women tend to have the same pattern of symptoms in each cycle."* This entire timing detail (peak
  2 days pre-menses; duration a few days to 2 weeks; pattern is consistent cycle-to-cycle) is absent
  from the guide.
- **Minor: the Dimmock (2000) meta-analysis confidence interval is dropped.** The guide reports "OR
  6.91" but not the book's full figure — *"an odds ratio of 6.91 (3.90 to 12.2)"* — losing the CI
  that would distinguish a genuine recall question about the meta-analysis from a guess.

### 2. B. Myocardial Infarction and Depression (book p.4) — Guide Section 2
**Status: reasonably covered but missing three of five named clinical trials:**
- **Missing named trials: CREATE, COPES, and the Women's Hearts Study.** The book names five
  specific trials testing whether treating depression reduces cardiac events post-MI: *"the
  Enhancing Recovery in Coronary Heart Disease (ENRICHD) study for CBT, the Myocardial Infarction
  and Depression Intervention Trial (MIND-IT), the Canadian Cardiac Randomized Evaluation of
  Antidepressant and Psychotherapy Efficacy [CREATE] for interpersonal therapy, a problem-solving
  therapy trial called the COPES, and a trial evaluating CBT based stress management (Women's Hearts
  Study)."* The guide's corresponding paragraph names only ENRICHD and MIND-IT (and separately
  SADHART). CREATE, COPES, and the Women's Hearts Study — three named trials, each tied to a
  distinct therapy modality (interpersonal therapy, problem-solving therapy, CBT stress management)
  — are missing entirely. This is exactly the kind of named-trial detail MRCPsych favours for
  exact-recall/EMI-matching questions ("which trial tested interpersonal therapy post-MI?").
- **Status otherwise strong**: SADHART's design, RR (0.77, 95% CI 0.51–1.16), and the CHF-depression
  prevalence/mortality figures (21.5%, ~19% meeting formal MDD criteria, 2:1 relative mortality) all
  match the book (and question-bank explanation, for the 19% figure) exactly.

### 3. C. Endocrinology and Metabolic Disorders (book p.5–6) — Guide Section 3
**Status: reasonably covered but with one entire named condition missing:**
- **Entirely missing: Acromegaly.** The book has its own bolded subheading: *"Acromegaly: Occurs as
  a result of growth hormone excess. Psychiatric symptoms include mood lability, personality change,
  and depression. Psychosis may be due to treatment with dopamine agonists such as bromocriptine."*
  This condition — with its own aetiology (GH excess), symptom triad (mood lability, personality
  change, depression), and a specific iatrogenic-psychosis mechanism (dopamine agonist treatment,
  named drug bromocriptine) — does not appear anywhere in Guide Section 3 or anywhere else in the
  guide. Every other endocrine condition on the same book page (hyperthyroidism, hypothyroidism,
  hyper-/hypoparathyroidism, Cushing's, Addison's, pheochromocytoma, diabetes) is covered; Acromegaly
  alone was dropped.
- **Status otherwise strong**: hypothyroidism M:F ratio (1:6), the calcium-level-graded parathyroid
  symptom thresholds (10–14 mg/dL vs >14 mg/dL), and the Cushing's/Addison's/pheochromocytoma/
  diabetes figures all match the book exactly.

### 4. D. Palliative Care (book p.6) — Guide Section 5
**Status: well covered.** Depression prevalence (5–15% plus 10–15% subthreshold), delirium
prevalence (44% rising to 62% near death), and the specific antidepressant guidance (SSRIs weak
evidence, amitriptyline for neuropathic pain but avoid if high delirium risk, lofepramine,
psychostimulants for patients with only weeks to live) all match the book exactly. No gaps found.

### 5. E. Renal Medicine (book p.6–7) — Guide Section 4
**Status: well covered**, including a dedicated dose-adjustment table matching the book's drug list
(lorazepam, diazepam, imipramine/amitriptyline, citalopram, paroxetine, fluoxetine/fluvoxamine,
sertraline, haloperidol, amisulpride, risperidone, lithium) and uraemic
encephalopathy/dialysis-disequilibrium-syndrome content. No gaps found.

### 6. Other Medical Disorders (Lyme, SLE, insulinoma, neurosarcoidosis, MLD, neuroacanthocytosis) (book p.7–8) — Guide Section 6
**Status: well covered but with a few dropped clinical details:**
- **Missing: metachromatic leucodystrophy's specific age/mortality figures per subtype.** The book
  states the late-infantile form's children *"die by age 5"* and the juvenile form onset is *"between
  3–10 years of age"* — neither of these specific figures appears in the guide's MLD paragraph
  (which keeps the adult-onset-schizophrenia-like-psychosis 60% figure but drops the infantile/
  juvenile staging detail).
- **Missing: neuroacanthocytosis's gait description.** The book states: *"A peculiar gait is
  characterized by lurching with long strides, and quick, involuntary knee flexion is seen."* This
  distinctive clinical sign (useful for a "which disorder does this gait describe" vignette
  question) is absent from the guide's neuroacanthocytosis paragraph.
- **Status otherwise strong**: SLE, insulinoma, and neurosarcoidosis content (including the 20%
  depression figure and erythema nodosum sign) all match the book.

### 7. A. Multiple Sclerosis (book p.9–10) — Guide Section 7
**Status: well covered but missing a specific named disease-modifying drug:**
- **Missing: Glatiramer acetate (Copaxone) treatment detail.** The book states: *"Glatiramer acetate
  is used as a neuroprotective agent and an immunomodulator and is used to reduce the frequency of
  relapses in relapsing-remitting multiple sclerosis. It is sold under trade name Copaxone and is
  administered by subcutaneous injection at a dose of 20 mg per day. Cannabinoids are not licensed
  but may be available as a named patient basis."* None of this — the drug name, its trade name, its
  mechanism (neuroprotective/immunomodulator), its dose (20mg/day subcutaneous), or the cannabinoid
  licensing status — appears in the guide, which otherwise covers MS epidemiology, course
  percentages, depression, mania, psychosis, pathological laughing/crying, and cognitive impairment
  thoroughly (including two already-correct trap entries on the 1/3rd steroid-mania figure and the
  interferon-alpha-vs-beta distinction).
- **Status otherwise strong**: all MS course percentages (5–10% primary progressive, 20–30%
  relapsing-remitting, 60% secondary progressive), the 40–50% depression lifetime prevalence, the
  20% ECT relapse-risk figure, and the suicide statistics (3% over 6 years, 15% over 16 years, ~30%
  cross-sectional ideation) match the book exactly.

### 8. B. Stroke (book p.9–11) — Guide Section 8
**Status: well covered**, including a dedicated prevalence table matching the book's Chemerinski &
Robinson (2000) figures exactly (depression 35%, anxiety 25%, apathy/emotional incontinence/
catastrophic reaction each 20%) and the 2012 Intercollegiate stroke-guideline bullet points. No
gaps found against the book (the guide's two `gap`-flagged additions on lesion-location specifics
and vascular-depression presentation are correctly attributed to the question bank, not the book).

### 9. C. Epilepsy (book p.11) — Guide Section 9
**Status: well covered**, including the Dilley & Fleminger (2006) prevalence table (depression
30–50%, panic 20%, psychosis 3–7%), the pseudoseizure-vs-epilepsy discriminator list (built into
both a comparison table and a mnemonic), and the >1000 IU/l postictal prolactin threshold with its
15-minute measurement window. No gaps found against the book.

### 10. D. Parkinson's Disease (book p.12) — Guide Section 10
**Status: well covered**, including the full Dilley & Fleminger (2006) prevalence table (70% any
psychiatric symptom, 40–50% depression, 2%/10% hypomania/euphoria, 50–65% anxiety, 40% drug-related
psychosis, 19%/25–40% cognitive impairment/dementia) reproduced exactly, plus correctly-flagged
depression/cognitive-impairment risk factors. No gaps found against the book.

### 11. E. Huntington's Disease (book p.12–13) — Guide Section 11
**Status: well covered**, including the CAG-repeat penetrance table (≤35 unaffected, 36–40
incomplete/~95% penetrant even at 36–39, ≥41 full penetrance), the chromosome-4-short-arm location,
and the 60%-of-onset-variation figure, all matching the book exactly. No gaps found.

### 12. F. Wilson's Disease (book p.13) — Guide Section 12
**Status: well covered.** Every figure checked matches the book exactly: 20% exclusively
psychiatric presentation, 50% mental disturbance at some point, cognitive impairment up to 25%,
depression 30%, suicidal behaviour 4–16%, psychosis ~2% (Ring & Serra-Mestres 2002), and the
Kayser-Fleischer ring prevalence table (95% with neurological symptoms / 50–60% without / 10% of
asymptomatic siblings), including the "giant panda sign" MRI description. No gaps found.

### 13. G. Transient Global Amnesia (book p.14) — Guide Section 13
**Status: well covered.** The full diagnostic-criteria list, the incidence figures (5–10/100,000/yr
rising to 30/100,000 over age 50), and the hypoperfusion aetiology (temporal/parietotemporal,
left-hemisphere-predominant) all match the book. No gaps found.

### 14. H. Fahr's Disease (book p.14) — folded into Guide Section 12
**Status: well covered.** The age-related symptom split (onset 20–40 → schizophreniform
psychosis/catatonia; onset 40–60 → dementia/choreoathetosis), the 50% psychiatric-problem figure,
and the 0.9% incidental-calcification-on-CT figure all match the book. No gaps found.

### 15. I. Herpes Simplex Encephalitis (book p.14–15) — Guide Section 14
**Status: well covered.** The 70%-HSV-1 figure, the ~95% CSF PCR sensitivity/specificity, the
untreated (~70%) vs. treated (20–30%) case-fatality figures, the 14-day minimum treatment duration,
and the Kluver-Bucy-syndrome link all match the book exactly. No gaps found.

### 16. J. Meige Syndrome (book p.15) — folded into Guide Section 12
**Status: reasonably covered but missing several descriptive clinical details:**
- **Missing: the fuller symptom spectrum and compensatory behaviours.** The book states: *"Some
  patients have lip pursing or tongue movements and, for a few, the movements spread into the
  shoulders... At times, there is a joint interactive movement between the oral movements and the
  eye movements... Patients may chew gum, whistle or touch their face in an effort to lessen the
  movements."* The guide's Meige paragraph keeps only "repetitive blinking and chin thrusting" plus
  the demographic/secondary-cause facts — the additional symptom variants (lip pursing, tongue
  movements, shoulder spread), the oral-ocular movement interaction, and the distinctive
  compensatory behaviours (chewing gum, whistling, touching the face) are all missing. The
  compensatory-behaviour detail in particular is a classic vignette clue that could identify the
  diagnosis without the syndrome being named directly.

### 17. K. Traumatic Brain Injury & Post-Concussion Syndrome (book p.15–17) — Guide Section 15
**Status: well covered but with one blurred nuance:**
- **Blurred: the persistence rate of post-concussion symptoms.** The book states: *"At least 50%
  experience some post-concussion symptoms that recover completely within 3 months of injury,
  except in nearly a third."* i.e., of those with symptoms, roughly a third do **not** fully recover
  by 3 months (persistent post-concussion syndrome). The guide's paraphrase — *"At least 50% recover
  fully within 3 months"* — reads as a straightforward recovery-rate statement and drops the "except
  in nearly a third" persistence clause, losing the fact that a substantial minority go on to
  develop persistent symptoms (relevant to differentiating "PCS resolves in the great majority" from
  the more nuanced true figure).
- **Status otherwise strong**: the PTA/severity/outcome table, the poor-prognosis risk factors, the
  9%-mania-with-right-temporal-injury and ~2.5%-post-injury-schizophrenia figures, and the
  post-traumatic epilepsy rates (5% closed / 30% open) all match the book exactly.

### 18. A. Sleep Disorders (book p.18–21) — Guide Section 16
**Status: well covered but with one clinical entity under-detailed:**
- **Under-detailed: Bruxism.** The book gives Bruxism its own clinical paragraph: *"Bruxism is
  considered as a stereotyped movement disorder or rhythmic disorder. It is more frequent during the
  early part of sleep and may be related to stress and/or anxiety or dentition abnormalities or
  stimulants use. Bruxism is not limited to sleep but may also occur while the child is awake. Basal
  ganglia dysfunction has been hypothesized."* The guide mentions bruxism only once, as a category
  label ("Other parasomnias include bruxism and enuresis") with none of this clinical detail
  (stress/anxiety and dentition-abnormality associations, occurrence while awake in children, or the
  basal-ganglia-dysfunction hypothesis) reproduced anywhere.
- **Status otherwise strong**: narcolepsy's four-symptom tetrad with individual prevalence figures
  (cataplexy 75%, sleep paralysis 30%, hypnagogic hallucinations, all four in only 10%), the
  HLA-DQB1*0602 association, RLS's diagnostic criteria and 3–15% (median 7.2%) prevalence, and the
  initial/middle/terminal insomnia classification all match the book exactly.

### 19. B. Chronic Fatigue Syndrome (book p.18/21–24) — Guide Section 17
**Status: very well covered (15 blocks, two comparison tables) but missing one named structured
list:**
- **Missing: the "Components of CBT for CFS (Prins et al., 2006)" list.** The book presents this as
  its own boxed, titled list of six components: *"Explanation of aetiological model; Motivation for
  CBT; Challenging and changing of fatigue related cognition; Achievement and maintenance of basic
  amount of physical activity; Gradual increase in physical activity; Rehabilitation (e.g., rigorous
  self-monitoring, a safety behaviour in social phobia, can feed to the core symptoms)."* This is a
  named, citable list (same format as the correctly-reproduced "Predictors of Poor Outcome (Powell
  et al., 2004)" list elsewhere in the same guide section) but doesn't appear anywhere in the guide —
  the CBT paragraph only paraphrases "targeting cognitive/behavioural drivers" without the six
  discrete components or the Prins 2006 citation.
- **Status otherwise strong**: every prevalence, prognosis, and comorbidity figure checked (0.23–
  0.42% US / 2.6%→0.5% UK prevalence, 33%/33% work-impact split, 17–65%/<10%/10–20% five-year
  prognosis bands, 23%/50–75% depression comorbidity, CBT-vs-GET 70%/55% improvement rates, the
  CFS-vs-depression serotonergic-direction/HPA-axis/sleep comparison table) matches the book
  exactly, including the already-flagged NICE NG206 currency caveat.

### 20. C. Psychiatric Aspects of Chronic Pain (book p.25) — Guide Section 18
**Status: well covered.** The DSM-5 Somatic Symptom Disorder reframing, the pain/depression
comorbidity figures (10–15% depression among pain patients, 43% of depressed adults reporting pain
— Ohayon & Schatzberg 2003), the atypical facial pain (Frazier & Russell 1924) description, and the
BAP/Cleare (2015) SNRI-vs-SSRI guidance all match the book exactly. No gaps found.

### 21. D. Psychiatric Aspects of HIV Infection (book p.25–30) — Guide Section 19
**Status: very well covered (22 blocks) but missing the section's own headline epidemiological
figure:**
- **Missing: overall lifetime psychiatric-morbidity prevalence in HIV.** The book opens this section
  with: *"Prevalence of any mental disorder in the lifetime of HIV-positive patients is 38 to 73%."*
  This top-line figure — the single broadest epidemiological statistic in the entire HIV/AIDS
  subsection, and a natural first-line exam fact ("what proportion of HIV-positive patients will
  have a psychiatric disorder at some point?") — does not appear anywhere in Guide Section 19, which
  otherwise goes on to cover every specific disorder (acute stress reaction, adjustment disorder,
  anxiety, depression, psychosis, mania, delirium, AIDS dementia complex with CSF markers and
  secondary organic causes, and antiretroviral psychiatric side effects) in detail.
- **Status otherwise strong**: the depression figures (40%/30–60% lifetime), mania-as-most-common-
  reason-for-hospitalisation ordering, AIDS dementia complex incidence figures (3% at diagnosis, 7%/
  year in the first 2 years, 15% over the disease course), the primary/secondary/reactive
  three-way organic classification, and the antiretroviral side-effect figures (efavirenz 46%
  neuropsychiatric effects, 2% psychosis, ~6% discontinuation) all match the book exactly, and the
  guide's own "reference list currency" flag on this section (1990s–2000s sources, pre-cART) is an
  accurate self-assessment, not an omission.

### 22–24. Somatoform/Factitious/Dissociative, DSH/Suicide Risk, Reproductive & Perinatal
Psychopharmacology, Cross-Cutting Neuropsychiatry Pitfalls, and Coverage Gaps & Flags — Guide Sections 20–24
**Status: correctly and transparently sourced, not a book-vs-guide gap.** None of these five guide
sections has any corresponding book-page content — the SPMM book stops at the HIV/antiretroviral
section — and every block in them is explicitly marked `gap`, sourced only to `question_bank/`
files, with an honest note that the material comes from question explanations rather than the
book. This is the guide correctly extending exam-relevant coverage beyond a book that doesn't
address these areas, not a fidelity problem; nothing here was checked against
`content/notes/liaison-psychiatry.json` because there is nothing there to check it against.

---

## Numerical cross-check summary

Every headline figure appearing in both the book and the guide was checked against the literal
`pdftotext -layout` text of its source page. **No numerical discrepancies were found** — every
percentage, ratio, dosing figure, and named citation retained by the guide (Ramamurthy 2013, Welton
2009, Nicholson 2006, Dimmock 2000, Chemerinski & Robinson 2000, Dilley & Fleminger 2006, Ring &
Serra-Mestres 2002, Wessley et al. 1998, Deale et al. 2001, Stubhaug et al. 2008, Powell et al.
2004, Craufurd 2001, Markowitz 1998, and the Intercollegiate stroke guideline 2012) matches the
book exactly, including several figures that would be easy to mis-transcribe (Dimmock's OR 6.91,
SADHART's RR 0.77/95% CI 0.51–1.16, the CAG-repeat penetrance bands, the Kayser-Fleischer ring
percentages by patient group, and the CFS 17–65%/<10%/10–20% five-year prognosis split). The one
apparent "extra" figure investigated — the guide's "~19% meet formal MDD criteria" addition to the
book's 21.5% CHF-depression prevalence — was verified as a genuine, correctly-merged question-bank
figure (`question_bank/Clinical Parts_ Paper B/MCQs Liaison Part 1_ Attempt review.pdf`, p.10, Q8),
not a fabrication.

---

## Overall coverage-quality verdict

This is one of the **strongest guides in the corpus** relative to its 30-page source book — closer
to Perinatal Psychiatry's near-complete coverage than to the situation that triggered the Adult
Psychiatry rewrite. There are **zero entirely-missing named subsections** at the book's own
heading level (every A–K/1–10 lettered or numbered subsection maps to guide content), and **zero
numerical discrepancies** in any figure the guide attributes to the book. The gaps found are
narrow and concrete: **one entirely missing named condition** (Acromegaly, with its own bolded book
subheading and a distinct GH-excess/dopamine-agonist-psychosis mechanism), **one missing named drug
treatment** (Glatiramer acetate/Copaxone for MS), **one missing named structured list** ("Components
of CBT for CFS," Prins et al. 2006), **one missing nosology/classification detail** (PMDD's
ICD/DSM-IV history), and roughly half a dozen further individual-sentence or single-fact losses
(the PMS symptom-timing pattern, alprazolam in PMS, three named cardiac trials — CREATE, COPES,
Women's Hearts Study — missing from an otherwise five-trial list, MLD's infantile/juvenile staging
figures, neuroacanthocytosis's gait description, Meige syndrome's fuller symptom/compensatory-
behaviour picture, Bruxism's clinical detail, and the HIV section's own headline 38–73%
lifetime-prevalence figure). Fixing this topic is a matter of adding roughly 10–12 small facts
and one drug/list callout to the existing sections — not a rewrite, and not comparable in scale to
the Adult Psychiatry gap analysis that prompted this review.
