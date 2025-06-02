import { FaQuestionCircle } from "react-icons/fa";

import type { TabItem } from "../types";
import { tabItems as initialTabItemsConfig } from "../mockData/mockData";

export const LOCAL_STORAGE_TABS_KEY = "allTabsState";

export const getInitialTabsStateFromStorage = (): TabItem[] => {
  let tabsToReturn: TabItem[];

  try {
    const storedTabsJson = localStorage.getItem(LOCAL_STORAGE_TABS_KEY);
    if (storedTabsJson) {
      const storedTabs: Array<Omit<TabItem, "icon">> =
        JSON.parse(storedTabsJson);

      tabsToReturn = storedTabs.map((storedTab) => {
        const originalTabConfig = initialTabItemsConfig.find(
          (t) => t.id === storedTab.id
        );
        return {
          ...storedTab,
          icon: originalTabConfig ? originalTabConfig.icon : FaQuestionCircle,
        } as TabItem;
      });
    } else {
      const initialTabs = [...initialTabItemsConfig].map((tab) => ({ ...tab }));

      const serializableInitialTabs = initialTabs.map(
        ({ id, title, to, pinned }) => ({ id, title, to, pinned })
      );
      localStorage.setItem(
        LOCAL_STORAGE_TABS_KEY,
        JSON.stringify(serializableInitialTabs)
      );
      tabsToReturn = initialTabs;
    }
  } catch (error) {
    console.error("Error processing tabs from localStorage:", error);
    tabsToReturn = [...initialTabItemsConfig].map((tab) => ({ ...tab }));
  }
  return tabsToReturn;
};

export const saveTabsStateToStorage = (tabs: TabItem[]): void => {
  try {
    const serializableTabs = tabs.map(({ id, title, to, pinned }) => ({
      id,
      title,
      to,
      pinned,
    }));
    localStorage.setItem(
      LOCAL_STORAGE_TABS_KEY,
      JSON.stringify(serializableTabs)
    );
  } catch (error) {
    console.error("Error saving tabs to localStorage:", error);
  }
};
