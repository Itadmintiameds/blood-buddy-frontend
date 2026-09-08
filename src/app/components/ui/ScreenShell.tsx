import type { ReactNode } from "react";

export function ScreenShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[var(--color-white)]">
      <div className="mobile-frame">{children}</div>
    </main>
  );
}
