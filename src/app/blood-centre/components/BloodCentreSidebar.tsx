"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, History, LayoutDashboard, X } from "lucide-react";

import { routes } from "@/config/routes";
import { LogoutButton } from "@/app/components/common/LogoutButton";

interface BloodCentreSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const navItems: {
  href: string;
  label: string;
  sub: string;
  icon: typeof LayoutDashboard;
}[] = [
  {
    href: routes.bloodCentreDashboard,
    label: "Dashboard",
    sub: "Overview & availability",
    icon: LayoutDashboard,
  },
  {
    href: routes.bloodCentreHistory,
    label: "Group History",
    sub: "Per-group movements",
    icon: History,
  },
];

export function BloodCentreSidebar({
  mobileOpen,
  onClose,
}: BloodCentreSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* SIDEBAR — full height on mobile (drawer), below the header on desktop */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col overflow-y-auto border-r border-[var(--color-border-lighter)] bg-white shadow-[4px_0_25px_rgba(0,0,0,0.04)] transition-transform duration-300 lg:top-[76px] lg:z-30 lg:h-[calc(100vh-76px)] lg:translate-x-0 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Mobile close row (the brand lives in the full-width header now) */}
        <div className="flex h-12 items-center justify-end px-3 lg:hidden">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION */}
        {/* mt matches the dashboard content's top padding (py-7) so the first
            nav item lines up with the top of the KPI cards. */}
        <nav className="flex-1 px-4 lg:mt-7">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`group flex w-full items-center rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
                    active
                      ? "bg-[var(--color-primary)] text-white shadow-[0_6px_16px_rgba(255,59,63,0.28)]"
                      : "text-[var(--color-text-quaternary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-body)]"
                  }`}
                >
                  <span
                    className={`mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-[var(--color-surface-alt)] text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]"
                    }`}
                  >
                    <Icon size={17} strokeWidth={active ? 2.1 : 1.8} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[13px] ${
                        active ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span
                      className={`block truncate text-[10px] ${
                        active
                          ? "text-white/70"
                          : "text-[var(--color-text-placeholder-alt)]"
                      }`}
                    >
                      {item.sub}
                    </span>
                  </span>

                  {active && (
                    <ChevronRight
                      size={15}
                      strokeWidth={2}
                      className="shrink-0 text-white"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* FOOTER */}
        <div className="border-t border-[var(--color-border-lighter)] p-4">
          <LogoutButton className="w-full justify-center" />
        </div>
      </aside>
    </>
  );
}
