"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Droplets, Package, Plus } from "lucide-react";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { LogoutButton } from "@/app/components/common/LogoutButton";
import { getBloodCentreSession } from "@/services/auth/authStorage";
import { getApiErrorMessage } from "@/services/api/client";
import { getAvailability } from "@/services/bloodCenter/bloodCenter.service";
import type { BloodAvailabilityItem } from "@/types/bloodCenter/bloodCenterTypes";
import { mergeBloodAvailabilityRows } from "@/utils/bloodAvailability";
import { routes } from "@/config/routes";

export function BloodCentreDashboardScreen() {
  const [rows, setRows] = useState<BloodAvailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const session = getBloodCentreSession();

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      setLoading(true);
      setError("");

      try {
        const data = await getAvailability();

        if (!cancelled) {
          setRows(mergeBloodAvailabilityRows(data));
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              fetchError,
              "Unable to load blood availability.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalGroupsListed = new Set(
    rows.map((row) => row.bloodGroup.trim().toUpperCase()),
  ).size;
  const totalUnits = rows.reduce((sum, row) => sum + row.unitsAvailable, 0);
  const lowStockCount = rows.filter((row) => row.unitsAvailable <= 3).length;

  return (
    <ScreenShell>
      <BrandHeader />

      <section
        className="
          w-full
          bg-[var(--color-surface-alt)]
          px-4
          pb-8
          pt-6
          sm:px-5
          md:px-8
          md:pb-12
          md:pt-9
        "
      >
        <div className="mx-auto w-full max-w-[720px]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1
                className="
                  text-[17px]
                  font-semibold
                  text-[var(--color-text-primary)]
                  sm:text-[19px]
                  md:text-[22px]
                "
              >
                Blood Centre Dashboard
              </h1>

              <p
                className="
                  mt-1
                  truncate
                  text-[12px]
                  text-[var(--color-text-muted)]
                  sm:text-[13px]
                "
              >
                Welcome{session?.email ? `, ${session?.email}` : ""}
              </p>
            </div>

            <LogoutButton />
          </div>

          <div
            className="
              mt-6
              grid
              grid-cols-3
              gap-2.5
              sm:gap-3.5
              md:mt-7
              md:gap-4
            "
          >
            <Stat
              icon={Droplets}
              value={String(totalGroupsListed)}
              label="Blood Groups Listed"
              color="var(--color-stat-red)"
            />

            <Stat
              icon={Package}
              value={String(totalUnits)}
              label="Total Units Available"
              color="var(--color-stat-green)"
            />

            <Stat
              icon={AlertTriangle}
              value={String(lowStockCount)}
              label="Low Stock Alerts"
              color="var(--color-stat-yellow)"
            />
          </div>

          {/* BLOOD AVAILABILITY OVERVIEW */}
          <div
            className="
              mt-6
              overflow-hidden
              rounded-xl
              border
              border-[var(--color-border-table)]
              bg-white
              shadow-[0_2px_12px_rgba(0,0,0,0.03)]
              md:mt-7
            "
          >
            <div
              className="
                bg-white
                px-4
                py-3
                text-[13px]
                font-semibold
                text-[var(--color-text-primary)]
                md:px-5
                md:py-3.5
                md:text-[14px]
              "
            >
              Blood Availability Overview
            </div>

            <div
              className="
                grid
                grid-cols-[1fr_1.5fr_1fr]
                items-center
                border-t
                border-[var(--color-border-light)]
                bg-[var(--color-surface-alt)]
                px-4
                py-2.5
                text-[11px]
                font-semibold
                uppercase
                tracking-wide
                text-[var(--color-text-secondary)]
                md:px-5
                md:py-3
                md:text-[12px]
              "
            >
              <div className="text-left">Blood Group</div>
              <div className="text-center">Blood Type</div>
              <div className="text-right">Blood Units</div>
            </div>

            {loading && (
              <div className="px-4 py-6 text-center text-[13px] text-[var(--color-text-muted)]">
                Loading availability...
              </div>
            )}

            {!loading && error && (
              <div
                role="alert"
                className="px-4 py-6 text-center text-[13px] text-red-500"
              >
                {error}
              </div>
            )}

            {!loading && !error && rows.length === 0 && (
              <div className="px-4 py-6 text-center text-[13px] text-[var(--color-text-muted)]">
                No availability added yet.
              </div>
            )}

            {!loading &&
              !error &&
              rows.map((row, index) => (
                <div
                  key={`${row.bloodGroup}-${row.bloodType}`}
                  className="
                    grid
                    min-h-[44px]
                    grid-cols-[1fr_1.5fr_1fr]
                    items-center
                    border-t
                    border-[var(--color-border-light)]
                    px-4
                    text-[12px]
                    text-[var(--color-text-body)]
                    md:min-h-[48px]
                    md:px-5
                    md:text-[13px]
                  "
                  style={{
                    backgroundColor:
                      index % 2 === 0
                        ? "var(--color-surface-alt)"
                        : "var(--color-white)",
                  }}
                >
                  <div className="flex min-w-0 items-center justify-start">
                    <Droplets
                      size={13}
                      strokeWidth={1.8}
                      className="mr-2 shrink-0 text-[var(--color-stat-red)] sm:mr-2.5 md:mr-3"
                    />
                    <span className="truncate font-medium">
                      {row.bloodGroup}
                    </span>
                  </div>

                  <div className="min-w-0 text-center font-medium text-[var(--color-text-quaternary)]">
                    <span className="break-words">{row.bloodType}</span>
                  </div>

                  <div className="text-right font-medium text-[var(--color-text-body)]">
                    {row.unitsAvailable} Units
                  </div>
                </div>
              ))}
          </div>

          {/* ADD AVAILABILITY BUTTON */}
          <Link
            href={routes.addAvailability}
            className="
              mt-8
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
              md:mx-auto
              md:mt-9
              md:w-[300px]
            "
          >
            <Plus size={16} />
            Add Availability
          </Link>
        </div>
      </section>
    </ScreenShell>
  );
}

//  STAT CARD

function Stat({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Droplets;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div
      className="
        flex
        min-h-[88px]
        flex-col
        items-center
        justify-center
        gap-1
        rounded-xl
        px-2
        py-3.5
        text-center
        text-white
        shadow-[0_6px_16px_rgba(0,0,0,0.08)]
        transition-transform
        duration-200
        hover:-translate-y-px
        sm:min-h-[96px]
        md:min-h-[104px]
      "
      style={{
        backgroundColor: color,
      }}
    >
      <Icon size={18} strokeWidth={1.8} className="sm:h-5 sm:w-5" />

      <div
        className="
          text-[18px]
          font-bold
          leading-6
          sm:text-[20px]
          md:text-[22px]
        "
      >
        {value}
      </div>

      <div
        className="
          text-[10px]
          font-medium
          leading-4
          opacity-90
          sm:text-[11px]
        "
      >
        {label}
      </div>
    </div>
  );
}
