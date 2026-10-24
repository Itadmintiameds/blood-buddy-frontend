"use client";

import {
  AlertCircle,
  Building2,
  CalendarDays,
  FileCheck2,
  Link2,
  Loader2,
  LocateFixed,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { useEffect, useState } from "react";

import { getApiErrorMessage } from "@/services/api/client";
import {
  getCentreProfile,
  updateCentreProfile,
} from "@/services/bloodCenter/profileService";
import { getAuthSession, saveAuthSession } from "@/services/auth/authStorage";
import {
  BloodCentreEditModal,
  toBloodCentrePayload,
} from "@/app/blood-centre/components/BloodCentreEditModal";
import { HeaderEditButton } from "@/app/components/ui/HeaderEditButton";
import { SuccessModal } from "@/app/components/ui/SuccessModal";
import { Bilingual, BilingualInline } from "@/app/components/common/Bilingual";
import type {
  BloodCentreEditInput,
  BloodCentreProfile,
} from "@/types/bloodCenter/bloodCenterTypes";

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-GB");
}

function toEditForm(profile: BloodCentreProfile): BloodCentreEditInput {
  return {
    bloodCentreName: profile.bloodCentreName ?? "",
    mobileNumber: profile.mobileNumber ?? "",
    address: profile.address ?? "",
    district: profile.district ?? "",
    city: profile.city ?? "",
    pinCode: profile.pincode ?? "",
    latitude: profile.latitude != null ? String(profile.latitude) : "",
    longitude: profile.longitude != null ? String(profile.longitude) : "",
    locationUrl: profile.locationUrl ?? "",
    // Not shown on the centre's own form (licence is superadmin-only).
    licenseNumber: profile.bloodCentreLicenceNumber ?? "",
    dateOfExpiry: profile.licenceExpiryDate ?? "",
  };
}

// The signed-in centre's own details, with an Edit form for the fields a
// centre may change. Licence details are shown read-only — only the superadmin
// can change them.
export function CentreProfileScreen() {
  const [profile, setProfile] = useState<BloodCentreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getCentreProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            getApiErrorMessage(err, "Unable to load your centre details."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const saveProfile = async (values: BloodCentreEditInput) => {
    // Without licence fields — a centre can't change its own licence.
    const updated = await updateCentreProfile(
      toBloodCentrePayload(values, false),
    );

    setProfile(updated);
    setEditOpen(false);
    setSavedOpen(true);

    // Keep the stored session's centre name (shown in the header) in step.
    const session = getAuthSession();
    if (session) {
      saveAuthSession({ ...session, name: updated.bloodCentreName });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--color-border-lighter)] bg-white">
        <Loader2
          size={22}
          className="animate-spin text-[var(--color-primary)]"
        />
        <p className="text-[12px] text-[var(--color-text-tertiary)]">
          Loading centre details…
        </p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div
        role="alert"
        className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-600"
      >
        <AlertCircle size={16} className="shrink-0" />
        <span className="min-w-0">
          {error || "Unable to load your centre details."}
        </span>
      </div>
    );
  }

  // Edit replaces the details card in place, at the same full width.
  if (editOpen) {
    return (
      <BloodCentreEditModal
        inline
        initialValues={toEditForm(profile)}
        email={profile.email}
        includeLicence={false}
        onClose={() => setEditOpen(false)}
        onSubmit={saveProfile}
      />
    );
  }

  // Fields sit in the same grid positions as the Edit form, so switching
  // between the two keeps every value in the same place.
  return (
    <>
      <div className="animate-rise flex w-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border-lighter)] bg-white shadow-[0_4px_18px_rgba(0,0,0,0.025)]">
        {/* View header: a tinted band with the centre's name, so it reads
            differently from the Edit form's plain "Edit Blood Centre" bar. */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-lighter)] bg-gradient-to-r from-[var(--color-icon-bg-soft)] to-white px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] shadow-[0_6px_16px_rgba(255,59,63,0.25)] sm:h-14 sm:w-14">
              <Building2 size={24} className="text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="break-words text-[17px] font-bold leading-6 text-[var(--color-text-primary)] sm:text-[20px]">
                  {profile.bloodCentreName}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    profile.isActive
                      ? "bg-[var(--color-success-bg)] text-[var(--color-success)]"
                      : "bg-[var(--color-surface-alt)] text-[var(--color-text-tertiary)]"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {profile.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 break-all text-[12px] text-[var(--color-text-tertiary)] sm:text-[13px]">
                <Mail size={13} className="shrink-0" />
                {profile.email}
              </p>
            </div>
          </div>

          <HeaderEditButton
            labelKey="superAdmin.editCentre"
            onClick={() => setEditOpen(true)}
          />
        </div>

        <div className="grid grid-cols-1 content-start gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 sm:py-6">
          <ProfileField
            wide
            icon={Building2}
            tKey="bloodCentre.bloodCentreName"
            value={profile.bloodCentreName}
          />
          <ProfileField
            icon={Phone}
            tKey="common.mobileNumber"
            value={profile.mobileNumber}
          />
          <ProfileField
            icon={MapPin}
            tKey="common.pinCode"
            value={profile.pincode}
          />
          <ProfileField
            wide
            icon={MapPin}
            tKey="common.address"
            value={profile.address}
          />
          <ProfileField
            icon={MapPin}
            tKey="common.district"
            value={profile.district}
          />
          <ProfileField icon={MapPin} tKey="common.city" value={profile.city} />
          <ProfileField
            icon={LocateFixed}
            tKey="bloodCentre.latitude"
            value={profile.latitude != null ? String(profile.latitude) : ""}
          />
          <ProfileField
            icon={LocateFixed}
            tKey="bloodCentre.longitude"
            value={profile.longitude != null ? String(profile.longitude) : ""}
          />
          <ProfileField
            wide
            icon={Link2}
            tKey="bloodCentre.locationUrl"
            value={profile.locationUrl}
            href={profile.locationUrl || undefined}
          />
          <ProfileField
            icon={FileCheck2}
            tKey="bloodCentre.licenseNumber"
            value={profile.bloodCentreLicenceNumber}
          />
          <ProfileField
            icon={CalendarDays}
            tKey="bloodCentre.dateOfExpiry"
            value={formatDate(profile.licenceExpiryDate)}
          />

          <p className="text-[11px] text-[var(--color-text-placeholder)] sm:col-span-2">
            Licence details can only be changed by the BloodBuddy admin.
          </p>
        </div>
      </div>

      <SuccessModal
        open={savedOpen}
        title={<BilingualInline tKey="superAdmin.centreUpdatedSuccess" />}
        onConfirm={() => setSavedOpen(false)}
      />
    </>
  );
}

// A read-only detail tile, placed where the matching input sits in the Edit
// form but styled as information rather than an input box.
function ProfileField({
  icon: Icon,
  tKey,
  value,
  href,
  wide = false,
}: {
  icon: typeof MapPin;
  tKey: string;
  value: string | null | undefined;
  href?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-3 rounded-xl border border-[var(--color-border-lighter)] bg-[var(--color-surface-alt)]/60 px-3.5 py-3 ${
        wide ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--color-primary)] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <Icon size={17} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-placeholder)]">
          <Bilingual tKey={tKey} as="span" />
        </p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 block truncate text-[14px] font-semibold text-[var(--color-primary)] hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="mt-0.5 break-words text-[14px] font-semibold text-[var(--color-text-body)]">
            {value || "—"}
          </p>
        )}
      </div>
    </div>
  );
}
