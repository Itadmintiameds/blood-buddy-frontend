"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { ScreenShell } from "@/app/components/ui/ScreenShell";
import { AppButton } from "@/app/components/ui/AppButton";
import { FormInput } from "@/app/components/ui/FormInput";
import { getSuperAdminSession, logout } from "@/services/auth/authStorage";
import { loginCommon } from "@/services/bloodCenter/commonLoginService";
import {
  Bilingual,
  BilingualInline,
  useBilingualText,
} from "@/app/components/common/Bilingual";

export function SuperAdminLoginScreen() {
  const router = useRouter();
  const emailPlaceholder = useBilingualText("common.enterEmail");
  const passwordPlaceholder = useBilingualText("common.enterPassword");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getSuperAdminSession();

    if (session) {
      router.replace("/super-admin/dashboard");
    }
  }, [router]);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async () => {
    if (loading) return;

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Enter your email address.");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Enter your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const result = await loginCommon(cleanEmail, password);

      if (result.userType !== "SUPER_ADMIN") {
        logout();

        throw new Error("This login is for Super Admin accounts only.");
      }

      router.replace("/super-admin/dashboard");
    } catch (loginError) {
      console.error("Super Admin Login Error:", loginError);

      setError(
        loginError instanceof Error
          ? loginError.message
          : "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <ScreenShell>
      <BrandHeader />

      <section className="flex min-h-[620px] flex-col items-center bg-white px-5 pt-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-icon-bg-soft)] shadow-sm">
          <ShieldIcon />
        </div>

        <Bilingual
          tKey="superAdmin.loginTitle"
          as="h2"
          className="mt-3 text-[17px] font-medium text-[var(--color-text-primary)]"
        />

        <div className="mt-8 w-full max-w-[360px]">
          <div className="mb-2.5">
            <FormInput
              id="superAdminEmail"
              name="email"
              icon={Mail}
              label={<Bilingual tKey="common.email" as="span" />}
              required
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={emailPlaceholder}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError("");
              }}
              onKeyDown={handleKeyDown}
            />
          </div>

          <FormInput
            id="superAdminPassword"
            name="password"
            icon={LockKeyhole}
            label={<Bilingual tKey="common.password" as="span" />}
            required
            type="password"
            autoComplete="current-password"
            placeholder={passwordPlaceholder}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError("");
            }}
            onKeyDown={handleKeyDown}
          />

          {error && (
            <p
              role="alert"
              className="mt-2 px-1 text-[12px] leading-4 text-red-500"
            >
              {error}
            </p>
          )}

          <div className="mt-3 text-center text-[13px]">
            <button
              type="button"
              onClick={() => router.push("/welcome")}
              className="px-2 py-2 text-[var(--color-text-secondary)] underline underline-offset-2 hover:text-[var(--color-stat-red)]"
            >
              <BilingualInline tKey="superAdmin.backToWelcome" />
            </button>
          </div>

          <div className="mt-28">
            <AppButton type="button" loading={loading} onClick={handleSubmit}>
              <BilingualInline
                tKey="common.login"
                enClassName="mt-0.5 text-[0.68em] font-normal leading-tight text-white/80"
              />
            </AppButton>
          </div>
        </div>
      </section>
    </ScreenShell>
  );
}

function ShieldIcon() {
  return <ShieldCheckIcon />;
}

function ShieldCheckIcon() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[var(--color-stat-red)]"
      aria-hidden="true"
    >
      <path d="M12 3 5 6v5c0 4.5 2.8 8.2 7 10 4.2-1.8 7-5.5 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
