import { describe, it, expect } from "vitest";

describe("Bulk Selection & Range Selection Logic", () => {
  interface MockItem {
    id: string;
    name: string;
  }

  const items: MockItem[] = Array.from({ length: 10 }, (_, i) => ({
    id: `item-${i + 1}`,
    name: `Item ${i + 1}`,
  }));

  it("handles basic selection toggle and counts", () => {
    let selectedIds = new Set<string>();

    // Toggle item-1
    selectedIds.add(items[0]!.id);
    expect(selectedIds.size).toBe(1);
    expect(selectedIds.has("item-1")).toBe(true);

    // Toggle item-1 off
    selectedIds.delete(items[0]!.id);
    expect(selectedIds.size).toBe(0);
    expect(selectedIds.has("item-1")).toBe(false);
  });

  it("computes isAllSelected and isPartiallySelected correctly", () => {
    const selectedIds = new Set<string>();

    // 0 selected
    const isAllSelected0 = items.length > 0 && selectedIds.size === items.length;
    const isPartiallySelected0 = selectedIds.size > 0 && selectedIds.size < items.length;
    expect(isAllSelected0).toBe(false);
    expect(isPartiallySelected0).toBe(false);

    // 3 of 10 selected
    selectedIds.add("item-1");
    selectedIds.add("item-2");
    selectedIds.add("item-3");
    const isAllSelected3 = selectedIds.size === items.length;
    const isPartiallySelected3 = selectedIds.size > 0 && selectedIds.size < items.length;
    expect(isAllSelected3).toBe(false);
    expect(isPartiallySelected3).toBe(true);

    // All 10 selected
    items.forEach((item) => selectedIds.add(item.id));
    const isAllSelected10 = selectedIds.size === items.length;
    const isPartiallySelected10 = selectedIds.size > 0 && selectedIds.size < items.length;
    expect(isAllSelected10).toBe(true);
    expect(isPartiallySelected10).toBe(false);
  });

  it("performs Shift + Click range selection accurately", () => {
    const selectedIds = new Set<string>();

    // Simulate clicking index 2 (item-3)
    let lastSelectedIndex: number | null = 2;
    selectedIds.add(items[2]!.id);

    // Simulate Shift + Click at index 6 (item-7)
    const targetIndex = 6;
    const start = Math.min(lastSelectedIndex, targetIndex);
    const end = Math.max(lastSelectedIndex, targetIndex);

    for (let i = start; i <= end; i++) {
      selectedIds.add(items[i]!.id);
    }

    expect(selectedIds.size).toBe(5); // items at index 2, 3, 4, 5, 6
    expect(selectedIds.has("item-3")).toBe(true);
    expect(selectedIds.has("item-4")).toBe(true);
    expect(selectedIds.has("item-5")).toBe(true);
    expect(selectedIds.has("item-6")).toBe(true);
    expect(selectedIds.has("item-7")).toBe(true);
    expect(selectedIds.has("item-2")).toBe(false);
    expect(selectedIds.has("item-8")).toBe(false);
  });
});

describe("Table Pagination Logic (50, 100, 500 options)", () => {
  it("calculates total pages and slice bounds for 50 per page", () => {
    const totalRecords = 234;
    const pageSize = 50;
    const totalPages = Math.ceil(totalRecords / pageSize);
    expect(totalPages).toBe(5); // 50 * 4 = 200, 34 on page 5

    // Page 1
    const page1Start = (1 - 1) * pageSize;
    const page1End = Math.min(1 * pageSize, totalRecords);
    expect(page1Start).toBe(0);
    expect(page1End).toBe(50);

    // Page 5 (last page)
    const page5Start = (5 - 1) * pageSize;
    const page5End = Math.min(5 * pageSize, totalRecords);
    expect(page5Start).toBe(200);
    expect(page5End).toBe(234);
  });

  it("calculates total pages for 100 and 500 per page", () => {
    const totalRecords = 780;

    // 100 per page
    const pages100 = Math.ceil(totalRecords / 100);
    expect(pages100).toBe(8);

    // 500 per page
    const pages500 = Math.ceil(totalRecords / 500);
    expect(pages500).toBe(2);
  });

  it("handles empty record sets gracefully", () => {
    const totalRecords = 0;
    const pageSize = 50;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    expect(totalPages).toBe(1);

    const startRecord = totalRecords === 0 ? 0 : 1;
    const endRecord = Math.min(pageSize, totalRecords);
    expect(startRecord).toBe(0);
    expect(endRecord).toBe(0);
  });
});
