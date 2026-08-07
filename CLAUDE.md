# mrc-psych — MRCPsych Paper B Study App

A static Next.js app (deployed to Vercel Hobby) that turns real SPMM course material into
condensed revision notes, tables, mnemonics, quizzes, and a performance tracker, for
MRCPsych Paper B on 2026-10-06.

Build plan / architecture record: `/Users/deepakkadarivel/.claude/plans/happy-hopping-flamingo.md`

## The one rule that matters more than any other

**Never state an exam fact, table cell, or answer without a `{file, page}` citation back to a
real PDF in `resources/paper-b/`.** This app exists specifically because the user does not want
to be misled during exam prep. If a fact can't be traced to a source page, it doesn't go in
`content/`, full stop — flag it as a gap instead (see "Gaps" below).

Invented content (mnemonics, memory aids) is allowed but must render with an explicit
"Mnemonic — not in source" label so it's never visually confused with cited fact.

## Corpus map (`resources/paper-b/`) — source of truth, never edit these

- `books/` — 18 PDFs, genuine SPMM prose notes, one per curriculum topic (adult ×2, child,
  addiction, forensic ×2, learning disability, old age, perinatal, liaison, emergency,
  psychotherapy, psychiatric services, epidemiology, stats ×3). **Known issue**: pdftotext
  extraction corrupts this font's encoding — spaces render as `!`/`"`, hyphens/apostrophes as
  `?` (e.g. `NCS?R`). `scripts/lib/pdf-text.ts` must normalize this; verify cleaned output
  against the real PDF before trusting it, don't guess at the mapping.
- `question_bank/` — 94 PDFs, Moodle "Attempt review" quiz exports (question + options +
  explanation + reference), grouped by topic folder.
- `mocks/SPMM Mocks.pdf` — 1996 pages, 13 mock exams × 150 Qs, same Attempt-review format.
- `previous-year-question-source/` — mostly free-form student-compiled recall notes (PDF/docx,
  no consistent question/answer markers — deliberately NOT parsed into Question[], see
  `app/recalls/page.tsx`, link-out only). One exception: "Paper B Mock Exam 14 _april_2024_).pdf"
  in this same folder IS in the structured Attempt-review format — it's parsed as mock-14
  by `scripts/extract-mocks.ts`, not treated as a recall.

## Content pipeline (`scripts/` → `content/`)

`content/*.json` is generated, but committed to git (not regenerated at deploy/build time —
Vercel builds from the committed JSON, it doesn't re-run pdftotext).

Two independent parsers, not one universal one — the formats are genuinely different:
1. **Books → notes**: `pdftotext -layout`, split on the `\f` page-break character so every
   block keeps its exact source page, light cleanup only (fix the known encoding corruption),
   no rewriting — text must stay checkable against the page it cites.
2. **Question banks / mocks / recalls → questions**: one state-machine parser keyed on the
   literal recurring markers already in the text (`Question N`, `Select one:`,
   `Explanation:`, `Ref:`, `The correct answer is:`). SBA vs EMI is read from the text pattern
   itself (`Select one:` = SBA; shared option list across stems = EMI) — never inferred.
   `.docx` recalls go through `mammoth`, not a new system dependency like pandoc.

Before scaling a parser to the full corpus, spot-check its output against the actual PDF page
it claims to cite. A parser that's "probably right" across 94 files is worse than one verified
on 3 and then scaled.

## App architecture

- Next.js App Router, TypeScript, Tailwind, shadcn/ui, `output: 'export'` (static — must work
  on Vercel Hobby and GitHub Pages both).
- Every topic page is a left/right split (`components/topic-view.tsx`, shadcn `resizable`):
  notes on the left, an embedded PDF viewer on the right. The left panel shows **one note block
  at a time with Prev/Next** (not a scrolling list — was originally a long scroll, changed on
  user feedback for better study-session UX), and the right panel auto-follows to that block's
  source page — no separate citation-click needed since there's only one block in view.
- PDF viewer (`components/pdf-viewer.tsx`) uses `react-pdf` (pdf.js), not a plain
  `<iframe src=".../file.pdf#page=N">`. The iframe version was tried first (simpler, no
  dependency) but every page change reloaded the whole PDF from scratch — visible flicker,
  since changing an iframe's `src` is a real nested navigation even for a same-document hash
  change. react-pdf's `<Document file={url}>` keeps the file loaded in memory; changing
  `<Page pageNumber={n}>` alone re-renders just that page, no reload, as long as `file` (a
  plain URL string) doesn't change — which it doesn't for same-book page navigation. Must be
  dynamically imported with `ssr: false` (see `topic-view.tsx`/`quiz-view.tsx`) — pdf.js needs
  browser APIs not available during Next's static-export prerender. Worker is configured via
  `pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url)` — confirmed Turbopack emits this correctly into the static export
  (`out/_next/static/media/pdf.worker.min-*.mjs`).
- **`pdfjs-dist` must stay pinned to exactly what `react-pdf` depends on internally**
  (currently `5.4.296` — check `react-pdf`'s own `package.json` dependency, don't assume it
  won't change on a `react-pdf` upgrade). We install it directly only so our own
  `workerSrc` import resolves; pnpm hoists our top-level version and that's what actually gets
  served, so if it doesn't match react-pdf's bundled API version you get
  `UnknownErrorException: The API version "X" does not match the Worker version "Y"` at
  runtime — a version mismatch, not a code bug. After changing it, `rm -rf .next` and restart
  the dev server (Turbopack/HMR won't swap an already-instantiated Worker; the browser tab
  needs a hard reload too, not just HMR).
- Deploy: `output: 'export'` in `next.config.ts`. `public/sources/` is gitignored and
  regenerated by `scripts/copy-sources.ts` via `predev`/`prebuild` npm hooks (copies from
  `resources/paper-b/`, which IS committed) — avoids duplicating ~290MB of PDFs a second time
  inside `public/`. Vercel runs `prebuild` automatically as a normal npm lifecycle script.
- Tracker: `lib/tracker-store.ts` exposes a `TrackerStore` interface. `LocalTrackerStore`
  (localStorage) is the only implementation until Supabase credentials are provided by the
  user — then add `SupabaseTrackerStore` behind the same interface and swap in one place.
  Don't build the Supabase implementation speculatively before creds exist.

## Attempt-review parser — verified findings (don't re-derive these)

`scripts/lib/parse-attempt-review.ts` is verified against real files: exact question-count
match on a plain SBA file (90/90) and an EMI file (99/99), scale-tested across all 94
`question_bank/` PDFs (3224 questions, 0 empty stems) and the 1996-page `mocks/SPMM Mocks.pdf`
(1472 questions, all 13 exams detected). Known, real (not bugs) properties to remember:

- **`question_bank/STAT MCQ/`** is a byte-for-byte duplicate export of the same questions
  already in `Advanced Statstics/`, `EBM/`, and `Research Methods/` (confirmed identical
  question counts per matching filename) — skip it, don't double-parse.
- **EMI question option lists are not recoverable from these PDFs.** The Moodle export
  rendered each EMI sub-item's answer as a "Choose..." dropdown placeholder — the actual list
  of choosable items never appears as extractable text. `options: []` for EMI questions is
  correct, not a bug — don't try to reconstruct a fabricated option list.
- **Some questions have no extractable `correctAnswer`** (no literal "The correct answer is:"
  line) — mainly complex multi-part EMI/scenario questions where the answer is stated in prose
  inside the explanation instead. Leave `correctAnswer` empty in that case; the explanation
  still carries the real answer. Don't force-parse an answer out of prose.
- A minority of files (the whole Advanced Statistics bank, for one) never print an
  "Explanation:" label — the explanation text runs straight on after "Your answer is
  (in)correct." The parser already falls back to that span; if a future file introduces yet
  another framing, extend the fallback, don't add a special case per file.
- **Known unsolved limitation, mocks/previous-year PDFs only**: ligature glyphs (fi/ff/fl)
  extract out of visual order in these specific PDFs (e.g. "identi ed" with a stray "fi" landing
  on the next line) — a different, harder corruption than the books/ space/hyphen substitution.
  **Partially fixed**: `scripts/lib/pdf-text.ts` exports `extractPdfPagesRaw` (uses `pdftotext
  -raw`, which keeps the ligature glyph immediately adjacent instead of scattered) and
  `mergeOrphanLigatures` (glues an orphan ligature line onto the end of the previous line —
  fixes "sta"+"ff"→"staff"). Deliberately does NOT also glue the line after the ligature (would
  fix "identi"+"fi"+"ed"→"identified" too, but there's no reliable way to tell a word-suffix
  like "ed" apart from a genuine next word like "compared" without a dictionary — see the
  function's own comment). Net effect: most words are fixed, some still read like "identifi ed"
  — readable, not silently wrong. `scripts/extract-mocks.ts` uses this raw+merge path; books/
  and question_bank/ still use `-layout` and are unaffected. Don't try to close the remaining
  gap with more regex guessing.
- **Bold/heading-run corruption is per-file, not one fixed substitution.** Confirmed variants
  beyond the R→T example above: `(` / `)` as space substitutes in `6-psychiatric-services.pdf`,
  `&` and `'` as substitutes in `15-2-statistics.pdf` ("Clinical&guidelines&",
  "TIME'FACTOR:'"). Body prose cleanup (`cleanBookText`) stays reliable everywhere — it's only
  bold/heading runs that vary per file. Don't write a fix for one file's symbol and assume it
  generalizes; treat every garbled heading as its own spot-check, not a pattern to codify.

## Notes segmenter — verified findings

`scripts/lib/segment-book.ts` splits books/ text into NoteBlocks at numbered heading lines
("1. Major Depressive Disorder"), filtered by a word-count/punctuation heuristic to reject
numbered body lists ("4. Level 1: Citalopram was given (n = 3671...)") that match the same
shape. Verified on `7-1-adult-psychiatry-1.pdf`: 28 blocks, all but one genuine section
headings (one numbered-list item, "2. Improving medication adherence.", slipped through — rare,
acceptable, don't chase to zero). If a heading looks garbled (e.g. "problemTsolving" for
"problem-solving", "HIVEassociated" for "HIV-associated", stray "(" / ")" as space substitutes),
that's the known bold-font corruption noted above, not a segmenter bug — don't try to
auto-correct it, flag for a human page check instead.

A follow-up pass (`MIN_WORDS_FOR_OWN_HEADING`) merges headings with <15 words of body text into
the previous block, since real sections always carry substantial prose while stray numbered
list items (ICD-10 criteria, checklists) don't. This isn't perfect — on some files (addiction,
forensic, psychiatric-services) a genuine numbered criteria list still ends up as several small
per-item blocks instead of one merged section, and a rare diagram/flowchart caption extracts as
a near-meaningless heading (e.g. "3. Diagnosis to outcome node D death)V" in
psychiatric-services). This is a quality/granularity issue, not a fidelity one — every block's
page citation and text are still genuinely from that page. Don't keep tuning this heuristic
further per-file; it's good enough, and chasing every book's list formatting isn't worth it.

## shadcn/ui gotcha on this version

This project's shadcn/ui components (`Button`, `SidebarMenuButton`, etc.) use Base UI's
`render` prop, not Radix's `asChild`. To render a component as a different element:

```tsx
<Button render={<Link href="/foo" />}>Text</Button>
```

not `<Button asChild><Link href="/foo">Text</Link></Button>` — that fails typecheck.

The editor/language-server may warn that a callback prop on a "use client" component (e.g.
`StudyGuideView`'s `onCite`) "must be serializable" / should be named `...Action` — this rule is
meant for Server→Client boundaries; it doesn't apply here (both components are client-side) and
doesn't block `pnpm build`. Don't rename working callback props to chase this cosmetic warning.

Whenever `Button`'s `render` target isn't a real `<button>` (e.g. a `Link`/`<a>`), also pass
`nativeButton={false}` — otherwise Base UI logs a console error every render ("expected a
native <button>...").

`ResizablePanelGroup` also isn't the classic react-resizable-panels API: use `orientation="horizontal"`, not `direction="horizontal"`.

## Layout height must be bounded, not `min-h-*`

The root layout (`app/layout.tsx`) uses `h-full`/`overflow-hidden` at every level (html → body →
`SidebarProvider` → `main`), not shadcn's default `min-h-svh` on the sidebar wrapper. With
`min-h-*`, a topic/quiz page's content can make the whole document taller than the viewport,
which (a) breaks the header's stickiness, (b) breaks each `ResizablePanel`'s own internal
scrolling (nothing left to clip to), and (c) was very likely the cause of the "page freezes on
opening a topic" report — `ResizablePanelGroup`'s internal resize-observer logic re-measures on
every layout change, and an unbounded, content-growing container feeds it a loop of those.
`main` is `h-full flex flex-col overflow-hidden` with a `shrink-0 sticky` header bar and a
`flex-1 overflow-y-auto` content wrapper; page-level components (topic/quiz views) then use
`ResizablePanelGroup className="h-full"` — never a hardcoded `calc(100vh-...)`, which fights
this chain instead of relying on it. If you add a new page, don't reach for `min-h-screen` or
similar — let the existing chain carry the height down and just fill `h-full`.

## Study guides (`content/study-guides/*.json`)

Built on top of the notes/questions extraction, one per topic — condensed bullets, comparison
tables, mnemonics, examiner traps, and gaps, all citation-verified against the already-extracted
`content/notes/<topic>.json` / `content/questions/<topic>.json` (never against the raw PDFs
directly — those two JSON files are the source of truth for what a citation is allowed to point
to). Schema: `StudyGuide` in `lib/types.ts`.

**The core safety mechanism is extraction-framing, not a post-hoc hallucination check**: every
bullet/cell/trap must restate something the cited NoteBlock/Question actually says — compression
of given text, never "write about this topic and cite something plausible afterward." A model's
own trained psychiatric knowledge bleeding in and looking like it came from the source is the
specific failure mode this guards against.

`scripts/verify-study-guide-citations.ts` mechanically checks every citation's `{file, page,
questionNumber?}` exists in the topic's source JSON — run it after touching any study guide. It
catches fabricated/wrong citations, but NOT a true citation attached to a false claim; that only
gets caught by the extraction-framing above plus manual spot-checks. Don't treat a clean
verification run as proof of correctness by itself.

Two topics (`research-methods`, `evidence-based-medicine`) have no book PDF (manifest `gap`
field) — their guides are built entirely from question explanations and are thinner by
necessity; that's correct, not a bug to fix by padding with unsourced content.

If delegating more topics to parallel agents later: give each its own uniquely-named scratchpad
script path — two agents writing a same-named temp script to a shared /tmp location caused one
silent build failure during this session (caught because the agent verified the output file's
existence/content immediately after each run — keep doing that).

## Working conventions

- pnpm, not npm/yarn (already on this machine).
- Run extraction scripts via `./node_modules/.bin/tsx scripts/extract-notes.ts <topic-ids...>`,
  not `pnpm exec tsx ... <topic-ids...>` — `pnpm exec` silently drops extra positional args
  beyond the script path, so multi-topic batch runs produce zero output with no error.
- Ship vertical slices per topic, not a big-bang extraction of all 18 topics before anything
  is visible in the app — verify each topic end-to-end (notes render, citations jump to the
  right page, quiz is takeable, tracker logs it) before moving to the next.
- No Supabase, no auth, no server backend until the user hands over credentials.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
