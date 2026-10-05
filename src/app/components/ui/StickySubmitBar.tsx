import type { ReactNode } from "react";

import { AppButton } from "@/app/components/ui/AppButton";
import { Bilingual } from "@/app/components/common/Bilingual";

interface StickySubmitBarProps {
  /** True once every required field is valid; the button then shows its full colour. */
  ready: boolean;
  loading?: boolean;
  children: ReactNode;
}

// Class for a <form> that ends in a StickySubmitBar. Phones: a focused field
// scrolls into view clear of the sticky bar, long bilingual placeholders end in
// an ellipsis, and the second-language line under each label is lifted from its
// tiny 0.68em to a readable 11px (kept out of the label's width so the
// required-field star stays next to the main text).
export const STICKY_FORM_CLASS = [
  "w-full [&_input]:text-ellipsis [&_select]:text-ellipsis",
  "max-sm:[&_input]:scroll-mb-36 max-sm:[&_select]:scroll-mb-36",
  "max-sm:[&_label>span>span+span]:max-w-0 max-sm:[&_label>span>span+span]:whitespace-nowrap max-sm:[&_label>span>span+span]:text-[11px]",
].join(" ");

// Submit control for the long registration forms. On phones it is pinned to the
// bottom of the screen (inside the form's card, so it settles at the card's
// edge once you scroll past the last field) and stays muted until the form is
// complete; from `sm` up it is a plain centred button. Render it as the last
// child of the <form>, inside a card whose padding is `px-4 py-6` on mobile.
export function StickySubmitBar({ ready, loading, children }: StickySubmitBarProps) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 -mb-6 mt-7 rounded-b-2xl border-t border-[var(--color-border-lighter)] bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-6px_16px_rgba(0,0,0,0.04)] backdrop-blur sm:static sm:mx-0 sm:mb-0 sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
      {!ready && !loading && (
        <Bilingual
          tKey="common.fillRequiredFields"
          as="p"
          className="mb-2 text-center text-[11px] leading-4 text-[var(--color-text-tertiary)] sm:hidden"
          enClassName="mt-0.5 block text-[0.9em] font-normal leading-tight text-[var(--color-text-placeholder-alt)]"
        />
      )}

      <div className="mx-auto w-full md:w-[240px]">
        <AppButton type="submit" loading={loading} dimmed={!ready}>
          {children}
        </AppButton>
      </div>
    </div>
  );
}
