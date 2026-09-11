"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MapPin, Phone, XCircle } from "lucide-react";

import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { DonorLogoutButton } from "@/app/components/common/DonorLogoutButton";
import {
  getDonorAvailability,
  getDonorSession,
} from "@/services/donor/donorSessionStorage";
import { getBloodGroups } from "@/services/master/masterService";
import type { MasterBloodGroup } from "@/types/master.types";
import type { DonorAvailabilityStatus } from "@/types/donor/donorTypes";

export function DonorDashboardScreen() {
  const session = getDonorSession();

  const [bloodGroups, setBloodGroups] = useState<MasterBloodGroup[]>([]);
  const [status, setStatus] = useState<DonorAvailabilityStatus>(
    "NOT_AVAILABLE",
  );

  useEffect(() => {
    let cancelled = false;

    async function loadBloodGroups() {
      try {
        const groups = await getBloodGroups();
        if (!cancelled) setBloodGroups(groups);
      } catch (error) {
        console.error("Load blood groups error:", error);
      }
    }

    void loadBloodGroups();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    const saved = getDonorAvailability(session.bloodDonorDetailsId);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating display state from local storage on mount, not synchronizing with a reactive value
    if (saved) setStatus(saved.status);
  }, [session]);

  const bloodGroupName =
    bloodGroups.find((group) => group.bloodGroupId === session?.bloodGroupId)
      ?.bloodGroupName ?? "—";

  const addressLine = [session?.city, session?.district, session?.pincode]
    .filter(Boolean)
    .join(", ");

  const isAvailable = status === "AVAILABLE";

  return (
    <ScreenShell>
      <BrandHeader />

      <section className="w-full bg-[var(--color-surface-alt)] px-4 pb-8 pt-6 sm:px-5 md:px-8 md:pb-12 md:pt-9">
        <div className="mx-auto w-full max-w-[560px]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-[17px] font-semibold text-[var(--color-text-primary)] sm:text-[19px] md:text-[22px]">
                Donor Dashboard
              </h1>

              <p className="mt-1 truncate text-[12px] text-[var(--color-text-muted)] sm:text-[13px]">
                Welcome{session?.fullName ? `, ${session.fullName}` : ""}
              </p>
            </div>

            <DonorLogoutButton />
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-border-lighter)] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-5 py-4">
              <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
                Blood Group
              </span>

              <span className="inline-flex min-w-[46px] items-center justify-center rounded-full border border-[#ffd5d5] bg-[#fff5f5] px-3 py-1 text-[13px] font-bold text-[var(--color-primary)]">
                {bloodGroupName}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-5 py-4">
              <span className="text-[13px] font-medium text-[var(--color-text-secondary)]">
                Availability Status
              </span>

              <span
                className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${
                  isAvailable ? "text-[var(--color-success)]" : "text-[var(--color-text-muted)]"
                }`}
              >
                {isAvailable ? (
                  <CheckCircle2 size={16} strokeWidth={2} />
                ) : (
                  <XCircle size={16} strokeWidth={2} />
                )}
                {isAvailable ? "Available to Donate" : "Not Available"}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-[var(--color-border-light)] px-5 py-4">
              <span className="flex items-center gap-2 text-[13px] font-medium text-[var(--color-text-secondary)]">
                <Phone size={15} strokeWidth={1.8} className="text-[var(--color-primary)]" />
                Contact Number
              </span>

              <span className="text-[13px] font-medium text-[var(--color-text-body)]">
                {session?.mobileNumber ?? "—"}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 px-5 py-4">
              <span className="flex items-center gap-2 text-[13px] font-medium text-[var(--color-text-secondary)]">
                <MapPin size={15} strokeWidth={1.8} className="text-[var(--color-primary)]" />
                Address
              </span>

              <span className="text-right text-[13px] font-medium text-[var(--color-text-body)]">
                {addressLine || "—"}
              </span>
            </div>
          </div>

          <Link
            href="/donor/availability"
            className="
              mt-8
              flex
              h-11
              w-full
              items-center
              justify-center
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
            Update Availability Status
          </Link>
        </div>
      </section>
    </ScreenShell>
  );
}
