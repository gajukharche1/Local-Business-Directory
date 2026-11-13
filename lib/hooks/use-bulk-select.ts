"use client";

import { useState, useCallback, useMemo, useEffect } from "react";

export interface UseBulkSelectOptions<T> {
  items: T[];
  getItemId?: (item: T) => string;
  enableEscapeToClear?: boolean;
}

export interface UseBulkSelectReturn<T> {
  selectedIds: Set<string>;
  selectedCount: number;
  selectedItems: T[];
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  toggle: (id: string, index?: number, event?: React.MouseEvent | React.ChangeEvent | any) => void;
  toggleAll: () => void;
  selectAll: () => void;
  clearSelection: () => void;
  selectOnly: (id: string) => void;
  setSelection: (ids: string[] | Set<string>) => void;
}

export function useBulkSelect<T>({
  items,
  getItemId = (item: any) => item.id,
  enableEscapeToClear = true,
}: UseBulkSelectOptions<T>): UseBulkSelectReturn<T> {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  // Map of ID to item for quick lookup
  const itemMap = useMemo(() => {
    const map = new Map<string, T>();
    for (const item of items) {
      map.set(getItemId(item), item);
    }
    return map;
  }, [items, getItemId]);

  const visibleIds = useMemo(() => {
    return items.map(getItemId);
  }, [items, getItemId]);

  // Derived selected items list
  const selectedItems = useMemo(() => {
    const list: T[] = [];
    selectedIds.forEach((id) => {
      const item = itemMap.get(id);
      if (item) {
        list.push(item);
      }
    });
    return list;
  }, [selectedIds, itemMap]);

  const selectedCount = selectedIds.size;

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  // Count how many visible items are in selectedIds
  const visibleSelectedCount = useMemo(() => {
    let count = 0;
    for (const id of visibleIds) {
      if (selectedIds.has(id)) count++;
    }
    return count;
  }, [visibleIds, selectedIds]);

  const isAllSelected = items.length > 0 && visibleSelectedCount === items.length;
  const isPartiallySelected = visibleSelectedCount > 0 && visibleSelectedCount < items.length;

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedIndex(null);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(visibleIds));
  }, [visibleIds]);

  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      // Deselect all visible items
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of visibleIds) {
          next.delete(id);
        }
        return next;
      });
      setLastSelectedIndex(null);
    } else {
      // Select all visible items
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const id of visibleIds) {
          next.add(id);
        }
        return next;
      });
    }
  }, [isAllSelected, visibleIds]);

  const toggle = useCallback(
    (id: string, index?: number, event?: React.MouseEvent | React.ChangeEvent | any) => {
      const isShiftKey = Boolean(event && "shiftKey" in event && event.shiftKey);

      setSelectedIds((prev) => {
        const next = new Set(prev);

        if (isShiftKey && lastSelectedIndex !== null && index !== undefined) {
          // Range selection
          const start = Math.min(lastSelectedIndex, index);
          const end = Math.max(lastSelectedIndex, index);

          // Determine target check state based on whether target item is currently selected
          const targetWillBeSelected = !prev.has(id);

          for (let i = start; i <= end; i++) {
            const item = items[i];
            if (item) {
              const itemId = getItemId(item);
              if (targetWillBeSelected) {
                next.add(itemId);
              } else {
                next.delete(itemId);
              }
            }
          }
        } else {
          // Single toggle
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
        }

        return next;
      });

      if (index !== undefined) {
        setLastSelectedIndex(index);
      }
    },
    [items, getItemId, lastSelectedIndex]
  );

  const selectOnly = useCallback((id: string) => {
    setSelectedIds(new Set([id]));
  }, []);

  const setSelection = useCallback((ids: string[] | Set<string>) => {
    setSelectedIds(new Set(ids));
  }, []);

  // Keyboard shortcut: Escape clears selection
  useEffect(() => {
    if (!enableEscapeToClear || selectedIds.size === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        clearSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableEscapeToClear, selectedIds.size, clearSelection]);

  return {
    selectedIds,
    selectedCount,
    selectedItems,
    isSelected,
    isAllSelected,
    isPartiallySelected,
    toggle,
    toggleAll,
    selectAll,
    clearSelection,
    selectOnly,
    setSelection,
  };
}
