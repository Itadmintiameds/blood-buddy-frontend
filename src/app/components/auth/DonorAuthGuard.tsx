"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getDonorSession } from "@/services/donor/donorSessionStorage";

interface DonorAuthGuardProps {
  children: React.ReactNode;
}

// Wrap any protected donor screen with this component. Redirects to
// /donor/login if there is no local donor session (see donorSessionStorage.ts —
// this is a local stub until the backend adds real donor authentication).
export function DonorAuthGuard({ children }: DonorAuthGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const session = getDonorSession();

    if (!session) {
      router.replace("/donor/login");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial, synchronous auth check must resolve before first paint of protected content
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-[12px] text-[var(--color-text-muted)]">
          Loading...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
