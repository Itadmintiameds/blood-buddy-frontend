"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { useExitTransition } from "@/app/hooks/useExitTransition";
import { BilingualInline } from "@/app/components/common/Bilingual";

interface ConfirmDialogProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  /** Red styling for destructive actions (default: primary brand color). */
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Generic "Are you sure?" gate for actions that shouldn't fire on a single
// click (closing a request, recording a donation, etc). Stacks above other
// modals (z-[200]) since it's usually opened from inside one.
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = <BilingualInline tKey="common.ok" />,
  cancelLabel = <BilingualInline tKey="common.cancel" />,
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { rendered, visible } = useExitTransition(open, 200);

  if (!rendered) {
    return null;
  }

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
      className={`
        motion-scrim
        fixed
        inset-0
        z-[200]
        flex
        items-center
        justify-center
        bg-black/45
        px-4
        backdrop-blur-md
        transition-opacity
        duration-200
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className={`
          motion-surface
          w-full
          max-w-[380px]
          overflow-hidden
          rounded-2xl
          bg-white
          px-6
          py-7
          text-center
          shadow-[0_25px_70px_rgba(0,0,0,0.2)]
          transition-[transform,opacity]
          duration-200
          ${
            visible
              ? "translate-y-0 scale-100 opacity-100 [transition-timing-function:var(--ease-spring)]"
              : "translate-y-2 scale-95 opacity-0 [transition-timing-function:var(--ease-spring-out)]"
          }
        `}
      >
        <div className="mb-4 flex justify-center">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-full ${
              danger ? "bg-red-50" : "bg-[var(--color-icon-bg-soft)]"
            }`}
          >
            <AlertTriangle
              size={26}
              strokeWidth={2}
              className={danger ? "text-red-500" : "text-[var(--color-primary)]"}
            />
          </div>
        </div>

        <h2
          id="confirm-dialog-title"
          className="text-[16px] font-bold leading-6 text-[var(--color-text-primary)]"
        >
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-[13px] leading-5 text-[var(--color-text-muted)]">
            {description}
          </p>
        )}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="min-h-[42px] flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-[13px] font-semibold text-[var(--color-text-quaternary)] transition hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex min-h-[42px] flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-white shadow-[0_5px_15px_rgba(0,0,0,0.15)] transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
              danger
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[var(--color-primary)] hover:bg-[var(--color-dashboard-cta-hover)]"
            }`}
          >
            {loading && <Loader2 size={14} className="animate-spin shrink-0" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
