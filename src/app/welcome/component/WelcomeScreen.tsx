"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Droplets, HeartPulse, ShieldCheck } from "lucide-react";

import { PoweredBy } from "@/app/components/common/PoweredBy";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import LanguageSelector from "@/app/components/common/LanguageSelector";

export function WelcomeScreen() {
  return (
    <ScreenShell>
      <main className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white">
        <div className="shrink-0">
          <BrandHeader />
        </div>

        <section className="min-h-0 flex-1 overflow-hidden bg-white">
          <div className="flex h-full w-full flex-col lg:flex-row">
            <div
              className="
                relative
                z-10
                flex
                min-h-0
                flex-1
                items-center
                justify-center
                overflow-hidden
                bg-[#fffafa]
                px-5
                py-4
                shadow-[4px_0_18px_rgba(0,0,0,0.08)]
                sm:px-8
                lg:px-10
                lg:py-5
                xl:px-14
              "
            >
              {/* Language selector */}
              <div className="absolute left-4 top-3 z-10 sm:left-6 sm:top-4 lg:hidden">
                <LanguageSelector />
              </div>

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
                <h6
                  className="
                    mt-3
                    text-center
                    text-[15px]
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
                >
                  Blood Management
                  <br />
                  Made Simple
                </h6>

                {/* Description */}
                <p
                  className="
                    mt-2
                    max-w-[390px]
                    text-center
                    text-[10px]
                    leading-4
                    text-[#777777]
                    sm:mt-2.5
                    sm:text-[11px]
                    sm:leading-5
                    md:text-[12px]
                  "
                >
                  A simple and reliable platform connecting blood centres,
                  donors and recipients for better blood availability.
                </p>

                {/* Tagline */}
                <div
                  className="
                    mt-3
                    flex
                    items-center
                    gap-2
                    text-[9px]
                    text-[#888888]
                    sm:mt-4
                    sm:text-[10px]
                  "
                >
                  <span className="h-px w-5 bg-[#dddddd]" />

                  <span>Save Lives. Share Blood.</span>

                  <span className="h-px w-5 bg-[#dddddd]" />
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
                overflow-hidden
                bg-white
                px-6
                py-4
                sm:px-10
                lg:px-10
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
                {/* Language selector for desktop */}
                <div className="mb-2 hidden w-full justify-end lg:flex">
                  <LanguageSelector />
                </div>

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
                <h2
                  className="
                    mt-3
                    text-center
                    text-[20px]
                    font-semibold
                    tracking-[-0.2px]
                    text-[#222222]
                    sm:text-[23px]
                  "
                >
                  Blood Buddy Portal
                </h2>

                {/* Subtitle */}
                <p
                  className="
                    mt-1
                    mb-5
                    text-center
                    text-[10px]
                    leading-4
                    text-[#888888]
                    sm:text-[11px]
                  "
                >
                  Manage blood availability with ease
                </p>

                {/* Blood Centre button */}

                <Link
                  href="/blood-centre/login"
                  className="
                      group
                      flex
                      h-[50px]
                      w-full
                      items-center
                      justify-center
                      gap-2.5
                      rounded-[8px]
                      bg-[#FF3B3B]
                      px-5
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
                  <span>I am a Blood Centre</span>

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
                    href="/blood-centre/super-admin/login"
                    className="
                      !inline-block
                      !text-[#FF3B3B]
                      text-[11px]
                      font-semibold
                      !underline
                      !decoration-[#FF3B3B]
                      decoration-2
                      underline-offset-4
                      transition-colors
                      duration-200
                      hover:!text-[#FF3B3B]
                      hover:!decoration-[#FF3B3B]
                      sm:text-[12px]
                    "
                    style={{
                      color: "#FF3B3B",
                      textDecorationColor: "#FF3B3B",
                    }}
                  >
                    Super Admin Login Here
                  </Link>
                </div>

                {/* Secure access */}
                <div className="mt-5 w-full sm:mt-6">
                  <div className="flex items-center gap-2.5">
                    <div className="h-px flex-1 bg-[#eeeeee]" />

                    <span className="text-[8px] text-[#aaaaaa]">
                      SECURE ACCESS
                    </span>

                    <div className="h-px flex-1 bg-[#eeeeee]" />
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <ShieldCheck
                      size={12}
                      strokeWidth={1.7}
                      className="text-[#FF3B3B]"
                    />

                    <span className="text-[9px] text-[#888888]">
                      Authorized access for registered users
                    </span>
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
