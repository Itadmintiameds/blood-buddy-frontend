"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, UserRound } from "lucide-react";

import { routes } from "@/config/routes";
import { BloodCentreAuthGuard } from "@/app/components/auth/BloodCentreAuthGuard";
import { PoweredByFooter } from "@/app/components/common/PoweredBy";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { getBloodCentreSession } from "@/services/auth/authStorage";
import { BloodCentreSidebar } from "./BloodCentreSidebar";

// Names the page in the phone toolbar when a page doesn't pass its own title
// (the sidebar labels, so the bar and the drawer agree).
const mobilePageTitles = [
  {
    href: routes.bloodCentreDashboard,
    title: "Dashboard",
    subtitle: "Overview & availability",
  },
  {
    href: routes.bloodCentreHistory,
    title: "Group History",
    subtitle: "Per-group movements",
  },
  {
    href: routes.bloodCentreProfile,
    title: "Profile",
    subtitle: "Centre details",
  },
];

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
  const pathname = usePathname();

  const fallbackTitle = mobilePageTitles.find(
    (page) => pathname === page.href || pathname.startsWith(`${page.href}/`),
  );

  const centreName = getBloodCentreSession()?.name ?? null;

  // When a page has no title/subtitle/actions the toolbar only needs to exist
  // on mobile (for the menu button); hide it on desktop to avoid an empty bar.
  const hasToolbarContent = Boolean(title || subtitle || actions);

  return (
    <BloodCentreAuthGuard>
      {/* Fixed-height frame: the header stays put and only the region *below* it
          scrolls, so the page scrollbar never runs alongside the header. Uses
          100dvh so mobile browser chrome doesn't clip it. */}
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-[var(--color-surface-alt)]">
        {/* Full-width brand header — fixed at the top, outside the scroll area */}
        <div className="z-40 shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
          <BrandHeader
            welcomeName={centreName}
            barAction={
              <ProfileLink active={pathname === routes.bloodCentreProfile} />
            }
          />
        </div>

        <BloodCentreSidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          userName={centreName}
        />

        {/* Scroll region — everything below the header scrolls here, so the
            scrollbar starts under the header rather than beside it. */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <main className="flex-1 lg:ml-[260px]">
            {/* Page toolbar */}
            <div
              className={`border-b border-[var(--color-border-lighter)] bg-white max-lg:sticky max-lg:top-0 max-lg:z-20 ${
                hasToolbarContent ? "" : "lg:hidden"
              }`}
            >
              <div className="flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-3.5 lg:px-8">
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

                {/* Phones only: without a page title the bar would be a lone
                    menu button, so name the page from the route instead. */}
                {!title && !subtitle && fallbackTitle && (
                  <div className="min-w-0 lg:hidden">
                    <p className="truncate text-[16px] font-bold leading-tight tracking-[-0.2px] text-[var(--color-text-primary)]">
                      {fallbackTitle.title}
                    </p>
                    <p className="mt-0.5 truncate text-[12px] text-[var(--color-text-muted)]">
                      {fallbackTitle.subtitle}
                    </p>
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

          {/* Last child of the scroll region: sits at the bottom edge on short
              pages and follows the content on long ones. Offset by the sidebar. */}
          <PoweredByFooter className="lg:ml-[260px]" />
        </div>
      </div>
    </BloodCentreAuthGuard>
  );
}

// Top-right entry to the centre's own profile (details + Edit).
function ProfileLink({ active }: { active: boolean }) {
  return (
    <Link
      href={routes.bloodCentreProfile}
      aria-label="Profile"
      aria-current={active ? "page" : undefined}
      title="Profile"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
        active
          ? "border-white bg-white text-[var(--color-primary)]"
          : "border-white/40 bg-white/15 text-white hover:bg-white/25"
      }`}
    >
      <UserRound size={18} strokeWidth={2} />
    </Link>
  );
}
