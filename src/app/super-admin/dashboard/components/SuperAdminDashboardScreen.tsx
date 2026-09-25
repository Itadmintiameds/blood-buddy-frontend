"use client";

import {
  Building2,
  ChevronRight,
  Menu,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { DonorManagement } from "./DonorManagement";
import { RecipientManagement } from "./RecipientManagement";
import BloodBankManagement from "./BloodBankManagement";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { SuperAdminLogoutButton } from "./SuperAdminLogoutButton";
import { getSuperAdminSession } from "@/services/auth/authStorage";
import { Bilingual, useBilingualText } from "@/app/components/common/Bilingual";

type ActiveSection = "blood-bank" | "donor" | "recipient";

interface NavigationItem {
  id: ActiveSection;
  tKey: string;
  subKey: string;
  icon: typeof Building2;
}

const navigationItems: NavigationItem[] = [
  {
    id: "blood-bank",
    tKey: "superAdmin.bloodBank",
    subKey: "superAdmin.bloodBankNavSub",
    icon: Building2,
  },
  {
    id: "donor",
    tKey: "donor.donor",
    subKey: "superAdmin.donorNavSub",
    icon: Users,
  },
  {
    id: "recipient",
    tKey: "recipient.recipient",
    subKey: "superAdmin.recipientNavSub",
    icon: UserRound,
  },
];

// Mirrors the Blood Centre shell: a full-width brand header pinned on top,
// a sidebar below it on the left (fixed on desktop, drawer on mobile), and
// the active section's content to the right.
export function SuperAdminDashboard() {
  const closeNavigationLabel = useBilingualText("accessibility.closeNavigation");
  const closeMenuLabel = useBilingualText("accessibility.closeMenu");
  const openMenuLabel = useBilingualText("accessibility.openMenu");

  const [activeSection, setActiveSection] =
    useState<ActiveSection>("blood-bank");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const superAdminSession = getSuperAdminSession();
  const adminName = superAdminSession?.name ?? superAdminSession?.email ?? null;

  const handleSectionChange = (section: ActiveSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "donor":
        return <DonorManagement />;

      case "recipient":
        return <RecipientManagement />;

      case "blood-bank":
      default:
        return <BloodBankManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)]">
      {/* Full-width brand header — pinned to the top while the page scrolls */}
      <div className="sticky top-0 z-40 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <BrandHeader welcomeName={adminName} />
      </div>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label={closeNavigationLabel}
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* SIDEBAR — full height on mobile (drawer), below the header on desktop */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col overflow-y-auto border-r border-[var(--color-border-lighter)] bg-white shadow-[4px_0_25px_rgba(0,0,0,0.04)] transition-transform duration-300 lg:top-[76px] lg:z-30 lg:h-[calc(100vh-76px)] lg:translate-x-0 lg:shadow-none ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Mobile close row (the brand lives in the full-width header now) */}
        <div className="flex h-12 items-center justify-end px-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label={closeMenuLabel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 lg:mt-5">
          <Bilingual
            tKey="superAdmin.superAdminDashboard"
            as="p"
            className="px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-placeholder)]"
          />

          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSectionChange(item.id)}
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
                    <Bilingual
                      tKey={item.tKey}
                      as="span"
                      className={`block truncate text-[13px] ${
                        active ? "font-semibold" : "font-medium"
                      }`}
                    />
                    <Bilingual
                      tKey={item.subKey}
                      as="span"
                      className={`block truncate text-[10px] ${
                        active
                          ? "text-white/70"
                          : "text-[var(--color-text-placeholder-alt)]"
                      }`}
                    />
                  </span>

                  {active && (
                    <ChevronRight
                      size={15}
                      strokeWidth={2}
                      className="shrink-0 text-white"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* FOOTER */}
        <div className="border-t border-[var(--color-border-lighter)] p-4">
          <SuperAdminLogoutButton />
        </div>
      </aside>

      <main className="lg:ml-[260px]">
        {/* Mobile menu toggle — no page title, content starts right below it */}
        <div className="border-b border-[var(--color-border-lighter)] bg-white lg:hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={openMenuLabel}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-light)] bg-white text-[var(--color-text-secondary)] shadow-sm transition hover:bg-[var(--color-surface-hover)]"
            >
              <Menu size={19} />
            </button>
          </div>
        </div>

        {/* Content */}
        <section className="px-4 py-5 sm:px-6 sm:py-7 lg:px-8 2xl:px-12">
          <div className="mx-auto w-full max-w-[1600px]">
            {renderActiveSection()}
          </div>
        </section>
      </main>
    </div>
  );
}
