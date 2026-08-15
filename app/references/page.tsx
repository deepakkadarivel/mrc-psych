import { getReferences } from "@/lib/content";

export default function ReferencesPage() {
  const files = getReferences();

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">References</h1>
        <p className="text-muted-foreground">
          External revision videos and links, not exam facts — see{" "}
          <code>resources/paper-b/references/</code>.
        </p>
      </div>
      {files.map((file) => (
        <div key={file.file} className="space-y-6">
          {file.sections.map((section) => (
            <div key={section.heading} className="space-y-2">
              <h2 className="text-lg font-semibold">{section.heading}</h2>
              <ul className="space-y-1.5">
                {section.items.map((item) => (
                  <li key={item.url}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline hover:no-underline"
                    >
                      {item.title || item.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
