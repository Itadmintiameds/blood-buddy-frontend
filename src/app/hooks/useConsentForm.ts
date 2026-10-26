"use client";

import { useCallback, useEffect, useState } from "react";

import type { ConsentForm } from "@/types/api.types";

/**
 * Loads the active consent wording for a public form (donor or recipient).
 * The form shows `consent.title` / `consent.content` and sends
 * `consent.version` back on submit; the backend rejects a version that is no
 * longer active, so callers `reload()` after a failed submit to pick up the
 * latest wording. Pass `enabled: false` to skip the fetch (e.g. an edit
 * dialog that shares the form but shows no checkbox).
 */
export function useConsentForm(
  fetchConsent: () => Promise<ConsentForm>,
  enabled = true,
) {
  const [consent, setConsent] = useState<ConsentForm | null>(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    fetchConsent()
      .then((form) => {
        if (!cancelled) setConsent(form);
      })
      .catch((err) => console.error("Load consent form error:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, fetchConsent]);

  // Event-driven refetch (retry link, failed submit). Resolves to the latest
  // form, or null if it couldn't be loaded.
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const form = await fetchConsent();
      setConsent(form);
      return form;
    } catch (err) {
      console.error("Load consent form error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchConsent]);

  return { consent, loading, reload };
}
