"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { getSuperAdminSession } from "@/services/auth/authStorage";

interface SuperAdminAuthGuardProps {
  children: ReactNode;
}

export function SuperAdminAuthGuard({ children }: SuperAdminAuthGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getSuperAdminSession();

    if (!session) {
      router.replace("/blood-centre/super-admin/login");
      return;
    }

    setAuthorized(true);
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
