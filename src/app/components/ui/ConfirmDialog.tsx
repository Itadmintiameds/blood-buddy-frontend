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
      className={`
        motion-scrim
        fixed
        inset-0
        z-[200]
        flex
        items-center
        justify-center
        bg-black/45
        p-4
        backdrop-blur-md
        transition-opacity
        duration-200
        ${visible ? "opacity-100" : "opacity-0"}
      `}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* The message scrolls if it is long; the buttons stay pinned below it. */}
      <div
        className={`
          motion-surface
          flex
          max-h-[calc(100dvh-2rem)]
          w-full
          max-w-[380px]
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
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
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain max-sm:[&_:is(h2,p,span)>span+span]:text-[11px] px-5 pt-6 sm:px-6 sm:pt-7">
          <div className="mb-4 flex justify-center">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full ${
                danger ? "bg-red-50" : "bg-[var(--color-icon-bg-soft)]"
              }`}
            >
              <AlertTriangle
                size={26}
                strokeWidth={2}
                className={
                  danger ? "text-red-500" : "text-[var(--color-primary)]"
                }
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
        </div>

        {/* Stacked on phones (confirm on top, like a native sheet), side by
            side from sm up. DOM order stays cancel -> confirm for keyboard
            users. */}
        <div className="flex shrink-0 flex-col-reverse gap-2 px-5 pb-5 pt-5 sm:flex-row sm:px-6 sm:pb-7 sm:pt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="min-h-11 flex-1 rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-[13px] font-semibold text-[var(--color-text-quaternary)] transition hover:bg-[var(--color-surface-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-[42px]"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-white [&_span>span+span]:text-white/80 shadow-[0_5px_15px_rgba(0,0,0,0.15)] transition-all disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[42px] ${
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
