"use client";

import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";
import { logout } from "@/services/auth/authStorage";
import {
  Bilingual,
  BilingualInline,
} from "@/app/components/common/Bilingual";

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

        <Bilingual
          tKey="superAdmin.registrationTitle"
          as="h1"
          className="
            mt-4
            text-[20px]
            font-semibold
            text-[var(--color-text-primary)]
          "
        />

        <Bilingual
          tKey="superAdmin.registrationDescription"
          as="p"
          className="
            mt-3
            max-w-[360px]
            text-[13px]
            leading-5
            text-[var(--color-text-tertiary)]
          "
        />

        <div className="mt-8 w-full max-w-[280px]">
          <AppButton
            type="button"
            onClick={() => {
              logout();
              router.replace("/blood-centre/login");
            }}
          >
            <BilingualInline
              tKey="bloodCentre.backToLogin"
              enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
            />
          </AppButton>
        </div>
      </section>
    </ScreenShell>
  );
}
