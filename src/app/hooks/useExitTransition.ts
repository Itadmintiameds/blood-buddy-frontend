"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Keeps a conditionally-rendered surface (modal, dropdown, sheet) mounted
 * for `durationMs` after `open` goes false, so a close transition can play
 * instead of the content vanishing instantly. Consumers render nothing while
 * `rendered` is false, and drive their transition classes off `visible`.
 *
 * Collapses the exit duration under `prefers-reduced-motion: reduce` so
 * reduced-motion users still get an instant close rather than a forced wait.
 */
export function useExitTransition(open: boolean, durationMs = 200) {
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(open);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const effectiveDuration = reduceMotion ? 0 : durationMs;

    window.clearTimeout(timeoutRef.current);

    if (open) {
      // Mount immediately so the close transition always has a mounted
      // element to animate from/to; flip `visible` a frame later so the
      // "hidden" state actually paints first instead of skipping straight
      // to the end state.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- open must mount synchronously, not a frame late, for the surface to be interactive as soon as its trigger fires
      setRendered(true);

      const frame = requestAnimationFrame(() => setVisible(true));

      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);

    timeoutRef.current = window.setTimeout(() => {
      setRendered(false);
    }, effectiveDuration);

    return () => window.clearTimeout(timeoutRef.current);
  }, [open, durationMs]);

  return { rendered, visible };
}
