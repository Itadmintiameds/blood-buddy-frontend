"use client";

import Image from "next/image";
import {
  Building2,
  ChevronRight,
  HeartPulse,
  Menu,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useRef, useState, type PointerEvent } from "react";
import { DonorManagement } from "./DonorManagement";
import { RecipientManagement } from "./RecipientManagement";
import BloodBankManagement from "./BloodBankManagement";
import { BrandHeader } from "@/app/components/layout/BrandHeader";
import { SuperAdminLogoutButton } from "./SuperAdminLogoutButton";
import { useExitTransition } from "@/app/hooks/useExitTransition";

type ActiveSection = "blood-bank" | "donor" | "recipient";

interface NavigationItem {
  id: ActiveSection;
  label: string;
  icon: typeof Building2;
}

const SIDEBAR_WIDTH = 270;
const DRAG_THRESHOLD = 10;
const CLOSE_DISTANCE_RATIO = 0.4;
const CLOSE_VELOCITY = 0.3; // px/ms

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  determined: boolean;
  isDrag: boolean;
  samples: Array<{ x: number; t: number }>;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function isDesktopViewport() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(min-width: 1024px)").matches
  );
}

// Soft resistance past a boundary instead of a hard stop -- the further
// past, the less it follows (skill: rubber-banding).
function rubberband(overshoot: number, dimension: number, constant = 0.55) {
  return (
    (overshoot * dimension * constant) /
    (dimension + constant * Math.abs(overshoot))
  );
}

const navigationItems: NavigationItem[] = [
  {
    id: "blood-bank",
    label: "Blood Bank",
    icon: Building2,
  },
  {
    id: "donor",
    label: "Donor",
    icon: Users,
  },
  {
    id: "recipient",
    label: "Recipient",
    icon: UserRound,
  },
];

export function SuperAdminDashboard() {
  const [activeSection, setActiveSection] =
    useState<ActiveSection>("blood-bank");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const asideRef = useRef<HTMLElement | null>(null);
  const scrimRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const { rendered: overlayRendered, visible: overlayVisible } =
    useExitTransition(mobileMenuOpen, 300);

  const handleSectionChange = (section: ActiveSection) => {
    setActiveSection(section);
    setMobileMenuOpen(false);
  };

  const clearInlineDragStyles = () => {
    const aside = asideRef.current;
    const scrim = scrimRef.current;

    if (aside) {
      aside.style.transition = "";
      aside.style.transform = "";
    }

    if (scrim) {
      scrim.style.transition = "";
      scrim.style.opacity = "";
    }
  };

  const applyDragTransform = (x: number) => {
    const aside = asideRef.current;
    const scrim = scrimRef.current;

    if (aside) {
      aside.style.transition = "none";
      aside.style.transform = `translateX(${x}px)`;
    }

    if (scrim) {
      const progress = Math.min(1, Math.max(0, 1 + x / SIDEBAR_WIDTH));

      scrim.style.transition = "none";
      scrim.style.opacity = String(progress);
    }
  };

  const settleTo = (open: boolean, velocity: number, currentX: number) => {
    const aside = asideRef.current;
    const scrim = scrimRef.current;
    const current = currentX;
    const target = open ? 0 : -SIDEBAR_WIDTH;
    const distance = Math.abs(target - current);
    const reduced = prefersReducedMotion();
    const durationMs = reduced
      ? 0
      : Math.min(
          320,
          Math.max(120, distance / Math.max(Math.abs(velocity), 0.3)),
        );

    if (aside) {
      aside.style.transition = reduced
        ? "none"
        : `transform ${durationMs}ms var(--ease-spring)`;
      aside.style.transform = `translateX(${target}px)`;
    }

    if (scrim) {
      scrim.style.transition = reduced
        ? "none"
        : `opacity ${durationMs}ms linear`;
      scrim.style.opacity = open ? "1" : "0";
    }

    window.setTimeout(() => {
      clearInlineDragStyles();
      setMobileMenuOpen(open);
    }, durationMs);
  };

  const handleSidebarPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!mobileMenuOpen || isDesktopViewport()) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: 0,
      determined: false,
      isDrag: false,
      samples: [{ x: event.clientX, t: event.timeStamp }],
    };
  };

  const handleSidebarPointerMove = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;

    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (!drag.determined) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
        return;
      }

      drag.determined = true;
      drag.isDrag = Math.abs(dx) > Math.abs(dy);

      if (drag.isDrag) {
        try {
          (event.target as Element).setPointerCapture(event.pointerId);
        } catch {
          // Pointer capture is best-effort -- if the browser has already
          // lost track of this pointer, dragging still works via normal
          // event bubbling, just without capture outside the element.
        }
      }
    }

    if (!drag.isDrag) {
      return;
    }

    event.preventDefault();

    drag.samples.push({ x: event.clientX, t: event.timeStamp });

    if (drag.samples?.length > 5) {
      drag.samples.shift();
    }

    let x = dx;

    if (x > 0) {
      x = rubberband(x, SIDEBAR_WIDTH);
    } else if (x < -SIDEBAR_WIDTH) {
      x = -SIDEBAR_WIDTH + rubberband(x + SIDEBAR_WIDTH, SIDEBAR_WIDTH);
    }

    drag.lastX = x;
    applyDragTransform(x);
  };

  const handleSidebarPointerEnd = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;

    if (!drag || event.pointerId !== drag.pointerId) {
      return;
    }

    dragRef.current = null;

    if (!drag.isDrag) {
      return;
    }

    const first = drag.samples[0];
    const last = drag.samples[drag.samples.length - 1];
    const dt = Math.max(1, last.t - first.t);
    const velocity = (last.x - first.x) / dt;

    const shouldClose =
      drag.lastX < -SIDEBAR_WIDTH * CLOSE_DISTANCE_RATIO ||
      velocity < -CLOSE_VELOCITY;

    settleTo(!shouldClose, velocity, drag.lastX);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "donor":
        return <DonorManagement />;

      case "recipient":
        return <RecipientManagement />;

      case "blood-bank":
      default:
        return <BloodBankManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]">
      {/* Mobile Overlay */}
      {overlayRendered && (
        <button
          ref={scrimRef}
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
          className={`
            motion-scrim
            fixed
            inset-0
            z-40
            bg-black/35
            backdrop-blur-md
            transition-opacity
            duration-300
            lg:hidden
            ${overlayVisible ? "opacity-100" : "opacity-0"}
          `}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={asideRef}
        style={{ touchAction: "pan-y" }}
        onPointerDown={handleSidebarPointerDown}
        onPointerMove={handleSidebarPointerMove}
        onPointerUp={handleSidebarPointerEnd}
        onPointerCancel={handleSidebarPointerEnd}
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col
          border-r border-[var(--color-border-lighter)] bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="relative flex h-[100px] items-center justify-center border-b border-[var(--color-border-lighter)] px-5">
          <div className="relative h-14 w-[160px]">
            <Image
              src="/images/tiameds-logo.png"
              alt="TiaMeds"
              fill
              priority
              className="object-contain"
            />
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--color-text-tertiary)] transition hover:bg-[var(--color-surface-hover)] lg:hidden"
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        {/* Admin Profile */}
        <div className="px-5 pt-6">
          <div className="flex items-center gap-3 rounded-xl border border-[#f1dddd] bg-[var(--color-icon-bg-soft)] px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
              <HeartPulse
                size={18}
                strokeWidth={1.8}
                className="text-[var(--color-primary)]"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-[var(--color-text-body)]">
                Super Admin
              </p>

              <p className="mt-0.5 text-[12px] text-[var(--color-text-placeholder-alt)]">
                Administrator
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-5 pt-7">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-text-placeholder)]">
            Management
          </p>

          <nav className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item?.icon;
              const isActive = activeSection === item?.id;

              return (
                <button
                  key={item?.id}
                  type="button"
                  onClick={() => handleSectionChange(item?.id)}
                  className={`
                    group flex w-full items-center gap-3 rounded-xl
                    px-4 py-3 text-left
                    transition-all duration-200
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[var(--color-primary)]
                    ${
                      isActive
                        ? "bg-[var(--color-icon-bg-soft)] text-[var(--color-primary)] shadow-[0_5px_18px_rgba(255,59,63,0.08)]"
                        : "text-[var(--color-text-quaternary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-body)]"
                    }
                  `}
                >
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2 : 1.7}
                    className={
                      isActive
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)]"
                    }
                  />

                  <span
                    className={`flex-1 text-[14px] ${
                      isActive ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {item.label}
                  </span>

                  {isActive && (
                    <ChevronRight
                      size={17}
                      strokeWidth={2}
                      className="text-[var(--color-primary)]"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-auto border-t border-[var(--color-border-lighter)] p-5">
          <div className="mb-4 px-1">
            <p className="text-[12px] text-[var(--color-text-placeholder-alt)]">
              Blood Buddy
            </p>
            <p className="mt-1 text-[12px] text-[var(--color-text-placeholder-alt)]">
              Super Admin Portal
            </p>
          </div>

          <div className="border-t border-[var(--color-border-lighter)] pt-3">
            <SuperAdminLogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen lg:ml-[270px]">
        <BrandHeader />
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-[var(--color-border-lighter)] bg-white/95 backdrop-blur">
          <div className="flex min-h-[92px] items-center justify-between px-5 py-4 sm:px-7 lg:px-10">
            <div className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--color-border-lighter)] bg-white text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-hover)] lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <p className="mb-0.5 text-[12px] font-medium text-[var(--color-text-placeholder-alt)]">
                  Blood Buddy
                </p>

                <h1 className="truncate text-[20px] font-bold tracking-[-0.3px] text-[var(--color-text-primary)] sm:text-[24px]">
                  Super Admin Dashboard
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-[var(--color-border-light)] bg-white px-3.5 py-2 shadow-sm sm:flex">
              <span className="h-2 w-2 rounded-full bg-[var(--color-success)]" />

              <span className="text-[12px] font-medium text-[var(--color-text-quaternary)]">
                Super Admin
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="px-4 py-6 sm:px-7 sm:py-7 lg:px-10 lg:py-8">
          {renderActiveSection()}
        </section>
      </main>
    </div>
  );
}
