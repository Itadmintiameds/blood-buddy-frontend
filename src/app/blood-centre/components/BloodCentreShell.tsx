"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";

import { BloodCentreAuthGuard } from "@/app/components/auth/BloodCentreAuthGuard";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { getBloodCentreSession } from "@/services/auth/authStorage";
import { BloodCentreSidebar } from "./BloodCentreSidebar";

// Shared frame for every authenticated Blood Centre page: the brand header
// spans the full width and is pinned on top; the sidebar sits below it on the
// left (fixed on desktop, drawer on mobile); the page content sits to the right.
export function BloodCentreShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const centreName = getBloodCentreSession()?.name ?? null;

  // When a page has no title/subtitle/actions the toolbar only needs to exist
  // on mobile (for the menu button); hide it on desktop to avoid an empty bar.
  const hasToolbarContent = Boolean(title || subtitle || actions);

  return (
    <BloodCentreAuthGuard>
      <div className="min-h-screen bg-[var(--color-surface-alt)]">
        {/* Full-width brand header — pinned to the top while the page scrolls */}
        <div className="sticky top-0 z-40 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          <BrandHeader welcomeName={centreName} />
        </div>

        <BloodCentreSidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        <main className="lg:ml-[260px]">
          {/* Page toolbar */}
          <div
            className={`border-b border-[var(--color-border-lighter)] bg-white ${
              hasToolbarContent ? "" : "lg:hidden"
            }`}
          >
            <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-light)] bg-white text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-surface-hover)] lg:hidden"
              >
                <Menu size={19} />
              </button>

              {title && (
                <div className="min-w-0">
                  <h1 className="truncate text-[16px] font-bold tracking-[-0.2px] text-[var(--color-text-primary)] sm:text-[18px]">
                    {title}
                  </h1>

                  {subtitle && (
                    <p className="mt-0.5 truncate text-[12px] text-[var(--color-text-muted)]">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}

              {actions && (
                <div className="ml-auto flex shrink-0 items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <section className="px-4 py-5 sm:px-6 sm:py-7 lg:px-8 2xl:px-12">
            <div className="mx-auto w-full max-w-[1600px]">{children}</div>
          </section>
        </main>
      </div>
    </BloodCentreAuthGuard>
  );
}
