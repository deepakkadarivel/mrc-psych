import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import type { Question, Source, StudyGuide } from "../../lib/types";
import { realPathForSource } from "./config";

/**
 * Fidelity audit for Paper A study guides: for every claim that carries a citation, check that its content words and
 * NUMBERS occur in the cited source (the PDF page for notes citations — layout AND raw text, to survive column
 * interleaving — or the question's stem/options/answer/explanation for question citations). It cannot prove a claim
 * is right, but a low overlap or a number missing from the cited source is exactly what a wrong/misattributed
 * citation or a trained-knowledge fact looks like. Usage: tsx scripts/paper-a/audit-guides.ts [topic-id ...] [--all]
 */
const root = path.join(process.cwd(), "content/paper-a");
const all = process.argv.includes("--all");
const FIX = process.argv.includes("--fix");  // repoint single note-page citations whose text clearly lives on another page of the same PDF
const dry: string[] = [];
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));

// ---- sources ----
const qIndex = new Map<string, string>();
for (const dir of ["questions", "questions-extra"]) {
  for (const f of fs.readdirSync(path.join(root, dir))) {
    for (const q of JSON.parse(fs.readFileSync(path.join(root, dir, f), "utf-8")) as Question[]) {
      qIndex.set(`${q.source.file}|${q.source.page}|${q.source.questionNumber}`, [q.stem, ...q.options, q.correctAnswer, q.explanation, q.reference ?? ""].join(" "));
    }
  }
}
const pageCache = new Map<string, string[]>();
function pdfPages(file: string): string[] {
  if (!pageCache.has(file)) {
    const real = realPathForSource(file)!;
    const run = (args: string[]) => {
      const raw = execFileSync("pdftotext", [...args, real, "-"], { maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] }).toString();
      const pages = raw.split("\f");
      if (pages[pages.length - 1].trim() === "") pages.pop();
      return pages;
    };
    const lay = run(["-layout"]);
    const raw = run(["-raw"]);
    pageCache.set(file, lay.map((p, i) => p + " " + (raw[i] ?? "")));
  }
  return pageCache.get(file)!;
}
function sourceText(s: Source): string {
  if (s.questionNumber !== undefined) return qIndex.get(`${s.file}|${s.page}|${s.questionNumber}`) ?? "";
  return pdfPages(s.file)[s.page - 1] ?? "";
}

// ---- tokens ----
const STOP = new Set(
  "that this with from have been were their there which when what where while these those than then them they also into more most such only other about between because would could should being does done each both over under after before again very much many some will shall same used uses using like make made well just upon within without across through during against among whether either neither however therefore thus hence per via than not notes note question questions keyed key answer answers explanation explanations option options states state stated says said mock bank pool trap gap text page source cited exam sba emi both wrong tempting distractor correct incorrect true false item items example examples including include includes called known termed referred described describes describe given gives give shown shows show listed lists list".split(" ")
);
// Guide text cites questions by number ("Q26", "mock 1 test 6 q55", "EMI Q9"): those numbers are references, not claims.
const stripRefs = (t: string) =>
  t.replace(/\bq\d+\b/gi, " ").replace(/\b(?:mock|emi)\b[^.;:]{0,22}?\bq?\d+/gi, " ");
const stripRefsOld = (t: string) =>
  t.replace(/\b(?:mock|emi|e|x|b)?\s?\d*\s?(?:test\s\d+\s)?q?\d+(?:[-/]\d+)?\b(?=[:\s,)(;.]|$)/gi, (m) => (/q\s?\d+|^[exb]\d+$|^mock|^emi/i.test(m) ? " " : m));
const strip = (t: string) =>
  t.replace(/\*\*|==/g, "").replace(/ﬁ/g, "fi").replace(/ﬂ/g, "fl").replace(/[ ]/g, " ").toLowerCase();
function words(t: string): string[] {
  return (strip(t).match(/[a-z]{4,}/g) ?? []).filter((w) => !STOP.has(w));
}
function nums(t: string): string[] {
  return (strip(stripRefs(t)).match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(",", "."));
}
const stem = (w: string) => w.slice(0, 5);

interface Claim { where: string; text: string; sources: Source[]; refs?: Source[] }
function claimsOf(g: StudyGuide): Claim[] {
  const out: Claim[] = [];
  const mark = () => out.forEach((c) => { if (!c.refs) c.refs = c.sources.length === 1 ? c.sources : undefined; });
  g.sections.forEach((s) => {
    const sec = s.title.slice(0, 40);
    s.blocks.forEach((b, bi) => {
      const w = `[${sec}] #${bi} ${b.type}`;
      if (b.type === "paragraph") out.push({ where: w, text: b.text, sources: [b.source] });
      else if (b.type === "trap") out.push({ where: w, text: b.text, sources: [b.source] });
      else if (b.type === "gap") { if (b.source) out.push({ where: w + ` (${b.subtopic.slice(0, 30)})`, text: b.note, sources: [b.source] }); }
      else if (b.type === "trap-list") b.items.forEach((it, i) => out.push({ where: `${w}.${i}`, text: it.text, sources: [it.source] }));
      else if (b.type === "table" || b.type === "comparison") {
        // rows are cited by the table's source list as a whole; check each row against the union
        b.rows.forEach((r, i) => out.push({ where: `${w} "${(b.title ?? "").slice(0, 25)}" row${i}`, text: r.join(" "), sources: b.sources }));
      }
    });
    s.concise?.bullets.forEach((x, i) => out.push({ where: `[${sec}] concise${i}`, text: x.text, sources: [x.source] }));
    s.concise?.facts?.forEach((x, i) => out.push({ where: `[${sec}] fact${i}`, text: `${x.label} ${x.value}`, sources: [x.source] }));
  });
  const walk = (nodes: NonNullable<StudyGuide["mindMap"]>, trail: string) =>
    nodes.forEach((n) => {
      if (n.source && !n.children?.length) out.push({ where: `mindMap ${trail} > ${(n.label ?? "").slice(0, 30)}`, text: n.label ?? "", sources: [n.source] });
      if (n.children?.length) walk(n.children, trail ? trail : (n.label ?? "").slice(0, 20));
    });
  if (g.mindMap) walk(g.mindMap, "");
  mark();
  return out;
}

// Where else in the topic's own sources do the claim's words live? (a wrong page/question citation shows up here)
const poolCache = new Map<string, Array<{ label: string; words: Set<string> }>>();
function pool(topic: string, files: string[]) {
  if (!poolCache.has(topic)) {
    const items: Array<{ label: string; words: Set<string> }> = [];
    for (const f of files) pdfPages(f).forEach((t, i) => items.push({ label: `${f.split("/").pop()} p${i + 1}`, words: new Set(words(t).map(stem)) }));
    for (const dirn of ["questions", "questions-extra"]) {
      const fp = path.join(root, dirn, `${topic}.json`);
      if (fs.existsSync(fp)) for (const q of JSON.parse(fs.readFileSync(fp, "utf-8")) as Question[])
        items.push({ label: `Q${q.source.questionNumber} (${q.source.file.split("/").pop()} p${q.source.page})`, words: new Set(words([q.stem, ...q.options, q.correctAnswer, q.explanation].join(" ")).map(stem)) });
    }
    poolCache.set(topic, items);
  }
  return poolCache.get(topic)!;
}
function bestAlt(topic: string, cw: string[], cited: Source[]): string {
  const files = [...new Set(cited.filter((s) => s.questionNumber === undefined).map((s) => s.file))];
  const sec = files.length ? files : ["paper-a/MRCPSYCH PAPER A SECTIONS/" + sectionFileFor(topic)];
  let best = { label: "-", score: 0 };
  for (const it of pool(topic, sec)) {
    const sc = cw.filter((w) => it.words.has(stem(w))).length / Math.max(1, cw.length);
    if (sc > best.score) best = { label: it.label, score: sc };
  }
  return `${best.label} (${best.score.toFixed(2)})`;
}
const SECTION_FILES: Record<string, string> = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf-8")).topics.reduce((a: Record<string, string>, t: { id: string; bookFiles: string[] }) => ({ ...a, [t.id]: t.bookFiles[0].replace("paper-a/MRCPSYCH PAPER A SECTIONS/", "") }), {});
const sectionFileFor = (topic: string) => SECTION_FILES[topic];

const dir = path.join(root, "study-guides");
const flagged: string[] = [];
let checked = 0;
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const id = f.replace(/\.json$/, "");
  if (only.length && !only.includes(id)) continue;
  const g = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as StudyGuide;
  const seen = new Set<string>();
  let gFlag = 0, gN = 0, dirty = false;
  for (const c of claimsOf(g)) {
    // gap/trap/list texts that explicitly contrast "the notes" with a question quote a second source: out of scope here
    if (/\bnotes?\b/i.test(c.text) && /\b(trap|gap|trap-list)\b/.test(c.where)) continue;
    gN++; checked++;
    const srcText = [...new Set(c.sources.map((s) => `${s.file}|${s.page}|${s.questionNumber ?? ""}`))]
      .map((k) => { const [file, page, qn] = k.split("|"); return sourceText({ file, page: +page, questionNumber: qn ? +qn : undefined }); })
      .join(" ");
    const srcWords = new Set(words(srcText).map(stem));
    const srcNums = new Set(nums(srcText));
    const cw = [...new Set(words(c.text))];
    const miss = cw.filter((w) => !srcWords.has(stem(w)));
    const cov = cw.length ? 1 - miss.length / cw.length : 1;
    const numMiss = [...new Set(nums(c.text))].filter((n) => !srcNums.has(n) && n.length > 1 || (!srcNums.has(n) && /\./.test(n)));
    const key = c.where + "|" + c.text.slice(0, 40);
    if (seen.has(key)) continue;
    seen.add(key);
    // a claim is suspicious when most of its content words are absent from its citation, or specific numbers are
    if ((cw.length >= 6 && cov < 0.5) || (numMiss.length > 0 && cov < 0.8) || (all && (cov < 0.7 || numMiss.length))) {
      gFlag++;
      const alt = bestAlt(g.topic, cw, c.sources);
      const m = /^(.*) p(\d+) \(([\d.]+)\)$/.exec(alt);
      if (c.refs && c.refs[0].questionNumber === undefined && m && m[1] === c.refs[0].file.split("/").pop() && +m[2] !== c.refs[0].page && +m[3] >= 0.75 && +m[3] >= cov + 0.2) {
        dry.push(`${id} | ${c.where.slice(0, 60)} | p${c.refs[0].page} -> p${m[2]} (cov ${cov.toFixed(2)} -> ${m[3]}) | ${strip(c.text).slice(0, 70)}`);
        if (FIX) { c.refs[0].page = +m[2]; dirty = true; }
      }
      flagged.push(`${id} | ${c.where} | cov ${cov.toFixed(2)} | missing nums [${numMiss.join(",")}] | missing words [${miss.slice(0, 8).join(",")}]\n     cites ${c.sources.map((x) => x.questionNumber !== undefined ? `${x.file.split("/").pop()?.slice(0, 22)} Q${x.questionNumber}(p${x.page})` : `p${x.page}`).join(" ")} | best match: ${alt}\n     ${strip(c.text).slice(0, 170)}`);
    }
  }
  if (dirty) fs.writeFileSync(path.join(dir, f), JSON.stringify(g, null, 2));
  console.log(`${id}: ${gN} cited claims, ${gFlag} flagged`);
}
fs.writeFileSync(path.join(process.cwd(), ".audit-flagged.txt"), flagged.join("\n"));
if (dry.length) console.log(`\n${FIX ? "REPOINTED" : "WOULD REPOINT"} ${dry.length}:\n` + dry.join("\n"));
console.log(`\n${checked} claims checked, ${flagged.length} flagged -> .audit-flagged.txt`);
