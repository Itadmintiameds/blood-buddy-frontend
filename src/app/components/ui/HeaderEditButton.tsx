"use client";

import { useBilingualText } from "@/app/components/common/Bilingual";

// "Edit" text button for a detail view's header (beside a modal's close
// button, or a profile card's title).
export function HeaderEditButton({
  labelKey,
  onClick,
  disabled = false,
}: {
  labelKey: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  // Single-line label so the button keeps the close button's height (the
  // stacked bilingual label made it taller than everything beside it).
  const label = useBilingualText(labelKey);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      // Brand-red primary, same as the dashboard's Add Donor / Log Request CTAs.
      className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[var(--color-primary)] px-4 text-[12px] font-semibold leading-none text-white transition-all hover:bg-[var(--color-dashboard-cta-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:h-8 sm:px-3.5"
    >
      {label}
    </button>
  );
}
