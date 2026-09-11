"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ChevronDown, Droplets, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";
import { saveAvailability } from "@/services/bloodCenter/bloodCenter.service";
import {
  getBloodComponents,
  getBloodGroups,
} from "@/services/master/masterService";
import { getApiErrorMessage } from "@/services/api/client";
import type {
  MasterBloodComponent,
  MasterBloodGroup,
} from "@/types/master.types";

export function AddAvailabilityScreen() {
  const router = useRouter();

  const [bloodGroups, setBloodGroups] = useState<MasterBloodGroup[]>([]);
  const [bloodComponents, setBloodComponents] = useState<
    MasterBloodComponent[]
  >([]);
  const [mastersLoading, setMastersLoading] = useState(true);
  const [mastersError, setMastersError] = useState("");

  const [bloodGroupId, setBloodGroupId] = useState<number | "">("");
  const [bloodComponentId, setBloodComponentId] = useState<number | "">("");
  const [units, setUnits] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMasters() {
      setMastersLoading(true);
      setMastersError("");

      try {
        const [groups, components] = await Promise.all([
          getBloodGroups(),
          getBloodComponents(),
        ]);

        if (!cancelled) {
          setBloodGroups(groups);
          setBloodComponents(components);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setMastersError(
            getApiErrorMessage(
              fetchError,
              "Unable to load blood group / component options.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setMastersLoading(false);
        }
      }
    }

    void loadMasters();

    return () => {
      cancelled = true;
    };
  }, []);

  const clearError = () => {
    if (error) {
      setError("");
    }
  };

  const submit = async () => {
    //  Blood Group validation
    if (!bloodGroupId) {
      setError("Select a blood group");
      return;
    }

    //  Blood Type validation
    if (!bloodComponentId) {
      setError("Select a blood type");
      return;
    }

    //  Units validation
    if (!units.trim()) {
      setError("Enter available units");
      return;
    }

    const count = Number(units);

    if (!Number.isInteger(count)) {
      setError("Enter a valid number of units");
      return;
    }

    if (count < 1 || count > 9999) {
      setError("Enter units between 1 and 9999");
      return;
    }

    setError("");
    setLoading(true);

    try {
      //  API REQUEST
      await saveAvailability({
        bloodGroupId,
        bloodComponentId,
        units: count,
      });

      setShowSuccess(true);
    } catch (error) {
      console.error("Save availability error:", error);

      setError(
        getApiErrorMessage(
          error,
          "Unable to save blood availability. Please try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  //  SUCCESS → AVAILABILITY PAGE
  const handleSuccess = () => {
    setShowSuccess(false);

    router.push("/blood-centre/dashboard");
  };

  return (
    <>
      <ScreenShell>
        <BrandHeader
          title="Add Blood Availability"
          showBackButton
          backHref="/blood-centre/dashboard"
        />

        <main className="w-full bg-[var(--color-surface-alt)] md:bg-[var(--color-surface-alt)]">
          <section
            className="
              mx-auto
              min-h-[calc(100vh-100px)]
              w-full
              px-4
              pb-8
              pt-5
              sm:px-6
              sm:pt-8
              md:flex
              md:justify-center
              md:px-8
              md:pt-10
              lg:px-10
              lg:pt-12
            "
          >
            <div
              className="
                w-full
                md:max-w-[560px]
                lg:max-w-[620px]
              "
            >
              <div
                className="
                  rounded-2xl
                  border
                  border-[var(--color-border-lighter)]
                  bg-white
                  px-4
                  py-6
                  shadow-[0_2px_12px_rgba(0,0,0,0.04)]
                  sm:px-6
                  sm:py-7
                  md:px-8
                  md:py-8
                  md:shadow-[0_4px_20px_rgba(0,0,0,0.05)]
                  lg:px-10
                  lg:py-9
                "
              >
                <div className="mb-7 md:mb-9">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[var(--color-icon-bg-soft)]
                      "
                    >
                      <Droplets
                        size={22}
                        strokeWidth={1.8}
                        className="text-[var(--color-primary)]"
                      />
                    </div>

                    <div>
                      <h1
                        className="
                          text-[18px]
                          font-semibold
                          leading-6
                          text-[var(--color-text-primary)]
                          md:text-[20px]
                        "
                      >
                        Blood Availability
                      </h1>

                      <p
                        className="
                          mt-1
                          text-[12px]
                          leading-4
                          text-[var(--color-text-tertiary)]
                          md:text-[13px]
                        "
                      >
                        Add the currently available blood units.
                      </p>
                    </div>
                  </div>
                </div>

                {mastersError && (
                  <p
                    role="alert"
                    className="
                      mb-4
                      text-[12px]
                      leading-4
                      text-red-500
                    "
                  >
                    {mastersError}
                  </p>
                )}

                <div className="w-full">
                  <label
                    htmlFor="bloodGroup"
                    className="
                      block
                      text-[13px]
                      font-medium
                      text-[var(--color-text-body)]
                    "
                  >
                    Blood Group
                  </label>

                  <div className="relative mt-2">
                    <Droplets
                      size={17}
                      strokeWidth={1.7}
                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        z-10
                        -translate-y-1/2
                        text-[var(--color-icon-accent)]
                      "
                    />

                    <select
                      id="bloodGroup"
                      value={bloodGroupId}
                      disabled={mastersLoading}
                      onChange={(event) => {
                        setBloodGroupId(
                          event.target.value ? Number(event.target.value) : "",
                        );
                        clearError();
                      }}
                      className={`
                        h-11
                        w-full
                        appearance-none
                        rounded-lg
                        border
                        bg-white
                        pl-10
                        pr-10
                        text-[14px]
                        outline-none
                        transition-all
                        duration-200

                        ${
                          error && !bloodGroupId
                            ? "border-red-400"
                            : "border-[var(--color-border)] hover:border-[#c7c7c7]"
                        }

                        focus:border-[var(--color-primary)]
                        focus:ring-2
                        focus:ring-[var(--color-primary)]/20

                        ${bloodGroupId ? "text-[var(--color-text-body)]" : "text-[var(--color-text-placeholder-alt)]"}
                      `}
                    >
                      <option value="">
                        {mastersLoading ? "Loading..." : "Select Blood Group"}
                      </option>

                      {bloodGroups.map((group) => (
                        <option
                          key={group.bloodGroupId}
                          value={group.bloodGroupId}
                        >
                          {group.bloodGroupName}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={17}
                      strokeWidth={1.8}
                      className="
                        pointer-events-none
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-[var(--color-text-quaternary)]
                      "
                    />
                  </div>
                </div>

                <div className="mt-5 w-full">
                  <label
                    htmlFor="bloodType"
                    className="
                      block
                      text-[13px]
                      font-medium
                      text-[var(--color-text-body)]
                    "
                  >
                    Blood Type
                  </label>

                  <div className="relative mt-2">
                    <Droplets
                      size={17}
                      strokeWidth={1.7}
                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        z-10
                        -translate-y-1/2
                        text-[var(--color-icon-accent)]
                      "
                    />

                    <select
                      id="bloodType"
                      value={bloodComponentId}
                      disabled={mastersLoading}
                      onChange={(event) => {
                        setBloodComponentId(
                          event.target.value ? Number(event.target.value) : "",
                        );

                        clearError();
                      }}
                      className={`
                        h-11
                        w-full
                        appearance-none
                        rounded-lg
                        border
                        bg-white
                        pl-10
                        pr-10
                        text-[14px]
                        outline-none
                        transition-all
                        duration-200

                        ${
                          error && !bloodComponentId
                            ? "border-red-400"
                            : "border-[var(--color-border)] hover:border-[#c7c7c7]"
                        }

                        focus:border-[var(--color-primary)]
                        focus:ring-2
                        focus:ring-[var(--color-primary)]/20

                        ${bloodComponentId ? "text-[var(--color-text-body)]" : "text-[var(--color-text-placeholder-alt)]"}
                      `}
                    >
                      <option value="">
                        {mastersLoading ? "Loading..." : "Select Blood Type"}
                      </option>

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
                      size={17}
                      strokeWidth={1.8}
                      className="
                        pointer-events-none
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        text-[var(--color-text-quaternary)]
                      "
                    />
                  </div>
                </div>

                <div className="mt-5 w-full">
                  <label
                    htmlFor="units"
                    className="
                      block
                      text-[13px]
                      font-medium
                      text-[var(--color-text-body)]
                    "
                  >
                    Units Available
                  </label>

                  <div className="relative mt-2">
                    <Package
                      size={17}
                      strokeWidth={1.7}
                      className="
                        pointer-events-none
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-[var(--color-icon-accent)]
                      "
                    />

                    <input
                      id="units"
                      type="text"
                      value={units}
                      onChange={(event) => {
                        const value = event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4);

                        setUnits(value);

                        clearError();
                      }}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      placeholder="Enter units"
                      autoComplete="off"
                      className="
                        h-11
                        w-full
                        rounded-lg
                        border
                        border-[var(--color-border)]
                        bg-white
                        pl-10
                        pr-3
                        text-[14px]
                        text-[var(--color-text-body)]
                        outline-none
                        transition-all
                        duration-200
                        placeholder:text-[var(--color-text-placeholder)]
                        hover:border-[#c7c7c7]
                        focus:border-[var(--color-primary)]
                        focus:ring-2
                        focus:ring-[var(--color-primary)]/20
                      "
                    />
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="
                      mt-2
                      text-[12px]
                      leading-4
                      text-red-500
                    "
                  >
                    {error}
                  </p>
                )}

                <div
                  className="
                    mt-8
                    flex
                    w-full
                    justify-center
                    md:mt-10
                  "
                >
                  <div
                    className="
                      w-full
                      md:max-w-[300px]
                    "
                  >
                    <AppButton type="button" loading={loading} onClick={submit}>
                      Save Availability
                    </AppButton>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </ScreenShell>

      {showSuccess && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/40
            px-5
            backdrop-blur-[2px]
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="availability-success-title"
        >
          <div
            className="
              animate-modalFadeSlide
              max-h-[90vh]
              w-full
              max-w-[340px]
              overflow-y-auto
              rounded-2xl
              bg-white
              px-5
              py-7
              text-center
              shadow-[0_25px_70px_rgba(0,0,0,0.2)]
              sm:max-w-[380px]
              sm:px-7
            "
          >
            <div className="mb-4 flex justify-center">
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--color-success-bg)]
                "
              >
                <CheckCircle2
                  size={30}
                  strokeWidth={2}
                  className="text-[var(--color-success)]"
                />
              </div>
            </div>

            <h2
              id="availability-success-title"
              className="
                text-[18px]
                font-semibold
                leading-6
                text-[var(--color-text-primary)]
              "
            >
              Availability Saved
            </h2>

            <p
              className="
                mt-2
                text-[13px]
                leading-5
                text-[var(--color-text-muted)]
              "
            >
              Blood availability has been added successfully.
            </p>

            <button
              type="button"
              onClick={handleSuccess}
              className="
                mt-6
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
                hover:bg-[var(--color-primary-hover-alt)]
                active:scale-[0.98]
                focus:outline-none
                focus:ring-2
                focus:ring-[var(--color-primary)]
                focus:ring-offset-2
              "
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}
