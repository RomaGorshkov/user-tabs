import type { TabItem } from "../types";

export const sortTabs = (tabsToSort: TabItem[]): TabItem[] => {
  const pinned = tabsToSort.filter((tab) => tab.pinned);
  const unpinned = tabsToSort.filter((tab) => !tab.pinned);
  return [...pinned, ...unpinned];
};
