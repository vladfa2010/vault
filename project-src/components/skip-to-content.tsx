import type { ReactNode } from "react";

export function SkipToContent(): ReactNode {
  return (
    <a
      href="#main-content"
      className="absolute top-4 -left-[9999px] z-9999 rounded-md border-2 border-ring bg-background px-4 py-3 font-semibold text-foreground no-underline focus:left-4 focus:outline-2 focus:outline-offset-2 focus:outline-ring"
    >
      Skip to main content
    </a>
  );
}
