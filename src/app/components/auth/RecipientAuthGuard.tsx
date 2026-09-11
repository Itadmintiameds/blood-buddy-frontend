"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getRecipientSession } from "@/services/recipient/recipientSessionStorage";

interface RecipientAuthGuardProps {
  children: React.ReactNode;
}

// Wrap any protected recipient screen with this component. Redirects to
// /recipient if the mobile-OTP step hasn't been completed locally (see
// recipientSessionStorage.ts — a stub until the backend adds recipient auth).
export function RecipientAuthGuard({ children }: RecipientAuthGuardProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const session = getRecipientSession();

    if (!session) {
      router.replace("/recipient");
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
