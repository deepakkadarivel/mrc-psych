import fs from "node:fs";
import path from "node:path";
import type { Question } from "@/lib/types";

// Mechanical, auditable frequency count of curated clinical/exam terms across this app's own
// already-parsed, already-cited mock-exam corpus (content/questions/mock-*.json — 1578 real
// questions, each with a genuine {file,page,questionNumber} source). This is the "go through the
// mock exams" half of the independent trend analysis: real counts over real questions, not a
// model reading and summarising from memory. See scripts/build-independent-analysis.ts for how
// this feeds into the final content file.
const root = process.cwd();
const QUESTIONS_DIR = path.join(root, "content/questions");

const TERMS = [
  // Statistics / research methods
  "sensitivity", "specificity", "positive predictive value", "negative predictive value",
  "likelihood ratio", "number needed to treat", "odds ratio", "relative risk", "cohort study",
  "case-control", "randomised controlled trial", "randomisation", "blinding", "confounding",
  "forest plot", "meta-analysis", "systematic review", "kaplan-meier", "chi-square", "anova",
  "t-test", "mann-whitney", "wilcoxon", "regression", "correlation", "confidence interval",
  "publication bias", "heterogeneity", "intention to treat", "qualitative", "triangulation",
  "grounded theory", "thematic analysis", "sampling", "validity", "reliability", "consort",
  "prisma", "stard", "strobe", "qaly", "icer", "cost-effectiveness", "cost-utility",
  // Pharmacology
  "lithium", "valproate", "clozapine", "olanzapine", "quetiapine", "risperidone", "aripiprazole",
  "haloperidol", "sertraline", "fluoxetine", "paroxetine", "citalopram", "mirtazapine",
  "venlafaxine", "lamotrigine", "carbamazepine", "benzodiazepine", "extrapyramidal",
  "tardive dyskinesia", "akathisia", "neuroleptic malignant syndrome", "serotonin syndrome",
  "qtc", "agranulocytosis", "teratogenic", "breastfeeding", "pregnancy",
  // LD / genetics
  "fragile x", "down syndrome", "prader-willi", "angelman", "rett syndrome", "cri du chat",
  "williams syndrome", "smith-magenis", "lesch-nyhan", "tuberous sclerosis", "phenylketonuria",
  "trisomy", "genomic imprinting",
  // Dementia / old age
  "alzheimer", "lewy bod", "frontotemporal", "vascular dementia", "normal pressure hydrocephalus",
  "mild cognitive impairment", "delirium", "donepezil", "rivastigmine", "memantine",
  // Psychotherapy
  "cognitive analytic therapy", "dialectical behaviour therapy", "cognitive behavioural therapy",
  "family therapy", "psychodynamic", "transference", "countertransference", "defence mechanism",
  "motivational interviewing", "interpersonal therapy",
  // Forensic
  "fitness to plead", "automatism", "diminished responsibility", "homicide", "recidivism",
  "tarasoff", "bournewood", "gillick", "mens rea", "actus reus",
  // Child & adolescent
  "adhd", "autism", "tourette", "conduct disorder", "attachment", "separation anxiety",
  // Eating disorders / perinatal
  "anorexia", "bulimia", "refeeding syndrome", "postnatal depression", "postpartum psychosis",
  // Prevention / ECT / substance
  "primary prevention", "secondary prevention", "tertiary prevention", "electroconvulsive",
  "alcohol withdrawal", "opioid", "delirium tremens", "wernicke",
  // Personality / general adult
  "borderline personality", "antisocial personality", "schizophrenia", "bipolar", "mania",
  "obsessive compulsive", "panic disorder", "generalised anxiety",
];

interface TermStat {
  term: string;
  questionCount: number;
  mockCount: number;
  sample: { file: string; page: number; questionNumber?: number };
}

const files = fs.readdirSync(QUESTIONS_DIR).filter((f) => /^mock-\d+\.json$/.test(f));
const allByTerm = new Map<string, { count: number; mocks: Set<string>; sample?: Question }>();

for (const file of files) {
  const questions = JSON.parse(fs.readFileSync(path.join(QUESTIONS_DIR, file), "utf-8")) as Question[];
  for (const q of questions) {
    const haystack = `${q.stem} ${q.explanation} ${q.correctAnswer}`.toLowerCase();
    for (const term of TERMS) {
      if (haystack.includes(term)) {
        const entry = allByTerm.get(term) ?? { count: 0, mocks: new Set<string>(), sample: undefined };
        entry.count++;
        entry.mocks.add(file);
        entry.sample = entry.sample ?? q;
        allByTerm.set(term, entry);
      }
    }
  }
}

const stats: TermStat[] = [...allByTerm.entries()]
  .map(([term, v]) => ({
    term,
    questionCount: v.count,
    mockCount: v.mocks.size,
    sample: v.sample!.source,
  }))
  .sort((a, b) => b.mockCount - a.mockCount || b.questionCount - a.questionCount);

const outPath = path.join(root, "scripts/.mock-frequency.json");
fs.writeFileSync(outPath, JSON.stringify(stats, null, 2) + "\n");
console.log(`Analyzed ${files.length} mock files. Wrote ${stats.length} term stats to ${outPath}`);
console.log("Top 30 by session spread:");
for (const s of stats.slice(0, 30)) {
  console.log(`  ${s.term}: ${s.questionCount} questions across ${s.mockCount}/${files.length} mocks`);
}
