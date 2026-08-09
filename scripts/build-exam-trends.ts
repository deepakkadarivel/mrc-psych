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
  sections,
};

const outPath = path.join(CONTENT_DIR, "exam-trends.json");
fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n");
console.log(`Wrote ${sections.length} sections to ${outPath}`);
for (const s of sections) {
  console.log(`  ${s.syllabusNumber}. ${s.title}: ${s.totalQuestionBankCount} questions across ${s.mappedTopics.length} topic(s)`);
}
