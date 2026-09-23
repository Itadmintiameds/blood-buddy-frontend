import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { Bilingual } from "@/app/components/common/Bilingual";
import { DonorRegistrationForm } from "./DonorRegistrationForm";

export function DonorRegistrationScreen() {
  return (
    <ScreenShell>
      <BrandHeader
        title={<Bilingual tKey="donor.donorRegistration" as="span" />}
        showBackButton
        backHref="/donor"
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
            <DonorRegistrationForm />
          </div>
        </section>
      </main>
    </ScreenShell>
  );
}
