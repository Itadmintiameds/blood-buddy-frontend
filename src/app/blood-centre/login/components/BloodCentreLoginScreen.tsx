"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";
import { FormInput } from "@/app/components/ui/FormInput";
import { getBloodCentreSession, logout } from "@/services/auth/authStorage";
import { loginCommon } from "@/services/bloodCenter/commonLoginService";
import { RegistrationTypeModal } from "./RegistrationTypeModal";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";

export function BloodCentreLoginScreen() {
  const router = useRouter();
  const emailPlaceholder = useBilingualText("common.enterEmail");
  const passwordPlaceholder = useBilingualText("common.enterPassword");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);

  // Only skip the form for an existing BLOOD_CENTRE session. A Super Admin
  // session logged in elsewhere (another tab, earlier browsing) must NOT
  // bounce this page away — Blood Centre and Super Admin are separate
  // areas, and visiting this page should always show the Blood Centre
  // login form regardless of what's signed in on the Super Admin side.
  useEffect(() => {
    if (getBloodCentreSession()) {
      router.replace("/blood-centre/dashboard");
    }
  }, [router]);

  //  Email validation
  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  // Login
  const submit = async () => {
    if (loading) {
      return;
    }

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Enter your email address");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError("Enter a valid email address");
      return;
    }

    if (!password) {
      setError("Enter your password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const result = await loginCommon(cleanEmail, password);

      // This page is for Blood Centre accounts only. loginCommon() saves the
      // session before we get a chance to validate the role, so a rejected
      // (e.g. Super Admin) login must clear that session again — otherwise
      // the account would end up silently signed in with elevated access.
      if (result.userType !== "BLOOD_CENTRE") {
        logout();

        throw new Error("This login is for Blood Centre accounts only.");
      }

      router.replace("/blood-centre/dashboard");
    } catch (error) {
      console.error("Common Login Error:", error);

      setError(
        error instanceof Error ? error.message : "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (error) {
      setError("");
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (error) {
      setError("");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      void submit();
    }
  };

  const openRegistrationModal = () => {
    setRegistrationModalOpen(true);
  };

  const closeRegistrationModal = () => {
    setRegistrationModalOpen(false);
  };

  const handleSuperAdminRegistration = () => {
    setRegistrationModalOpen(false);

    router.push("/super-admin/register");
  };

  const handleBloodCentreRegistration = () => {
    setRegistrationModalOpen(false);

    router.push("/blood-centre/register");
  };

  return (
    <ScreenShell>
      <BrandHeader />

      <section
        className="
          flex
          min-h-[510px]
          flex-col
          items-center
          bg-white
          px-5
          pb-10
          pt-12
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
          <Mail
            size={26}
            strokeWidth={1.5}
            className="text-[var(--color-primary)]"
          />
        </div>

        <Bilingual
          tKey="common.login"
          as="h2"
          className="
            mt-4
            text-[20px]
            font-semibold
            tracking-[-0.01em]
            text-[var(--color-text-primary)]
          "
        />

        <div
          className="
            mt-8
            w-full
            max-w-[360px]
          "
        >
          <div className="mb-2.5">
            <FormInput
              id="loginEmail"
              name="email"
              icon={Mail}
              label={<Bilingual tKey="common.email" as="span" />}
              required
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={emailPlaceholder}
              value={email}
              onChange={(event) => handleEmailChange(event.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <FormInput
            id="loginPassword"
            name="password"
            icon={LockKeyhole}
            label={<Bilingual tKey="common.password" as="span" />}
            required
            type="password"
            autoComplete="current-password"
            placeholder={passwordPlaceholder}
            value={password}
            onChange={(event) => handlePasswordChange(event.target.value)}
            onKeyDown={handleKeyDown}
          />

          {error && (
            <p
              role="alert"
              className="
                mt-2
                px-1
                text-[12px]
                leading-4
                text-red-500
              "
            >
              {error}
            </p>
          )}

          <div className="mt-8">
            <AppButton type="button" loading={loading} onClick={submit}>
              <BilingualInline
                tKey="common.login"
                enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
              />
            </AppButton>
          </div>

          <div
            className="
              mt-5
              text-center
              text-[13px]
              text-[var(--color-text-secondary)]
            "
          >
            <BilingualInline tKey="bloodCentre.noAccount" />{" "}
            <button
              type="button"
              onClick={handleBloodCentreRegistration}
              className="
                -my-2
                px-1
                py-2
                font-medium
                text-[var(--color-primary)]
                underline-offset-2
                transition
                hover:underline
              "
            >
              <BilingualInline tKey="common.registerNow" />
            </button>
          </div>

          <div
            className="
              mt-2.5
              text-center
              text-[13px]
            "
          >
            <Link
              href="/blood-centre/forgot-password"
              className="
                text-[var(--color-text-secondary)]
                underline
                underline-offset-2
                transition
                hover:text-[var(--color-primary)]
              "
            >
              <BilingualInline tKey="bloodCentre.forgotPassword" />
            </Link>
          </div>

          <div
            className="
              mt-2.5
              text-center
              text-[13px]
            "
          >
            <Link
              href="/welcome"
              className="
                text-[var(--color-primary)]
                transition
                hover:underline
              "
              style={{
                color: "#FF3B3B",
                textDecorationColor: "#FF3B3B",
              }}
            >
              <BilingualInline
                tKey="common.returnToWelcome"
                enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-[#FF3B3B]/70"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* <RegistrationTypeModal
        open={registrationModalOpen}
        onClose={closeRegistrationModal}
        onSuperAdmin={handleSuperAdminRegistration}
        onBloodCentre={handleBloodCentreRegistration}
      /> */}
    </ScreenShell>
  );
}
