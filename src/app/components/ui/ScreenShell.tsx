import type { ReactNode } from "react";

import { PoweredByFooter } from "@/app/components/common/PoweredBy";

// Page frame for the public / auth screens. The content grows to fill the
// viewport so the "Powered by TiaMeds" footer sits at the bottom edge on short
// pages and follows the content on long ones.
export function ScreenShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-[var(--color-white)]">
      <div className="mobile-frame flex-1">{children}</div>
      <PoweredByFooter />
    </main>
  );
}
