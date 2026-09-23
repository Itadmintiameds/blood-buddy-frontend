"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Droplets, HeartPulse, ShieldCheck } from "lucide-react";

import { PoweredBy } from "@/app/components/common/PoweredBy";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import {
  Bilingual,
  BilingualInline,
} from "@/app/components/common/Bilingual";

export function WelcomeScreen() {
  return (
    <ScreenShell>
      <main className="flex min-h-[100dvh] w-full flex-col bg-white lg:h-[100dvh] lg:overflow-hidden">
        <div className="shrink-0">
          <BrandHeader />
        </div>

        <section className="min-h-0 flex-1 bg-white lg:overflow-hidden">
          <div className="flex w-full flex-col lg:h-full lg:flex-row">
            <div
              className="
                relative
                z-10
                flex
                min-h-0
                flex-1
                items-center
                justify-center
                bg-[#fffafa]
                px-5
                py-6
                shadow-[4px_0_18px_rgba(0,0,0,0.08)]
                sm:px-8
                lg:overflow-hidden
                lg:px-10
                lg:py-5
                xl:px-14
              "
            >
              <div
                className="
                  flex
                  w-full
                  max-w-[400px]
                  flex-col
                  items-center
                  justify-center
                "
              >
                {/* Blood Buddy Logo */}
                <Image
                  src="/images/blood-buddy-logo.png"
                  alt="Blood Buddy"
                  width={360}
                  height={140}
                  priority
                  className="
                    h-auto
                    w-[145px]
                    max-w-full
                    object-contain
                    sm:w-[175px]
                    md:w-[195px]
                    lg:w-[220px]
                    xl:w-[215px]
                  "
                />

                {/* Small icons */}
                <div className="mt-2.5 flex items-center gap-3 sm:mt-3 sm:gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF0F0] sm:h-9 sm:w-9">
                    <Droplets
                      size={18}
                      strokeWidth={1.8}
                      className="text-[#FF3B3B]"
                    />
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF0F0] sm:h-9 sm:w-9">
                    <HeartPulse
                      size={18}
                      strokeWidth={1.8}
                      className="text-[#FF3B3B]"
                    />
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF0F0] sm:h-9 sm:w-9">
                    <ShieldCheck
                      size={18}
                      strokeWidth={1.8}
                      className="text-[#FF3B3B]"
                    />
                  </div>
                </div>

                {/* Heading */}
                <Bilingual
                  tKey="welcome.heading"
                  as="h6"
                  className="
                    mt-3
                    text-center
                    text-[20px]
                    font-semibold
                    leading-[1.15]
                    tracking-[-0.2px]
                    text-[#222222]
                    sm:mt-4
                    sm:text-[24px]
                    md:text-[27px]
                    lg:text-[29px]
                    xl:text-[20px]
                  "
                />

                {/* Description */}
                <Bilingual
                  tKey="welcome.description"
                  as="p"
                  className="
                    mt-2
                    max-w-[390px]
                    text-center
                    text-[13px]
                    leading-5
                    text-[#777777]
                    sm:mt-2.5
                    sm:text-[14px]
                    sm:leading-relaxed
                    md:text-[14px]
                  "
                />

                {/* Tagline */}
                <div
                  className="
                    mt-3
                    flex
                    items-center
                    gap-2
                    text-[12px]
                    text-[#888888]
                    sm:mt-3
                    sm:text-[12px]
                  "
                >
                  <span className="h-px w-5 shrink-0 bg-[#dddddd]" />

                  <BilingualInline tKey="welcome.tagline" />

                  <span className="h-px w-5 shrink-0 bg-[#dddddd]" />
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================== */}
            <div
              className="
                flex
                min-h-0
                flex-1
                items-center
                justify-center
                bg-white
                px-6
                py-6
                sm:px-10
                lg:overflow-hidden
                lg:px-10
                lg:py-4
                xl:px-14
              "
            >
              <div
                className="
                  flex
                  w-full
                  max-w-[390px]
                  flex-col
                  items-center
                  justify-center
                "
              >
                {/* Portal icon */}
                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-[#FFF0F0]
                    shadow-[0_4px_14px_rgba(255,59,59,0.10)]
                    sm:h-14
                    sm:w-14
                  "
                >
                  <Droplets
                    size={25}
                    strokeWidth={1.7}
                    className="text-[#FF3B3B]"
                  />
                </div>

                {/* Portal title */}
                <Bilingual
                  tKey="welcome.portalTitle"
                  as="h2"
                  className="
                    mt-3
                    text-center
                    text-[20px]
                    font-semibold
                    tracking-[-0.2px]
                    text-[#222222]
                    sm:text-[23px]
                  "
                />

                {/* Subtitle */}
                <Bilingual
                  tKey="welcome.portalSubtitle"
                  as="p"
                  className="
                    mt-1
                    mb-5
                    text-center
                    text-[13px]
                    leading-5
                    text-[#888888]
                    sm:text-[14px]
                  "
                />

                {/* Blood Centre button */}

                <Link
                  href="/blood-centre/login"
                  className="
                      group
                      flex
                      min-h-[50px]
                      w-full
                      items-center
                      justify-center
                      gap-2.5
                      rounded-[8px]
                      bg-[#FF3B3B]
                      px-5
                      py-2.5
                      text-[14px]
                      font-semibold
                      text-white
                      no-underline
                      shadow-[0_5px_15px_rgba(255,59,59,0.18)]
                      transition-all
                      duration-200
                      hover:bg-[#e93232]
                      hover:shadow-[0_7px_20px_rgba(255,59,59,0.25)]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-[#FF3B3B]
                      focus:ring-offset-2
                    "
                >
                  <BilingualInline
                    tKey="welcome.bloodCentre"
                    enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
                  />

                  <ArrowRight
                    size={17}
                    strokeWidth={2}
                    className="
                        transition-transform
                        duration-200
                        group-hover:translate-x-1
                      "
                  />
                </Link>

                {/* Super Admin */}
                <div className="mt-3 text-center sm:mt-4">
                  <Link
                    href="/super-admin/login"
                    className="
                      !inline-block
                      !text-[#FF3B3B]
                      px-2
                      py-2
                      text-[13px]
                      font-semibold
                      !underline
                      !decoration-[#FF3B3B]
                      decoration-2
                      underline-offset-4
                      transition-colors
                      duration-200
                      hover:!text-[#FF3B3B]
                      hover:!decoration-[#FF3B3B]
                      sm:text-[14px]
                    "
                    style={{
                      color: "#FF3B3B",
                      textDecorationColor: "#FF3B3B",
                    }}
                  >
                    <BilingualInline
                      tKey="welcome.superAdminLogin"
                      enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-[#FF3B3B]/70 no-underline"
                    />
                  </Link>
                </div>

                {/* Secure access */}
                <div className="mt-5 w-full sm:mt-6">
                  <div className="flex items-center gap-2.5">
                    <div className="h-px flex-1 bg-[#eeeeee]" />

                    <Bilingual
                      tKey="welcome.secureAccess"
                      as="span"
                      className="text-[11px] uppercase tracking-wider text-[#999999]"
                    />

                    <div className="h-px flex-1 bg-[#eeeeee]" />
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <ShieldCheck
                      size={14}
                      strokeWidth={1.7}
                      className="shrink-0 text-[#FF3B3B]"
                    />

                    <Bilingual
                      tKey="welcome.secureAccessDescription"
                      as="span"
                      className="text-[12px] text-[#888888]"
                    />
                  </div>
                </div>

                {/* Powered By */}
                <div className="mt-5 flex justify-center sm:mt-6">
                  <PoweredBy />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </ScreenShell>
  );
}
