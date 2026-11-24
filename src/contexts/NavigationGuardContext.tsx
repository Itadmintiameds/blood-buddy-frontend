"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import { BilingualInline } from "@/app/components/common/Bilingual";
import { getApiErrorMessage } from "@/services/api/client";

/**
 * Unfinished work that must not be left silently (e.g. a donor import under
 * review). While a guard is set, in-app navigation that goes through
 * `requestNavigation` asks "Stay" / "Discard and leave", and a browser
 * refresh / tab close shows the browser's own "Leave site?" prompt.
 */
export interface LeaveGuard {
  title: ReactNode;
  description: ReactNode;
  /** Throw away the unfinished work; navigation continues once it resolves. */
  onDiscard: () => Promise<void>;
}

interface NavigationGuardValue {
  setGuard: (guard: LeaveGuard | null) => void;
  /** Runs `proceed` now, or after the user agrees to discard the guarded work. */
  requestNavigation: (proceed: () => void) => void;
}

const NavigationGuardContext = createContext<NavigationGuardValue | null>(null);

export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const [guard, setGuard] = useState<LeaveGuard | null>(null);
  // The navigation waiting on the user's answer (null = dialog closed).
  const [pendingProceed, setPendingProceed] = useState<(() => void) | null>(
    null,
  );
  const [discarding, setDiscarding] = useState(false);
  const [discardError, setDiscardError] = useState("");

  const requestNavigation = useCallback(
    (proceed: () => void) => {
      if (!guard) {
        proceed();
        return;
      }

      setDiscardError("");
      setPendingProceed(() => proceed);
    },
    [guard],
  );

  // Refresh, tab close, typed URL: browsers only allow their own generic
  // prompt here, and it can't run our discard.
  useEffect(() => {
    if (!guard) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [guard]);

  const handleDiscardAndLeave = async () => {
    if (!guard || !pendingProceed) {
      return;
    }

    setDiscarding(true);
    setDiscardError("");

    try {
      await guard.onDiscard();
      const proceed = pendingProceed;
      setGuard(null);
      setPendingProceed(null);
      proceed();
    } catch (err) {
      setDiscardError(
        getApiErrorMessage(err, "Unable to discard. Please try again."),
      );
    } finally {
      setDiscarding(false);
    }
  };

  const value = useMemo(
    () => ({ setGuard, requestNavigation }),
    [requestNavigation],
  );

  return (
    <NavigationGuardContext.Provider value={value}>
      {children}

      <ConfirmDialog
        open={pendingProceed !== null && guard !== null}
        danger
        title={guard?.title}
        description={
          <>
            {guard?.description}
            {discardError && (
              <span className="mt-2 block font-medium text-red-600">
                {discardError}
              </span>
            )}
          </>
        }
        cancelLabel={<BilingualInline tKey="donorImport.stay" />}
        confirmLabel={
          <BilingualInline
            tKey="donorImport.discardAndLeave"
            enClassName="text-white/80"
          />
        }
        loading={discarding}
        onConfirm={handleDiscardAndLeave}
        onCancel={() => setPendingProceed(null)}
      />
    </NavigationGuardContext.Provider>
  );
}

// Outside a provider there is nothing to guard: navigation just proceeds.
const NO_GUARD: NavigationGuardValue = {
  setGuard: () => {},
  requestNavigation: (proceed) => proceed(),
};

export function useNavigationGuard(): NavigationGuardValue {
  return useContext(NavigationGuardContext) ?? NO_GUARD;
}
