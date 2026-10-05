import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { RoleSwitchLink } from "@/app/components/ui/RoleSwitchLink";
import { Bilingual } from "@/app/components/common/Bilingual";
import { DonorRegistrationForm } from "./DonorRegistrationForm";

export function DonorRegistrationScreen() {
  return (
    <ScreenShell>
      <BrandHeader
        title={<Bilingual tKey="donor.donorRegistration" as="span" />}
        titleAction={
          <div className="hidden sm:block">
            <RoleSwitchLink href="/recipient/register" tKey="welcome.recipient" />
          </div>
        }
        alignTitleToContent
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
          {/* No room beside the title on a phone, so the switch sits above the card there. */}
          <div className="mb-4 flex justify-end sm:hidden">
            <RoleSwitchLink href="/recipient/register" tKey="welcome.recipient" />
          </div>

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
            <DonorRegistrationForm />
          </div>
        </section>
      </main>
    </ScreenShell>
  );
}
