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
                  rounded-[6px]
                  border
                  border-[var(--color-border-input)]
                  bg-white
                  p-3
                  sm:p-3.5
                  md:p-4
                  transition
                  hover:border-[#d9d9d9]
                  hover:shadow-sm
                "
              >
                <div className="flex items-center gap-2">
                  <span
                    className="
                      text-[13px]
                      font-bold
                      text-[var(--color-primary)]
                      sm:text-[14px]
                      md:text-[15px]
                    "
                  >
                    {item?.group}
                  </span>

                  <span
                    className="
                      rounded-full
                      bg-[var(--color-primary)]
                      px-2
                      py-0.5
                      text-[8px]
                      text-white
                      sm:text-[9px]
                      md:px-2.5
                      md:text-[10px]
                    "
                  >
                    {item?.units} Units
                  </span>
                </div>

                <p
                  className="
                    mt-2
                    text-[8px]
                    text-[var(--color-text-secondary)]
                    sm:text-[9px]
                    md:mt-2.5
                    md:text-[10px]
                  "
                >
                  Contact: 98765 43210
                </p>

                <p
                  className="
                    text-[8px]
                    text-[var(--color-text-secondary)]
                    sm:text-[9px]
                    md:text-[10px]
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
                h-[38px]
                w-full
                items-center
                justify-center
                gap-1
                rounded-[6px]
                bg-[var(--color-primary)]
                text-[11px]
                text-white
                transition
                hover:bg-[var(--color-dashboard-cta-hover)]
                active:scale-[0.99]
                sm:h-[40px]
                md:text-[12px]
                lg:w-[300px]
              "
            >
              <Plus size={14} />
              Add New
            </Link>
          </div>
        </div>
      </section>
    </ScreenShell>
  );
}
