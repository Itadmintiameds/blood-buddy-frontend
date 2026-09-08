"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "@/services/auth/authStorage";

interface SuperAdminAuthGuardProps {
  children: React.ReactNode;
}

export function SuperAdminAuthGuard({ children }: SuperAdminAuthGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const session = getAuthSession();

    if (!session) {
      router.replace("/blood-centre/login");

      return;
    }

    if (session.userType !== "SUPER_ADMIN") {
      router.replace("/blood-centre/dashboard");

      return;
    }

    // Verify the Super Admin
    // identity again.

    const validId = Number(session.id) > 0;

    const validRole =
      String(session.role ?? "")
        .trim()
        .toUpperCase() === "SUPERADMIN";

    const validToken = Boolean(session.accessToken);

    if (!validId || !validRole || !validToken) {
      router.replace("/blood-centre/login");

      return;
    }

    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#fafafa]
          text-[12px]
          text-[#999]
        "
      >
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}
