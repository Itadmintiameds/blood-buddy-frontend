"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { logout } from "@/services/auth/authStorage";

export function SuperAdminLogoutButton() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    if (loading) {
      return;
    }

    setLoading(true);

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
        text-sm
        text-gray-600
        transition
        hover:bg-red-50
        hover:text-[#FF3B3B]
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      <LogOut size={18} strokeWidth={1.8} />

      <span>{loading ? "Logging out..." : "Logout"}</span>
    </button>
  );
}
