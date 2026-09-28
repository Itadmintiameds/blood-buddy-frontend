"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronDown,
  Droplets,
  History,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { getApiErrorMessage } from "@/services/api/client";
import { getAvailability } from "@/services/bloodCenter/bloodCenter.service";
import {
  getBloodComponents,
  getBloodGroups,
} from "@/services/master/masterService";
import type { BloodAvailabilityItem } from "@/types/bloodCenter/bloodCenterTypes";
import { mergeBloodAvailabilityRows } from "@/utils/bloodAvailability";
import {
  LOW_STOCK_THRESHOLD,
  getStockLevel,
  rowAccent,
  unitBadgeClass,
} from "@/utils/bloodStock";
import { routes } from "@/config/routes";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";
import { StatTile } from "@/app/components/ui/StatTile";
import { AdjustStockModal } from "@/app/blood-centre/components/AdjustStockModal";
import { AddStockModal } from "@/app/blood-centre/components/AddStockModal";
import { InventoryHistoryModal } from "@/app/blood-centre/components/InventoryHistoryModal";

const ALL = "all";

export function BloodCentreDashboardScreen() {
  const [rows, setRows] = useState<BloodAvailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adjustingRow, setAdjustingRow] =
    useState<BloodAvailabilityItem | null>(null);
  const [addingRow, setAddingRow] = useState<BloodAvailabilityItem | null>(
    null,
  );
  const [historyRow, setHistoryRow] = useState<BloodAvailabilityItem | null>(
    null,
  );
  const [reloadToken, setReloadToken] = useState(0);

  const [query, setQuery] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [groupFilter, setGroupFilter] = useState<string>(ALL);
  const [componentFilter, setComponentFilter] = useState<string>(ALL);

  const [masterGroups, setMasterGroups] = useState<string[]>([]);
  const [masterComponents, setMasterComponents] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);

  const unitsWordText = useBilingualText("bloodCentre.units");

  // Filter dropdown options come from the master APIs.
  useEffect(() => {
    let cancelled = false;

    async function loadMasters() {
      try {
        const [groups, components] = await Promise.all([
          getBloodGroups(),
          getBloodComponents(),
        ]);

        if (!cancelled) {
          setMasterGroups(groups.map((group) => group.bloodGroupName));
          setMasterComponents(
            components.map((component) => component.bloodComponentName),
          );
        }
      } catch {
        // Non-critical: if the master lists fail to load, the dropdowns fall
        // back to whatever groups/components appear in the inventory rows.
      }
    }

    void loadMasters();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      setLoading(true);
      setError("");

      try {
        const { items } = await getAvailability();

        if (!cancelled) {
          setRows(mergeBloodAvailabilityRows(items));
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(fetchError, "Unable to load blood availability."),
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
  }, [reloadToken]);

  const totalGroupsListed = new Set(
    rows.map((row) => row.bloodGroup.trim().toUpperCase()),
  ).size;

  const totalUnits = rows.reduce((sum, row) => sum + row.unitsAvailable, 0);

  const lowStockCount = rows.filter(
    (row) => row.unitsAvailable <= LOW_STOCK_THRESHOLD,
  ).length;

  const groupOptions =
    masterGroups.length > 0
      ? masterGroups
      : Array.from(new Set(rows.map((row) => row.bloodGroup))).sort((a, b) =>
          a.localeCompare(b),
        );

  const componentOptions =
    masterComponents.length > 0
      ? masterComponents
      : Array.from(new Set(rows.map((row) => row.bloodType))).sort((a, b) =>
          a.localeCompare(b),
        );

  const normalizedQuery = query.trim().toLowerCase();

  const visibleRows = rows.filter((row) => {
    const matchesQuery =
      !normalizedQuery ||
      row.bloodGroup.toLowerCase().includes(normalizedQuery) ||
      row.bloodType.toLowerCase().includes(normalizedQuery);

    const matchesLowStock =
      !lowStockOnly || row.unitsAvailable <= LOW_STOCK_THRESHOLD;

    const matchesGroup = groupFilter === ALL || row.bloodGroup === groupFilter;

    const matchesComponent =
      componentFilter === ALL || row.bloodType === componentFilter;

    return matchesQuery && matchesLowStock && matchesGroup && matchesComponent;
  });

  const isFiltering =
    normalizedQuery.length > 0 ||
    lowStockOnly ||
    groupFilter !== ALL ||
    componentFilter !== ALL;

  const clearFilters = () => {
    setQuery("");
    setLowStockOnly(false);
    setGroupFilter(ALL);
    setComponentFilter(ALL);
  };

  // Refresh: reset any active filters, reload the data, and give the icon a
  // one-shot spin so the click feels responsive even when the fetch is instant.
  const handleRefresh = () => {
    setSpinning(true);
    clearFilters();
    setReloadToken((token) => token + 1);
    window.setTimeout(() => setSpinning(false), 500);
  };

  // Only take over the table with a spinner on the very first load. On a
  // refresh the existing rows stay put (the refresh icon spins instead) so the
  // section doesn't collapse and the layout doesn't jump.
  const initialLoading = loading && rows.length === 0;

  return (
    <>
      {/* STAT CARDS */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatTile
          icon={Droplets}
          value={String(totalGroupsListed)}
          label={
            <Bilingual
              tKey="bloodCentre.bloodGroupsListed"
              as="span"
              enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
            />
          }
          color="var(--color-stat-red)"
          index={0}
        />

        <StatTile
          icon={Package}
          value={String(totalUnits)}
          label={
            <Bilingual
              tKey="bloodCentre.totalUnitsAvailable"
              as="span"
              enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
            />
          }
          color="var(--color-stat-green)"
          index={1}
        />

        <StatTile
          icon={AlertTriangle}
          value={String(lowStockCount)}
          label={
            <Bilingual
              tKey="bloodCentre.lowStockAlerts"
              as="span"
              enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
            />
          }
          color="var(--color-stat-yellow)"
          index={2}
          alert={lowStockCount > 0}
          active={lowStockOnly}
          onClick={
            lowStockCount > 0 || lowStockOnly
              ? () => setLowStockOnly((value) => !value)
              : undefined
          }
        />
      </div>

      {/* AVAILABILITY SECTION */}
      <div className="animate-rise mt-5 overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[0_5px_22px_rgba(0,0,0,0.045)] lg:mt-6">
        {/* Section Header */}
        <div className="border-b border-[var(--color-border-lighter)] px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Bilingual
                tKey="bloodCentre.bloodAvailability"
                as="h2"
                className="text-[16px] font-bold text-[var(--color-text-primary)] sm:text-[17px]"
              />

              <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)] sm:text-[12px]">
                Current blood stock available at your centre
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={routes.addAvailability}
                style={{ color: "var(--color-white)" }}
                className="flex h-9 items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3.5 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(255,59,63,0.20)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--color-primary-hover-alt)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
              >
                <Plus size={15} strokeWidth={2.2} />
                <BilingualInline
                  tKey="bloodCentre.addAvailability"
                  enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
                />
              </Link>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] transition-all duration-150 hover:border-[var(--primary-200)] hover:bg-[var(--color-icon-bg-soft)] hover:text-[var(--color-primary)] active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Refresh and clear filters"
                title="Refresh &amp; clear filters"
              >
                <RefreshCw
                  size={15}
                  className={
                    spinning
                      ? "animate-spin-once"
                      : loading
                        ? "animate-spin"
                        : ""
                  }
                />
              </button>

              <div className="hidden w-fit items-center gap-1.5 rounded-full bg-[var(--color-icon-bg-soft)] px-3 py-1.5 text-[10px] font-medium text-[var(--color-primary)] sm:flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-primary)] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
                </span>
                Live Availability
              </div>
            </div>
          </div>

          {/* Toolbar: search + group / component / low-stock filters */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <div className="relative sm:w-[260px]">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-placeholder)]"
              />

              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search group or component"
                aria-label="Search availability"
                className="h-10 w-full truncate rounded-lg border border-[var(--color-border-light)] bg-[var(--color-surface-alt)] pl-9 pr-9 text-[13px] text-[var(--color-text-body)] outline-none transition-all placeholder:text-[var(--color-text-placeholder)] focus:border-[var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)]/15"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-text-placeholder)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)]"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <ToolbarSelect
              value={groupFilter}
              onChange={(event) => setGroupFilter(event.target.value)}
              allLabel="All groups"
              options={groupOptions}
              ariaLabel="Filter by blood group"
            />

            <ToolbarSelect
              value={componentFilter}
              onChange={(event) => setComponentFilter(event.target.value)}
              allLabel="All components"
              options={componentOptions}
              ariaLabel="Filter by blood component"
            />

            <button
              type="button"
              onClick={() => setLowStockOnly((value) => !value)}
              disabled={lowStockCount === 0 && !lowStockOnly}
              aria-pressed={lowStockOnly}
              className={`flex h-10 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-semibold transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                lowStockOnly
                  ? "border-transparent bg-[var(--danger-50)] text-[var(--danger-700)]"
                  : "border-[var(--color-border-light)] bg-white text-[var(--color-text-quaternary)] hover:border-[var(--primary-200)] hover:text-[var(--color-primary)]"
              }`}
            >
              <AlertTriangle size={14} strokeWidth={2} />
              Low stock
              <span
                className={`ml-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                  lowStockOnly
                    ? "bg-[var(--danger-700)] text-white"
                    : "bg-[var(--color-surface-alt)] text-[var(--color-text-tertiary)]"
                }`}
              >
                {lowStockCount}
              </span>
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
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1.3fr_0.8fr_116px] items-center border-b border-[var(--color-border-light)] bg-[var(--color-surface-alt)] px-4 py-3 text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--color-text-quaternary)] sm:grid-cols-[1fr_1.4fr_0.9fr_132px] sm:px-6 sm:py-3.5 sm:text-[11px]">
            <Bilingual tKey="bloodCentre.bloodGroup" as="div" className="text-left" />
            <Bilingual tKey="bloodCentre.bloodType" as="div" className="text-left" />
            <Bilingual tKey="bloodCentre.bloodUnits" as="div" className="text-left" />
            <div className="text-center">Actions</div>
          </div>

          {initialLoading && (
            <div className="flex min-h-[190px] flex-col items-center justify-center gap-3 px-4">
              <Loader2 size={22} className="animate-spin text-[var(--color-primary)]" />
              <Bilingual
                tKey="bloodCentre.loadingAvailability"
                as="p"
                className="text-[12px] text-[var(--color-text-tertiary)]"
              />
            </div>
          )}

          {!initialLoading && error && (
            <div
              role="alert"
              className="flex min-h-[190px] items-center justify-center px-5 text-center text-[12px] leading-5 text-red-500"
            >
              {error}
            </div>
          )}

          {!initialLoading && !error && rows.length === 0 && (
            <div className="flex min-h-[190px] flex-col items-center justify-center px-5 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-icon-bg-soft)]">
                <Droplets size={20} className="text-[var(--color-primary)]" strokeWidth={1.7} />
              </div>

              <Bilingual
                tKey="bloodCentre.noAvailabilityYet"
                as="p"
                className="mt-3 text-[13px] font-medium text-[var(--color-text-secondary)]"
              />

              <p className="mt-1 text-[11px] text-[var(--color-text-placeholder-alt)]">
                Add blood availability to see the current stock here.
              </p>
            </div>
          )}

          {!error && rows.length > 0 && visibleRows.length === 0 && (
            <div className="flex min-h-[190px] flex-col items-center justify-center px-5 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-surface-alt)]">
                <Search size={20} strokeWidth={1.7} className="text-[var(--color-text-tertiary)]" />
              </div>

              <p className="mt-3 text-[13px] font-medium text-[var(--color-text-secondary)]">
                No matching results
              </p>

              <p className="mt-1 text-[11px] text-[var(--color-text-placeholder-alt)]">
                Try a different search or clear the filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 rounded-lg border border-[var(--color-border-light)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-icon-bg-soft)]"
              >
                Clear filters
              </button>
            </div>
          )}

          {!error &&
            rows.length > 0 &&
            visibleRows.map((row, index) => {
              const level = getStockLevel(row.unitsAvailable);

              return (
                <div
                  key={`${reloadToken}-${row.bloodGroup}-${row.bloodType}`}
                  className={`animate-rise grid min-h-[58px] grid-cols-[1fr_1.3fr_0.8fr_116px] items-center border-b border-[var(--color-border-lighter)] px-4 text-[12px] text-[var(--color-text-body)] transition-colors duration-150 last:border-b-0 hover:bg-[var(--color-icon-bg-soft)] sm:min-h-[62px] sm:grid-cols-[1fr_1.4fr_0.9fr_132px] sm:px-6 sm:text-[13px] ${
                    index % 2 === 0
                      ? "bg-[var(--color-white)]"
                      : "bg-[var(--color-surface-hover)]"
                  }`}
                  style={{
                    boxShadow:
                      level === "healthy"
                        ? undefined
                        : `inset 3px 0 0 0 ${rowAccent(level)}`,
                    animationDelay: `${Math.min(index, 12) * 35}ms`,
                  }}
                >
                  {/* Blood Group */}
                  <div className="flex min-w-0 items-center justify-start">
                    <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--color-icon-bg-soft)] sm:mr-3">
                      <Droplets size={14} strokeWidth={1.8} className="text-[var(--color-primary)]" />
                    </div>

                    <span className="truncate font-semibold text-[var(--color-text-body)]">
                      {row.bloodGroup}
                    </span>
                  </div>

                  {/* Blood Type */}
                  <div className="min-w-0 pr-2 text-left font-medium text-[var(--color-text-quaternary)]">
                    <span className="break-words">{row.bloodType}</span>
                  </div>

                  {/* Units */}
                  <div className="flex items-center justify-start gap-1.5">
                    {level !== "healthy" && (
                      <AlertTriangle
                        size={13}
                        strokeWidth={2}
                        className={
                          level === "critical"
                            ? "text-[var(--color-stat-red)]"
                            : "text-[var(--color-stat-yellow)]"
                        }
                      />
                    )}

                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold sm:px-3 sm:text-[12px] ${unitBadgeClass(level)}`}
                    >
                      {row.unitsAvailable} {unitsWordText}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                    <RowActionButton
                      icon={Plus}
                      label={`Add ${row.bloodGroup} ${row.bloodType} stock`}
                      onClick={() => setAddingRow(row)}
                      disabled={
                        row.bloodGroupId === undefined ||
                        row.bloodComponentId === undefined
                      }
                    />

                    <RowActionButton
                      icon={Pencil}
                      label={`Edit ${row.bloodGroup} ${row.bloodType} stock`}
                      onClick={() => setAdjustingRow(row)}
                      disabled={
                        row.bloodGroupId === undefined ||
                        row.bloodComponentId === undefined
                      }
                    />

                    <RowActionButton
                      icon={History}
                      label={`${row.bloodGroup} ${row.bloodType} history`}
                      onClick={() => setHistoryRow(row)}
                      disabled={!Number.isFinite(Number(row.id))}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* EDIT STOCK MODAL */}
      {adjustingRow && (
        <AdjustStockModal
          row={adjustingRow}
          onClose={() => setAdjustingRow(null)}
          onSaved={() => {
            setAdjustingRow(null);
            setReloadToken((token) => token + 1);
          }}
        />
      )}

      {/* ADD STOCK MODAL */}
      {addingRow && (
        <AddStockModal
          row={addingRow}
          onClose={() => setAddingRow(null)}
          onSaved={() => {
            setAddingRow(null);
            setReloadToken((token) => token + 1);
          }}
        />
      )}

      {/* HISTORY MODAL */}
      {historyRow && (
        <InventoryHistoryModal
          inventoryId={Number(historyRow.id)}
          title={`${historyRow.bloodGroup} · ${historyRow.bloodType}`}
          onClose={() => setHistoryRow(null)}
        />
      )}
    </>
  );
}

function RowActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] shadow-[0_1px_4px_rgba(0,0,0,0.03)] transition-all duration-150 hover:border-[var(--primary-200)] hover:bg-[var(--color-icon-bg-soft)] hover:text-[var(--color-primary)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
    >
      <Icon size={14} />
    </button>
  );
}

function ToolbarSelect({
  value,
  onChange,
  allLabel,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  allLabel: string;
  options: string[];
  ariaLabel: string;
}) {
  const active = value !== ALL;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        className={`h-10 w-full cursor-pointer appearance-none rounded-lg border bg-white pl-3 pr-8 text-[13px] text-[var(--color-text-body)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 sm:w-auto ${
          active
            ? "border-[var(--primary-200)] font-medium"
            : "border-[var(--color-border-light)]"
        }`}
      >
        <option value={ALL}>{allLabel}</option>
        {options.map((option) => (
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
  );
}
