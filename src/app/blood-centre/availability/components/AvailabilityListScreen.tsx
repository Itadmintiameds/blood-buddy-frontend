"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { BrandHeader } from "@/app/components/layout/BrandHeader";

const data = [
  {
    group: "A+",
    units: 2,
  },
  {
    group: "O+",
    units: 10,
  },
  {
    group: "B+",
    units: 2,
  },
];

export function AvailabilityListScreen() {
  return (
    <ScreenShell>
      <BrandHeader
        title="My Blood Availability"
        showBackButton
        backHref="/blood-centre/dashboard"
      />

      <section className="w-full bg-white">
        <div
          className="
            mx-auto
            w-full
            px-4
            pb-8
            pt-5
            sm:px-5
            sm:pt-6
            md:px-8
            md:pt-8
            lg:max-w-[1000px]
            lg:px-10
            lg:pt-10
          "
        >
          <div
            className="
              space-y-2.5
              sm:space-y-3
              md:space-y-4
            "
          >
            {data?.map((item) => (
              <div
                key={item.group}
                className="
                  rounded-xl
                  border
                  border-[var(--color-border-input)]
                  bg-white
                  p-4
                  transition-all
                  duration-200
                  hover:-translate-y-px
                  hover:border-[#d9d9d9]
                  hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]
                "
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="
                      text-[16px]
                      font-bold
                      text-[var(--color-primary)]
                    "
                  >
                    {item?.group}
                  </span>

                  <span
                    className="
                      rounded-full
                      bg-[var(--color-primary)]
                      px-2.5
                      py-1
                      text-[11px]
                      font-medium
                      text-white
                    "
                  >
                    {item?.units} Units
                  </span>
                </div>

                <p
                  className="
                    mt-2.5
                    text-[12px]
                    text-[var(--color-text-secondary)]
                  "
                >
                  Contact: 98765 43210
                </p>

                <p
                  className="
                    mt-0.5
                    text-[12px]
                    text-[var(--color-text-secondary)]
                  "
                >
                  Address: 115 Main Street, City Pin: 600001
                </p>
              </div>
            ))}
          </div>

          <div
            className="
              mt-7
              md:mt-8
              lg:flex
              lg:justify-center
            "
          >
            <Link
              href="/blood-centre/availability/add"
              className="
                flex
                h-11
                w-full
                items-center
                justify-center
                gap-1.5
                rounded-lg
                bg-[var(--color-primary)]
                text-[14px]
                font-semibold
                text-white
                shadow-[0_4px_14px_rgba(255,59,63,0.22)]
                transition-all
                duration-200
                hover:-translate-y-px
                hover:bg-[var(--color-dashboard-cta-hover)]
                active:translate-y-0
                active:scale-[0.99]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--color-primary)]
                focus-visible:ring-offset-2
                lg:w-[300px]
              "
            >
              <Plus size={16} />
              Add New
            </Link>
          </div>
        </div>
      </section>
    </ScreenShell>
  );
}
