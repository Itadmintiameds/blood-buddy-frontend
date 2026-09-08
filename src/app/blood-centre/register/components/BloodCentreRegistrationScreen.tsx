import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { BloodCentreRegistrationForm } from "./BloodCentreRegistrationForm";

export function BloodCentreRegistrationScreen() {
  return (
    <ScreenShell>
      <BrandHeader
        title="Blood Centre Registration"
        showBackButton
        backHref="/blood-centre/login"
      />

      <main className="w-full bg-white">
        <section
          className="
            mx-auto
            w-full
            px-4
            pb-8
            pt-5
            sm:px-5
            md:max-w-[900px]
            md:px-8
            md:pb-12
            md:pt-8
            lg:max-w-[1000px]
            lg:px-10
          "
        >
          <BloodCentreRegistrationForm />
        </section>
      </main>
    </ScreenShell>
  );
}
