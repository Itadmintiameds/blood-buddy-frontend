"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, History, Loader2 } from "lucide-react";

import { getApiErrorMessage } from "@/services/api/client";
import { getAvailability } from "@/services/bloodCenter/bloodCenter.service";
import {
  getInventoryHistory,
  type InventoryAuditResponse,
} from "@/services/bloodCenter/historyService";
import {
  getBloodComponents,
  getBloodGroups,
} from "@/services/master/masterService";
import { InventoryHistoryTable } from "@/app/blood-centre/components/InventoryHistoryTable";

interface InventoryOption {
  inventoryId: number;
  group: string;
  component: string;
}

export function BloodGroupHistoryScreen() {
  const [options, setOptions] = useState<InventoryOption[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedComponent, setSelectedComponent] = useState("");
  const [masterGroups, setMasterGroups] = useState<string[]>([]);
  const [masterComponents, setMasterComponents] = useState<string[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  const [entries, setEntries] = useState<InventoryAuditResponse[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Load the centre's inventory items to populate the picker.
  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      setOptionsLoading(true);
      setOptionsError("");

      try {
        const { items } = await getAvailability();

        if (cancelled) return;

        const list: InventoryOption[] = [];

        for (const item of items) {
          const inventoryId =
            typeof item.id === "number" ? item.id : Number(item.id);

          if (!Number.isFinite(inventoryId)) continue;

          list.push({
            inventoryId,
            group: item.bloodGroup,
            component: item.bloodType,
          });
        }

        list.sort(
          (a, b) =>
            a.group.localeCompare(b.group) ||
            a.component.localeCompare(b.component),
        );

        setOptions(list);
        setSelectedGroup(list[0]?.group ?? "");
        setSelectedComponent(list[0]?.component ?? "");
      } catch (error) {
        if (!cancelled) {
          setOptionsError(
            getApiErrorMessage(error, "Unable to load inventory items."),
          );
        }
      } finally {
        if (!cancelled) {
          setOptionsLoading(false);
        }
      }
    }

    void loadItems();

    return () => {
      cancelled = true;
    };
  }, []);

  // Dropdown options come from the master APIs.
  useEffect(() => {
    let cancelled = false;

    async function loadMasters() {
      try {
        const [groupList, componentList] = await Promise.all([
          getBloodGroups(),
          getBloodComponents(),
        ]);

        if (!cancelled) {
          setMasterGroups(groupList.map((group) => group.bloodGroupName));
          setMasterComponents(
            componentList.map((component) => component.bloodComponentName),
          );
        }
      } catch {
        // Non-critical: fall back to the groups/components found in inventory.
      }
    }

    void loadMasters();

    return () => {
      cancelled = true;
    };
  }, []);

  // Only offer groups this centre actually holds inventory for — picking a
  // group/component pair with no inventory item can't load any history. Master
  // list order is used purely to sort; groups absent from inventory are dropped.
  const groups = useMemo(() => {
    const present = new Set(options.map((option) => option.group));

    if (masterGroups.length > 0) {
      return masterGroups.filter((group) => present.has(group));
    }

    return Array.from(present).sort((a, b) => a.localeCompare(b));
  }, [options, masterGroups]);

  // Components depend on the selected group: only show components that exist in
  // inventory for that group, so every (group, component) pair is always valid.
  const components = useMemo(() => {
    const present = new Set(
      options
        .filter((option) => option.group === selectedGroup)
        .map((option) => option.component),
    );

    if (masterComponents.length > 0) {
      return masterComponents.filter((component) => present.has(component));
    }

    return Array.from(present).sort((a, b) => a.localeCompare(b));
  }, [options, masterComponents, selectedGroup]);

  // When the group changes, the previously-selected component may not exist for
  // the new group — snap it back to the first available so the pair stays valid.
  useEffect(() => {
    if (components.length > 0 && !components.includes(selectedComponent)) {
      setSelectedComponent(components[0]);
    }
  }, [components, selectedComponent]);

  // The (group, component) pair maps to an inventory item — that item's id
  // drives the history lookup. Null only transiently while the component snaps
  // to a valid value after a group change.
  const selectedId =
    options.find(
      (option) =>
        option.group === selectedGroup &&
        option.component === selectedComponent,
    )?.inventoryId ?? null;

  // Load history whenever the selected inventory item changes.
  useEffect(() => {
    if (selectedId === null) {
      return;
    }

    let cancelled = false;

    async function loadHistory(inventoryId: number) {
      setHistoryLoading(true);
      setHistoryError("");

      try {
        const result = await getInventoryHistory(inventoryId);

        if (!cancelled) {
          // Newest first.
          setEntries(
            [...result].sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ),
          );
        }
      } catch (error) {
        if (!cancelled) {
          setHistoryError(getApiErrorMessage(error, "Unable to load history."));
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    }

    void loadHistory(selectedId);

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <div className="animate-rise overflow-hidden rounded-2xl border border-[var(--color-border-light)] bg-white shadow-[0_5px_22px_rgba(0,0,0,0.045)]">
      {/* Inventory picker */}
      <div className="border-b border-[var(--color-border-lighter)] px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center gap-2">
          <History size={16} strokeWidth={2} className="text-[var(--color-primary)]" />
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)] sm:text-[17px]">
            Blood group history
          </h2>
        </div>

        <p className="mt-1 text-[11px] text-[var(--color-text-tertiary)] sm:text-[12px]">
          Select a blood group &amp; component to see its stock movements over time
        </p>

        {optionsLoading ? (
          <div className="mt-4 flex items-center gap-2 text-[12px] text-[var(--color-text-tertiary)]">
            <Loader2 size={15} className="animate-spin" />
            Loading items…
          </div>
        ) : optionsError ? (
          <p role="alert" className="mt-4 text-[12px] text-red-500">
            {optionsError}
          </p>
        ) : options.length === 0 ? (
          <p className="mt-4 text-[12px] text-[var(--color-text-tertiary)]">
            No inventory items found for this centre yet.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <HistorySelect
              label="Blood group"
              value={selectedGroup}
              onChange={setSelectedGroup}
              options={groups}
            />

            <HistorySelect
              label="Component"
              value={selectedComponent}
              onChange={setSelectedComponent}
              options={components}
            />
          </div>
        )}
      </div>

      {/* History timeline */}
      <div className="px-5 py-5 sm:px-6">
        {historyLoading && (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 size={22} className="animate-spin text-[var(--color-primary)]" />
          </div>
        )}

        {!historyLoading && historyError && (
          <p
            role="alert"
            className="flex min-h-[200px] items-center justify-center text-center text-[12px] text-red-500"
          >
            {historyError}
          </p>
        )}

        {!historyLoading && !historyError && entries.length === 0 && (
          <div className="flex min-h-[200px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-alt)]">
              <History size={22} strokeWidth={1.7} className="text-[var(--color-text-tertiary)]" />
            </div>

            <p className="mt-3 text-[13px] font-medium text-[var(--color-text-secondary)]">
              No movements recorded
              {selectedGroup ? ` for ${selectedGroup} · ${selectedComponent}` : ""}{" "}
              yet
            </p>

            <p className="mt-1 max-w-[340px] text-[11px] text-[var(--color-text-placeholder-alt)]">
              Stock additions, issues, discards and corrections will appear here.
            </p>
          </div>
        )}

        {!historyLoading && !historyError && entries.length > 0 && (
          <InventoryHistoryTable entries={entries} />
        )}
      </div>
    </div>
  );
}

function HistorySelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="sm:w-[200px]">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-placeholder)]">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={label}
          className="h-11 w-full cursor-pointer appearance-none rounded-lg border border-[var(--color-border)] bg-white pl-3 pr-9 text-[13px] font-medium text-[var(--color-text-body)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          strokeWidth={1.8}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
        />
      </div>
    </div>
  );
}
