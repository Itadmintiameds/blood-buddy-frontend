"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";
import { SuccessModal } from "@/app/components/ui/SuccessModal";
import {
  getDonorAvailability,
  getDonorSession,
  saveDonorAvailability,
} from "@/services/donor/donorSessionStorage";
import type { DonorAvailabilityStatus } from "@/types/donor/donorTypes";

export function UpdateDonorAvailabilityScreen() {
  const router = useRouter();
  const session = getDonorSession();

  const [status, setStatus] = useState<DonorAvailabilityStatus>(
    "AVAILABLE",
  );
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!session) return;
    const saved = getDonorAvailability(session.bloodDonorDetailsId);
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating form state from local storage on mount, not synchronizing with a reactive value
      setStatus(saved.status);
      setNote(saved.note ?? "");
    }
  }, [session]);

  const submit = async () => {
    if (!session) return;

    setLoading(true);

    // STUB — no backend endpoint exists for donor availability yet; saved
    // locally only (see donorSessionStorage.ts).
    await new Promise((resolve) => setTimeout(resolve, 400));

    saveDonorAvailability(session.bloodDonorDetailsId, {
      status,
      note: note.trim() || undefined,
    });

    setLoading(false);
    setShowSuccess(true);
  };

  const handleSuccess = () => {
    setShowSuccess(false);
    router.push("/donor/dashboard");
  };

  return (
    <>
      <ScreenShell>
        <BrandHeader
          title="Update Availability"
          showBackButton
          backHref="/donor/dashboard"
        />

        <main className="w-full bg-[var(--color-surface-alt)]">
          <section className="mx-auto min-h-[calc(100vh-100px)] w-full px-4 pb-8 pt-5 sm:px-6 sm:pt-8 md:flex md:justify-center md:px-8 md:pt-10 lg:px-10 lg:pt-12">
            <div className="w-full md:max-w-[560px] lg:max-w-[620px]">
              <div className="rounded-2xl border border-[var(--color-border-lighter)] bg-white px-4 py-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:px-6 sm:py-7 md:px-8 md:py-8 md:shadow-[0_4px_20px_rgba(0,0,0,0.05)] lg:px-10 lg:py-9">
                <div className="mb-7 md:mb-9">
                  <h1 className="text-[18px] font-semibold leading-6 text-[var(--color-text-primary)] md:text-[20px]">
                    Update Availability
                  </h1>

                  <p className="mt-1 text-[12px] leading-4 text-[var(--color-text-tertiary)] md:text-[13px]">
                    Let recipients know if you&apos;re available to donate blood.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setStatus("AVAILABLE")}
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-xl
                      border
                      px-4
                      py-3.5
                      text-left
                      transition-all
                      duration-200
                      ${
                        status === "AVAILABLE"
                          ? "border-[var(--color-success)] bg-[var(--color-success-bg)]"
                          : "border-[var(--color-border)] bg-white hover:border-[#c7c7c7]"
                      }
                    `}
                  >
                    <span className="text-[14px] font-medium text-[var(--color-text-body)]">
                      Available to Donate
                    </span>

                    {status === "AVAILABLE" && (
                      <CheckCircle2
                        size={19}
                        strokeWidth={2}
                        className="text-[var(--color-success)]"
                      />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("NOT_AVAILABLE")}
                    className={`
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-xl
                      border
                      px-4
                      py-3.5
                      text-left
                      transition-all
                      duration-200
                      ${
                        status === "NOT_AVAILABLE"
                          ? "border-[var(--color-primary)] bg-[var(--color-icon-bg-soft)]"
                          : "border-[var(--color-border)] bg-white hover:border-[#c7c7c7]"
                      }
                    `}
                  >
                    <span className="text-[14px] font-medium text-[var(--color-text-body)]">
                      Not Available
                    </span>

                    {status === "NOT_AVAILABLE" && (
                      <CheckCircle2
                        size={19}
                        strokeWidth={2}
                        className="text-[var(--color-primary)]"
                      />
                    )}
                  </button>
                </div>

                <div className="mt-5 w-full">
                  <label
                    htmlFor="note"
                    className="block text-[13px] font-medium text-[var(--color-text-body)]"
                  >
                    Additional Note (Optional)
                  </label>

                  <textarea
                    id="note"
                    value={note}
                    onChange={(event) => setNote(event.target.value.slice(0, 200))}
                    placeholder="Enter note (if any)"
                    rows={4}
                    maxLength={200}
                    className="
                      mt-2
                      w-full
                      resize-none
                      rounded-lg
                      border
                      border-[var(--color-border)]
                      bg-white
                      px-3.5
                      py-3
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

                <div className="mt-8 flex w-full justify-center md:mt-10">
                  <div className="w-full md:max-w-[300px]">
                    <AppButton type="button" loading={loading} onClick={submit}>
                      Update Status
                    </AppButton>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </ScreenShell>

      <SuccessModal
        open={showSuccess}
        title="Availability Updated"
        description="Your donation availability status has been updated successfully."
        onConfirm={handleSuccess}
      />
    </>
  );
}
