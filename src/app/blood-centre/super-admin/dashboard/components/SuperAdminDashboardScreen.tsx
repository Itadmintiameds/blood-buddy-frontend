"use client";

import Image from "next/image";
import {
  Building2,
  ChevronRight,
  HeartPulse,
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

type ActiveSection = "blood-bank" | "donor" | "recipient";

interface NavigationItem {
  id: ActiveSection;
  label: string;
  icon: typeof Building2;
}

const navigationItems: NavigationItem[] = [
  {
    id: "blood-bank",
    label: "Blood Bank",
    icon: Building2,
  },
  {
    id: "donor",
    label: "Donor",
    icon: Users,
  },
  {
    id: "recipient",
    label: "Recipient",
    icon: UserRound,
  },
];

export function SuperAdminDashboard() {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("blood-bank");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col
          border-r border-[var(--color-border-lighter)] bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="relative flex h-[100px] items-center justify-center border-b border-[var(--color-border-lighter)] px-5">
          <div className="relative h-14 w-[160px]">
            <Image
              src="/images/tiameds-logo.png"
              alt="TiaMeds"
              fill
              priority
              className="object-contain"
            />
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--color-text-tertiary)] transition hover:bg-[var(--color-surface-hover)] lg:hidden"
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        {/* Admin Profile */}
        <div className="px-5 pt-6">
          <div className="flex items-center gap-3 rounded-xl border border-[#f1dddd] bg-[var(--color-icon-bg-soft)] px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
              <HeartPulse
                size={18}
                strokeWidth={1.8}
                className="text-[var(--color-primary)]"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-[var(--color-text-body)]">
                Super Admin
              </p>

              <p className="mt-0.5 text-[12px] text-[var(--color-text-placeholder-alt)]">
                Administrator
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-5 pt-7">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-placeholder)]">
            Management
          </p>

          <nav className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSectionChange(item.id)}
                  className={`
                    group flex w-full items-center gap-3 rounded-xl
                    px-4 py-3 text-left
                    transition-all duration-200
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[var(--color-primary)]
                    ${
                      isActive
                        ? "bg-[var(--color-icon-bg-soft)] text-[var(--color-primary)] shadow-[0_5px_18px_rgba(255,59,63,0.08)]"
                        : "text-[var(--color-text-quaternary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-body)]"
                    }
                  `}
                >
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2 : 1.7}
                    className={
                      isActive
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]"
                    }
                  />

                  <span
                    className={`flex-1 text-[14px] ${
                      isActive ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>

                  {isActive && (
                    <ChevronRight
                      size={17}
                      strokeWidth={2}
                      className="text-[var(--color-primary)]"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-auto border-t border-[var(--color-border-lighter)] p-5">
          <div className="mb-4 px-1">
            <p className="text-[12px] text-[var(--color-text-placeholder-alt)]">
              Blood Buddy
            </p>
            <p className="mt-1 text-[12px] text-[var(--color-text-placeholder-alt)]">
              Super Admin Portal
            </p>
          </div>

          <div className="border-t border-[var(--color-border-lighter)] pt-3">
            <SuperAdminLogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen lg:ml-[270px]">
        <BrandHeader />
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-[var(--color-border-lighter)] bg-white/95 backdrop-blur">
          <div className="flex min-h-[92px] items-center justify-between px-5 py-4 sm:px-7 lg:px-10">
            <div className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-lighter)] bg-white text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)] lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <p className="mb-0.5 text-[12px] font-medium text-[var(--color-text-placeholder-alt)]">
                  Blood Buddy
                </p>

                <h1 className="truncate text-[20px] font-bold tracking-[-0.3px] text-[var(--color-text-primary)] sm:text-[24px]">
                  Super Admin Dashboard
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-white px-3.5 py-2 shadow-sm sm:flex">
              <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />

              <span className="text-[12px] font-medium text-[var(--color-text-quaternary)]">
                Super Admin
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="px-4 py-6 sm:px-7 sm:py-7 lg:px-10 lg:py-8">
          {renderActiveSection()}
        </section>
      </main>
    </div>
  );
}
