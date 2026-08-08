import { useEffect, useState } from "react";

/** Resolves a DOM node rendered by the root layout (see `app/layout.tsx`) so page-specific
 * client components can portal header content into it. Returns null during SSR/static export
 * and until the first client render finds the node. */
export function usePortalSlot(id: string): Element | null {
  const [slot, setSlot] = useState<Element | null>(null);
  useEffect(() => {
    setSlot(document.getElementById(id));
  }, [id]);
  return slot;
}
