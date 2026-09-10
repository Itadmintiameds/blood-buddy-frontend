"use client";

import { useState } from "react";
import { LockKeyhole, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";
import { FormInput } from "@/app/components/ui/FormInput";
import { registerSuperAdmin } from "@/services/bloodCenter/superAdmin/superAdminService";
import { getApiErrorMessage } from "@/utils/api";

export function SuperAdminRegistrationScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const submit = async () => {
    if (loading) {
      return;
    }

    setError("");

    const cleanName = name.trim();

    const cleanEmail = email.trim();

    const cleanPhone = phoneNumber.trim();

    if (!cleanName) {
      setError("Enter your name.");
      return;
    }

    if (!cleanEmail) {
      setError("Enter your email address.");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (/\s/.test(password)) {
      setError("Password cannot contain spaces.");
      return;
    }

    if (password !== retypePassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerSuperAdmin({
        name: cleanName,
        email: cleanEmail,
        phoneNumber: cleanPhone,
        password,
        retypePassword,
        role: "SUPERADMIN",
      });

      console.log("Super Admin Registration Response:", response);

      router.replace("/blood-centre/login");
    } catch (error) {
      console.error("Super Admin Registration Error:", error);

      setError(getApiErrorMessage(error, "Super Admin registration failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell>
      <BrandHeader />

      <section
        className="
          flex
          min-h-[600px]
          flex-col
          items-center
          bg-white
          px-5
          pb-10
          pt-10
        "
      >
        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[var(--color-icon-bg-soft)]
            shadow-sm
          "
        >
          <ShieldCheck
            size={26}
            strokeWidth={1.5}
            className="text-[var(--color-primary)]"
          />
        </div>

        <h1
          className="
            mt-4
            text-[20px]
            font-semibold
            text-[var(--color-text-primary)]
          "
        >
          Super Admin Registration
        </h1>

        <p
          className="
            mt-1.5
            text-center
            text-[13px]
            text-[var(--color-text-tertiary)]
          "
        >
          Create your Super Admin account
        </p>

        <div
          className="
            mt-8
            w-full
            max-w-[360px]
          "
        >
          <div className="mb-3">
            <FormInput
              id="superAdminName"
              name="name"
              icon={User}
              label="Name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);

                if (error) {
                  setError("");
                }
              }}
            />
          </div>

          <div className="mb-3">
            <FormInput
              id="superAdminEmail"
              name="email"
              icon={Mail}
              label="Email"
              type="email"
              inputMode="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);

                if (error) {
                  setError("");
                }
              }}
            />
          </div>

          <div className="mb-3">
            <FormInput
              id="superAdminPhone"
              name="phoneNumber"
              icon={Phone}
              label="Phone Number"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(event) => {
                const value = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);

                setPhoneNumber(value);

                if (error) {
                  setError("");
                }
              }}
            />
          </div>

          <div className="mb-3">
            <FormInput
              id="superAdminPassword"
              name="password"
              icon={LockKeyhole}
              label="Password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);

                if (error) {
                  setError("");
                }
              }}
            />
          </div>

          <div className="mb-3">
            <FormInput
              id="superAdminRetypePassword"
              name="retypePassword"
              icon={LockKeyhole}
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm password"
              value={retypePassword}
              onChange={(event) => {
                setRetypePassword(event.target.value);

                if (error) {
                  setError("");
                }
              }}
            />
          </div>

          <div
            className="
              mb-4
              flex
              h-11
              items-center
              rounded-lg
              border
              border-[var(--color-border)]
              bg-[var(--color-surface-alt)]
              px-3.5
            "
          >
            <ShieldCheck
              size={18}
              strokeWidth={1.5}
              className="
                mr-3
                shrink-0
                text-[var(--color-icon-accent)]
              "
            />

            <span
              className="
                text-[13px]
                text-[var(--color-text-placeholder-alt)]
              "
            >
              Role: Super Admin
            </span>
          </div>

          {error && (
            <p
              role="alert"
              className="
                mb-3
                px-1
                text-[12px]
                leading-4
                text-red-500
              "
            >
              {error}
            </p>
          )}

          <AppButton type="button" loading={loading} onClick={submit}>
            Register
          </AppButton>

          <button
            type="button"
            onClick={() => router.replace("/blood-centre/login")}
            className="
              mt-4
              w-full
              text-center
              text-[13px]
              text-[var(--color-primary)]
              transition
              hover:underline
            "
          >
            Back to Login
          </button>
        </div>
      </section>
    </ScreenShell>
  );
}
