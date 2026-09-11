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

      <section className="w-full bg-[var(--color-surface-alt)] px-5 py-10 md:min-h-[100px] md:px-8 md:py-14">
        <div
          className="
            mx-auto
            hidden
            w-full
            max-w-[1000px]
            overflow-hidden
            rounded-2xl
            border
            border-[var(--color-border-lighter)]
            bg-white
            shadow-[0_20px_50px_rgba(0,0,0,0.07)]
            md:grid
            md:grid-cols-[1fr_1px_1fr]
            lg:min-h-[520px]
          "
        >
          <div
            className="
              flex
              items-center
              justify-center
              bg-white
              px-10
              py-12
            "
          >
            <Image
              src="/images/blood-buddy-logo.png"
              alt="Blood Buddy"
              width={100}
              height={345}
              priority
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
                  text-center
                  font-work-sans
                  text-[24px]
                  font-semibold
                  tracking-[-0.01em]
                  text-[var(--color-text-primary)]
                "
              >
                {t("welcome.title")}
              </h1>

              <p
                className="
                  mt-2.5
                  text-center
                  text-[13px]
                  leading-5
                  text-[var(--color-text-tertiary)]
                "
              >
                {t("welcome.subtitle")}
              </p>

              <Link
                href="/blood-centre/login"
                aria-label={t("welcome.bloodCentre")}
                className="
                  relative
                  z-10
                  mt-8
                  flex
                  h-11
                  w-full
                  max-w-[400px]
                  flex-col
                  items-center
                  justify-center
                  rounded-lg
                  bg-[var(--color-dark-cta)]
                  px-4
                  no-underline
                  opacity-100
                  shadow-[0_4px_14px_rgba(0,0,0,0.14)]
                  transition-all
                  duration-200
                  hover:-translate-y-px
                  hover:bg-[var(--color-dark-cta-hover)]
                  hover:shadow-[0_6px_18px_rgba(0,0,0,0.18)]
                  active:translate-y-0
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[var(--color-dark-cta)]
                  focus:ring-offset-2
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
                    block
                    w-full
                    text-center
                    text-[14px]
                    font-medium
                    leading-none
                    text-[var(--color-white)]
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
                  h-11
                  w-full
                  max-w-[390px]
                  flex-col
                  items-center
                  justify-center
                  rounded-lg
                  bg-[var(--color-primary)]
                  px-4
                  no-underline
                  opacity-100
                  shadow-[0_4px_14px_rgba(255,59,63,0.2)]
                  transition-all
                  duration-200
                  hover:-translate-y-px
                  hover:bg-[var(--color-welcome-cta-hover)]
                  hover:shadow-[0_6px_18px_rgba(255,59,63,0.26)]
                  active:translate-y-0
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[var(--color-primary)]
                  focus:ring-offset-2
                "
              >
                <span
                  className="
                    block
                    w-full
                    text-center
                    text-[14px]
                    font-medium
                    leading-none
                    text-white
                  "
                  style={{
                    color: "var(--color-white)",
                    opacity: 1,
                    visibility: "visible",
                    display: "block",
                  }}
                >
                  {t("welcome.donor")}
                </span>
              </Link>

              <Link
                href="/recipient"
                aria-label={t("welcome.recipient")}
                className="
                  relative
                  z-10
                  mt-3
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-[var(--color-text-primary)]
                  bg-white
                  px-4
                  no-underline
                  opacity-100
                  transition-all
                  duration-200
                  hover:-translate-y-px
                  hover:bg-[var(--color-surface-hover)]
                  active:translate-y-0
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[var(--color-text-primary)]
                  focus:ring-offset-2
                "
                style={{
                  backgroundColor: "var(--color-white)",
                  color: "var(--color-text-primary)",
                  textDecoration: "none",
                  opacity: 1,
                }}
              >
                <span
                  className="
                    block
                    w-full
                    text-center
                    text-[14px]
                    font-medium
                    leading-none
                    text-[var(--color-text-primary)]
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
                      text-[10px]
                      font-medium
                      text-[#FF3B3B]
                      underline
                      underline-offset-4
                      transition
                      hover:text-[#e93232]
                      sm:text-[11px]
                    "
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
        </div>

        <div
          className="
            flex
            w-full
            flex-col
            items-center

            md:hidden
          "
        >
          <div className="flex w-full justify-end">
            <LanguageSelector />
          </div>

          <div className="flex w-full justify-center pt-2">
            <Image
              src="/images/blood-buddy-logo.png"
              alt="Blood Buddy"
              width={300}
              height={445}
              priority
              className="
                h-auto
                w-[205px]
                max-w-full
                object-contain
              "
            />
          </div>

          <div className="mt-8 w-full max-w-[360px]">
            <Link
              href="/blood-centre/register"
              aria-label={t("welcome.bloodCentre")}
              className="
                relative
                z-10
                flex
                h-11
                w-full
                items-center
                justify-center
                rounded-lg
                bg-[var(--color-dark-cta)]
                px-4
                no-underline
                shadow-[0_4px_14px_rgba(0,0,0,0.14)]
                transition-all
                duration-200
                active:scale-[0.98]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--color-dark-cta)]
                focus-visible:ring-offset-2
              "
              style={{
                backgroundColor: "var(--color-dark-cta)",
                color: "var(--color-white)",
                textDecoration: "none",
                opacity: 1,
              }}
            >
              <span
                className="
                  block
                  w-full
                  text-center
                  text-[14px]
                  font-medium
                  leading-none
                  text-white
                "
                style={{
                  color: "var(--color-white)",
                  opacity: 1,
                  visibility: "visible",
                  display: "block",
                }}
              >
                {t("welcome.bloodCentre")}
              </span>
            </Link>

            <Link
              href="/donor"
              aria-label={t("welcome.donor")}
              className="
                relative
                z-10
                mt-3
                flex
                h-11
                w-full
                items-center
                justify-center
                rounded-lg
                bg-[var(--color-primary)]
                px-4
                no-underline
                shadow-[0_4px_14px_rgba(255,59,63,0.2)]
                transition-all
                duration-200
                active:scale-[0.98]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--color-primary)]
                focus-visible:ring-offset-2
              "
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-white)",
                textDecoration: "none",
                opacity: 1,
              }}
            >
              <span
                className="
                  block
                  w-full
                  text-center
                  text-[14px]
                  font-medium
                  leading-none
                  text-white
                "
                style={{
                  color: "var(--color-white)",
                  opacity: 1,
                  visibility: "visible",
                  display: "block",
                }}
              >
                {t("welcome.donor")}
              </span>
            </Link>

            <Link
              href="/recipient"
              aria-label={t("welcome.recipient")}
              className="
                relative
                z-10
                mt-3
                flex
                h-11
                w-full
                items-center
                justify-center
                rounded-lg
                border
                border-[var(--color-text-primary)]
                bg-white
                px-4
                no-underline
                transition-all
                duration-200
                active:scale-[0.98]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--color-text-primary)]
                focus-visible:ring-offset-2
              "
              style={{
                backgroundColor: "var(--color-white)",
                color: "var(--color-text-primary)",
                textDecoration: "none",
                opacity: 1,
              }}
            >
              <span
                className="
                  block
                  w-full
                  text-center
                  text-[14px]
                  font-medium
                  leading-none
                  text-[var(--color-text-primary)]
                "
                style={{
                  color: "var(--color-text-primary)",
                  opacity: 1,
                  visibility: "visible",
                  display: "block",
                }}
              >
                {t("welcome.recipient")}
              </span>
            </Link>

            <div className="mt-12 flex w-full justify-center pb-5">
              <PoweredBy />
            </div>
          </div>
        </div>
      </section>
    </ScreenShell>
  );
}
