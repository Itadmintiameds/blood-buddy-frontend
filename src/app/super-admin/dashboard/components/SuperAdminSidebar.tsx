"use client";

import Image from "next/image";
import { SuperAdminSection } from "@/types/bloodCenter/superAdmin/superAdminTypes";
import {
  ChevronRight,
  Menu,
  Users,
  UserRound,
  X,
  Building2,
} from "lucide-react";

interface SuperAdminSidebarProps {
  activeSection: SuperAdminSection;
  onSectionChange: (section: SuperAdminSection) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navigationItems: {
  id: SuperAdminSection;
  label: string;
  icon: typeof Building2;
}[] = [
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

export function SuperAdminSidebar({
  activeSection,
  onSectionChange,
  mobileOpen,
  onMobileClose,
}: SuperAdminSidebarProps) {
  const handleNavigation = (section: SuperAdminSection) => {
    onSectionChange(section);
    onMobileClose();
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onMobileClose}
          className="
            fixed
            inset-0
            z-40
            bg-black/35
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-[250px]
          flex-col
          border-r
          border-[#ececec]
          bg-white
          shadow-[4px_0_25px_rgba(0,0,0,0.04)]
          transition-transform
          duration-300
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* COMPANY LOGO */}
        <div
          className="
            flex
            h-[82px]
            items-center
            justify-between
            border-b
            border-[#eeeeee]
            px-6
          "
        >
          <div className="flex w-full items-center justify-center">
            <Image
              src="/images/tiameds-logo.png"
              alt="TiaMeds"
              width={150}
              height={50}
              priority
              className="
                h-auto
                max-h-[48px]
                w-auto
                max-w-[150px]
                object-contain
              "
            />
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onMobileClose}
            className="
              absolute
              right-4
              top-6
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-[#777]
              transition
              hover:bg-[#f7f7f7]
              lg:hidden
            "
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* ADMIN BADGE */}
        <div className="px-5 pt-6">
          <div
            className="
              flex
              items-center
              gap-2
              rounded-lg
              border
              border-[#f1dddd]
              bg-[#fff8f8]
              px-3
              py-2.5
            "
          >
            <div className="h-2 w-2 rounded-full bg-[#ff3b3f]" />

            <span className="text-[11px] font-semibold text-[#555]">
              Super Admin
            </span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-6 flex-1 px-4">
          <p
            className="
              px-3
              pb-2
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.12em]
              text-[#aaa]
            "
          >
            Management
          </p>

          <div className="space-y-1">
            {navigationItems?.map((item) => {
              const Icon = item.icon;
              const active = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    group
                    flex
                    w-full
                    items-center
                    rounded-xl
                    px-3
                    py-3
                    text-left
                    transition-all
                    duration-200

                    ${
                      active
                        ? "bg-[#fff1f1] text-[#ff3b3f] shadow-[0_3px_12px_rgba(255,59,63,0.08)]"
                        : "text-[#666] hover:bg-[#f8f8f8] hover:text-[#333]"
                    }
                  `}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={`
                      mr-3
                      shrink-0
                      transition-transform
                      duration-200
                      group-hover:scale-105

                      ${active ? "text-[#ff3b3f]" : "text-[#888]"}
                    `}
                  />

                  <span
                    className={`
                      flex-1
                      text-[12px]
                      ${active ? "font-semibold" : "font-medium"}
                    `}
                  >
                    {item.label}
                  </span>

                  {active && (
                    <ChevronRight
                      size={15}
                      strokeWidth={2}
                      className="text-[#ff3b3f]"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* FOOTER */}
        <div className="border-t border-[#eeeeee] p-5">
          <div className="text-[10px] leading-4 text-[#999]">
            Blood Buddy
            <br />
            Super Admin Portal
          </div>
        </div>
      </aside>
    </>
  );
}

// MOBILE MENU BUTTON
export function SuperAdminMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open menu"
      className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        border
        border-[#e7e7e7]
        bg-white
        text-[#444]
        shadow-sm
        transition
        hover:bg-[#fafafa]
        lg:hidden
      "
    >
      <Menu size={19} />
    </button>
  );
}
