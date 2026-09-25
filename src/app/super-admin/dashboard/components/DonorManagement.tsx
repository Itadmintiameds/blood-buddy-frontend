"use client";

import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Droplets,
  Loader2,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SuperAdminDonor } from "@/types/bloodCenter/superAdmin/superAdminTypes";
import { getSuperAdminDonors } from "@/services/bloodCenter/superAdmin/dashboardService";
import { registerDonor } from "@/services/donor/donorRegistrationService";
import { getBloodGroups } from "@/services/master/masterService";
import { getApiErrorMessage } from "@/services/api/client";
import { useExitTransition } from "@/app/hooks/useExitTransition";
import {
  donorRegistrationSchema,
  normalizeDonorForm,
} from "@/schema/donor/donorRegistrationSchema";
import type { DonorRegistrationInput } from "@/types/donor/donorTypes";
import type { MasterBloodGroup } from "@/types/master.types";
import { StatTile } from "@/app/components/ui/StatTile";
import { FormInput } from "@/app/components/ui/FormInput";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";

const ALL = "all";

const RECENT_DONATION_WINDOW_DAYS = 30;

const emptyDonorForm: DonorRegistrationInput = {
  fullName: "",
  mobileNumber: "",
  alternativeMobileNumber: "",
  bloodGroupId: "",
  dob: "",
  address: "",
  district: "",
  city: "",
  pincode: "",
  lastBloodDonationDate: "",
};

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB");
}

export function DonorManagement() {
  const searchPlaceholder = useBilingualText("superAdmin.searchDonor");

  const [donors, setDonors] = useState<SuperAdminDonor[]>([]);
  const [search, setSearch] = useState("");
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>(ALL);
  const [reloadToken, setReloadToken] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addDonorOpen, setAddDonorOpen] = useState(false);
  const [masterGroups, setMasterGroups] = useState<MasterBloodGroup[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<SuperAdminDonor | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

    const loadDonors = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSuperAdminDonors();

        if (!mounted) {
          return;
        }

        setDonors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load donors:", err);

        if (mounted) {
          setDonors([]);
          setError("Unable to load donor details.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDonors();

    return () => {
      mounted = false;
    };
  }, [reloadToken]);

  useEffect(() => {
    let cancelled = false;

    getBloodGroups()
      .then((groups) => {
        if (!cancelled) setMasterGroups(groups);
      })
      .catch(() => {
        // Non-critical: the group filter and the Add Donor form fall back to
        // whatever groups already appear in the donor list.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const bloodGroupOptions = useMemo(() => {
    if (masterGroups.length > 0) {
      return masterGroups.map((group) => group.bloodGroupName);
    }

    return Array.from(new Set(donors.map((donor) => donor.bloodGroup))).sort(
      (a, b) => a.localeCompare(b),
    );
  }, [masterGroups, donors]);

  const totalDonors = donors.length;

  const distinctBloodGroupCount = useMemo(
    () => new Set(donors.map((donor) => donor.bloodGroup)).size,
    [donors],
  );

  const recentDonationCutoff =
    new Date().getTime() - RECENT_DONATION_WINDOW_DAYS * 24 * 60 * 60 * 1000;

  const recentDonationCount = donors.filter((donor) => {
    if (!donor.lastBloodDonationDate) return false;
    const date = new Date(donor.lastBloodDonationDate).getTime();
    return !Number.isNaN(date) && date >= recentDonationCutoff;
  }).length;

  const isFiltering = search.trim().length > 0 || bloodGroupFilter !== ALL;

  const clearFilters = () => {
    setSearch("");
    setBloodGroupFilter(ALL);
  };

  const handleRefresh = () => {
    setSpinning(true);
    clearFilters();
    setReloadToken((token) => token + 1);
    window.setTimeout(() => setSpinning(false), 500);
  };

  const filteredDonors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return donors.filter((donor) => {
      const matchesQuery =
        !query ||
        donor?.donorName.toLowerCase().includes(query) ||
        donor?.mobileNumber.includes(query) ||
        donor?.bloodGroup.toLowerCase().includes(query) ||
        donor?.address.toLowerCase().includes(query) ||
        donor?.pincode.includes(query);

      const matchesGroup =
        bloodGroupFilter === ALL || donor.bloodGroup === bloodGroupFilter;

      return matchesQuery && matchesGroup;
    });
  }, [donors, search, bloodGroupFilter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile
          icon={Users}
          value={String(totalDonors)}
          label={
            <Bilingual
              tKey="superAdmin.totalDonorsStat"
              as="span"
              enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
            />
          }
          color="var(--color-stat-red)"
          index={0}
        />

        <StatTile
          icon={Droplets}
          value={String(distinctBloodGroupCount)}
          label={
            <Bilingual
              tKey="superAdmin.bloodGroupsStat"
              as="span"
              enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
            />
          }
          color="var(--color-stat-yellow)"
          index={1}
        />

        <StatTile
          icon={CalendarDays}
          value={String(recentDonationCount)}
          label={
            <Bilingual
              tKey="superAdmin.recentDonationsStat"
              as="span"
              enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
            />
          }
          color="var(--color-stat-green)"
          index={2}
        />
      </div>

      {/* Search + filters */}
      <div className="rounded-2xl border border-[var(--color-border-lighter)] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <div className="relative w-full sm:max-w-[360px]">
            <Search
              size={18}
              strokeWidth={1.7}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-placeholder-alt)]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-[46px] w-full rounded-xl border border-[var(--color-border-light)] bg-white pl-11 pr-4 text-[13px] text-[var(--color-text-body)] outline-none transition placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          <div className="relative">
            <select
              value={bloodGroupFilter}
              onChange={(event) => setBloodGroupFilter(event.target.value)}
              aria-label="Filter by blood group"
              className={`h-11 w-full cursor-pointer appearance-none rounded-lg border bg-white pl-3 pr-8 text-[13px] text-[var(--color-text-body)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 sm:w-auto ${
                bloodGroupFilter !== ALL
                  ? "border-[var(--primary-200)] font-medium"
                  : "border-[var(--color-border-light)]"
              }`}
            >
              <option value={ALL}>All blood groups</option>
              {bloodGroupOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <ChevronDown
              size={15}
              strokeWidth={1.8}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
            />
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--primary-200)] hover:bg-[var(--color-icon-bg-soft)] hover:text-[var(--color-primary)] active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Refresh and clear filters"
            title="Refresh &amp; clear filters"
          >
            <RefreshCw
              size={15}
              className={
                spinning ? "animate-spin-once" : loading ? "animate-spin" : ""
              }
            />
          </button>

          {isFiltering && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[12px] font-medium text-[var(--color-primary)] transition hover:underline"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={() => setAddDonorOpen(true)}
            className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-[13px] font-semibold text-white shadow-[0_5px_15px_rgba(255,59,63,0.18)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--color-dashboard-cta-hover)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 sm:ml-auto sm:w-auto sm:text-[14px]"
          >
            <Plus size={16} className="shrink-0" />
            Add Donor
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600"
        >
          <AlertCircle size={16} className="shrink-0" />
          <span className="min-w-0">{error}</span>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-[var(--color-border-lighter)] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.025)] lg:block">
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[5%]" />
              <col className="w-[11%]" />
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[7%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[8%]" />
              <col className="w-[16%]" />
              <col className="w-[10%]" />
            </colgroup>

            <thead>
              <tr className="border-b border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)]">
                <TableHeader tKey="superAdmin.sNo" />
                <TableHeader tKey="superAdmin.donorName" />
                <TableHeader tKey="common.mobileNumber" />
                <TableHeader tKey="superAdmin.alternateMobileNo" />
                <TableHeader tKey="bloodCentre.bloodGroup" />
                <TableHeader tKey="donor.dateOfBirth" />
                <TableHeader tKey="common.address" />
                <TableHeader tKey="superAdmin.pincode" />
                <TableHeader tKey="superAdmin.lastBloodDonationDate" />
                <TableHeader tKey="superAdmin.action" />
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10}>
                    <LoadingState />
                  </td>
                </tr>
              ) : filteredDonors?.length > 0 ? (
                filteredDonors.map((donor, index) => (
                  <tr
                    key={donor.id}
                    onClick={() => setSelectedDonor(donor)}
                    className="cursor-pointer border-b border-[var(--color-border-light)] transition-colors duration-200 last:border-b-0 hover:bg-[var(--color-icon-bg-soft)]"
                  >
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-icon-bg-soft)]">
                          <UserRound
                            size={15}
                            className="text-[var(--color-primary)]"
                          />
                        </div>

                        <span className="truncate font-semibold text-[var(--color-text-body)]">
                          {donor?.donorName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>{donor?.mobileNumber}</TableCell>

                    <TableCell>{donor?.alternateMobileNumber}</TableCell>

                    <TableCell>
                      <BloodGroupBadge value={donor?.bloodGroup} />
                    </TableCell>

                    <TableCell>{formatDate(donor?.dateOfBirth)}</TableCell>

                    <TableCell>
                      <span className="block truncate">{donor?.address}</span>
                    </TableCell>

                    <TableCell>{donor?.pincode}</TableCell>

                    <TableCell>
                      {formatDate(donor?.lastBloodDonationDate)}
                    </TableCell>

                    <TableCell>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedDonor(donor);
                        }}
                        className="
                          rounded-lg
                          border
                          border-[var(--color-border-lighter)]
                          bg-white
                          px-3
                          py-1.5
                          text-[11px]
                          font-semibold
                          text-[var(--color-primary)]
                          shadow-sm
                          transition-all
                          duration-200
                          hover:-translate-y-px
                          hover:border-[var(--primary-200)]
                          hover:bg-[var(--color-icon-bg-soft)]
                        "
                      >
                        <BilingualInline tKey="superAdmin.view" />
                      </button>
                    </TableCell>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10}>
                    <EmptyState tKey="superAdmin.noDonorDataFound" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet */}
      <div className="hidden overflow-hidden rounded-2xl border border-[var(--color-border-lighter)] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.025)] sm:block lg:hidden">
        <div className="divide-y divide-[var(--color-border-lighter)]">
          {loading ? (
            <LoadingState />
          ) : filteredDonors?.length > 0 ? (
            filteredDonors.map((donor, index) => (
              <div
                key={donor.id}
                onClick={() => setSelectedDonor(donor)}
                className="cursor-pointer p-5 transition-colors duration-150 hover:bg-[var(--color-icon-bg-soft)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-icon-bg-soft)]">
                      <UserRound
                        size={18}
                        className="text-[var(--color-primary)]"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-bold text-[var(--color-text-body)]">
                        {index + 1}. {donor?.donorName}
                      </p>

                      <p className="mt-1 text-[12px] text-[var(--color-text-placeholder-alt)]">
                        {donor?.mobileNumber}
                      </p>
                    </div>
                  </div>

                  <BloodGroupBadge value={donor?.bloodGroup} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <InfoItem
                    tKey="superAdmin.alternateMobile"
                    value={donor?.alternateMobileNumber}
                  />

                  <InfoItem
                    tKey="donor.dateOfBirth"
                    value={formatDate(donor?.dateOfBirth)}
                  />

                  <InfoItem tKey="common.address" value={donor?.address} />

                  <InfoItem tKey="superAdmin.pincode" value={donor?.pincode} />

                  <InfoItem
                    tKey="superAdmin.lastDonation"
                    value={formatDate(donor?.lastBloodDonationDate)}
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedDonor(donor);
                    }}
                    className="rounded-lg border border-[var(--color-border-lighter)] bg-white px-3.5 py-2 text-[12px] font-semibold text-[var(--color-primary)] shadow-sm transition-all duration-200 hover:border-[var(--primary-200)] hover:bg-[var(--color-icon-bg-soft)]"
                  >
                    <BilingualInline tKey="superAdmin.viewDetails" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState tKey="superAdmin.noDonorDataFound" />
          )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-4 sm:hidden">
        {loading ? (
          <LoadingState />
        ) : filteredDonors.length > 0 ? (
          filteredDonors.map((donor, index) => (
            <div
              key={donor.id}
              onClick={() => setSelectedDonor(donor)}
              className="cursor-pointer rounded-2xl border border-[var(--color-border-lighter)] bg-white p-4 shadow-[0_3px_15px_rgba(0,0,0,0.025)] transition-colors duration-150 active:bg-[var(--color-icon-bg-soft)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-icon-bg-soft)]">
                    <UserRound
                      size={19}
                      className="text-[var(--color-primary)]"
                    />
                  </div>

                  <div className="min-w-0">
                    <Bilingual
                      tKey="superAdmin.sNoValue"
                      params={{ index: index + 1 }}
                      as="p"
                      className="text-[11px] text-[var(--color-text-placeholder)]"
                    />

                    <h3 className="break-words text-[15px] font-bold text-[var(--color-text-body)]">
                      {donor.donorName}
                    </h3>
                  </div>
                </div>

                <BloodGroupBadge value={donor.bloodGroup} />
              </div>

              <div className="mt-5 space-y-3">
                <MobileInfoRow
                  icon={Phone}
                  tKey="common.mobileNumber"
                  value={donor.mobileNumber}
                />

                <MobileInfoRow
                  icon={Phone}
                  tKey="superAdmin.alternateMobile"
                  value={donor.alternateMobileNumber}
                />

                <MobileInfoRow
                  icon={CalendarDays}
                  tKey="donor.dateOfBirth"
                  value={formatDate(donor.dateOfBirth)}
                />

                <MobileInfoRow
                  icon={MapPin}
                  tKey="common.address"
                  value={donor.address}
                />

                <MobileInfoRow
                  icon={MapPin}
                  tKey="superAdmin.pincode"
                  value={donor.pincode}
                />

                <MobileInfoRow
                  icon={Droplets}
                  tKey="superAdmin.lastBloodDonation"
                  value={formatDate(donor.lastBloodDonationDate)}
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedDonor(donor);
                  }}
                  className="rounded-lg border border-[var(--color-border-lighter)] bg-white px-3.5 py-2 text-[12px] font-semibold text-[var(--color-primary)] shadow-sm transition-all duration-200 hover:border-[var(--primary-200)] hover:bg-[var(--color-icon-bg-soft)]"
                >
                  <BilingualInline tKey="superAdmin.viewDetails" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState tKey="superAdmin.noDonorDataFound" />
        )}
      </div>

      {addDonorOpen && (
        <AddDonorModal
          bloodGroups={masterGroups}
          onClose={() => setAddDonorOpen(false)}
          onSaved={() => {
            setAddDonorOpen(false);
            setReloadToken((token) => token + 1);
          }}
        />
      )}

      {selectedDonor && (
        <DonorDetailModal
          donor={selectedDonor}
          onClose={() => setSelectedDonor(null)}
        />
      )}
    </div>
  );
}

function AddDonorModal({
  bloodGroups,
  onClose,
  onSaved,
}: {
  bloodGroups: MasterBloodGroup[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { rendered, visible } = useExitTransition(true, 200);
  const closeLabel = useBilingualText("common.close");
  const enterFullName = useBilingualText("common.enterFullName");
  const enter10DigitMobile = useBilingualText("common.enter10DigitMobile");
  const enterAlternateMobile = useBilingualText("donor.enterAlternateMobile");
  const enterAddress = useBilingualText("common.enterAddress");
  const enterDistrict = useBilingualText("common.enterDistrict");
  const enterCity = useBilingualText("common.enterCity");
  const enter6DigitPinCode = useBilingualText("common.enter6DigitPinCode");

  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DonorRegistrationInput>({
    resolver: zodResolver(
      donorRegistrationSchema,
    ) as Resolver<DonorRegistrationInput>,
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: emptyDonorForm,
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError("");

    const normalized = normalizeDonorForm(values);

    try {
      await registerDonor({
        fullName: normalized.fullName,
        mobileNumber: normalized.mobileNumber,
        alternativeMobileNumber: normalized.alternativeMobileNumber || undefined,
        bloodGroupId: Number(normalized.bloodGroupId),
        dob: normalized.dob,
        address: normalized.address || undefined,
        city: normalized.city,
        district: normalized.district,
        pincode: normalized.pincode,
        lastBloodDonationDate: normalized.lastBloodDonationDate || undefined,
      });

      onSaved();
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, "Unable to register this donor."));
    }
  });

  if (!rendered) {
    return null;
  }

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      className={`motion-scrim fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-md transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-donor-title"
    >
      <div
        className={`motion-surface flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_70px_rgba(0,0,0,0.18)] transition-[transform,opacity] duration-200 ${
          visible
            ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
            : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
        }`}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[var(--color-border-lighter)] px-5 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-icon-bg-soft)]">
                <UserRound size={17} className="text-[var(--color-primary)]" />
              </div>

              <div className="min-w-0">
                <h2
                  id="add-donor-title"
                  className="text-[14px] font-bold text-[var(--color-text-primary)]"
                >
                  Add Donor
                </h2>
                <p className="mt-0.5 text-[12px] text-[var(--color-text-placeholder-alt)]">
                  Register a donor on their behalf
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={closeLabel}
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormInput
                icon={UserRound}
                label="Full Name"
                required
                placeholder={enterFullName}
                error={errors.fullName?.message}
                {...register("fullName")}
              />
            </div>

            <FormInput
              icon={Phone}
              label="Mobile Number"
              required
              inputMode="numeric"
              maxLength={10}
              placeholder={enter10DigitMobile}
              error={errors.mobileNumber?.message}
              {...register("mobileNumber")}
            />

            <FormInput
              icon={Phone}
              label="Alternate Mobile (optional)"
              inputMode="numeric"
              maxLength={10}
              placeholder={enterAlternateMobile}
              error={errors.alternativeMobileNumber?.message}
              {...register("alternativeMobileNumber")}
            />

            <div>
              <label className="mb-1.5 block text-[13px] font-medium leading-4 text-[var(--color-text-body)]">
                Blood Group<span className="text-red-500"> *</span>
              </label>

              <div className="relative">
                <select
                  {...register("bloodGroupId", { valueAsNumber: true })}
                  className={`h-11 w-full appearance-none rounded-lg border bg-white pl-3.5 pr-9 text-[14px] outline-none transition-all duration-200 ${
                    errors.bloodGroupId
                      ? "border-red-400"
                      : "border-[var(--color-border)]"
                  } focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20`}
                >
                  <option value="">Select blood group</option>
                  {bloodGroups.map((group) => (
                    <option key={group.bloodGroupId} value={group.bloodGroupId}>
                      {group.bloodGroupName}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-quaternary)]"
                />
              </div>

              {errors.bloodGroupId && (
                <p className="mt-1 text-[12px] text-red-500">
                  {errors.bloodGroupId.message}
                </p>
              )}
            </div>

            <FormInput
              icon={CalendarDays}
              label="Date of Birth"
              required
              type="date"
              error={errors.dob?.message}
              {...register("dob")}
            />

            <FormInput
              icon={CalendarDays}
              label="Last Donation Date (optional)"
              type="date"
              error={errors.lastBloodDonationDate?.message}
              {...register("lastBloodDonationDate")}
            />

            <div className="sm:col-span-2">
              <FormInput
                icon={MapPin}
                label="Address (optional)"
                placeholder={enterAddress}
                error={errors.address?.message}
                {...register("address")}
              />
            </div>

            <FormInput
              icon={MapPin}
              label="District"
              required
              placeholder={enterDistrict}
              error={errors.district?.message}
              {...register("district")}
            />

            <FormInput
              icon={MapPin}
              label="City"
              required
              placeholder={enterCity}
              error={errors.city?.message}
              {...register("city")}
            />

            <FormInput
              icon={MapPin}
              label="Pincode"
              required
              inputMode="numeric"
              maxLength={6}
              placeholder={enter6DigitPinCode}
              error={errors.pincode?.message}
              {...register("pincode")}
            />

            {submitError && (
              <p role="alert" className="sm:col-span-2 text-[12px] text-red-500">
                {submitError}
              </p>
            )}
          </div>

          <div className="flex shrink-0 gap-2 border-t border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] px-5 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[40px] flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--color-text-quaternary)] transition hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BilingualInline tKey="common.cancel" />
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_5px_15px_rgba(255,59,63,0.18)] transition-all hover:bg-[var(--color-dashboard-cta-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && (
                <Loader2 size={14} className="animate-spin shrink-0" />
              )}
              {isSubmitting ? (
                <BilingualInline tKey="common.saving" />
              ) : (
                "Add Donor"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   DONOR DETAIL MODAL — every field already sits in the row we clicked,
   so this just presents it; no extra fetch needed.
============================================================ */

function DonorDetailModal({
  donor,
  onClose,
}: {
  donor: SuperAdminDonor;
  onClose: () => void;
}) {
  const { rendered, visible } = useExitTransition(true, 200);
  const closeLabel = useBilingualText("common.close");

  if (!rendered) {
    return null;
  }

  const locationLine = [donor.address, donor.city, donor.district]
    .filter((part, index, all) => Boolean(part) && all.indexOf(part) === index)
    .join(", ");

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className={`motion-scrim fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-md transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="donor-detail-title"
    >
      <div
        className={`motion-surface flex max-h-[90vh] w-full max-w-[520px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_25px_70px_rgba(0,0,0,0.18)] transition-[transform,opacity] duration-200 ${
          visible
            ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
            : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
        }`}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[var(--color-border-lighter)] px-5 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-icon-bg-soft)]">
              <UserRound size={19} className="text-[var(--color-primary)]" />
            </div>

            <div className="min-w-0">
              <h2
                id="donor-detail-title"
                className="break-words text-[15px] font-bold text-[var(--color-text-primary)]"
              >
                {donor.donorName}
              </h2>
              <p className="mt-0.5 text-[12px] text-[var(--color-text-placeholder-alt)]">
                Donor #{donor.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)]"
            aria-label={closeLabel}
          >
            <X size={17} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-5">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] px-3.5 py-2.5">
            <Bilingual
              tKey="bloodCentre.bloodGroup"
              as="span"
              className="text-[12px] font-medium text-[var(--color-text-secondary)]"
            />
            <BloodGroupBadge value={donor.bloodGroup} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <InfoItem tKey="common.mobileNumber" value={donor.mobileNumber} />
            <InfoItem
              tKey="superAdmin.alternateMobile"
              value={donor.alternateMobileNumber || "—"}
            />
            <InfoItem
              tKey="donor.dateOfBirth"
              value={formatDate(donor.dateOfBirth)}
            />
            <InfoItem
              tKey="superAdmin.lastBloodDonationDate"
              value={formatDate(donor.lastBloodDonationDate)}
            />
            <InfoItem tKey="superAdmin.pincode" value={donor.pincode} />
            <InfoItem
              tKey="superAdmin.registeredOn"
              value={formatDate(donor.createdAt)}
            />
          </div>

          <div className="min-w-0 rounded-lg border border-[var(--color-border-lighter)] p-3">
            <Bilingual
              tKey="common.address"
              as="p"
              className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-placeholder)]"
            />
            <p className="mt-1 break-words text-[13px] font-medium text-[var(--color-text-secondary)]">
              {locationLine || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TableHeader({ tKey }: { tKey: string }) {
  return (
    <th className="px-3 py-4 text-left text-[11px] font-bold uppercase tracking-[0.02em] text-[var(--color-text-secondary)]">
      <Bilingual
        tKey={tKey}
        as="span"
        enClassName="mt-0.5 block text-[0.75em] font-normal leading-tight opacity-70"
      />
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-3 py-4 text-left text-[11px] font-medium leading-5 text-[var(--color-text-quaternary)]">
      {children}
    </td>
  );
}

function BloodGroupBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex min-w-[42px] items-center justify-center rounded-full border border-[var(--primary-200)] bg-[var(--color-icon-bg-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--color-primary)]">
      {value}
    </span>
  );
}

function InfoItem({ tKey, value }: { tKey: string; value: string }) {
  return (
    <div className="min-w-0">
      <Bilingual
        tKey={tKey}
        as="p"
        className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-placeholder)]"
      />

      <p className="mt-1 truncate text-[12px] font-medium text-[var(--color-text-secondary)]">
        {value}
      </p>
    </div>
  );
}

function MobileInfoRow({
  icon: Icon,
  tKey,
  value,
}: {
  icon: typeof Phone;
  tKey: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[var(--color-surface-alt)] px-3 py-2.5">
      <Icon
        size={15}
        strokeWidth={1.7}
        className="mt-0.5 shrink-0 text-[var(--color-primary)]"
      />

      <div className="min-w-0 flex-1">
        <Bilingual
          tKey={tKey}
          as="p"
          className="text-[11px] font-semibold text-[var(--color-text-placeholder)]"
        />

        <p className="mt-0.5 break-words text-[12px] font-medium text-[var(--color-text-secondary)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center px-5 py-10 text-center">
      <Loader2 size={22} className="animate-spin text-[var(--color-primary)]" />

      <Bilingual
        tKey="superAdmin.loadingDonors"
        as="p"
        className="mt-3 text-[12px] text-[var(--color-text-placeholder-alt)]"
      />
    </div>
  );
}

function EmptyState({ tKey }: { tKey: string }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center px-5 py-10 text-center">
      <div>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-icon-bg-soft)]">
          <Users size={20} className="text-[var(--color-primary)]" />
        </div>

        <Bilingual
          tKey={tKey}
          as="p"
          className="mt-3 text-[13px] font-semibold text-[var(--color-text-secondary)]"
        />

        <Bilingual
          tKey="superAdmin.donorRecordsWillAppear"
          as="p"
          className="mt-1 text-[11px] text-[var(--color-text-placeholder)]"
        />
      </div>
    </div>
  );
}
