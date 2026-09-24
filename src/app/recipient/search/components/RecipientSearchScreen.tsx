"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  MapPin,
  Phone,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";

import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { getLastRecipientPincode } from "@/services/recipient/recipientSessionStorage";
import {
  searchNearbyBloodBanks,
  searchNearbyDonors,
} from "@/services/recipient/recipientSearchService";
import type {
  NearbyBloodBank,
  NearbyDonor,
} from "@/types/recipient/receipientTypes";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";

type Tab = "bloodBanks" | "donors";

export function RecipientSearchScreen() {
  const searchPlaceholder = useBilingualText("recipient.searchByPincode");
  const searchLabel = useBilingualText("common.search");
  const unitsSuffix = useBilingualText("recipient.unitsSuffix");

  const [pincode, setPincode] = useState("");
  const [tab, setTab] = useState<Tab>("bloodBanks");
  const [bloodBanks, setBloodBanks] = useState<NearbyBloodBank[]>([]);
  const [donors, setDonors] = useState<NearbyDonor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating from session storage on mount, not synchronizing with a reactive value
    setPincode(getLastRecipientPincode());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function search() {
      setLoading(true);
      try {
        const [banks, nearbyDonors] = await Promise.all([
          searchNearbyBloodBanks(pincode),
          searchNearbyDonors(pincode),
        ]);
        if (!cancelled) {
          setBloodBanks(banks);
          setDonors(nearbyDonors);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void search();

    return () => {
      cancelled = true;
    };
  }, [pincode]);

  return (
    <ScreenShell>
      <BrandHeader
        title={<Bilingual tKey="recipient.searchTitle" as="span" />}
        showBackButton
        backHref="/recipient/register"
      />

      <main className="w-full bg-[var(--color-surface-alt)]">
        <section className="mx-auto w-full max-w-[720px] px-4 pb-10 pt-5 sm:px-6 sm:pt-7">
          {/* Pincode search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin
                size={17}
                strokeWidth={1.7}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-primary)]"
              />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={pincode}
                onChange={(event) =>
                  setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder={searchPlaceholder}
                className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-white pl-10 pr-3 text-[14px] text-[var(--color-text-body)] outline-none transition-all duration-200 placeholder:text-[var(--color-text-placeholder)] hover:border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </div>

            <button
              type="button"
              aria-label={searchLabel}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white shadow-[0_4px_14px_rgba(255,59,63,0.22)] transition-all duration-200 hover:bg-[var(--color-primary-hover)] active:scale-[0.98]"
            >
              <Search size={18} />
            </button>
          </div>

          {/* Map placeholder — no search endpoint or maps provider wired up
              yet; the list below is fully functional against sample data
              (see recipientSearchService.ts). */}
          <div className="mt-4 flex h-[160px] w-full items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-white">
            <div className="text-center">
              <MapPin
                size={22}
                strokeWidth={1.6}
                className="mx-auto text-[var(--color-text-placeholder)]"
              />
              <Bilingual
                tKey="recipient.interactiveMapComingSoon"
                as="p"
                className="mt-1.5 text-[12px] text-[var(--color-text-placeholder-alt)]"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => setTab("bloodBanks")}
              className={`flex min-h-9 items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-200 ${
                tab === "bloodBanks"
                  ? "bg-[var(--color-primary)] text-white shadow-[0_4px_14px_rgba(255,59,63,0.22)]"
                  : "border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-border)]"
              }`}
            >
              <BilingualInline
                tKey="recipient.bloodBanksTab"
                params={{ count: bloodBanks.length }}
              />
            </button>

            <button
              type="button"
              onClick={() => setTab("donors")}
              className={`flex min-h-9 items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all duration-200 ${
                tab === "donors"
                  ? "bg-[var(--color-primary)] text-white shadow-[0_4px_14px_rgba(255,59,63,0.22)]"
                  : "border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-border)]"
              }`}
            >
              <BilingualInline
                tKey="recipient.donorsTab"
                params={{ count: donors.length }}
              />
            </button>
          </div>

          {/* Results */}
          <div className="mt-4 space-y-3">
            {loading && (
              <Bilingual
                tKey="recipient.searching"
                as="div"
                className="rounded-2xl border border-[var(--color-border-lighter)] bg-white px-4 py-6 text-center text-[13px] text-[var(--color-text-muted)]"
              />
            )}

            {!loading && tab === "bloodBanks" &&
              (bloodBanks.length === 0 ? (
                <EmptyState tKey="recipient.noBloodBanksFound" />
              ) : (
                bloodBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className="rounded-2xl border border-[var(--color-border-lighter)] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-icon-bg-soft)]">
                          <Building2 size={18} className="text-[var(--color-primary)]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-[14px] font-bold text-[var(--color-text-body)]">
                            {bank.name}
                          </h3>
                          <p className="mt-0.5 truncate text-[12px] text-[var(--color-text-placeholder-alt)]">
                            {bank.address}
                          </p>
                        </div>
                      </div>

                      <BloodGroupBadge value={bank.bloodGroup} />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[12px]">
                      <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                        <Phone size={13} strokeWidth={1.8} className="text-[var(--color-primary)]" />
                        {bank.mobileNumber}
                      </span>
                      <span className="font-semibold text-[var(--color-text-body)]">
                        {bank.unitsAvailable} {unitsSuffix}
                      </span>
                    </div>
                  </div>
                ))
              ))}

            {!loading && tab === "donors" &&
              (donors.length === 0 ? (
                <EmptyState tKey="recipient.noDonorsFound" />
              ) : (
                donors.map((donor) => (
                  <div
                    key={donor.id}
                    className="rounded-2xl border border-[var(--color-border-lighter)] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-icon-bg-soft)]">
                          <UserRound size={18} className="text-[var(--color-primary)]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-[14px] font-bold text-[var(--color-text-body)]">
                            {donor.fullName}
                          </h3>
                          <p className="mt-0.5 flex items-center gap-1 text-[12px] text-[var(--color-text-secondary)]">
                            <Phone size={12} strokeWidth={1.8} />
                            {donor.mobileNumber}
                          </p>
                        </div>
                      </div>

                      <BloodGroupBadge value={donor.bloodGroup} />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[12px]">
                      <span
                        className={`flex items-center gap-1.5 font-semibold ${
                          donor.available
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-text-muted)]"
                        }`}
                      >
                        {donor.available ? (
                          <CheckCircle2 size={14} strokeWidth={2} className="shrink-0" />
                        ) : (
                          <XCircle size={14} strokeWidth={2} className="shrink-0" />
                        )}
                        <BilingualInline
                          tKey={
                            donor.available
                              ? "recipient.availableToDonate"
                              : "recipient.notAvailable"
                          }
                        />
                      </span>
                    </div>
                  </div>
                ))
              ))}
          </div>
        </section>
      </main>
    </ScreenShell>
  );
}

function BloodGroupBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex min-w-[42px] shrink-0 items-center justify-center rounded-full border border-[var(--primary-200)] bg-[var(--color-icon-bg-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary)]">
      {value}
    </span>
  );
}

function EmptyState({ tKey }: { tKey: string }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-lighter)] bg-white px-4 py-8 text-center">
      <Bilingual
        tKey={tKey}
        as="p"
        className="text-[13px] font-medium text-[var(--color-text-secondary)]"
      />
    </div>
  );
}
