import type { ReactNode } from "react";

import { PoweredByFooter } from "@/app/components/common/PoweredBy";

// Page frame for the public / auth screens. The content grows to fill the
// viewport (dvh, so mobile browser chrome doesn't push the footer off screen)
// and is itself a flex column: a screen's main section can take `flex-1` to
// centre its content in the space left under the header. The "Powered by
// TiaMeds" footer sits at the bottom edge on short pages and follows the
// content on long ones.
export function ScreenShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col bg-[var(--color-white)]">
      <div className="mobile-frame flex flex-1 flex-col">{children}</div>
      <PoweredByFooter />
    </main>
  );
}
