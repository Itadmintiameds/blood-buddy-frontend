"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, History, LayoutDashboard } from "lucide-react";

import { routes } from "@/config/routes";
import { LogoutButton } from "@/app/components/common/LogoutButton";
import { Bilingual } from "@/app/components/common/Bilingual";
import {
  SidebarNavItemContent,
  SidebarShell,
  sidebarNavItemClass,
} from "@/app/components/layout/SidebarShell";

interface BloodCentreSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  /** Signed-in centre's name, shown in the mobile drawer's header. */
  userName?: string | null;
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
  userName,
}: BloodCentreSidebarProps) {
  const pathname = usePathname();

  return (
    <SidebarShell
      open={mobileOpen}
      onClose={onClose}
      roleLabel={<Bilingual tKey="bloodCentre.roleLabel" as="span" />}
      userName={userName}
      footer={<LogoutButton className="w-full justify-center" />}
    >
      <div className="space-y-1.5 lg:space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={sidebarNavItemClass(active)}
            >
              <SidebarNavItemContent
                active={active}
                icon={item.icon}
                label={item.label}
                sub={item.sub}
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
            </Link>
          );
        })}
      </div>
    </SidebarShell>
  );
}
