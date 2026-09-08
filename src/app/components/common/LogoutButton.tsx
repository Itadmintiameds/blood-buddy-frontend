"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { logoutBloodCentre } from "@/services/auth/authStorage";

interface LogoutButtonProps {
  className?: string;
}

// Reusable logout control for any protected Blood Centre screen.
// Clears the session, then replaces (not pushes) the current
// history entry with the login screen, so pressing the browser
// back button afterwards cannot return to the protected page - it
// simply isn't in history anymore. `BloodCentreAuthGuard` is the
// second line of defense (it re-verifies the session on
//  back/forward navigation and bfcache restores).

export function LogoutButton({ className = "" }: LogoutButtonProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (loggingOut) return;

    setLoggingOut(true);

    logoutBloodCentre();

    router.replace("/blood-centre/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loggingOut}
      className={`flex h-8 items-center gap-1.5 rounded-[6px] border border-[var(--color-border)] bg-white px-3 text-[10px] font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60 sm:text-[11px] ${className}`}
    >
      <LogOut size={13} strokeWidth={1.8} />
      Logout
    </button>
  );
}
