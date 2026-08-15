// One-off extractor for resources/paper-b/references/*.docx -> content/references.json.
// Link directories, not exam facts — no {file,page} citation needed (see CLAUDE.md), just
// preserve which source file a section came from. Uses mammoth (already a dependency for the
// recalls docx) + a small regex walk over its <p> output, since the doc is a flat, uniform list
// of <p><strong>heading</strong></p> / <p>title <a>url</a></p> / <p>title</p><p><a>url</a></p>
// paragraphs — not worth adding an HTML-parser dependency for.
import fs from "node:fs";
import path from "node:path";
import mammoth from "mammoth";

interface RefItem {
  title: string;
  url: string;
}

interface RefSection {
  heading: string;
  items: RefItem[];
}

interface RefFile {
  file: string;
  title: string;
  sections: RefSection[];
}

const REFERENCES_DIR = path.join(process.cwd(), "resources/paper-b/references");
const OUT_PATH = path.join(process.cwd(), "content/references.json");

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .trim();
}

function extractLink(html: string): { title: string; url: string } | null {
  // Anchor text always repeats the URL, so drop it; use text before/after the <a> tag as the
  // title instead — some items have a trailing note like "(all parts)" after the link.
  const m = html.match(/^(.*?)<a href="([^"]+)">.*?<\/a>(.*)$/);
  if (!m) return null;
  const before = stripTags(m[1]);
  const after = stripTags(m[3]);
  const url = m[2].replace(/&amp;/g, "&");
  const title = [before, after].filter(Boolean).join(" ");
  return { title, url };
}

async function extractFile(fileName: string): Promise<RefFile> {
  const relFile = `references/${fileName}`;
  const full = path.join(REFERENCES_DIR, fileName);
  const { value: html } = await mammoth.convertToHtml({ path: full });
  const paras = [...html.matchAll(/<p>(.*?)<\/p>/g)].map((m) => m[1]);

  const title = stripTags(paras[0] ?? fileName);
  const sections: RefSection[] = [];
  let current: RefSection | null = null;

  for (let i = 1; i < paras.length; i++) {
    const p = paras[i];
    const boldMatch = p.match(/^<strong>(.*?)<\/strong>$/);
    const link = extractLink(p);

    if (boldMatch) {
      current = { heading: stripTags(boldMatch[1]), items: [] };
      sections.push(current);
      continue;
    }

    if (link) {
      // title + link in the same paragraph
      if (!current) {
        current = { heading: title, items: [] };
        sections.push(current);
      }
      current.items.push(link);
      continue;
    }

    const next = paras[i + 1];
    const nextLink = next ? extractLink(next) : null;
    if (nextLink) {
      // bare title paragraph immediately followed by a link-only paragraph
      if (!current) {
        current = { heading: title, items: [] };
        sections.push(current);
      }
      current.items.push({ title: stripTags(p), url: nextLink.url });
      i++;
      continue;
    }

    // plain paragraph not followed by a link => a sub-heading (doc doesn't bold every heading)
    current = { heading: stripTags(p), items: [] };
    sections.push(current);
  }

  return { file: relFile, title, sections: sections.filter((s) => s.items.length > 0) };
}

async function main() {
  const files = fs.readdirSync(REFERENCES_DIR).filter((f) => f.endsWith(".docx"));
  const results = await Promise.all(files.map(extractFile));
  fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2) + "\n");
  console.log(`Wrote ${OUT_PATH}: ${results.length} file(s), ${results.reduce((n, r) => n + r.sections.reduce((m, s) => m + s.items.length, 0), 0)} links total`);
}

main();
