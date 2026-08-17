# Gap Analysis: mrc-psych-lake (web) vs SPMM Source PDF
## Addiction Psychiatry — What's Missing, From an Exam Standpoint

**Purpose of this document:** compare `content/study-guides/addiction-psychiatry.json` (what
actually renders on the deployed Addiction Psychiatry page) against the full extracted text of
`resources/paper-b/books/11-1-addiction-psychiatry.pdf` (`content/notes/addiction-psychiatry.json`),
to find exam-relevant material that is stated in the source book but absent, thinned, or
factually altered on the web page. Unlike the Adult Psychiatry review that triggered this
project-wide audit, this topic's study guide was already rebuilt from the book in the same
commit (`0e14044`) that produced the Adult Psychiatry rewrite — so the baseline here is much
stronger. There is **no entirely-missing subsection**: every numbered heading in the book (1.
Epidemiology through 8. Pregnancy and substance use) has real, correctly-cited content on the
page, most of it already cross-referenced against the question bank for genuine "examiner trap"
value. The findings below are narrower: specific missing numbers/lists within sections that are
otherwise well covered, plus two confirmed instances of unsourced detail attached to a real
citation (a more serious, if isolated, problem given this project's zero-hallucination rule).

---

## Section-by-Section Gap Findings

### 1. Epidemiology of Substance Use (book p.2)
**Status: reasonably covered but missing several specific figures:**
- **Peak age of hazardous drinking** is not stated: the book gives 16–19 years for women and
  20–24 years for men — a classic EMI/SBA figure, entirely absent from the web page.
- **Age-specific pattern in dependent drinkers** is missing: age at first drink (13–15), age at
  first intoxication (15–17), and age at first alcohol-related "problem" (16–22) are all stated
  by the book to be essentially the same as the general population in alcohol-dependent
  patients — only the "age at death ~60 years" half of this passage made it into the guide.
- **"One in 10 pregnant women drank in the last week"** — this specific epidemiological figure
  (book p.2, under Alcohol Use) is not reproduced anywhere on the page, including in the later
  Pregnancy section (21), which covers FAS/management but not this prevalence figure.
- **School pupils (11–15) who had drunk alcohol at least once: 43%** — missing.
- **Patients presenting to primary care who drink at harmful/hazardous levels: 20%** — missing.
- **Frequent illicit drug use rates** are missing: 2.8% of UK adults (16–59) are frequent users
  (>once/month) of any illicit drug, rising to 5.1% among young adults (16–24) — the guide only
  states the "any use in the last year" figures (8.3% and 16.3%), not the frequent-use subset.
- **School pupils who took an illicit drug in the last year: 12% (17% if all past exposures are
  counted)** — missing.
- **Polydrug figures**: 61% of past-year drug users also drink alcohol; 7% use multiple other
  (non-alcohol) drugs — missing.

### 2. Typology & Classification (book p.4–5)
**Status: thoroughly covered.** Misuse of Drugs Act classes, ICD-10/DSM-IV/DSM-5 criteria,
Edwards & Gross criteria (as a table plus a sourced mnemonic), and DSM-5's gambling/internet
gaming/caffeine changes are all present and cited correctly, including two well-targeted
question-bank traps (ICD-11 harmful-use vs hazardous-use timing; the Edwards & Gross "decreased
tolerance" distractor). No material gap found.

- One sub-point is thinner than the source: the book's account of **"impaired control"** gives
  two distinct explanatory models — (1) losing control on the intended amount *within a single
  drinking episode*, and (2) repeatedly failing to cut down *over the course of one's overall
  "alcohol career"*. The guide states only that impaired control was not in the original Edwards
  & Gross list, without carrying forward this two-part distinction, which is a natural EMI
  contrast ("within-episode" vs "career-level" loss of control).

### 3. The Concept of Dependence — Tolerance, Withdrawal, Craving & Typologies (book p.6–8)
**Status: thoroughly covered**, including Tiffany's craving components, Cloninger Type 1/2 and
Jellinek Alpha–Epsilon typologies as tables plus sourced mnemonics, and the reinstatement/
abstinence-violation-effect explanations. No material gap found beyond the minor "widening of
repertoire" aside (book: "some widening of repertoire is inevitable... moving from weekends only
to all days of the week") and the "cognitive set characterised by fear of craving" line, both of
which are low-yield asides rather than exam-standard facts.

### 4. Alcohol — Pharmacology, Intoxication & Withdrawal Timeline (book p.9)
**Status: reasonably covered but missing one full table:**
- The book's **pre-2016 UK alcohol unit banding is entirely missing**: "In males – up to 21 U a
  week; 21 to 49 – hazardous; more than 49 – harmful. In females – up to 14 U a week; 14–35 –
  hazardous; more than 35 – harmful." The guide states only the *current* 14 units/week limit for
  both sexes; the historic hazardous/harmful three-tier banding by sex — a classic
  hazardous-vs-harmful-drinking definitional distinction the exam favours — does not appear
  anywhere on the page.

### 5. Opioids — Pharmacology, Intoxication & Withdrawal (book p.9–10)
**Status: reasonably covered but a full symptom list is missing:**
- The book's **opioid intoxication feature list is absent**: initial euphoria followed by apathy
  and dysphoria, psychomotor agitation or retardation, pupillary constriction, drowsiness or
  coma, slurred speech, and impairment of attention/memory. Only the withdrawal symptom list made
  it onto the page.
- Related trap, also missing: the book specifically notes that if **pupillary dilation** is seen
  *during intoxication* (rather than constriction), "the overdose may be very severe and anoxia
  has set in." The guide already has a trap about withdrawal pupils being dilated (not
  constricted) — but this is a *different*, easily-confused fact (dilated pupils as a marker of
  severe overdose/anoxia during intoxication, not of withdrawal) that isn't captured at all.

### 6. Sedative-Hypnotics: Benzodiazepines & GHB (book p.11–13)
**Status: the epidemiology/management numbers are covered well, but the clinical symptom
lists are missing:**
- **Benzodiazepine intoxication symptoms** (slurred speech, incoordination, unsteady gait,
  nystagmus, impairment of attention/memory, stupor or coma, inappropriate sexual/aggressive
  behaviour, mood lability, impaired judgement) — entirely absent.
- **Benzodiazepine withdrawal symptoms** (prominent anxiety, autonomic hyperactivity, tremor,
  insomnia, nausea/vomiting, transient visual/tactile/auditory hallucinations, kinaesthetic
  hallucinations, psychomotor agitation, grand mal seizures) — entirely absent, including the
  book's explicit warning that "withdrawal delirium can be fatal."
- The book's line that "management of illicit [benzodiazepine] drug users is less clear with no
  robust evidence to support maintenance prescribing" is missing.
- Several GHB-specific facts are missing: its street names (Georgia Home Boy, liquid ecstasy),
  that it is sold as a powder or concentrated shampoo-like form, its origin as an anaesthetic
  later banned for bodybuilding/growth-hormone abuse, that a GHB derivative (sodium oxybate) is
  licensed in the USA for narcolepsy-associated cataplexy, its ICD/DSM classification under
  sedative-hypnotic abuse, that intoxication management is purely supportive with only anecdotal
  evidence for withdrawal agents (lorazepam, diazepam, haloperidol), and that **aspiration
  pneumonia is a common cause of death** among GHB users.

### 7. Stimulants, Hallucinogens & Club Drugs (book p.14–19)
**Status: strong coverage of pharmacology/withdrawal/traps, but several lists and figures
are missing:**
- **Amphetamine epidemiology** is missing: 22% of 16–29-year-olds in the UK have used
  amphetamines at least once; 10% of those presenting to addiction services have a primary
  amphetamine-related problem.
- **Amphetamine intoxication feature list** (tachycardia or bradycardia — sometimes fatal
  arrhythmias, pupillary dilation, elevated or lowered blood pressure, GI symptoms, weight loss,
  psychomotor agitation/retardation, muscular weakness, respiratory depression, chest pain,
  confusion, seizures, dyskinesias/dystonias, coma) is missing, as is the book's specific claim
  that tolerant users may eventually take amounts "several 100-fold greater" than their starting
  dose.
- **Hallucinogen intoxication criteria** (general, not the flashback-specific list already on the
  page) are missing: marked anxiety or depression, ideas of reference, fear of losing one's mind,
  paranoid ideation, depersonalisation, derealisation, illusions, synaesthesias, pupillary
  dilation, tachycardia, sweating, palpitations, blurred vision, tremor and incoordination — and
  the book's specific note that symptoms follow a sequence (somatic first, then mood/perceptual,
  then psychological).
- **LSD historical facts** are missing: synthesised by Albert Hofmann in 1938, derived from ergot
  alkaloids, historically linked to lethal "St Anthony's fire" outbreaks, also found in low
  concentrations in morning glory seeds, and typically distributed as "blotter acid."
- The specific term "angel dust" for PCP is not used (PCP itself is covered via the mechanism
  quick-reference and a question-bank trap, but the book's colloquial synonym is absent).

### 8. Nicotine, Cannabis & Inhalants (book p.19–20)
**Status: mechanism/epidemiology well covered, but clinical symptom lists for both cannabis
and inhalants are missing:**
- **Cannabis intoxication features** are entirely absent from the page: impaired motor
  coordination, a sensation of slowed time, social withdrawal, conjunctival injection, increased
  appetite ("munchies"), dry mouth, tachycardia, and — in some cases — heightened perceptual
  sensitivity, depersonalisation and derealisation; also that motor-skill impairment can outlast
  the euphoriant effect.
- **Inhalants**: the book's epidemiology ("contributes to nearly 1% of all substance-related
  deaths"; classic profile is "an adolescent who skips classes at school") and the full
  intoxication signs list (dizziness, nystagmus, incoordination, slurred speech, unsteady gait,
  lethargy, depressed reflexes, psychomotor retardation, generalised muscle weakness, blurred
  vision/diplopia, stupor or coma, euphoria — plus rashes around the nose/mouth and unusual
  breath odour) are missing, along with the book's statement that tolerance to inhalants has been
  reported.

### 9. Prescribing Controlled Drugs (book p.21–23)
**Status: thoroughly covered.** The Misuse of Drugs Regulations 2001 schedules are reproduced as
a full table, and the prescription-content/instalment rules are complete. No material gap found.

### 10. Addiction Pharmacology Quick-Reference (book p.23)
**Status: thoroughly covered**, including a genuinely useful PCP question-bank trap. No material
gap found.

### 11. Neuropsychiatric Complications of Alcohol (book p.26–32)
**Status: exceptionally thorough** — this is the single best-covered section on the page (18
blocks), matching essentially every named syndrome (pathological intoxication, alcoholic
hallucinosis with differentiators from schizophrenia, blackouts, WE/Korsakoff with MRI
sensitivity/specificity and thiamine dosing regimens, cerebellar degeneration, hepatocerebral
degeneration, Marchiafava-Bignami with Type A/B subtypes, central pontine myelinolysis,
pancreatitis-associated hypocalcaemia) and cross-referencing question-bank traps (Binswanger
disease as a distractor, Othello syndrome). No material gap found.

### 12. Neuropsychiatric Complications of Illicit Drugs & Dual Diagnosis (book p.26)
**Status: thoroughly covered**, including all four dual-diagnosis models (common factor,
secondary use, supersensitivity, secondary illness) and the full stimulant-psychosis
differentiator list versus schizophrenia. No material gap found.

### 13. Risk Factors, Genetics & Screening (book p.33–36)
**Status: thoroughly covered**, including the genetic loci table, Dawson et al. (1992) relative
-risk figures, and all four screening tools (AUDIT, CAGE, MAST, urine detection windows with
false-positive producers) as both prose and tables. One integrity issue found here — see
"Numerical & Citation Discrepancies" below (AUDIT structural detail not present in the source).

### 14. Alcohol Detoxification (book p.37–38)
**Status: thoroughly covered**, including CIWA-Ar/SAWS thresholds, fixed vs symptom-triggered
regimens, front-loading, and the carbamazepine/haloperidol evidence. One integrity issue found
here too — see below (an added "COPD" indication not present in the source).

### 15. Alcohol Relapse Prevention: Pharmacotherapy (book p.38–41)
**Status: thoroughly covered**, including exact OR/NNT figures for acamprosate and naltrexone,
the outcome-measure mismatch between the two drugs (a genuinely high-yield trap, reproduced
correctly), and disulfiram contraindications. No material gap found.

### 16. Alcohol Relapse Prevention: Psychosocial Interventions & Landmark Trials (book p.41–43)
**Status: thoroughly covered**, including Project MATCH and UKATT with correct centre counts,
sample sizes and follow-up rates, FRAMES, BSCT, the transtheoretical model, and residential rehab
models (Minnesota, Phoenix House). No material gap found.

### 17. Opioid Detoxification & Maintenance Treatment (book p.44–47)
**Status: thoroughly covered**, including the BAP guideline comparison table, LAAM's QT-related
withdrawal, Suboxone's naloxone-deterrent mechanism, and the full NICE opioid-detoxification
summary. No material gap found.

### 18. Pregnancy and Opioid Detoxification (book p.53)
**Status: thoroughly covered.** No material gap found.

### 19. Treatments for Other Substances & Smoking Cessation (book p.48–49)
**Status: thoroughly covered**, including contingency management's "fish-bowl" procedure, NRT
compliance-by-formulation figures, and bupropion dosing — with question-bank cross-references
(methamphetamine as a distractor, formulation-specific bupropion seizure risk). No material gap
found.

### 20. Non-Substance Addictive Behaviours & Unconventional Substances (book p.50–52)
**Status: thoroughly covered**, including gambling disorder pharmacotherapy RCT counts, internet
addiction's five subtypes, compulsive buying prevalence/comorbidity figures, anabolic steroid
patterns (cycling/stacking/pyramiding), and the full "legal highs" category table. No material
gap found.

### 21. Pregnancy: Alcohol, Other Drugs & Neonatal Withdrawal (book p.53)
**Status: thoroughly covered** via prose and a full neonatal-withdrawal-by-substance table. Note
that the alcohol-in-pregnancy prevalence figure ("1 in 10 pregnant women drank in the last week")
belongs here or in Section 1 and is missing from both — see Section 1 above.

---

## Numerical & Citation Discrepancies (highest-risk findings)

These are not omissions but cases where the web page states a specific fact under a real book
citation, and that specific fact does not appear anywhere in the book's extracted text for that
page — the exact failure mode this project's citation rule exists to prevent.

1. **AUDIT structure (Section 13, Risk Factors/Screening)**: the guide states, citing book p.33:
   *"NICE-recommended screening tool for non-specialist staff (GPs, acute/mental health staff),
   10 items (Q1-3 quantity, 4-6 dependence signs, 7-10 harm-related behaviours), max score 40,
   score >=8 suggests harmful/hazardous drinking."* The book's actual text on p.33 says only:
   *"Alcohol use disorders identification test (AUDIT) was designed to be used as a brief
   structured interview or self-report questionnaire. It is suitable for general practice use.
   The AUDIT was found to have a sensitivity of 83% among males and 65% among females..."* —
   there is no "10 items," no "max score 40," no "NICE-recommended," and no item-range breakdown
   anywhere in the source page. (The ">=8" threshold itself is genuine — it appears on book p.2 —
   but it is being cited to the wrong page and combined with structural detail that isn't sourced
   at all.) This needs to be either re-sourced to an actual citation or removed.
2. **Lorazepam/oxazepam indication (Section 14, Alcohol Detoxification)**: the guide states,
   citing book p.37: *"Agents without phase-1 metabolism (lorazepam, oxazepam) suit patients with
   liver failure/COPD (though with more breakthrough-seizure risk and misuse potential)."* The
   book's actual text says only: *"Substances that are eliminated without phase 1 metabolism such
   as lorazepam or oxazepam may be suitable when the patient has liver failure."* COPD as an
   indication, and the added "breakthrough-seizure risk and misuse potential" caveat, do not
   appear in the source at all.

No other numerical mismatches were found — spot-checked figures (Project MATCH n=1726/9 centres,
UKATT n=742/7 centres/83% follow-up, acamprosate OR 1.73/NNT 11/NNT 8, naltrexone OR 1.46/NNT
9–11, Dawson et al. 1992 167%/86%/45% relative-risk figures, WE MRI sensitivity 53%/specificity
93%, Korsakoff 80% post-WE conversion rate, benzodiazepine dependence-by-duration figures) all
match the book text exactly.

---

## Overall Coverage Quality

This is a **well-covered, not thin, study guide** — a different starting point from the Adult
Psychiatry review that prompted this audit. Every one of the book's eight numbered sections has
substantial, correctly-cited content, several sections (Neuropsychiatric Complications of
Alcohol, Alcohol Relapse Prevention, Opioid Detoxification) already match the source almost
fact-for-fact and are cross-referenced against question-bank traps in a genuinely useful way. The
remaining work is narrower: roughly a dozen missing epidemiology figures and symptom/feature
lists scattered across five sections (Epidemiology, Opioids, Sedative-Hypnotics, Stimulants/
Hallucinogens, Nicotine/Cannabis/Inhalants) — mostly clinical intoxication-symptom lists that
were compressed out during summarisation — plus one missing table (the historic UK
hazardous/harmful alcohol-unit banding). The two citation-integrity findings above (AUDIT
structure, lorazepam/oxazepam-COPD) are the most important items to fix regardless of their small
number, since they are exactly the class of error ("fact under a citation that doesn't support
it") this project treats as a hard failure. Overall verdict: **needs roughly 10-15 new/expanded
blocks and two corrected citations, not a rebuild.**
