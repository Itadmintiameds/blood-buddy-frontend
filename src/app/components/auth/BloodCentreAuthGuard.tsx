"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthSession } from "@/services/auth/authStorage";

interface BloodCentreAuthGuardProps {
  children: React.ReactNode;
}

export function BloodCentreAuthGuard({ children }: BloodCentreAuthGuardProps) {
  const router = useRouter();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const session = getAuthSession();

    if (!session) {
      router.replace("/blood-centre/login");

      return;
    }

    if (session.userType === "SUPER_ADMIN") {
      router.replace("/blood-centre/super-admin/dashboard");

      return;
    }

    if (session.userType !== "BLOOD_CENTRE") {
      router.replace("/blood-centre/login");

      return;
    }

    if (!session.id || !session.email || !session.accessToken) {
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
