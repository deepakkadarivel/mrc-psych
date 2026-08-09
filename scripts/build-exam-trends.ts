import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import manifest from "../content/manifest.json";
import type {
  ExamTrendSection,
  ExamTrendsData,
  ExamTrendTopicSignal,
  PriorityDomain,
  Question,
  Source,
  StudyGuide,
} from "@/lib/types";

// Syllabus sections 6-14 of resources/paper-b/exam-syllabic/exams-syllabic-curriculum-mrcpsych-
// february-2021.pdf, one per official RCPsych Paper B blueprint category. Page numbers verified
// by grepping the actual extracted PDF text for each heading (see session notes) — not guessed.
// mappedTopics matches this repo's own manifest.json topic ids, which were themselves named after
// this same syllabus numbering (books/7-1-..., 7-2-..., 7-3-..., 7-4-... = syllabus section 7's
// four subtopics; 14 = "RESEARCH METHODS, STATISTICS, CRITICAL REVIEW AND EVIDENCE-BASED
// PRACTICE... published as a separate syllabus", covering all four research-and-stats topics).
// Percent/marks match the breakdown the user supplied, cross-checked against an independent public
// source (edubros.org's MRCPsych Paper B guide) via web search — see weightSource below.
const SECTIONS: Array<{
  id: string;
  syllabusNumber: string;
  title: string;
  weightPercent: number;
  weightMarks: number;
  syllabusPage: number;
  mappedTopics: string[];
}> = [
  {
    id: "organisation-of-services",
    syllabusNumber: "6",
    title: "Organisation and Delivery of Psychiatric Services",
    weightPercent: 5.5,
    weightMarks: 8,
    syllabusPage: 13,
    mappedTopics: ["psychiatric-services"],
  },
  {
    id: "general-adult-psychiatry",
    syllabusNumber: "7",
    title: "General Adult Psychiatry",
    weightPercent: 20,
    weightMarks: 30,
    syllabusPage: 14,
    mappedTopics: ["adult-psychiatry", "perinatal-psychiatry", "liaison-psychiatry", "emergency-psychiatry"],
  },
  {
    id: "old-age-psychiatry",
    syllabusNumber: "8",
    title: "Old Age Psychiatry",
    weightPercent: 9,
    weightMarks: 14,
    syllabusPage: 16,
    mappedTopics: ["old-age-psychiatry"],
  },
  {
    id: "psychotherapy",
    syllabusNumber: "9",
    title: "Psychotherapy",
    weightPercent: 5.5,
    weightMarks: 8,
    syllabusPage: 18,
    mappedTopics: ["psychotherapy"],
  },
  {
    id: "child-and-adolescent-psychiatry",
    syllabusNumber: "10",
    title: "Child and Adolescent Psychiatry",
    weightPercent: 9,
    weightMarks: 14,
    syllabusPage: 20,
    mappedTopics: ["child-psychiatry"],
  },
  {
    id: "substance-misuse-addictions",
    syllabusNumber: "11",
    title: "Substance Misuse / Addictions",
    weightPercent: 6.5,
    weightMarks: 10,
    syllabusPage: 22,
    mappedTopics: ["addiction-psychiatry"],
  },
  {
    id: "forensic-psychiatry",
    syllabusNumber: "12",
    title: "Forensic Psychiatry",
    weightPercent: 5.5,
    weightMarks: 8,
    syllabusPage: 22,
    mappedTopics: ["forensic-psychiatry"],
  },
  {
    id: "learning-disability",
    syllabusNumber: "13",
    title: "Psychiatry of Learning Disability",
    weightPercent: 5.5,
    weightMarks: 8,
    syllabusPage: 23,
    mappedTopics: ["learning-disability"],
  },
  {
    id: "critical-review",
    syllabusNumber: "14",
    title: "Critical Review",
    weightPercent: 33.5,
    weightMarks: 50,
    syllabusPage: 24,
    mappedTopics: ["research-methods", "evidence-based-medicine", "statistics", "epidemiology"],
  },
];

// The two documents the user compiled from their own real recall papers (6-13 sessions,
// Sep 2022 - May 2025, plus SPMM Mock 14) — genuinely citable {file,page} sources, not generic
// web pages. TREND analyses per-domain recurring facts; STRATEGY ranks domains by priority/
// effort:reward and adds a 6-week plan + facts from 5 extra older recall files. Their own
// priority tables (TREND p.24, STRATEGY p.1) agree closely, so tiers below follow STRATEGY's
// (the more granular of the two, and the one that names an explicit 12-domain taxonomy).
const TREND: Source["file"] = "exam-syllabic/MRCPsych_Paper_B_Trend_Analysis.pdf";
const STRATEGY: Source["file"] = "exam-syllabic/MRCPsych_Strategy_Guide.pdf";

function fact(text: string, file: string, page: number): { text: string; source: Source } {
  return { text, source: { file, page } };
}

// A web search for newer (2025/2026) recall-trend writeups turned up only exam logistics (pass
// rates, sitting dates) — nothing substantiating specific new/changed topics — so "expected"
// content here stays grounded in what these two documents themselves say about repetition and
// forward relevance, not web-sourced speculation.
const PRIORITY_DOMAINS: PriorityDomain[] = [
  {
    id: "pr-statistics",
    title: "Statistics & Research Methods",
    tier: "CRITICAL",
    percentOfPaper: "30–35%",
    percentRevisionTime: "30%",
    effortReward: "High effort / massive reward",
    tierSources: [{ file: STRATEGY, page: 1 }, { file: TREND, page: 24 }],
    repeatedFacts: [
      fact(
        "Diagnostic-test statistics (sensitivity, specificity, PPV, NPV, LR+, LR−, post-test odds) appear EVERY session, multiple questions each time.",
        TREND,
        2
      ),
      fact(
        "Exam favourite worked example: pre-test probability 1/8, Sn 80%, Sp 80% → pre-test odds 1/7 × LR+ 4 = post-test odds 4/7 — appeared in Sep 2022, Mar 2023, and Mock 14.",
        TREND,
        2
      ),
      fact(
        "ANCOVA vs ANOVA (adjusting for a covariate such as age) is a frequently tested trap — appeared in Oct 2023, Jun 2023, and May 2025.",
        TREND,
        3
      ),
      fact(
        "Case-control → odds ratio; cohort → relative risk. Risk ratio CANNOT be calculated from a case-control study (no population denominator).",
        TREND,
        4
      ),
      fact(
        "Block randomisation (ensures equal numbers per arm) is the most frequently tested randomisation question.",
        TREND,
        4
      ),
      fact(
        "Audit-loop trap: a re-audit done with no changes implemented in between means the audit loop is incomplete — appeared in Sep 2022, Oct 2023, and the compiled Recalls Solved file.",
        TREND,
        4
      ),
      fact("STARD (diagnostic accuracy reporting) specifically appeared in Mar 2023 and May 2025.", TREND, 5),
      fact(
        "Forest-plot, Kaplan-Meier, and CONSORT-diagram EMI stems use new numbers every session but test the same interpretation skills — practise reading them, don't memorise specific figures.",
        TREND,
        25
      ),
      fact("Full statistical-test decision table and formula sheet.", STRATEGY, 3),
    ],
    expectedNote: fact(
      "There are 40–50 stats questions per paper; getting most of them right is described as the difference between passing and failing, regardless of clinical knowledge — the single highest-expected-value topic to keep drilling right up to the exam.",
      TREND,
      24
    ),
  },
  {
    id: "pr-pharmacology",
    title: "Clinical Pharmacology (pregnancy, EPSEs, mood stabilisers, clozapine)",
    tier: "CRITICAL",
    percentOfPaper: "18–25%",
    percentRevisionTime: "20%",
    effortReward: "Medium effort / high reward",
    tierSources: [{ file: STRATEGY, page: 1 }, { file: TREND, page: 24 }],
    repeatedFacts: [
      fact("Drugs-in-pregnancy / neonatal-effects EMI appears in EVERY paper.", TREND, 8),
      fact(
        "Sertraline is the preferred SSRI in both pregnancy and breastfeeding (least placental/milk exposure); lithium is contraindicated in breastfeeding.",
        TREND,
        9
      ),
      fact(
        "Tardive dyskinesia management trap: the first step is to STOP the anticholinergic (e.g. procyclidine) — anticholinergics worsen TD — before reducing/switching the antipsychotic.",
        STRATEGY,
        9
      ),
      fact(
        "Lithium RAISES calcium, opposite to carbamazepine, valproate and haloperidol, which lower it.",
        TREND,
        13
      ),
      fact(
        "If clozapine isn't working, the first step is to check compliance (clozapine level) before anything else; amisulpride augmentation has the best evidence for partial response.",
        STRATEGY,
        9
      ),
      fact(
        "QTc >500ms → reduce dose immediately and consider urgent cardiology referral; risperidone+citalopram and citalopram+diphenhydramine are named high-risk combinations.",
        STRATEGY,
        10
      ),
      fact(
        "Neonatal-presentation EMI (classic, tested every session): opioids → jittery/high-pitched cry; cocaine → overarousal/tachycardia; sodium valproate → cleft palate + developmental delay.",
        STRATEGY,
        6
      ),
    ],
    expectedNote: fact(
      "Drug-choice-in-special-situations tables (post-MI, epilepsy, renal/liver impairment, tamoxifen, breastfeeding) recur across sessions in near-identical form — learning the table once covers most of this domain's marks.",
      STRATEGY,
      8
    ),
  },
  {
    id: "pr-ld-genetics",
    title: "Intellectual Disability & Genetics",
    tier: "HIGH",
    percentOfPaper: "8–12%",
    percentRevisionTime: "8–10%",
    effortReward: "Low effort once the table is learnt",
    tierSources: [{ file: STRATEGY, page: 1 }, { file: TREND, page: 24 }],
    repeatedFacts: [
      fact(
        "The same LD syndromes are tested repeatedly across every recall session — the full 12-syndrome comparison table (genetics, clinical features, exam clue) is worth memorising in one sitting.",
        TREND,
        6
      ),
      fact(
        "Genomic imprinting is a specifically recurring point: Prader-Willi = paternal deletion 15q; Angelman = maternal deletion 15q — tested in Mar 2024 and the compiled Recalls Solved file.",
        TREND,
        8
      ),
      fact(
        "Most common cause of intellectual disability overall = unknown (up to 60%); chromosomal = Down syndrome; inherited/genetic = Fragile X; environmental/acquired = foetal alcohol syndrome.",
        TREND,
        8
      ),
      fact("5–7 questions on the same syndrome set appear every session.", STRATEGY, 4),
    ],
    expectedNote: fact(
      "\"Learn ONE good table covering all 12 syndromes and you will get most of these marks\" — the source's own framing after cross-referencing 8 recall sources.",
      TREND,
      24
    ),
  },
  {
    id: "pr-dementia",
    title: "Dementia & Old Age Psychiatry (DLB, Alzheimer's, FTD, MCI)",
    tier: "HIGH",
    percentOfPaper: "7–9%",
    percentRevisionTime: "8%",
    effortReward: "Medium effort / high reward",
    tierSources: [{ file: STRATEGY, page: 1 }, { file: TREND, page: 24 }],
    repeatedFacts: [
      fact(
        "\"Which dementia is irreversible?\" is frequently tested — answer MND/ALS; reversible causes (NPH, chronic subdural haematoma, Wilson's disease, pellagra, alcohol) are the distractor set.",
        TREND,
        10
      ),
      fact(
        "DLB's core feature — REM sleep behaviour disorder, which can precede cognitive decline by years — and its supportive feature, severe neuroleptic sensitivity, are repeatedly tested.",
        TREND,
        10
      ),
      fact(
        "Best tool to differentiate MCI from dementia is informant assessment of activities of daily living, NOT MMSE or MoCA scores alone.",
        TREND,
        11
      ),
      fact("Risperidone is the only UK-licensed antipsychotic for BPSD in moderate-severe Alzheimer's.", TREND, 11),
      fact("MCI converts to Alzheimer's at roughly 9.6% (range 5–15%) per year.", STRATEGY, 12),
    ],
  },
  {
    id: "pr-psychotherapy",
    title: "Psychotherapy (CAT, DBT, Family Therapy)",
    tier: "HIGH",
    percentOfPaper: "7–10%",
    percentRevisionTime: "7%",
    effortReward: "Low effort / pure recall",
    tierSources: [{ file: STRATEGY, page: 1 }, { file: TREND, page: 24 }],
    repeatedFacts: [
      fact(
        "CAT's 3 Rs (Reformulation → Recognition → Revision) plus its goodbye letters, DBT's phone-calls-as-core-technique plus its behaviour hierarchy, and the four family-therapy model distinctions are tested in every paper.",
        TREND,
        25
      ),
      fact(
        "Most-tested family-therapy distinction: Systemic/Milan = re-framing + hypothesising; Strategic = paradoxical injunctions; Structural = unspoken rules + hierarchy; Narrative = externalisation.",
        TREND,
        15
      ),
      fact(
        "DBT trap: it is NOT based on psychodynamic formulations and is NOT delivered only in groups — both are common wrong-option distractors.",
        TREND,
        15
      ),
      fact("Motivational Interviewing (DEARS) and IPT (RIIG) mnemonics recur as EMI option sets.", STRATEGY, 6),
    ],
  },
  {
    id: "pr-forensic",
    title: "Forensic Psychiatry",
    tier: "MEDIUM",
    percentOfPaper: "5–8%",
    percentRevisionTime: "6%",
    effortReward: "Low effort / specific facts",
    tierSources: [{ file: STRATEGY, page: 1 }, { file: TREND, page: 24 }],
    repeatedFacts: [
      fact(
        "Prison suicide risk is 3–8× higher in males and >10× higher in females than the general population; remand status carries HIGHER risk than sentenced status (the reverse of intuition).",
        STRATEGY,
        7
      ),
      fact(
        "Pritchard fitness-to-plead criteria: amnesia for the offence does NOT make someone unfit to plead; learning disability is the most common cause of unfitness.",
        TREND,
        17
      ),
      fact(
        "Sane automatism = external cause (concussion, one-off hypoglycaemia, sleep terrors) → complete acquittal. Insane automatism = internal cause (epilepsy, sleepwalking, brain tumour) → not guilty by reason of insanity.",
        TREND,
        17
      ),
      fact(
        "Key legal cases recur as a set: Bournewood (DoLS), Tarasoff (duty to warn), Osman v UK (police duty to warn), Gillick/Fraser (minors' consent), Bolam (negligence standard).",
        TREND,
        17
      ),
      fact("ASPD prevalence in the male prison population is consistently cited at ~50%.", STRATEGY, 7),
    ],
    expectedNote: fact(
      "Forensic questions test specific memorised numbers rather than concepts — the source frames this as \"once learnt, reliable marks; learn the numbers, not just the concepts.\"",
      STRATEGY,
      7
    ),
  },
  {
    id: "pr-child-adolescent",
    title: "Child & Adolescent Psychiatry",
    tier: "MEDIUM",
    percentOfPaper: "5–8%",
    percentRevisionTime: "6%",
    effortReward: "Medium effort",
    tierSources: [{ file: STRATEGY, page: 1 }, { file: TREND, page: 24 }],
    repeatedFacts: [
      fact("ADHD heritability (70–80%) is the highest of all listed childhood psychiatric conditions.", TREND, 19),
      fact(
        "Paediatric OCD drug-licensing ages are a specific recurring trap: sertraline from age 6, fluvoxamine from age 8; clomipramine is NOT first-line and needs cardiac monitoring.",
        TREND,
        20
      ),
      fact(
        "Mild depression watchful-waiting period is 2 WEEKS, not 6 weeks or 2 months — a commonly-tested exact-number trap; fluoxetine's minimum licensed age is 5 years.",
        TREND,
        20
      ),
      fact("Tourette syndrome requires 2+ motor tics AND 1+ vocal tic for over a year; M:F ratio 2–5:1.", TREND, 20),
    ],
  },
  {
    id: "pr-eating-perinatal",
    title: "Eating Disorders & Perinatal Psychiatry",
    tier: "MEDIUM",
    percentOfPaper: "4–6%",
    percentRevisionTime: "5%",
    effortReward: "Low effort",
    tierSources: [{ file: STRATEGY, page: 1 }, { file: TREND, page: 24 }],
    repeatedFacts: [
      fact(
        "Refeeding syndrome's most dangerous electrolyte disturbance is hypophosphataemia (not hypokalaemia, though that also occurs).",
        TREND,
        21
      ),
      fact(
        "MEED admission red flags recur as an exact-number set: HR <40, BMI <13 (adult), temperature <35.5°C, QTc >430ms (male)/>450ms (female), K+ <2.5.",
        TREND,
        21
      ),
      fact(
        "Postpartum blues affects up to 50% of new mothers; postpartum depression 10–15%; postpartum psychosis 1–2 per 1000 deliveries; BPAD postpartum relapse risk ~50%.",
        STRATEGY,
        11
      ),
    ],
  },
  {
    id: "pr-prevention",
    title: "Prevention (universal / selective / indicated)",
    tier: "EASY MARKS",
    percentOfPaper: "2–3%",
    percentRevisionTime: "2%",
    effortReward: "Minimal effort / free marks",
    tierSources: [{ file: STRATEGY, page: 1 }, { file: TREND, page: 24 }],
    repeatedFacts: [
      fact(
        "The same ~5 prevention scenarios recycle every single session — described as the easiest marks in the whole exam.",
        TREND,
        16
      ),
      fact(
        "At-risk mental state for psychosis + CBT is BOTH primary prevention AND indicated prevention — always select two answers when this scenario appears.",
        TREND,
        16
      ),
      fact(
        "Universal prevention for alcohol in the community = increasing the price per unit, the most evidence-backed answer; school-based education is also universal.",
        TREND,
        16
      ),
      fact(
        "Full scenario-to-classification table (school anti-bullying, low-income family support, lithium prophylaxis, alcohol pricing, screening).",
        STRATEGY,
        4
      ),
    ],
    expectedNote: fact(
      "\"1 hour of learning = 3–4 guaranteed marks\" — the source's own estimate of return on effort for this domain.",
      STRATEGY,
      4
    ),
  },
  {
    id: "pr-ect",
    title: "ECT",
    tier: "EASY MARKS",
    percentOfPaper: "2–3%",
    percentRevisionTime: "2%",
    effortReward: "Low effort / fixed facts",
    tierSources: [{ file: STRATEGY, page: 1 }, { file: TREND, page: 24 }],
    repeatedFacts: [
      fact(
        "Retrograde (explicit/episodic) memory is the most affected memory type; the only absolute contraindication is phaeochromocytoma.",
        STRATEGY,
        6
      ),
      fact("Bilateral placement is more effective than unilateral but causes more cognitive side effects.", TREND, 18),
      fact("Psychotic depression is the best predictor of ECT response — not severity of depression.", TREND, 18),
      fact("ECT combined with lithium carries a ×12 risk of delirium.", TREND, 18),
    ],
  },
  {
    id: "pr-substance-misuse",
    title: "Substance Misuse",
    tier: "EASY MARKS",
    percentOfPaper: "2–3%",
    percentRevisionTime: "3%",
    effortReward: "Low effort",
    tierSources: [{ file: STRATEGY, page: 1 }, { file: TREND, page: 24 }],
    repeatedFacts: [
      fact(
        "Alcohol and benzodiazepines are the ONLY substances with life-threatening withdrawal; opioid withdrawal is very unpleasant but not life-threatening.",
        TREND,
        12
      ),
      fact(
        "Chlordiazepoxide is standard first-line for alcohol detox; oxazepam is preferred in liver disease/COPD; disulfiram is a deterrent, not relapse prevention (that's naltrexone/acamprosate).",
        TREND,
        12
      ),
      fact("Alcohol is the only substance that is both a GABA-A agonist AND an NMDA antagonist.", TREND, 12),
    ],
  },
  {
    id: "pr-old-age-other",
    title: "Old Age Psychiatry & Other Clinical Topics",
    tier: "LOWER PRIORITY",
    percentOfPaper: "2–3%",
    percentRevisionTime: "3%",
    effortReward: "Medium effort",
    tierSources: [{ file: STRATEGY, page: 1 }],
    repeatedFacts: [
      fact(
        "This is the source's own catch-all lower-priority bucket for older-adult clinical content not already folded into the Dementia domain above — ranked 12th of 12 domains by revision priority.",
        STRATEGY,
        1
      ),
    ],
  },
];

const GOLDEN_RULES = [
  fact(
    "Never skip stats. There are 40–50 stats questions per paper — getting most of them right is the difference between passing and failing.",
    TREND,
    24
  ),
  fact(
    "The same LD syndrome questions come up every session. Learn one good table covering all 12 syndromes and you will get most of these marks.",
    TREND,
    24
  ),
  fact(
    "Prevention questions are the easiest marks in the exam — the same 5 scenarios recycle every session. Memorise the definitions once and bank these 3–4 marks every time.",
    TREND,
    25
  ),
  fact(
    "For psychotherapy: the distinction between CAT (3 Rs, goodbye letters), DBT (phone calls, hierarchy), and the family-therapy model types is tested in every paper.",
    TREND,
    25
  ),
  fact(
    "For ECT: retrograde (explicit) memory is most affected; bilateral > unilateral efficacy but more cognitive side effects; QTc >500ms = emergency dose reduction.",
    TREND,
    25
  ),
  fact(
    "1st priority: statistics every single day — calculations, test selection, graph reading (30–35% of the paper). 2nd: LD syndromes + drugs in pregnancy + ECT facts (low effort, guaranteed marks). 3rd: psychotherapy terms + prevention scenarios (1–2 hours total). 4th: pharmacology special-situation drug choices + dementia differentials. 5th: forensic statistics + child-psychiatry NICE guidelines.",
    STRATEGY,
    13
  ),
];

const root = process.cwd();
const CONTENT_DIR = path.join(root, "content");

function readJsonIfExists<T>(relPath: string): T | null {
  const full = path.join(CONTENT_DIR, relPath);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf-8")) as T;
}

// ---------------------------------------------------------------------------------------------
// Independent Analysis — this app's OWN trend analysis, built from its own corpus rather than
// citing the two user-supplied PriorityAnalysis PDFs. Two primary sources:
//
// 1. content/questions/mock-*.json — 1578 already-parsed, already-cited mock-exam questions.
//    scripts/analyze-mock-frequency.ts mechanically counts how many questions (and how many of
//    the 14 mock exams) mention each of ~140 curated clinical/stats terms — see
//    scripts/.mock-frequency.json for the raw output. Every count here is reproducible by
//    re-running that script; nothing here is a model impression of "what mocks tend to cover".
//
// 2. resources/paper-b/previous-year-question-source/ — five real recall/answer-key PDFs
//    (Sep 2022, Mar 2023, Jun 2023, Oct 2023, and a compiled "Recalls solved"). These were read
//    page-by-page (by dedicated agents, one per file, each told to extract ONLY what the
//    document itself explicitly states — never outside knowledge) and every extracted fact was
//    spot-checked against the actual PDF page before use here. Two further files in the same
//    folder (March 24 Paper B recall.docx, recalls may 2025.docx) are free-form candidate
//    recollections with no page markers and a lot of hedged/uncertain phrasing ("I think",
//    "not sure", "???") — per this repo's own established stance on previous-year-question-source
//    (see app/recalls/page.tsx), these are NOT parsed into individually-cited facts here; they
//    were read for corroboration only (see `methodology` below), never for a specific claim.
//
// A web search for current (2025/2026) MRCPsych Paper B trend commentary turned up only the
// same handful of exam-prep sites already covered by the PriorityAnalysis branch, plus exam
// logistics (pass rates, sitting dates) — nothing substantiating new/changed topics. The two
// `external()` points below are the only web-sourced additions, clearly marked with a URL.
const RECALL_OCT2023 = "previous-year-question-source/1. October 2023 completed.pdf";
const RECALL_JUN2023 = "previous-year-question-source/2. June 2023 completed.pdf";
const RECALL_MAR2023 = "previous-year-question-source/3. March 2023 Completed.pdf";
const RECALL_SEP2022 = "previous-year-question-source/4. September 2022 recall completed.pdf";
const RECALL_SOLVED = "previous-year-question-source/Recalls solved.pdf";

function citedQ(text: string, file: string, page: number, questionNumber: number) {
  return { text, source: { file, page, questionNumber } };
}
function external(text: string, url: string) {
  return { text, url };
}

interface MockFrequencyStat {
  term: string;
  questionCount: number;
  mockCount: number;
  sample: Source;
}
// Regenerate on every run rather than trusting a stale committed intermediate — this keeps
// scripts/.mock-frequency.json self-healing if content/questions/mock-*.json ever changes.
execFileSync("./node_modules/.bin/tsx", ["scripts/analyze-mock-frequency.ts"], { cwd: root, stdio: "inherit" });
const MOCK_FREQ = readJsonIfExists<MockFrequencyStat[]>("../scripts/.mock-frequency.json") ?? [];
function mockStat(term: string): MockFrequencyStat {
  const s = MOCK_FREQ.find((m) => m.term === term);
  if (!s) throw new Error(`Unknown mock-frequency term: ${term}`);
  return s;
}
function mockPoint(term: string, label: string) {
  const s = mockStat(term);
  return citedQ(
    `${label} — ${s.questionCount} questions across ${s.mockCount}/14 of this app's own mock exams.`,
    s.sample.file,
    s.sample.page,
    s.sample.questionNumber!
  );
}

const REPEATED_TOPICS = [
  mockPoint("schizophrenia", "Schizophrenia is the single most recurring clinical topic in this app's mock corpus"),
  mockPoint("sensitivity", "Diagnostic-test-statistics questions (sensitivity/specificity/PPV/NPV) recur most consistently of any stats subtopic"),
  mockPoint("lithium", "Lithium-related questions (toxicity, monitoring, teratogenicity) recur across almost every mock"),
  mockPoint("alzheimer", "Alzheimer's disease recurs across every single mock exam analysed"),
  mockPoint("clozapine", "Clozapine (augmentation, monitoring, contraindications) recurs across every mock exam analysed"),
  fact("Suicide risk within 1 year of self-harm (~0.7%; 1.1% males, 0.5% females) is quoted with the exact same figures in two independently-written recall sessions (Sep 2022 and Oct 2023).", RECALL_SEP2022, 34),
  fact("Retrograde memory as the type most affected by ECT is tested in both the Oct 2023 and Mar 2023 recall sessions, each with near-identical explanation wording.", RECALL_OCT2023, 6),
  fact("Sane automatism (external cause → acquittal) vs insane automatism (internal/recurring cause → not guilty by reason of insanity) is tested in the Jun 2023, Mar 2023, and Sep 2022 sessions alike.", RECALL_JUN2023, 36),
  fact("Cri-du-chat's features (high-pitched cat-like cry, hypertelorism, micrognathia, epicanthic folds) are recited in near-identical wording across the Mar 2023, Sep 2022, and Jun 2023 recalls.", RECALL_JUN2023, 10),
  fact("DiGeorge/22q11.2's CATCH-22 mnemonic (Cardiac, Abnormal facies, Thymic aplasia, Cleft palate, Hypocalcaemia) is named identically in both Mar 2023 and Jun 2023.", RECALL_JUN2023, 11),
  fact("Rett syndrome's MECP2 gene, X-linked, girls-only presentation with regression at 6–18 months recurs across the Jun 2023 and Sep 2022 recalls.", RECALL_SEP2022, 33),
  fact("Pritchard fitness-to-plead criteria recur in both the Mar 2023 and Sep 2022 recalls, each listing the same six components.", RECALL_SEP2022, 39),
  fact("Bournewood (DoLS) and Tarasoff (duty to warn) are named as a case pair in the Mar 2023 recall's legal-cases section, matching the same pairing this app's own study guides already flag.", RECALL_MAR2023, 33),
  fact("Prader-Willi's equal (1:1) male:female prevalence is highlighted independently in both the Jun 2023 recall and the Recalls Solved compilation.", RECALL_JUN2023, 11),
  fact("QTc >500ms → reduce dose immediately and consider cardiology referral is stated in near-identical wording in both the Sep 2022 and Jun 2023 recalls.", RECALL_JUN2023, 21),
  fact("Block randomisation (equal group sizes, larger blocks = less predictable) is explained in matching terms in the Oct 2023 and Sep 2022 recalls.", RECALL_SEP2022, 45),
  fact("PRISMA having replaced QUOROM as the systematic-review reporting standard is stated in both the Mar 2023 and Sep 2022 recalls.", RECALL_SEP2022, 54),
  fact("Refeeding syndrome's mechanism (carbohydrate-driven insulin release causing intracellular phosphate/potassium/magnesium shift) is explained almost identically in the Oct 2023 and Sep 2022 recalls.", RECALL_SEP2022, 16),
];

const CONCENTRATION_TOPICS = [
  mockPoint("sensitivity", "Statistics: diagnostic-test calculations are this app's single highest-yield subtopic by mock-exam volume"),
  fact("Learning Disability: the 12-syndrome comparison table (genetics, features, exam clue) is the densest single recurring block across all 5 analysed recall sessions — memorise it once.", RECALL_JUN2023, 10),
  mockPoint("schizophrenia", "Adult Psychiatry: schizophrenia and mood-disorder management dominate this app's mock-exam question volume"),
  mockPoint("alzheimer", "Old Age Psychiatry: dementia differentials (Alzheimer's, DLB, vascular, FTD) are the most tested old-age subtopic"),
  fact("Forensic Psychiatry: named legal cases (Bournewood, Tarasoff, Osman, Gillick, Pritchard) plus specific memorised numbers (prison suicide rates, recidivism %) appear across 4 of the 5 analysed recall sessions.", RECALL_MAR2023, 33),
  fact("Perinatal Psychiatry: the drugs-in-pregnancy/neonatal-effects EMI format appears in 4 of the 5 analysed recall sessions.", RECALL_SEP2022, 1),
  fact("Psychotherapy: CAT/DBT/family-therapy terminology is tested in 4 of the 5 analysed recall sessions, always as short factual-recall items rather than scenario reasoning.", RECALL_JUN2023, 15),
  fact("Addiction Psychiatry: alcohol-withdrawal timeline and drug-specific withdrawal features appear in 3 of the 5 analysed recall sessions.", RECALL_SEP2022, 24),
  fact("Child & Adolescent Psychiatry: ADHD/OCD/depression NICE-guideline drug-choice questions appear in 3 of the 5 analysed recall sessions.", RECALL_JUN2023, 3),
  fact("Evidence-Based Medicine: reporting-guideline matching (CONSORT/PRISMA/STROBE/STARD/MOOSE) appears in 3 of the 5 analysed recall sessions.", RECALL_SEP2022, 54),
  fact("Research Methods: intention-to-treat vs per-protocol analysis, and randomisation/stratification distinctions, appear in 4 of the 5 analysed recall sessions.", RECALL_JUN2023, 45),
  fact("Epidemiology: Susser's criteria for causation (association, time order, direction as the three essential elements) appear in 3 of the 5 analysed recall sessions.", RECALL_SEP2022, 8),
];

const EXPECTED_TOPICS = [
  fact("Diagnostic-test-statistics worked calculations (Sn/Sp/LR+/post-test odds) have been the single most consistent question type across both this app's own mocks (all 14) and 4 of 5 analysed recall sessions — expect several worked-calculation stems again, with new numbers testing the same method.", RECALL_MAR2023, 20),
  fact("The LD syndrome comparison table's content has stayed essentially unchanged since at least the Sep 2022 session — a future paper is far more likely to re-test an existing syndrome than introduce a new one.", RECALL_SEP2022, 33),
  fact("Fitness to plead, automatism, and diminished responsibility recur as a paired forensic-legal trio across multiple sessions — expect at least one of the three each sitting.", RECALL_SEP2022, 39),
  fact("QTc-prolongation combination stems (a specific drug pairing plus an electrolyte or comorbidity) have appeared in most analysed sessions in slightly different combinations — expect the same stem shape with different drugs.", RECALL_JUN2023, 21),
  fact("The BALANCE (lithium vs valproate) and CUtLASS (FGA vs SGA efficacy) named trials recur as a pair in mood-stabiliser/antipsychotic-choice questions across sessions — worth knowing both by name and headline finding.", RECALL_MAR2023, 22),
  fact("Reporting-guideline matching (which acronym goes with which study type) has appeared in three of the five analysed sessions with the same 6-8 guidelines each time — a fixed, learnable set.", RECALL_MAR2023, 29),
  fact("Genomic imprinting (Prader-Willi = paternal deletion, Angelman = maternal deletion, Fragile X = imprinting error) has recurred every session analysed and is a strong candidate to recur again.", RECALL_SEP2022, 33),
  external(
    "Independent exam-prep commentary describes MRCPsych Paper B statistics as \"highly predictable and concept-driven\" once the recurring calculation types are learned, and notes that tables/flowcharts repeat with new numbers each session rather than new concepts — consistent with what this app's own corpus analysis found.",
    "https://mindrecalls.com/paper-b-study-pattern/"
  ),
  external(
    "Paper B is commonly described online as splitting revision effort roughly evenly between clinical psychiatry and statistics/critical appraisal, even though critical review alone carries 33.5% of marks — worth weighting revision time accordingly rather than by mark share alone.",
    "https://passmrcpsych.com/the-mrcpsych-paper-b-a-comprehensive-guide/"
  ),
];

// The bulk of the ~130-point independent summary, grouped by this app's own 15 topics — every
// point here is one NOT already used in REPEATED_TOPICS/CONCENTRATION_TOPICS/EXPECTED_TOPICS
// above, so nothing is stated twice across the branch (see CLAUDE.md-equivalent instruction:
// don't duplicate the same content across sections).
const TOPIC_GROUPS = [
  {
    topic: "Adult Psychiatry",
    points: [
      fact("Early-onset schizophrenia (vs adult-onset) shows poorer premorbid functioning, earlier developmental delays, and more impaired global IQ.", RECALL_JUN2023, 27),
      fact("Worse first-episode-psychosis outcome predictors: longer duration of untreated psychosis, male gender, non-adherence, poor premorbid adjustment, insidious onset, and comorbid substance use.", RECALL_JUN2023, 26),
      fact("DSM-5 requires 5 of 9 criteria for borderline personality disorder, including unstable self-image/relationships, impulsivity, self-harm, affective instability, micro-psychosis, and chronic emptiness.", RECALL_JUN2023, 29),
      fact("First-episode psychosis is treated with low-to-moderate dose antipsychotic monotherapy — well below doses used in established illness.", RECALL_JUN2023, 31),
      fact("Bipolar diagnosis is commonly delayed 8–10 years, is misdiagnosed in 20–60% of cases, and bipolar I is more diagnostically stable over time than bipolar II.", RECALL_JUN2023, 24),
      fact("In Alzheimer's BPSD, apathy is the most frequent symptom, ahead of depression, aggression, anxiety, and sleep disturbance.", RECALL_MAR2023, 2),
      fact("In renal impairment, haloperidol (low dose) is generally preferred; sulpiride/amisulpride should be avoided as they're renally cleared, and clozapine/chlorpromazine avoided for urinary retention risk.", RECALL_SEP2022, 20),
      fact("Extrapyramidal side-effect prevalence with older antipsychotics: dystonia ~10%, pseudo-parkinsonism ~20–25%, akathisia ~20–25%, tardive dyskinesia ~5% per year of exposure.", RECALL_SEP2022, 15),
    ],
  },
  {
    topic: "Perinatal Psychiatry",
    points: [
      fact("Around delivery, lithium is suspended 24–48h before a planned induction/C-section, checked 12h after the last dose, and restarted on postnatal day 1.", RECALL_OCT2023, 12),
      fact("Lithium monitoring in pregnancy is typically every 4 weeks until 34 weeks, then weekly until 2 weeks postpartum.", RECALL_OCT2023, 12),
      fact("Valproate exposure in pregnancy causes major malformations in up to 11% of children, including cleft palate, neural tube defects (1–2%), and developmental delay/autism.", RECALL_SEP2022, 2),
      fact("Paroxetine at high first-trimester dose is linked to cardiac malformations (VSD/ASD) — the highest cardiac risk of the SSRIs.", RECALL_OCT2023, 8),
      fact("Quetiapine is considered relatively safe in pregnancy due to low placental transfer; NICE favours it as an alternative to a mood stabiliser during pregnancy.", RECALL_SEP2022, 14),
      fact("For breastfeeding, lithium is contraindicated (40–50% of maternal serum level passes into milk); paroxetine has a lower milk/plasma ratio than fluoxetine or sertraline.", RECALL_SEP2022, 2),
      fact("Late-pregnancy SSRI exposure carries a small absolute increased risk of persistent pulmonary hypertension of the newborn, particularly with short-half-life drugs like paroxetine and venlafaxine.", RECALL_SEP2022, 23),
    ],
  },
  {
    topic: "Liaison Psychiatry",
    points: [
      fact("Ictal eye closure favours psychogenic non-epileptic seizures over true epileptic seizures; PNES episodes also tend to last longer (>2 minutes suggestive, >10 minutes strongly suggestive).", RECALL_JUN2023, 21),
      fact("Poor outcome after traumatic brain injury is linked to longer loss of consciousness, longer post-traumatic amnesia (>24h), older age, and reduced pre-injury cognitive reserve.", RECALL_JUN2023, 22),
      fact("rTMS is contraindicated with ferromagnetic/magnetic-sensitive implants near the coil field, and cautioned in prior stroke, brain tumour, or epilepsy.", RECALL_JUN2023, 29),
      fact("ICD-11's dissociative neurological symptom disorder (with speech disturbance) covers dysphonia/aphonia/dysarthria of psychological cause, often preceded by conflict or stress, not produced intentionally.", RECALL_JUN2023, 24),
    ],
  },
  {
    topic: "Emergency Psychiatry",
    points: [
      fact("NMS risk factors include high ambient temperature, dehydration, agitation/catatonia, rapid antipsychotic dose escalation, withdrawal of anti-parkinsonian medication, and depot/high-potency antipsychotics.", RECALL_JUN2023, 35),
      fact("Malignant catatonia can mimic NMS with immobility, rigidity, mutism, posturing, and excessive motor activity, and shares pathophysiological features with it.", RECALL_MAR2023, 4),
      fact("Lorazepam is first-line for catatonic/affective stupor, with rapid onset of benefit when effective (doses of 4mg/day up to 8–24mg/day if needed).", RECALL_JUN2023, 28),
      fact("QTc-prolongation risk factors: female sex, extremes of age, bradycardia/heart failure, liver disease, hypokalaemia/hypocalcaemia/hypomagnesaemia, stimulant use, and starvation.", RECALL_SEP2022, 1),
      fact("Delirium tremens starts 3–4 days after the last drink, occurs in 3–5% of those withdrawing, and carries 10–20% mortality if untreated.", RECALL_SEP2022, 24),
      fact("Lithium toxicity (>1.2mmol/L) presents with polyuria, abdominal pain, fine tremor, and myoclonic twitches.", RECALL_SOLVED, 7),
    ],
  },
  {
    topic: "Old Age Psychiatry",
    points: [
      fact("Rivastigmine has the best evidence in DLB/Parkinson's disease dementia — a large RCT (McKeith et al 2006) showed it alleviated hallucinations, delusions, anxiety, and apathy.", RECALL_OCT2023, 24),
      fact("The greatest risk factors for vascular dementia are high systolic and diastolic blood pressure, acting via stroke risk and white-matter change.", RECALL_OCT2023, 15),
      fact("MoCA (2005) is a 30-item, ~10-minute update to the MMSE (1975), available in 35+ languages, but cannot itself differentiate dementia subtypes.", RECALL_OCT2023, 31),
      fact("Alzheimer's risk is ~1% at 60, ~5% at 65, doubling roughly every 5 years, reaching ~40% by age 85.", RECALL_OCT2023, 40),
      fact("First-degree relatives of an Alzheimer's proband carry a 15–19% risk (vs 5% controls); APOE4 homozygotes carry 10–30× the risk of non-carriers.", RECALL_JUN2023, 33),
      fact("Frontotemporal dementia is highly heritable (~30% strong family history), mostly via autosomal dominant C9orf72, GRN, or MAPT mutations.", RECALL_JUN2023, 34),
      fact("DLB's core features (mnemonic REM-PCV) are fluctuating cognition, recurrent visual hallucinations, REM sleep behaviour disorder, and spontaneous parkinsonism, with neuroleptic sensitivity as a supportive feature.", RECALL_JUN2023, 36),
      fact("A third of late-life dementia risk is attributed to seven modifiable factors (low education, midlife hypertension/obesity, diabetes, inactivity, smoking, depression) — smoking has the largest population attributable fraction.", RECALL_MAR2023, 3),
    ],
  },
  {
    topic: "Psychotherapy",
    points: [
      fact("CAT's sequential diagrammatic reformulation (a visual flow-chart of the target problem procedure) is its distinguishing technique, built on the 3 Rs.", RECALL_SOLVED, 9),
      fact("'Acting out' is illustrated by missed therapy appointments or increased substance use precisely when therapeutic work becomes difficult.", RECALL_MAR2023, 6),
      fact("Displacement redirects emotion toward a safer target — separating the feeling from its real object to avoid confronting what's actually threatening.", RECALL_MAR2023, 6),
      fact("Yalom's therapeutic factors include catharsis, altruism, group cohesion, interpersonal learning, and installation of hope.", RECALL_MAR2023, 10),
      fact("Behavioural activation uses the TRAP model (Trigger, Response, Avoidance Pattern) to assess avoidance, aiming to replace it with TRAC (Alternate Coping).", RECALL_JUN2023, 16),
      fact("Motivational Interviewing's DEARS (Developing discrepancy, Empathy, Avoid arguments, Rolling with resistance, Support self-efficacy) starts by amplifying cognitive dissonance.", RECALL_JUN2023, 17),
      fact("DBT (Linehan, 1991) takes a hierarchical view of goals: reducing self-harm first, then therapy-interfering behaviours, then quality-of-life-diminishing behaviours.", RECALL_MAR2023, 3),
    ],
  },
  {
    topic: "Child & Adolescent Psychiatry",
    points: [
      fact("Atomoxetine is used when tics emerge as a side effect of stimulant treatment; clonidine/guanfacine is used when a comorbid tic disorder isn't secondary to stimulant use.", RECALL_JUN2023, 2),
      fact("ICD-11 requires ADHD symptoms be evident before age 12.", RECALL_JUN2023, 3),
      fact("Sertraline (from age 6) and fluvoxamine (from age 8) are the SSRIs licensed for paediatric OCD in the UK; paroxetine isn't recommended in this age group.", RECALL_JUN2023, 3),
      fact("Fluoxetine is the only antidepressant licensed for depression under 18 in the UK, creating a treatment dilemma when depression and OCD co-occur (since only fluvoxamine/sertraline are licensed for paediatric OCD).", RECALL_JUN2023, 3),
      fact("PTSD identification in children improves by asking the child directly about their experiences rather than relying only on caregiver history; drug treatment isn't routinely recommended.", RECALL_JUN2023, 16),
      fact("ADHD heritability (70–80%) is the highest of the listed childhood psychiatric conditions, with a 2–3× increased risk in siblings.", RECALL_MAR2023, 33),
      fact("Landau-Kleffner syndrome is a childhood epilepsy syndrome with onset usually before age 6, twice as common in boys.", RECALL_JUN2023, 11),
    ],
  },
  {
    topic: "Addiction Psychiatry",
    points: [
      fact("Amphetamine/cocaine withdrawal features hypersomnia, hyperphagia, depression ('crash'), irritability, agitation, and vivid dreams.", RECALL_JUN2023, 6),
      fact("Withdrawal psychosis occurs with alcohol and benzodiazepines but not typically with cannabis, cocaine, or heroin withdrawal.", RECALL_JUN2023, 6),
      fact("LSD carries no overdose risk and causes no physiological dependence or withdrawal — the least dependence-forming of the common illicit drugs.", RECALL_JUN2023, 7),
      fact("Amphetamine-induced psychosis resembles schizophrenia but with prominent visual/tactile hallucinations, hyperactivity, disinhibited behaviour, and little formal thought disorder.", RECALL_JUN2023, 8),
      fact("Around 30% of dependent cocaine users (and 12% of recreational users) show clinically relevant cognitive impairment, especially in sustained attention and working memory.", RECALL_JUN2023, 8),
      fact("Mephedrone is a synthetic cathinone stimulant (cathinone itself from the khat plant), producing effects similar to cocaine, MDMA, and amphetamines.", RECALL_JUN2023, 9),
      fact("Chronic ketamine use causes urinary tract symptoms (frequency, urgency, haematuria) via interstitial cystitis in up to 30% of users.", RECALL_SEP2022, 5),
    ],
  },
  {
    topic: "Forensic Psychiatry",
    points: [
      fact("Arson is most commonly associated with substance use disorders (especially alcohol) and antisocial personality disorder, alongside psychotic disorders and low intellectual functioning.", RECALL_JUN2023, 38),
      fact("Victims of female homicide perpetrators are often under 16; 13% of filicide perpetrators go on to suicide.", RECALL_JUN2023, 38),
      fact("Female intimate-partner-homicide perpetrators are most commonly aged 30–39 (average age 35).", RECALL_JUN2023, 38),
      fact("Among homicide perpetrators, 30% have a recorded mental disorder — personality disorder is the single most common diagnosis (27%), ahead of schizophrenia, substance use, and affective disorder (18% each of that 30%).", RECALL_MAR2023, 28),
      fact("Of indecent exposure offenders, 20% are first-time offenders and 20–30% reoffend; most have a prior history of sexual or non-sexual offending.", RECALL_SEP2022, 5),
      fact("Half of mentally ill perpetrators of child homicide have a psychotic disorder, and victims are disproportionately under 16.", RECALL_SEP2022, 10),
      fact("Mens rea (guilty mind/intent) and actus reus (the guilty act) are both required for an offence; mens rea cannot exist if a mental abnormality removes capacity for rational intent.", RECALL_MAR2023, 11),
    ],
  },
  {
    topic: "Learning Disability",
    points: [
      fact("Lesch-Nyhan syndrome (X-linked recessive, HPRT gene) causes hyperuricaemia, spasticity, choreiform movements, and severe self-mutilating biting behaviour.", RECALL_OCT2023, 11),
      fact("Down syndrome is the most common chromosomal cause of intellectual disability, Fragile X the most common inherited cause, and foetal alcohol syndrome the most common acquired cause; up to 60% of cases have no identifiable cause.", RECALL_OCT2023, 30),
      fact("Functional behavioural analysis (assessing behaviour, situation, consequence, and reinforcer) is the gold-standard first step before managing aggression or self-injury in intellectual disability.", RECALL_JUN2023, 13),
      fact("The normalisation principle argues people with intellectual disability should experience normal patterns of everyday life — changing the environment, not the individual.", RECALL_JUN2023, 14),
      fact("Diagnostic overshadowing describes clinicians attributing new physical or mental symptoms to a patient's pre-existing learning disability rather than investigating them.", RECALL_SEP2022, 36),
      fact("IQ bands: mild 50–69 (~85% of ID), moderate 35–49 (~10%), severe 20–34 (~3–4%), profound <20 (~1–2%, developmental level of a one-year-old).", RECALL_MAR2023, 7),
      fact("Recall distinguishes Lesch-Nyhan (severe self-mutilation) from Prader-Willi, Cri du Chat, Cornelia de Lange, and Smith-Magenis as EMI options for the same self-harm scenario.", RECALL_SOLVED, 4),
    ],
  },
  {
    topic: "Psychiatric Services & Rehabilitation",
    points: [
      fact("Nolan's Model for Improvement structures quality-improvement work around three questions: what are we trying to accomplish, how will we know a change is an improvement, and what changes will produce that improvement.", RECALL_JUN2023, 31),
      fact("Direct costs (staff, drugs, hospital space) are distinguished from indirect costs (lost patient/carer productivity) and intangible costs (pain, suffering, stigma) when costing a service.", RECALL_SEP2022, 11),
    ],
  },
  {
    topic: "Epidemiology",
    points: [
      fact("Sex-ratio table: Tourette's 2–5:1, ADHD (children) 2:1, ASD 4–5:1, Asperger's 5:1, depression 1:2, anorexia 1:9, bulimia 1:9, BPD 1:3 (male:female unless noted).", RECALL_JUN2023, 2),
      fact("Schizophrenia risk is 9% in siblings and 13% in children of an affected person (vs 1% general population); 17% in dizygotic twins and 48% in monozygotic twins.", RECALL_OCT2023, 30),
      fact("Almost all adults with Down syndrome develop Alzheimer's-like neuropathology by age 40, with amyloid pathology preceding cognitive impairment by 15–20 years.", RECALL_SEP2022, 13),
    ],
  },
  {
    topic: "Research Methods",
    points: [
      fact("Mean imputation of missing data in an ITT analysis injects false precision and increases the risk of a Type 1 (false positive) error.", RECALL_JUN2023, 40),
      fact("Randomisation controls both known and unknown confounders at the design stage; stratification controls confounders (and effect modifiers) at the analysis stage.", RECALL_JUN2023, 41),
      fact("Non-parametric test pairings: Wilcoxon signed-rank ↔ paired t-test, Mann-Whitney U ↔ unpaired t-test, Kruskal-Wallis ↔ one-way ANOVA.", RECALL_JUN2023, 42),
      fact("Cox proportional hazards assumes the hazard ratio between groups is constant over time; the log-rank test, unlike Cox regression, cannot adjust for other explanatory variables.", RECALL_JUN2023, 43),
      fact("Risk ratio can't be calculated in a case-control study (no true population denominator) — only odds ratio can; cohort studies allow direct relative-risk calculation.", RECALL_JUN2023, 46),
      fact("Per-protocol analysis (compliant patients only) is the antithesis of intention-to-treat and is better suited to testing a drug's biological efficacy than its real-world effectiveness.", RECALL_JUN2023, 44),
      fact("Imputing missing/unpublished smaller studies on a funnel plot reduces the risk of a Type 2 error and makes the plot more representative of true effect.", RECALL_SOLVED, 5),
    ],
  },
  {
    topic: "Evidence-Based Medicine / Critical Appraisal",
    points: [
      fact("Both the Galbraith plot and the forest plot can be used to check for heterogeneity between studies.", RECALL_SOLVED, 1),
      fact("The Belmont Report (1976, US National Commission) and the Declaration of Helsinki (1964, updated 2000/2002/2004) both set ethical principles for human-subject research, distinct from the Nuremberg Code's post-WWII focus on experimentation.", RECALL_OCT2023, 20),
      fact("Fisher's exact test is required instead of chi-square when any expected cell value in a comparison table falls below 5.", RECALL_MAR2023, 37),
      fact("A fixed-effects meta-analysis model assumes one shared true effect across studies and should only be used once heterogeneity is safely excluded; a random-effects model is used when heterogeneity exists and gives proportionally more weight to smaller studies.", RECALL_MAR2023, 38),
      fact("The F-statistic is the ratio of two variances.", RECALL_SOLVED, 7),
      fact("A very small p-value (e.g. 0.01) paired with a very narrow confidence interval typically signals a large sample size.", RECALL_SOLVED, 10),
    ],
  },
  {
    topic: "Statistics",
    points: [
      fact("NNT = 1/ARR, where ARR (absolute risk reduction) = EER − CER (experimental minus control event rate).", RECALL_SOLVED, 7),
      fact("Worked SEM example: SD 16, n 12 → SEM = 16/√12 ≈ 4.62.", RECALL_JUN2023, 46),
      fact("If a test's sensitivity increases at a fixed cut-off, the false-positive rate rises and specificity falls, because a lower threshold catches more true positives but also more false positives.", RECALL_MAR2023, 21),
      fact("Worked example: pre-test probability 1/8, sensitivity 80%, specificity 80% → pre-test odds 1/7, LR+ = 0.8/0.2 = 4, post-test odds = 1/7 × 4 = 4/7.", RECALL_MAR2023, 20),
      fact("Formal definitions: sensitivity = proportion of diseased correctly identified; specificity = proportion of well correctly excluded; PPV = proportion of positive results truly diseased; NPV = proportion of negative results truly disease-free.", RECALL_SEP2022, 49),
    ],
  },
];

function buildTopicSignal(topicId: string): ExamTrendTopicSignal {
  const topic = manifest.topics.find((t) => t.id === topicId);
  if (!topic) throw new Error(`Unknown topic id in SECTIONS mapping: ${topicId}`);

  const questions = readJsonIfExists<Question[]>(`questions/${topicId}.json`) ?? [];
  const guide = readJsonIfExists<StudyGuide>(`study-guides/${topicId}.json`);

  let highYieldTableCount = 0;
  const recurringTraps: ExamTrendTopicSignal["recurringTraps"] = [];
  for (const section of guide?.sections ?? []) {
    for (const block of section.blocks) {
      if (block.type === "table" && block.highYield) highYieldTableCount++;
      if (block.type === "trap") recurringTraps.push({ text: block.text, source: block.source });
      if (block.type === "trap-list") {
        for (const item of block.items) recurringTraps.push({ text: item.text, source: item.source });
      }
    }
  }

  return {
    topicId,
    topicTitle: topic.title,
    questionBankCount: questions.length,
    highYieldTableCount,
    // Cap at 6 per topic — this is a study-cram list, not a dump of everything already
    // available in full on the topic's own study guide page.
    recurringTraps: recurringTraps.slice(0, 6),
  };
}

const sections: ExamTrendSection[] = SECTIONS.map((s) => {
  const topicSignals = s.mappedTopics.map(buildTopicSignal);
  return {
    id: s.id,
    syllabusNumber: s.syllabusNumber,
    title: s.title,
    weightPercent: s.weightPercent,
    weightMarks: s.weightMarks,
    syllabusSource: {
      file: "exam-syllabic/exams-syllabic-curriculum-mrcpsych-february-2021.pdf",
      page: s.syllabusPage,
    },
    mappedTopics: s.mappedTopics,
    totalQuestionBankCount: topicSignals.reduce((sum, t) => sum + t.questionBankCount, 0),
    topicSignals,
  };
});

const data: ExamTrendsData = {
  weightSource: {
    text: "Mark/percentage breakdown per syllabus section, per the RCPsych Paper B blueprint (confirmed against an independent published guide, not just the syllabus PDF, which does not itself print a marks table).",
    url: "https://edubros.org/mrcpsych-paper-b-complete-guide/",
  },
  priorityAnalysis: {
    intro:
      "Both documents independently converge on ~12 recurring domains, ranked by how often each actually appears across real past recall papers rather than by curriculum weighting — a different, complementary lens to the official syllabus breakdown above.",
    goldenRules: GOLDEN_RULES,
    domains: PRIORITY_DOMAINS,
  },
  independentAnalysis: {
    methodology:
      "Built directly from this app's own corpus rather than citing the two documents above: (1) a mechanical keyword-frequency count across all 1578 already-parsed, already-cited mock-exam questions (content/questions/mock-*.json, 14 exams); (2) five real recall/answer-key PDFs from resources/paper-b/previous-year-question-source/ (Sep 2022, Mar 2023, Jun 2023, Oct 2023, and a compiled \"Recalls solved\"), read page-by-page with every extracted fact spot-checked against the source PDF. Two further free-form recall files in the same folder (Mar 2024, May 2025) have no page markers and a lot of hedged, uncertain phrasing, so — consistent with this app's existing stance on that folder — they were read for corroboration only, never cited as an individual fact. A web search for current trend commentary found nothing beyond the same handful of sites already reflected in the Priority & Recall Analysis branch; the two url-cited points below are the only web additions.",
    repeatedTopics: REPEATED_TOPICS,
    concentrationTopics: CONCENTRATION_TOPICS,
    expectedTopics: EXPECTED_TOPICS,
    topicGroups: TOPIC_GROUPS,
  },
  sections,
};

const outPath = path.join(CONTENT_DIR, "exam-trends.json");
fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n");
console.log(`Wrote ${sections.length} sections to ${outPath}`);
for (const s of sections) {
  console.log(`  ${s.syllabusNumber}. ${s.title}: ${s.totalQuestionBankCount} questions across ${s.mappedTopics.length} topic(s)`);
}
