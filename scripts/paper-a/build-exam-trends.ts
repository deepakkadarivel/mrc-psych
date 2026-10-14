import fs from "node:fs";
import path from "node:path";
import { PAPER_A_CONTENT } from "./config";
import type { PaperAManifest, PaperATrendsData, RecallCluster, RecallsFile } from "../../lib/types";

/**
 * Builds content/paper-a/exam-trends.json from content/paper-a/recalls.json (+ recall-clusters.json and
 * the already-fetched web findings in content/paper-a/exam-trends-web.json). Every number is a count over
 * those files; nothing here is estimated. Area membership of a topic is this app's own mapping, not official.
 */
const read = <T>(rel: string): T => JSON.parse(fs.readFileSync(path.join(PAPER_A_CONTENT, rel), "utf-8")) as T;
const recalls = read<RecallsFile>("recalls.json");
const clusters = read<{ clusters: RecallCluster[] }>("recall-clusters.json").clusters;
const web = read<{
  blueprint: Array<{ area: string; questions: string; percent: string; sourceUrl: string; reliability: string }>;
  format: { text: string; sourceUrl: string };
  commentary: Array<{ claim: string; topic: string; sourceUrl: string; reliability: string }>;
  notFound: string[];
}>("exam-trends-web.json");
const manifest = read<PaperAManifest>("manifest.json");

const AREA_TOPICS: Record<string, string[]> = {
  "Behavioural Science and Socio-cultural Psychiatry": ["pa-basic-psychology", "pa-social-psychology", "pa-sociocultural-psychiatry", "pa-dynamic-psychopathology"],
  "Human Development": ["pa-human-development"],
  "Basic Neurosciences": ["pa-applied-neurosciences", "pa-neuroanatomy", "pa-neurochemistry", "pa-neuropathology", "pa-neurophysiology", "pa-molecular-genetics"],
  "Clinical Psychopharmacology": ["pa-basic-pharmacology", "pa-pharmacokinetics", "pa-pharmacodynamics", "pa-adverse-drug-effects"],
  "Classification and Assessment in Psychiatry": ["pa-classification", "pa-clinical-examination", "pa-descriptive-psychopathology", "pa-rating-scales", "pa-syndromes"],
};

const byId = new Map(recalls.points.map((p) => [p.id, p]));
const total = recalls.points.length;
const titleOf = (id: string) => (id === "pa-other" ? "Other (ethics, therapies, research…)" : manifest.topics.find((t) => t.id === id)?.title ?? id);

const bankCount = (id: string) => {
  const p = path.join(PAPER_A_CONTENT, "questions", `${id}.json`);
  return fs.existsSync(p) ? (JSON.parse(fs.readFileSync(p, "utf-8")) as unknown[]).length : 0;
};

const validClusters = clusters
  .map((c) => ({ ...c, ids: c.ids.filter((i) => byId.has(i)) }))
  .filter((c) => new Set(c.ids.map((i) => byId.get(i)!.sitting)).size >= 2);

const topicIds = [...manifest.topics.map((t) => t.id), "pa-other"];
const topics = topicIds.map((id) => {
  const pts = recalls.points.filter((p) => p.topic === id);
  const perSitting: Record<string, number> = {};
  pts.forEach((p) => (perSitting[p.sitting] = (perSitting[p.sitting] ?? 0) + 1));
  return {
    id,
    title: titleOf(id),
    recallPoints: pts.length,
    recallPercent: Math.round((pts.length / total) * 1000) / 10,
    sittingsSeen: Object.keys(perSitting).length,
    perSitting,
    repeatedFacts: validClusters.filter((c) => byId.get(c.ids[0])!.topic === id).length,
    bankQuestions: bankCount(id),
  };
});

const areas = web.blueprint.map((b) => {
  const ids = AREA_TOPICS[b.area] ?? [];
  const n = topics.filter((t) => ids.includes(t.id)).reduce((s, t) => s + t.recallPoints, 0);
  return {
    id: b.area.toLowerCase().replace(/[^a-z]+/g, "-"),
    title: b.area,
    officialQuestions: b.questions,
    officialPercent: parseFloat(b.percent),
    topicIds: ids,
    recallPoints: n,
    recallPercent: Math.round((n / total) * 1000) / 10,
  };
});

const trendClusters = validClusters
  .map((c) => {
    const pts = c.ids.map((i) => byId.get(i)!);
    const sittings = [...new Set(pts.map((p) => p.sitting))].sort();
    const answers = [...new Set(pts.map((p) => p.answer).filter((a): a is string => !!a))].slice(0, 4);
    return { label: c.label, topic: byId.get(c.ids[0])!.topic, kind: c.kind, sittings, ids: c.ids, answers };
  })
  .sort((a, b) => b.sittings.length - a.sittings.length || b.ids.length - a.ids.length);

const files = new Set<string>();
recalls.points.forEach((p) => files.add(p.source.file));
const data: PaperATrendsData = {
  totals: { points: total, sittings: recalls.sittings.length, files: files.size, clusters: trendClusters.length },
  sittings: recalls.sittings.map((id) => ({ id, points: recalls.points.filter((p) => p.sitting === id).length })),
  blueprint: { source: web.blueprint[0]?.sourceUrl ?? "", format: web.format.text, reliability: web.blueprint[0]?.reliability ?? "" },
  areas,
  topics: topics.filter((t) => t.recallPoints > 0).sort((a, b) => b.recallPoints - a.recallPoints),
  clusters: trendClusters,
  external: web.commentary.map((c) => ({ claim: c.claim, topic: c.topic, url: c.sourceUrl, reliability: c.reliability })),
  notFound: web.notFound,
};
fs.writeFileSync(path.join(PAPER_A_CONTENT, "exam-trends.json"), JSON.stringify(data, null, 1));
console.log(`${total} points, ${trendClusters.length} repeated clusters, ${data.topics.length} topics`);
