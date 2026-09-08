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
          bg-white
          px-4
          pb-7
          pt-5
          sm:px-5
          md:px-8
          md:pb-10
          md:pt-8
        "
      >
        <div className="mx-auto w-full max-w-[720px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1
                className="
                  text-[14px]
                  font-medium
                  text-[var(--color-text-primary)]
                  sm:text-[15px]
                  md:text-[17px]
                "
              >
                Blood Centre Dashboard
              </h1>

              <p
                className="
                  mt-1
                  text-[9px]
                  text-[var(--color-text-muted)]
                  sm:text-[10px]
                  md:text-[11px]
                "
              >
                Welcome{session?.email ? `, ${session?.email}` : ""}
              </p>
            </div>

            <LogoutButton />
          </div>

          <div
            className="
              mt-5
              grid
              grid-cols-3
              gap-2
              sm:gap-3
              md:mt-6
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
              mt-5
              overflow-hidden
              rounded-[6px]
              border
              border-[var(--color-border-table)]
              md:mt-6
            "
          >
            <div
              className="
                bg-white
                px-3
                py-2
                text-[10px]
                font-medium
                text-[var(--color-text-primary)]
                sm:text-[11px]
                md:px-4
                md:py-2.5
                md:text-[12px]
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
                px-3
                py-2
                text-[8px]
                font-semibold
                text-[var(--color-text-secondary)]
                sm:px-4
                sm:text-[9px]
                md:px-4
                md:py-2.5
                md:text-[10px]
              "
            >
              <div className="text-left">Blood Group</div>
              <div className="text-center">Blood Type</div>
              <div className="text-right">Blood Units</div>
            </div>

            {loading && (
              <div className="px-3 py-4 text-center text-[10px] text-[var(--color-text-muted)]">
                Loading availability...
              </div>
            )}

            {!loading && error && (
              <div
                role="alert"
                className="px-3 py-4 text-center text-[10px] text-red-500"
              >
                {error}
              </div>
            )}

            {!loading && !error && rows.length === 0 && (
              <div className="px-3 py-4 text-center text-[10px] text-[var(--color-text-muted)]">
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
                    min-h-[36px]
                    grid-cols-[1fr_1.5fr_1fr]
                    items-center
                    border-t
                    border-[var(--color-border-light)]
                    px-3
                    text-[9px]
                    text-[var(--color-text-body)]
                    sm:min-h-[38px]
                    sm:px-4
                    sm:text-[10px]
                    md:min-h-[42px]
                    md:px-4
                    md:text-[11px]
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
                      size={11}
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
              mt-7
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
              md:mx-auto
              md:mt-8
              md:w-[300px]
              md:text-[12px]
            "
          >
            <Plus size={14} />
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
        min-h-[78px]
        flex-col
        items-center
        justify-center
        rounded-[7px]
        px-2
        py-3
        text-center
        text-white
        sm:min-h-[82px]
        md:min-h-[95px]
        md:rounded-[8px]
      "
      style={{
        backgroundColor: color,
      }}
    >
      <Icon size={17} strokeWidth={1.8} className="sm:h-[18px] sm:w-[18px]" />

      <div
        className="
          mt-1
          text-[17px]
          font-semibold
          leading-5
          sm:text-[18px]
          md:text-[20px]
        "
      >
        {value}
      </div>

      <div
        className="
          mt-0.5
          text-[7px]
          leading-3
          sm:text-[8px]
          md:text-[9px]
        "
      >
        {label}
      </div>
    </div>
  );
}
