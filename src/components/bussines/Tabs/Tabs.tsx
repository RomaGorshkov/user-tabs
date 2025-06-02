import React from "react";
import { NavLink } from "react-router-dom";
import { FaThumbtack, FaQuestionCircle } from "react-icons/fa";

import type { TabItem } from "../../../types";
import {
  getInitialTabsStateFromStorage,
  saveTabsStateToStorage,
} from "../../../utils/tabsStorage";

import styles from "./Tabs.module.scss";

const Tabs: React.FC = () => {
  const [currentTabs, setCurrentTabs] = React.useState<TabItem[]>(
    getInitialTabsStateFromStorage
  );

  React.useEffect(() => {
    saveTabsStateToStorage(currentTabs);
  }, [currentTabs]);

  const handleTogglePin = (tabId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentTabs((prevTabs) =>
      prevTabs.map((singleTab) =>
        singleTab.id === tabId
          ? { ...singleTab, pinned: !singleTab.pinned }
          : singleTab
      )
    );
  };

  return (
    <div className={styles.tabs}>
      {currentTabs.map((item) => {
        const IconComponent = item.icon;
        return (
          <NavLink
            to={item.to}
            key={item.id}
            className={({ isActive }) =>
              `${styles.tabs__item} ${
                isActive ? styles["tabs__item--active"] : ""
              } ${item.pinned ? styles["tabs__item--pinned"] : ""}`
            }
          >
            {typeof IconComponent === "function" ? (
              <IconComponent />
            ) : (
              <FaQuestionCircle title="Icon not found" />
            )}
            <span className={styles.tabs__title}>{item.title}</span>
            <button
              type="button"
              onClick={(e) => handleTogglePin(item.id, e)}
              className={`${styles.pinButton} ${
                item.pinned ? styles["pinButton--active"] : ""
              }`}
              aria-label={
                item.pinned
                  ? `Відкріпити таб ${item.title}`
                  : `Закріпити таб ${item.title}`
              }
              title={
                item.pinned
                  ? `Відкріпити таб ${item.title}`
                  : `Закріпити таб ${item.title}`
              }
            >
              <FaThumbtack />
            </button>
          </NavLink>
        );
      })}
    </div>
  );
};

export default Tabs;
