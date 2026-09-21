"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { logout } from "@/services/auth/authStorage";
import { logoutServerSide } from "@/services/auth/authService";

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

    // Always return to common Login screen
    router.replace("/blood-centre/login");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-lg
        px-4
        py-3
        text-[13px]
        font-medium
        text-[var(--color-text-quaternary)]
        transition-colors
        duration-200
        hover:bg-[var(--color-icon-bg-soft)]
        hover:text-[var(--color-primary)]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[var(--color-primary)]
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      <LogOut size={18} strokeWidth={1.8} />

      <span>{loading ? "Logging out..." : "Logout"}</span>
    </button>
  );
}
