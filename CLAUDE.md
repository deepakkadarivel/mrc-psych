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
- Every topic page (`components/topic-view.tsx`) is a single scrolling column showing the study
  guide directly — there's no outer content-switching tab row anymore. The raw source book/notes
  and the source PDF both live together in a **right-side drawer overlay**
  (`components/ui/sheet.tsx`, `side="right"`) on top of that content, not a permanent side column
  and not a below-content section. This went through several earlier layouts before landing here,
  each dropped on explicit user feedback: a `ResizablePanelGroup` side panel (too much like a
  permanent two-column split), then a below-content section you had to scroll down to reach
  (technically one column, but "scrolls completely down" was still the wrong feel for something
  you want quick access to), then an outer "Study Guide"/"Source Notes" tab pair on the main page
  (the user wanted the raw notes "remote from the main page" entirely, alongside the PDF, not a
  second tab competing with the study guide for the page's main content). A drawer gives
  one-column content *and* instant access, without a scroll. See "Print-document design system"
  and "Consolidated sticky header" below. Inside the drawer, a small `<Tabs>` switches between
  **Source** (the PDF, `components/pdf-viewer.tsx`) and **Source Notes** (the raw book text, one
  note block at a time with Prev/Next — not a scrolling list, changed on earlier user feedback for
  better study-session UX); paging through Source Notes updates which page the Source tab shows,
  and citing a source elsewhere in the study guide always switches the drawer to the Source tab at
  that exact page.
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

`ResizablePanelGroup` also isn't the classic react-resizable-panels API: use `orientation="horizontal"`, not `direction="horizontal"`. Also on this v4: `ResizablePanel`'s `defaultSize`/`minSize`/`maxSize` take a bare `number` as *pixels*, not percent — pass a numeric *string* (`"26"`) for a percentage, or you get e.g. a panel clamped to a few px instead of the intended 26% (see "Print-document design system" → Notes tab below for the concrete bug this caused).

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

Built on top of the notes/questions extraction, one per topic — but the shape is `sections[]`,
each with `blocks[]`, not the flat `condensedNotes`/`tables`/`mnemonics`/`examinerTraps`/`gaps`
arrays this originally shipped with. The flat shape was replaced (all 15 topics reformatted, one
hand-built as a template then 14 delegated to parallel agents) to match a reference note format
the user actually used to pass this exam: numbered sections read top-to-bottom, with tables,
mnemonics, and traps interleaved right next to the concept they relate to, instead of siloed into
separate detached lists. Schema: `StudyGuide`/`Section`/`Block` in `lib/types.ts`.

`Block` is a tagged union on `type`: `paragraph` (the old bullet), `table` (optionally carrying a
`category: {label, color}` for genuinely multi-group content — see below), `comparison` (an "X
vs Y" head-to-head table, no `highYield` field), `mnemonic`, `trap` (red, not amber — see the
"RichText"-adjacent styling note below), `trap-list` (a titled bullet list of several short
one-fact recall traps grouped together, e.g. "MCQ Traps — Remember These!", instead of one box
per trap), and `gap`. All citation-bearing fields (`source`/`sources`) are unchanged in shape.

**Category colors (`table.category.color`, `lib/category-colors.ts`)**: one of
`teal`/`orange`/`red`/`gray`/`blue`/`purple`. Only assign a category when the SOURCE TEXT ITSELF
states a multi-group classification (e.g. a book bullet that literally says "Good prognostic
factors: ... Poor: ...", or headers a section "1. Immature Defence Mechanisms" / "2. Neurotic
..." / "3. Mature ..."). Never invent a categorization from trained psychiatric knowledge that
isn't explicit in the extracted text — assigning a category to a fact is itself a claim ("this
fact belongs in this group"), not a free restyling, and needs the same source-grounding
discipline as the fact itself. Most tables legitimately have no category — that's expected, not
a gap to fill. Genuine examples already in the corpus: adult-psychiatry's Good/Poor Prognostic
Factors (teal/red), psychotherapy's Immature/Neurotic/Mature defence mechanisms (red/orange/teal,
Vaillant's own tiering), statistics' Random/Non-Random sampling (blue/gray) and Cost/Benefit
types (orange/teal), epidemiology's three sex-preponderance groups, perinatal's maternal/foetal
risk split, child-psychiatry's conduct-disorder protective/poor-prognostic factors.

**The core safety mechanism is extraction-framing, not a post-hoc hallucination check**: every
paragraph/cell/trap must restate something the cited NoteBlock/Question actually says —
compression of given text, never "write about this topic and cite something plausible
afterward." A model's own trained psychiatric knowledge bleeding in and looking like it came from
the source is the specific failure mode this guards against. This applies with equal force to
*reorganizing* existing verified content: splitting one bullet into several table rows, or
grouping traps into a `trap-list`, must not silently misattribute which specific fact a row/item
came from — re-check against `content/notes/<topic>.json` / `content/questions/<topic>.json`
whenever a split or grouping is ambiguous, don't just trust the prior prose's phrasing blindly.

`scripts/verify-study-guide-citations.ts` walks `sections[].blocks[]` and mechanically checks
every citation's `{file, page, questionNumber?}` exists in the topic's source JSON — run it after
touching any study guide. It catches fabricated/wrong citations and structural mistakes (a source
attached to the wrong block type), but NOT a true citation attached to a false claim, and NOT a
fact sorted into the wrong category — those only get caught by the extraction-framing above plus
manual spot-checks. Don't treat a clean verification run as proof of correctness by itself.
`scripts/emphasize-study-guides.ts` similarly walks the new nested structure now.

Two topics (`research-methods`, `evidence-based-medicine`) have no book PDF (manifest `gap`
field) — their guides are built entirely from question explanations and are thinner by
necessity; that's correct, not a bug to fix by padding with unsourced content.

If delegating more topics to parallel agents later: give each its own uniquely-named scratchpad
script path — two agents writing a same-named temp script to a shared /tmp location caused one
silent build failure during this session (caught because the agent verified the output file's
existence/content immediately after each run — keep doing that). Also budget for platform
session-usage limits mid-run on a large fan-out (this reformat hit one on 9 of 14 agents at
once) — check the actual file on disk before assuming a "failed" agent lost its work; several had
already written and self-verified successfully before the API cut them off mid-report.

## Concise Guide (`Section.concise`, the "Concise Guide" tab)

An exam-cram compression of the Full Guide, one section at a time, added on top of the existing
`sections[].blocks[]` — not a separate parallel file, so it can't drift out of sync with the Full
Guide it's compressing. Schema (`lib/types.ts`):

```ts
interface ConciseBullet { text: string; source: Source }
interface ConciseSection { bullets: ConciseBullet[]; highlightBlockIndices?: number[] }
// added to Section: concise?: ConciseSection
```

**What "concise" means here, precisely** (confirmed with the user via `AskUserQuestion` before
writing any of it): compression/rephrasing of existing facts into shorter bullets is allowed —
this is NOT a retain-verbatim-sentences-only pass — but every bullet's `source` must be the exact
same `{file, page, questionNumber?}` as the block it was compressed from. This is the same
extraction-framing discipline as the rest of this project's content (see "The core safety
mechanism is extraction-framing" above), applied to compression instead of splitting/regrouping —
compress what the cited block already says, never add a fact from trained psychiatric knowledge
just because it would plausibly follow.

`highlightBlockIndices` is an array of indices into that *same* `Section.blocks[]` — it resurfaces
this section's own tables/mnemonics/traps verbatim (via the shared `BlockView` dispatcher) instead
of re-summarizing them as prose, since those block types are already concise by nature. Because
it's an index into the live `blocks` array rather than a duplicated copy, the Concise tab can
never show a stale/diverged version of a table the Full Guide has since changed.

**UI**: `ConciseTabView` in `study-guide-view.tsx` uses the exact same left-panel-list +
detail-pane pattern as the Notes tab (the user asked for this explicitly: "build the concise tab
topic wise similar to how we have designed the notes"). Both tabs are now thin wrappers around a
shared `SectionListDetail` component (nav list + `ResizablePanelGroup` desktop / stacked-pill
mobile scaffold) — extracted specifically so the two tabs can't visually drift apart from each
other. Each concise bullet (`ConciseBulletView`) is a numbered marker plus slightly heavier
(`font-medium`) text — deliberately NOT a boxed card: an earlier version boxed every bullet
individually, and the user asked for "simpler but emphasised" instead, since a whole list of
bordered one-liners read as busier than the "quick to read" goal this tab exists for. A section
with no `concise`
entry is simply omitted from the tab's own section list (not an error); a topic with *no* sections
processed yet shows a plain "not yet available" message instead of an empty panel — this is a
topic-by-topic rollout, not all-or-nothing.

**Rollout state**: complete — all 15 topics, 281 sections total, every section has a `concise`
entry (verified by walking every `content/study-guides/*.json` file and asserting none is
missing). `adult-psychiatry` was the hand-built template (all 18 sections), reviewed before
scaling; the other 14 were delegated to parallel agents, each given this section's
`ConciseBullet`/`ConciseFact` contract, the adult-psychiatry.json result as a worked example, and
the same "compress the section's own blocks only, exact-citation, spot-check before scaling"
instructions. Same workflow the original study-guide reformat used. Two agents (forensic-
psychiatry, learning-disability) caught and self-corrected off-by-one citation-index bugs in their
own draft before writing the final file — expect this kind of error and have agents check for it
themselves, don't just trust a clean first pass.

**`ConciseFact` (the `facts` array) was added after the template's first review round** — the user
asked for a more structured/scannable representation for genuinely tabular content ("term/metric →
number") than a numbered sentence, without turning *every* concise item into a table (most bullets
are still sentence-shaped and read worse forced into rows). This is an editorial per-fact choice
made when the content is written, not something inferred from bullet text — see `ConciseFact`'s
own comment in lib/types.ts for why auto-detecting the shape from prose wasn't the approach taken.

`scripts/verify-study-guide-citations.ts` checks `concise.bullets[].source` and
`concise.facts[].source` against the topic's notes/questions (same as every other citation) and
validates `highlightBlockIndices` are in range for that section's `blocks` — run it after
adding/editing any topic's concise content.

## RichText must not return a Fragment

`components/rich-text.tsx` wraps its output in a single `<span>`, not a `Fragment`. This isn't
cosmetic: a `Fragment`'s children flatten directly into whatever parent renders `<RichText/>`,
so if that parent is `display:flex`/`grid`, every emphasized word-chunk becomes its own flex/grid
item instead of flowing as one block of inline text — this is exactly what broke the Notes
accordion (screenshot showed bullet text shattered into a jagged multi-column grid, one column
per bold/highlighted fragment). If you ever see study-guide text rendering as disconnected
word-chunks instead of flowing prose, check two things: (1) `RichText` still returns a real
wrapping element, and (2) the immediate parent markup around `<RichText/>` isn't itself
`flex`/`grid` with `RichText` as one of several siblings inside it — put `RichText` inside its
own non-flex block (a `<p>`/`<span>`) and make THAT block the flex item, not `RichText` directly.

## Study guide emphasis markup

`content/study-guides/*.json` bullet/table-cell/trap/gap text may contain
`**bold**`/`*italic*`/`==highlight==` markdown-lite markup, rendered by `components/rich-text.tsx`
(`RichText`). All three are mechanical, not hand-typed — never hand-type `**`/`*`/`==` into 15
files individually, extend the relevant script/regex instead.

**Bold** (`scripts/lib/emphasize.ts`'s `emphasize()`, run via `scripts/emphasize-study-guides.ts`):
clinically-loaded abbreviations (2+ consecutive uppercase letters/digits — real prose essentially
never does this by accident, e.g. `NICE`, `SSRI`, `DSM-5`, `STAR*D`) and a curated drug-name list.
A short stoplist (`SR`/`XR`/`CR`/etc.) prevents double-bolding a drug's release-form suffix right
next to the drug name itself.

**`emphasize()` is NOT idempotent — do not re-run `scripts/emphasize-study-guides.ts` against
content it has already processed.** Confirmed empirically: running it a second time against
already-`**bolded**` text produces `****OR****`-style corruption, because the acronym/drug regex
passes re-match text that's already inside `**` markers with no "already bolded" guard on that
first pass. Only run this script against a *newly generated* topic's guide (one that has never
been through it), never as a blanket "re-apply emphasis to everything" pass — if you want more
drugs covered or a broader acronym rule, either hand-verify the idempotency of your change first,
or process only the new/changed topics.

**Highlight** (`highlightKeyFacts()` in the same file, run via a *separate* script,
`scripts/highlight-study-guides.ts` — deliberately not called from inside `emphasize()`, for the
idempotency reason above) wraps percentages (`70%`, `12.5%`) and "N in M" ratios (`1 in 5`) in
`==...==`, rendered as a literal-hex highlighter-pen `<mark>` (amber bg, amber-900 text) in
`RichText`. This is a *bounded* reintroduction of inline highlighting, not a reversal of the
earlier "no per-number coloring" decision (see below) — it targets two specific, unambiguous
numeric patterns (a percentage is always a percentage) rather than colorizing numbers generally,
and was explicitly requested and confirmed by the user (`AskUserQuestion`: "stronger bold/italic +
a distinct highlight for critical facts", not a return to broad number-highlighting). Unlike
`emphasize()`, `highlightKeyFacts()` alone IS idempotent (checks `alreadyMarked` for both `**` and
`==` before wrapping) — confirmed empirically — so it's safe to re-run against already-processed
content, including content `emphasize()` has already bolded.

`RichText`'s `<strong>` renders `font-extrabold` (not `font-bold`) and `Paper`'s own
`[&_strong]:font-extrabold` override must match — Paper's descendant selector has higher CSS
specificity than a plain class on the element, so if these two ever drift apart, Paper's class
wins regardless of what `RichText` sets locally; keep them in sync if you touch either.

**Sub-points from inline enumerations** (`splitEnumeratedClauses()` in `study-guide-view.tsx`,
used by `ParagraphBlockView`): a paragraph like "reduces X by (1) doing A and (2) doing B" renders
as a lead-in line plus indented sub-bullets, instead of one dense run-on sentence — the user's own
example. This happens **purely at render time**, splitting the *existing* text on its own `(1)`,
`(2)`, `(3)`... markers with no words added, removed, or reworded and the same citation carried
onto the last sub-bullet — there is no fabrication risk the way editing the JSON text would carry.
Only triggers when markers start at `(1)` and run strictly sequentially with 1-2 digits each; this
is what excludes false positives found in the real corpus during testing: `Section 5(2)` /
`Section 5(4)` (not sequential from 1), a citation year `(1998)` (too many digits), and inline
counts like `borderline (5) and dependent (4)` (doesn't start at 1). Verified against ~20 real
paragraphs pulled from multiple topics (not just the one that prompted this) before shipping.
Scoped to `ParagraphBlockView` only — deliberately not applied to `TrapListBlockView`, table
cells, or mnemonic expansions, which have their own already-verified formatting.

Do not set an explicit theme-token text color (`text-foreground`, etc.) on `RichText`'s
`<strong>`/`<em>` — they intentionally inherit color from their parent so the same component
renders correctly both inside the theme-aware app chrome (Source Notes tab) and inside the
always-light study-guide "paper" content (see below), which fixes text to a literal hex
regardless of app theme. An explicit theme-token color there would win over the parent's literal
color and make bold/italic text unreadable in dark mode inside the always-light paper.

There is no auto-chart-from-table feature — `components/table-chart.tsx` and
`components/ui/chart.tsx` were deleted (the reference design never uses charts, only
tables/text/boxes; don't re-add this without re-checking that decision too).

## Print-document design system (`components/study-guide-view.tsx`)

The Study Guide tabs (Full Guide/Notes/Tables/Mnemonics/Traps/Gaps) are styled to visually match
two reference PDFs the user actually studied from
(`resources/paper-b/study-format-design-reference/`), not a generic app aesthetic — the user's
own words: it should feel like reading a printed study document, not browsing a website.

**The palette is literal hex values extracted from the reference PDFs, not Tailwind's stock
colors** — `lib/category-colors.ts` exports `CATEGORY_COLOR_CLASSES` (teal/orange/red/gray/blue/
purple: header bg, alternating-row tint, border, text) plus `DEFAULT_TABLE_COLORS` (navy —
**every** table in the reference has a colored header, there's no neutral/plain table; tables
with no `category` get this navy default) and `COMPARISON_TABLE_COLORS` (reuses gray, for
`comparison`-type blocks). Row striping **alternates** by index (`ri % 2`) even within a
category-colored table — don't tint every row uniformly, that doesn't match the source.

**This content is pinned to a fixed light "paper" look regardless of the app's light/dark
theme** — confirmed with the user explicitly. The `Paper` wrapper component sets
`bg-white text-[#1A1A1A]` via literal Tailwind arbitrary values, never theme tokens
(`bg-background`/`text-foreground`/etc.), and none of the block-view components use `dark:`
variants. Only the surrounding app chrome (header bar, `TabsList`, sidebar) still follows the
app's normal theme — the split is deliberate, not an oversight.

Two structural details that are easy to get wrong (both were wrong in an earlier pass — verified
against every page of the reference PDFs, not samples, before fixing):
- **Exam trap boxes have a full border on all four sides** (`border-2`), not a left-accent
  border.
- **"MCQ Traps — Remember These!" lists have NO box at all** — just a colored heading
  (`text-[#C0392B]`, ⚡) followed by a plain bullet list in normal body-text color. Don't wrap
  this in an `Alert`/card — that was tried once and was a genuine misread of the reference.

**Deliberate, disclosed scope cuts** (don't "fix" these without re-reading the plan/CLAUDE-md
history first): the reference sometimes nests lettered sub-sections inside a numbered section
(e.g. "1. Defence Mechanisms" containing "A. Mature Defences", "B. ...") — our content stays
flattened to one heading level per `Section`, not revisited. All `paragraph` blocks render as a
plain bulleted list (small round bullet) rather than distinguishing flowing prose from condensed
facts, since the schema doesn't carry that distinction. One exceptional highlighted row inside an
otherwise-plain reference table (seen once in the source) isn't reproduced — no per-row metadata
for it.

Content sits inside a `max-w-[880px] mx-auto` container (`Paper`) so line length stays readable
regardless of viewport width.

**Single column, not a side-by-side split, PDF as a right-side drawer** (`components/topic-view.tsx`).
Went through three layouts: (1) `ResizablePanelGroup` with the PDF as a resizable side panel
(dropped — a permanent two-column split, not what "put the reference on top or below... one
column" asked for); (2) a `PdfViewer` section mounted *below* the tabs with a `scrollIntoView`
effect (dropped — technically one column, but the user reported "the source PDF now scrolls
completely down," i.e. reaching it meant scrolling through the whole guide); (3) the current
design — the header/tabs/content render as normal page flow (no side panel, no below-content
section), and the PDF opens as a right-side `Sheet` drawer (`components/ui/sheet.tsx`,
`side="right"`) overlaying that content, toggled by the header button or a citation click. A
drawer gets you both properties at once: the page content itself stays one column, and the PDF is
reachable instantly without scrolling. Identical at every breakpoint — no separate mobile code
path (`useIsMobile()` was deleted along with layout (1), not reintroduced for the drawer either;
`Sheet` is already responsive — full-ish width in this project's mode with `data-[side=right]:sm:max-w-2xl`
capping it to a comfortable reading width on desktop, base `w-3/4` on mobile). One consequence
worth knowing: dropping the side panel/below-content section let the component drop its own
`h-full`/`overflow-hidden` chain entirely — the page just flows normally inside the root layout's
one `flex-1 overflow-y-auto` container (see "Layout height must be bounded" above) rather than
needing its own nested bounded-height/scroll region. Don't reintroduce `ResizablePanelGroup` or a
nested `overflow-y-auto` here without a reason.

**The drawer's z-index must stay below the sticky header's, not above it.** shadcn's `Sheet`
(Base UI Dialog) ships at `z-50`. The consolidated header (see "Consolidated sticky header" below)
was originally `z-20` — with the drawer open, its `fixed inset-y-0 right-0` popup painted *over*
the top-right of the page, including the header's own PDF-toggle button, so the button became
unclickable (clicks were intercepted by the drawer's close button/PDF content instead) — this is
what surfaced as "fix that layer changes" in user feedback. Fixed by raising the header to
`z-[60]` (strictly above the Sheet/Dialog's `z-50`) in `app/layout.tsx`, so the header — and
anything in it — always stays clickable above any drawer/dialog the page opens, regardless of
DOM order (the Sheet portals to the end of `<body>`, so equal z-index would have let it win on
paint order alone).

**Individual blocks render as bordered cards; `Section`s themselves do NOT.** Tables, mnemonics,
traps, and gaps each get the `rounded-xl border shadow-sm` header/body/footer-strip treatment. A
`Section` in the Full Guide tab is just a heading (`SectionHeading`: navy `border-b-2`, icon,
title) followed by its intro/blocks in normal flow — **not** wrapped in one more enclosing card.
An earlier pass put the whole section (heading + intro + every block inside it) in a single outer
card too; the user explicitly flagged this as "the entire main content is in a card, remove the
main card wrapper" — one card nested around everything read as one giant box, not a page of
distinct cards. Don't reintroduce an outer `SectionCard`-style wrapper. The one other deliberate
exception: **`TrapListBlockView` ("MCQ Traps") has no box either** — per the structural finding
above, the reference renders these as a plain heading + bullet list. Giving it more visual weight
without a box means a bigger heading, a `Zap` icon, and a `border-b-2` colored rule instead of a
background/border.

**Citations render inline, right after the text — never as a flex sibling pinned to the row's far
right edge.** `ParagraphBlockView` and `TrapListBlockView`'s items used to lay out as `bullet +
<p className="flex-1">text</p> + <CitationBadge/>` in one flex row; with the badge pinned to the
container's right edge and the text left-aligned, this visually read as two columns — text on the
left, a "reference column" of badges running down the right — which is exactly what the user
flagged as a leftover two-column layout even after the PDF side-panel was removed. Fixed by moving
`<CitationBadge>` inside the flowing `<p>`/`<span>`, immediately after the text (`{" "}` then the
badge, `className="align-middle"`) — it now wraps with the text like a footnote mark, not a
separate column. Table/comparison-block citations stay in their own footer strip (that's a real
table footer, not this two-column bug) and mnemonic/trap citations stay in their header/footer
bars — only the plain bullet-list blocks had this problem.

**Table columns wrap instead of scrolling horizontally.** The root cause of an earlier
"tables scroll off the right edge" complaint: `components/ui/table.tsx`'s `TableHead`/`TableCell`
both ship `whitespace-nowrap` as a base class, which — combined with the `Table` wrapper's
`overflow-x-auto` — forces wide unwrapped columns to overflow rather than wrap. Fixed by
overriding at the call site (`TABLE_HEAD_CLASS`/`TABLE_CELL_CLASS` constants in
`study-guide-view.tsx`): `whitespace-normal break-words`, plus `h-auto` on the head cell since
wrapped header text needs more than the primitive's fixed `h-10`. Also pass `table-fixed` on
`<Table>` so column widths respect the container instead of growing to fit content. Fixed at the
call site, not in the shared `components/ui/table.tsx` primitive — that primitive is used
elsewhere in the app (quiz views) where the default single-line behavior is still correct; don't
"fix" it globally.

**`RichText`'s `strong`/`em` get a consistent accent color from the `Paper` wrapper**
(`[&_strong]:text-[#1B3A5C] [&_em]:text-[#4A5568]`), not from `RichText` itself — added in response
to "text doesn't have proper... emphasis." A later round did reintroduce a *bounded* form of
inline highlighting (percentages/ratios only, via `==...==`/`<mark>` — see "Study guide emphasis
markup" above) after the user explicitly asked for it and confirmed via `AskUserQuestion` that
this wasn't meant as a full reversal of the earlier "match reference exactly, no per-number
coloring" decision. Don't widen the highlight regex to cover more number types without checking
that section first — the whole point of stopping at percentages/ratios was staying unambiguous.

**The "Notes" tab (`NotesTabView`) is a resizable left-panel-list + right-panel-detail layout, not
an accordion.** It originally rendered every section as an `AccordionItem` you expand in place.
The user asked to replace that with something "similar to how we have a main left panel that would
list all the topics" (i.e. `AppSidebar`): a nav list of section titles on the left, the selected
section's paragraph notes on the right; clicking a title swaps the detail pane instead of
expanding/collapsing in place. Plain `useState` for the active section id, no router/URL state —
scoped entirely inside the Notes tab, not a page navigation. This is a *different* two-column
layout than the one removed from `topic-view.tsx` (content vs. PDF reference) — that removal was
about not permanently splitting screen real estate between two competing large panels; this is a
small in-tab table-of-contents pattern the user asked for directly, not a regression of that
decision.

**On `md:` and up it's a `ResizablePanelGroup` (nav panel ~26%, detail panel ~74%, draggable
handle), not plain flexbox, and not CSS `sticky`.** Two earlier attempts were tried and dropped:
(1) `sticky top-0` on the nav — doesn't reliably hold here, because Base UI's `Tabs.Panel` wraps
its content in an animated/transformed element, which changes what a `position: sticky`
descendant sticks relative to; verified broken by scrolling the actual scroll container (not
`window.scrollTo`, which is a no-op in this app's layout — the real scrollable element is
layout.tsx's `flex-1 overflow-y-auto` div) and watching the nav slide out from under the header.
(2) a shared `md:h-[Nvh]` bounded height with `overflow-y-auto` on both plain flex children — this
part actually worked (each pane scrolled independently), but the user then asked for draggable
resizing too, and a fixed vh guess left a visible gap below the panel on tall viewports. Landed on
`ResizablePanelGroup`/`ResizablePanel` (`components/ui/resizable.tsx`, already used elsewhere in
this app) with each panel's own inner `overflow-y-auto` div, sized to
`md:h-[calc(100vh-49px)]` — 49px is the *measured* height of the consolidated header (a single
row — see below), not a guess, so the panel fills the actual remaining viewport with no leftover
gap. **This number moves if the header's own height ever changes** (it used to be 94px back when
the header was two stacked rows) — re-measure rather than assume, e.g. via Playwright:
`page.locator("main > div.sticky").boundingBox()`. Below `md` there's no resizable/independent-scroll
behavior at all — dragging a resize handle doesn't translate to touch, so it's a plain stacked
pill-row nav above page-flowing detail content, matching the rest of the app's
single-column-on-mobile approach.

**`react-resizable-panels` v4's `defaultSize`/`minSize`/`maxSize` take a bare `number` as
*pixels*, not percent** — only a numeric *string* (`"26"`) is treated as a percentage
(`defaultSize={26}` is 26px; `defaultSize="26"` is 26%). This bit `NotesTabView` directly: passing
numbers collapsed the nav panel to ~35px wide despite `minSize={15}`, because 15 was 15px too, not
a real minimum. Always pass these three props as numeric strings on this version.

## Consolidated sticky header (`app/layout.tsx` + portals)

The user asked for the title, the study guide's own tab list (Full Guide/Concise Guide/Notes/
Tables/Mnemonics/Traps/Gaps/Quiz), and the source-drawer toggle icon to all live in **one**
persistent header row next to the sidebar drawer icon — tabs to the right of the title, the drawer
icon last — instead of topic-view.tsx rendering its own separate sticky bar below the layout's
sidebar-trigger bar. This header used to be two stacked rows (an outer Study Guide/Source Notes
tab pair above an inner Full Guide/etc. tab pair); both of those concerns moved elsewhere (Source
Notes into the PDF drawer, "outer" tabs removed entirely — see the App architecture bullet above)
so now it's a single row, title/tabs/icon together.

Next.js App Router layouts can't declaratively receive page-specific JSX (a `layout.tsx` only gets
`{children}`), so this uses **DOM-id portal targets**: `app/layout.tsx` renders one empty, unstyled
slot div in its sticky header — `page-header-slot`, next to `SidebarTrigger`. `topic-view.tsx`
portals its title + a `div#topic-tabs-anchor` + the drawer-toggle icon into it, in that DOM order
(so they read left-to-right: title, tabs, icon). `study-guide-view.tsx` then portals its own
`<TabsList>` into that `#topic-tabs-anchor` div — a *second-order* portal target, rendered by
another client component's portal rather than being a static node in `layout.tsx`. The `<Tabs>`
root itself still lives in its normal place in the tree (wrapping the real `<TabsContent>` panels)
— only the `<TabsList>` is portaled elsewhere; since portals preserve React context, clicking a
portaled trigger still correctly drives which panel shows, exactly as if the list were rendered in
place.

**`hooks/use-portal-slot.ts` (`usePortalSlot(id)`) had to grow a `MutationObserver` fallback for
this second-order case.** It used to just do one `document.getElementById(id)` in a mount effect —
fine when the target is a static node already in `layout.tsx`'s server-rendered markup, but
`#topic-tabs-anchor` doesn't exist until *topic-view.tsx's own* `usePortalSlot("page-header-slot")`
has resolved and its portal has committed. A single one-shot lookup at mount raced this and lost
(study-guide-view.tsx's tab list silently never appeared — `getElementById` returned null exactly
once and never looked again). Fix: check once synchronously (still resolves immediately for a
static target, no behavior change there), and if not found, watch `document.body` with a
`MutationObserver` until it appears. Any future component that portals into another component's
own dynamically-created anchor needs this same handling — don't revert to a plain one-shot lookup.

**Both `h1` and the tabs+icon wrapper need `min-w-0`/`shrink`** for the title to actually truncate
once the tab list (which can be 8 tabs wide) shares the row — a flex child's default min-width is
its content's intrinsic width, not 0, so without this the title would refuse to shrink below its
full untruncated width and push the tabs/icon off-screen instead. The tab list itself keeps
`overflow-x-auto` (from when it lived in its own header row) so on narrow viewports it scrolls
internally rather than the whole row overflowing; the drawer-toggle icon carries `shrink-0` so it
never disappears — the title and tab list absorb space pressure first.

**Known tradeoff**: `usePortalSlot` resolves client-side only (`document.getElementById` can't run
during static-export prerender), so the title/tabs/icon are absent from the initial static HTML
and appear only after hydration — a brief flash on first paint. Acceptable for this app (single
user, JS always on); don't try to "fix" this by moving the header content back to being
server-rendered per-page, which is exactly the two-bar layout that was removed earlier.

The drawer-toggle icon is icon-only (a `Tooltip`, label "Source" on hover) and sits as the
**rightmost** element in the header, after the tab list — matching `SidebarTrigger`
(`components/ui/sidebar.tsx`): same `variant="ghost" size="icon-sm"` Button, and a single static
`PanelRightIcon` (mirroring `SidebarTrigger`'s single static `PanelLeftIcon`) rather than swapping
between separate open/closed icon variants. Inside the drawer itself, a second, small `<Tabs>`
(Source/Source Notes — see the App architecture bullet above) needs `pt-[49px]` on `SheetContent`
so its own `<TabsList>` isn't painted over by the sticky header (z-[60], above the drawer's z-50)
— the header covers the same 49px band on every page, drawer included, since the drawer is a
fixed, full-height overlay starting at the very top of the viewport, not below the header.

## End-to-end tests (`e2e/`, Playwright)

`playwright.config.ts` + `e2e/study-guide.spec.ts` cover exactly the class of bug this project
kept catching manually and imperfectly (screenshot-less, via curl+grep against dev-server HTML,
because the Chrome browser extension has been unavailable in this environment): horizontal table
overflow, the PDF drawer's default-closed/toggle/citation-click-open behavior, and inner tab
switching, run across two representative topics (`adult-psychiatry` — richest block-type mix;
`psychiatric-services` — the one flagged for table/trap density in user feedback).

- Run with `pnpm exec playwright test` (or add `"test:e2e": "playwright test"` usage — already in
  `package.json`).
- **The webServer port is pinned to `3001`, not a dedicated test port.** `next dev` refuses to
  start a second instance in the same project directory even on a different port ("Another next
  dev server is already running"), and this project conventionally keeps a standing dev server up
  across sessions on 3001 (see the git-safety note about not casually killing dev server PIDs). If
  no server is running, Playwright starts one itself on 3001 via `webServer.command`
  (`pnpm run predev && next dev --port 3001`); if one's already up, `reuseExistingServer: true`
  attaches to it instead of erroring.
- `data-testid="pdf-toggle"` (the header button) / `data-testid="pdf-section"` (the `SheetContent`
  drawer) in `topic-view.tsx` give the tests a stable target independent of the toggle's icon-only
  markup and the drawer's `sr-only` title.
- Extend this file (don't create a second spec file per concern) when adding topics/assertions —
  it's parametrized over a `TOPICS` array already.

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
