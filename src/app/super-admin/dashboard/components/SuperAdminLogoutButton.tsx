"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { logout } from "@/services/auth/authStorage";
import { logoutServerSide } from "@/services/auth/authService";
import { BilingualInline } from "@/app/components/common/Bilingual";

export function SuperAdminLogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    await logoutServerSide();

    // Remove Super Admin session
    logout();

    // Return to the dedicated Super Admin login screen
    router.replace("/super-admin/login");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="
        flex
        min-h-9
        w-full
        items-center
        justify-center
        gap-1.5
        rounded-lg
        border
        border-[var(--color-border)]
        bg-white
        px-3.5
        py-1.5
        text-[12px]
        font-medium
        text-[var(--color-text-secondary)]
        transition-all
        duration-200
        hover:border-[var(--color-primary)]
        hover:text-[var(--color-primary)]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[var(--color-primary)]
        focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-60
        sm:text-[13px]
      "
    >
      <LogOut size={13} strokeWidth={1.8} className="shrink-0" />

      <BilingualInline tKey={loading ? "common.loggingOut" : "common.logout"} />
    </button>
  );
}
