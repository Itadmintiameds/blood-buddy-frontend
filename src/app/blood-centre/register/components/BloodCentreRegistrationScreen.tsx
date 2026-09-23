"use client";

import { useEffect, useState } from "react";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { Bilingual } from "@/app/components/common/Bilingual";
import { getSuperAdminSession } from "@/services/auth/authStorage";
import { BloodCentreRegistrationForm } from "./BloodCentreRegistrationForm";

export function BloodCentreRegistrationScreen() {
  // Defaults to the public flow's destination on first render (server and
  // client must agree, so the session check below has to happen post-mount).
  // A Super Admin who opened this shared page from their own dashboard (see
  // BloodBankManagement's "Add Blood Centre" button) should have "back" send
  // them there instead of a Blood Centre login prompt meant for the newly
  // registered centre -- same rule handleSuccessConfirm applies after a
  // successful submit, just also covering the back arrow.
  const [backHref, setBackHref] = useState("/blood-centre/login");

  useEffect(() => {
    if (getSuperAdminSession()) {
      setBackHref("/super-admin/dashboard");
    }
  }, []);

  return (
    <ScreenShell>
      <BrandHeader
        title={<Bilingual tKey="bloodCentre.registration" as="span" />}
        showBackButton
        backHref={backHref}
      />

      <main className="w-full bg-[var(--color-surface-alt)]">
        <section
          className="
            mx-auto
            w-full
            px-4
            pb-10
            pt-6
            sm:px-6
            md:max-w-[900px]
            md:px-8
            md:pb-14
            md:pt-10
            lg:max-w-[1000px]
            lg:px-10
          "
        >
          <div
            className="
              rounded-2xl
              bg-white
              px-4
              py-6
              sm:px-6
              sm:py-8
              md:border
              md:border-[var(--color-border-lighter)]
              md:px-10
              md:py-10
              md:shadow-[0_4px_24px_rgba(0,0,0,0.05)]
            "
          >
            <BloodCentreRegistrationForm />
          </div>
        </section>
      </main>
    </ScreenShell>
  );
}
