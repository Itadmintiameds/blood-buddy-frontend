"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { logoutDonor } from "@/services/donor/donorSessionStorage";

interface DonorLogoutButtonProps {
  className?: string;
}

export function DonorLogoutButton({ className = "" }: DonorLogoutButtonProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (loggingOut) return;

    setLoggingOut(true);

    logoutDonor();

    router.replace("/donor/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className={`flex h-9 items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white px-3.5 text-[12px] font-medium text-[var(--color-text-secondary)] transition-all duration-200 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[13px] ${className}`}
    >
      <LogOut size={13} strokeWidth={1.8} />
      Logout
    </button>
  );
}
