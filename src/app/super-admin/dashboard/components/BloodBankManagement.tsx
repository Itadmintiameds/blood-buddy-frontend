"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  ChevronDown,
  ChevronRight,
  Droplets,
  Loader2,
  Pencil,
  Plus,
  PlusCircle,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { SuperAdminBloodBank } from "@/types/bloodCenter/superAdmin/superAdminTypes";
import {
  addStockToCentre,
  getSuperAdminBloodBanks,
  updateSuperAdminBloodUnits,
} from "@/services/bloodCenter/superAdmin/dashboardService";
import { useExitTransition } from "@/app/hooks/useExitTransition";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";

export default function BloodBankManagement() {
  const router = useRouter();
  const searchPlaceholder = useBilingualText("superAdmin.searchBloodCentre");
  const clearSearchLabel = useBilingualText("superAdmin.clearSearch");

  const [bloodBanks, setBloodBanks] = useState<SuperAdminBloodBank[]>([]);
  const [expandedBankId, setExpandedBankId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<SuperAdminBloodBank | null>(
    null,
  );
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState<
    number | null
  >(null);
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

  useEffect(() => {
    let mounted = true;

    const loadBloodBanks = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSuperAdminBloodBanks();

        if (!mounted) {
          return;
        }

        setBloodBanks(Array.isArray(data) ? data : []);

        setExpandedBankId(null);
      } catch (err) {
        console.error("Failed to load blood banks:", err);

        if (mounted) {
          setBloodBanks([]);
          setError("Unable to load blood bank details.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBloodBanks();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredBloodBanks = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return bloodBanks;
    }

    return bloodBanks.filter((bank) => {
      return (
        bank.bloodBankName.toLowerCase().includes(searchValue) ||
        bank.category.toLowerCase().includes(searchValue) ||
        bank.address.toLowerCase().includes(searchValue) ||
        bank.city.toLowerCase().includes(searchValue) ||
        bank.phoneNumber.includes(searchValue)
      );
    });
  }, [bloodBanks, search]);

  const totalBloodBanks = bloodBanks.length;

  const totalBloodTypes = bloodBanks.reduce(
    (total, bank) => total + bank.availability.length,
    0,
  );

  const totalBloodUnits = bloodBanks.reduce(
    (total, bank) =>
      total +
      bank.availability.reduce((bankTotal, item) => bankTotal + item.units, 0),
    0,
  );

  const toggleBank = (bankId: number) => {
    setExpandedBankId((current) => (current === bankId ? null : bankId));
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

    try {
      setSaving(true);
      setFormError("");

      const response = await updateSuperAdminBloodUnits({
        bloodBankId: selectedBank?.id,
        availabilityId: selectedAvailabilityId,
        bloodGroupId: currentAvailability.bloodGroupId,
        bloodComponentId: currentAvailability.bloodComponentId,
        previousUnits: currentAvailability.units,
        units: parsedUnits,
      });

      if (!response.success) {
        setFormError(response.message);

        return;
      }

      setBloodBanks((currentBanks) =>
        currentBanks.map((bank) => {
          if (bank?.id !== selectedBank?.id) {
            return bank;
          }

          return {
            ...bank,
            availability: bank.availability.map((item) => {
              if (item?.id !== selectedAvailabilityId) {
                return item;
              }

              return {
                ...item,
                units: parsedUnits,
              };
            }),
          };
        }),
      );

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

      setBloodBanks((currentBanks) =>
        currentBanks.map((bank) => {
          if (bank?.id !== addStockBank.id) {
            return bank;
          }

          return {
            ...bank,
            availability: bank.availability.map((item) => {
              if (item?.id !== addStockAvailabilityId) {
                return item;
              }

              return { ...item, units: item.units + parsedUnits };
            }),
          };
        }),
      );

      setAddStockModalOpen(false);
    } catch (err) {
      console.error("Add stock error:", err);
      setAddStockError("Unable to add stock. Please try again.");
    } finally {
      setAddStockSaving(false);
    }
  };

  return (
    <section className="w-full min-w-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[var(--color-icon-bg-soft)]
              "
            >
              <Building2 size={19} className="text-[var(--color-primary)]" />
            </div>

            <div className="min-w-0">
              <Bilingual
                tKey="superAdmin.bloodBankManagement"
                as="h2"
                className="
                  text-[19px]
                  font-bold
                  tracking-[-0.01em]
                  text-[var(--color-text-primary)]
                  sm:text-[22px]
                "
              />

              <Bilingual
                tKey="superAdmin.bloodBankManagementDescription"
                as="p"
                className="
                  mt-0.5
                  text-[12px]
                  text-[var(--color-text-placeholder-alt)]
                  sm:text-[13px]
                "
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className="
          mt-6
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-3
        "
      >
        <StatCard
          icon={Building2}
          tKey="superAdmin.bloodBanksStat"
          value={String(totalBloodBanks)}
          color="warning"
        />

        <StatCard
          icon={Droplets}
          tKey="superAdmin.bloodTypesStat"
          value={String(totalBloodTypes)}
          color="success"
        />

        <StatCard
          icon={Droplets}
          tKey="superAdmin.availableUnitsStat"
          value={String(totalBloodUnits)}
          color="danger"
        />
      </div>

      <div
        className="
          mt-6
          flex
          w-full
          min-w-0
          flex-col
          gap-3
          rounded-xl
          border
          border-[var(--color-border-lighter)]
          bg-white
          p-3
          shadow-[0_2px_12px_rgba(0,0,0,0.025)]
          sm:p-4
          md:flex-row
          md:items-center
          md:justify-between
        "
      >
        {/* SEARCH */}

        <div
          className="
            relative
            w-full
            min-w-0
            md:max-w-[400px]
          "
        >
          <Search
            size={17}
            className="
              pointer-events-none
              absolute
              left-3.5
              top-1/2
              -translate-y-1/2
              text-[var(--color-text-placeholder-alt)]
            "
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="
              h-11
              w-full
              min-w-0
              rounded-lg
              border
              border-[var(--color-border)]
              bg-white
              pl-10
              pr-9
              text-[14px]
              text-[var(--color-text-body)]
              outline-none
              transition-all
              duration-200
              placeholder:text-[var(--color-text-placeholder)]
              hover:border-[var(--color-border)]
              focus:border-[var(--color-primary)]
              focus:ring-2
              focus:ring-[var(--color-primary)]/10
            "
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="
                absolute
                right-2
                top-1/2
                flex
                h-7
                w-7
                -translate-y-1/2
                items-center
                justify-center
                rounded-md
                text-[var(--color-text-placeholder-alt)]
                transition
                hover:bg-[var(--color-surface-hover)]
                hover:text-[var(--color-text-secondary)]
              "
              aria-label={clearSearchLabel}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* ADD BLOOD CENTRE */}

        <button
          type="button"
          onClick={() => router.push("/blood-centre/register")}
          className="
            flex
            min-h-11
            w-full
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-[var(--color-primary)]
            px-4
            py-2
            text-[13px]
            font-semibold
            text-white
            shadow-[0_5px_15px_rgba(255,59,63,0.18)]
            transition-all
            duration-200
            hover:-translate-y-px
            hover:bg-[var(--color-dashboard-cta-hover)]
            active:translate-y-0
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[var(--color-primary)]
            focus-visible:ring-offset-2
            sm:w-auto
            sm:text-[14px]
          "
        >
          <Plus size={16} className="shrink-0" />
          <BilingualInline
            tKey="superAdmin.addBloodCentre"
            enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
          />
        </button>
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

      {/* DESKTOP TABLE */}
      <div
        className="
          mt-5
          hidden
          w-full
          min-w-0
          overflow-hidden
          rounded-xl
          border
          border-[var(--color-border-light)]
          bg-white
          shadow-[0_4px_20px_rgba(0,0,0,0.035)]
          lg:block
        "
      >
        <div
          className="
            w-full
            min-w-0
            overflow-x-hidden
            overflow-y-auto
          "
        >
          <table
            className="
              w-full
              table-fixed
              border-collapse
            "
          >
            <thead className="sticky top-0 z-20">
              <tr
                className="
                  border-b
                  border-[var(--color-border-table)]
                  bg-[var(--warning-500)]
                "
              >
                <th
                  style={{ width: "7%" }}
                  className="
                    px-1
                    py-3
                    text-center
                    text-[12px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-[var(--base-white)]
                    sm:px-2
                    sm:py-4
                    sm:text-[13px]
                  "
                >
                  <Bilingual tKey="superAdmin.sNo" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80" />
                </th>

                <th
                  style={{ width: "25%" }}
                  className="
                    px-1
                    py-3
                    text-left
                    text-[12px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-[var(--base-white)]
                    sm:px-3
                    sm:py-4
                    sm:text-[13px]
                  "
                >
                  <Bilingual tKey="superAdmin.bloodBankColumn" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80" />
                </th>

                <th
                  style={{ width: "14%" }}
                  className="
                    px-1
                    py-3
                    text-left
                    text-[12px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-[var(--base-white)]
                    sm:px-2
                    sm:py-4
                    sm:text-[13px]
                  "
                >
                  <Bilingual tKey="bloodCentre.category" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80" />
                </th>

                <th
                  style={{ width: "24%" }}
                  className="
                    px-1
                    py-3
                    text-left
                    text-[12px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-[var(--base-white)]
                    sm:px-2
                    sm:py-4
                    sm:text-[13px]
                  "
                >
                  <Bilingual tKey="common.address" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80" />
                </th>

                <th
                  style={{ width: "12%" }}
                  className="
                    px-1
                    py-3
                    text-left
                    text-[12px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-[var(--base-white)]
                    sm:px-2
                    sm:py-4
                    sm:text-[13px]
                  "
                >
                  <Bilingual tKey="common.city" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80" />
                </th>

                <th
                  style={{ width: "18%" }}
                  className="
                    px-1
                    py-3
                    text-left
                    text-[12px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-[var(--base-white)]
                    sm:px-2
                    sm:py-4
                    sm:text-[13px]
                  "
                >
                  <Bilingual tKey="superAdmin.phone" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-80" />
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2
                        size={24}
                        className="
                          animate-spin
                          text-[var(--color-primary)]
                        "
                      />

                      <Bilingual
                        tKey="superAdmin.loadingBloodBanks"
                        as="p"
                        className="
                          mt-3
                          text-[11px]
                          text-[var(--color-text-tertiary)]
                        "
                      />
                    </div>
                  </td>
                </tr>
              )}

              {/* EMPTY */}
              {!loading && filteredBloodBanks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center">
                      <Building2
                        size={28}
                        className="text-[var(--color-border)]"
                      />

                      <Bilingual
                        tKey="superAdmin.noBloodBanksFound"
                        as="p"
                        className="
                            mt-3
                            text-[12px]
                            font-semibold
                            text-[var(--color-text-quaternary)]
                          "
                      />

                      <Bilingual
                        tKey="superAdmin.tryChangingSearch"
                        as="p"
                        className="
                            mt-1
                            text-[10px]
                            text-[var(--color-text-placeholder)]
                          "
                      />
                    </div>
                  </td>
                </tr>
              )}

              {/* BLOOD BANK ROWS */}
              {!loading &&
                filteredBloodBanks.map((bank, index) => {
                  const expanded = expandedBankId === bank.id;

                  return (
                    <BloodBankTableSection
                      key={bank.id}
                      bank={bank}
                      index={index}
                      expanded={expanded}
                      onToggle={() => toggleBank(bank.id)}
                      onUpdate={(availabilityId) =>
                        openUpdateModal(bank, availabilityId)
                      }
                      onAddStock={(availabilityId) =>
                        openAddStockModal(bank, availabilityId)
                      }
                    />
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE / TABLET CARDS */}
      <div className="mt-5 space-y-3 lg:hidden">
        {loading && (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-[var(--color-border-lighter)]
              bg-white
              py-14
            "
          >
            <Loader2
              size={24}
              className="animate-spin text-[var(--color-primary)]"
            />

            <Bilingual
              tKey="superAdmin.loadingBloodBanks"
              as="p"
              className="mt-3 text-[13px] text-[var(--color-text-placeholder-alt)]"
            />
          </div>
        )}

        {!loading && filteredBloodBanks.length === 0 && (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-[var(--color-border-lighter)]
              bg-white
              px-5
              py-14
              text-center
            "
          >
            <Building2 size={28} className="text-[var(--color-border)]" />

            <Bilingual
              tKey="superAdmin.noBloodBanksFound"
              as="p"
              className="mt-3 text-[14px] font-semibold text-[var(--color-text-quaternary)]"
            />

            <Bilingual
              tKey="superAdmin.tryChangingSearch"
              as="p"
              className="mt-1 text-[12px] text-[var(--color-text-placeholder)]"
            />
          </div>
        )}

        {!loading &&
          filteredBloodBanks.map((bank, index) => (
            <BloodBankCard
              key={bank.id}
              bank={bank}
              index={index}
              expanded={expandedBankId === bank.id}
              onToggle={() => toggleBank(bank.id)}
              onUpdate={(availabilityId) =>
                openUpdateModal(bank, availabilityId)
              }
              onAddStock={(availabilityId) =>
                openAddStockModal(bank, availabilityId)
              }
            />
          ))}
      </div>

      {/* UPDATE MODAL */}
      {selectedBank && (
        <UpdateUnitsModal
          open={updateModalOpen}
          bank={selectedBank}
          availabilityId={selectedAvailabilityId}
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
    </section>
  );
}

// BLOOD BANK TABLE SECTION
function BloodBankTableSection({
  bank,
  index,
  expanded,
  onToggle,
  onUpdate,
  onAddStock,
}: {
  bank: SuperAdminBloodBank;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (availabilityId: number) => void;
  onAddStock: (availabilityId: number) => void;
}) {
  return (
    <>
      {/* MAIN BLOOD BANK ROW */}
      <tr
        onClick={onToggle}
        className="
          group
          cursor-pointer
          border-b
          border-[var(--color-border-lighter)]
          bg-white
          transition-all
          duration-200
          hover:bg-[var(--color-icon-bg-soft)]
          hover:shadow-[inset_4px_0_0_var(--color-primary)]
        "
      >
        {/* S.NO */}
        <td className="px-1 py-4 text-center sm:px-2 sm:py-5">
          <div
            className={`
              mx-auto
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-lg
              transition-all
              duration-200

              ${
                expanded
                  ? "bg-[var(--color-icon-bg-soft)] text-[var(--color-primary)]"
                  : "bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
              }
            `}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        </td>

        {/* BLOOD BANK */}
        <td className="px-1 py-4 sm:px-3 sm:py-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-[var(--color-icon-bg-soft)]
                sm:h-9
                sm:w-9
              "
            >
              <Building2 size={15} className="text-[var(--color-primary)]" />
            </div>

            <div className="min-w-0">
              <p
                className="
                  break-words
                  text-[10px]
                  font-bold
                  leading-4
                  text-[var(--color-text-body)]
                  sm:text-[12px]
                "
              >
                {bank?.bloodBankName}
              </p>

              <Bilingual
                tKey="superAdmin.bloodTypesCount"
                params={{ count: bank?.availability?.length ?? 0 }}
                as="p"
                className="
                  mt-0.5
                  text-[11px]
                  text-[var(--color-text-placeholder-alt)]
                  sm:text-[12px]
                "
              />
            </div>
          </div>
        </td>

        {/* CATEGORY */}

        <td className="px-1 py-4 sm:px-2 sm:py-5">
          <span
            className="
              inline-flex
              max-w-full
              break-words
              rounded-full
              border
              border-[var(--color-border-lighter)]
              bg-[var(--color-surface-alt)]
              px-2
              py-1
              text-[11px]
              font-semibold
              leading-3
              text-[var(--color-text-secondary)]
              sm:px-2.5
              sm:text-[12px]
            "
          >
            {bank?.category}
          </span>
        </td>

        {/* ADDRESS */}
        <td
          className="
            break-words
            px-1
            py-4
            text-[11px]
            leading-4
            text-[var(--color-text-quaternary)]
            sm:px-2
            sm:py-5
            sm:text-[13px]
          "
        >
          {bank?.address}
        </td>

        {/* CITY */}
        <td
          className="
            break-words
            px-1
            py-4
            text-[11px]
            font-medium
            leading-4
            text-[var(--color-text-secondary)]
            sm:px-2
            sm:py-5
            sm:text-[13px]
          "
        >
          {bank?.city}
        </td>

        {/* PHONE */}
        <td
          className="
            break-words
            px-1
            py-4
            text-[11px]
            leading-4
            text-[var(--color-text-quaternary)]
            sm:px-2
            sm:py-5
            sm:text-[13px]
          "
        >
          {bank?.phoneNumber}
        </td>
      </tr>

      {/* NESTED BLOOD AVAILABILITY TABLE */}
      {expanded && (
        <tr>
          <td
            colSpan={6}
            className="
              bg-[var(--color-surface-alt)]
              p-0
            "
          >
            <div
              className="
                w-full
                min-w-0
                border-b
                border-[var(--color-border-light)]
                bg-[var(--color-surface-alt)]
                px-2
                py-4
                sm:px-4
                sm:py-5
              "
            >
              <div
                className="
                  w-full
                  min-w-0
                  overflow-hidden
                  rounded-xl
                  border
                  border-[var(--color-border-light)]
                  bg-white
                  shadow-[0_5px_18px_rgba(0,0,0,0.07)]
                "
              >
                {/* NESTED TABLE HEADER */}
                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    justify-between
                    gap-2
                    border-b
                    border-[var(--primary-200)]
                    bg-[var(--color-icon-bg-soft)]
                    px-3
                    py-3
                    sm:px-4
                  "
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Droplets
                      size={15}
                      className="shrink-0 text-[var(--color-primary)]"
                    />

                    <Bilingual
                      tKey="bloodCentre.bloodAvailabilityTitle"
                      as="span"
                      className="
                        truncate
                        text-[12px]
                        font-bold
                        text-[var(--color-text-body)]
                        sm:text-[13px]
                      "
                    />
                  </div>

                  <span
                    className="
                      max-w-[45%]
                      truncate
                      text-[11px]
                      text-[var(--color-text-placeholder-alt)]
                      sm:text-[12px]
                    "
                  >
                    {bank.bloodBankName}
                  </span>
                </div>

                <div
                  className="
                    w-full
                    min-w-0
                    overflow-x-hidden
                    overflow-y-auto
                    bg-white
                  "
                >
                  <table
                    className="
                      w-full
                      table-fixed
                      border-collapse
                    "
                  >
                    <thead className="sticky top-0 z-10">
                      <tr
                        className="
                          border-b
                          border-[var(--color-border-light)]
                          bg-[var(--color-surface-alt)]
                        "
                      >
                        <th
                          style={{
                            width: "25%",
                          }}
                          className="
                            px-2
                            py-3
                            text-left
                            text-[12px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-[var(--color-text-secondary)]
                            sm:px-4
                            sm:text-[13px]
                          "
                        >
                          <Bilingual tKey="bloodCentre.bloodGroup" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-70" />
                        </th>

                        <th
                          style={{
                            width: "35%",
                          }}
                          className="
                            px-2
                            py-3
                            text-left
                            text-[12px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-[var(--color-text-secondary)]
                            sm:px-4
                            sm:text-[13px]
                          "
                        >
                          <Bilingual tKey="bloodCentre.bloodType" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-70" />
                        </th>

                        <th
                          style={{
                            width: "20%",
                          }}
                          className="
                            px-1
                            py-3
                            text-center
                            text-[12px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-[var(--color-text-secondary)]
                            sm:px-3
                            sm:text-[13px]
                          "
                        >
                          <Bilingual tKey="bloodCentre.units" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-70" />
                        </th>

                        <th
                          style={{
                            width: "20%",
                          }}
                          className="
                            px-1
                            py-3
                            text-center
                            text-[12px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-[var(--color-text-secondary)]
                            sm:px-3
                            sm:text-[13px]
                          "
                        >
                          <Bilingual tKey="superAdmin.actions" as="span" enClassName="mt-0.5 block text-[0.7em] font-normal leading-tight opacity-70" />
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {bank?.availability.map((availability) => (
                        <tr
                          key={availability.id}
                          className="
                              border-b
                              border-[var(--color-border-lighter)]
                              last:border-b-0
                              transition-all
                              duration-200
                              hover:bg-[var(--color-icon-bg-soft)]
                            "
                        >
                          {/* BLOOD GROUP */}
                          <td className="px-2 py-3 sm:px-4">
                            <span
                              className="
                                  inline-flex
                                  max-w-full
                                  items-center
                                  justify-center
                                  rounded-md
                                  bg-[var(--color-icon-bg-soft)]
                                  px-2
                                  py-1
                                  text-[11px]
                                  font-bold
                                  text-[var(--color-primary)]
                                  sm:text-[13px]
                                "
                            >
                              {availability?.bloodGroup}
                            </span>
                          </td>

                          {/* BLOOD TYPE */}
                          <td
                            className="
                                break-words
                                px-2
                                py-3
                                text-[12px]
                                font-medium
                                uppercase
                                leading-4
                                text-[var(--color-text-secondary)]
                                sm:px-4
                                sm:text-[13px]
                              "
                          >
                            {availability?.bloodType}
                          </td>

                          {/* UNITS */}
                          <td className="px-1 py-3 text-center sm:px-3">
                            <div className="flex flex-col items-center justify-center">
                              <span
                                className="
                                    text-[12px]
                                    font-bold
                                    text-[var(--color-text-primary)]
                                    sm:text-[12px]
                                  "
                              >
                                {availability?.units}
                              </span>

                              <Bilingual
                                tKey="bloodCentre.units"
                                as="span"
                                className="
                                    text-[11px]
                                    text-[var(--color-text-placeholder-alt)]
                                    sm:text-[12px]
                                  "
                              />
                            </div>
                          </td>

                          {/* UPDATE / ADD STOCK */}
                          <td className="px-1 py-3 text-center sm:px-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();

                                  onAddStock(availability.id);
                                }}
                                className="
                                    inline-flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-[var(--color-border-lighter)]
                                    bg-white
                                    text-[var(--color-text-muted)]
                                    shadow-sm
                                    transition-all
                                    duration-200
                                    hover:-translate-y-[1px]
                                    hover:border-[var(--color-success-bg)]
                                    hover:bg-[var(--color-success-bg)]
                                    hover:text-[var(--color-success)]
                                    active:translate-y-0
                                    sm:h-8
                                    sm:w-8
                                  "
                                aria-label={`Add stock for ${availability?.bloodGroup} ${availability?.bloodType}`}
                              >
                                <PlusCircle size={12} />
                              </button>

                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();

                                  onUpdate(availability.id);
                                }}
                                className="
                                    inline-flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    border-[var(--color-border-lighter)]
                                    bg-white
                                    text-[var(--color-text-muted)]
                                    shadow-sm
                                    transition-all
                                    duration-200
                                    hover:-translate-y-[1px]
                                    hover:border-[var(--primary-200)]
                                    hover:bg-[var(--color-icon-bg-soft)]
                                    hover:text-[var(--color-primary)]
                                    active:translate-y-0
                                    sm:h-8
                                    sm:w-8
                                  "
                                aria-label={`Update ${availability?.bloodGroup} ${availability?.bloodType}`}
                              >
                                <Pencil size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {bank?.availability?.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="
                              px-4
                              py-8
                              text-center
                              text-[10px]
                              text-[var(--color-text-placeholder-alt)]
                            "
                          >
                            <Bilingual tKey="superAdmin.noBloodAvailabilityFound" as="span" />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// BLOOD BANK CARD (mobile / tablet)
function BloodBankCard({
  bank,
  index,
  expanded,
  onToggle,
  onUpdate,
  onAddStock,
}: {
  bank: SuperAdminBloodBank;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (availabilityId: number) => void;
  onAddStock: (availabilityId: number) => void;
}) {
  return (
    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-[var(--color-border-lighter)]
        bg-white
        shadow-[0_2px_12px_rgba(0,0,0,0.025)]
      "
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="
          flex
          w-full
          items-start
          justify-between
          gap-3
          p-4
          text-left
          transition-colors
          duration-200
          hover:bg-[var(--color-surface-hover)]
        "
      >
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-[var(--color-icon-bg-soft)]
            "
          >
            <Building2 size={17} className="text-[var(--color-primary)]" />
          </div>

          <div className="min-w-0">
            <Bilingual
              tKey="superAdmin.sNoValue"
              params={{ index: index + 1 }}
              as="p"
              className="text-[11px] text-[var(--color-text-placeholder)]"
            />

            <p className="mt-0.5 break-words text-[14px] font-bold leading-5 text-[var(--color-text-body)]">
              {bank?.bloodBankName}
            </p>

            <span
              className="
                mt-1.5
                inline-flex
                rounded-full
                border
                border-[var(--color-border-lighter)]
                bg-[var(--color-surface-alt)]
                px-2.5
                py-0.5
                text-[11px]
                font-semibold
                text-[var(--color-text-secondary)]
              "
            >
              {bank?.category}
            </span>
          </div>
        </div>

        <div
          className={`
            mt-1
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-lg
            transition-all
            duration-200

            ${
              expanded
                ? "bg-[var(--color-icon-bg-soft)] text-[var(--color-primary)]"
                : "bg-[var(--color-surface-alt)] text-[var(--color-text-tertiary)]"
            }
          `}
        >
          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </div>
      </button>

      <div className="grid grid-cols-1 gap-3 border-t border-[var(--color-border-lighter)] px-4 py-3.5 sm:grid-cols-2">
        <div className="min-w-0">
          <Bilingual
            tKey="common.address"
            as="p"
            className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-placeholder)]"
          />
          <p className="mt-1 break-words text-[12px] text-[var(--color-text-secondary)]">
            {bank?.address}
          </p>
        </div>

        <div className="min-w-0">
          <Bilingual
            tKey="common.city"
            as="p"
            className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-placeholder)]"
          />
          <p className="mt-1 break-words text-[12px] text-[var(--color-text-secondary)]">
            {bank?.city}
          </p>
        </div>

        <div className="min-w-0 sm:col-span-2">
          <Bilingual
            tKey="superAdmin.phone"
            as="p"
            className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-placeholder)]"
          />
          <p className="mt-1 break-words text-[12px] text-[var(--color-text-secondary)]">
            {bank?.phoneNumber}
          </p>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[var(--color-border-light)] bg-[var(--color-surface-alt)] px-4 py-4 shadow-[inset_0_1px_0_rgba(0,0,0,0.02)]">
          <div className="mb-3 flex items-center gap-2">
            <Droplets size={15} className="text-[var(--color-primary)]" />
            <Bilingual
              tKey="bloodCentre.bloodAvailabilityTitle"
              as="span"
              className="text-[12px] font-bold text-[var(--color-text-primary)]"
            />
          </div>

          <div className="space-y-2.5">
            {bank?.availability.map((availability) => (
              <div
                key={availability?.id}
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                  rounded-lg
                  border
                  border-[var(--color-border-light)]
                  bg-white
                  px-3.5
                  py-3
                  shadow-[0_2px_10px_rgba(0,0,0,0.04)]
                "
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="
                      inline-flex
                      shrink-0
                      items-center
                      justify-center
                      rounded-md
                      bg-[var(--color-icon-bg-soft)]
                      px-2
                      py-1
                      text-[11px]
                      font-bold
                      text-[var(--color-primary)]
                    "
                  >
                    {availability?.bloodGroup}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium uppercase text-[var(--color-text-secondary)]">
                      {availability?.bloodType}
                    </p>
                    <p className="text-[12px] font-bold text-[var(--color-text-body)]">
                      {availability?.units} <BilingualInline tKey="bloodCentre.units" />
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onAddStock(availability.id)}
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-[var(--color-border-lighter)]
                      bg-white
                      text-[var(--color-text-tertiary)]
                      shadow-sm
                      transition-all
                      duration-200
                      hover:border-[var(--color-success-bg)]
                      hover:bg-[var(--color-success-bg)]
                      hover:text-[var(--color-success)]
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[var(--color-primary)]
                    "
                    aria-label={`Add stock for ${availability?.bloodGroup} ${availability?.bloodType}`}
                  >
                    <PlusCircle size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdate(availability.id)}
                    className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-[var(--color-border-lighter)]
                      bg-white
                      text-[var(--color-text-tertiary)]
                      shadow-sm
                      transition-all
                      duration-200
                      hover:border-[var(--primary-200)]
                      hover:bg-[var(--color-icon-bg-soft)]
                      hover:text-[var(--color-primary)]
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[var(--color-primary)]
                    "
                    aria-label={`Update ${availability?.bloodGroup} ${availability?.bloodType}`}
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
            ))}

            {bank?.availability?.length === 0 && (
              <Bilingual
                tKey="superAdmin.noBloodAvailabilityFound"
                as="p"
                className="px-2 py-4 text-center text-[12px] text-[var(--color-text-placeholder)]"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// STAT CARD
function StatCard({
  icon: Icon,
  tKey,
  value,
  color,
}: {
  icon: typeof Building2;
  tKey: string;
  value: string;
  color: "warning" | "success" | "danger";
}) {
  const colorStyles = {
    warning: {
      background: "var(--color-stat-red)",
      iconBackground: "var(--color-stat-red)",
      text: "var(--color-white)",
    },
    success: {
      background: "var(--color-stat-green)",
      iconBackground: "var(--color-stat-green)",
      text: "var(--color-white)",
    },
    danger: {
      background: "var(--color-stat-yellow)",
      iconBackground: "var(--color-stat-yellow)",
      text: "var(--color-white)",
    },
  };

  const styles = colorStyles[color];

  return (
    <div
      className="
        flex
        min-w-0
        items-center
        gap-3
        rounded-xl
        px-4
        py-4
        shadow-[0_2px_10px_rgba(0,0,0,0.08)]
        transition-all
        duration-200
        hover:-translate-y-[1px]
        hover:shadow-[0_7px_20px_rgba(0,0,0,0.12)]
      "
      style={{
        backgroundColor: styles.background,
      }}
    >
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
        "
        style={{
          backgroundColor: styles.iconBackground,
        }}
      >
        <Icon
          size={18}
          strokeWidth={2}
          style={{
            color: styles.text,
          }}
        />
      </div>

      <div className="min-w-0">
        <Bilingual
          tKey={tKey}
          as="p"
          className="
            truncate
            text-[11px]
            font-medium
            uppercase
            tracking-wide
          "
          style={{ color: styles.text }}
          enClassName="mt-0.5 block text-[0.75em] font-normal leading-tight opacity-80"
        />

        <p
          className="
            mt-0.5
            text-[19px]
            font-bold
          "
          style={{
            color: styles.text,
          }}
        >
          {value}
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
  units: string;
  setUnits: (value: string) => void;
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
      aria-labelledby="update-units-title"
    >
      <div
        className={`
          motion-surface
          flex
          max-h-[90vh]
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
                tKey="bloodCentre.bloodType"
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
                {availability?.bloodType}
              </p>
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
              <Bilingual tKey="superAdmin.availableUnitsField" as="span" />
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
          max-h-[90vh]
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
                tKey="bloodCentre.bloodType"
                as="p"
                className="text-[12px] text-[var(--color-text-placeholder-alt)]"
              />

              <p className="mt-1 break-words text-[11px] font-bold uppercase leading-4 text-[var(--color-text-secondary)]">
                {availability?.bloodType}
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
