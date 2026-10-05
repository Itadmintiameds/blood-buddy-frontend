"use client";

import { Building2, ChevronRight, Menu, UserRound, Users } from "lucide-react";
import { useState } from "react";
import { DonorManagement } from "./DonorManagement";
import { RecipientManagement } from "./RecipientManagement";
import BloodBankManagement from "./BloodBankManagement";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { PoweredByFooter } from "@/app/components/common/PoweredBy";
import {
  SidebarNavItemContent,
  SidebarShell,
  sidebarNavItemClass,
} from "@/app/components/layout/SidebarShell";
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
  const openMenuLabel = useBilingualText("accessibility.openMenu");

  const [activeSection, setActiveSection] =
    useState<ActiveSection>("blood-bank");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const superAdminSession = getSuperAdminSession();
  const adminName = superAdminSession?.name ?? superAdminSession?.email ?? null;

  const activeItem =
    navigationItems.find((item) => item.id === activeSection) ??
    navigationItems[0];

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
    <div className="flex min-h-screen flex-col bg-[var(--color-surface-alt)]">
      {/* Full-width brand header — pinned to the top while the page scrolls */}
      <div className="sticky top-0 z-40 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
        <BrandHeader welcomeName={adminName} />
      </div>

      {/* SIDEBAR — drawer on phones, rail below the header on desktop */}
      <SidebarShell
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        roleLabel={<Bilingual tKey="superAdmin.superAdmin" as="span" />}
        userName={adminName}
        footer={<SuperAdminLogoutButton />}
      >
        <Bilingual
          tKey="superAdmin.superAdminDashboard"
          as="p"
          className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-placeholder)] lg:text-[9px]"
        />

        <div className="space-y-1.5 lg:space-y-1">
          {navigationItems.map((item) => {
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSectionChange(item.id)}
                aria-current={active ? "page" : undefined}
                className={sidebarNavItemClass(active)}
              >
                <SidebarNavItemContent
                  active={active}
                  icon={item.icon}
                  label={<Bilingual tKey={item.tKey} as="span" />}
                  sub={<Bilingual tKey={item.subKey} as="span" />}
                  trailing={
                    active && (
                      <ChevronRight
                        size={16}
                        strokeWidth={2}
                        className="shrink-0 text-white"
                      />
                    )
                  }
                />
              </button>
            );
          })}
        </div>
      </SidebarShell>

      <main className="flex-1 lg:ml-[260px]">
        {/* Mobile bar — menu toggle plus the name of the open section */}
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

            <div className="min-w-0">
              <Bilingual
                tKey={activeItem.tKey}
                as="h1"
                className="truncate text-[16px] font-bold tracking-[-0.2px] text-[var(--color-text-primary)]"
                enClassName="block truncate text-[0.7em] font-normal leading-tight text-[var(--color-text-muted)]"
              />
              <Bilingual
                tKey={activeItem.subKey}
                as="p"
                className="mt-0.5 truncate text-[12px] text-[var(--color-text-muted)]"
                enClassName="hidden"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <section className="px-4 py-5 sm:px-6 sm:py-7 lg:px-8 2xl:px-12">
          <div className="mx-auto w-full max-w-[1600px]">
            {renderActiveSection()}
          </div>
        </section>
      </main>

      {/* Offset by the fixed sidebar so it never slides underneath it */}
      <PoweredByFooter className="lg:ml-[260px]" />
    </div>
  );
}
