import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Query-param-backed tab state (?tab=<value>) so refreshing, deep-linking, or sharing a link
 * lands back on the same tab instead of always resetting to the first one. Reads
 * `location.search` directly rather than next/navigation's `useSearchParams`, to avoid its
 * Suspense-boundary requirement — matching this app's existing "resolve client-side after first
 * paint" pattern (see usePortalSlot / CLAUDE.md) instead of introducing a different one.
 * `defaultValue` is what both the static-exported HTML and the pre-hydration render show, so
 * there's no mismatch; the real value (if any) is applied a moment later. */
export function useTabParam(validValues: readonly string[], defaultValue: string) {
  const [tab, setTabState] = useState(defaultValue);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tab");
    if (fromUrl && validValues.includes(fromUrl)) setTabState(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setTab(value: string) {
    setTabState(value);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return [tab, setTab] as const;
}
