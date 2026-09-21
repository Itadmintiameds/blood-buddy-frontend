"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { getBloodCentreSession } from "@/services/auth/authStorage";

interface BloodCentreAuthGuardProps {
  children: React.ReactNode;
}

/**
 * Wrap any protected Blood Centre screen with this component.
 *
 * - Redirects to /blood-centre/login immediately if there is no
 *   active Blood Centre session (a Super Admin session logged in
 *   elsewhere does NOT count — the two roles are kept separate).
 * - Re-checks the session whenever the page becomes visible again
 *   (browser back/forward button, or the tab being restored from
 *   the browser's bfcache) so a logged-out user can never land back
 *   on a protected screen just by pressing back.
 */
export function BloodCentreAuthGuard({ children }: BloodCentreAuthGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifySession = () => {
      const session = getBloodCentreSession();

      if (!session) {
        router.replace("/blood-centre/login");
        return false;
      }

      return true;
    };

    const isValid = verifySession();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial, synchronous auth check must resolve before first paint of protected content
    setChecking(false);

    if (!isValid) {
      return;
    }

    //  Prevent the browser's back/forward cache (bfcache) from
    //  showing a stale, already-rendered version of this protected
    //  screen after logout. `pageshow` fires again when a page is
    //  restored from bfcache; `event.persisted` is true in that case.

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        verifySession();
      }
    };

    // Also re-check on browser back/forward navigation between
    // client-side routes.
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
