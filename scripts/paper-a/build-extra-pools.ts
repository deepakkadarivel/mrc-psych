import fs from "node:fs";
import path from "node:path";
import { PAPER_A_CONTENT } from "./config";
import type { Question } from "../../lib/types";

/**
 * Extra, topic-matched questions a study guide may cite besides its own topic bank
 * (content/paper-a/questions/<topic>.json): 
 *  - mock questions whose course-printed label names the topic ("MoK Classification 046" -> Classification).
 *    The label is the course's own, not a judgment of ours; the map below is just label -> topic id.
 *  - EMI banks whose *file name* names the topic ("EMIs — Classification").
 * Written to content/paper-a/questions-extra/<topic>.json; verify-study-guide-citations.ts --paper-a accepts
 * citations to these in addition to the topic's own bank.
 */
const TAG_TO_TOPIC: Record<string, string> = {
  "Classification": "pa-classification",
  "Clinical Examination": "pa-clinical-examination",
  "Descriptive Psychopathology": "pa-descriptive-psychopathology",
  "Dynamic Psychopathology": "pa-dynamic-psychopathology",
  "Adverse Effects": "pa-adverse-drug-effects",
  "Basic Psychology": "pa-basic-psychology",
  "Social Psychology": "pa-social-psychology",
  "Molecular Genetics": "pa-molecular-genetics",
  "Sociocultural Psychiatry": "pa-sociocultural-psychiatry",
  "Applied Neuroscience": "pa-applied-neurosciences",
  "Pharmacokinetics": "pa-pharmacokinetics",
  "Pharmacodynamics": "pa-pharmacodynamics",
  "Basic Pharmacology": "pa-basic-pharmacology",
  "HumanDevelopment": "pa-human-development",
  "Neurochemistry": "pa-neurochemistry",
  "Neuroanatomy": "pa-neuroanatomy",
  "Neuropathology": "pa-neuropathology",
  "Neurophysiology": "pa-neurophysiology",
};
const EMI_TO_TOPIC: Record<string, string> = {
  "pa-emi-classification": "pa-classification",
  "pa-emi-clinical-examination": "pa-clinical-examination",
  "pa-emi-development": "pa-human-development",
};

const qdir = path.join(PAPER_A_CONTENT, "questions");
const out: Record<string, Question[]> = {};
const add = (topic: string, q: Question) => (out[topic] ??= []).push(q);

for (const f of fs.readdirSync(qdir).filter((f) => f.startsWith("pa-mock-"))) {
  for (const q of JSON.parse(fs.readFileSync(path.join(qdir, f), "utf-8")) as Question[]) {
    const label = q.tag?.replace(/^MoK\s+/, "").replace(/\s+\d+$/, "");
    const topic = label && TAG_TO_TOPIC[label];
    if (topic) add(topic, q);
  }
}
for (const [setId, topic] of Object.entries(EMI_TO_TOPIC)) {
  for (const q of JSON.parse(fs.readFileSync(path.join(qdir, `${setId}.json`), "utf-8")) as Question[]) add(topic, q);
}
fs.mkdirSync(path.join(PAPER_A_CONTENT, "questions-extra"), { recursive: true });
for (const [topic, qs] of Object.entries(out)) {
  fs.writeFileSync(path.join(PAPER_A_CONTENT, "questions-extra", `${topic}.json`), JSON.stringify(qs, null, 2));
  console.log(`${topic}: ${qs.length} extra questions`);
}
