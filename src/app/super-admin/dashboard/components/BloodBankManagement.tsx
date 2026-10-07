"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  Droplets,
  FileCheck2,
  Hash,
  Link2,
  LocateFixed,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  PlusCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { StockMovement } from "@/types/bloodCenter/bloodCenterTypes";
import type {
  BloodAvailability,
  SuperAdminBloodBank,
  SuperAdminBloodCentreStats,
} from "@/types/bloodCenter/superAdmin/superAdminTypes";
import {
  addStockToCentre,
  getBloodCentreLocations,
  getSuperAdminBloodBankDetail,
  getSuperAdminBloodCentreStats,
  getSuperAdminBloodCentresPage,
  updateSuperAdminBloodUnits,
  type BloodCentreFilter,
} from "@/services/bloodCenter/superAdmin/dashboardService";
import {
  getBloodComponents,
  getBloodGroups,
} from "@/services/master/masterService";
import type {
  MasterBloodComponent,
  MasterBloodGroup,
} from "@/types/master.types";
import { useExitTransition } from "@/app/hooks/useExitTransition";
import { DEFAULT_PAGE_SIZE, usePagination } from "@/app/hooks/usePagination";
import { Pagination } from "@/app/components/ui/Pagination";
import { StatGrid, StatTile } from "@/app/components/ui/StatTile";
import type { StockLevel } from "@/utils/bloodStock";
import { getStockLevel, rowAccent, unitBadgeClass } from "@/utils/bloodStock";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";

const ALL = "all";

// The detail panel narrows its stock table to the rows that made the centre
// match the toolbar's group/type filters. Those filters carry the master id
// (as a string) or ALL, so match on the availability row's ids.
function matchesStockFilters(
  item: BloodAvailability,
  bloodGroupFilter: string,
  bloodComponentFilter: string,
): boolean {
  return (
    (bloodGroupFilter === ALL ||
      String(item.bloodGroupId) === bloodGroupFilter) &&
    (bloodComponentFilter === ALL ||
      String(item.bloodComponentId) === bloodComponentFilter)
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB");
}

export default function BloodBankManagement() {
  const router = useRouter();
  const searchPlaceholder = useBilingualText("superAdmin.searchBloodCentre");
  const clearSearchLabel = useBilingualText("superAdmin.clearSearch");

  // One page of centres (list rows only — no stock). The selected centre's full
  // details + stock load on demand into the detail cache below.
  const [bloodBanks, setBloodBanks] = useState<SuperAdminBloodBank[]>([]);
  const [activeBankId, setActiveBankId] = useState<number | null>(null);
  // Already-loaded centre details (keyed by id), so re-selecting a centre is
  // instant and an edit can update it in place. Held in state (not a ref) so the
  // derived `activeBank` re-renders when the cache changes, and so the loader
  // effect re-runs — a cache miss (new selection, or a cleared/invalidated
  // entry) drives the next fetch.
  const [detailCache, setDetailCache] = useState<
    Map<number, SuperAdminBloodBank>
  >(new Map());
  // Loading/error are keyed to the centre id so switching centres never shows a
  // stale spinner or message.
  const [detailLoadingId, setDetailLoadingId] = useState<number | null>(null);
  const [detailErrorInfo, setDetailErrorInfo] = useState<{
    id: number;
    message: string;
  } | null>(null);
  // Phones show either the list or one bank's detail; lg and up show both. This
  // is separate from activeBankId (which auto-selects the first bank for the
  // desktop split view) so a phone still lands on the list.
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const masterDetailRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [cityFilter, setCityFilter] = useState<string>(ALL);
  const [districtFilter, setDistrictFilter] = useState<string>(ALL);
  // The group/type filters hold the master id (as a string) or ALL — the
  // paginated API filters on ids, not names.
  const [bloodGroupFilter, setBloodGroupFilter] = useState<string>(ALL);
  const [bloodComponentFilter, setBloodComponentFilter] = useState<string>(ALL);
  // Server-side pagination state (page is 1-based in the UI, 0-based on the API).
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [stats, setStats] = useState<SuperAdminBloodCentreStats | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<SuperAdminBloodBank | null>(
    null,
  );
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState<
    number | null
  >(null);
  const [movement, setMovement] = useState<StockMovement>("CORRECTION");
  const [units, setUnits] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [addStockModalOpen, setAddStockModalOpen] = useState(false);
  const [addStockBank, setAddStockBank] = useState<SuperAdminBloodBank | null>(
    null,
  );
  const [addStockAvailabilityId, setAddStockAvailabilityId] = useState<
    number | null
  >(null);
  const [addStockUnits, setAddStockUnits] = useState("");
  const [addStockRemarks, setAddStockRemarks] = useState("");
  const [addStockSaving, setAddStockSaving] = useState(false);
  const [addStockError, setAddStockError] = useState("");

  const [masterGroups, setMasterGroups] = useState<MasterBloodGroup[]>([]);
  const [masterComponents, setMasterComponents] = useState<
    MasterBloodComponent[]
  >([]);

  const [newBloodModalOpen, setNewBloodModalOpen] = useState(false);
  const [newBloodBank, setNewBloodBank] = useState<SuperAdminBloodBank | null>(
    null,
  );
  const [newBloodGroupId, setNewBloodGroupId] = useState<number | "">("");
  const [newBloodComponentId, setNewBloodComponentId] = useState<number | "">(
    "",
  );
  const [newBloodUnits, setNewBloodUnits] = useState("");
  const [newBloodRemarks, setNewBloodRemarks] = useState("");
  const [newBloodSaving, setNewBloodSaving] = useState(false);
  const [newBloodError, setNewBloodError] = useState("");

  // Debounce the search box so typing fires one request, not one per keystroke.
  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedSearch(search), 350);
    return () => window.clearTimeout(handle);
  }, [search]);

  // The UI filters mapped to the paginated API's filter shape.
  const apiFilter = useMemo<BloodCentreFilter>(() => {
    const filter: BloodCentreFilter = {};

    if (debouncedSearch.trim()) {
      filter.search = debouncedSearch.trim();
    }
    if (statusFilter !== ALL) {
      filter.isActive = statusFilter === "active";
    }
    if (cityFilter !== ALL) {
      filter.cities = [cityFilter];
    }
    if (districtFilter !== ALL) {
      filter.districts = [districtFilter];
    }
    if (bloodGroupFilter !== ALL) {
      filter.bloodGroupIds = [Number(bloodGroupFilter)];
    }
    if (bloodComponentFilter !== ALL) {
      filter.bloodComponentIds = [Number(bloodComponentFilter)];
    }

    return filter;
  }, [
    debouncedSearch,
    statusFilter,
    cityFilter,
    districtFilter,
    bloodGroupFilter,
    bloodComponentFilter,
  ]);

  // Any filter (or page-size) change sends us back to page 1. Done during
  // render — not in an effect — so we never fetch a stale page first.
  const filterKey = `${debouncedSearch.trim()}|${statusFilter}|${cityFilter}|${districtFilter}|${bloodGroupFilter}|${bloodComponentFilter}|${pageSize}`;
  const [priorFilterKey, setPriorFilterKey] = useState(filterKey);

  if (filterKey !== priorFilterKey) {
    setPriorFilterKey(filterKey);
    setPage(1);
  }

  // Load the current page of centres whenever the filter or page changes.
  useEffect(() => {
    let cancelled = false;

    const loadPage = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getSuperAdminBloodCentresPage(apiFilter, {
          page: page - 1,
          size: pageSize,
          sort: "bloodCentreName,asc",
        });

        if (cancelled) {
          return;
        }

        setBloodBanks(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(Math.max(1, result.totalPages));

        // Keep a selection for the desktop split view; a phone stays on the
        // list (mobileView is untouched). Hold the current centre if it's still
        // on this page, otherwise fall back to the first row.
        setActiveBankId((current) =>
          current != null && result.content.some((bank) => bank.id === current)
            ? current
            : (result.content[0]?.id ?? null),
        );
      } catch (err) {
        console.error("Failed to load blood banks:", err);

        if (!cancelled) {
          setBloodBanks([]);
          setTotalElements(0);
          setTotalPages(1);
          setActiveBankId(null);
          setError("Unable to load blood bank details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [apiFilter, page, pageSize, reloadToken]);

  // Master lists power the group/type filters (by id) and the Add Blood form.
  useEffect(() => {
    let cancelled = false;

    Promise.all([getBloodGroups(), getBloodComponents()])
      .then(([groups, components]) => {
        if (!cancelled) {
          setMasterGroups(groups);
          setMasterComponents(components);
        }
      })
      .catch(() => {
        // Non-critical: the group/type filters and Add Blood form stay empty.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // City options (from the locations endpoint) + aggregate stats. Both reload on
  // refresh.
  useEffect(() => {
    let cancelled = false;

    getBloodCentreLocations()
      .then((locations) => {
        if (!cancelled) {
          setCityOptions(locations.cities);
          setDistrictOptions(locations.districts);
        }
      })
      .catch(() => {
        // Non-critical: the City/District filters simply won't offer a dropdown.
      });

    getSuperAdminBloodCentreStats()
      .then((value) => {
        if (!cancelled) {
          setStats(value);
        }
      })
      .catch(() => {
        // Non-critical: tiles fall back to the page total / a dash.
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  // Load the selected centre's full details + stock on a cache miss. Re-runs
  // when detailCache changes, so clearing/invalidating an entry (refresh, or an
  // Add Blood that mints a row id the list can't return) drives a refetch.
  useEffect(() => {
    if (activeBankId == null || detailCache.has(activeBankId)) {
      return;
    }

    let cancelled = false;
    const id = activeBankId;

    const loadDetail = async () => {
      try {
        setDetailLoadingId(id);
        setDetailErrorInfo((prev) => (prev?.id === id ? null : prev));

        const detail = await getSuperAdminBloodBankDetail(id);

        if (cancelled) {
          return;
        }

        setDetailCache((prev) => new Map(prev).set(id, detail));
      } catch (err) {
        console.error("Failed to load centre details:", err);

        if (!cancelled) {
          setDetailErrorInfo({
            id,
            message: "Unable to load this centre's details.",
          });
        }
      } finally {
        if (!cancelled) {
          setDetailLoadingId((current) => (current === id ? null : current));
        }
      }
    };

    loadDetail();

    return () => {
      cancelled = true;
    };
  }, [activeBankId, detailCache]);

  // The selected centre's detail, read from the cache.
  const activeBank =
    activeBankId != null ? (detailCache.get(activeBankId) ?? null) : null;
  const detailLoading =
    detailLoadingId != null && detailLoadingId === activeBankId;
  const detailError =
    detailErrorInfo && detailErrorInfo.id === activeBankId
      ? detailErrorInfo.message
      : "";

  // Filter dropdowns source their options from the masters (group/type, matched
  // by id) and the cities list — the one-page result set can't enumerate them.
  const isFiltering =
    search.trim().length > 0 ||
    statusFilter !== ALL ||
    cityFilter !== ALL ||
    districtFilter !== ALL ||
    bloodGroupFilter !== ALL ||
    bloodComponentFilter !== ALL;

  const clearFilters = () => {
    setSearch("");
    setStatusFilter(ALL);
    setCityFilter(ALL);
    setDistrictFilter(ALL);
    setBloodGroupFilter(ALL);
    setBloodComponentFilter(ALL);
  };

  // Refresh: reset any active filters, drop cached details, reload everything,
  // and give the icon a one-shot spin so the click feels responsive.
  const handleRefresh = () => {
    setSpinning(true);
    clearFilters();
    setDetailCache(new Map());
    setReloadToken((token) => token + 1);
    window.setTimeout(() => setSpinning(false), 500);
  };

  const showMobileView = (view: "list" | "detail") => {
    setMobileView(view);

    // From lg the list and detail sit side by side, so the page stays put.
    // Below lg one replaces the other; bring its top into view.
    if (window.matchMedia("(min-width: 64rem)").matches) {
      return;
    }

    window.requestAnimationFrame(() =>
      masterDetailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      }),
    );
  };

  // Aggregate stats come from the dedicated stats endpoint (they span every
  // centre, not just this page). Until it responds, the bank count falls back
  // to the page's total; the inventory tiles show a dash.
  const totalBloodBanks = stats?.totalBloodCentres ?? totalElements;
  const lowStockCentres = stats?.lowStockCentres ?? null;
  const totalBloodUnits = stats?.totalBloodUnits ?? null;

  // Apply a stock change to the selected centre's cached detail so the panel
  // updates in place without a refetch.
  const applyAvailabilityChange = (
    bankId: number,
    updater: (availability: BloodAvailability[]) => BloodAvailability[],
  ) => {
    setDetailCache((prev) => {
      const current = prev.get(bankId);

      if (!current) {
        return prev;
      }

      return new Map(prev).set(bankId, {
        ...current,
        availability: updater(current.availability),
      });
    });
  };

  // A stock edit shifts the aggregate tiles; refetch them (cheap) rather than
  // reloading the whole list.
  const refreshStats = () => {
    getSuperAdminBloodCentreStats()
      .then(setStats)
      .catch(() => {
        // Non-critical: tiles just stay at their last values.
      });
  };

  const openUpdateModal = (
    bank: SuperAdminBloodBank,
    availabilityId: number,
  ) => {
    const availability = bank.availability.find(
      (item) => item?.id === availabilityId,
    );

    if (!availability) {
      return;
    }

    setSelectedBank(bank);
    setSelectedAvailabilityId(availability?.id);
    setMovement("CORRECTION");
    setUnits(String(availability?.units));
    setFormError("");
    setUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    if (saving) {
      return;
    }

    // Only flip the open flag here -- selectedBank/etc. stay populated so
    // UpdateUnitsModal can play its close transition before unmounting.
    // openUpdateModal() overwrites them fresh on the next open.
    setUpdateModalOpen(false);
  };

  const saveUnits = async () => {
    if (!selectedBank || selectedAvailabilityId === null) {
      return;
    }

    if (!units.trim()) {
      setFormError("Units are required.");

      return;
    }

    const parsedUnits = Number(units);

    if (!Number.isInteger(parsedUnits)) {
      setFormError("Enter a valid whole number.");

      return;
    }

    if (parsedUnits < 0) {
      setFormError("Units cannot be negative.");

      return;
    }

    if (parsedUnits > 9999) {
      setFormError("Units cannot exceed 9999.");

      return;
    }

    const currentAvailability = selectedBank.availability.find(
      (item) => item?.id === selectedAvailabilityId,
    );

    if (!currentAvailability) {
      setFormError("Unable to find this stock entry. Please try again.");
      return;
    }

    const isCorrection = movement === "CORRECTION";

    const changedUnits = isCorrection
      ? parsedUnits - currentAvailability.units
      : -Math.abs(parsedUnits);

    if (changedUnits === 0) {
      setFormError("No change to apply.");
      return;
    }

    if (!isCorrection && Math.abs(changedUnits) > currentAvailability.units) {
      setFormError(
        `Only ${currentAvailability.units} units are available to ${movement.toLowerCase()}.`,
      );
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const response = await updateSuperAdminBloodUnits({
        bloodBankId: selectedBank?.id,
        availabilityId: selectedAvailabilityId,
        bloodGroupId: currentAvailability.bloodGroupId,
        bloodComponentId: currentAvailability.bloodComponentId,
        movement,
        changedUnits,
      });

      if (!response.success) {
        setFormError(response.message);

        return;
      }

      applyAvailabilityChange(selectedBank.id, (availability) =>
        availability.map((item) =>
          item?.id === selectedAvailabilityId
            ? { ...item, units: item.units + changedUnits }
            : item,
        ),
      );
      refreshStats();

      closeUpdateModal();
    } catch (err) {
      console.error("Update units error:", err);
      setFormError("Unable to update units. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const openAddStockModal = (
    bank: SuperAdminBloodBank,
    availabilityId: number,
  ) => {
    setAddStockBank(bank);
    setAddStockAvailabilityId(availabilityId);
    setAddStockUnits("");
    setAddStockRemarks("");
    setAddStockError("");
    setAddStockModalOpen(true);
  };

  const closeAddStockModal = () => {
    if (addStockSaving) {
      return;
    }

    setAddStockModalOpen(false);
  };

  const submitAddStock = async () => {
    if (!addStockBank || addStockAvailabilityId === null) {
      return;
    }

    const availability = addStockBank.availability.find(
      (item) => item?.id === addStockAvailabilityId,
    );

    if (!availability) {
      setAddStockError("Unable to find this stock entry. Please try again.");
      return;
    }

    if (!addStockUnits.trim()) {
      setAddStockError("Enter units to add.");
      return;
    }

    const parsedUnits = Number(addStockUnits);

    if (!Number.isInteger(parsedUnits) || parsedUnits < 1) {
      setAddStockError("Enter a whole number of at least 1.");
      return;
    }

    try {
      setAddStockSaving(true);
      setAddStockError("");

      await addStockToCentre({
        bloodCentreId: addStockBank.id,
        bloodGroupId: availability.bloodGroupId,
        bloodComponentId: availability.bloodComponentId,
        units: parsedUnits,
        remarks: addStockRemarks.trim() || undefined,
      });

      applyAvailabilityChange(addStockBank.id, (availability) =>
        availability.map((item) =>
          item?.id === addStockAvailabilityId
            ? { ...item, units: item.units + parsedUnits }
            : item,
        ),
      );
      refreshStats();

      setAddStockModalOpen(false);
    } catch (err) {
      console.error("Add stock error:", err);
      setAddStockError("Unable to add stock. Please try again.");
    } finally {
      setAddStockSaving(false);
    }
  };

  const openNewBloodModal = (bank: SuperAdminBloodBank) => {
    setNewBloodBank(bank);
    setNewBloodGroupId("");
    setNewBloodComponentId("");
    setNewBloodUnits("");
    setNewBloodRemarks("");
    setNewBloodError("");
    setNewBloodModalOpen(true);
  };

  const closeNewBloodModal = () => {
    if (newBloodSaving) {
      return;
    }

    setNewBloodModalOpen(false);
  };

  const submitNewBlood = async () => {
    if (!newBloodBank) {
      return;
    }

    if (!newBloodGroupId) {
      setNewBloodError("Select a blood group.");
      return;
    }

    if (!newBloodComponentId) {
      setNewBloodError("Select a blood component.");
      return;
    }

    if (!newBloodUnits.trim()) {
      setNewBloodError("Enter units.");
      return;
    }

    const parsedUnits = Number(newBloodUnits);

    if (!Number.isInteger(parsedUnits) || parsedUnits < 1) {
      setNewBloodError("Enter a whole number of at least 1.");
      return;
    }

    try {
      setNewBloodSaving(true);
      setNewBloodError("");

      await addStockToCentre({
        bloodCentreId: newBloodBank.id,
        bloodGroupId: newBloodGroupId,
        bloodComponentId: newBloodComponentId,
        units: parsedUnits,
        remarks: newBloodRemarks.trim() || undefined,
      });

      // The backend creates the row if it doesn't exist yet (or tops up a
      // matching one) but doesn't hand back its inventory id, so refetch this
      // centre's detail to pick up the new/updated row with a real id.
      // Drop this centre's cached detail so the loader refetches it with the
      // new/updated row (and its real inventory id).
      setDetailCache((prev) => {
        const next = new Map(prev);
        next.delete(newBloodBank.id);
        return next;
      });
      refreshStats();
      setNewBloodModalOpen(false);
    } catch (err) {
      console.error("Add blood error:", err);
      setNewBloodError("Unable to add this blood entry. Please try again.");
    } finally {
      setNewBloodSaving(false);
    }
  };

  return (
    <section className="w-full min-w-0">
      <StatGrid>
        <StatTile
          icon={Building2}
          value={String(totalBloodBanks)}
          label={
            <Bilingual
              tKey="superAdmin.bloodBanksStat"
              as="span"
              enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
            />
          }
          color="var(--color-stat-red)"
          index={0}
        />

        <StatTile
          icon={AlertTriangle}
          value={lowStockCentres == null ? "—" : String(lowStockCentres)}
          label={
            <Bilingual
              tKey="superAdmin.lowStockCentresStat"
              as="span"
              enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
            />
          }
          color="var(--color-stat-yellow)"
          index={1}
        />

        <StatTile
          icon={Droplets}
          value={totalBloodUnits == null ? "—" : String(totalBloodUnits)}
          label={
            <Bilingual
              tKey="superAdmin.availableUnitsStat"
              as="span"
              enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80"
            />
          }
          color="var(--color-stat-green)"
          index={2}
        />
      </StatGrid>

      {/* TOOLBAR: search + add on top, filters (status/city/district/group/type) below */}
      <div className="animate-rise mt-5 space-y-2.5 rounded-2xl border border-[var(--color-border-lighter)] bg-white p-3 shadow-[0_2px_12px_rgba(0,0,0,0.025)] sm:space-y-3 sm:p-4">
        {/* ROW 1: search + refresh + add */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2 sm:contents">
          <div className="relative min-w-0 flex-1 sm:max-w-[480px] sm:flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-placeholder-alt)]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-11 w-full min-w-0 rounded-lg border border-[var(--color-border)] bg-white pl-10 pr-9 text-[13px] sm:h-10 text-[var(--color-text-body)] outline-none transition-all duration-200 placeholder:text-[var(--color-text-placeholder)] hover:border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)]"
                aria-label={clearSearchLabel}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border-light)] bg-white text-[var(--color-text-muted)] transition-all duration-150 sm:h-10 sm:w-10 hover:border-[var(--primary-200)] hover:bg-[var(--color-icon-bg-soft)] hover:text-[var(--color-primary)] active:scale-90 disabled:cursor-not-allowed disabled:opacity-50"
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
          </div>

          <button
            type="button"
            onClick={() => router.push("/blood-centre/register")}
            className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 text-[13px] font-semibold text-white shadow-[0_5px_15px_rgba(255,59,63,0.18)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--color-dashboard-cta-hover)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 sm:ml-auto sm:h-10 sm:w-auto"
          >
            <Plus size={16} className="shrink-0" />
            <BilingualInline
              tKey="superAdmin.addBloodCentre"
              enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
            />
          </button>
        </div>

        {/* ROW 2: filters + refresh/clear */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <div className="grid grid-cols-2 gap-2 sm:contents [&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:col-span-1">
          {/* STATUS */}
          <div className="relative min-w-0 sm:shrink-0">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
              className={`h-11 w-full cursor-pointer appearance-none truncate rounded-lg border bg-white pl-3 pr-7 sm:pr-8 text-[13px] sm:h-10 sm:w-auto text-[var(--color-text-body)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 ${
                statusFilter !== ALL
                  ? "border-[var(--primary-200)] font-medium"
                  : "border-[var(--color-border-light)]"
              }`}
            >
              <option value={ALL}>All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <ChevronDown
              size={15}
              strokeWidth={1.8}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
            />
          </div>

          {/* CITY */}
          {cityOptions.length > 0 && (
            <div className="relative min-w-0 sm:shrink-0">
              <select
                value={cityFilter}
                onChange={(event) => setCityFilter(event.target.value)}
                aria-label="Filter by city"
                className={`h-11 w-full cursor-pointer appearance-none truncate rounded-lg border bg-white pl-3 pr-7 sm:pr-8 text-[13px] sm:h-10 sm:w-auto text-[var(--color-text-body)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 ${
                  cityFilter !== ALL
                    ? "border-[var(--primary-200)] font-medium"
                    : "border-[var(--color-border-light)]"
                }`}
              >
                <option value={ALL}>All cities</option>
                {cityOptions.map((option) => (
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
          )}

          {/* DISTRICT */}
          {districtOptions.length > 0 && (
            <div className="relative min-w-0 sm:shrink-0">
              <select
                value={districtFilter}
                onChange={(event) => setDistrictFilter(event.target.value)}
                aria-label="Filter by district"
                className={`h-11 w-full cursor-pointer appearance-none truncate rounded-lg border bg-white pl-3 pr-7 sm:pr-8 text-[13px] sm:h-10 sm:w-auto text-[var(--color-text-body)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 ${
                  districtFilter !== ALL
                    ? "border-[var(--primary-200)] font-medium"
                    : "border-[var(--color-border-light)]"
                }`}
              >
                <option value={ALL}>All districts</option>
                {districtOptions.map((option) => (
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
          )}

          {/* BLOOD GROUP (A+, O- ...) */}
          {masterGroups.length > 0 && (
            <div className="relative min-w-0 sm:shrink-0">
              <select
                value={bloodGroupFilter}
                onChange={(event) => setBloodGroupFilter(event.target.value)}
                aria-label="Filter by blood group"
                className={`h-11 w-full cursor-pointer appearance-none truncate rounded-lg border bg-white pl-3 pr-7 sm:pr-8 text-[13px] sm:h-10 sm:w-auto text-[var(--color-text-body)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 ${
                  bloodGroupFilter !== ALL
                    ? "border-[var(--primary-200)] font-medium"
                    : "border-[var(--color-border-light)]"
                }`}
              >
                <option value={ALL}>All blood groups</option>
                {masterGroups.map((group) => (
                  <option
                    key={group.bloodGroupId}
                    value={String(group.bloodGroupId)}
                  >
                    {group.bloodGroupName}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                strokeWidth={1.8}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              />
            </div>
          )}

          {/* BLOOD TYPE (the component: Whole Blood, Platelets ...) */}
          {masterComponents.length > 0 && (
            <div className="relative min-w-0 sm:shrink-0">
              <select
                value={bloodComponentFilter}
                onChange={(event) => setBloodComponentFilter(event.target.value)}
                aria-label="Filter by blood component"
                className={`h-11 w-full cursor-pointer appearance-none truncate rounded-lg border bg-white pl-3 pr-7 sm:pr-8 text-[13px] sm:h-10 sm:w-auto text-[var(--color-text-body)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 ${
                  bloodComponentFilter !== ALL
                    ? "border-[var(--primary-200)] font-medium"
                    : "border-[var(--color-border-light)]"
                }`}
              >
                <option value={ALL}>All blood components</option>
                {masterComponents.map((component) => (
                  <option
                    key={component.bloodComponentId}
                    value={String(component.bloodComponentId)}
                  >
                    {component.bloodComponentName}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                strokeWidth={1.8}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              />
            </div>
          )}

          </div>

          {/* CLEAR */}
          {isFiltering && (
            <button
              type="button"
              onClick={clearFilters}
              className="shrink-0 px-2 py-2.5 text-[12px] font-medium text-[var(--color-primary)] transition hover:underline sm:ml-auto"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="
            mt-4
            flex
            min-w-0
            items-center
            gap-2
            rounded-lg
            border
            border-red-100
            bg-red-50
            px-4
            py-3
            text-[13px]
            text-red-600
          "
        >
          <AlertCircle size={16} className="shrink-0" />

          <span className="min-w-0">{error}</span>
        </div>
      )}

      {/* BLOOD BANK LIST + DETAIL (master-detail) */}
      <div
        ref={masterDetailRef}
        className="mt-5 flex scroll-mt-20 flex-col gap-4 lg:h-[640px] lg:flex-row lg:gap-5"
      >
        {/* LIST PANEL */}
        <div
          className={`
            min-h-0
            w-full
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-[var(--color-border-light)]
            bg-white
            shadow-[0_4px_20px_rgba(0,0,0,0.035)]
            lg:flex
            lg:w-[320px]
            lg:shrink-0
            ${mobileView === "detail" ? "hidden lg:flex" : "flex"}
          `}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-[var(--color-border-lighter)] px-4 py-3">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-quaternary)]">
              {totalElements} {totalElements === 1 ? "Centre" : "Centres"}
            </span>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading && (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-14">
                <Loader2 size={22} className="animate-spin text-[var(--color-primary)]" />
                <Bilingual
                  tKey="superAdmin.loadingBloodBanks"
                  as="p"
                  className="text-[12px] text-[var(--color-text-tertiary)]"
                />
              </div>
            )}

            {!loading && bloodBanks.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center px-5 py-14 text-center">
                <Building2 size={26} className="text-[var(--color-border)]" />

                <Bilingual
                  tKey="superAdmin.noBloodBanksFound"
                  as="p"
                  className="mt-3 text-[13px] font-semibold text-[var(--color-text-quaternary)]"
                />

                <Bilingual
                  tKey="superAdmin.tryChangingSearch"
                  as="p"
                  className="mt-1 text-[11px] text-[var(--color-text-placeholder)]"
                />
              </div>
            )}

            {!loading &&
              bloodBanks.map((bank, index) => (
                <BankListRow
                  key={bank.id}
                  bank={bank}
                  index={index}
                  active={bank.id === activeBankId}
                  onSelect={() => {
                    setActiveBankId(bank.id);
                    showMobileView("detail");
                  }}
                />
              ))}
          </div>

          {!loading && (
            <Pagination
              compact
              page={page}
              pageSize={pageSize}
              totalItems={totalElements}
              totalPages={totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              className="shrink-0"
            />
          )}
        </div>

        {/* DETAIL PANEL */}
        <div
          className={`
            min-h-0
            w-full
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-[var(--color-border-light)]
            bg-white
            shadow-[0_4px_20px_rgba(0,0,0,0.035)]
            lg:flex
            lg:flex-1
            ${mobileView === "detail" ? "flex" : "hidden lg:flex"}
          `}
        >
          {detailLoading && !activeBank ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-14 text-center">
              <Loader2
                size={22}
                className="animate-spin text-[var(--color-primary)]"
              />
              <p className="text-[12px] text-[var(--color-text-tertiary)]">
                Loading centre details…
              </p>
            </div>
          ) : detailError ? (
            <div className="flex h-full flex-col items-center justify-center px-6 py-14 text-center">
              <AlertCircle size={22} className="text-red-500" />
              <p className="mt-3 text-[13px] font-semibold text-[var(--color-text-quaternary)]">
                {detailError}
              </p>
            </div>
          ) : activeBank ? (
            <BankDetailPanel
              bank={activeBank}
              onBack={() => showMobileView("list")}
              onUpdate={(availabilityId) =>
                openUpdateModal(activeBank, availabilityId)
              }
              onAddStock={(availabilityId) =>
                openAddStockModal(activeBank, availabilityId)
              }
              onAddNewBlood={() => openNewBloodModal(activeBank)}
              bloodGroupFilter={bloodGroupFilter}
              bloodComponentFilter={bloodComponentFilter}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-icon-bg-soft)]">
                <Building2 size={22} className="text-[var(--color-primary)]" />
              </div>

              <p className="mt-3 text-[13px] font-semibold text-[var(--color-text-quaternary)]">
                Select a blood bank
              </p>

              <p className="mt-1 text-[12px] text-[var(--color-text-placeholder)]">
                Choose a centre from the list to see its details and stock.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* UPDATE MODAL */}
      {selectedBank && (
        <UpdateUnitsModal
          open={updateModalOpen}
          bank={selectedBank}
          availabilityId={selectedAvailabilityId}
          movement={movement}
          setMovement={setMovement}
          units={units}
          setUnits={setUnits}
          error={formError}
          saving={saving}
          onClose={closeUpdateModal}
          onSave={saveUnits}
        />
      )}

      {/* ADD STOCK MODAL */}
      {addStockBank && (
        <AddStockModal
          open={addStockModalOpen}
          bank={addStockBank}
          availabilityId={addStockAvailabilityId}
          units={addStockUnits}
          setUnits={setAddStockUnits}
          remarks={addStockRemarks}
          setRemarks={setAddStockRemarks}
          error={addStockError}
          saving={addStockSaving}
          onClose={closeAddStockModal}
          onSave={submitAddStock}
        />
      )}

      {/* ADD BLOOD (NEW ENTRY) MODAL */}
      {newBloodBank && (
        <AddBloodModal
          open={newBloodModalOpen}
          bank={newBloodBank}
          bloodGroups={masterGroups}
          bloodComponents={masterComponents}
          bloodGroupId={newBloodGroupId}
          setBloodGroupId={setNewBloodGroupId}
          bloodComponentId={newBloodComponentId}
          setBloodComponentId={setNewBloodComponentId}
          units={newBloodUnits}
          setUnits={setNewBloodUnits}
          remarks={newBloodRemarks}
          setRemarks={setNewBloodRemarks}
          error={newBloodError}
          saving={newBloodSaving}
          onClose={closeNewBloodModal}
          onSave={submitNewBlood}
        />
      )}
    </section>
  );
}

// BLOOD BANK LIST ROW
function BankListRow({
  bank,
  index,
  active,
  onSelect,
}: {
  bank: SuperAdminBloodBank;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={`animate-rise flex w-full items-center gap-3 border-b border-[var(--color-border-lighter)] px-4 py-3 text-left transition-colors duration-150 last:border-b-0 ${
        active
          ? "bg-[var(--color-icon-bg-soft)] shadow-[inset_3px_0_0_0_var(--color-primary)]"
          : "hover:bg-[var(--color-surface-hover)]"
      }`}
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          active ? "bg-white" : "bg-[var(--color-icon-bg-soft)]"
        }`}
      >
        <Building2 size={15} className="text-[var(--color-primary)]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-[var(--color-text-body)]">
          {bank.bloodBankName}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-[var(--color-text-placeholder-alt)]">
          {[bank.category, bank.city, bank.pincode].filter(Boolean).join(" · ")}
        </p>
      </div>
    </button>
  );
}

// BLOOD BANK DETAIL PANEL
function BankDetailPanel({
  bank,
  onBack,
  onUpdate,
  onAddStock,
  onAddNewBlood,
  bloodGroupFilter,
  bloodComponentFilter,
}: {
  bank: SuperAdminBloodBank;
  onBack: () => void;
  onUpdate: (availabilityId: number) => void;
  onAddStock: (availabilityId: number) => void;
  onAddNewBlood: () => void;
  bloodGroupFilter: string;
  bloodComponentFilter: string;
}) {
  const unitsWordText = useBilingualText("bloodCentre.units");

  // The toolbar's group/type filters narrow the stock table too, so the admin
  // lands on the rows that made this bank match. The header totals above stay
  // computed from the full availability.
  const visibleAvailability = useMemo(
    () =>
      bank.availability.filter((item) =>
        matchesStockFilters(item, bloodGroupFilter, bloodComponentFilter),
      ),
    [bank.availability, bloodGroupFilter, bloodComponentFilter],
  );

  const availabilityPagination = usePagination(visibleAvailability, {
    pageSize: 10,
    resetKey: `${bank.id}|${bloodGroupFilter}|${bloodComponentFilter}`,
  });

  const bankTotalUnits = bank.availability.reduce(
    (sum, item) => sum + item.units,
    0,
  );

  const bankStockLevel: StockLevel = bank.availability.some(
    (item) => getStockLevel(item.units) === "critical",
  )
    ? "critical"
    : bank.availability.some((item) => getStockLevel(item.units) === "low")
      ? "low"
      : "healthy";

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* HEADER */}
      <div className="shrink-0 border-b border-[var(--color-border-lighter)] px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to list"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)] lg:hidden"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-icon-bg-soft)]">
            <Building2 size={19} className="text-[var(--color-primary)]" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="break-words text-[16px] font-bold leading-5 text-[var(--color-text-body)] sm:text-[18px]">
              {bank.bloodBankName}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {bank.category && (
                <span className="inline-flex rounded-full border border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
                  {bank.category}
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  bank.isActive
                    ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                    : "bg-[var(--color-surface-alt)] text-[var(--color-text-tertiary)]"
                }`}
              >
                {bank.isActive ? "Active" : "Inactive"}
              </span>

              {bank.availability.length > 0 && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${unitBadgeClass(bankStockLevel)}`}
                >
                  {bankStockLevel !== "healthy" && (
                    <AlertTriangle size={10} strokeWidth={2} />
                  )}
                  {bankTotalUnits} {unitsWordText}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* DETAILS */}
        <div className="mt-4 rounded-xl border border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] p-3">
          <DetailField
            icon={MapPin}
            label="Address"
            value={bank.address}
            className="border-b border-[var(--color-border-lighter)] pb-2.5"
          />

          <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-3">
            <DetailField icon={MapPin} label="City" value={bank.city} />
            <DetailField icon={MapPin} label="District" value={bank.district} />
            <DetailField icon={Hash} label="Pincode" value={bank.pincode} />
            <DetailField icon={Phone} label="Phone" value={bank.phoneNumber} />
            <DetailField
              icon={Mail}
              label="Email"
              value={bank.email}
              className="col-span-2 sm:col-span-2"
            />

            {bank.licenceNumber && (
              <DetailField
                icon={FileCheck2}
                label="Licence No."
                value={bank.licenceNumber}
              />
            )}

            {bank.licenceExpiryDate && (
              <DetailField
                icon={CalendarDays}
                label="Licence Expiry"
                value={formatDate(bank.licenceExpiryDate)}
              />
            )}

            {bank.latitude != null && (
              <DetailField
                icon={LocateFixed}
                label="Latitude"
                value={String(bank.latitude)}
              />
            )}

            {bank.longitude != null && (
              <DetailField
                icon={LocateFixed}
                label="Longitude"
                value={String(bank.longitude)}
              />
            )}
          </div>

          {bank.locationUrl && (
            <a
              href={bank.locationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--color-primary)] hover:underline"
            >
              <Link2 size={13} strokeWidth={2} />
              View location on map
            </a>
          )}
        </div>
      </div>

      {/* BLOOD AVAILABILITY */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Droplets size={15} className="text-[var(--color-primary)]" />
            <Bilingual
              tKey="bloodCentre.bloodAvailabilityTitle"
              as="h3"
              className="text-[13px] font-bold text-[var(--color-text-body)]"
            />
          </div>

          <button
            type="button"
            onClick={onAddNewBlood}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 text-[11px] font-semibold text-white shadow-[0_4px_12px_rgba(255,59,63,0.18)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--color-dashboard-cta-hover)] active:translate-y-0"
          >
            <Plus size={13} strokeWidth={2.4} className="shrink-0" />
            Add Blood
          </button>
        </div>

        {bank.availability.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border-light)] px-4 py-10 text-center">
            <Droplets size={22} className="text-[var(--color-border)]" />
            <Bilingual
              tKey="superAdmin.noBloodAvailabilityFound"
              as="p"
              className="mt-3 text-[12px] text-[var(--color-text-placeholder)]"
            />
          </div>
        ) : visibleAvailability.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] px-4 py-6 text-center">
            <p className="text-[12px] text-[var(--color-text-tertiary)]">
              No stock matches the selected filters.
            </p>
          </div>
        ) : (
          <>
          <ul className="space-y-2 sm:hidden">
            {availabilityPagination.pageItems.map((availability) => {
              const level = getStockLevel(availability.units);

              return (
                <li
                  key={availability.id}
                  className="flex items-center gap-3 overflow-hidden rounded-xl border border-[var(--color-border-light)] bg-white py-2.5 pl-3.5 pr-2.5"
                  style={{
                    boxShadow:
                      level === "healthy"
                        ? undefined
                        : `inset 3px 0 0 0 ${rowAccent(level)}`,
                  }}
                >
                  <span className="flex h-10 min-w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--color-icon-bg-soft)] px-2 text-[14px] font-bold text-[var(--color-primary)]">
                    {availability.bloodGroup}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-[12px] font-medium uppercase leading-4 text-[var(--color-text-secondary)]">
                      {availability.bloodComponent}
                    </p>

                    <span
                      className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-bold ${unitBadgeClass(level)}`}
                    >
                      {level !== "healthy" && (
                        <AlertTriangle size={11} strokeWidth={2} />
                      )}
                      {availability.units} {unitsWordText}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onAddStock(availability.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border-lighter)] bg-white text-[var(--color-text-muted)] shadow-sm transition active:bg-[var(--color-success-bg)] active:text-[var(--color-success)]"
                      aria-label={`Add stock for ${availability.bloodGroup} ${availability.bloodComponent}`}
                    >
                      <PlusCircle size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdate(availability.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border-lighter)] bg-white text-[var(--color-text-muted)] shadow-sm transition active:bg-[var(--color-icon-bg-soft)] active:text-[var(--color-primary)]"
                      aria-label={`Update ${availability.bloodGroup} ${availability.bloodComponent}`}
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="hidden overflow-hidden rounded-xl border border-[var(--color-border-light)] sm:block">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="border-b border-[var(--color-border-light)] bg-[var(--color-surface-alt)]">
                  <th
                    style={{ width: "18%" }}
                    className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]"
                  >
                    <Bilingual tKey="bloodCentre.bloodGroup" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-70" />
                  </th>
                  <th
                    style={{ width: "32%" }}
                    className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]"
                  >
                    <Bilingual tKey="bloodCentre.bloodComponent" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-70" />
                  </th>
                  <th
                    style={{ width: "18%" }}
                    className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]"
                  >
                    <Bilingual tKey="bloodCentre.units" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-70" />
                  </th>
                  <th
                    style={{ width: "32%" }}
                    className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]"
                  >
                    <Bilingual tKey="superAdmin.actions" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-70" />
                  </th>
                </tr>
              </thead>

              <tbody>
                {availabilityPagination.pageItems.map((availability) => {
                  const level = getStockLevel(availability.units);

                  return (
                    <tr
                      key={availability.id}
                      className="border-b border-[var(--color-border-lighter)] transition-colors duration-150 last:border-b-0 hover:bg-[var(--color-icon-bg-soft)]"
                      style={{
                        boxShadow:
                          level === "healthy"
                            ? undefined
                            : `inset 3px 0 0 0 ${rowAccent(level)}`,
                      }}
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center rounded-md bg-[var(--color-icon-bg-soft)] px-2.5 py-1 text-[12px] font-bold text-[var(--color-primary)]">
                          {availability.bloodGroup}
                        </span>
                      </td>

                      <td className="break-words px-4 py-3 text-[13px] font-medium uppercase leading-4 text-[var(--color-text-secondary)]">
                        {availability.bloodComponent}
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold ${unitBadgeClass(level)}`}
                        >
                          {level !== "healthy" && (
                            <AlertTriangle size={11} strokeWidth={2} />
                          )}
                          {availability.units} {unitsWordText}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onAddStock(availability.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border-lighter)] bg-white text-[var(--color-text-muted)] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-[var(--color-success-bg)] hover:bg-[var(--color-success-bg)] hover:text-[var(--color-success)] active:translate-y-0"
                            aria-label={`Add stock for ${availability.bloodGroup} ${availability.bloodComponent}`}
                          >
                            <PlusCircle size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => onUpdate(availability.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border-lighter)] bg-white text-[var(--color-text-muted)] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-[var(--primary-200)] hover:bg-[var(--color-icon-bg-soft)] hover:text-[var(--color-primary)] active:translate-y-0"
                            aria-label={`Update ${availability.bloodGroup} ${availability.bloodComponent}`}
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}

        {/* Renders nothing when the filters leave no rows. The rows-per-page
            selector is left out: the panel is narrow beside the 320px list. */}
        <Pagination
          page={availabilityPagination.page}
          pageSize={availabilityPagination.pageSize}
          totalItems={availabilityPagination.totalItems}
          totalPages={availabilityPagination.totalPages}
          onPageChange={availabilityPagination.setPage}
          className="mt-3"
        />
      </div>
    </div>
  );
}

// A single labelled field inside the detail panel's info card.
function DetailField({
  icon: Icon,
  label,
  value,
  className = "",
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex min-w-0 items-start gap-2 ${className}`}>
      <Icon
        size={13}
        strokeWidth={2}
        className="mt-0.5 shrink-0 text-[var(--color-text-placeholder-alt)]"
      />

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-placeholder)]">
          {label}
        </p>
        <p className="mt-0.5 break-words text-[13px] font-medium leading-4 text-[var(--color-text-secondary)]">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

// UPDATE UNITS MODAL
function UpdateUnitsModal({
  open,
  bank,
  availabilityId,
  movement,
  setMovement,
  units,
  setUnits,
  error,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  bank: SuperAdminBloodBank;
  availabilityId: number | null;
  movement: StockMovement;
  setMovement: (value: StockMovement) => void;
  units: string;
  setUnits: (value: string) => void;
  error: string;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const { rendered, visible } = useExitTransition(open, 200);
  const closeLabel = useBilingualText("common.close");
  const movementIssueText = useBilingualText("bloodCentre.movementIssue");
  const movementDiscardText = useBilingualText("bloodCentre.movementDiscard");
  const movementCorrectionText = useBilingualText(
    "bloodCentre.movementCorrection",
  );

  const isCorrection = movement === "CORRECTION";

  const availability = bank?.availability.find(
    (item) => item?.id === availabilityId,
  );

  if (!rendered || !availability) {
    return null;
  }

  return (
    <div
      className={`
        motion-scrim
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/45
        px-4
        backdrop-blur-md
        transition-opacity
        duration-200
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-units-title"
    >
      <div
        className={`
          motion-surface
          flex
          max-h-[calc(100dvh-2rem)]
          w-full
          max-w-[430px]
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-[0_25px_70px_rgba(0,0,0,0.18)]
          transition-[transform,opacity]
          duration-200
          ${
            visible
              ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
              : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
          }
        `}
      >
        <div
          className="
            flex
            shrink-0
            items-start
            justify-between
            border-b
            border-[var(--color-border-lighter)]
            px-5
            py-5
          "
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-[var(--color-icon-bg-soft)]
                "
              >
                <Droplets size={17} className="text-[var(--color-primary)]" />
              </div>

              <div className="min-w-0">
                <Bilingual
                  tKey="superAdmin.updateBloodUnits"
                  as="h2"
                  id="update-units-title"
                  className="
                    text-[14px]
                    font-bold
                    text-[var(--color-text-primary)]
                  "
                />

                <Bilingual
                  tKey="superAdmin.updateCurrentAvailability"
                  as="p"
                  className="
                    mt-0.5
                    text-[12px]
                    text-[var(--color-text-placeholder-alt)]
                  "
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-[var(--color-text-placeholder-alt)]
              transition
              hover:bg-[var(--color-surface-hover)]
              hover:text-[var(--color-text-secondary)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label={closeLabel}
          >
            <X size={17} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          {/* BLOOD BANK */}
          <div
            className="
              rounded-xl
              border
              border-[var(--color-border-lighter)]
              bg-[var(--color-surface-alt)]
              p-4
            "
          >
            <Bilingual
              tKey="superAdmin.bloodBankColumn"
              as="p"
              className="
                text-[12px]
                font-medium
                uppercase
                tracking-wide
                text-[var(--color-text-placeholder-alt)]
              "
            />

            <p
              className="
                mt-1
                break-words
                text-[12px]
                font-bold
                text-[var(--color-text-body)]
              "
            >
              {bank.bloodBankName}
            </p>
          </div>

          {/* BLOOD GROUP / TYPE */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div
              className="
                min-w-0
                rounded-lg
                border
                border-[var(--color-border-lighter)]
                p-3
              "
            >
              <Bilingual
                tKey="bloodCentre.bloodGroup"
                as="p"
                className="text-[12px] text-[var(--color-text-placeholder-alt)]"
              />

              <p
                className="
                  mt-1
                  text-[13px]
                  font-bold
                  text-[var(--color-primary)]
                "
              >
                {availability?.bloodGroup}
              </p>
            </div>

            <div
              className="
                min-w-0
                rounded-lg
                border
                border-[var(--color-border-lighter)]
                p-3
              "
            >
              <Bilingual
                tKey="bloodCentre.bloodComponent"
                as="p"
                className="text-[12px] text-[var(--color-text-placeholder-alt)]"
              />

              <p
                className="
                  mt-1
                  break-words
                  text-[11px]
                  font-bold
                  uppercase
                  leading-4
                  text-[var(--color-text-secondary)]
                "
              >
                {availability?.bloodComponent}
              </p>
            </div>
          </div>

          {/* MOVEMENT / REASON */}
          <div className="mt-4">
            <Bilingual
              tKey="bloodCentre.movement"
              as="label"
              htmlFor="updateMovement"
              className="block text-[12px] font-semibold text-[var(--color-text-secondary)]"
            />

            <div className="relative mt-2">
              <select
                id="updateMovement"
                value={movement}
                disabled={saving}
                onChange={(event) =>
                  setMovement(event.target.value as StockMovement)
                }
                className="
                  h-[44px]
                  w-full
                  appearance-none
                  rounded-lg
                  border
                  border-[var(--color-border)]
                  bg-white
                  px-3
                  pr-10
                  text-[13px]
                  text-[var(--color-text-body)]
                  outline-none
                  transition-all
                  focus:border-[var(--color-primary)]
                  focus:ring-2
                  focus:ring-[var(--color-primary)]/15
                "
              >
                <option value="ISSUE">{movementIssueText}</option>
                <option value="DISCARD">{movementDiscardText}</option>
                <option value="CORRECTION">{movementCorrectionText}</option>
              </select>

              <ChevronDown
                size={17}
                strokeWidth={1.8}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              />
            </div>
          </div>

          {/* UNITS */}

          <div className="mt-5">
            <label
              htmlFor="updateUnits"
              className="
                block
                text-[12px]
                font-semibold
                text-[var(--color-text-secondary)]
              "
            >
              <Bilingual
                tKey={
                  isCorrection ? "bloodCentre.newTotalUnits" : "bloodCentre.units"
                }
                as="span"
              />
              <span className="text-red-500"> *</span>
            </label>

            <div className="relative mt-2">
              <input
                id="updateUnits"
                type="text"
                inputMode="numeric"
                value={units}
                maxLength={4}
                onChange={(event) => {
                  const value = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 4);

                  setUnits(value);
                }}
                disabled={saving}
                className={`
                  h-[44px]
                  w-full
                  rounded-lg
                  border
                  bg-white
                  px-3
                  pr-16
                  text-[13px]
                  font-semibold
                  text-[var(--color-text-body)]
                  outline-none
                  transition
                  focus:border-[var(--color-primary)]
                  focus:ring-2
                  focus:ring-[var(--color-primary)]/10

                  ${error ? "border-red-400" : "border-[var(--color-border)]"}
                `}
              />

              <span
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-[12px]
                  text-[var(--color-text-placeholder-alt)]
                "
              >
                <BilingualInline tKey="bloodCentre.units" />
              </span>
            </div>

            {error && (
              <p
                role="alert"
                className="
                  mt-2
                  text-[12px]
                  text-red-500
                "
              >
                {error}
              </p>
            )}
          </div>
        </div>

        <div
          className="
            flex
            shrink-0
            gap-2
            border-t
            border-[var(--color-border-lighter)]
            bg-[var(--color-surface-alt)]
            px-5
            py-4
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              min-h-[40px]
              flex-1
              rounded-lg
              border
              border-[var(--color-border)]
              bg-white
              px-3
              py-1.5
              text-[11px]
              font-semibold
              text-[var(--color-text-quaternary)]
              transition
              hover:bg-[var(--color-surface-hover)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <BilingualInline tKey="common.cancel" />
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="
              flex
              min-h-[40px]
              flex-1
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-[var(--color-primary)]
              px-3
              py-1.5
              text-[11px]
              font-semibold
              text-white
              shadow-[0_5px_15px_rgba(255,59,63,0.18)]
              transition-all
              hover:bg-[var(--color-dashboard-cta-hover)]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving && <Loader2 size={14} className="animate-spin shrink-0" />}

            {saving ? (
              <BilingualInline tKey="common.saving" />
            ) : (
              <BilingualInline tKey="superAdmin.saveChanges" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ADD STOCK MODAL
function AddStockModal({
  open,
  bank,
  availabilityId,
  units,
  setUnits,
  remarks,
  setRemarks,
  error,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  bank: SuperAdminBloodBank;
  availabilityId: number | null;
  units: string;
  setUnits: (value: string) => void;
  remarks: string;
  setRemarks: (value: string) => void;
  error: string;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const { rendered, visible } = useExitTransition(open, 200);
  const closeLabel = useBilingualText("common.close");

  const availability = bank?.availability.find(
    (item) => item?.id === availabilityId,
  );

  if (!rendered || !availability) {
    return null;
  }

  return (
    <div
      className={`
        motion-scrim
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/45
        px-4
        backdrop-blur-md
        transition-opacity
        duration-200
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-stock-title"
    >
      <div
        className={`
          motion-surface
          flex
          max-h-[calc(100dvh-2rem)]
          w-full
          max-w-[430px]
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-[0_25px_70px_rgba(0,0,0,0.18)]
          transition-[transform,opacity]
          duration-200
          ${
            visible
              ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
              : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
          }
        `}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[var(--color-border-lighter)] px-5 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-success-bg)]">
                <PlusCircle size={17} className="text-[var(--color-success)]" />
              </div>

              <div className="min-w-0">
                <Bilingual
                  tKey="superAdmin.addStock"
                  as="h2"
                  id="add-stock-title"
                  className="text-[14px] font-bold text-[var(--color-text-primary)]"
                />

                <Bilingual
                  tKey="superAdmin.addUnitsToInventory"
                  as="p"
                  className="mt-0.5 text-[12px] text-[var(--color-text-placeholder-alt)]"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-[var(--color-text-placeholder-alt)]
              transition
              hover:bg-[var(--color-surface-hover)]
              hover:text-[var(--color-text-secondary)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label={closeLabel}
          >
            <X size={17} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <div className="rounded-xl border border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] p-4">
            <Bilingual
              tKey="superAdmin.bloodBankColumn"
              as="p"
              className="text-[12px] font-medium uppercase tracking-wide text-[var(--color-text-placeholder-alt)]"
            />

            <p className="mt-1 break-words text-[12px] font-bold text-[var(--color-text-body)]">
              {bank.bloodBankName}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="min-w-0 rounded-lg border border-[var(--color-border-lighter)] p-3">
              <Bilingual
                tKey="bloodCentre.bloodGroup"
                as="p"
                className="text-[12px] text-[var(--color-text-placeholder-alt)]"
              />

              <p className="mt-1 text-[13px] font-bold text-[var(--color-primary)]">
                {availability?.bloodGroup}
              </p>
            </div>

            <div className="min-w-0 rounded-lg border border-[var(--color-border-lighter)] p-3">
              <Bilingual
                tKey="bloodCentre.bloodComponent"
                as="p"
                className="text-[12px] text-[var(--color-text-placeholder-alt)]"
              />

              <p className="mt-1 break-words text-[11px] font-bold uppercase leading-4 text-[var(--color-text-secondary)]">
                {availability?.bloodComponent}
              </p>
            </div>
          </div>

          <p className="mt-3 text-[12px] text-[var(--color-text-placeholder-alt)]">
            <BilingualInline tKey="superAdmin.currentStock" />{" "}
            <span className="font-bold text-[var(--color-text-body)]">
              {availability?.units} <BilingualInline tKey="recipient.unitsSuffix" />
            </span>
          </p>

          <div className="mt-5">
            <label
              htmlFor="addStockUnits"
              className="block text-[12px] font-semibold text-[var(--color-text-secondary)]"
            >
              <Bilingual tKey="superAdmin.unitsToAdd" as="span" />
              <span className="text-red-500"> *</span>
            </label>

            <div className="relative mt-2">
              <input
                id="addStockUnits"
                type="text"
                inputMode="numeric"
                value={units}
                maxLength={4}
                onChange={(event) => {
                  const value = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 4);

                  setUnits(value);
                }}
                disabled={saving}
                className={`
                  h-[44px]
                  w-full
                  rounded-lg
                  border
                  bg-white
                  px-3
                  pr-16
                  text-[13px]
                  font-semibold
                  text-[var(--color-text-body)]
                  outline-none
                  transition
                  focus:border-[var(--color-primary)]
                  focus:ring-2
                  focus:ring-[var(--color-primary)]/10

                  ${error ? "border-red-400" : "border-[var(--color-border)]"}
                `}
              />

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[var(--color-text-placeholder-alt)]">
                <BilingualInline tKey="bloodCentre.units" />
              </span>
            </div>
          </div>

          <div className="mt-4">
            <Bilingual
              tKey="bloodCentre.remarksOptional"
              as="label"
              htmlFor="addStockRemarks"
              className="block text-[12px] font-semibold text-[var(--color-text-secondary)]"
            />

            <textarea
              id="addStockRemarks"
              value={remarks}
              disabled={saving}
              onChange={(event) => setRemarks(event.target.value)}
              rows={2}
              className="
                mt-2
                w-full
                resize-none
                rounded-lg
                border
                border-[var(--color-border)]
                bg-white
                px-3
                py-2.5
                text-[13px]
                text-[var(--color-text-body)]
                outline-none
                transition
                focus:border-[var(--color-primary)]
                focus:ring-2
                focus:ring-[var(--color-primary)]/10
              "
            />
          </div>

          {error && (
            <p role="alert" className="mt-3 text-[12px] text-red-500">
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2 border-t border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              min-h-[40px]
              flex-1
              rounded-lg
              border
              border-[var(--color-border)]
              bg-white
              px-3
              py-1.5
              text-[11px]
              font-semibold
              text-[var(--color-text-quaternary)]
              transition
              hover:bg-[var(--color-surface-hover)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <BilingualInline tKey="common.cancel" />
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="
              flex
              min-h-[40px]
              flex-1
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-[var(--color-primary)]
              px-3
              py-1.5
              text-[11px]
              font-semibold
              text-white
              shadow-[0_5px_15px_rgba(255,59,63,0.18)]
              transition-all
              hover:bg-[var(--color-dashboard-cta-hover)]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving && <Loader2 size={14} className="animate-spin shrink-0" />}

            {saving ? (
              <BilingualInline tKey="superAdmin.adding" />
            ) : (
              <BilingualInline tKey="superAdmin.addStock" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ADD BLOOD MODAL — unlike AddStockModal (tops up an existing row), this
// creates a brand new blood group / type entry for the centre from scratch.
function AddBloodModal({
  open,
  bank,
  bloodGroups,
  bloodComponents,
  bloodGroupId,
  setBloodGroupId,
  bloodComponentId,
  setBloodComponentId,
  units,
  setUnits,
  remarks,
  setRemarks,
  error,
  saving,
  onClose,
  onSave,
}: {
  open: boolean;
  bank: SuperAdminBloodBank;
  bloodGroups: MasterBloodGroup[];
  bloodComponents: MasterBloodComponent[];
  bloodGroupId: number | "";
  setBloodGroupId: (value: number | "") => void;
  bloodComponentId: number | "";
  setBloodComponentId: (value: number | "") => void;
  units: string;
  setUnits: (value: string) => void;
  remarks: string;
  setRemarks: (value: string) => void;
  error: string;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const { rendered, visible } = useExitTransition(open, 200);
  const closeLabel = useBilingualText("common.close");
  const selectBloodGroupText = useBilingualText("bloodCentre.selectBloodGroup");
  const selectBloodComponentText = useBilingualText("bloodCentre.selectBloodComponent");
  const enterUnitsPlaceholder = useBilingualText("bloodCentre.enterUnits");

  if (!rendered) {
    return null;
  }

  return (
    <div
      className={`
        motion-scrim
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/45
        px-4
        backdrop-blur-md
        transition-opacity
        duration-200
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-blood-title"
    >
      <div
        className={`
          motion-surface
          flex
          max-h-[calc(100dvh-2rem)]
          w-full
          max-w-[430px]
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-[0_25px_70px_rgba(0,0,0,0.18)]
          transition-[transform,opacity]
          duration-200
          ${
            visible
              ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
              : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
          }
        `}
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[var(--color-border-lighter)] px-5 py-5">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-icon-bg-soft)]">
                <Plus size={17} className="text-[var(--color-primary)]" />
              </div>

              <div className="min-w-0">
                <Bilingual
                  tKey="bloodCentre.addBloodAvailability"
                  as="h2"
                  id="add-blood-title"
                  className="text-[14px] font-bold text-[var(--color-text-primary)]"
                />

                <p className="mt-0.5 break-words text-[12px] text-[var(--color-text-placeholder-alt)]">
                  {bank.bloodBankName}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--color-text-placeholder-alt)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={closeLabel}
          >
            <X size={17} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="newBloodGroup"
                className="block text-[12px] font-semibold text-[var(--color-text-secondary)]"
              >
                <Bilingual tKey="bloodCentre.bloodGroup" as="span" />
                <span className="text-red-500"> *</span>
              </label>

              <div className="relative mt-2">
                <select
                  id="newBloodGroup"
                  value={bloodGroupId}
                  disabled={saving}
                  onChange={(event) =>
                    setBloodGroupId(
                      event.target.value ? Number(event.target.value) : "",
                    )
                  }
                  className="h-[44px] w-full appearance-none rounded-lg border border-[var(--color-border)] bg-white px-3 pr-9 text-[13px] text-[var(--color-text-body)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                >
                  <option value="">{selectBloodGroupText}</option>
                  {bloodGroups.map((group) => (
                    <option key={group.bloodGroupId} value={group.bloodGroupId}>
                      {group.bloodGroupName}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="newBloodComponent"
                className="block text-[12px] font-semibold text-[var(--color-text-secondary)]"
              >
                <Bilingual tKey="bloodCentre.bloodComponent" as="span" />
                <span className="text-red-500"> *</span>
              </label>

              <div className="relative mt-2">
                <select
                  id="newBloodComponent"
                  value={bloodComponentId}
                  disabled={saving}
                  onChange={(event) =>
                    setBloodComponentId(
                      event.target.value ? Number(event.target.value) : "",
                    )
                  }
                  className="h-[44px] w-full appearance-none rounded-lg border border-[var(--color-border)] bg-white px-3 pr-9 text-[13px] text-[var(--color-text-body)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                >
                  <option value="">{selectBloodComponentText}</option>
                  {bloodComponents.map((component) => (
                    <option
                      key={component.bloodComponentId}
                      value={component.bloodComponentId}
                    >
                      {component.bloodComponentName}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={16}
                  strokeWidth={1.8}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="newBloodUnits"
              className="block text-[12px] font-semibold text-[var(--color-text-secondary)]"
            >
              <Bilingual tKey="bloodCentre.unitsAvailableLabel" as="span" />
              <span className="text-red-500"> *</span>
            </label>

            <input
              id="newBloodUnits"
              type="text"
              inputMode="numeric"
              value={units}
              maxLength={4}
              disabled={saving}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "").slice(0, 4);
                setUnits(value);
              }}
              placeholder={enterUnitsPlaceholder}
              className="mt-2 h-[44px] w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-[13px] font-semibold text-[var(--color-text-body)] outline-none transition placeholder:font-normal focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          <div className="mt-4">
            <Bilingual
              tKey="bloodCentre.remarksOptional"
              as="label"
              htmlFor="newBloodRemarks"
              className="block text-[12px] font-semibold text-[var(--color-text-secondary)]"
            />

            <textarea
              id="newBloodRemarks"
              value={remarks}
              disabled={saving}
              onChange={(event) => setRemarks(event.target.value)}
              rows={2}
              className="mt-2 w-full resize-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 text-[13px] text-[var(--color-text-body)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {error && (
            <p role="alert" className="mt-3 text-[12px] text-red-500">
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2 border-t border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-h-[40px] flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--color-text-quaternary)] transition hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BilingualInline tKey="common.cancel" />
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_5px_15px_rgba(255,59,63,0.18)] transition-all hover:bg-[var(--color-dashboard-cta-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin shrink-0" />}

            {saving ? (
              <BilingualInline tKey="superAdmin.adding" />
            ) : (
              <BilingualInline tKey="bloodCentre.saveAvailability" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
