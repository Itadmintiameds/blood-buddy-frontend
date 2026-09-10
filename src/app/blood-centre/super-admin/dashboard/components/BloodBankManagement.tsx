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
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { SuperAdminBloodBank } from "@/types/bloodCenter/superAdmin/superAdminTypes";
import {
  getSuperAdminBloodBanks,
  updateSuperAdminBloodUnits,
} from "@/services/bloodCenter/superAdmin/dashboardService";

export default function BloodBankManagement() {
  const router = useRouter();

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

    setUpdateModalOpen(false);
    setSelectedBank(null);
    setSelectedAvailabilityId(null);
    setUnits("");
    setFormError("");
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

    try {
      setSaving(true);
      setFormError("");

      const response = await updateSuperAdminBloodUnits({
        bloodBankId: selectedBank?.id,
        availabilityId: selectedAvailabilityId,
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

  return (
    <section className="w-full min-w-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
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
                rounded-xl
                bg-[#fff0f0]
              "
            >
              <Building2 size={18} className="text-[#ff3b3f]" />
            </div>

            <div className="min-w-0">
              <h2
                className="
                  truncate
                  text-[18px]
                  font-bold
                  text-[#222]
                  sm:text-[21px]
                "
              >
                Blood Bank Management
              </h2>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  text-[#888]
                  sm:text-[11px]
                "
              >
                Manage registered blood banks and blood availability.
              </p>
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
          label="Blood Banks"
          value={String(totalBloodBanks)}
          color="warning"
        />

        <StatCard
          icon={Droplets}
          label="Blood Types"
          value={String(totalBloodTypes)}
          color="success"
        />

        <StatCard
          icon={Droplets}
          label="Available Units"
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
          border-[#e8e8e8]
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
            size={16}
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-[#999]
            "
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search blood centre..."
            className="
              h-[40px]
              w-full
              min-w-0
              rounded-lg
              border
              border-[#dddddd]
              bg-white
              pl-10
              pr-9
              text-[11px]
              text-[#333]
              outline-none
              transition
              placeholder:text-[#aaa]
              focus:border-[#ff3b3f]
              focus:ring-2
              focus:ring-[#ff3b3f]/10
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
                text-[#999]
                transition
                hover:bg-[#f5f5f5]
                hover:text-[#555]
              "
              aria-label="Clear search"
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
            h-[40px]
            w-full
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-[#ff3b3f]
            px-4
            text-[11px]
            font-semibold
            text-white
            shadow-[0_5px_15px_rgba(255,59,63,0.18)]
            transition-all
            duration-200
            hover:-translate-y-[1px]
            hover:bg-[#ed3539]
            active:translate-y-0
            sm:h-[42px]
            sm:w-auto
            sm:text-[12px]
          "
        >
          <Plus size={16} />
          Add Blood Centre
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
            text-[11px]
            text-red-600
          "
        >
          <AlertCircle size={15} className="shrink-0" />

          <span className="min-w-0">{error}</span>
        </div>
      )}

      <div
        className="
          mt-5
          w-full
          min-w-0
          overflow-hidden
          rounded-xl
          border
          border-[#e5e5e5]
          bg-white
          shadow-[0_4px_20px_rgba(0,0,0,0.035)]
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
                  border-[#dedede]
                  bg-[#FF3B3B]
                "
              >
                <th
                  style={{ width: "7%" }}
                  className="
                    px-1
                    py-3
                    text-center
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-[#444]
                    sm:px-2
                    sm:py-4
                    sm:text-[10px]
                  "
                >
                  S.No
                </th>

                <th
                  style={{ width: "25%" }}
                  className="
                    px-1
                    py-3
                    text-left
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-[#444]
                    sm:px-3
                    sm:py-4
                    sm:text-[10px]
                  "
                >
                  Blood Bank
                </th>

                <th
                  style={{ width: "14%" }}
                  className="
                    px-1
                    py-3
                    text-left
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-[#444]
                    sm:px-2
                    sm:py-4
                    sm:text-[10px]
                  "
                >
                  Category
                </th>

                <th
                  style={{ width: "24%" }}
                  className="
                    px-1
                    py-3
                    text-left
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-[#444]
                    sm:px-2
                    sm:py-4
                    sm:text-[10px]
                  "
                >
                  Address
                </th>

                <th
                  style={{ width: "12%" }}
                  className="
                    px-1
                    py-3
                    text-left
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-[#444]
                    sm:px-2
                    sm:py-4
                    sm:text-[10px]
                  "
                >
                  City
                </th>

                <th
                  style={{ width: "18%" }}
                  className="
                    px-1
                    py-3
                    text-left
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-[#444]
                    sm:px-2
                    sm:py-4
                    sm:text-[10px]
                  "
                >
                  Phone
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
                          text-[#ff3b3f]
                        "
                      />

                      <p
                        className="
                          mt-3
                          text-[11px]
                          text-[#888]
                        "
                      >
                        Loading blood banks...
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {/* EMPTY */}
              {!loading && filteredBloodBanks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center">
                      <Building2 size={28} className="text-[#ccc]" />

                      <p
                        className="
                            mt-3
                            text-[12px]
                            font-semibold
                            text-[#666]
                          "
                      >
                        No blood banks found
                      </p>

                      <p
                        className="
                            mt-1
                            text-[10px]
                            text-[#aaa]
                          "
                      >
                        Try changing your search.
                      </p>
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
                    />
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPDATE MODAL */}
      {updateModalOpen && selectedBank && (
        <UpdateUnitsModal
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
}: {
  bank: SuperAdminBloodBank;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (availabilityId: number) => void;
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
          border-[#eeeeee]
          bg-white
          transition-all
          duration-200
          hover:bg-[#fffafa]
          hover:shadow-[inset_4px_0_0_#ff3b3f]
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
                  ? "bg-[#fff0f0] text-[#ff3b3f]"
                  : "bg-[#f6f6f6] text-[#777]"
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
                bg-[#fff1f1]
                sm:h-9
                sm:w-9
              "
            >
              <Building2 size={15} className="text-[#ff3b3f]" />
            </div>

            <div className="min-w-0">
              <p
                className="
                  break-words
                  text-[10px]
                  font-bold
                  leading-4
                  text-[#333]
                  sm:text-[12px]
                "
              >
                {bank?.bloodBankName}
              </p>

              <p
                className="
                  mt-0.5
                  text-[8px]
                  text-[#999]
                  sm:text-[9px]
                "
              >
                {bank?.availability?.length} blood types
              </p>
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
              border-[#eeeeee]
              bg-[#fafafa]
              px-2
              py-1
              text-[8px]
              font-semibold
              leading-3
              text-[#555]
              sm:px-2.5
              sm:text-[9px]
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
            text-[8px]
            leading-4
            text-[#666]
            sm:px-2
            sm:py-5
            sm:text-[10px]
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
            text-[8px]
            font-medium
            leading-4
            text-[#555]
            sm:px-2
            sm:py-5
            sm:text-[10px]
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
            text-[8px]
            leading-4
            text-[#666]
            sm:px-2
            sm:py-5
            sm:text-[10px]
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
              bg-[#fafafa]
              p-0
            "
          >
            <div
              className="
                w-full
                min-w-0
                border-b
                border-[#e5e5e5]
                bg-[#fafafa]
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
                  rounded-lg
                  border
                  border-[#e4e4e4]
                  bg-white
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
                    border-[#e7e7e7]
                    bg-[#fffafa]
                    px-3
                    py-3
                    sm:px-4
                  "
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Droplets size={15} className="shrink-0 text-[#ff3b3f]" />

                    <span
                      className="
                        truncate
                        text-[10px]
                        font-bold
                        text-[#333]
                        sm:text-[11px]
                      "
                    >
                      Blood Availability
                    </span>
                  </div>

                  <span
                    className="
                      max-w-[45%]
                      truncate
                      text-[8px]
                      text-[#999]
                      sm:text-[9px]
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
                          border-[#e5e5e5]
                          bg-[#f8f8f9]
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
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-[#555]
                            sm:px-4
                            sm:text-[10px]
                          "
                        >
                          Blood Group
                        </th>

                        <th
                          style={{
                            width: "35%",
                          }}
                          className="
                            px-2
                            py-3
                            text-left
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-[#555]
                            sm:px-4
                            sm:text-[10px]
                          "
                        >
                          Blood Type
                        </th>

                        <th
                          style={{
                            width: "20%",
                          }}
                          className="
                            px-1
                            py-3
                            text-center
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-[#555]
                            sm:px-3
                            sm:text-[10px]
                          "
                        >
                          Units
                        </th>

                        <th
                          style={{
                            width: "20%",
                          }}
                          className="
                            px-1
                            py-3
                            text-center
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-[#555]
                            sm:px-3
                            sm:text-[10px]
                          "
                        >
                          Update
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {bank?.availability.map((availability) => (
                        <tr
                          key={availability.id}
                          className="
                              border-b
                              border-[#eeeeee]
                              last:border-b-0
                              transition-all
                              duration-200
                              hover:bg-[#fff7f7]
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
                                  bg-[#fff0f0]
                                  px-2
                                  py-1
                                  text-[8px]
                                  font-bold
                                  text-[#ff3b3f]
                                  sm:text-[10px]
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
                                text-[8px]
                                font-medium
                                uppercase
                                leading-4
                                text-[#555]
                                sm:px-4
                                sm:text-[10px]
                              "
                          >
                            {availability?.bloodType}
                          </td>

                          {/* UNITS */}
                          <td className="px-1 py-3 text-center sm:px-3">
                            <div className="flex flex-col items-center justify-center">
                              <span
                                className="
                                    text-[10px]
                                    font-bold
                                    text-[#333]
                                    sm:text-[12px]
                                  "
                              >
                                {availability?.units}
                              </span>

                              <span
                                className="
                                    text-[7px]
                                    text-[#999]
                                    sm:text-[9px]
                                  "
                              >
                                Units
                              </span>
                            </div>
                          </td>

                          {/* UPDATE */}
                          <td className="px-1 py-3 text-center sm:px-3">
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
                                  border-[#eeeeee]
                                  bg-white
                                  text-[#777]
                                  shadow-sm
                                  transition-all
                                  duration-200
                                  hover:-translate-y-[1px]
                                  hover:border-[#ffcccc]
                                  hover:bg-[#fff2f2]
                                  hover:text-[#ff3b3f]
                                  active:translate-y-0
                                  sm:h-8
                                  sm:w-8
                                "
                              aria-label={`Update ${availability?.bloodGroup} ${availability?.bloodType}`}
                            >
                              <Pencil size={12} />
                            </button>
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
                              text-[#999]
                            "
                          >
                            No blood availability found.
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

// STAT CARD
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  color: "warning" | "success" | "danger";
}) {
  const colorStyles = {
    warning: {
      background: "#FF3B3B",
      iconBackground: "#FF3B3B",
      text: "#FFFFFF",
    },
    success: {
      background: "#378200",
      iconBackground: "#378200",
      text: "#FFFFFF",
    },
    danger: {
      background: "#FDC000",
      iconBackground: "#FDC000",
      text: "#FFFFFF",
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
        <p
          className="
            truncate
            text-[9px]
            font-medium
            uppercase
            tracking-wide
          "
          style={{
            color: styles.text,
          }}
        >
          {label}
        </p>

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
  bank,
  availabilityId,
  units,
  setUnits,
  error,
  saving,
  onClose,
  onSave,
}: {
  bank: SuperAdminBloodBank;
  availabilityId: number | null;
  units: string;
  setUnits: (value: string) => void;
  error: string;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}) {
  const availability = bank?.availability.find(
    (item) => item?.id === availabilityId,
  );

  if (!availability) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/45
        px-4
        backdrop-blur-[3px]
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-units-title"
    >
      <div
        className="
          w-full
          max-w-[430px]
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-[0_25px_70px_rgba(0,0,0,0.18)]
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            border-b
            border-[#eeeeee]
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
                  bg-[#fff0f0]
                "
              >
                <Droplets size={17} className="text-[#ff3b3f]" />
              </div>

              <div className="min-w-0">
                <h2
                  id="update-units-title"
                  className="
                    text-[14px]
                    font-bold
                    text-[#222]
                  "
                >
                  Update Blood Units
                </h2>

                <p
                  className="
                    mt-0.5
                    text-[9px]
                    text-[#999]
                  "
                >
                  Update current availability
                </p>
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
              text-[#999]
              transition
              hover:bg-[#f5f5f5]
              hover:text-[#555]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-5 py-5">
          {/* BLOOD BANK */}
          <div
            className="
              rounded-xl
              border
              border-[#eeeeee]
              bg-[#fafafa]
              p-4
            "
          >
            <p
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-wide
                text-[#999]
              "
            >
              Blood Bank
            </p>

            <p
              className="
                mt-1
                break-words
                text-[12px]
                font-bold
                text-[#333]
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
                border-[#eeeeee]
                p-3
              "
            >
              <p className="text-[9px] text-[#999]">Blood Group</p>

              <p
                className="
                  mt-1
                  text-[13px]
                  font-bold
                  text-[#ff3b3f]
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
                border-[#eeeeee]
                p-3
              "
            >
              <p className="text-[9px] text-[#999]">Blood Type</p>

              <p
                className="
                  mt-1
                  break-words
                  text-[11px]
                  font-bold
                  uppercase
                  leading-4
                  text-[#444]
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
                text-[10px]
                font-semibold
                text-[#444]
              "
            >
              Available Units
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
                  text-[#333]
                  outline-none
                  transition
                  focus:border-[#ff3b3f]
                  focus:ring-2
                  focus:ring-[#ff3b3f]/10

                  ${error ? "border-red-400" : "border-[#d8d8d8]"}
                `}
              />

              <span
                className="
                  pointer-events-none
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-[10px]
                  text-[#999]
                "
              >
                Units
              </span>
            </div>

            {error && (
              <p
                role="alert"
                className="
                  mt-2
                  text-[10px]
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
            gap-2
            border-t
            border-[#eeeeee]
            bg-[#fafafa]
            px-5
            py-4
          "
        >
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              h-[40px]
              flex-1
              rounded-lg
              border
              border-[#dddddd]
              bg-white
              text-[11px]
              font-semibold
              text-[#666]
              transition
              hover:bg-[#f5f5f5]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="
              flex
              h-[40px]
              flex-1
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-[#ff3b3f]
              text-[11px]
              font-semibold
              text-white
              shadow-[0_5px_15px_rgba(255,59,63,0.18)]
              transition-all
              hover:bg-[#ed3539]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving && <Loader2 size={14} className="animate-spin" />}

            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
