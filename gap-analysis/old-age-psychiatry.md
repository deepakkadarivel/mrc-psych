# Gap Analysis: mrc-psych-lake (web) vs SPMM Source PDF
## Old Age Psychiatry — What's Missing, From an Exam Standpoint

**Purpose of this document:** compares `content/study-guides/old-age-psychiatry.json` (what
actually renders on the deployed Old Age Psychiatry page) against the full extracted text of
`resources/paper-b/books/8-1-old-age-psychiatry.pdf` (`content/notes/old-age-psychiatry.json`),
block by block, to find condensation losses — whole subsections, named studies, tables, or
"trap" facts from the source that never made it into the web page. Unlike the Adult Psychiatry
review that triggered this exercise, this guide turns out to be a genuinely thorough
reformatting of the book (27 sections, essentially one per book subsection, plus three
question-bank-only sections) — there is no entirely-missing top-level subsection. The gaps found
here are narrower but still real: two whole tables the book presents explicitly, several named
citations/figures dropped during compression, and a handful of counter-intuitive "trap" facts
the book states outright that never surface in the guide's own trap blocks.

---

## Section-by-Section Gap Findings

### 1. Demographics, Service Provision & Carers
**Status: reasonably covered but missing:**
- **The RCPsych "Needs based criteria for Older People's Mental Health Services" box is entirely
  absent.** The book prints this as a distinct sidebar with three named criteria: (1) people of
  any age with a primary dementia; (2) people with a mental disorder **and** physical
  illness/frailty that contributes to or complicates management of the mental illness (may
  include people under 65); (3) people with psychological/social difficulties related to ageing
  or end-of-life issues who may be best served by an older-people's service — "this would
  normally include people over the age of 70." The specific **>70** age threshold in criterion 3
  is exactly the kind of number an SBA/EMI distractor set would hinge on ("at what age would a
  service normally start considering someone for old-age MH services?") and it isn't in the
  guide anywhere.
- **The book's own "10 key points from JCPMH Guidance for commissioners" list is only half
  reproduced.** The guide's JCPMH paragraph covers points 4 (need not age), 5 (functional illness
  as well as dementia), 8 (community crisis/home treatment access), 9 (respond well to
  psychological input) and 10 (dedicated liaison services) — but omits point 1 (older people will
  form a larger proportion of the population), point 2 (older people's services particularly
  benefit from an **integrated approach with social care**), point 3 (need to work closely with
  **primary care and community services**), point 6 (older people often have a **combination of
  mental and physical health problems**), and point 7 (services must be **multidisciplinary**).
  As a named 10-point list this is squarely EMI/"which of the following is NOT one of the 10
  points" material, and 5 of the 10 are currently unrecoverable from the page.
- **"Average spending for retired households is nearly double that for non-retired households"**
  — the book's one concrete economic figure tying ageing demographics to NHS impact — is dropped
  entirely.

### 2. Psychological Aspects of Physical Disease
**Status: reasonably covered but missing:**
- The book's **"Emotional reaction to illness and chronic ill health"** subsection is reduced to
  a single sentence about depression prevalence. Specifically missing: that the reaction to
  illness depends on **premorbid personality, perceived threat of the illness, treatment required
  and experience of treatment**; that anxious patients can develop pathological anxiety due to
  increased focus on physical sensations and morbid interpretation of them; that **metabolic
  changes during illness (dehydration, electrolyte imbalance, endocrine changes, infection) can
  accentuate the emotional response**; and that **adjustment disorders are common following
  physical illness and are by their nature transient**. None of these four specific points appear
  anywhere in the guide.

### 3. Dementia Syndromes — Reversible & Intracranial Causes
**Status: reasonably covered.** Numbers checked and matched: NPH population prevalence **0.4%**
(Trenkwalder et al 1995), 50%/50% idiopathic/secondary split, chronic SDH bilateral in **30%**,
head injury history in only **50%**, mortality **~10%**, alcohol-related dementia **12%** of
young-onset dementia. No material gap found in this section.

### 3B. Secondary Dementias & Prion Diseases
**Status: reasonably covered but missing:**
- **Basic prion protein biology is missing.** The book states the normal prion protein (**PrP**)
  is coded by the **PRNP gene on chromosome 20** and has an unknown normal function, with disease
  occurring when it misfolds into an insoluble form. This gene-locus fact is exactly the style of
  detail this guide otherwise tabulates for Alzheimer's genetics (chromosome 1/14/19/21) — but
  the PRNP/chromosome-20 locus for prion disease itself never appears.
- **Sporadic CJD's worldwide prevalence figure — "around 0.1 cases per 100,000" — is missing.**
  The guide's prion table calls sCJD "commonest human prion disease" but never gives the actual
  prevalence figure stated in the book.
- **CJD neuroimaging findings are entirely absent.** The book states: CT shows atrophy of the
  cortex (worse frontally) and atrophy of the cerebellum; MRI may show non-specific **basal
  ganglia hyperintensities** (high signal in the putamen and caudate head), seen only in a
  proportion of cases and **not part of the diagnostic criteria**. Every other dementia subtype in
  this guide (AD, vascular) gets its own imaging table; sporadic CJD's CT/MRI findings are the one
  dementia imaging profile that never made it in.

### 3C. Alzheimer's Disease — Epidemiology, Genetics, Diagnosis, Imaging & Psychosis
**Status: reasonably covered.** This is one of the most thoroughly reproduced parts of the guide
— genetics table, risk/protective factor tables, cognitive scales table (all 8 book tests: AMTS,
MMSE, CAPE, DRS, ACE, NPI, CAMCOG, Clock Drawing), imaging table, BPSD prevalence table, and
misidentification syndromes are all present with matching figures. One minor drop: the book's
explicit stepwise risk figure **"5% at age 65"** (between the stated 1% at 60 and 40% at 85) isn't
separately restated — derivable from "doubles every 5 years" but not given as its own recall
figure the way the source states it.

### 4. Antidementia Drugs
**Status: reasonably covered.** Mechanism table, dosing table, CSM/Duff (2004) vs Herrmann (2004)
contrast, and comorbidity-based drug choice are all present and match the book's figures. No
material gap found.

### 5. Vascular Dementia
**Status: reasonably covered but missing:**
- **The Hachinski Ischaemic Score's interpretation cut-offs are missing.** The guide reproduces
  every line item and point value of the 13-item scale correctly, but drops the book's own
  scoring guidance: **"score < 4 unlikely, score > 7 likely to be vascular dementia"** (with
  scores in between indeterminate/mixed). Reproducing every point value but not the cut-off that
  makes the score clinically usable is a significant omission for a scale this exam-favoured.
- **The book's neurological-sign differentiation between small-vessel disease and cortical
  infarction is entirely missing.** The book states that measures of small vessel disease are
  associated with an increased prevalence of **dysarthria, dysphagia, Parkinsonian gait disorder,
  rigidity and hypokinesia**, whereas in the presence of a **cerebral infarct**, **aphasia, reflex
  asymmetry, hemianopia, hemisensory dysfunction and hemiplegic gait disorder** were more often
  observed (hemimotor dysfunction occurs with both). This is a natural EMI-matching pair and none
  of it appears in the guide, which only gives the median "4.5 signs per patient, reflex asymmetry
  49%" headline figures.

### 6. Dementia with Lewy Bodies
**Status: reasonably covered but missing:**
- **The Firbank et al (2003) SPECT finding is dropped.** The book reports that a SPECT blood-flow
  study found a *similar* pattern of deficits in PD dementia and DLB, with reduced perfusion of
  the **precuneus and parietal cortex** — a location associated with visual processing. The guide
  keeps the Colby/O'Brien/Walker (2004) "greater caudate involvement differentiates DLB" finding
  but strips out the author names and drops the separate Firbank finding entirely; readers are
  left with only one SPECT fact for DLB vs PD-dementia differentiation instead of two.

### 7. Dementia in Parkinson's Disease
**Status: reasonably covered.** Numbers checked and matched: 10%/year develop dementia, 78% over
8-year follow-up (Aarsland), McKeith 1996 12-month rule. No material gap beyond the SPECT citation
loss noted under DLB above (same underlying source paragraph).

### 8. Frontotemporal Dementia & Pick's Disease
**Status: reasonably covered.** Onset ranges, tau gene/chromosome 17q21-22, "knife-blade atrophy,"
PPA vs semantic dementia distinction, and the 10% MND-with-dementia figure are all present and
match. No material gap found.

### 9. Early-Onset Dementia & Progressive Supranuclear Palsy
**Status: reasonably covered.** No material gap found — PSP's full symptom cluster, the
Adam & Victor source reference for PSP (uncited in the guide, but this is a source-attribution
detail rather than a clinical fact), and the three familial-AD genes are all present.

### 10. Delirium
**Status: reasonably covered.** Prevalence figures by setting (general population 0.4%, hospital
admissions 9-30%, post-op 5-75%, ICU 12-50%, nursing homes up to 60%), the dementia-vs-delirium
table (all 9 rows), and the rating-scale table (DRS/MMSE/CTD/CAM) all match the book. No material
gap found.

### 11A. Depression — Epidemiology & Clinical Features
**Status: reasonably covered but missing:**
- **A whole named comparison table — the book's "Early onset Depression / Later onset
  depression" clinical-features table — has been compressed into a single sentence, losing
  essentially every named citation in it.** The book table (page 26) lists, by column: early-onset
  features include depressed cognitions/suicidal thoughts (Reinhard et al 2000), severe
  psychomotor retardation/agitation in up to 30% (Hickie et al 2001), higher rates of familial
  depression (Maier et al 1991), depressive delusions of poverty/physical illness/nihilistic
  content, greater familial morbidity for depression/alcoholism/sociopathy (Mandlewicz and Baron
  1981), paranoia and auditory hallucinations in severe depression (derogatory/obscene content),
  and weight loss (Janssen et al 2006); later-onset features include cognitive impairment in 70%
  of cases, anxiety/neuroticism (Baldwin 1995), psychological vulnerability (Vandenberg et al
  2001), severe life stress (Vandenberg et al 2001), greater frequency/severity of life events
  than the general population (Hughes et al 1988), and lifetime depressive/somatic symptoms as
  preclinical markers (Hein et al 2003). The guide's current sentence keeps only "severe
  psychomotor change up to 30%," "cognitive impairment ~70%," "higher familial loading" and
  "anxiety/neuroticism" — 6 of roughly 10 named findings (and every citation year except one) are
  gone. (Note for whoever rebuilds this: the book's own two-column layout is genuinely ambiguous
  after `pdftotext -layout` extraction — verify the early-vs-later column assignment against the
  actual PDF page 26 before reproducing it as a table, rather than guessing from the linear text
  order.)
- **The specific ethnic-comparison finding is missing**: "Elderly African Americans have been
  noted to have less depression than elderly Caucasians... possibly because they stay more engaged
  within their communities."

### 11B. Depression — Treatment & Prognosis
**Status: reasonably covered but missing:**
- **A whole table — the book's "Summary of Depression scales" — is completely absent from the
  guide.** The book (page 27) lists seven named scales with specific distinguishing features:
  **Geriatric Depression Scale** (15 items, 4-5 minutes, avoids somatic questions, cut-off score
  **>5**); **BASDEC** (Brief Assessment Schedule Depression Cards — designed for liaison
  psychiatry, particularly useful with **deaf** patients, true/false statement cards);
  **Hamilton Rating Scale** (general adult scale, has somatic items that make it less suitable
  for older patients, not a diagnostic tool); **MADRS** (sensitive to change, **not** reliably
  answered by patients with dementia); **Depressive Sign Scale** (9 items, designed to detect
  depression in people with dementia); **CSDD — Cornell Scale for Depression in Dementia** (the
  best-validated scale for dementia, better in mild/moderate than severe dementia,
  interviewer-administered using both patient and informant information, 4-5 factors on factor
  analysis); **PHQ-9** (9-item self-report, widely used in UK primary care, probably less
  validated in older subjects). The Alzheimer's section of this same guide reproduces an
  analogous cognitive-scales table in full — the equivalent depression-scales table is simply
  missing, despite being exactly the kind of "which scale for which scenario" EMI material this
  exam favours (e.g. CSDD for a demented patient, GDS to avoid somatic confounders, BASDEC for a
  deaf patient).
- **The Mitchell & Subramaniam (2005) finding on chronicity is dropped.** The book states that
  older adults were thought to be at greater risk of chronicity of depression than younger people,
  but this has been challenged: with control for confounding variables, **remission rates in late
  life are little different from midlife, but relapse rates appear higher** (Mitchell &
  Subramaniam, 2005). None of this — including the citation — appears in the guide.

### 12. Pseudodementia & Vascular Depression
**Status: reasonably covered.** The pseudodementia-vs-dementia table matches the book's 9 rows
exactly; vascular depression mechanisms, DWML findings and Simpson et al's ECT/delirium finding
are all present. No material gap found.

### 13. Bipolar Disorder in Old Age
**Status: reasonably covered.** 5-10% of mood disorders, 0.4% vs 1.4% one-year prevalence, mean
onset age 55, 2:1 F:M, lithium target range 0.4-0.6 mmol/L (Shulman 2002) all match. No material
gap found.

### 14. Late-Life Psychosis / Paraphrenia
**Status: reasonably covered.** Prevalence figures (10% of elderly psychiatric inpatients,
community 0.1-4%, incidence 10-26/100,000/year), symptom-prevalence table (90%/75%/60%/10-20%),
and the late-onset-schizophrenia feature list (Palmer 2001) all match. No material gap found.

### 15. Neurotic Disorders & Alcohol/Substance Misuse in Old Age
**Status: reasonably covered but missing:**
- **The specific standard "safe drinking" comparator figures are dropped.** The book states the
  general-population safe-drinking guideline is **up to 21 units/week for men and 14 units/week
  for women**, and explicitly argues this may be too high for older people (whose actual
  guideline is ~1 drink/day). The guide keeps only the older-adult "no more than one drink per
  day" figure and loses the general-population comparator numbers it's being contrasted against.
- **Chlordiazepoxide for alcohol withdrawal management is not named.** The book specifically
  states chlordiazepoxide can be used to treat withdrawal symptoms in older people; the guide's
  alcohol paragraph only names disulfiram, acamprosate, naltrexone and thiamine (the relapse
  prevention/prophylaxis drugs), never the withdrawal-management drug itself.

### 16. Suicide & Deliberate Self-Harm in Old Age
**Status: reasonably covered.** DSH vs completed-suicide gender-ratio distinctions, method
breakdowns, and the Duberstein (1994)/Harwood (2001) personality-trait findings all match the
book. No material gap found.

### 17. Personality Disorders in Old Age & Diogenes Syndrome
**Status: reasonably covered.** Cohen (1994) 6.6% vs 10.5% (OR 0.42) figures, Abrams (1999)
meta-analytic finding, and the 3.3% OCPD figure all match the book exactly. No material gap found.

### 18. Sleep Disorders in Later Life
**Status: reasonably covered but missing:**
- **"Advise re: driving (but do not need to inform DVLA)" is dropped from the insomnia management
  list.** This is precisely the kind of counter-intuitive regulatory fact ("do you need to tell
  DVLA about a sleep disorder/its treatment?") that MRCPsych likes to test, and it's stated
  outright in the book's own bullet list but doesn't appear anywhere in the guide, including its
  trap blocks.
- Minor: the book's specific figure that **transient insomnia symptoms are common (30-60%) in
  older adults, particularly elderly females** is not reproduced.

### 19. Psychosexual Disorders in Old Age
**Status: reasonably covered.** 10-20% impotence in men ≥70, 7% vs 18% (care home) inappropriate
sexual behaviour in Alzheimer's, and the ABC framework all match. No material gap found.

### 20. Psychotherapy & Bereavement in Old Age
**Status: reasonably covered.** Grief-phase structure, 10-20% first-year bereavement depression
figure, and the 14% vs 1-4% end-of-second-year comparison all match. Minor: the Parkes/Grace and
O'Brien citation for the finding that bereavement life events are more common in early-onset
depression (implying older people may cope better with bereavement despite facing it more) is not
named, though the underlying conclusion survives in paraphrase.

---

## Note on the guide's own self-flagged gaps

Section 27 ("Coverage Gaps & Flags") and the inline `gap` blocks scattered through sections 4, 7,
12, 25 and 26 already transparently document a separate category of gap: facts the **question
bank** tests but the **book never covers at all** (e.g. MCI-to-dementia conversion rate, normal
ageing brain-weight/ventricle changes, the DMR scale for intellectual disability, digoxin
toxicity, Barthel Index, aminophylline-lithium interaction, antipsychotic mortality risk in
dementia). These are correctly labelled as absent-from-the-book rather than silently invented, and
none of them overlap with the findings above — everything in this report is book content
(`content/notes/old-age-psychiatry.json`) that is genuinely in the source PDF but did not make it
into the guide. The two gap categories are complementary, not overlapping: the guide's own flags
are honest about what the *question bank* adds beyond the book; this report is about what the
*book* itself states that the guide still drops.

## Overall Coverage Verdict

This is, by a clear margin, a stronger starting point than the pre-rewrite Adult Psychiatry guide:
every top-level book subsection has *some* corresponding content on the page, all major named
scoring systems (Hachinski, NINCDS-AIREN, McKeith DLB consensus criteria, cognitive-scales table)
are present with matching figures, and three dedicated sections already absorb question-bank-only
material the book itself doesn't cover. The real gaps are narrower and fall into a
consistent pattern: **two whole tables lost during compression** (the Summary of Depression
Scales, and the Early- vs Late-onset Depression clinical-features table — both genuinely tabular
in the source and both currently unreproduced anywhere on the page), **a handful of named
citations/figures dropped when a paragraph was condensed** (Mitchell & Subramaniam 2005, Firbank
et al 2003, the PRNP/chromosome 20 locus, sporadic CJD's 0.1/100,000 prevalence, CJD's CT/MRI
findings, the Hachinski score's own interpretation cut-offs, the small-vessel-vs-cortical-infarct
sign differentiation), and **a few standalone "trap" facts the book states explicitly that never
made it into a trap block** (the DVLA/insomnia point, the RCPsych >70 needs-based-criteria box,
half of the 10-point JCPMH list). Recommended fix size: roughly 12-15 new/expanded blocks across
6-7 sections, concentrated on Depression (both scales and the early/late table), Vascular Dementia
(Hachinski cut-offs, sign differentiation) and the Prion Diseases section — not a rebuild.
