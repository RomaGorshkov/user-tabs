import React from "react";
import { NavLink } from "react-router-dom";
import { FaThumbtack } from "react-icons/fa";

import { tabItems as initialTabItems } from "../../../mockData/mockData";
import type { TabItem } from "../../../types";
import { sortTabs } from "../../../utils/tabsFilter";

import styles from "./Tabs.module.scss";

const Tabs: React.FC = () => {
  const [currentTabs, setCurrentTabs] = React.useState<TabItem[]>(() =>
    sortTabs([...initialTabItems])
  );

  const handleTogglePin = (tabId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setCurrentTabs((prevTabs) => {
      const updatedTabs = prevTabs.map((singleTab) =>
        singleTab.id === tabId
          ? { ...singleTab, pinned: !singleTab.pinned }
          : singleTab
      );
      return sortTabs(updatedTabs);
    });
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
            {IconComponent && <IconComponent />}
            <span className={styles.tabs__title}>{item.title}</span>
            <button
              type="button"
              onClick={(e) => handleTogglePin(item.id, e)}
              className={`${styles.pinButton} ${
                item.pinned ? styles["pinButton--active"] : ""
              }`}
              aria-label={
                item.pinned
                  ? `Unpin tab ${item.title}`
                  : `Pin tab ${item.title}`
              }
              title={
                item.pinned
                  ? `Unpin tab ${item.title}`
                  : `Pin tab ${item.title}`
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
