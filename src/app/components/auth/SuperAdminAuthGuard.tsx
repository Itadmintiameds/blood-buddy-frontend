"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAuthSession,
  getSuperAdminSession,
} from "@/services/auth/authStorage";

interface SuperAdminAuthGuardProps {
  children: React.ReactNode;
}

/**
 * Wrap any protected Super Admin screen with this component.
 *
 * - Redirects to /blood-centre/login if there is no active Super Admin
 *   session (a Blood Centre session sends the user to their own dashboard
 *   instead of a bare login prompt).
 * - Re-checks the session whenever the page becomes visible again
 *   (browser back/forward button, or the tab being restored from the
 *   browser's bfcache) so a logged-out user can never land back on a
 *   protected screen just by pressing back.
 */
export function SuperAdminAuthGuard({ children }: SuperAdminAuthGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifySession = () => {
      if (getSuperAdminSession()) {
        return true;
      }

      const session = getAuthSession();

      if (session?.userType === "BLOOD_CENTRE") {
        router.replace("/blood-centre/dashboard");
      } else {
        router.replace("/blood-centre/login");
      }

      return false;
    };

    const isValid = verifySession();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial, synchronous auth check must resolve before first paint of protected content
    setChecking(false);

    if (!isValid) {
      return;
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        verifySession();
      }
    };

    const handlePopState = () => {
      verifySession();
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-[12px] text-[var(--color-text-muted)]">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
