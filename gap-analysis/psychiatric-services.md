# Gap Analysis: mrc-psych-lake (web) vs SPMM Source PDF
## Psychiatric Services & Rehabilitation — What's Missing, From an Exam Standpoint

**Purpose of this document:** This compares every fact, table, and figure in
`resources/paper-b/books/6-psychiatric-services.pdf` (32 pages, extracted verbatim into
`content/notes/psychiatric-services.json`, 21 note blocks) against what currently renders on the
live Psychiatric Services & Rehabilitation study-guide page
(`content/study-guides/psychiatric-services.json`, 15 sections). Unlike the Adult Psychiatry audit
that triggered this exercise, this guide is unusually thorough: every numeric figure, named study,
and named policy document checked below (ECT meta-analysis stats, DBS/psychosurgery complication
rates, CPA/NSF history, early-intervention trial names, human-rights articles, vulnerable-adult/
child-abuse statistics) matches the book text exactly, and the guide layers in 40+ question-bank
`trap`/`trap-list` citations on top. The findings below are therefore narrow and concrete: two
genuine figures/diagrams from the book never made it into the guide at all, one small named
decision-box is missing, two minor named facts are dropped from the TMS section, and — most
important of the lot — the guide contains one **internally self-contradicting, unsourced claim**
inside an otherwise-correct `highYield` table that should be fixed regardless of any new content
added.

---

## Section-by-Section Gap Findings

### 1. Prevention in Psychiatry — Levels & Models (book pp.2–5)
**Status: reasonably covered, but with one correctness problem and two missing diagrams —**

- **Correctness issue (not a gap, a fabrication risk):** The guide's "Prevention models" table
  (`prevention-frameworks` section, block index 3, `highYield: true`) adds a column, "IOM
  equivalent (pre-onset only)," pairing Primary↔Universal, Secondary↔Selective, and
  **Tertiary↔Indicated**. The book never states this correspondence — it explicitly presents
  primary/secondary/tertiary and Universal/Selective/Indicated as **two separate, independently
  described classification systems** ("There are two ways of classifying prevention strategies"),
  each with its own table, with no cross-mapping stated anywhere in the text. Worse, the very next
  block in the same section — the guide's own `mnemonic` ("PST vs USI") — directly contradicts the
  table it sits next to: "Tertiary has no **IOM** equivalent — **IOM** prevention stops at disorder
  onset; tertiary prevention is post-onset rehabilitation." So the guide currently asserts and then
  immediately denies the same claim on the same page. The Tertiary↔Indicated pairing in particular
  is clinically wrong: Indicated prevention is about identifying pre-syndromal/subsyndromal *signs*
  before diagnosis, not about rehabilitating an already-diagnosed, disabled patient (which is what
  tertiary prevention means). This table row should be corrected or the "IOM equivalent" column
  dropped for the tertiary row, independent of any of the additions below.
- **Missing figure — "Risk and Protective Factors by socio-ecological level" (book p.4–5, confirmed
  via `pdftotext -layout` against the actual PDF, since this extracts as a scrambled ecological
  diagram, not linear prose).** The book gives a full concentric-circle style figure organising
  risk factors into three levels — **Sociocultural** (neighbourhood violence, poverty,
  unemployment, homelessness), **Family** (maternal age at childbirth, single parenthood, parental
  substance abuse/psychopathology, intrafamilial conflict), and **Individual** (war, loss of
  caregiver, political violence, maltreatment, discrimination, poor parenting, low educational
  attainment, stress reactivity, cognitive disability, history of premature birth, genetic
  liabilities) — with a mirrored **Protective Factors** figure on the next page (Sociocultural:
  high-quality educational opportunities; Family: socioeconomic advantage, warm/supportive
  parenting/family relationships; Individual: supportive peer relationships, mentors/adult role
  models, above-average cognitive abilities, positive self-perception/self-esteem, sense of humour,
  self-regulation skills). The guide's only risk/protective-factor content is a much thinner
  Biological/Psychological/Social three-way split (page 2) — the entire ecological-level
  categorisation and roughly 20 named risk/protective items are absent. This is exactly the kind of
  multi-group classification `table.category` colour-coding this project's own conventions call
  for (three genuinely distinct named groups, explicitly labelled in the source).
- **Missing list — "Prevention could result in..." (book p.2).** After the tertiary-prevention
  definition, the book gives four concrete outcome categories of successful prevention, each with
  named examples: (1) reduction of specific disorders — e.g. substance abuse, depression, PTSD; (2)
  reduction of risky behaviours — e.g. substance use, unsafe sex; (3) reduction of negative
  outcomes — e.g. suicide, teen pregnancy, school dropout, delinquency; (4) promotion of mental
  health and wellness. None of this appears in the guide.

### 2. Physical Treatments — ECT (book pp.6–14)
**Status: very thoroughly covered — one named decision-box missing:**

- **Missing — "Maintenance ECT" indication box (book p.9, confirmed via direct PDF check).** The
  book has a standalone boxed callout: "Maintenance ECT should be considered when: (1) the index
  episode of illness responded well to ECT; (2) there is an early relapse despite adequate
  continuation drug treatment; (3) inability to tolerate continuation drug treatment; (4) the
  patient's attitude and circumstances are conducive to safe administration." This four-point
  clinical-decision list does not appear anywhere in the guide's ECT section, even though the
  section otherwise covers relapse rates, drug-interaction and electrode-placement detail in depth.
- Everything else spot-checked against the book matches exactly, including numbers that are easy to
  get subtly wrong: HDRS mean differences (9.7, CI 5.7–13.5 real vs sham; 5.2, CI 1.4–8.9 ECT vs
  pharmacotherapy), early side-effect rates (headache 48%, confusion 27%, nausea/vomiting 9%,
  muscular aches 5%), relapse rates (51.1% by 12 months, 37.7% by 6 months), mortality (≈2:100,000),
  and the 2006/07 UK usage-rate figures (0.82–0.88 per 10,000).

### 3. Physical Treatments — TMS, Psychosurgery, DBS & VNS (book pp.6–14)
**Status: very thoroughly covered — two minor named facts dropped from the TMS sub-section:**

- **Missing — single-pulse TMS for migraine.** The book states: "Single pulse TMS has been found
  useful for the treatment of migraine," immediately before introducing repetitive TMS (rTMS) for
  depression. The guide's TMS paragraph moves straight to rTMS/depression and drops this fact
  entirely — a plausible EMI/SBA distractor item ("which of these is a TMS indication") that's now
  unsourced on the page.
- **Missing — TMS mechanism detail.** The book specifies the mechanism as: "It involves the
  application of magnetic pulses on the scalp surface, which creates an electrical activity that
  stimulates neurons in cortical surface in line with **Faraday's principle of electromagnetic
  induction**." The guide's mechanism description omits the named physical principle entirely.
- Every numeric figure in this sub-section (TMS NNT 4, 40% sustained response, psychosurgery
  improvement/complication rates including the 63%/58% RCPsych 2000 figures, all DBS complication
  percentage ranges) matches the book exactly — no other content gaps found here.

### 4. Multidisciplinary Teams & National Policy (book pp.15–18)
**Status: fully covered.** Sainsbury Centre (1997) competencies, Moss (1994) functions, the six
evidenced MDT benefits with their citations (Dean 1993, Ford 1995, Knapp 1994, Campbell 1998,
Towell & Beardshaw 1991), the NSF's 7 standards (correctly reconstructed as 1 + [2,3 paired] +
[4,5 paired] + 6 + 7, matching the book's own grouping), the NHS Plan 2000's three targets (50 EI
teams by 2004, 335 crisis teams by 2004, 220 assertive outreach teams by 2003), the 2011 strategy's
6 outcomes, and all 10 ACT-model principles are present and numerically correct. No gap.

### 5. Models of Community Care & CMHTs (book pp.16–18)
**Status: fully covered.** Brokerage, case management, ACT (Stein & Test 1980, UK700 caseload
finding, Cochrane null result vs intensive community management), intensive case management,
personal strengths model, rehabilitation model, and CMHT composition/advantages (continuity of
care; Thornicroft 1991's case-management definition) all match the book. No gap.

### 6. Care Programme Approach — CPA (book pp.16–18)
**Status: fully covered.** The Spokes Inquiry/Sharon Campbell origin, DHSS 1988, 1991 introduction,
all 5 basic CPA requirements, the 1999 Enhanced/Standard level simplification, and all 5
"Modernising CPA" changes (merge with care management, cross-agency lead officer, framework not
after-care, abolish supervision registers, rename to care coordinator) match the book exactly. No
gap.

### 7. Service Utilisation & Pathways to Care (book p.18)
**Status: fully covered.** The pooled World Mental Health survey delay figures (anxiety 3.0–30.0
years, mood 1.0–14.0 years, substance use 6.0–18.0 years) and Goldberg & Huxley's 5-level/4-filter
pathways-to-care model match the book exactly. No gap.

### 8. Early Intervention Services in Psychosis (book pp.19–21)
**Status: fully covered — the most heavily cross-checked section, and it holds up.** Birchwood's
critical period (3–5 years), PACE-UHR criteria, the Bonn Scale's 78% conversion-prediction figure,
all named trials (OPUS, LEO, PEPP, TIPS, SoCRATES, PRIME, EPPIC, Warner's reappraisal), DUP figures
(UK target: 3-month service median/6-month individual max; Nottingham 52-day median), and the
neurotoxicity-theory rebuttal all match the book precisely, including the guide's own flagged
LEO/EPPIC "relapse vs remission" wording discrepancy against a question-bank explanation (a
genuinely useful trap, correctly caveated rather than silently picking one number). One purely
cosmetic omission: the guide names "the SoCRATES study" without spelling out what the acronym
stands for (Study of Cognitive Reality Alignment Therapy in Early Schizophrenia) — low-yield, not
counted as a real gap.

### 9. Rehabilitation, Recovery & Vocational Models (book pp.22–23)
**Status: fully covered.** Vermont longitudinal study, International Study of Schizophrenia (48%
loose-criteria / 38% strict-criteria recovery at 15/25-year follow-up), Jacobson & Greenley's
internal/external recovery conditions, all 10 recovery-oriented service characteristics, skills/
prevocational training, transitional employment (Fountain House clubhouse model, 1948), sheltered
employment (Remploy), and supported employment (Drake & Becker "place and train" model, with all 4
successful-SE-programme characteristics) match the book exactly. One minor provenance point: the
book attributes its remission definition to the "Recovery in schizophrenia working group," a named
source the guide's remission sentence doesn't cite — low-yield, not counted as a real gap.

### 10. Treatment Adherence, Compliance & Concordance (book pp.23–24)
**Status: content fully covered, but the source's comparison table has been flattened into
prose —**
- The book presents Compliance/Adherence/Concordance (Tacchi & Scott, 2005) as a genuine 3-column
  comparison table, each column carrying 4–5 distinguishing bullet points. The guide's single
  `paragraph` block correctly preserves every individual bullet point from all three columns (spot-
  checked line-by-line — nothing factually dropped), but renders it as one dense sentence rather
  than a `comparison`-type table block. Per this project's own stated priority ("the book is dense
  with comparison/evidence tables; these are natural EMI-matching material"), this is a real
  candidate for restructuring even though no fact is actually missing.
- All numeric figures (Kohn 2004: 32% psychosis untreated worldwide/18% Europe, 40% bipolar
  untreated in Europe, >50% depression/anxiety untreated; 76-day median continuous lithium use;
  WHO 2003's 30–40% chronic-illness non-adherence) match the book exactly.

### 11. Medicolegal — Human Rights in Mental Health (book p.25)
**Status: fully covered.** All 9 human-rights violation categories (Drew et al., 2011), the voting-
rights rule, and all 9 ECHR articles with their specific clinical-practice issues (Articles 2, 3, 5,
6, 8, 9, 10, 12, 14) match the book precisely — no article is invented or dropped. No gap.

### 12. Medicolegal — Driving, Capacity, Consent & Confidentiality (book p.25, p.29)
**Status: fully covered.** DVLA responsibility/duty-to-inform framework, Group 1/Group 2 relicensing
criteria (3-month, 3-year, 6-month stand-down periods; dementia annual-review vs revocation split),
the consent chain (information + competency + autonomy), Gillick competence, the MacArthur
Competence Assessment Tool family (MacCAT-CR/T/CA, MacSAC-CD), the Bolam test, and the
confidentiality exceptions (including the Tarasoff "duty to warn," correctly flagged as not
legislated in England & Wales) all match the book exactly. No gap.

### 13. Seclusion, Restraint & Safeguarding (book pp.29–31)
**Status: fully covered.** Seclusion/restraint/pharmacological-restraint definitions, Munjaz v
Ashworth Hospital, the vulnerable-adult abuse location/perpetrator/type percentages (home 41%/care
home 34%; family 25%/staff 25%; physical 30%/neglect 23%/financial 20%/emotional 16%/sexual 6%),
the Safeguarding Adults (DH 2011) six principles, and all four child-maltreatment risk-factor
domains — including the single-parent-household rate (27.3/1,000, nearly double two-parent
households), the 30–60% spousal-abuse/child-maltreatment overlap, and the 1.7x disability-
maltreatment risk multiplier — match the book exactly, down to each individual percentage. No gap.

---

## Overall Coverage-Quality Verdict

Psychiatric Services & Rehabilitation is **not broadly thin** — this is, so far, the most
faithfully and completely transcribed guide of the topics audited under this initiative. Every
named trial, policy document, meta-analysis statistic, and percentage figure spot-checked against
the book (well over 60 individual numbers across ECT, TMS, psychosurgery, DBS, CPA, early
intervention, adherence, and safeguarding) matched exactly, with zero numerical discrepancies
found. There are **no entirely missing subsections** and **no missing named trials**. The concrete,
fixable gaps are: **one internally-contradictory, unsourced classification claim** in the
prevention table (Tertiary↔Indicated) that should be corrected regardless of anything else — this
is the single highest-priority fix in this document; **two missing source diagrams** (the
sociocultural/family/individual risk-and-protective-factors figures, worth ~20 named items across
two multi-group tables); **one missing named decision-box** (Maintenance ECT's four criteria); two
minor dropped TMS facts (single-pulse TMS for migraine; Faraday's principle as the stated
mechanism); and one table-shape-only issue (the Compliance/Adherence/Concordance comparison,
content-complete but currently prose instead of a `comparison` block). Recommend: fix the
prevention-table contradiction first, then add the two risk/protective-factor tables and the
Maintenance ECT box — three edits that would take this guide from "very good" to "complete."
