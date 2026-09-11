"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";

// Super Admin accounts are provisioned by the backend on startup from
// SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD (see SuperAdminSeeder) — there is
// no API to self-register one, so this screen only explains that and sends
// the visitor back to login instead of posting to a non-existent endpoint.
export function SuperAdminRegistrationScreen() {
  const router = useRouter();

  return (
    <ScreenShell>
      <BrandHeader />

      <section
        className="
          flex
          min-h-[420px]
          flex-col
          items-center
          bg-white
          px-5
          pb-10
          pt-12
          text-center
        "
      >
        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[var(--color-icon-bg-soft)]
            shadow-sm
          "
        >
          <ShieldCheck
            size={26}
            strokeWidth={1.5}
            className="text-[var(--color-primary)]"
          />
        </div>

        <h1
          className="
            mt-4
            text-[20px]
            font-semibold
            text-[var(--color-text-primary)]
          "
        >
          Super Admin Registration
        </h1>

        <p
          className="
            mt-3
            max-w-[360px]
            text-[13px]
            leading-5
            text-[var(--color-text-tertiary)]
          "
        >
          Super Admin accounts are set up by the system administrator and
          can&apos;t be created from this app. If you need access, ask your
          administrator for the Super Admin login credentials.
        </p>

        <div className="mt-8 w-full max-w-[280px]">
          <AppButton
            type="button"
            onClick={() => router.replace("/blood-centre/login")}
          >
            Back to Login
          </AppButton>
        </div>
      </section>
    </ScreenShell>
  );
}
