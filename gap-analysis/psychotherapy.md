# Gap Analysis: mrc-psych-lake (web) vs SPMM Source PDF
## Psychotherapy — What's Missing, From an Exam Standpoint

**Purpose of this document:** This compares every fact, table, and figure in
`resources/paper-b/books/9-psychotherapy.pdf` (40 pages, extracted verbatim into
`content/notes/psychotherapy.json`) against what currently renders on the live Psychotherapy
study-guide page (`content/study-guides/psychotherapy.json`). Unlike the Adult Psychiatry audit
that triggered this exercise, this topic's guide is unusually mature: 13 real content sections
(plus a dedicated "Coverage Gaps & Flags" section), the Immature/Neurotic/Mature defence
mechanism tables are already fully built and colour-categorised, and the guide already layers in
dozens of question-bank-sourced `trap`/`gap`/`trap-list` blocks calling out named studies (Powell
2004, Huhn 2014, Krupnick 2006), exact session counts, and MCQ distractor patterns that never
appear in the book at all. Every numeric figure spot-checked below (MBCT's 44% relapse reduction,
IPT's 12–16 sessions, CAT's 16–24 sessions, the CBT-for-hypochondriasis 30% trial-uptake figure,
Bion's/Yalom's/Kohut's named lists) matches the book/question-bank text exactly — no numerical
discrepancies were found. The gaps that do exist are narrower and more surgical than a first
glance suggests: three fully missing named lists/models, one fully missing table, five missing
foundational psychodynamic-concept definitions, and a handful of missing items inside otherwise-
covered lists.

---

## Section-by-Section Gap Findings

### 1. Important Psychodynamic Concepts (book pp.6–8)
**Status: reasonably covered but missing several named, definable terms —**
- **"Psychic determinism" is entirely absent.** The book opens this whole section with it (p.6):
  "Psychoanalytic theories uphold psychic determinism i.e. unconscious events play causal role in
  later experiences. They emphasize developmental psychopathology as the source of adult life
  difficulties. Psychodynamic therapies emphasize on idiosyncrasy and uniqueness of individuals."
  This term does not appear anywhere in the live guide (checked by direct text search).
- **"Interpretation" has no explicit definition anywhere in the guide**, despite being a named,
  defined term in the book (p.6): "Interpretation refers to the expression of therapist's
  understanding of the meaning of feelings, attitudes, defense mechanisms and behaviours currently
  exhibited during therapy... based on psychoanalytical theory... sheds light on an unconscious
  process in the patient, therefore making it accessible to the conscious mind." The word
  "interpretation" appears in the guide only in unrelated contexts (e.g. "active interpretation" in
  brief dynamic therapy, "misinterpretation" in panic disorder) — never as this core defined
  concept. This is a natural EMI/SBA stem ("which technique makes an unconscious process
  conscious?") with no matching content on the page.
- **"Insight" has no explicit definition.** Book (p.7): "Insight: Being aware of and acknowledging
  one's mental processes, including ego defence mechanisms." Absent from the guide entirely as a
  standalone concept (the word "insight" only appears once, inside the MBT paragraph, in the
  unrelated sense of "goal is recovery of mentalizing capacity, not insight").
- **"Repetition compulsion" is entirely absent.** Book (p.7): "The concept of the 'repetition
  compulsion' refers to psychological phenomenon in which a person repeats a traumatic event or its
  circumstances over and over again. The compulsion to repeat is curious because what is repeated
  is not pleasurable but painful and destructive... Freud proposed that repetition compulsion
  occurs during Id vs. Superego conflicts where Id overrides the superego." This is a classic
  named Freudian concept and does not appear anywhere in the current guide.
- **"Acting Out" only gets the one-line defence-mechanism-table definition** ("unconscious
  wish/impulse is expressed and does not remain repressed") — the book's fuller, separately-headed
  definition (p.7) is missing: acting out is specifically "performing an action to express
  unconscious emotional conflicts," the impulse is "discharged by means of an action instead of
  verbalization," it is a response to "the 'return of the repressed'," and — the exam-relevant
  part — "extreme forms of acting out may be a **contraindication for continued therapy**." None of
  this fuller framing (discharge-vs-verbalisation; contraindication-for-therapy) is in the guide.
- **The Bateman & Holmes (1995) table is compressed into prose and drops two of its twelve cells.**
  The book table has three columns (Continuity / Acting in / Acting out) with four rows each; the
  guide's paragraph lists "continuity issues (absence, lateness, breaks), acting-in (physical
  contact, persistent questions, silence), or acting-out (suicide, self-injury, substance use)" —
  this drops **"Impasse"** (a continuity-column example) and **"Presents/gifts"** (an acting-in
  column example) entirely, and the underlying 3×4 grid is never rendered as an actual `table`
  block (only good for a fill-in-the-blank/EMI style question on which column a given behaviour
  belongs to).

### 2. Behavioural Analysis & Outcome Measurement (book p.18)
**Status: entirely missing subsection —**
- The book's closing behavioural-analysis paragraph ("Measuring outcomes of behavioural
  interventions," p.18) names five specific, quantifiable dimensions of behaviour used to measure
  a behavioural intervention's effect, none of which appear anywhere in the guide:
  - **Repeatability** — the frequency of the behaviour.
  - **Temporal extent** — the duration of each instance of the behaviour.
  - **Temporal locus** — the time point at which each instance occurs.
  - **Response latency** — the time interval (reaction time) between the onset of a stimulus and
    the initiation of the response.
  - **Inter-response time** — the time between two consecutive responses.
  This is exactly the kind of dense, easily-confused terminology list (five near-synonymous
  measurement terms) that MRCPsych favours for EMI matching, and it is currently 100% absent from
  the study guide even though the surrounding antecedents-behaviour-consequence content is well
  covered.
- Also missing from the same page: the book's "Behavioural Treatment plans" sentence describing
  the steps of turning a functional analysis into a plan (identify problems/symptoms → set
  short/long-term goals → define specific interventions → decide how outcomes will be measured,
  e.g. a symptom-reduction chart) — lower-yield than the five dimensions above but still book
  content with no counterpart on the page.

### 3. Social Skills Training — Bellack & Mueser's Three Models (book pp.17–18)
**Status: entirely missing subsection —**
- The book devotes a full named subsection to Social Skills Training (SST) "employed... in
  recovery and rehabilitation of long-term serious mental illnesses such as schizophrenia,"
  attributed to Bellack and Mueser, describing three distinct named models:
  1. **The basic model** — complex social repertoires are broken down into simpler steps, subject
     to corrective learning, practiced via role-play, and applied in natural settings.
  2. **The social problem-solving model** — targets impairments in information processing assumed
     to underlie social skills deficits; domains addressed include medication/symptom management,
     recreation, basic conversation, and self-care.
  3. **The cognitive remediation model** — targets more fundamental cognitive impairments (e.g.
     attention, planning) on the assumption that improving these transfers to support more complex
     social-skills learning.
  None of "Social skills training," "Bellack," "Mueser," "cognitive remediation," or "social
  problem-solving model" appear anywhere in the current study guide (confirmed by direct text
  search) — this is a complete, named, three-part model with no coverage at all, despite sitting
  directly between the well-covered Habit Reversal Training and Behavioural Analysis content in
  the same book chapter. High EMI value: three named models, each with a one-line distinguishing
  feature.

### 4. Anxiety-Maintenance Mechanisms — CBT Model (book pp.19–21)
**Status: reasonably covered but 2 of 4 named mechanisms missing —**
- The book explicitly numbers **four** mechanisms by which anxiety is maintained despite cognitive
  distortions alone being insufficient to explain it: (1) situational avoidance/escape, (2)
  in-situation safety behaviours (Salkovskis), (3) **attentional deployment**, and (4)
  **rumination**. The guide's paragraph on this topic only names mechanisms (1) and (2) — the
  avoidance/escape and Salkovskis safety-behaviour content is present and accurately described
  ("generating new symptoms," "worsening existing symptoms," "escalating unwanted social
  responses"), but the book's separately-numbered items 3 and 4 are missing as named,
  distinguishable mechanisms:
  - **Attentional deployment** (p.20): "Patients with panic or hypochondriasis fear certain bodily
    sensations, catastrophically elaborating them. As a result, they selectively pay more attention
    to such body parts, becoming aware of benign symptoms that others do not even notice." The
    guide's CBT-for-hypochondriasis section separately mentions "selective physical attention
    experiments" as a *treatment technique*, but never names "attentional deployment" as the
    underlying *maintaining mechanism* it's designed to counteract.
  - **Rumination** as a maintaining mechanism (p.21) is given a specific framing the guide doesn't
    capture: "Rumination is not a problem-solving tool in most of those with depressive/anxious
    cognitive style — instead it serves to elaborate or make threats more abstract and hence
    difficult to cope with." The guide's only mention of rumination is in the earlier behavioural
    section ("rumination increases anxiety" via incubation) — the specific "not a problem-solving
    tool, elaborates/abstracts the threat" framing from the cognitive-maintenance list is absent.
- **The 5-point outcome list for behavioural experiments (book p.21) is paraphrased generically,
  losing the actual enumerated points.** The book states behavioural experiments help to: (1)
  establish that a feared catastrophe will not happen; (2) discover the importance of maintaining
  factors; (3) discover the importance of negative thinking; (4) find out whether an alternative
  strategy will be of value; and (5) generate evidence for a non-disease-based explanation. The
  guide compresses this into "This helps to: Establish that a feared catastrophe will not happen"
  (only point 1 is actually retained in the source text pulled into `content/notes` — points 2–5
  never made it into any guide block at all).
- **"Imagery modification" is entirely missing.** Book (p.21–22), listed as a discrete CBT-for-
  anxiety technique alongside cognitive restructuring and dropping safety-seeking behaviours:
  "Visual imagery of threatening stimuli can be modified in those with anxiety." Not mentioned
  anywhere in the guide's CBT-for-anxiety content.
- **"Questioning identified beliefs" — the three specific Socratic-style questions are not
  quoted.** Book (p.21): "What evidence do I have for this belief?", "What alternative explanations
  could there be?", and "What are the advantages and disadvantages of thinking in this way?" The
  guide only says "Socratic questioning challenges the accuracy/completeness of thinking" — the
  named technique is covered generically but the three actual example questions are dropped.

### 5. Group Therapy — Foulkes' Communication Factors (book p.25)
**Status: entirely missing named list —**
- Immediately after describing Foulkes' foundation/dynamic matrix concept, the book gives a
  specific, numbered 5-item list (p.25): "Factors influencing communication in a group matrix
  (Foulkes, 1964): 1. Mirroring, 2. Exchange, 3. Free floating discussion, 4. Resonance, 5.
  Translation." This list does not appear anywhere in the guide's Group Therapy section — the
  guide covers the foundation-matrix/dynamic-matrix concept correctly but stops there. This is a
  clean 5-item named list (mnemonic-ready: **MEFRT**) with zero current coverage, and is likely why
  the book's own segmenter mis-split "5. Translation" out as its own (near-empty) NoteBlock heading
  in `content/notes/psychotherapy.json` — the actual list content is real, present in the source
  PDF, and simply never made it into the study guide.

### 6. Combining Psychotherapy and Pharmacotherapy — Benefits/Challenges Table (book p.38)
**Status: entirely missing table —**
- Immediately after the Huhn et al. (2014) findings (which the guide covers accurately), the book
  presents an explicit two-column table (p.38) that is not reproduced anywhere in the guide, as
  prose or as a table:

  | Benefits of combined psycho-pharmacotherapies | Challenges in offering combined therapies |
  |---|---|
  | Improved recovery rates | Higher administration costs |
  | Faster responses | Lack of reliable evidence base |
  | Decreased rate of relapse | Practical difficulties in co-administration |
  | Improved long-term social functioning | |
  | Improved medication compliance | |
  | Greater reported satisfaction | Lower long-term service costs |

  None of "administration costs," "recovery rates," "medication compliance," "reported
  satisfaction," or "service costs" appear anywhere in the current study guide (confirmed by direct
  text search). This is a ready-made EMI-matching table (benefit vs. challenge) with no current
  coverage at all, sitting in the same paragraph/page as content the guide otherwise covers well.

---

## Overall Coverage-Quality Verdict

Psychotherapy is **well-built and mostly complete, not broadly thin**. This guide has clearly
already been through a careful build process: all three defence-mechanism tiers are fully
tabulated with colour categories, all the named integrative therapies (IPT, DBT, CAT, TA,
Humanistic/Rogers/Gestalt, MBT, EMDR, TTM, MI, BCT, ACT, MBCT) get full paragraph + mnemonic +
session-count coverage, the family-therapy and group-therapy models are both rendered as proper
tables, and dozens of question-bank-only facts (Powell 2004's CFS predictors, the Camberwell
Family Interview, MST caseload limits, historical pioneers like Rank/Janov/Ellis/Frankl) are
correctly flagged as book-absent `gap` blocks rather than silently invented. No numerical
discrepancy was found anywhere a number was cross-checked against the book. That said, six
concrete gaps remain, all traceable to specific pages: **one entire named 3-model framework
missing** (Social Skills Training / Bellack & Mueser), **one entire named 5-item list missing**
(Foulkes' communication factors), **one entire 5-dimension measurement list missing**
(Repeatability/Temporal extent/Temporal locus/Response latency/Inter-response time), **one entire
table missing** (combined-therapy benefits vs. challenges), **five foundational psychodynamic
terms with no explicit definition on the page** (psychic determinism, interpretation, insight,
repetition compulsion, and acting-out's fuller discharge/contraindication framing), and **two of
four named anxiety-maintenance mechanisms missing** (attentional deployment, rumination's specific
framing) alongside a couple of smaller dropped list-items (imagery modification, the Bateman &
Holmes table's "Impasse"/"Presents-gifts" cells, the behavioural-experiments 5-point list).
Recommend: add roughly six to eight new blocks — three new tables/lists (SST, Foulkes' factors,
the benefits/challenges table), one new "Core Psychodynamic Concepts" paragraph or two covering
the five missing terms, and one or two sentence-level additions to the existing anxiety-maintenance
and CBT-for-anxiety paragraphs. This is a polish pass, not a rewrite.
