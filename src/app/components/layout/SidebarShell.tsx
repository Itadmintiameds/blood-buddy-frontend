"use client";

import Image from "next/image";
import { useEffect, type ComponentType, type ReactNode } from "react";
import { X } from "lucide-react";

import { PoweredBy } from "@/app/components/common/PoweredBy";
import { useBilingualText } from "@/app/components/common/Bilingual";

interface SidebarShellProps {
  open: boolean;
  onClose: () => void;
  /** Small caption above the name in the drawer's header, e.g. "Super Admin". */
  roleLabel: ReactNode;
  /** Signed-in account name shown in the drawer's header (phones only). */
  userName?: string | null;
  /** Pinned to the bottom of the sidebar -- logout, usually. */
  footer: ReactNode;
  children: ReactNode;
}

// Left navigation shared by the Blood Centre and Super Admin areas.
//   - lg and up: a persistent rail pinned under the 76px brand header.
//   - below lg:  an off-canvas drawer with a branded header (logo, role, name),
//     a dimmed backdrop, scroll lock, Esc to close and a footer that holds the
//     logout control and the "Powered by" mark.
export function SidebarShell({
  open,
  onClose,
  roleLabel,
  userName,
  footer,
  children,
}: SidebarShellProps) {
  const closeMenuLabel = useBilingualText("accessibility.closeMenu");
  const closeNavigationLabel = useBilingualText("accessibility.closeNavigation");

  // While the drawer covers a phone screen, the page behind it must not scroll.
  useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 1023px)").matches) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <>
      {/* BACKDROP — always mounted so it can fade; inert while closed */}
      <button
        type="button"
        aria-label={closeNavigationLabel}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-[min(86vw,320px)] flex-col overflow-hidden border-r border-[var(--color-border-lighter)] bg-white shadow-[8px_0_40px_rgba(0,0,0,0.18)] transition-[transform,visibility] duration-300 [transition-timing-function:var(--ease-spring)] lg:top-[76px] lg:z-30 lg:h-[calc(100dvh-76px)] lg:w-[260px] lg:translate-x-0 lg:shadow-none ${
          open ? "translate-x-0" : "max-lg:invisible -translate-x-full"
        }`}
      >
        {/* Drawer header — phones only; the brand bar covers this on desktop */}
        <div className="relative shrink-0 overflow-hidden bg-[var(--color-primary)] px-5 pb-6 pt-5 text-white lg:hidden">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full bg-white/10"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 right-10 size-28 rounded-full bg-white/[0.07]"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label={closeMenuLabel}
            className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <X size={20} />
          </button>

          <div className="relative flex items-center gap-3.5 pr-10">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-icon-bg-soft-2)] shadow-[0_4px_14px_rgba(0,0,0,0.15)]">
              <Image
                src="/images/blood-buddy-logo.png"
                alt="Blood Buddy"
                width={1112}
                height={1650}
                className="h-[42px] w-auto object-contain"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/75">
                {roleLabel}
              </p>
              <p className="mt-0.5 break-words text-[16px] font-semibold leading-5">
                {userName || "Blood Buddy"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4 lg:py-0 lg:pt-7">
          {children}
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t border-[var(--color-border-lighter)] bg-white p-4">
          {footer}

          <div className="mt-3 flex justify-center lg:hidden">
            <PoweredBy />
          </div>
        </div>
      </aside>
    </>
  );
}

// One row of the sidebar navigation, styled identically in both areas.
export function SidebarNavItemContent({
  active,
  icon: Icon,
  label,
  sub,
  trailing,
}: {
  active: boolean;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  label: ReactNode;
  sub: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <>
      <span
        className={`mr-3 flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors lg:size-9 lg:rounded-lg ${
          active
            ? "bg-white/20 text-white"
            : "bg-[var(--color-icon-bg-soft)] text-[var(--color-primary)] lg:bg-[var(--color-surface-alt)] lg:text-[var(--color-text-tertiary)] lg:group-hover:text-[var(--color-text-secondary)]"
        }`}
      >
        <Icon size={18} strokeWidth={active ? 2.1 : 1.8} />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[14px] lg:text-[13px] ${
            active ? "font-semibold" : "font-medium"
          }`}
        >
          {label}
        </span>
        <span
          className={`block truncate text-[11px] lg:text-[10px] ${
            active ? "text-white/75" : "text-[var(--color-text-placeholder-alt)]"
          }`}
        >
          {sub}
        </span>
      </span>

      {trailing}
    </>
  );
}

// Shared class string for the nav row container (link or button).
export function sidebarNavItemClass(active: boolean) {
  return `group flex min-h-14 w-full items-center rounded-2xl px-3 py-2 text-left transition-all duration-200 lg:min-h-0 lg:rounded-xl lg:py-2.5 ${
    active
      ? "bg-[var(--color-primary)] text-white shadow-[0_6px_16px_rgba(255,59,63,0.28)]"
      : "text-[var(--color-text-quaternary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-body)] active:bg-[var(--color-surface-alt)]"
  }`;
}
