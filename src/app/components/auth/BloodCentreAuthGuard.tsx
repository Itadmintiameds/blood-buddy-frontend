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

    const validId = Number(session.id) > 0;
    const validEmail = Boolean(session.email);
    const validToken = Boolean(session.accessToken);

    if (!validId || !validEmail || !validToken) {
      router.replace("/blood-centre/login");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
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
