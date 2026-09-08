"use client";

import Image from "next/image";
import Link from "next/link";

import { PoweredBy } from "@/app/components/common/PoweredBy";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/app/components/common/LanguageSelector";

export function WelcomeScreen() {
  const { t } = useLanguage();

  return (
    <ScreenShell>
      <BrandHeader />

      <section className="w-full bg-white px-5 py-7 md:min-h-[100px] md:px-8 md:py-5">
        <div
          className="
            mx-auto
            hidden
            w-full
            max-w-[1000px]
            overflow-hidden
            rounded-[12px]
            border
            border-[var(--color-border-lighter)]
            bg-white
            shadow-[0_8px_30px_rgba(0,0,0,0.08)]
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
                h-auto
                w-[260px]
                max-w-full
                object-contain
                lg:w-[300px]
              "
            />
          </div>

          <div className="w-px bg-[var(--color-border-light)]" />

          <div
            className="
              flex
              flex-col
              justify-center
              bg-white
              px-10
              py-12
              lg:px-16
            "
          >
            <div className="mx-auto w-full max-w-[360px]">
              <div className="mb-4 flex w-full justify-end">
                <LanguageSelector />
              </div>

              <h1
                className="
                  text-center
                  text-[20px]
                  font-semibold
                  text-[var(--color-text-primary)]
                "
              >
                {t("welcome.title")}
              </h1>

              <p
                className="
                  mt-2
                  text-center
                  text-[11px]
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
                  mt-7
                  flex
                  h-[42px]
                  w-full
                  items-center
                  justify-center
                  rounded-[6px]
                  bg-[var(--color-dark-cta)]
                  px-4
                  no-underline
                  opacity-100
                  transition
                  hover:bg-[var(--color-dark-cta-hover)]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[var(--color-dark-cta)]
                  focus:ring-offset-2
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
                    text-[12px]
                    font-medium
                    leading-none
                    text-[var(--color-white)]
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
                  h-[42px]
                  w-full
                  items-center
                  justify-center
                  rounded-[6px]
                  bg-[var(--color-primary)]
                  px-4
                  no-underline
                  opacity-100
                  transition
                  hover:bg-[var(--color-welcome-cta-hover)]
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[var(--color-primary)]
                  focus:ring-offset-2
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
                    text-[12px]
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
                  h-[42px]
                  w-full
                  items-center
                  justify-center
                  rounded-[6px]
                  border
                  border-[var(--color-text-primary)]
                  bg-white
                  px-4
                  no-underline
                  opacity-100
                  transition
                  hover:bg-[var(--color-surface-hover)]
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
                    text-[12px]
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

              <div className="mt-12 flex w-full justify-center">
                <PoweredBy />
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
                h-[38px]
                w-full
                items-center
                justify-center
                rounded-[6px]
                bg-[var(--color-dark-cta)]
                px-4
                no-underline
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
                  text-[12px]
                  font-normal
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
                mt-[10px]
                flex
                h-[38px]
                w-full
                items-center
                justify-center
                rounded-[6px]
                bg-[var(--color-primary)]
                px-4
                no-underline
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
                  text-[12px]
                  font-normal
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
                mt-[10px]
                flex
                h-[38px]
                w-full
                items-center
                justify-center
                rounded-[6px]
                border
                border-[var(--color-text-primary)]
                bg-white
                px-4
                no-underline
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
                  text-[12px]
                  font-normal
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
