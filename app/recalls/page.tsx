const RECALL_FILES = [
  "1. October 2023 completed.pdf",
  "2. June 2023 completed.pdf",
  "3. March 2023 Completed.pdf",
  "4. September 2022 recall completed.pdf",
  "Recalls solved.pdf",
  "March 24 Paper B recall.docx",
  "recalls may 2025.docx",
];

export default function RecallsPage() {
  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Past paper recalls</h1>
      <p className="text-muted-foreground">
        These are free-form, student-compiled recall notes — a different format from the
        structured SPMM quiz exports (no consistent question/answer markers), so they aren&apos;t
        parsed into the quiz engine. Open the source directly below and read them as revision
        notes. (Mock Exam 14, also in this folder, <em>is</em> in the structured format — find it
        under Mock exams.)
      </p>
      <ul className="space-y-2">
        {RECALL_FILES.map((name) => (
          <li key={name}>
            <a
              href={`/sources/previous-year-question-source/${encodeURIComponent(name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline hover:no-underline"
            >
              {name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
