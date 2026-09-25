"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { Droplets } from "lucide-react";

// Animates a numeric value up from 0 to its target on mount (and whenever the
// target changes) using an ease-out curve, so the KPI counts visibly tick up.
// Non-numeric values are returned unchanged, and reduced-motion users get the
// final value immediately. `delayMs` staggers the start to match the card's
// entrance animation.
function useCountUp(value: string, delayMs: number): string {
  const target = Number(value);
  const isNumeric = value.trim() !== "" && Number.isFinite(target);

  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isNumeric) {
      return;
    }

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced || target === 0) {
      setDisplay(target);
      return;
    }

    const duration = 900;
    let rafId = 0;
    let startTime = 0;

    const tick = (now: number) => {
      if (!startTime) {
        startTime = now;
      }

      const progress = Math.min((now - startTime) / duration, 1);
      // easeOutExpo — fast start, gentle settle onto the final number.
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      setDisplay(Math.round(eased * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    setDisplay(0);
    const timeoutId = window.setTimeout(() => {
      rafId = requestAnimationFrame(tick);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, [target, isNumeric, delayMs]);

  return isNumeric ? String(display) : value;
}

// Solid-colour KPI card shared by the Blood Centre and Super Admin
// dashboards. Optionally interactive (renders as a button) so a card can
// double as a filter toggle.
export function StatTile({
  icon: Icon,
  value,
  label,
  color,
  index = 0,
  alert = false,
  active = false,
  onClick,
}: {
  icon: typeof Droplets;
  value: string;
  label: ReactNode;
  color: string;
  index?: number;
  alert?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const interactive = typeof onClick === "function";

  // Count up to the value, staggered in step with the card's rise animation.
  const displayValue = useCountUp(value, index * 80);

  const baseClass =
    "group animate-rise relative flex min-h-[112px] w-full items-center gap-4 overflow-hidden rounded-2xl px-5 py-5 text-left text-white shadow-[0_6px_20px_rgba(0,0,0,0.10)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_9px_25px_rgba(0,0,0,0.13)] sm:min-h-[120px] sm:px-6";

  const style = {
    backgroundColor: color,
    animationDelay: `${index * 80}ms`,
  };

  const content = (
    <>
      {/* Decorative watermark icon */}
      <Icon
        size={104}
        strokeWidth={1.4}
        className="pointer-events-none absolute -right-3 -top-3 text-white/10 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
      />

      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 transition-transform duration-200 group-hover:scale-105 sm:h-13 sm:w-13">
        <Icon size={22} strokeWidth={1.8} />

        {alert && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
          </span>
        )}
      </div>

      <div className="relative min-w-0">
        <div className="text-[25px] font-bold leading-7 tracking-[-0.3px] tabular-nums sm:text-[28px]">
          {displayValue}
        </div>

        <div className="mt-1 text-[11px] font-medium leading-4 text-white/90 sm:text-[12px]">
          {label}
        </div>
      </div>

      {interactive && (
        <span className="relative ml-auto hidden shrink-0 self-start rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white sm:inline-block">
          {active ? "Filtering" : "Filter"}
        </span>
      )}
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        style={style}
        className={`${baseClass} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 ${
          active ? "ring-2 ring-white/80 ring-offset-2" : ""
        }`}
      >
        {content}
      </button>
    );
  }

  return (
    <div style={style} className={baseClass}>
      {content}
    </div>
  );
}
