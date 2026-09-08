"use client";

import Image from "next/image";
import {
  Building2,
  ChevronRight,
  Droplets,
  HeartPulse,
  LayoutDashboard,
  LogOut,
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
    <div className="min-h-screen bg-[#f7f8fa] text-[#222]">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col
          border-r border-[#eeeeee] bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-[108px] items-center justify-center border-b border-[#eeeeee] px-5">
          <div className="relative h-[62px] w-[175px]">
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
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#777] hover:bg-[#f5f5f5] lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Admin Profile */}
        <div className="px-5 pt-7">
          <div className="flex items-center gap-3 rounded-xl border border-[#f1dddd] bg-[#fff8f8] px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff0f0]">
              <HeartPulse
                size={18}
                strokeWidth={1.8}
                className="text-[#ff3b3f]"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-[#333]">
                Super Admin
              </p>

              <p className="mt-0.5 text-[11px] text-[#999]">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-5 pt-8">
          <p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#a4a4a4]">
            Management
          </p>

          <nav className="space-y-2">
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
                    px-4 py-3.5 text-left
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-[#fff0f0] text-[#ff3b3f] shadow-[0_5px_18px_rgba(255,59,63,0.08)]"
                        : "text-[#666] hover:bg-[#fafafa] hover:text-[#333]"
                    }
                  `}
                >
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2 : 1.7}
                    className={
                      isActive
                        ? "text-[#ff3b3f]"
                        : "text-[#888] group-hover:text-[#555]"
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
                      className="text-[#ff3b3f]"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-auto border-t border-[#eeeeee] p-5">
          <div className="mb-5 px-1">
            <p className="text-[12px] text-[#999]">Blood Buddy</p>
            <p className="mt-1 text-[12px] text-[#999]">Super Admin Portal</p>
          </div>

          {/* <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[#777] transition hover:bg-[#fff5f5] hover:text-[#ff3b3f]"
          >
            <LogOut size={18} strokeWidth={1.7} />

            <span className="text-[13px] font-medium">Logout</span>
          </button> */}

          <div className="mt-auto border-t border-gray-100 pt-3">
            <SuperAdminLogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen lg:ml-[270px]">
        <BrandHeader />
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-[#eeeeee] bg-white/95 backdrop-blur">
          <div className="flex min-h-[108px] items-center justify-between px-5 py-5 sm:px-7 lg:px-10">
            <div className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#eeeeee] bg-white text-[#555] lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <p className="mb-1 text-[12px] font-medium text-[#999]">
                  Blood Buddy
                </p>

                <h1 className="truncate text-[23px] font-bold tracking-[-0.3px] text-[#242424] sm:text-[26px]">
                  Super Admin Dashboard
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-3 py-2 shadow-sm sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#47d7c3]" />

              <span className="text-[12px] font-medium text-[#666]">
                Super Admin
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="px-4 py-5 sm:px-7 sm:py-7 lg:px-10 lg:py-8">
          {renderActiveSection()}
        </section>
      </main>
    </div>
  );
}
