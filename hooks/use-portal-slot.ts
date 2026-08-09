import { useEffect, useState } from "react";

/** Resolves a DOM node so page-specific client components can portal content into it — either a
 * node rendered by the root layout (see `app/layout.tsx`) or one rendered by another client
 * component's own portal (e.g. topic-view.tsx's `#topic-tabs-anchor`, created only once *its*
 * usePortalSlot("page-header-slot") resolves and commits). That second case can't be found by a
 * single `getElementById` in this hook's own mount effect — the target might not exist in the DOM
 * yet on that first pass. A MutationObserver picks it up whenever it does appear, instead of
 * this hook giving up after one look. Returns null during SSR/static export and until found. */
export function usePortalSlot(id: string): Element | null {
  const [slot, setSlot] = useState<Element | null>(null);
  useEffect(() => {
    const existing = document.getElementById(id);
    if (existing) {
      setSlot(existing);
      return;
    }
    const observer = new MutationObserver(() => {
      const found = document.getElementById(id);
      if (found) {
        setSlot(found);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [id]);
  return slot;
}
